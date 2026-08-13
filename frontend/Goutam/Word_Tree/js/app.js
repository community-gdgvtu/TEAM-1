const exploreTree =
    document.getElementById("exploreTree");

const startLearning =
    document.getElementById("startLearning");


/* =========================================
   EXPLORE TREE
   ========================================= */

exploreTree.addEventListener(
    "click",
    () => {

        document
            .getElementById("treeSection")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


/* =========================================
   START LEARNING
   ========================================= */

startLearning.addEventListener(
    "click",
    () => {

        document
            .getElementById("treeSection")
            .scrollIntoView({
                behavior: "smooth"
            });

    }
);


/* =========================================
   LOAD PROFILE PICTURE POPUP
   ========================================= */

async function loadProfilePopup() {

    const container =
        document.getElementById(
            "profile-popup-container"
        );

    const response =
        await fetch(
            "profile-picture/index.html"
        );

    const html =
        await response.text();

    container.innerHTML = html;

    initializeProfilePopup();

}


/* =========================================
   PROFILE BUTTON
   ========================================= */

const profileButton =
    document.querySelector(
        '.nav-button[data-page="profile"]'
    );


profileButton.addEventListener(
    "click",
    (event) => {

        /*
         * Prevent the existing navbar
         * navigation from running.
         */

        event.preventDefault();

        openProfilePopup();

    }
);


/* =========================================
   LOAD POPUP
   ========================================= */

loadProfilePopup();