(() => {
    const canUpdate = exports.canUpdate;
    const urlPrefix = exports.urlPrefix;
    cityssm.htmlModalFolder = urlPrefix + "/html/";
    const filterFormEle = document.getElementById("form--filters");
    const resultsEle = document.getElementById("container--results");
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
        const docuShareCollectionID = document.getElementById("contractor--docuShareCollectionID").value;
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
    const submitAddTradeCategoryForm = (formEvent) => {
        formEvent.preventDefault();
        const tradeCategoryID = document.getElementById("tradeCategories--tradeCategoryID").value;
        if (tradeCategoryID === "") {
            cityssm.alertModal("No Trade Category Selected", "Please select a trade category from the list.", "OK", "warning");
            return;
        }
        else if (usedTradeCategories.has(parseInt(tradeCategoryID, 10))) {
            cityssm.alertModal("Trade Category Already Included", "No need to add it twice.", "OK", "info");
            return;
        }
        const formEle = formEvent.currentTarget;
        cityssm.postJSON(urlPrefix + "/contractors/doAddTradeCategory", formEle, (responseJSON) => {
            if (responseJSON.success) {
                const contractorID = parseInt(formEle.getElementsByClassName("contractor--contractorID")[0].value, 10);
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
            }
            else {
                cityssm.alertModal("Adding Trade Category Failed", "An error occurred while trying to add the trade category. Is it already included?", "OK", "warning");
            }
        });
    };
    const createDocuShareCollection = (clickEvent) => {
        const createButtonEle = clickEvent.currentTarget;
        const docuShareCollectionIDEle = document.getElementById("contractor--docuShareCollectionID");
        const currentDocuShareCollectionID = docuShareCollectionIDEle.value;
        let closeLoadingModalFn;
        const doCreate = () => {
            const contractorID = createButtonEle.getAttribute("data-contractor-id");
            cityssm.postJSON(urlPrefix + "/contractors/doCreateDocuShareCollection", {
                contractorID
            }, (responseJSON) => {
                closeLoadingModalFn();
                if (responseJSON.success) {
                    docuShareCollectionIDEle.value = responseJSON.docuShareCollectionID;
                }
                else {
                    cityssm.alertModal("DocuShare Collection Not Created", cityssm.escapeHTML(responseJSON.message), "OK", "danger");
                }
            });
        };
        const openLoadingAndDoCreate = () => {
            cityssm.openHtmlModal("contractor-createDSCollection-loading", {
                onshown: (_modalEle, closeModalFn) => {
                    closeLoadingModalFn = closeModalFn;
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
        const deleteButtonEle = clickEvent.currentTarget;
        const removeFn = () => {
            const contractorID = deleteButtonEle.getAttribute("data-contractor-id");
            const tradeCategoryID = deleteButtonEle.getAttribute("data-trade-category-id");
            cityssm.postJSON(urlPrefix + "/contractors/doRemoveTradeCategory", {
                contractorID,
                tradeCategoryID
            }, (responseJSON) => {
                if (responseJSON.success) {
                    deleteButtonEle.closest(".panel-block").remove();
                    usedTradeCategories.delete(parseInt(tradeCategoryID, 10));
                    doRefreshOnClose = true;
                }
                else {
                    cityssm.alertModal("Remove Failed", "An error occurred removing this trade category. Please try again.", "OK", "danger");
                }
            });
        };
        cityssm.confirmModal("Remove Trade Category?", "Are you sure you want to remove the trade category from the contractor?", "Yes, Remove It", "warning", removeFn);
    };
    const buildContractorTradeCategoryEle = (contractorID, tradeCategory) => {
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
                selectEle.insertAdjacentHTML("beforeend", "<option value=\"" + tradeCategory.tradeCategoryID.toString() + "\">" +
                    tradeCategory.tradeCategory +
                    "</option>");
            }
        };
        if (updateOptionsCache.tradeCategories.length > 0) {
            renderFn();
        }
        else {
            cityssm.postJSON(urlPrefix + "/contractors/doGetAllTradeCategories", {}, (responseJSON) => {
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
        formEle.addEventListener("submit", submitUpdateForm);
        formEle.getElementsByTagName("fieldset")[0].disabled = false;
        unlockButtonEle.remove();
    };
    const unlockContractorUpdateForm = (clickEvent) => {
        const unlockControlEle = clickEvent.currentTarget.closest(".control");
        const formEle = unlockControlEle.closest("form");
        formEle.classList.add("is-edit-mode");
        formEle.addEventListener("submit", submitUpdateForm);
        const createButtonEle = document.getElementById("contractor--docuShareCollectionID-create");
        createButtonEle.addEventListener("click", createDocuShareCollection);
        createButtonEle.setAttribute("data-contractor-id", formEle.getElementsByClassName("contractor--contractorID")[0].value);
        document.getElementById("contractor--docuShareCollectionID").disabled = false;
        unlockControlEle.remove();
    };
    const unlockTradeCategoriesUpdateForm = (clickEvent) => {
        const unlockContainerEle = clickEvent.currentTarget.closest(".is-unlock-tradecategories-container");
        const formEle = document.getElementById("form--tradeCategories");
        document.getElementById("contractor--tradeCategories").classList.add("is-edit-mode");
        loadTradeCategoryOptions();
        formEle.addEventListener("submit", submitAddTradeCategoryForm);
        formEle.classList.remove("is-hidden");
        unlockContainerEle.remove();
    };
    const openContractorModal = (clickEvent) => {
        clickEvent.preventDefault();
        const contractorIndex = parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10);
        const contractor = contractors[contractorIndex];
        const loadTradeCategories = () => {
            usedTradeCategories = new Map();
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
                const location = (contractor.contractor_city ? contractor.contractor_city + ", " : "") +
                    (contractor.contractor_province || "");
                document.getElementById("contractor--location").innerText =
                    (location && location !== "" ? location : "(Unavailable)");
                document.getElementById("contractor--phone_name").innerText =
                    (contractor.phone_name && contractor.phone_name !== ""
                        ? contractor.phone_name
                        : "(Unavailable)");
                document.getElementById("contractor--phone_number").innerText =
                    (contractor.phone_number && contractor.phone_number !== ""
                        ? contractor.phone_number
                        : "(Unavailable)");
                if (contractor.docuShareCollectionID) {
                    document.getElementById("contractor--docuShareCollectionID").value =
                        contractor.docuShareCollectionID.toString();
                }
                document.getElementById("contractor--docuShareCollectionID-link").addEventListener("click", openDocuShareLink);
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
                    const contractorUnlockControlEle = modalEle.getElementsByClassName("is-unlock-contractor-control")[0];
                    contractorUnlockControlEle.classList.remove("is-hidden");
                    contractorUnlockControlEle.getElementsByTagName("button")[0]
                        .addEventListener("click", unlockContractorUpdateForm);
                    const tradeCategoriesUnlockContainerEle = modalEle.getElementsByClassName("is-unlock-tradecategories-container")[0];
                    tradeCategoriesUnlockContainerEle.classList.remove("is-hidden");
                    tradeCategoriesUnlockContainerEle.getElementsByTagName("button")[0]
                        .addEventListener("click", unlockTradeCategoriesUpdateForm);
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
    const buildContractorResultEle = (contractor, contractorIndex) => {
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
        cityssm.postJSON(urlPrefix + "/contractors/doGetContractors", filterFormEle, (responseJSON) => {
            contractors = responseJSON.contractors;
            if (contractors.length === 0) {
                resultsEle.innerHTML = "<div class=\"message is-info\">" +
                    "<div class=\"message-body\">There are no contractors available that meet your search criteria.</div>" +
                    "</div>";
                return;
            }
            let hireReadyCount = 0;
            const panelEle = document.createElement("div");
            panelEle.className = "panel";
            contractors.forEach((contractor, contractorIndex) => {
                const panelBlockEle = buildContractorResultEle(contractor, contractorIndex);
                panelEle.appendChild(panelBlockEle);
                if (isContractorHireReady(contractor)) {
                    hireReadyCount += 1;
                }
            });
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
            resultsEle.innerHTML = "<div class=\"mb-5 has-text-centered has-text-weight-bold\">" +
                "Displaying " + contractors.length.toString() + " contractor" + (contractors.length === 1 ? "" : "s") + "<br />" +
                hireReadyHTML +
                "</div>";
            resultsEle.appendChild(panelEle);
        });
    };
    filterFormEle.addEventListener("submit", (formEvent) => {
        formEvent.preventDefault();
    });
    getContractors();
    document.getElementById("filter--contractorName").addEventListener("change", getContractors);
    document.getElementById("filter--tradeCategoryID").addEventListener("change", getContractors);
    document.getElementById("filter--hireStatus").addEventListener("change", getContractors);
})();
export {};
