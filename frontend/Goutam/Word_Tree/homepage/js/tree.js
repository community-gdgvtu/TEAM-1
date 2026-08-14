/* ============================================================
   3D WORD TREE
   ------------------------------------------------------------
   BASED ON YOUR WORKING TREE.JS.

   Visual behaviour kept from your version:
   - crossed tree planes
   - drag rotation
   - fixed tree size/center controls
   - word orbit
   - word fade around the back
   - words remain above the tree

   CHANGED:
   - NO fakeDatabase
   - words now come from GET /words
   - word nodes are created from MongoDB data
   - tree can reload after a new word is added
   ============================================================ */


/* ============================================================
   TREE CONTROLS
   ============================================================ */

const TREE_CENTER_X = 50;      // move TREE + WORDS left/right (%)
const TREE_CENTER_Y = 50;      // perspective center vertically

const TREE_WIDTH = 900;        // tree size
const TREE_HEIGHT = 900;

const WORD_RADIUS = 300;       // horizontal orbit radius
const PLANE_COUNT = 4;

const TREE_PIVOT_X = 44;       // actual trunk axis inside PNG
const TREE_PIVOT_Y = 65;


/*
   Which language should be displayed as the label on the tree?

   If a group has no English translation, the first available
   translation is used instead.
*/
const DISPLAY_LANGUAGE = "en";


/*
   WORD CENTER / VERTICAL PLACEMENT
*/
const WORD_CENTER_Y = 390;


/*
   This pattern repeats if there are more than 8 words.
*/
const WORD_Y_OFFSETS = [
    -150, -80, 10, 95,
     145, 55, -35, 120
];


const treeSection =
    document.getElementById("treeSection");

const originalTreeImage =
    treeSection.querySelector(".tree-image");


let wordNodes = [];

let treeRotation = 0;
let dragging = false;
let previousX = 0;

let stage = null;
let treeBuilt = false;


/* ============================================================
   3D RUNTIME STYLES
   ============================================================ */

const runtimeStyle =
    document.createElement("style");

runtimeStyle.textContent = `
    .tree-container {
        perspective: 1250px !important;

        perspective-origin:
            ${TREE_CENTER_X}%
            ${TREE_CENTER_Y}% !important;

        /*
          Keep the parent flat so the HTML word buttons
          stay above the rotating 3D planes.
        */
        transform-style: flat !important;

        overflow: visible !important;

        isolation: isolate;
    }


    .tree-3d-stage {
        overflow: visible !important;

        position: absolute;

        left: ${TREE_CENTER_X}%;

        bottom: -80px;

        width: ${TREE_WIDTH}px;
        height: ${TREE_HEIGHT}px;

        transform:
            translateX(-50%)
            rotateY(0deg);

        transform-style: preserve-3d;

        transform-origin:
            50%
            55%;

        pointer-events: none;

        z-index: 1;

        will-change: transform;
    }


    /*
      Extra room around each plane to reduce clipping
      while the flat tree images rotate.
    */
    .tree-3d-plane {
        overflow: visible !important;

        position: absolute;

        left: -120px;
        right: -120px;
        top: -120px;
        bottom: -120px;

        transform-style: preserve-3d;

        backface-visibility: visible;

        transform-origin:
            ${TREE_PIVOT_X}%
            ${TREE_PIVOT_Y}%;
    }


    /*
      Compensate for the larger plane box so the
      visible tree image remains the original size.
    */
    .tree-3d-plane img {
        position: absolute;

        left: 120px;
        top: 120px;

        width: calc(100% - 240px);
        height: calc(100% - 240px);

        object-fit: contain;
        object-position: center;

        pointer-events: none;

        overflow: visible !important;
    }


    /* WORDS ALWAYS STAY ABOVE THE TREE */
    .word-node {
        position: relative !important;

        /*
          Ignore the old node-* positional CSS.
          JS now owns left/top.
        */
        top: 0 !important;
        right: auto !important;
        bottom: auto !important;

        width: auto !important;

        min-width: 115px !important;
        max-width: 165px !important;

        min-height: 52px !important;

        padding: 9px 16px !important;

        font-size: 22px !important;
        line-height: 1.05 !important;

        white-space: nowrap !important;

        transform-origin: center;

        z-index: 9999 !important;

        transform-style: flat !important;

        transition:
            transform 60ms linear,
            opacity 220ms ease,
            filter 160ms ease;

        will-change:
            left,
            top,
            transform,
            opacity;
    }


    .word-cluster {
        position: absolute !important;

        z-index: 9999 !important;

        transform-origin: center top;

        display: flex;
        flex-direction: column;
        align-items: center;

        transition:
            transform 60ms linear,
            opacity 220ms ease,
            filter 160ms ease;

        will-change:
            left,
            top,
            transform,
            opacity;
    }


    .word-translation-connector {
        width: 2px;
        height: 14px;

        background: #222;

        opacity: 0;

        margin-top: 4px;
        margin-bottom: 3px;

        transform: translateY(-8px);

        transition:
            opacity 180ms ease,
            transform 180ms ease;

        pointer-events: none;
    }


    .word-translation-box {
        display: flex;
        flex-direction: column;
        align-items: center;

        gap: 0;

        text-align: left;

        opacity: 0;
        transform: translateY(-10px) scaleY(0.96);
        transform-origin: top center;

        transition:
            opacity 220ms ease,
            transform 220ms ease;

        pointer-events: none;
    }


    .word-cluster:hover .word-translation-connector,
    .word-cluster:focus-within .word-translation-connector {
        opacity: 0.78;
        transform: translateY(0);
    }


    .word-cluster:hover .word-translation-box,
    .word-cluster:focus-within .word-translation-box {
        opacity: 1;
        transform: translateY(0) scaleY(1);

        pointer-events: auto;
    }


    .word-translation-language-btn {
        border: 0;
        background: transparent;
        padding: 0;

        font-weight: 700;
        font-size: 10px;

        text-decoration: underline;
        cursor: pointer;

        color: #102a43;
    }


    .word-translation-words {
        margin-top: 1px;

        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }


    .word-translation-tier {
        min-width: 120px;
        max-width: 150px;

        padding: 4px 6px;

        border: 2px solid #111;
        border-radius: 10px;

        background: #fffdf5;

        box-shadow:
            0 2px 0 rgba(0, 0, 0, 0.2);

        font-size: 10px;
        line-height: 1.1;

        white-space: normal;

        text-align: center;

        pointer-events: auto;
    }


    .word-translation-chain {
        width: 2px;
        height: 12px;

        background: #222;

        opacity: 0.78;

        margin-top: 2px;
        margin-bottom: 2px;
    }


    .word-tree-status {
        position: absolute;

        left: ${TREE_CENTER_X}%;

        top: 45px;

        transform: translateX(-50%);

        z-index: 10000;

        padding: 8px 12px;

        border: 2px solid #111;

        background: #f8f5e8;

        font-size: 14px;
    }
`;

