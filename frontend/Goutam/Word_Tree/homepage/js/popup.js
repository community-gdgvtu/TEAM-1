/* ============================================================
   WORD POPUP + ADD WORD UI
   ============================================================ */

const wordPopup =
    document.getElementById("wordPopup");

const popupWord =
    document.getElementById("popupWord");

const translationResult =
    document.getElementById("translationResult");

const popupNativeLanguage =
    document.getElementById("popupNativeLanguage");


let currentGroup = null;
let currentWord = null;


/* ============================================================
   REMOVE OLD POPUP BUTTONS
   ============================================================ */

/*
   These are no longer needed.

   We now show all translations in one scrollable list.
*/

document
    .getElementById("translateButton")
    ?.remove();


document
    .getElementById("learnButton")
    ?.remove();


document
    .getElementById("saveWordButton")
    ?.remove();


/*
   Remove USER_LEARNING_LANGUAGE if it still exists
   somewhere inside the popup HTML.
*/

document
    .querySelectorAll("*")
    .forEach(element => {

        if (
            element.children.length === 0 &&
            element.textContent.trim() ===
                "USER_LEARNING_LANGUAGE"
        ) {

            element.remove();
        }
    });


/* ============================================================
   TRANSLATION LIST STYLES
   ============================================================ */

const translationStyle =
    document.createElement("style");


translationStyle.textContent = `

    .translation-scroll {
        max-height: 360px;

        overflow-y: auto;

        padding-right: 8px;
    }


    .translation-language-row {
        padding: 14px 0;

        border-bottom:
            2px solid #111;
    }


    .translation-language-name {
        margin-bottom: 7px;

        font-size: 15px;
        font-weight: bold;

        text-transform: uppercase;
    }


    .translation-language-words {
        display: flex;

        flex-wrap: wrap;

        gap: 10px;

        font-size: 27px;
        font-weight: bold;
    }


    .translation-word {
        display: inline-block;
    }


    .add-existing-translation {
        margin-top: 18px;

        padding-top: 16px;

        border-top:
            3px solid #111;
    }


    .add-existing-translation-title {
        margin-bottom: 12px;

        font-size: 18px;
        font-weight: bold;
    }


    .add-existing-translation label {
        display: block;

        margin-top: 10px;

        font-size: 14px;
        font-weight: bold;
    }


    .add-existing-translation input {
        box-sizing: border-box;

        width: 100%;

        margin-top: 5px;

        padding: 9px;

        border:
            2px solid #111;

        background: white;

        font: inherit;
    }


    #submitExistingTranslation {
        width: 100%;

        margin-top: 14px;

        padding: 10px;

        border:
            2px solid #111;

        background: #d4006a;

        font-weight: bold;

        cursor: pointer;
    }


    #existingTranslationStatus {
        min-height: 18px;

        margin-top: 8px;

        font-size: 14px;
    }

`;


document.head.appendChild(
    translationStyle
);


/* ============================================================
   FIND LANGUAGE OF CLICKED WORD
   ============================================================ */

function findRootLanguage(
    group,
    rootWord
) {

    for (
        const translation
        of group?.translations || []
    ) {

        if (
            translation.words?.includes(
                rootWord
            )
        ) {

            return translation.language;
        }
    }


    return "";
}


/* ============================================================
   GROUP SAME LANGUAGES TOGETHER
   ============================================================ */

/*
   Example:

   ja -> ["家", "住宅"]
   ja -> ["住宅"]

   becomes:

   ja -> ["家", "住宅"]

   The clicked/root word itself is removed from the list.
*/

function groupTranslationsByLanguage(
    group,
    rootWord
) {

    const grouped =
        new Map();


    for (
        const translation
        of group?.translations || []
    ) {

        const language =
            translation.language;


        if (
            !grouped.has(language)
        ) {

            grouped.set(
                language,
                new Set()
            );
        }


        const words =
            grouped.get(language);


        for (
            const word
            of translation.words || []
        ) {

            /*
               Do not repeat the clicked/root word.
            */

            if (
                word === rootWord
            ) {

                continue;
            }


            words.add(word);
        }
    }


    return grouped;
}


/* ============================================================
   RENDER ALL TRANSLATIONS
   ============================================================ */

