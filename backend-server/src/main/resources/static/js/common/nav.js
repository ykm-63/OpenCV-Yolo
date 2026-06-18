const currentPath = window.location.pathname;
const navLinks = document.querySelectorAll(".nav a, .side-menu-links a");
const menuToggleBtn = document.getElementById("menuToggleBtn");
const menuCloseBtn = document.getElementById("menuCloseBtn");
const sideMenu = document.getElementById("sideMenu");
const menuBackdrop = document.getElementById("menuBackdrop");

navLinks.forEach(function (link) {
    const href = link.getAttribute("href");

    if (href === currentPath) {
        link.classList.add("active");
    }
});

if (menuToggleBtn && sideMenu && menuBackdrop) {
    menuToggleBtn.addEventListener("click", openSideMenu);
    menuBackdrop.addEventListener("click", closeSideMenu);
}

if (menuCloseBtn) {
    menuCloseBtn.addEventListener("click", closeSideMenu);
}

window.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeSideMenu();
    }
});

function openSideMenu() {
    sideMenu.hidden = false;
    menuBackdrop.hidden = false;
    sideMenu.classList.add("open");
    menuBackdrop.classList.add("open");
    sideMenu.setAttribute("aria-hidden", "false");
}

function closeSideMenu() {
    if (!sideMenu || !menuBackdrop) {
        return;
    }

    sideMenu.classList.remove("open");
    menuBackdrop.classList.remove("open");
    sideMenu.setAttribute("aria-hidden", "true");

    window.setTimeout(function () {
        if (!sideMenu.classList.contains("open")) {
            sideMenu.hidden = true;
            menuBackdrop.hidden = true;
        }
    }, 240);
}
