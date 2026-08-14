/* =========================================
   WORD TREE - PALS
   ========================================= */

const palsButton = document.querySelector(
    '.nav-button[data-page="pals"]'
);

console.log("PALS.JS LOADED");
console.log("PALS BUTTON:", palsButton);

if (palsButton) {
    palsButton.onclick = function(event) {
        event.preventDefault();

        console.log("PALS BUTTON CLICKED");

        window.location.href =
            "../inbox_chat_screen/inbox/inbox.html";
    };
}