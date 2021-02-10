import type * as recordTypes from "../types/recordTypes";
import type * as cityssmTypes from "@cityssm/bulma-webapp-js/src/types";


declare const cityssm: cityssmTypes.cityssmGlobal;

declare const exports: {
  canUpdate: boolean;
  urlPrefix: string;
  docuShareRootURL: string;
  vendorInformationSystemVendorURL: string;
};


(() => {
  const canUpdate: boolean = exports.canUpdate;

  const urlPrefix: string = exports.urlPrefix;
  cityssm.htmlModalFolder = urlPrefix + "/html/";

  const filterFormEle = document.getElementById("form--filters");
  const resultsEle = document.getElementById("container--results");


  let contractors: recordTypes.Contractor[] = [];


  const updateOptionsCache: {
    tradeCategories: recordTypes.TradeCategory[];
    healthSafetyStatuses: string[];
    insuranceCompanyNames: string[];
  } = {
    tradeCategories: [],
    healthSafetyStatuses: [],
    insuranceCompanyNames: []
  };


  const getTradeCategoryFromCache = (tradeCategoryID: number) => {

    const tradeCategory = updateOptionsCache.tradeCategories.find((potentialTradeCategory) => {

      return (potentialTradeCategory.tradeCategoryID === tradeCategoryID);
    });

    return tradeCategory;
  };


  /*
   * Popup Modal
   */


  const buildVendorInformationSystemURL = (contractorID: number) => {
    return exports.vendorInformationSystemVendorURL + "?vendorID=" + contractorID.toString();
  };

  const buildDocuShareURL = (docuShareCollectionID: string) => {
    return exports.docuShareRootURL + "/dsweb/View/Collection-" + docuShareCollectionID;
  };


  const openDocuShareLink = (clickEvent: Event) => {
    clickEvent.preventDefault();

    const docuShareCollectionID = (document.getElementById("contractor--docuShareCollectionID") as HTMLInputElement).value;

    if (docuShareCollectionID === "") {
      cityssm.alertModal("DocuShare Collection ID Not Available",
        "Note that Hire Ready contractors will have their Collection IDs populated automatically.",
        "OK",
        "warning");
    } else {
      window.open(buildDocuShareURL(docuShareCollectionID));
    }
  };


  type UpdateFormActions = "doUpdateContractor" |
    "doUpdateHealthSafety" | "doUpdateLegal" |
    "doUpdateWSIB" | "doUpdateInsurance";


  let doRefreshOnClose = false;
  let usedTradeCategories: Map<number, string>;

  const submitUpdateForm = (formEvent: Event) => {

    formEvent.preventDefault();

    const formEle = formEvent.currentTarget as HTMLFormElement;
    const updateFormAction = formEle.getAttribute("data-action") as UpdateFormActions;

    cityssm.postJSON(urlPrefix + "/contractors/" + updateFormAction, formEle,
      (responseJSON: { success: boolean }) => {

        if (responseJSON.success) {
          cityssm.alertModal("Update Saved Successfully",
            "Close the contractor popup window to refresh your search results.",
            "OK",
            "success");

          doRefreshOnClose = true;

        } else {
          cityssm.alertModal("Update Failed",
            "Please try again.",
            "OK",
            "danger");
        }
      });
  };


  const submitAddTradeCategoryForm = (formEvent: Event) => {
    formEvent.preventDefault();

    const tradeCategoryID =
      (document.getElementById("tradeCategories--tradeCategoryID") as HTMLSelectElement).value;

    if (tradeCategoryID === "") {

      cityssm.alertModal("No Trade Category Selected",
        "Please select a trade category from the list.",
        "OK",
        "warning");

      return;

    } else if (usedTradeCategories.has(parseInt(tradeCategoryID, 10))) {

      cityssm.alertModal("Trade Category Already Included",
        "No need to add it twice.",
        "OK",
        "info");

      return;
    }

    const formEle = formEvent.currentTarget as HTMLFormElement;

    cityssm.postJSON(urlPrefix + "/contractors/doAddTradeCategory", formEle,
      (responseJSON: { success: boolean }) => {

        if (responseJSON.success) {

          const contractorID = parseInt((formEle.getElementsByClassName("contractor--contractorID")[0] as HTMLInputElement).value, 10);
          const tradeCategory = getTradeCategoryFromCache(parseInt(tradeCategoryID, 10));
          const tradeCategoryEle = buildContractorTradeCategoryEle(contractorID, tradeCategory);

          const tradeCategoriesContainerEle = document.getElementById("contractor--tradeCategories");

          if (!tradeCategoriesContainerEle.classList.contains("panel")) {
            tradeCategoriesContainerEle.innerHTML = "";
            tradeCategoriesContainerEle.classList.add("panel");
          }

          tradeCategoriesContainerEle.insertAdjacentElement("afterbegin", tradeCategoryEle);
          usedTradeCategories.set(tradeCategory.tradeCategoryID, tradeCategory.tradeCategory);

          doRefreshOnClose = true;

        } else {
          cityssm.alertModal("Adding Trade Category Failed",
            "An error occurred while trying to add the trade category. Is it already included?",
            "OK",
            "warning");
        }
      });
  };


  const removeTradeCategory = (clickEvent: MouseEvent) => {

    const deleteButtonEle = clickEvent.currentTarget as HTMLButtonElement;

    const removeFn = () => {

      const contractorID = deleteButtonEle.getAttribute("data-contractor-id");
      const tradeCategoryID = deleteButtonEle.getAttribute("data-trade-category-id");

      cityssm.postJSON(urlPrefix + "/contractors/doRemoveTradeCategory", {
        contractorID,
        tradeCategoryID
      },
        (responseJSON: { success: boolean }) => {

          if (responseJSON.success) {

            deleteButtonEle.closest(".panel-block").remove();

            usedTradeCategories.delete(parseInt(tradeCategoryID, 10));

            doRefreshOnClose = true;

          } else {
            cityssm.alertModal("Remove Failed",
              "An error occurred removing this trade category. Please try again.",
              "OK",
              "danger");
          }
        });
    };

    cityssm.confirmModal("Remove Trade Category?",
      "Are you sure you want to remove the trade category from the contractor?",
      "Yes, Remove It",
      "warning",
      removeFn);
  };


  const buildContractorTradeCategoryEle = (contractorID: number, tradeCategory: recordTypes.TradeCategory) => {

    const tradeCategoryEle = document.createElement("div");
    tradeCategoryEle.className = "panel-block";

    tradeCategoryEle.innerHTML = ("<span class=\"panel-icon\">" +
      "<i class=\"fas fa-book\" aria-hidden=\"true\"></i>" +
      "</span>") +
      ("<span class=\"is-flex-grow-1\">" +
        cityssm.escapeHTML(tradeCategory.tradeCategory) +
        "</span>");

    if (canUpdate) {

      const deleteButtonEle = document.createElement("button");

      deleteButtonEle.className = "button is-small is-danger is-inverted is-edit-control-flex";
      deleteButtonEle.type = "button";

      deleteButtonEle.setAttribute("data-contractor-id", contractorID.toString());
      deleteButtonEle.setAttribute("data-trade-category-id", tradeCategory.tradeCategoryID.toString());

      deleteButtonEle.innerHTML = "<i class=\"fas fa-times\" aria-hidden=\"true\"></i>" +
        "<span class=\"sr-only\">Remove</span>";

      deleteButtonEle.addEventListener("click", removeTradeCategory);

      tradeCategoryEle.appendChild(deleteButtonEle);
    }

    return tradeCategoryEle;
  };


  const loadTradeCategoryOptions = () => {

    const renderFn = () => {

      const selectEle = document.getElementById("tradeCategories--tradeCategoryID");

      for (const tradeCategory of updateOptionsCache.tradeCategories) {

        selectEle.insertAdjacentHTML("beforeend",
          "<option value=\"" + tradeCategory.tradeCategoryID.toString() + "\">" +
          tradeCategory.tradeCategory +
          "</option>");
      }
    };

    if (updateOptionsCache.tradeCategories.length > 0) {
      renderFn();

    } else {
      cityssm.postJSON(urlPrefix + "/contractors/doGetAllTradeCategories", {},
        (responseJSON: { tradeCategories: recordTypes.TradeCategory[] }) => {

          updateOptionsCache.tradeCategories = responseJSON.tradeCategories;
          renderFn();
        });
    }
  };


  const loadHealthSafetyOptions = () => {

    const renderFn = () => {

      const optgroupEle = document.createElement("optgroup");
      optgroupEle.label = "Options";

      for (const status of updateOptionsCache.healthSafetyStatuses) {
        optgroupEle.insertAdjacentHTML("beforeend",
          "<option>" + cityssm.escapeHTML(status) + "</option>");
      }

      document.getElementById("contractor--healthSafety_status").appendChild(optgroupEle);
    };

    if (updateOptionsCache.healthSafetyStatuses.length > 0) {
      renderFn();

    } else {
      cityssm.postJSON(urlPrefix + "/contractors/doGetHealthSafetyOptions", {},
        (responseJSON: { healthSafetyStatuses: string[] }) => {

          updateOptionsCache.healthSafetyStatuses = responseJSON.healthSafetyStatuses;
          renderFn();
        });
    }
  };


  const loadLegalOptions = () => {

    document.getElementById("contractor--legal_isSatisfactory").insertAdjacentHTML("beforeend",
      "<optgroup label=\"Options\">" +
      "<option value=\"1\">Approved</option>" +
      "<option value=\"0\">Declined</option>" +
      "</optgroup>");
  };


  const loadInsuranceOptions = () => {

    const renderFn = () => {

      const datalistEle = document.getElementById("contractor--insurance_company-datalist");

      for (const companyName of updateOptionsCache.insuranceCompanyNames) {
        datalistEle.insertAdjacentHTML("beforeend",
          "<option value=\"" + cityssm.escapeHTML(companyName) + "\"></option>");
      }
    };

    if (updateOptionsCache.insuranceCompanyNames.length > 0) {
      renderFn();

    } else {

      cityssm.postJSON(urlPrefix + "/contractors/doGetInsuranceOptions", {},
        (responseJSON: { insuranceCompanyNames: string[] }) => {

          updateOptionsCache.insuranceCompanyNames = responseJSON.insuranceCompanyNames;
          renderFn();
        });
    }
  };


  const unlockUpdateForm = (clickEvent: MouseEvent) => {

    const unlockButtonEle = clickEvent.currentTarget as HTMLButtonElement;
    const formEle = unlockButtonEle.closest("form");
    const updateFormAction = formEle.getAttribute("data-action") as UpdateFormActions;

    // Load extra data
    switch (updateFormAction) {

      case "doUpdateHealthSafety":
        loadHealthSafetyOptions();
        break;

      case "doUpdateLegal":
        loadLegalOptions();
        break;

      case "doUpdateInsurance":
        loadInsuranceOptions();
        break;
    }

    formEle.addEventListener("submit", submitUpdateForm);
    formEle.getElementsByTagName("fieldset")[0].disabled = false;

    unlockButtonEle.remove();
  };


  const unlockContractorUpdateForm = (clickEvent: MouseEvent) => {

    const unlockControlEle = (clickEvent.currentTarget as HTMLElement).closest(".control");
    const formEle = unlockControlEle.closest("form");
    const submitControlEle = formEle.getElementsByClassName("is-submit-contractor-control")[0];

    formEle.addEventListener("submit", submitUpdateForm);
    (document.getElementById("contractor--docuShareCollectionID") as HTMLInputElement).disabled = false;
    submitControlEle.classList.remove("is-hidden");

    unlockControlEle.remove();
  };


  const unlockTradeCategoriesUpdateForm = (clickEvent: MouseEvent) => {

    const unlockContainerEle = (clickEvent.currentTarget as HTMLElement).closest(".is-unlock-tradecategories-container");
    const formEle = document.getElementById("form--tradeCategories");

    document.getElementById("contractor--tradeCategories").classList.add("is-edit-mode");

    loadTradeCategoryOptions();

    formEle.addEventListener("submit", submitAddTradeCategoryForm);

    formEle.classList.remove("is-hidden");

    unlockContainerEle.remove();
  };


  const openContractorModal = (clickEvent: MouseEvent) => {

    clickEvent.preventDefault();

    const contractorIndex: number = parseInt((clickEvent.currentTarget as HTMLAnchorElement).getAttribute("data-index"), 10);
    const contractor = contractors[contractorIndex];

    const loadTradeCategories = () => {

      usedTradeCategories = new Map<number, string>();

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

          usedTradeCategories.set(tradeCategory.tradeCategoryID, tradeCategory.tradeCategory);

          const tradeCategoryEle = buildContractorTradeCategoryEle(contractor.contractorID, tradeCategory);
          tradeCategoriesEle.appendChild(tradeCategoryEle);
        }
      });
    };

    cityssm.openHtmlModal("contractor-view", {
      onshow: (modalEle) => {

        document.getElementsByTagName("html")[0].classList.add("is-clipped");

        loadTradeCategories();

        document.getElementById("contractor--contractor_name").innerText =
          contractor.contractor_name;

        document.getElementById("contractor--location").innerText =
          (contractor.contractor_city ? contractor.contractor_city + ", " : "") +
          (contractor.contractor_province || "");

        document.getElementById("contractor--phone_name").innerText =
          contractor.phone_name;

        document.getElementById("contractor--phone_number").innerText =
          contractor.phone_number;

        if (contractor.docuShareCollectionID) {
          (document.getElementById("contractor--docuShareCollectionID") as HTMLInputElement).value =
            contractor.docuShareCollectionID.toString();
        }

        document.getElementById("contractor--docuShareCollectionID-link").addEventListener("click", openDocuShareLink);

        // Health & Safety

        (document.getElementById("contractor--healthSafety_status") as HTMLSelectElement).innerHTML =
          (contractor.healthSafety_status === null || contractor.healthSafety_status === ""
            ? "<option value=\"\">(Not Set)</option>"
            : "<option>" + cityssm.escapeHTML(contractor.healthSafety_status) + "</option>"
          );

        // Legal

        const legalOptionHTML = (contractor.legal_isSatisfactory
          ? "<option value=\"1\">Approved</option>"
          : "<option value=\"0\">Declined</option>");

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

        if (contractor.wsib_isIndependent) {
          (document.getElementById("contractor--wsib_isIndependent") as HTMLInputElement).checked = true;
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

        // Contractor IDs

        if (canUpdate) {

          const contractorIDInputEles = modalEle.getElementsByClassName("contractor--contractorID") as HTMLCollectionOf<HTMLInputElement>;

          for (let index = 0; index < contractorIDInputEles.length; index += 1) {
            contractorIDInputEles[index].value = contractor.contractorID.toString();
          }
        }
      },
      onshown: (modalEle) => {

        if (canUpdate) {

          // Contractor (DocuShare) form

          const contractorUnlockControlEle = modalEle.getElementsByClassName("is-unlock-contractor-control")[0];

          contractorUnlockControlEle.classList.remove("is-hidden");

          contractorUnlockControlEle.getElementsByTagName("button")[0]
            .addEventListener("click", unlockContractorUpdateForm);

          // Trade Categories Form

          const tradeCategoriesUnlockContainerEle = modalEle.getElementsByClassName("is-unlock-tradecategories-container")[0];

          tradeCategoriesUnlockContainerEle.classList.remove("is-hidden");

          tradeCategoriesUnlockContainerEle.getElementsByTagName("button")[0]
            .addEventListener("click", unlockTradeCategoriesUpdateForm);


          // Other forms

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
          doRefreshOnClose = false;
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

    let tooltipText = "";

    if (contractor.wsib_isIndependent) {
      tooltipText = "Independent Contractor";
    } else if (contractor.wsib_isSatisfactory) {
      tooltipText = "Expires " + cityssm.dateToString(new Date(contractor.wsib_expiryDate));
    }

    const html = "<span class=\"icon\"" +
      (tooltipText === "" ? "" : " data-tooltip=\"" + tooltipText + "\"") +
      ">" +
      (contractor.wsib_isSatisfactory
        ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
        : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
      "</span><br />" +
      "<span class=\"is-size-7 has-text-weight-semibold\">WSIB</span>";

    return html;
  };


  const buildContractorInsuranceIconHTML = (contractor: recordTypes.Contractor): string => {

    let tooltipText = "";

    if (contractor.insurance_isSatisfactory) {
      tooltipText = "Expires " + cityssm.dateToString(new Date(contractor.insurance_expiryDate));

    } else if (contractor.insurance_expiryDate) {
      tooltipText = "Expired " + cityssm.dateToString(new Date(contractor.insurance_expiryDate));
    }

    const html = "<span class=\"icon\"" +
      (tooltipText === "" ? "" : " data-tooltip=\"" + tooltipText + "\"") +
      ">" +
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
      "<a class=\"is-size-5 has-text-weight-bold\" data-index=\"" + contractorIndex.toString() + "\" role=\"button\" href=\"#\">" + cityssm.escapeHTML(contractor.contractor_name) + "</a><br />" +
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

        resultsEle.innerHTML = "<div class=\"mb-5 has-text-centered has-text-weight-bold\">" +
          "Displaying " + contractors.length.toString() + " contractor" + (contractors.length === 1 ? "" : "s") +
          "</div>";

        resultsEle.appendChild(panelEle);
      });
  };


  // Disable regular form behaviour
  filterFormEle.addEventListener("submit", (formEvent) => {
    formEvent.preventDefault();
  });


  getContractors();


  document.getElementById("filter--contractorName").addEventListener("change", getContractors);
  document.getElementById("filter--tradeCategoryID").addEventListener("change", getContractors);

  const isHireReadyEle = document.getElementById("filter--isHireReady");

  isHireReadyEle.addEventListener("change", () => {
    getContractors();
  });
})();
