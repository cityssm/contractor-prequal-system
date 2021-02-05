(function () {
    var navbarBurgerEle = document.getElementsByClassName("navbar-burger")[0];
    var navbarMenuEle = document.getElementsByClassName("navbar-menu")[0];
    navbarBurgerEle.addEventListener("click", function () {
        navbarMenuEle.classList.toggle("is-active");
        navbarBurgerEle.classList.toggle("is-active");
        navbarBurgerEle.setAttribute("aria-expanded", navbarBurgerEle.classList.contains("is-active") ? "true" : "false");
    });
})();
