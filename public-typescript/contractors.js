"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(() => {
    const canUpdate = exports.canUpdate;
    const urlPrefix = exports.urlPrefix;
    cityssm.htmlModalFolder = urlPrefix + "/html/";
    const filterFormElement = document.querySelector("#form--filters");
    const resultsElement = document.querySelector("#container--results");
    let contractors = [];
    const updateOptionsCache = {
        tradeCategories: [],
        healthSafetyStatuses: [],
        insuranceCompanyNames: []
    };
    const getTradeCategoryFromCache = (tradeCategoryID) => {
        const tradeCategory = updateOptionsCache.tradeCategories.find((potentialTradeCategory) => {
            return (potentialTradeCategory.tradeCategoryID === tradeCategoryID);
        });
        return tradeCategory;
    };
    const buildDocuShareURL = (docuShareCollectionID) => {
        return exports.docuShareRootURL + "/dsweb/View/Collection-" + docuShareCollectionID;
    };
    const openDocuShareLink = (clickEvent) => {
        clickEvent.preventDefault();
        const docuShareCollectionID = document.querySelector("#contractor--docuShareCollectionID").value;
        if (docuShareCollectionID === "") {
            cityssm.alertModal("DocuShare Collection ID Not Available", "Note that Hire Ready contractors will have their Collection IDs populated automatically.", "OK", "warning");
        }
        else {
            window.open(buildDocuShareURL(docuShareCollectionID));
        }
    };
    let doRefreshOnClose = false;
    let usedTradeCategories;
    const submitUpdateForm = (formEvent) => {
        formEvent.preventDefault();
        const formElement = formEvent.currentTarget;
        const updateFormAction = formElement.getAttribute("data-action");
        cityssm.postJSON(urlPrefix + "/contractors/" + updateFormAction, formElement, (responseJSON) => {
            if (responseJSON.success) {
                cityssm.alertModal("Update Saved Successfully", "Close the contractor popup window to refresh your search results.", "OK", "success");
                doRefreshOnClose = true;
            }
            else {
                cityssm.alertModal("Update Failed", "Please try again.", "OK", "danger");
            }
        });
    };
    const submitAddTradeCategoryForm = (formEvent) => {
        formEvent.preventDefault();
        const tradeCategoryID = document.querySelector("#tradeCategories--tradeCategoryID").value;
        if (tradeCategoryID === "") {
            cityssm.alertModal("No Trade Category Selected", "Please select a trade category from the list.", "OK", "warning");
            return;
        }
        else if (usedTradeCategories.has(Number.parseInt(tradeCategoryID, 10))) {
            cityssm.alertModal("Trade Category Already Included", "No need to add it twice.", "OK", "info");
            return;
        }
        const formElement = formEvent.currentTarget;
        cityssm.postJSON(urlPrefix + "/contractors/doAddTradeCategory", formElement, (responseJSON) => {
            if (responseJSON.success) {
                const contractorID = Number.parseInt(formElement.querySelector(".contractor--contractorID").value, 10);
                const tradeCategory = getTradeCategoryFromCache(Number.parseInt(tradeCategoryID, 10));
                const tradeCategoryElement = buildContractorTradeCategoryElement(contractorID, tradeCategory);
                const tradeCategoriesContainerElement = document.querySelector("#contractor--tradeCategories");
                if (!tradeCategoriesContainerElement.classList.contains("panel")) {
                    tradeCategoriesContainerElement.innerHTML = "";
                    tradeCategoriesContainerElement.classList.add("panel");
                }
                tradeCategoriesContainerElement.prepend(tradeCategoryElement);
                usedTradeCategories.set(tradeCategory.tradeCategoryID, tradeCategory.tradeCategory);
                doRefreshOnClose = true;
            }
            else {
                cityssm.alertModal("Adding Trade Category Failed", "An error occurred while trying to add the trade category. Is it already included?", "OK", "warning");
            }
        });
    };
    const createDocuShareCollection = (clickEvent) => {
        const createButtonElement = clickEvent.currentTarget;
        const docuShareCollectionIDElement = document.querySelector("#contractor--docuShareCollectionID");
        const currentDocuShareCollectionID = docuShareCollectionIDElement.value;
        let closeLoadingModalFunction;
        const doCreate = () => {
            const contractorID = createButtonElement.getAttribute("data-contractor-id");
            cityssm.postJSON(urlPrefix + "/contractors/doCreateDocuShareCollection", {
                contractorID
            }, (responseJSON) => {
                closeLoadingModalFunction();
                if (responseJSON.success) {
                    docuShareCollectionIDElement.value = responseJSON.docuShareCollectionID;
                }
                else {
                    cityssm.alertModal("DocuShare Collection Not Created", cityssm.escapeHTML(responseJSON.message), "OK", "danger");
                }
            });
        };
        const openLoadingAndDoCreate = () => {
            cityssm.openHtmlModal("contractor-createDSCollection-loading", {
                onshown: (_modalElement, closeModalFunction) => {
                    closeLoadingModalFunction = closeModalFunction;
                    doCreate();
                }
            });
        };
        if (currentDocuShareCollectionID === "") {
            cityssm.confirmModal("Create a New Collection in DocuShare", "Are you sure you want to create a new DocuShare Collection for this contractor?", "Yes, Create Collection", "info", openLoadingAndDoCreate);
        }
        else {
            cityssm.confirmModal("Create a New Collection in DocuShare", "<strong>A Collection already exists for this contractor.</strong>" +
                " Are you sure you want to abandon the existing Collection and create a new DocuShare Collection?", "Yes, Abandon and Create", "danger", openLoadingAndDoCreate);
        }
    };
    const removeTradeCategory = (clickEvent) => {
        const deleteButtonElement = clickEvent.currentTarget;
        const removeFunction = () => {
            const contractorID = deleteButtonElement.getAttribute("data-contractor-id");
            const tradeCategoryID = deleteButtonElement.getAttribute("data-trade-category-id");
            cityssm.postJSON(urlPrefix + "/contractors/doRemoveTradeCategory", {
                contractorID,
                tradeCategoryID
            }, (responseJSON) => {
                if (responseJSON.success) {
                    deleteButtonElement.closest(".panel-block").remove();
                    usedTradeCategories.delete(Number.parseInt(tradeCategoryID, 10));
                    doRefreshOnClose = true;
                }
                else {
                    cityssm.alertModal("Remove Failed", "An error occurred removing this trade category. Please try again.", "OK", "danger");
                }
            });
        };
        cityssm.confirmModal("Remove Trade Category?", "Are you sure you want to remove the trade category from the contractor?", "Yes, Remove It", "warning", removeFunction);
    };
    const buildContractorTradeCategoryElement = (contractorID, tradeCategory) => {
        const tradeCategoryElement = document.createElement("div");
        tradeCategoryElement.className = "panel-block";
        tradeCategoryElement.innerHTML = ("<span class=\"panel-icon\">" +
            "<i class=\"fas fa-book\" aria-hidden=\"true\"></i>" +
            "</span>") +
            ("<span class=\"is-flex-grow-1\">" +
                cityssm.escapeHTML(tradeCategory.tradeCategory) +
                "</span>");
        if (canUpdate) {
            const deleteButtonElement = document.createElement("button");
            deleteButtonElement.className = "button is-small is-danger is-inverted is-edit-control-flex";
            deleteButtonElement.type = "button";
            deleteButtonElement.dataset.contractorId = contractorID.toString();
            deleteButtonElement.dataset.tradeCategoryId = tradeCategory.tradeCategoryID.toString();
            deleteButtonElement.innerHTML = "<i class=\"fas fa-times\" aria-hidden=\"true\"></i>" +
                "<span class=\"sr-only\">Remove</span>";
            deleteButtonElement.addEventListener("click", removeTradeCategory);
            tradeCategoryElement.append(deleteButtonElement);
        }
        return tradeCategoryElement;
    };
    const loadTradeCategoryOptions = () => {
        const renderFunction = () => {
            const selectElement = document.querySelector("#tradeCategories--tradeCategoryID");
            for (const tradeCategory of updateOptionsCache.tradeCategories) {
                selectElement.insertAdjacentHTML("beforeend", "<option value=\"" + tradeCategory.tradeCategoryID.toString() + "\">" +
                    tradeCategory.tradeCategory +
                    "</option>");
            }
        };
        if (updateOptionsCache.tradeCategories.length > 0) {
            renderFunction();
        }
        else {
            cityssm.postJSON(urlPrefix + "/contractors/doGetAllTradeCategories", {}, (responseJSON) => {
                updateOptionsCache.tradeCategories = responseJSON.tradeCategories;
                renderFunction();
            });
        }
    };
    const loadHealthSafetyOptions = () => {
        const renderFunction = () => {
            const optgroupElement = document.createElement("optgroup");
            optgroupElement.label = "Options";
            for (const status of updateOptionsCache.healthSafetyStatuses) {
                optgroupElement.insertAdjacentHTML("beforeend", "<option>" + cityssm.escapeHTML(status) + "</option>");
            }
            document.querySelector("#contractor--healthSafety_status").append(optgroupElement);
        };
        if (updateOptionsCache.healthSafetyStatuses.length > 0) {
            renderFunction();
        }
        else {
            cityssm.postJSON(urlPrefix + "/contractors/doGetHealthSafetyOptions", {}, (responseJSON) => {
                updateOptionsCache.healthSafetyStatuses = responseJSON.healthSafetyStatuses;
                renderFunction();
            });
        }
    };
    const loadLegalOptions = () => {
        document.querySelector("#contractor--legal_isSatisfactory").insertAdjacentHTML("beforeend", "<optgroup label=\"Options\">" +
            "<option value=\"1\">Approved</option>" +
            "<option value=\"0\">Declined</option>" +
            "</optgroup>");
    };
    const loadInsuranceOptions = () => {
        const renderFunction = () => {
            const datalistElement = document.querySelector("#contractor--insurance_company-datalist");
            for (const companyName of updateOptionsCache.insuranceCompanyNames) {
                datalistElement.insertAdjacentHTML("beforeend", "<option value=\"" + cityssm.escapeHTML(companyName) + "\"></option>");
            }
        };
        if (updateOptionsCache.insuranceCompanyNames.length > 0) {
            renderFunction();
        }
        else {
            cityssm.postJSON(urlPrefix + "/contractors/doGetInsuranceOptions", {}, (responseJSON) => {
                updateOptionsCache.insuranceCompanyNames = responseJSON.insuranceCompanyNames;
                renderFunction();
            });
        }
    };
    const unlockUpdateForm = (clickEvent) => {
        const unlockButtonElement = clickEvent.currentTarget;
        const formElement = unlockButtonElement.closest("form");
        const updateFormAction = formElement.dataset.action;
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
        formElement.addEventListener("submit", submitUpdateForm);
        formElement.querySelector("fieldset").disabled = false;
        unlockButtonElement.remove();
    };
    const unlockContractorUpdateForm = (clickEvent) => {
        const unlockControlElement = clickEvent.currentTarget.closest(".control");
        const formElement = unlockControlElement.closest("form");
        formElement.classList.add("is-edit-mode");
        formElement.addEventListener("submit", submitUpdateForm);
        const createButtonElement = document.querySelector("#contractor--docuShareCollectionID-create");
        createButtonElement.addEventListener("click", createDocuShareCollection);
        createButtonElement.dataset.contractorId = formElement.querySelector(".contractor--contractorID").value;
        document.querySelector("#contractor--docuShareCollectionID").disabled = false;
        unlockControlElement.remove();
    };
    const unlockTradeCategoriesUpdateForm = (clickEvent) => {
        const unlockContainerElement = clickEvent.currentTarget.closest(".is-unlock-tradecategories-container");
        const formElement = document.querySelector("#form--tradeCategories");
        document.querySelector("#contractor--tradeCategories").classList.add("is-edit-mode");
        loadTradeCategoryOptions();
        formElement.addEventListener("submit", submitAddTradeCategoryForm);
        formElement.classList.remove("is-hidden");
        unlockContainerElement.remove();
    };
    const openContractorModal = (clickEvent) => {
        clickEvent.preventDefault();
        const contractorIndex = Number.parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10);
        const contractor = contractors[contractorIndex];
        const loadTradeCategories = () => {
            usedTradeCategories = new Map();
            cityssm.postJSON(urlPrefix + "/contractors/doGetTradeCategoriesByContractorID", {
                contractorID: contractor.contractorID
            }, (responseJSON) => {
                const tradeCategoriesElement = document.querySelector("#contractor--tradeCategories");
                if (responseJSON.tradeCategories.length === 0) {
                    tradeCategoriesElement.innerHTML = "<div class=\"message is-warning\">" +
                        "<div class=\"message-body\">There are no trade categories assigned to this contractor.</div>" +
                        "</div>";
                    return;
                }
                tradeCategoriesElement.innerHTML = "";
                tradeCategoriesElement.classList.add("panel");
                for (const tradeCategory of responseJSON.tradeCategories) {
                    usedTradeCategories.set(tradeCategory.tradeCategoryID, tradeCategory.tradeCategory);
                    const tradeCategoryElement = buildContractorTradeCategoryElement(contractor.contractorID, tradeCategory);
                    tradeCategoriesElement.append(tradeCategoryElement);
                }
            });
        };
        cityssm.openHtmlModal("contractor-view", {
            onshow: (modalElement) => {
                document.querySelector("html").classList.add("is-clipped");
                loadTradeCategories();
                document.querySelector("#contractor--contractor_name").textContent = contractor.contractor_name;
                const location = (contractor.contractor_city ? contractor.contractor_city + ", " : "") +
                    (contractor.contractor_province || "");
                document.querySelector("#contractor--location").textContent =
                    (location && location !== "" ? location : "(Unavailable)");
                document.querySelector("#contractor--phone_name").textContent =
                    contractor.phone_name;
                document.querySelector("#contractor--phone_number").textContent =
                    (contractor.phone_number && contractor.phone_number !== ""
                        ? contractor.phone_number
                        : "(Unavailable)");
                document.querySelector("#contractor--email_name").textContent =
                    contractor.email_name;
                document.querySelector("#contractor--email_address").innerHTML =
                    (contractor.email_address && contractor.email_address !== ""
                        ? "<a href=\"mailto:" + cityssm.escapeHTML(contractor.email_address) + "\">" + contractor.email_address + "</a>"
                        : "(Unavailable)");
                if (contractor.docuShareCollectionID) {
                    document.querySelector("#contractor--docuShareCollectionID").value =
                        contractor.docuShareCollectionID.toString();
                }
                document.querySelector("#contractor--docuShareCollectionID-link").addEventListener("click", openDocuShareLink);
                document.querySelector("#contractor--healthSafety_status").innerHTML =
                    (contractor.healthSafety_status === null || contractor.healthSafety_status === ""
                        ? "<option value=\"\">(Not Set)</option>"
                        : "<option>" + cityssm.escapeHTML(contractor.healthSafety_status) + "</option>");
                const legalOptionHTML = (contractor.legal_isSatisfactory
                    ? "<option value=\"1\">Approved</option>"
                    : "<option value=\"0\">Declined</option>");
                document.querySelector("#contractor--legal_isSatisfactory").innerHTML =
                    legalOptionHTML;
                document.querySelector("#contractor--legal_note").value =
                    contractor.legal_note;
                document.querySelector("#contractor--wsib_accountNumber").value =
                    contractor.wsib_accountNumber;
                document.querySelector("#contractor--wsib_firmNumber").value =
                    contractor.wsib_firmNumber;
                if (contractor.wsib_effectiveDate) {
                    const effectiveDate = new Date(contractor.wsib_effectiveDate);
                    const effectiveDateString = cityssm.dateToString(effectiveDate);
                    document.querySelector("#contractor--wsib_effectiveDate").value =
                        effectiveDateString;
                }
                if (contractor.wsib_expiryDate) {
                    const expiryDate = new Date(contractor.wsib_expiryDate);
                    const expiryDateString = cityssm.dateToString(expiryDate);
                    document.querySelector("#contractor--wsib_expiryDate").value =
                        expiryDateString;
                }
                if (contractor.wsib_isIndependent) {
                    document.querySelector("#contractor--wsib_isIndependent").checked = true;
                }
                document.querySelector("#contractor--insurance_company").value =
                    contractor.insurance_company || "";
                document.querySelector("#contractor--insurance_policyNumber").value =
                    contractor.insurance_policyNumber || "";
                document.querySelector("#contractor--insurance_amount").value =
                    contractor.insurance_amount.toString();
                if (contractor.insurance_expiryDate) {
                    const expiryDate = new Date(contractor.insurance_expiryDate);
                    const expiryDateString = cityssm.dateToString(expiryDate);
                    document.querySelector("#contractor--insurance_expiryDate").value =
                        expiryDateString;
                }
                if (canUpdate) {
                    const contractorIDInputElements = modalElement.querySelectorAll(".contractor--contractorID");
                    for (const contractorIDInputElement of contractorIDInputElements) {
                        contractorIDInputElement.value = contractor.contractorID.toString();
                    }
                }
            },
            onshown: (modalElement) => {
                const legalCriteriaAliasElements = modalElement.querySelectorAll(".uses-legal-criteria-alias");
                for (const aliasElement of legalCriteriaAliasElements) {
                    aliasElement.textContent = exports.legalCriteriaAlias;
                }
                if (canUpdate) {
                    const contractorUnlockControlElement = modalElement.querySelector(".is-unlock-contractor-control");
                    contractorUnlockControlElement.classList.remove("is-hidden");
                    contractorUnlockControlElement.querySelector("button").addEventListener("click", unlockContractorUpdateForm);
                    const tradeCategoriesUnlockContainerElement = modalElement.querySelectorAll(".is-unlock-tradecategories-container")[0];
                    tradeCategoriesUnlockContainerElement.classList.remove("is-hidden");
                    tradeCategoriesUnlockContainerElement.querySelector("button")
                        .addEventListener("click", unlockTradeCategoriesUpdateForm);
                    const unlockButtonElements = modalElement.querySelectorAll(".is-unlock-button");
                    for (const unlockButtonElement of unlockButtonElements) {
                        unlockButtonElement.classList.remove("is-hidden");
                        unlockButtonElement.addEventListener("click", unlockUpdateForm);
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
                document.querySelector("html").classList.remove("is-clipped");
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
            "<span class=\"is-size-7 has-text-weight-semibold\">" + exports.legalCriteriaAlias + "</span>";
        return html;
    };
    const buildContractorWSIBIconHTML = (contractor) => {
        let tooltipText = "";
        if (contractor.wsib_isIndependent) {
            tooltipText = "Independent Contractor";
        }
        else if (contractor.wsib_isSatisfactory) {
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
    const buildContractorInsuranceIconHTML = (contractor) => {
        let tooltipText = "";
        if (contractor.insurance_isSatisfactory) {
            tooltipText = "Expires " + cityssm.dateToString(new Date(contractor.insurance_expiryDate));
        }
        else if (contractor.insurance_expiryDate) {
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
    const buildContractorContactDetails = (contractor) => {
        return "<span class=\"icon\"><i class=\"fas fa-phone\" aria-hidden=\"true\"></i></span> <span aria-label=\"Phone Number\">" + contractor.phone_number + "</span><br />" +
            "<span class=\"icon\"><i class=\"fas fa-envelope\" aria-hidden=\"true\"></i></span> <span aria-label=\"Email Address\">" + contractor.email_address + "</span><br />";
    };
    const buildContractorResultElement = (contractor, contractorIndex) => {
        const panelBlockElement = document.createElement("div");
        panelBlockElement.className = "panel-block is-block";
        const columnsElement = document.createElement("div");
        columnsElement.className = "columns is-mobile is-multiline";
        columnsElement.innerHTML = "<div class=\"column is-full-mobile is-full-tablet is-half-widescreen\">" +
            "<a class=\"is-size-5 has-text-weight-bold\" data-index=\"" + contractorIndex.toString() + "\" role=\"button\" href=\"#\">" + cityssm.escapeHTML(contractor.contractor_name) + "</a><br />" +
            (isContractorHireReady(contractor)
                ? buildContractorContactDetails(contractor)
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
        columnsElement.querySelector("a").addEventListener("click", openContractorModal);
        panelBlockElement.append(columnsElement);
        return panelBlockElement;
    };
    const getContractors = () => {
        contractors = [];
        cityssm.clearElement(resultsElement);
        resultsElement.innerHTML = "<div class=\"has-text-centered p-4\">" +
            "<span class=\"icon\"><i class=\"fas fa-4x fa-spinner fa-pulse\" aria-hidden=\"true\"></i>" +
            "</span>" +
            "</div>";
        cityssm.postJSON(urlPrefix + "/contractors/doGetContractors", filterFormElement, (responseJSON) => {
            contractors = responseJSON.contractors;
            if (contractors.length === 0) {
                resultsElement.innerHTML = "<div class=\"message is-info\">" +
                    "<div class=\"message-body\">There are no contractors available that meet your search criteria.</div>" +
                    "</div>";
                return;
            }
            let hireReadyCount = 0;
            const panelElement = document.createElement("div");
            panelElement.className = "panel";
            for (const [contractorIndex, contractor] of contractors.entries()) {
                const panelBlockElement = buildContractorResultElement(contractor, contractorIndex);
                panelElement.append(panelBlockElement);
                if (isContractorHireReady(contractor)) {
                    hireReadyCount += 1;
                }
            }
            let hireReadyHTML = "";
            if (hireReadyCount === 0) {
                hireReadyHTML += "<span class=\"has-text-danger\">No Displayed Contractors are Hire Ready</span>";
            }
            else if (hireReadyCount === contractors.length) {
                hireReadyHTML += "<span class=\"has-text-success\">All Displayed Contractors are Hire Ready</span>";
            }
            else {
                hireReadyHTML += "<span class=\"has-text-success\">" + hireReadyCount.toString() + " out of " + contractors.length.toString() + " Contractors are Hire Ready</span>";
            }
            resultsElement.innerHTML = "<div class=\"mb-5 has-text-centered has-text-weight-bold\">" +
                "Displaying " + contractors.length.toString() + " contractor" + (contractors.length === 1 ? "" : "s") + "<br />" +
                hireReadyHTML +
                "</div>";
            resultsElement.append(panelElement);
        });
    };
    filterFormElement.addEventListener("submit", (formEvent) => {
        formEvent.preventDefault();
    });
    getContractors();
    document.querySelector("#filter--contractorName").addEventListener("change", getContractors);
    document.querySelector("#filter--tradeCategoryID").addEventListener("change", getContractors);
    document.querySelector("#filter--hireStatus").addEventListener("change", getContractors);
})();
