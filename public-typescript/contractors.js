"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var filterFormEle = document.getElementById("form--filters");
    var resultsEle = document.getElementById("container--results");
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
    var buildContractorResultEle = function (contractor) {
        var panelBlockEle = document.createElement("div");
        panelBlockEle.className = "panel-block is-block";
        var columnsEle = document.createElement("div");
        columnsEle.className = "columns is-mobile is-multiline";
        columnsEle.innerHTML = "<div class=\"column is-full-mobile is-full-tablet is-half-widescreen\">" +
            "<strong>" + cityssm.escapeHTML(contractor.contractor_name) + "</strong><br />" +
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
        panelBlockEle.appendChild(columnsEle);
        return panelBlockEle;
    };
    var getContractors = function () {
        cityssm.clearElement(resultsEle);
        resultsEle.innerHTML = "<div class=\"has-text-centered p-4\">" +
            "<span class=\"icon\"><i class=\"fas fa-4x fa-spinner fa-pulse\" aria-hidden=\"true\"></i>" +
            "</span>" +
            "</div>";
        cityssm.postJSON("/contractors/doGetContractors", filterFormEle, function (responseJSON) {
            if (responseJSON.contractors.length === 0) {
                resultsEle.innerHTML = "<div class=\"message is-info\">" +
                    "<div class=\"message-body\">There are no contractors available that meet your search criteria.</div>" +
                    "</div>";
                return;
            }
            var panelEle = document.createElement("div");
            panelEle.className = "panel";
            for (var _i = 0, _a = responseJSON.contractors; _i < _a.length; _i++) {
                var contractor = _a[_i];
                var panelBlockEle = buildContractorResultEle(contractor);
                panelEle.appendChild(panelBlockEle);
            }
            resultsEle.innerHTML = "";
            resultsEle.appendChild(panelEle);
        });
    };
    filterFormEle.addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
    });
    getContractors();
    document.getElementById("filter--tradeCategoryID").addEventListener("change", getContractors);
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
