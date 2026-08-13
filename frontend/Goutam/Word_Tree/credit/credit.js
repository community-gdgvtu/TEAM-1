/* =========================================
   WORD TREE - CREDITS
   ========================================= */

const backButton = document.getElementById("backButton");

if (backButton) {
    backButton.addEventListener("click", () => {
        window.location.href = "../homepage/homepage.html";
    });
}

console.log("Word Tree credits screen loaded.");