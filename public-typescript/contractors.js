"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var canUpdate = exports.canUpdate;
    var urlPrefix = exports.urlPrefix;
    cityssm.htmlModalFolder = urlPrefix + "/html/";
    var filterFormEle = document.getElementById("form--filters");
    var resultsEle = document.getElementById("container--results");
    var contractors = [];
    var updateOptionsCache = {
        tradeCategories: [],
        healthSafetyStatuses: [],
        insuranceCompanyNames: []
    };
    var getTradeCategoryFromCache = function (tradeCategoryID) {
        var tradeCategory = updateOptionsCache.tradeCategories.find(function (potentialTradeCategory) {
            return (potentialTradeCategory.tradeCategoryID === tradeCategoryID);
        });
        return tradeCategory;
    };
    var buildVendorInformationSystemURL = function (contractorID) {
        return exports.vendorInformationSystemVendorURL + "?vendorID=" + contractorID.toString();
    };
    var buildDocuShareURL = function (docuShareCollectionID) {
        return exports.docuShareRootURL + "/dsweb/View/Collection-" + docuShareCollectionID;
    };
    var openDocuShareLink = function (clickEvent) {
        clickEvent.preventDefault();
        var docuShareCollectionID = document.getElementById("contractor--docuShareCollectionID").value;
        if (docuShareCollectionID === "") {
            cityssm.alertModal("DocuShare Collection ID Not Available", "Note that Hire Ready contractors will have their Collection IDs populated automatically.", "OK", "warning");
        }
        else {
            window.open(buildDocuShareURL(docuShareCollectionID));
        }
    };
    var doRefreshOnClose = false;
    var usedTradeCategories;
    var submitUpdateForm = function (formEvent) {
        formEvent.preventDefault();
        var formEle = formEvent.currentTarget;
        var updateFormAction = formEle.getAttribute("data-action");
        cityssm.postJSON(urlPrefix + "/contractors/" + updateFormAction, formEle, function (responseJSON) {
            if (responseJSON.success) {
                cityssm.alertModal("Update Saved Successfully", "Close the contractor popup window to refresh your search results.", "OK", "success");
                doRefreshOnClose = true;
            }
            else {
                cityssm.alertModal("Update Failed", "Please try again.", "OK", "danger");
            }
        });
    };
    var submitAddTradeCategoryForm = function (formEvent) {
        formEvent.preventDefault();
        var tradeCategoryID = document.getElementById("tradeCategories--tradeCategoryID").value;
        if (tradeCategoryID === "") {
            cityssm.alertModal("No Trade Category Selected", "Please select a trade category from the list.", "OK", "warning");
            return;
        }
        else if (usedTradeCategories.has(parseInt(tradeCategoryID, 10))) {
            cityssm.alertModal("Trade Category Already Included", "No need to add it twice.", "OK", "info");
            return;
        }
        var formEle = formEvent.currentTarget;
        cityssm.postJSON(urlPrefix + "/contractors/doAddTradeCategory", formEle, function (responseJSON) {
            if (responseJSON.success) {
                var contractorID = parseInt(formEle.getElementsByClassName("contractor--contractorID")[0].value, 10);
                var tradeCategory = getTradeCategoryFromCache(parseInt(tradeCategoryID, 10));
                var tradeCategoryEle = buildContractorTradeCategoryEle(contractorID, tradeCategory);
                var tradeCategoriesContainerEle = document.getElementById("contractor--tradeCategories");
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
    var removeTradeCategory = function (clickEvent) {
        var deleteButtonEle = clickEvent.currentTarget;
        var removeFn = function () {
            var contractorID = deleteButtonEle.getAttribute("data-contractor-id");
            var tradeCategoryID = deleteButtonEle.getAttribute("data-trade-category-id");
            cityssm.postJSON(urlPrefix + "/contractors/doRemoveTradeCategory", {
                contractorID: contractorID,
                tradeCategoryID: tradeCategoryID
            }, function (responseJSON) {
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
    var buildContractorTradeCategoryEle = function (contractorID, tradeCategory) {
        var tradeCategoryEle = document.createElement("div");
        tradeCategoryEle.className = "panel-block";
        tradeCategoryEle.innerHTML = ("<span class=\"panel-icon\">" +
            "<i class=\"fas fa-book\" aria-hidden=\"true\"></i>" +
            "</span>") +
            ("<span class=\"is-flex-grow-1\">" +
                cityssm.escapeHTML(tradeCategory.tradeCategory) +
                "</span>");
        if (canUpdate) {
            var deleteButtonEle = document.createElement("button");
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
    var loadTradeCategoryOptions = function () {
        var renderFn = function () {
            var selectEle = document.getElementById("tradeCategories--tradeCategoryID");
            for (var _i = 0, _a = updateOptionsCache.tradeCategories; _i < _a.length; _i++) {
                var tradeCategory = _a[_i];
                selectEle.insertAdjacentHTML("beforeend", "<option value=\"" + tradeCategory.tradeCategoryID.toString() + "\">" +
                    tradeCategory.tradeCategory +
                    "</option>");
            }
        };
        if (updateOptionsCache.tradeCategories.length > 0) {
            renderFn();
        }
        else {
            cityssm.postJSON(urlPrefix + "/contractors/doGetAllTradeCategories", {}, function (responseJSON) {
                updateOptionsCache.tradeCategories = responseJSON.tradeCategories;
                renderFn();
            });
        }
    };
    var loadHealthSafetyOptions = function () {
        var renderFn = function () {
            var optgroupEle = document.createElement("optgroup");
            optgroupEle.label = "Options";
            for (var _i = 0, _a = updateOptionsCache.healthSafetyStatuses; _i < _a.length; _i++) {
                var status_1 = _a[_i];
                optgroupEle.insertAdjacentHTML("beforeend", "<option>" + cityssm.escapeHTML(status_1) + "</option>");
            }
            document.getElementById("contractor--healthSafety_status").appendChild(optgroupEle);
        };
        if (updateOptionsCache.healthSafetyStatuses.length > 0) {
            renderFn();
        }
        else {
            cityssm.postJSON(urlPrefix + "/contractors/doGetHealthSafetyOptions", {}, function (responseJSON) {
                updateOptionsCache.healthSafetyStatuses = responseJSON.healthSafetyStatuses;
                renderFn();
            });
        }
    };
    var loadLegalOptions = function () {
        document.getElementById("contractor--legal_isSatisfactory").insertAdjacentHTML("beforeend", "<optgroup label=\"Options\">" +
            "<option value=\"1\">Approved</option>" +
            "<option value=\"0\">Declined</option>" +
            "</optgroup>");
    };
    var loadInsuranceOptions = function () {
        var renderFn = function () {
            var datalistEle = document.getElementById("contractor--insurance_company-datalist");
            for (var _i = 0, _a = updateOptionsCache.insuranceCompanyNames; _i < _a.length; _i++) {
                var companyName = _a[_i];
                datalistEle.insertAdjacentHTML("beforeend", "<option value=\"" + cityssm.escapeHTML(companyName) + "\"></option>");
            }
        };
        if (updateOptionsCache.insuranceCompanyNames.length > 0) {
            renderFn();
        }
        else {
            cityssm.postJSON(urlPrefix + "/contractors/doGetInsuranceOptions", {}, function (responseJSON) {
                updateOptionsCache.insuranceCompanyNames = responseJSON.insuranceCompanyNames;
                renderFn();
            });
        }
    };
    var unlockUpdateForm = function (clickEvent) {
        var unlockButtonEle = clickEvent.currentTarget;
        var formEle = unlockButtonEle.closest("form");
        var updateFormAction = formEle.getAttribute("data-action");
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
    var unlockContractorUpdateForm = function (clickEvent) {
        var unlockControlEle = clickEvent.currentTarget.closest(".control");
        var formEle = unlockControlEle.closest("form");
        var submitControlEle = formEle.getElementsByClassName("is-submit-contractor-control")[0];
        formEle.addEventListener("submit", submitUpdateForm);
        document.getElementById("contractor--docuShareCollectionID").disabled = false;
        submitControlEle.classList.remove("is-hidden");
        unlockControlEle.remove();
    };
    var unlockTradeCategoriesUpdateForm = function (clickEvent) {
        var unlockContainerEle = clickEvent.currentTarget.closest(".is-unlock-tradecategories-container");
        var formEle = document.getElementById("form--tradeCategories");
        document.getElementById("contractor--tradeCategories").classList.add("is-edit-mode");
        loadTradeCategoryOptions();
        formEle.addEventListener("submit", submitAddTradeCategoryForm);
        formEle.classList.remove("is-hidden");
        unlockContainerEle.remove();
    };
    var openContractorModal = function (clickEvent) {
        clickEvent.preventDefault();
        var contractorIndex = parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10);
        var contractor = contractors[contractorIndex];
        var loadTradeCategories = function () {
            usedTradeCategories = new Map();
            cityssm.postJSON(urlPrefix + "/contractors/doGetTradeCategoriesByContractorID", {
                contractorID: contractor.contractorID
            }, function (responseJSON) {
                var tradeCategoriesEle = document.getElementById("contractor--tradeCategories");
                if (responseJSON.tradeCategories.length === 0) {
                    tradeCategoriesEle.innerHTML = "<div class=\"message is-warning\">" +
                        "<div class=\"message-body\">There are no trade categories assigned to this contractor.</div>" +
                        "</div>";
                    return;
                }
                tradeCategoriesEle.innerHTML = "";
                tradeCategoriesEle.classList.add("panel");
                for (var _i = 0, _a = responseJSON.tradeCategories; _i < _a.length; _i++) {
                    var tradeCategory = _a[_i];
                    usedTradeCategories.set(tradeCategory.tradeCategoryID, tradeCategory.tradeCategory);
                    var tradeCategoryEle = buildContractorTradeCategoryEle(contractor.contractorID, tradeCategory);
                    tradeCategoriesEle.appendChild(tradeCategoryEle);
                }
            });
        };
        cityssm.openHtmlModal("contractor-view", {
            onshow: function (modalEle) {
                document.getElementsByTagName("html")[0].classList.add("is-clipped");
                loadTradeCategories();
                document.getElementById("contractor--contractor_name").innerText =
                    contractor.contractor_name;
                var location = (contractor.contractor_city ? contractor.contractor_city + ", " : "") +
                    (contractor.contractor_province || "");
                document.getElementById("contractor--location").innerText =
                    (location === "" ? "(Unavailable)" : location);
                document.getElementById("contractor--phone_name").innerText =
                    contractor.phone_name;
                document.getElementById("contractor--phone_number").innerText =
                    (contractor.phone_number === ""
                        ? "(Unavailable)"
                        : contractor.phone_number);
                if (contractor.docuShareCollectionID) {
                    document.getElementById("contractor--docuShareCollectionID").value =
                        contractor.docuShareCollectionID.toString();
                }
                document.getElementById("contractor--docuShareCollectionID-link").addEventListener("click", openDocuShareLink);
                document.getElementById("contractor--healthSafety_status").innerHTML =
                    (contractor.healthSafety_status === null || contractor.healthSafety_status === ""
                        ? "<option value=\"\">(Not Set)</option>"
                        : "<option>" + cityssm.escapeHTML(contractor.healthSafety_status) + "</option>");
                var legalOptionHTML = (contractor.legal_isSatisfactory
                    ? "<option value=\"1\">Approved</option>"
                    : "<option value=\"0\">Declined</option>");
                document.getElementById("contractor--legal_isSatisfactory").innerHTML =
                    legalOptionHTML;
                document.getElementById("contractor--wsib_accountNumber").value =
                    contractor.wsib_accountNumber;
                document.getElementById("contractor--wsib_firmNumber").value =
                    contractor.wsib_firmNumber;
                if (contractor.wsib_effectiveDate) {
                    var effectiveDate = new Date(contractor.wsib_effectiveDate);
                    var effectiveDateString = cityssm.dateToString(effectiveDate);
                    document.getElementById("contractor--wsib_effectiveDate").value =
                        effectiveDateString;
                }
                if (contractor.wsib_expiryDate) {
                    var expiryDate = new Date(contractor.wsib_expiryDate);
                    var expiryDateString = cityssm.dateToString(expiryDate);
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
                    var expiryDate = new Date(contractor.insurance_expiryDate);
                    var expiryDateString = cityssm.dateToString(expiryDate);
                    document.getElementById("contractor--insurance_expiryDate").value =
                        expiryDateString;
                }
                if (canUpdate) {
                    var contractorIDInputEles = modalEle.getElementsByClassName("contractor--contractorID");
                    for (var index = 0; index < contractorIDInputEles.length; index += 1) {
                        contractorIDInputEles[index].value = contractor.contractorID.toString();
                    }
                }
            },
            onshown: function (modalEle) {
                if (canUpdate) {
                    var contractorUnlockControlEle = modalEle.getElementsByClassName("is-unlock-contractor-control")[0];
                    contractorUnlockControlEle.classList.remove("is-hidden");
                    contractorUnlockControlEle.getElementsByTagName("button")[0]
                        .addEventListener("click", unlockContractorUpdateForm);
                    var tradeCategoriesUnlockContainerEle = modalEle.getElementsByClassName("is-unlock-tradecategories-container")[0];
                    tradeCategoriesUnlockContainerEle.classList.remove("is-hidden");
                    tradeCategoriesUnlockContainerEle.getElementsByTagName("button")[0]
                        .addEventListener("click", unlockTradeCategoriesUpdateForm);
                    var unlockButtonEles = modalEle.getElementsByClassName("is-unlock-button");
                    for (var index = 0; index < unlockButtonEles.length; index += 1) {
                        unlockButtonEles[index].classList.remove("is-hidden");
                        unlockButtonEles[index].addEventListener("click", unlockUpdateForm);
                    }
                }
            },
            onhidden: function () {
                if (doRefreshOnClose) {
                    getContractors();
                    doRefreshOnClose = false;
                }
            },
            onremoved: function () {
                document.getElementsByTagName("html")[0].classList.remove("is-clipped");
            }
        });
    };
    var isContractorHireReady = function (contractor) {
        return contractor.isContractor &&
            contractor.healthSafety_isSatisfactory &&
            contractor.legal_isSatisfactory &&
            contractor.wsib_isSatisfactory &&
            contractor.insurance_isSatisfactory;
    };
    var buildContractorHealthSafetyIconHTML = function (contractor) {
        var html = "<span class=\"icon\">" +
            (contractor.healthSafety_isSatisfactory
                ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
                : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
            "</span><br />" +
            "<span class=\"is-size-7 has-text-weight-semibold\">Health & Safety</span>";
        return html;
    };
    var buildContractorLegalIconHTML = function (contractor) {
        var html = "<span class=\"icon\">" +
            (contractor.legal_isSatisfactory
                ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
                : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
            "</span><br />" +
            "<span class=\"is-size-7 has-text-weight-semibold\">Legal</span>";
        return html;
    };
    var buildContractorWSIBIconHTML = function (contractor) {
        var tooltipText = "";
        if (contractor.wsib_isIndependent) {
            tooltipText = "Independent Contractor";
        }
        else if (contractor.wsib_isSatisfactory) {
            tooltipText = "Expires " + cityssm.dateToString(new Date(contractor.wsib_expiryDate));
        }
        var html = "<span class=\"icon\"" +
            (tooltipText === "" ? "" : " data-tooltip=\"" + tooltipText + "\"") +
            ">" +
            (contractor.wsib_isSatisfactory
                ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
                : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
            "</span><br />" +
            "<span class=\"is-size-7 has-text-weight-semibold\">WSIB</span>";
        return html;
    };
    var buildContractorInsuranceIconHTML = function (contractor) {
        var tooltipText = "";
        if (contractor.insurance_isSatisfactory) {
            tooltipText = "Expires " + cityssm.dateToString(new Date(contractor.insurance_expiryDate));
        }
        else if (contractor.insurance_expiryDate) {
            tooltipText = "Expired " + cityssm.dateToString(new Date(contractor.insurance_expiryDate));
        }
        var html = "<span class=\"icon\"" +
            (tooltipText === "" ? "" : " data-tooltip=\"" + tooltipText + "\"") +
            ">" +
            (contractor.insurance_isSatisfactory
                ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
                : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
            "</span><br />" +
            "<span class=\"is-size-7 has-text-weight-semibold\">Insurance</span>";
        return html;
    };
    var buildContractorResultEle = function (contractor, contractorIndex) {
        var panelBlockEle = document.createElement("div");
        panelBlockEle.className = "panel-block is-block";
        var columnsEle = document.createElement("div");
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
    var getContractors = function () {
        contractors = [];
        cityssm.clearElement(resultsEle);
        resultsEle.innerHTML = "<div class=\"has-text-centered p-4\">" +
            "<span class=\"icon\"><i class=\"fas fa-4x fa-spinner fa-pulse\" aria-hidden=\"true\"></i>" +
            "</span>" +
            "</div>";
        cityssm.postJSON(urlPrefix + "/contractors/doGetContractors", filterFormEle, function (responseJSON) {
            contractors = responseJSON.contractors;
            if (contractors.length === 0) {
                resultsEle.innerHTML = "<div class=\"message is-info\">" +
                    "<div class=\"message-body\">There are no contractors available that meet your search criteria.</div>" +
                    "</div>";
                return;
            }
            var panelEle = document.createElement("div");
            panelEle.className = "panel";
            contractors.forEach(function (contractor, contractorIndex) {
                var panelBlockEle = buildContractorResultEle(contractor, contractorIndex);
                panelEle.appendChild(panelBlockEle);
            });
            resultsEle.innerHTML = "<div class=\"mb-5 has-text-centered has-text-weight-bold\">" +
                "Displaying " + contractors.length.toString() + " contractor" + (contractors.length === 1 ? "" : "s") +
                "</div>";
            resultsEle.appendChild(panelEle);
        });
    };
    filterFormEle.addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
    });
    getContractors();
    document.getElementById("filter--contractorName").addEventListener("change", getContractors);
    document.getElementById("filter--tradeCategoryID").addEventListener("change", getContractors);
    var isHireReadyEle = document.getElementById("filter--isHireReady");
    isHireReadyEle.addEventListener("change", function () {
        getContractors();
    });
})();
