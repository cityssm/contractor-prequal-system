"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const canUpdate = exports.canUpdate;
    const urlPrefix = exports.urlPrefix;
    cityssm.htmlModalFolder = urlPrefix + "/html/";
    const filterFormEle = document.getElementById("form--filters");
    const resultsEle = document.getElementById("container--results");
    let contractors = [];
    const updateOptionsCache = {
        healthSafetyStatuses: [],
        insuranceCompanyNames: []
    };
    let doRefreshOnClose = false;
    const submitUpdateForm = (formEvent) => {
        formEvent.preventDefault();
        const formEle = formEvent.currentTarget;
        const updateFormAction = formEle.getAttribute("data-action");
        cityssm.postJSON(urlPrefix + "/contractors/" + updateFormAction, formEle, (responseJSON) => {
            if (responseJSON.success) {
                cityssm.alertModal("Update Saved Successfully", "Close the contractor popup window to refresh your search results.", "OK", "success");
                doRefreshOnClose = true;
            }
            else {
                cityssm.alertModal("Update Failed", "Please try again.", "OK", "danger");
            }
        });
    };
    const loadHealthSafetyOptions = () => {
        const renderFn = () => {
            const optgroupEle = document.createElement("optgroup");
            optgroupEle.label = "Options";
            for (const status of updateOptionsCache.healthSafetyStatuses) {
                optgroupEle.insertAdjacentHTML("beforeend", "<option>" + cityssm.escapeHTML(status) + "</option>");
            }
            document.getElementById("contractor--healthSafety_status").appendChild(optgroupEle);
        };
        if (updateOptionsCache.healthSafetyStatuses.length > 0) {
            renderFn();
        }
        else {
            cityssm.postJSON(urlPrefix + "/contractors/doGetHealthSafetyOptions", {}, (responseJSON) => {
                updateOptionsCache.healthSafetyStatuses = responseJSON.healthSafetyStatuses;
                renderFn();
            });
        }
    };
    const loadLegalOptions = () => {
        document.getElementById("contractor--legal_isSatisfactory").insertAdjacentHTML("beforeend", "<optgroup label=\"Options\">" +
            "<option value=\"1\">Approved</option>" +
            "<option value=\"0\">Declined</option>" +
            "</optgroup>");
    };
    const loadInsuranceOptions = () => {
        const renderFn = () => {
            const datalistEle = document.getElementById("contractor--insurance_company-datalist");
            for (const companyName of updateOptionsCache.insuranceCompanyNames) {
                datalistEle.insertAdjacentHTML("beforeend", "<option value=\"" + cityssm.escapeHTML(companyName) + "\"></option>");
            }
        };
        if (updateOptionsCache.insuranceCompanyNames.length > 0) {
            renderFn();
        }
        else {
            cityssm.postJSON(urlPrefix + "/contractors/doGetInsuranceOptions", {}, (responseJSON) => {
                updateOptionsCache.insuranceCompanyNames = responseJSON.insuranceCompanyNames;
                renderFn();
            });
        }
    };
    const unlockUpdateForm = (clickEvent) => {
        const unlockButtonEle = clickEvent.currentTarget;
        const formEle = unlockButtonEle.closest("form");
        const updateFormAction = formEle.getAttribute("data-action");
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
        formEle.getElementsByTagName("fieldset")[0].disabled = false;
        formEle.addEventListener("submit", submitUpdateForm);
        unlockButtonEle.remove();
    };
    const openContractorModal = (clickEvent) => {
        clickEvent.preventDefault();
        const contractorIndex = parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10);
        const contractor = contractors[contractorIndex];
        const loadTradeCategories = () => {
            cityssm.postJSON(urlPrefix + "/contractors/doGetTradeCategoriesByContractorID", {
                contractorID: contractor.contractorID
            }, (responseJSON) => {
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
                document.getElementById("contractor--healthSafety_status").innerHTML =
                    (contractor.healthSafety_status === null || contractor.healthSafety_status === ""
                        ? "<option value=\"\">(Not Set)</option>"
                        : "<option>" + cityssm.escapeHTML(contractor.healthSafety_status) + "</option>");
                const legalOptionHTML = (contractor.legal_isSatisfactory
                    ? "<option value=\"1\">Approved</option>"
                    : "<option value=\"0\">Declined</option>");
                document.getElementById("contractor--legal_isSatisfactory").innerHTML =
                    legalOptionHTML;
                document.getElementById("contractor--wsib_accountNumber").value =
                    contractor.wsib_accountNumber;
                document.getElementById("contractor--wsib_firmNumber").value =
                    contractor.wsib_firmNumber;
                if (contractor.wsib_effectiveDate) {
                    const effectiveDate = new Date(contractor.wsib_effectiveDate);
                    const effectiveDateString = cityssm.dateToString(effectiveDate);
                    document.getElementById("contractor--wsib_effectiveDate").value =
                        effectiveDateString;
                }
                if (contractor.wsib_expiryDate) {
                    const expiryDate = new Date(contractor.wsib_expiryDate);
                    const expiryDateString = cityssm.dateToString(expiryDate);
                    document.getElementById("contractor--wsib_expiryDate").value =
                        expiryDateString;
                }
                if (contractor.wsib_isIndependent) {
                    document.getElementById("contractor--wsib_isIndependent").checked = true;
                }
                document.getElementById("contractor--insurance_company").value =
                    contractor.insurance_company || "";
                document.getElementById("contractor--insurance_policyNumber").value =
                    contractor.insurance_policyNumber || "";
                document.getElementById("contractor--insurance_amount").value =
                    contractor.insurance_amount.toString();
                if (contractor.insurance_expiryDate) {
                    const expiryDate = new Date(contractor.insurance_expiryDate);
                    const expiryDateString = cityssm.dateToString(expiryDate);
                    document.getElementById("contractor--insurance_expiryDate").value =
                        expiryDateString;
                }
                if (canUpdate) {
                    const contractorIDInputEles = modalEle.getElementsByClassName("contractor--contractorID");
                    for (let index = 0; index < contractorIDInputEles.length; index += 1) {
                        contractorIDInputEles[index].value = contractor.contractorID.toString();
                    }
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
                    doRefreshOnClose = false;
                }
            },
            onremoved: () => {
                document.getElementsByTagName("html")[0].classList.remove("is-clipped");
            }
        });
    };
    const isContractorHireReady = (contractor) => {
        return contractor.isContractor &&
            contractor.healthSafety_isSatisfactory &&
            contractor.legal_isSatisfactory &&
            contractor.wsib_isSatisfactory &&
            contractor.insurance_isSatisfactory;
    };
    const buildContractorHealthSafetyIconHTML = (contractor) => {
        const html = "<span class=\"icon\">" +
            (contractor.healthSafety_isSatisfactory
                ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
                : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
            "</span><br />" +
            "<span class=\"is-size-7 has-text-weight-semibold\">Health & Safety</span>";
        return html;
    };
    const buildContractorLegalIconHTML = (contractor) => {
        const html = "<span class=\"icon\">" +
            (contractor.legal_isSatisfactory
                ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
                : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
            "</span><br />" +
            "<span class=\"is-size-7 has-text-weight-semibold\">Legal</span>";
        return html;
    };
    const buildContractorWSIBIconHTML = (contractor) => {
        const html = "<span class=\"icon\">" +
            (contractor.wsib_isSatisfactory
                ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
                : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
            "</span><br />" +
            "<span class=\"is-size-7 has-text-weight-semibold\">WSIB</span>";
        return html;
    };
    const buildContractorInsuranceIconHTML = (contractor) => {
        const html = "<span class=\"icon\">" +
            (contractor.insurance_isSatisfactory
                ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
                : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
            "</span><br />" +
            "<span class=\"is-size-7 has-text-weight-semibold\">Insurance</span>";
        return html;
    };
    const buildContractorResultEle = (contractor, contractorIndex) => {
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
        cityssm.postJSON(urlPrefix + "/contractors/doGetContractors", filterFormEle, (responseJSON) => {
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