function renderTranslations() {

    translationResult.innerHTML =
        "";


    if (!currentGroup) {

        translationResult.textContent =
            "No translations found.";

        return;
    }


    const grouped =
        groupTranslationsByLanguage(
            currentGroup,
            currentWord
        );


    const scroll =
        document.createElement("div");


    scroll.className =
        "translation-scroll";


    grouped.forEach(
        (
            words,
            language
        ) => {

            /*
               If this language contained only the root word,
               don't create an empty row.
            */

            if (
                words.size === 0
            ) {

                return;
            }


            const row =
                document.createElement("div");


            row.className =
                "translation-language-row";


            const languageName =
                document.createElement("div");


            languageName.className =
                "translation-language-name";


            languageName.textContent =
                language;


            const wordsContainer =
                document.createElement("div");


            wordsContainer.className =
                "translation-language-words";


            words.forEach(
                word => {

                    const wordElement =
                        document.createElement(
                            "span"
                        );


                    wordElement.className =
                        "translation-word";


                    wordElement.textContent =
                        word;


                    wordsContainer.appendChild(
                        wordElement
                    );
                }
            );


            row.appendChild(
                languageName
            );


            row.appendChild(
                wordsContainer
            );


            scroll.appendChild(
                row
            );
        }
    );


    /* ========================================================
       ADD TRANSLATION TO EXISTING WORD GROUP
       ======================================================== */

    const addSection =
        document.createElement("div");


    addSection.className =
        "add-existing-translation";


    addSection.innerHTML = `

        <div class="add-existing-translation-title">
            ADD YOUR TRANSLATION
        </div>

        <label>
            LANGUAGE
            <input
                id="existingTranslationLanguage"
                type="text"
                placeholder="e.g. id, ja, fr">
        </label>

        <label>
            WORD
            <input
                id="existingTranslationWords"
                type="text"
                placeholder="word or words separated by commas">
        </label>

        <button
            id="submitExistingTranslation"
            type="button">
            ADD TRANSLATION
        </button>

        <div
            id="existingTranslationStatus">
        </div>

    `;


    scroll.appendChild(
        addSection
    );


    translationResult.appendChild(
        scroll
    );


    setupExistingTranslationButton();
}


/* ============================================================
   ADD TRANSLATION TO EXISTING GROUP
   ============================================================ */

function setupExistingTranslationButton() {

    const button =
        document.getElementById(
            "submitExistingTranslation"
        );


    button?.addEventListener(
        "click",
        async () => {

            const languageInput =
                document.getElementById(
                    "existingTranslationLanguage"
                );


            const wordsInput =
                document.getElementById(
                    "existingTranslationWords"
                );


            const status =
                document.getElementById(
                    "existingTranslationStatus"
                );


            const language =
                languageInput
                    .value
                    .trim();


            const words =
                wordsInput
                    .value
                    .split(",")
                    .map(
                        word =>
                            word.trim()
                    )
                    .filter(Boolean);


            if (
                !language ||
                words.length === 0
            ) {

                status.textContent =
                    "Enter a language and at least one word.";

                return;
            }


            if (
                !currentGroup?._id
            ) {

                status.textContent =
                    "Word group ID missing.";

                return;
            }


            status.textContent =
                "Adding...";


            try {

                await window
                    .WordTreeAPI
                    .addTranslationToGroup(
                        currentGroup._id,
                        language,
                        words
                    );


                /*
                   Reload the group from MongoDB so
                   we show exactly what is now stored.
                */

                currentGroup =
                    await window
                        .WordTreeAPI
                        .lookupWord(
                            currentWord
                        );


                renderTranslations();

            }
            catch (error) {

                console.error(
                    "Could not add translation:",
                    error
                );


                status.textContent =
                    error.message ||
                    "Could not add translation.";
            }
        }
    );
}


/* ============================================================
   OPEN WORD POPUP
   ============================================================ */

async function openWordPopup(
    word
) {

    currentWord =
        word;


    currentGroup =
        null;


    popupWord.textContent =
        word;


    translationResult.textContent =
        "Loading...";


    popupNativeLanguage.textContent =
        "";


    wordPopup.classList.add(
        "active"
    );


    try {

        currentGroup =
            await window
                .WordTreeAPI
                .lookupWord(
                    word
                );


        const rootLanguage =
            findRootLanguage(
                currentGroup,
                word
            );


        popupNativeLanguage.textContent =
            rootLanguage;


        renderTranslations();

    }
    catch (error) {

        console.error(
            "Could not load word:",
            error
        );


        translationResult.textContent =
            "Could not load translations.";


        popupNativeLanguage.textContent =
            "";
    }
}


