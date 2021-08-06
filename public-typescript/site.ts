(() => {

  /*
  * Navbar Toggle
  */

  const navbarBurgerElement = document.querySelector(".navbar-burger");
  const navbarMenuElement = document.querySelector(".navbar-menu");

  navbarBurgerElement.addEventListener("click", () => {
    navbarMenuElement.classList.toggle("is-active");

    navbarBurgerElement.classList.toggle("is-active");
    navbarBurgerElement.setAttribute(
      "aria-expanded",
      navbarBurgerElement.classList.contains("is-active") ? "true" : "false");
  });
})();
