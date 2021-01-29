import type * as cityssmTypes from "@cityssm/bulma-webapp-js/src/types";


declare const cityssm: cityssmTypes.cityssmGlobal;


(() => {
  const filterFormEle = document.getElementById("form--filters");

  const getContractors = () => {

    cityssm.postJSON("/contractors/doGetContractors", filterFormEle, (responseJSON) => {

    });
  };

  filterFormEle.addEventListener("submit", (formEvent) => {
    formEvent.preventDefault();
  });

  getContractors();
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
