/* ============================================================
   WORD TREE API
   ============================================================ */

console.log("APP.JS LOADED");


// need to change cuz im using codespace ngl
const API_BASE_URL =
    "https://cuddly-parakeet-q75547g7rq724rrp-8010.app.github.dev/proxy";


/* ============================================================
   GET ALL WORD GROUPS
   ============================================================ */

async function getAllWordGroups() {

    console.log("GET /words STARTING");


    const url =
        `${API_BASE_URL}/words`;


            console.log(
        "FETCHING:",
        url
    );


    const response =
        await fetch(url);


    console.log(
        "RESPONSE STATUS:",
        response.status
    );


    const data =
        await response.json();


    console.log(
        "WORDS RECEIVED:",
        data
    );


    return data;
}


/* ============================================================
   LOOK UP ONE WORD
   ============================================================ */

async function lookupWord(word) {

    const response =
        await fetch(
            `${API_BASE_URL}/words/${encodeURIComponent(word)}`
        );


    if (!response.ok) {

        const data =
            await response.json();


        throw new Error(
            data.message ||
            "Word lookup failed"
        );
    }


    return response.json();
}


/* ============================================================
   ADD NEW WORD GROUP
   ============================================================ */

async function addWordGroup(
    translations
) {

    const response =
        await fetch(
            `${API_BASE_URL}/words`,
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    translations
                })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        const error =
            new Error(
                data.message ||
                "Failed to add word"
            );


        error.status =
            response.status;


        throw error;
    }


    return data;
}


/* ============================================================
   ADD TRANSLATION TO EXISTING WORD GROUP
   ============================================================ */

async function addTranslationToGroup(
    wordGroupId,
    language,
    words
) {

    const response =
        await fetch(
            `${API_BASE_URL}/words/${wordGroupId}/translations`,
            {
                method: "PATCH",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    language,
                    words
                })
            }
        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(
            data.message ||
            "Failed to add translation"
        );
    }


    return data;
}


/* ============================================================
   MAKE API AVAILABLE TO tree.js + popup.js
   ============================================================ */

window.WordTreeAPI = {
    getAllWordGroups,
    lookupWord,
    addWordGroup,
    addTranslationToGroup
};


console.log(
    "WORDTREE API READY:",
    window.WordTreeAPI
);


/*
   tree.js and popup.js load before app.js.

   Tell them that WordTreeAPI now exists.
*/
window.dispatchEvent(
    new CustomEvent(
        "wordtree:api-ready"
    )
);


/* ============================================================
   TEST BACKEND
   ============================================================ */

/*
   Temporary direct test.

   This verifies the backend works even if
   tree.js or popup.js has another problem.
*/

getAllWordGroups()
    .then(data => {

        console.log(
            "DIRECT TEST SUCCESS:",
            data
        );
    })
    .catch(error => {

        console.error(
            "DIRECT TEST FAILED:",
            error
        );
    });


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
                document.getElementById(
                    "treeSection"
                );


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
                document.getElementById(
                    "treeSection"
                );


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


        container.innerHTML =
            html;


        if (
            typeof initializeProfilePopup ===
            "function"
        ) {

            initializeProfilePopup();

        }
        else {

            console.error(
                "initializeProfilePopup() is not available."
            );
        }

    }
    catch (error) {

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
        event => {

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

            }
            else {

                console.error(
                    "openProfilePopup() is not available."
                );
            }
        }
    );
}


/* =========================================
   LOAD PROFILE POPUP WHEN PAGE STARTS
   ========================================= */

loadProfilePopup();

const quoteLikeButton =
   document.getElementById(
      "quoteLikeButton"
   );


quoteLikeButton?.addEventListener(
   "click",
   () => {

      const isLiked =
         quoteLikeButton.classList.toggle(
            "liked"
         );


      quoteLikeButton.textContent =
         isLiked
            ? "♥"
            : "♡";


      localStorage.setItem(
         "wordtree_quote_liked",
         isLiked
      );

   }
);


/* =========================================
   RESTORE LIKE AFTER REFRESH
   ========================================= */

const savedQuoteLike =
   localStorage.getItem(
      "wordtree_quote_liked"
   );


if (
   savedQuoteLike === "true" &&
   quoteLikeButton
) {

   quoteLikeButton.classList.add(
      "liked"
   );


   quoteLikeButton.textContent =
      "♥";

}