/* ============================================================
   ADD NEW WORD
   ============================================================ */

/*
   Creates a completely NEW word group.

   Example:

   Language: en
   Word: apple

   sends:

   {
       translations: [
           {
               language: "en",
               words: ["apple"]
           }
       ]
   }
*/


const addWordStyle =
    document.createElement("style");


addWordStyle.textContent = `

    /* ========================================================
       ADD WORD BUTTON
       ======================================================== */

    #addWordLauncher {
        position: absolute;

        top: 20px;
        right: 20px;

        z-index: 12000;

        padding: 10px 16px;

        border: 3px solid #111;

        background: #d4006a;
        color: #111;

        font-weight: bold;
        font-size: 16px;

        cursor: pointer;
    }


    #addWordLauncher:hover {
        transform: translateY(-2px);
    }


    /* ========================================================
       ADD WORD OVERLAY
       ======================================================== */

    #addWordOverlay {
        display: none;

        position: fixed;
        inset: 0;

        z-index: 20000;

        align-items: center;
        justify-content: center;

        padding: 20px;

        background:
            rgba(0, 0, 0, 0.55);
    }


    #addWordOverlay.active {
        display: flex;
    }


    /* ========================================================
       ADD WORD POPUP
       ======================================================== */

    .add-word-dialog {
        position: relative;

        box-sizing: border-box;

        width:
            min(500px, 94vw);

        padding: 24px;

        border: 4px solid #111;

        background: #f8f5e8;
    }


    .add-word-dialog h2 {
        margin-top: 0;

        margin-bottom: 18px;
    }


    .add-word-dialog label {
        display: block;

        margin-top: 14px;

        font-size: 14px;
        font-weight: bold;
    }


    .add-word-dialog input {
        box-sizing: border-box;

        width: 100%;

        margin-top: 5px;

        padding: 9px;

        border:
            2px solid #111;

        background: white;

        font: inherit;
    }


    /* ========================================================
       BUTTONS
       ======================================================== */

    #addWordSubmit {
        width: 100%;

        margin-top: 18px;

        padding: 11px;

        border:
            2px solid #111;

        background: #d4006a;

        font-weight: bold;

        cursor: pointer;
    }


    #addWordCancel {
        width: 100%;

        margin-top: 8px;

        padding: 9px;

        border:
            2px solid #111;

        background: transparent;

        cursor: pointer;
    }


    /* ========================================================
       STATUS
       ======================================================== */

    #addWordStatus {
        min-height: 20px;

        margin-top: 10px;

        font-size: 14px;
    }

`;


document.head.appendChild(
    addWordStyle
);


/* ============================================================
   BUILD ADD WORD POPUP
   ============================================================ */

