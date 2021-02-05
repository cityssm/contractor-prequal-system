(() => {

  /*
  * Navbar Toggle
  */

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
