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
        healthSafetyStatuses: [],
        insuranceCompanyNames: []
    };
    var doRefreshOnClose = false;
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
        formEle.getElementsByTagName("fieldset")[0].disabled = false;
        formEle.addEventListener("submit", submitUpdateForm);
        unlockButtonEle.remove();
    };
    var openContractorModal = function (clickEvent) {
        clickEvent.preventDefault();
        var contractorIndex = parseInt(clickEvent.currentTarget.getAttribute("data-index"), 10);
        var contractor = contractors[contractorIndex];
        var loadTradeCategories = function () {
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
                    var tradeCategoryEle = document.createElement("div");
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
            onshow: function (modalEle) {
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
        var html = "<span class=\"icon\">" +
            (contractor.wsib_isSatisfactory
                ? "<i class=\"fas fa-2x fa-check-circle has-text-success\" aria-hidden=\"true\"></i>"
                : "<i class=\"fas fa-2x fa-times-circle has-text-danger\" aria-hidden=\"true\"></i>") +
            "</span><br />" +
            "<span class=\"is-size-7 has-text-weight-semibold\">WSIB</span>";
        return html;
    };
    var buildContractorInsuranceIconHTML = function (contractor) {
        var html = "<span class=\"icon\">" +
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
            resultsEle.innerHTML = "";
            resultsEle.appendChild(panelEle);
        });
    };
    filterFormEle.addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
    });
    getContractors();
    document.getElementById("filter--tradeCategoryID").addEventListener("change", getContractors);
    var isHireReadyEle = document.getElementById("filter--isHireReady");
    isHireReadyEle.addEventListener("change", function () {
        getContractors();
    });
})();
(function () {
    var navbarBurgerEle = document.getElementsByClassName("navbar-burger")[0];
    var navbarMenuEle = document.getElementsByClassName("navbar-menu")[0];
    navbarBurgerEle.addEventListener("click", function () {
        navbarMenuEle.classList.toggle("is-active");
        navbarBurgerEle.classList.toggle("is-active");
        navbarBurgerEle.setAttribute("aria-expanded", navbarBurgerEle.classList.contains("is-active") ? "true" : "false");
    });
})();
