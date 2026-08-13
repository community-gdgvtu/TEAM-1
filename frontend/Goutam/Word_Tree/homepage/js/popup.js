const wordPopup = document.getElementById("wordPopup");

const quizPopup = document.getElementById("quizPopup");

const popupWord =
    document.getElementById("popupWord");

const quizWord =
    document.getElementById("quizWord");


/* OPEN WORD POPUP */

function openWordPopup(word) {

    popupWord.textContent = word;

    wordPopup.classList.add("active");
}


/* CLOSE WORD POPUP */

document
    .getElementById("closeWordPopup")
    .addEventListener("click", () => {

        wordPopup.classList.remove("active");

    });


/* LEARN */

document
    .getElementById("learnButton")
    .addEventListener("click", () => {

        const word = popupWord.textContent;

        quizWord.textContent = word;

        wordPopup.classList.remove("active");

        quizPopup.classList.add("active");

    });


/* CLOSE QUIZ */

document
    .getElementById("closeQuizPopup")
    .addEventListener("click", () => {

        quizPopup.classList.remove("active");

    });


/* CLOSE WHEN CLICKING OUTSIDE */

document
    .querySelectorAll(".popup-overlay")
    .forEach(overlay => {

        overlay.addEventListener("click", event => {

            if (event.target === overlay) {

                overlay.classList.remove("active");

            }

        });

    });