document.head.appendChild(
    runtimeStyle
);


/* ============================================================
   BUILD CROSSED TREE PLANES
   ============================================================ */

function buildTree() {

    if (
        treeBuilt ||
        !originalTreeImage
    ) {
        return;
    }


    stage =
        document.createElement("div");

    stage.className =
        "tree-3d-stage";


    for (
        let i = 0;
        i < PLANE_COUNT;
        i++
    ) {

        const plane =
            document.createElement("div");

        plane.className =
            "tree-3d-plane";


        const planeAngle =
            (180 / PLANE_COUNT) *
            i;


        plane.style.transform =
            `rotateY(${planeAngle}deg)`;


        const image =
            originalTreeImage.cloneNode(true);


        image.removeAttribute(
            "class"
        );


        image.style.opacity =
            i === 0
                ? "1"
                : "0.76";


        image.style.filter =
            `brightness(${
                1 -
                (i % 4) *
                0.025
            })`;


        plane.appendChild(
            image
        );


        stage.appendChild(
            plane
        );
    }


    originalTreeImage.remove();


    treeSection.prepend(
        stage
    );


    treeBuilt = true;
}


/* ============================================================
   MONGODB WORD DATA
   ============================================================ */

/*
  Backend GET /words returns groups like:

  {
      _id: "...",
      translations: [
          {
              language: "en",
              words: ["house", "home"]
          },
          {
              language: "ja",
              words: ["家", "住宅"]
          }
      ]
  }

  We choose ONE word from each group to display on the tree.
*/

function getDisplayWordFromGroup(
    group
) {

    const translations =
        Array.isArray(
            group?.translations
        )
            ? group.translations
            : [];


    if (
        translations.length === 0
    ) {
        return null;
    }


    const preferred =
        translations.find(
            translation =>
                translation.language ===
                DISPLAY_LANGUAGE
        );


    const selected =
        preferred ||
        translations[0];


    if (
        !Array.isArray(
            selected?.words
        ) ||
        selected.words.length === 0
    ) {
        return null;
    }


    return {
        word:
            selected.words[0],

        language:
            selected.language,

        translationLines:
            getTranslationLinesFromGroup(
                group,
                selected.words[0]
            ),

        groupId:
            String(group._id)
    };
}