function buildAddWordUI() {

    const treeSection =
        document.getElementById(
            "treeSection"
        );


    /*
       Don't build it twice.
    */

    if (
        !treeSection ||
        document.getElementById(
            "addWordLauncher"
        )
    ) {

        return;
    }


    /* ========================================================
       BUTTON ON TREE
       ======================================================== */

    const launcher =
        document.createElement(
            "button"
        );


    launcher.id =
        "addWordLauncher";


    launcher.type =
        "button";


    launcher.textContent =
        "+ ADD WORD";


    treeSection.appendChild(
        launcher
    );


    /* ========================================================
       POPUP
       ======================================================== */

    const overlay =
        document.createElement(
            "div"
        );


    overlay.id =
        "addWordOverlay";


    overlay.innerHTML = `

        <div class="add-word-dialog">

            <h2>
                ADD A WORD
            </h2>


            <label>

                LANGUAGE

                <input
                    id="newWordLanguage"
                    type="text"
                    placeholder="e.g. en, ja, id">

            </label>


            <label>

                WORD

                <input
                    id="newWordValue"
                    type="text"
                    placeholder="e.g. apple">

            </label>


            <button
                id="addWordSubmit"
                type="button">

                ADD WORD

            </button>


            <button
                id="addWordCancel"
                type="button">

                CANCEL

            </button>


            <div
                id="addWordStatus">
            </div>

        </div>

    `;


    document.body.appendChild(
        overlay
    );


    /* ========================================================
       OPEN
       ======================================================== */

    /*
   IMPORTANT:
   Stop tree.js from treating this button
   as the start of a tree drag.
*/
launcher.addEventListener(
    "pointerdown",
    event => {

        event.stopPropagation();
    }
);


launcher.addEventListener(
    "click",
    event => {

        event.stopPropagation();

        console.log(
            "ADD WORD POPUP OPEN"
        );


        const status =
            overlay.querySelector(
                "#addWordStatus"
            );


        status.textContent =
            "";


        overlay.classList.add(
            "active"
        );


        overlay
            .querySelector(
                "#newWordLanguage"
            )
            ?.focus();
    }
);


    /* ========================================================
       CANCEL
       ======================================================== */

    overlay
        .querySelector(
            "#addWordCancel"
        )
        .addEventListener(
            "click",
            () => {

                overlay.classList.remove(
                    "active"
                );
            }
        );


    /* ========================================================
       CLICK BACKGROUND TO CLOSE
       ======================================================== */

    overlay.addEventListener(
        "click",
        event => {

            if (
                event.target ===
                overlay
            ) {

                overlay.classList.remove(
                    "active"
                );
            }
        }
    );


    /* ========================================================
       ADD WORD
       ======================================================== */

    overlay
        .querySelector(
            "#addWordSubmit"
        )
        .addEventListener(
            "click",
            async () => {

                const languageInput =
                    overlay.querySelector(
                        "#newWordLanguage"
                    );


                const wordInput =
                    overlay.querySelector(
                        "#newWordValue"
                    );


                const status =
                    overlay.querySelector(
                        "#addWordStatus"
                    );


                const language =
                    languageInput
                        .value
                        .trim();


                const word =
                    wordInput
                        .value
                        .trim();


                /* ============================================
                   VALIDATION
                   ============================================ */

                if (
                    !language ||
                    !word
                ) {

                    status.textContent =
                        "Enter a language and a word.";

                    return;
                }


                status.textContent =
                    "Adding...";


                try {

                    /* ========================================
                       CREATE NEW WORD GROUP

                       POST /words
                       ======================================== */

                    await window
                        .WordTreeAPI
                        .addWordGroup(
                            [
                                {
                                    language:
                                        language,

                                    words:
                                        [
                                            word
                                        ]
                                }
                            ]
                        );


                    status.textContent =
                        "Word added!";


                    /* ========================================
                       CLEAR INPUTS
                       ======================================== */

                    languageInput.value =
                        "";


                    wordInput.value =
                        "";


                    /* ========================================
                       UPDATE TREE

                       tree.js listens for this event and
                       runs GET /words again.
                       ======================================== */

                    window.dispatchEvent(
                        new CustomEvent(
                            "wordtree:words-changed"
                        )
                    );


                    /* ========================================
                       CLOSE POPUP
                       ======================================== */

                    setTimeout(
                        () => {

                            overlay
                                .classList
                                .remove(
                                    "active"
                                );

                        },
                        500
                    );

                }
                catch (error) {

                    console.error(
                        "Could not add word:",
                        error
                    );


                    /*
                       Backend returns 409 if this word
                       already exists.
                    */

                    if (
                        error.status ===
                        409
                    ) {

                        status.textContent =
                            "That word already exists.";
                    }

                    else {

                        status.textContent =
                            error.message ||
                            "Could not add word.";
                    }
                }
            }
        );
}

/* ============================================================
   WAIT FOR app.js API
   ============================================================ */

/*
   popup.js loads before app.js in your current index.html.
*/

if (
    window.WordTreeAPI
) {

    buildAddWordUI();
}

else {

    window.addEventListener(
        "wordtree:api-ready",
        buildAddWordUI,
        {
            once: true
        }
    );
}


/* ============================================================
   CLOSE WORD POPUP
   ============================================================ */

document
    .getElementById(
        "closeWordPopup"
    )
    ?.addEventListener(
        "click",
        () => {

            wordPopup.classList.remove(
                "active"
            );
        }
    );


/* ============================================================
   CLICK OUTSIDE POPUP TO CLOSE
   ============================================================ */

document
    .querySelectorAll(
        ".popup-overlay"
    )
    .forEach(
        overlay => {

            overlay.addEventListener(
                "click",
                event => {

                    if (
                        event.target ===
                        overlay
                    ) {

                        overlay
                            .classList
                            .remove(
                                "active"
                            );
                    }
                }
            );
        }
    );
