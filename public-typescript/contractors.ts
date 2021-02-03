import type * as recordTypes from "../types/recordTypes";
import type * as cityssmTypes from "@cityssm/bulma-webapp-js/src/types";


declare const cityssm: cityssmTypes.cityssmGlobal;


(() => {
  const canUpdate: boolean = exports.canUpdate;

  const urlPrefix: string = exports.urlPrefix;
  cityssm.htmlModalFolder = urlPrefix + "/html/";

  const filterFormEle = document.getElementById("form--filters");
  const resultsEle = document.getElementById("container--results");


  let contractors: recordTypes.Contractor[] = [];


  /*
   * Popup Modal
   */


  const unlockUpdateForm = (clickEvent: MouseEvent) => {

    const unlockButtonEle = clickEvent.currentTarget as HTMLButtonElement;

    const formEle = unlockButtonEle.closest("form");

    formEle.getElementsByTagName("fieldset")[0].disabled = false;

    unlockButtonEle.remove();
  };


  const openContractorModal = (clickEvent: MouseEvent) => {

    clickEvent.preventDefault();

    const contractorIndex: number = parseInt((clickEvent.currentTarget as HTMLAnchorElement).getAttribute("data-index"), 10);
    const contractor = contractors[contractorIndex];

    let doRefreshOnClose = false;

    const loadTradeCategories = () => {
      cityssm.postJSON(urlPrefix + "/contractors/doGetTradeCategoriesByContractorID", {
        contractorID: contractor.contractorID
      }, (responseJSON: { tradeCategories: recordTypes.TradeCategory[] }) => {

        const tradeCategoriesEle = document.getElementById("contractor--tradeCategories");

        if (responseJSON.tradeCategories.length === 0) {
          tradeCategoriesEle.innerHTML = "<div class=\"message is-warning\">" +
            "<div class=\"message-body\">There are no trade categories assigned to this contractor.</div>" +
            "</div>";
          return;
        }

        tradeCategoriesEle.innerHTML = "";
        tradeCategoriesEle.classList.add("panel");

        for (const tradeCategory of responseJSON.tradeCategories) {

          const tradeCategoryEle = document.createElement("div");
          tradeCategoryEle.className = "panel-block";

          tradeCategoryEle.innerHTML = "<span class=\"panel-icon\">" +
            "<i class=\"fas fa-book\" aria-hidden=\"true\"></i>" +
            "</span> " +
            cityssm.escapeHTML(tradeCategory.tradeCategory);

          tradeCategoriesEle.appendChild(tradeCategoryEle);
        }
      });
    };

    cityssm.openHtmlModal("contractor-view", {
      onshow: () => {

        document.getElementsByTagName("html")[0].classList.add("is-clipped");

        loadTradeCategories();

        document.getElementById("contractor--contractor_name").innerText =
          contractor.contractor_name;

        document.getElementById("contractor--location").innerText =
          contractor.contractor_city + ", " + contractor.contractor_province;

        document.getElementById("contractor--phone_name").innerText =
          contractor.phone_name;

        document.getElementById("contractor--phone_number").innerText =
          contractor.phone_number;

        // Health & Safety

        (document.getElementById("contractor--healthSafety_status") as HTMLSelectElement).innerHTML =
          "<option>" + cityssm.escapeHTML(contractor.healthSafety_status) + "</option>";

        // Legal

        const legalOptionHTML = (contractor.legal_isSatisfactory
          ? "<option value=\"1\">Approved</option>"
          : "<option value=\"0\">Denied</option>");

        (document.getElementById("contractor--legal_isSatisfactory") as HTMLSelectElement).innerHTML =
          legalOptionHTML;

        // WSIB

        (document.getElementById("contractor--wsib_accountNumber") as HTMLInputElement).value =
          contractor.wsib_accountNumber;

        (document.getElementById("contractor--wsib_firmNumber") as HTMLInputElement).value =
          contractor.wsib_firmNumber;

        if (contractor.wsib_effectiveDate) {

          const effectiveDate = new Date(contractor.wsib_effectiveDate);
          const effectiveDateString = cityssm.dateToString(effectiveDate);

          (document.getElementById("contractor--wsib_effectiveDate") as HTMLInputElement).value =
            effectiveDateString;
        }

        if (contractor.wsib_expiryDate) {

          const expiryDate = new Date(contractor.wsib_expiryDate);
          const expiryDateString = cityssm.dateToString(expiryDate);

          (document.getElementById("contractor--wsib_expiryDate") as HTMLInputElement).value =
            expiryDateString;
        }

        // Liability Insurance

        (document.getElementById("contractor--insurance_company") as HTMLInputElement).value =
          contractor.insurance_company || "";

        (document.getElementById("contractor--insurance_policyNumber") as HTMLInputElement).value =
          contractor.insurance_policyNumber || "";

        (document.getElementById("contractor--insurance_amount") as HTMLInputElement).value =
          contractor.insurance_amount.toString();

        if (contractor.insurance_expiryDate) {

          const expiryDate = new Date(contractor.insurance_expiryDate);
          const expiryDateString = cityssm.dateToString(expiryDate);

          (document.getElementById("contractor--insurance_expiryDate") as HTMLInputElement).value =
            expiryDateString;
        }
      },
      onshown: (modalEle) => {
        if (canUpdate) {

          const unlockButtonEles = modalEle.getElementsByClassName("is-unlock-button");

          for (let index = 0; index < unlockButtonEles.length; index += 1) {
            unlockButtonEles[index].classList.remove("is-hidden");
            unlockButtonEles[index].addEventListener("click", unlockUpdateForm);
          }
        }
      },
      onhidden: () => {
        if (doRefreshOnClose) {
          getContractors();
        }
      },
      onremoved: () => {
        document.getElementsByTagName("html")[0].classList.remove("is-clipped");
      }
    });
  };


  /*
   * Search Results
   */


  const isContractorHireReady = (contractor: recordTypes.Contractor) => {

    return contractor.isContractor &&
      contractor.healthSafety_isSatisfactory &&
      contractor.legal_isSatisfactory &&
      contractor.wsib_isSatisfactory &&
      contractor.insurance_isSatisfactory;
  };


  const buildContractorHealthSafetyIconHTML = (contractor: recordTypes.Contractor): string => {

    const html = "<span class=\"icon\">" +
      (contractor.healthSafety_isSatisfactory
        ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
        : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
      "</span><br />" +
      "<span class=\"is-size-7 has-text-weight-semibold\">Health & Safety</span>";

    return html;
  };


  const buildContractorLegalIconHTML = (contractor: recordTypes.Contractor): string => {

    const html = "<span class=\"icon\">" +
      (contractor.legal_isSatisfactory
        ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
        : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
      "</span><br />" +
      "<span class=\"is-size-7 has-text-weight-semibold\">Legal</span>";

    return html;
  };


  const buildContractorWSIBIconHTML = (contractor: recordTypes.Contractor): string => {

    const html = "<span class=\"icon\">" +
      (contractor.wsib_isSatisfactory
        ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
        : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
      "</span><br />" +
      "<span class=\"is-size-7 has-text-weight-semibold\">WSIB</span>";

    return html;
  };


  const buildContractorInsuranceIconHTML = (contractor: recordTypes.Contractor): string => {

    const html = "<span class=\"icon\">" +
      (contractor.insurance_isSatisfactory
        ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
        : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
      "</span><br />" +
      "<span class=\"is-size-7 has-text-weight-semibold\">Insurance</span>";

    return html;
  };


  const buildContractorResultEle = (contractor: recordTypes.Contractor, contractorIndex: number): HTMLElement => {

    const panelBlockEle = document.createElement("div");
    panelBlockEle.className = "panel-block is-block";

    const columnsEle = document.createElement("div");
    columnsEle.className = "columns is-mobile is-multiline";

    columnsEle.innerHTML = "<div class=\"column is-full-mobile is-full-tablet is-half-widescreen\">" +
      "<a class=\"has-text-weight-bold\" data-index=\"" + contractorIndex.toString() + "\" role=\"button\" href=\"#\">" + cityssm.escapeHTML(contractor.contractor_name) + "</a><br />" +
      (isContractorHireReady(contractor)
        ? "<span class=\"icon\"><i class=\"fas fa-phone\" aria-hidden=\"true\"></i></span> <span>" + contractor.phone_number + "</span>"
        : "<span class=\"has-text-weight-semibold has-text-danger\"><span class=\"icon\"><i class=\"fas fa-exclamation-triangle\" aria-hidden=\"true\"></i></span> Not Hire Ready</span>") +
      "</div>" +
      ("<div class=\"column pt-4 has-text-centered\">" +
        buildContractorHealthSafetyIconHTML(contractor) +
        "</div>") +
      ("<div class=\"column pt-4 has-text-centered\">" +
        buildContractorLegalIconHTML(contractor) +
        "</div>") +
      ("<div class=\"column pt-4 has-text-centered\">" +
        buildContractorWSIBIconHTML(contractor) +
        "</div>") +
      ("<div class=\"column pt-4 has-text-centered\">" +
        buildContractorInsuranceIconHTML(contractor) +
        "</div>");

    columnsEle.getElementsByTagName("a")[0].addEventListener("click", openContractorModal);

    panelBlockEle.appendChild(columnsEle);

    return panelBlockEle;
  };


  const getContractors = () => {

    contractors = [];
    cityssm.clearElement(resultsEle);

    resultsEle.innerHTML = "<div class=\"has-text-centered p-4\">" +
      "<span class=\"icon\"><i class=\"fas fa-4x fa-spinner fa-pulse\" aria-hidden=\"true\"></i>" +
      "</span>" +
      "</div>";

    cityssm.postJSON(urlPrefix + "/contractors/doGetContractors", filterFormEle,
      (responseJSON: { contractors: recordTypes.Contractor[] }) => {

        contractors = responseJSON.contractors;

        if (contractors.length === 0) {
          resultsEle.innerHTML = "<div class=\"message is-info\">" +
            "<div class=\"message-body\">There are no contractors available that meet your search criteria.</div>" +
            "</div>";

          return;
        }

        const panelEle = document.createElement("div");
        panelEle.className = "panel";

        contractors.forEach((contractor, contractorIndex) => {
          const panelBlockEle = buildContractorResultEle(contractor, contractorIndex);
          panelEle.appendChild(panelBlockEle);
        });

        resultsEle.innerHTML = "";
        resultsEle.appendChild(panelEle);
      });
  };


  // Disable regular form behaviour
  filterFormEle.addEventListener("submit", (formEvent) => {
    formEvent.preventDefault();
  });


  getContractors();


  document.getElementById("filter--tradeCategoryID").addEventListener("change", getContractors);

  const isHireReadyEle = document.getElementById("filter--isHireReady");

  isHireReadyEle.addEventListener("change", () => {
    getContractors();
  });
})();

/*
 * Navbar Toggle
 */

(() => {
  const navbarBurgerEle = document.getElementsByClassName("navbar-burger")[0];
  const navbarMenuEle = document.getElementsByClassName("navbar-menu")[0];

  navbarBurgerEle.addEventListener("click", () => {
    navbarMenuEle.classList.toggle("is-active");

    navbarBurgerEle.classList.toggle("is-active");
    navbarBurgerEle.setAttribute(
      "aria-expanded",
      navbarBurgerEle.classList.contains("is-active") ? "true" : "false");
  });
})();