function getTranslationLinesFromGroup(
    group,
    displayWord
) {
    const translations =
        Array.isArray(
            group?.translations
        )
            ? group.translations
            : [];


    const lines = [];


    for (
        const translation
        of translations
    ) {

        const language =
            String(
                translation?.language ||
                "unknown"
            ).trim();


        const words =
            Array.isArray(
                translation?.words
            )
                ? translation.words
                : [];


        const cleanedWords =
            words
                .map(
                    word =>
                        String(word).trim()
                )
                .filter(Boolean);


        if (
            cleanedWords.length ===
            0
        ) {
            continue;
        }


        lines.push({
            language,
            words: cleanedWords
        });
    }


    if (
        lines.length === 0
    ) {
        lines.push({
            language: "info",
            words: ["No extra translations"]
        });
    }


    return lines;
}


/* ============================================================
   CREATE / REMOVE WORD NODES
   ============================================================ */

function clearCurrentWordNodes() {

    wordNodes.forEach(
        node => {

            node.remove();
        }
    );


    wordNodes = [];
}


function createWordNode(
    entry,
    index,
    total
) {

    const cluster =
        document.createElement(
            "div"
        );


    cluster.className =
        "word-cluster";


    cluster.dataset.word =
        entry.word;


    cluster.dataset.language =
        entry.language;


    cluster.dataset.groupId =
        entry.groupId;


    const node =
        document.createElement(
            "button"
        );


    node.className =
        "word-node";


    node.type =
        "button";


    node.textContent =
        entry.word;


    node.addEventListener(
        "click",
        event => {

            event.stopPropagation();


            openWordPopup(
                cluster.dataset.word
            );
        }
    );


    const connector =
        document.createElement(
            "div"
        );


    connector.className =
        "word-translation-connector";


    const translationBox =
        document.createElement(
            "div"
        );


    translationBox.className =
        "word-translation-box";


    const translationLines =
        entry.translationLines ||
        [];


    translationLines.forEach(
        (
            line,
            lineIndex
        ) => {

            const tier =
                document.createElement(
                    "div"
                );


            tier.className =
                "word-translation-tier";


            const languageButton =
                document.createElement(
                    "button"
                );


            languageButton.type =
                "button";


            languageButton.className =
                "word-translation-language-btn";


            languageButton.textContent =
                line.language;


            languageButton.addEventListener(
                "click",
                event => {

                    event.stopPropagation();


                    openWordPopup(
                        line.words[0] ||
                        cluster.dataset.word
                    );
                }
            );


            const wordsText =
                document.createElement(
                    "div"
                );


            wordsText.className =
                "word-translation-words";


            wordsText.textContent =
                line.words.join(
                    " - "
                );


            tier.appendChild(
                languageButton
            );


            tier.appendChild(
                wordsText
            );


            translationBox.appendChild(
                tier
            );


            if (
                lineIndex <
                translationLines.length -
                    1
            ) {

                const chain =
                    document.createElement(
                        "div"
                    );


                chain.className =
                    "word-translation-chain";


                translationBox.appendChild(
                    chain
                );
            }
        }
    );


    /*
      Equal spacing around the full 360-degree word orbit.
    */

    node.dataset.angle =
        String(
            (
                360 /
                total
            ) *
            index
        );


    /*
      Reuse your original vertical placement pattern.
    */

    node.dataset.yOffset =
        String(
            WORD_Y_OFFSETS[
                index %
                WORD_Y_OFFSETS.length
            ]
        );


    cluster.dataset.angle =
        node.dataset.angle;


    cluster.dataset.yOffset =
        node.dataset.yOffset;


    cluster.appendChild(
        node
    );


    cluster.appendChild(
        connector
    );


    cluster.appendChild(
        translationBox
    );


    treeSection.appendChild(
        cluster
    );


    return cluster;
}


/* ============================================================
   LOAD WORDS FROM BACKEND
   ============================================================ */

async function loadWordsFromDatabase() {

    /*
      app.js is responsible for defining WordTreeAPI.

      We wait for it because index.html currently loads tree.js
      before app.js.
    */

    if (
        !window.WordTreeAPI
    ) {
        return;
    }


    let status =
        treeSection.querySelector(
            ".word-tree-status"
        );


    if (!status) {

        status =
            document.createElement(
                "div"
            );


        status.className =
            "word-tree-status";


        treeSection.appendChild(
            status
        );
    }


    status.textContent =
        "Loading words...";


    try {

        const groups =
            await window
                .WordTreeAPI
                .getAllWordGroups();


        const displayWords =
            groups
                .map(
                    getDisplayWordFromGroup
                )
                .filter(Boolean);


        clearCurrentWordNodes();


        if (
            displayWords.length ===
            0
        ) {

            status.textContent =
                "No words in database yet.";

            return;
        }


        status.remove();


        wordNodes =
            displayWords.map(
                (
                    entry,
                    index
                ) =>
                    createWordNode(
                        entry,
                        index,
                        displayWords.length
                    )
            );


        updateTree();

    }
    catch (error) {

        console.error(
            "Could not load words:",
            error
        );


        status.textContent =
            `Could not load words: ${
                error.message
            }`;
    }
}


