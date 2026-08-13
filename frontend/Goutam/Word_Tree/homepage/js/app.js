/* =========================================
   WORD TREE HOMEPAGE
   ========================================= */


/* =========================================
   EXPLORE TREE
   ========================================= */

const exploreTree =
    document.getElementById("exploreTree");

const startLearning =
    document.getElementById("startLearning");


if (exploreTree) {

    exploreTree.addEventListener(
        "click",
        () => {

            const treeSection =
                document.getElementById("treeSection");


            if (treeSection) {

                treeSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


/* =========================================
   START LEARNING
   ========================================= */

if (startLearning) {

    startLearning.addEventListener(
        "click",
        () => {

            const treeSection =
                document.getElementById("treeSection");


            if (treeSection) {

                treeSection.scrollIntoView({
                    behavior: "smooth"
                });

            }

        }
    );

}


/* =========================================
   LOAD PROFILE PICTURE POPUP
   ========================================= */

async function loadProfilePopup() {

    const container =
        document.getElementById(
            "profile-popup-container"
        );


    if (!container) {

        console.error(
            "Profile popup container not found."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "../profile-picture/index.html"
            );


        if (!response.ok) {

            throw new Error(
                `Profile popup failed to load: ${response.status}`
            );

        }


        const html =
            await response.text();


        container.innerHTML = html;


        if (
            typeof initializeProfilePopup ===
            "function"
        ) {

            initializeProfilePopup();

        } else {

            console.error(
                "initializeProfilePopup() is not available."
            );

        }

    } catch (error) {

        console.error(
            "Error loading profile popup:",
            error
        );

    }

}


/* =========================================
   PROFILE BUTTON
   ========================================= */

const profileButton =
    document.querySelector(
        '.nav-button[data-page="profile"]'
    );


if (profileButton) {

    profileButton.addEventListener(
        "click",
        (event) => {

            /*
             * Prevent the existing navbar
             * navigation from running.
             */

            event.preventDefault();


            if (
                typeof openProfilePopup ===
                "function"
            ) {

                openProfilePopup();

            } else {

                console.error(
                    "openProfilePopup() is not available."
                );

            }

        }
    );

}


/* =========================================
   LOAD POPUP WHEN PAGE STARTS
   ========================================= */

loadProfilePopup();