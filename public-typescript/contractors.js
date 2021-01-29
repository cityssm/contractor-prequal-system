"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
(function () {
    var filterFormEle = document.getElementById("form--filters");
    var getContractors = function () {
        cityssm.postJSON("/contractors/doGetContractors", filterFormEle, function (responseJSON) {
        });
    };
    filterFormEle.addEventListener("submit", function (formEvent) {
        formEvent.preventDefault();
    });
    getContractors();
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