/* ============================================================
   UPDATE TREE + WORD POSITIONS
   ============================================================ */

function updateTree() {

    if (!stage) {
        return;
    }


    stage.style.transform =
        `translateX(-50%)
         rotateY(${treeRotation}deg)`;


    wordNodes.forEach(
        cluster => {

            const baseAngle =
                Number(
                    cluster.dataset.angle
                );


            const angle =
                baseAngle +
                treeRotation;


            const radians =
                angle *
                Math.PI /
                180;


            const x =
                Math.sin(
                    radians
                ) *
                WORD_RADIUS;


            const depth =
                Math.cos(
                    radians
                );


            const yOffset =
                Number(
                    cluster.dataset.yOffset
                );


            /*
              Very subtle size change:
              ~0.98x to ~1.02x
            */

            const scale =
                0.98 +
                (
                    (depth + 1) /
                    2
                ) *
                0.04;


            cluster.style.setProperty(
                "left",

                `calc(
                    ${TREE_CENTER_X}% +
                    ${x}px
                )`,

                "important"
            );


            cluster.style.setProperty(
                "top",

                `${
                    WORD_CENTER_Y +
                    yOffset
                }px`,

                "important"
            );


            cluster.style.transform =
                `translateX(-50%)
                 scale(${scale})`;


            cluster.style.setProperty(
                "z-index",
                "9999",
                "important"
            );


            /*
              FADE AROUND THE SIDE OF THE TREE
            */

            const fadeStart =
                0.18;

            const fadeEnd =
                -0.38;


            let wordOpacity;


            if (
                depth >=
                fadeStart
            ) {

                wordOpacity =
                    1;
            }

            else if (
                depth <=
                fadeEnd
            ) {

                wordOpacity =
                    0;
            }

            else {

                wordOpacity =
                    (
                        depth -
                        fadeEnd
                    ) /
                    (
                        fadeStart -
                        fadeEnd
                    );
            }


            cluster.style.opacity =
                String(
                    wordOpacity
                );


            cluster.style.pointerEvents =
                wordOpacity <
                0.15
                    ? "none"
                    : "auto";


            cluster.style.filter =
                depth < 0
                    ? "brightness(0.92)"
                    : "brightness(1)";
        }
    );
}


/* ============================================================
   DRAG LEFT / RIGHT TO ROTATE
   ============================================================ */

treeSection.addEventListener(
    "pointerdown",

    event => {

        if (
    event.target.closest(
        ".word-node"
    ) ||
    event.target.closest(
        ".word-translation-language-btn"
    ) ||
    event.target.closest(
        "#addWordLauncher"
    )
) {
    return;
}


        dragging =
            true;


        previousX =
            event.clientX;


        treeSection
            .setPointerCapture?.(
                event.pointerId
            );
    }
);


treeSection.addEventListener(
    "pointermove",

    event => {

        if (!dragging) {
            return;
        }


        const movement =
            event.clientX -
            previousX;


        treeRotation +=
            movement *
            0.45;


        previousX =
            event.clientX;


        updateTree();
    }
);


treeSection.addEventListener(
    "pointerup",

    () => {

        dragging =
            false;
    }
);


treeSection.addEventListener(
    "pointercancel",

    () => {

        dragging =
            false;
    }
);


/* ============================================================
   INITIALISE
   ============================================================ */

function initialiseTree() {

    buildTree();

    loadWordsFromDatabase();
}


/*
  index.html currently loads:

      popup.js
      tree.js
      navbar.js
      app.js

  Therefore WordTreeAPI probably does not exist yet when
  tree.js first executes.

  app.js dispatches "wordtree:api-ready" when it is ready.
*/

if (
    window.WordTreeAPI
) {

    initialiseTree();
}

else {

    buildTree();


    window.addEventListener(
        "wordtree:api-ready",

        loadWordsFromDatabase,

        {
            once: true
        }
    );
}


/*
  popup.js dispatches this after POST /words succeeds.

  This lets a newly-added MongoDB word appear without
  refreshing the page.
*/

window.addEventListener(
    "wordtree:words-changed",

    loadWordsFromDatabase
);


updateTree();
