/* =========================================
   WORD TREE - NAVBAR
   ========================================= */

const navButtons = document.querySelectorAll(".nav-button");

navButtons.forEach(button => {
    button.addEventListener("click", () => {
        const page = button.dataset.page;

        if (page === "something") {
            alert("SOMETHING ELSE section");
        }

        if (page === "credits") {
            window.location.href = "../credit/credit.html";
        }
    });
});