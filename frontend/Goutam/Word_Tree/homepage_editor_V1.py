"""
WORD TREE - SINGLE SCREEN HOMEPAGE EDITOR

Run from the Word_Tree project root:

    python homepage_editor.py

This editor is designed for the current no-scroll homepage layout.

Features:
- Floating editor window.
- Drag the editor window.
- Resize the editor window.
- Minimize the editor for a clear view.
- Select homepage elements from a searchable list.
- Drag any unlocked element.
- Arrow-key movement.
- Width and height controls.
- Scale control.
- Lock/unlock individual elements.
- Unlock all.
- Reset one element or everything.
- Generates only the CSS changes you made.
- Does NOT modify your actual project files.

IMPORTANT:
Position changes use CSS translate, so moving one element does not
normally affect the layout of other elements.

Size changes are written only for the selected element.
"""

import argparse
import http.server
import os
import threading
import webbrowser
from urllib.parse import urlparse

EDITOR_CSS = r"""
#wt-editor {
    position: fixed;
    left: 20px;
    top: 20px;
    width: 350px;
    height: 620px;
    min-width: 280px;
    min-height: 250px;
    max-width: 70vw;
    max-height: 90vh;
    z-index: 2147483647;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    resize: both;
    background: #e8e2c9;
    color: #111;
    border: 4px solid #111;
    box-shadow: 9px 9px 0 #111;
    font-family: Georgia, "Times New Roman", serif;
}

#wt-editor * {
    box-sizing: border-box;
}

#wt-editor-titlebar {
    min-height: 45px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 7px;
    background: #c40072;
    border-bottom: 4px solid #111;
    cursor: move;
    user-select: none;
}

#wt-editor-title {
    flex: 1;
    font-size: 16px;
    font-weight: bold;
}

#wt-editor-titlebar button {
    width: 31px;
    height: 29px;
    padding: 0;
    border: 3px solid #111;
    background: #e8e2c9;
    color: #111;
    font: bold 18px Georgia, serif;
    cursor: pointer;
}

#wt-editor-body {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
}

#wt-editor label {
    display: block;
    margin: 7px 0 3px;
    font-size: 11px;
    font-weight: bold;
}

#wt-editor input[type="text"],
#wt-editor input[type="number"],
#wt-editor select {
    width: 100%;
    height: 31px;
    padding: 3px 6px;
    border: 3px solid #111;
    background: #fff;
    color: #111;
    font-family: Georgia, serif;
}

#wt-editor input[type="range"] {
    width: 100%;
}

.wt-editor-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px;
}

.wt-editor-section {
    margin-top: 9px;
    padding-top: 8px;
    border-top: 3px solid #111;
}

.wt-editor-button {
    width: 100%;
    min-height: 33px;
    margin-top: 5px;
    border: 3px solid #111;
    background: #c40072;
    color: #111;
    font: bold 12px Georgia, serif;
    cursor: pointer;
}

.wt-editor-button:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0 #111;
}

.wt-editor-status {
    margin-top: 8px;
    padding: 7px;
    border: 3px dashed #111;
    font-size: 10px;
    line-height: 1.35;
}

#wt-editor-css {
    width: 100%;
    min-height: 170px;
    resize: vertical;
    padding: 7px;
    border: 3px solid #111;
    background: #fff;
    color: #111;
    font: 10px Consolas, monospace;
}

.wt-editor-selected {
    outline: 4px dashed #111 !important;
    outline-offset: 3px !important;
    cursor: move !important;
}

.wt-editor-locked {
    outline: 3px dotted #111 !important;
    outline-offset: 3px !important;
    cursor: not-allowed !important;
    opacity: .82;
}

#wt-editor-minimized {
    position: fixed;
    left: 20px;
    top: 20px;
    z-index: 2147483647;
    display: none;
    padding: 9px 14px;
    border: 4px solid #111;
    box-shadow: 6px 6px 0 #111;
    background: #c40072;
    color: #111;
    font: bold 14px Georgia, serif;
    cursor: pointer;
}
"""

EDITOR_JS = r"""
(() => {
    const STORAGE_KEY =
        "wordTreeSingleScreenEditor:v1";

    /*
     * Only these elements are offered by default.
     * This keeps the editor useful instead of filling the list with
     * tiny internal HTML elements.
     */
    const selectors = [
        ".website-frame",
        ".navbar",
        ".brand",
        ".brand-tree",
        ".brand-text",
        ".brand-text h1",
        ".brand-text p",
        ".nav-buttons",
        ".nav-button",
        ".main-area",
        ".welcome-panel",
        ".small-heading",
        ".welcome-panel h2",
        ".heading-line",
        ".welcome-description",
        ".primary-button",
        ".secondary-button",
        ".tree-container",
        ".tree-image",
        ".tree-swing",
        ".swing-rope",
        ".swing-seat",
        ".word-node",
        ".about-panel",
        ".about-panel h3",
        ".about-item",
        ".about-icon",
        ".about-item strong",
        ".about-item p",
        ".quote-panel",
        ".quote-panel p",
        ".quote-panel span"
    ];

    const elements = [];
    const seen = new Set();

    function add(el) {
        if (!el || seen.has(el)) return;

        if (
            el.closest("#wt-editor") ||
            el.id === "wt-editor"
        ) {
            return;
        }

        const rect =
            el.getBoundingClientRect();

        if (
            rect.width <= 5 ||
            rect.height <= 5
        ) {
            return;
        }

        seen.add(el);
        elements.push(el);
    }

    selectors.forEach(selector => {
        document.querySelectorAll(selector)
            .forEach(add);
    });

    /*
     * Also detect any additional visible direct homepage elements
     * that weren't covered by the known selectors.
     */
    document.querySelectorAll("body *")
        .forEach(el => {
            if (
                el.closest("#wt-editor") ||
                el.id === "wt-editor"
            ) {
                return;
            }

            const tag = el.tagName;

            if (
                ["SCRIPT", "STYLE", "LINK",
                 "META", "HEAD"].includes(tag)
            ) {
                return;
            }

            const rect =
                el.getBoundingClientRect();

            if (
                rect.width > 8 &&
                rect.height > 8
            ) {
                add(el);
            }
        });

    const saved =
        JSON.parse(
            localStorage.getItem(STORAGE_KEY) || "{}"
        );

    let selected = null;
    let dragging = false;
    let dragPointerX = 0;
    let dragPointerY = 0;

    function keyFor(el, index) {
        if (el.id) {
            return "#" + el.id;
        }

        const usefulClass =
            [...el.classList]
                .find(c =>
                    !c.startsWith("wt-editor")
                );

        if (usefulClass) {
            return "." + usefulClass;
        }

        return `${el.tagName.toLowerCase()}[data-editor-index="${index}"]`;
    }

    function stateFor(el, index) {
        const key =
            keyFor(el, index);

        if (!saved[key]) {
            saved[key] = {
                tx: 0,
                ty: 0,
                scale: 1,
                width: null,
                height: null,
                changedMove: false,
                changedScale: false,
                changedSize: false,
                locked: false
            };
        }

        return saved[key];
    }

    elements.forEach((el, index) => {
        el.dataset.editorIndex =
            String(index);

        stateFor(el, index);
    });

    function indexOf(el) {
        return Number(
            el.dataset.editorIndex
        );
    }

    function applyState(el) {
        const s =
            stateFor(el, indexOf(el));

        el.style.translate =
            `${s.tx}px ${s.ty}px`;

        el.style.scale =
            String(s.scale);

        if (s.width !== null) {
            el.style.width =
                `${s.width}px`;
        }

        if (s.height !== null) {
            el.style.height =
                `${s.height}px`;
        }

        el.classList.toggle(
            "wt-editor-locked",
            s.locked
        );
    }

    elements.forEach(applyState);

    const editor =
        document.createElement("div");

    editor.id = "wt-editor";

    editor.innerHTML = `
        <div id="wt-editor-titlebar">
            <div id="wt-editor-title">
                🌳 HOMEPAGE EDITOR
            </div>

            <button id="wt-editor-minimize"
                    title="Minimize">−</button>

            <button id="wt-editor-close"
                    title="Close">×</button>
        </div>

        <div id="wt-editor-body">

            <label>SEARCH ELEMENTS</label>

            <input
                id="wt-editor-search"
                type="text"
                placeholder="tree, navbar, button..."
            >

            <label>ELEMENT</label>

            <select id="wt-editor-element"></select>

            <div class="wt-editor-grid">
                <button class="wt-editor-button"
                        id="wt-editor-lock">
                    🔓 LOCK
                </button>

                <button class="wt-editor-button"
                        id="wt-editor-reset">
                    RESET
                </button>
            </div>

            <div class="wt-editor-section">
                <label>X OFFSET</label>

                <input
                    id="wt-editor-x"
                    type="number"
                    step="1"
                >

                <label>Y OFFSET</label>

                <input
                    id="wt-editor-y"
                    type="number"
                    step="1"
                >

                <div class="wt-editor-grid">
                    <button class="wt-editor-button"
                            id="wt-editor-left">
                        ← 1px
                    </button>

                    <button class="wt-editor-button"
                            id="wt-editor-right">
                        1px →
                    </button>

                    <button class="wt-editor-button"
                            id="wt-editor-up">
                        ↑ 1px
                    </button>

                    <button class="wt-editor-button"
                            id="wt-editor-down">
                        ↓ 1px
                    </button>
                </div>
            </div>

            <div class="wt-editor-section">
                <label>WIDTH (PX)</label>

                <input
                    id="wt-editor-width"
                    type="number"
                    min="1"
                >

                <label>HEIGHT (PX)</label>

                <input
                    id="wt-editor-height"
                    type="number"
                    min="1"
                >

                <button
                    class="wt-editor-button"
                    id="wt-editor-apply-size">
                    APPLY SIZE
                </button>
            </div>

            <div class="wt-editor-section">
                <label>
                    SCALE:
                    <span id="wt-editor-scale-value">
                        100%
                    </span>
                </label>

                <input
                    id="wt-editor-scale"
                    type="range"
                    min="25"
                    max="300"
                    value="100"
                >
            </div>

            <div class="wt-editor-section">
                <button
                    class="wt-editor-button"
                    id="wt-editor-unlock-all">
                    UNLOCK ALL
                </button>

                <button
                    class="wt-editor-button"
                    id="wt-editor-reset-all">
                    RESET ALL CHANGES
                </button>
            </div>

            <div class="wt-editor-section">
                <button
                    class="wt-editor-button"
                    id="wt-editor-copy">
                    COPY CHANGED CSS
                </button>
            </div>

            <div class="wt-editor-section">
                <label>GENERATED CSS</label>

                <textarea
                    id="wt-editor-css"
                    spellcheck="false"
                ></textarea>
            </div>

            <div
                class="wt-editor-status"
                id="wt-editor-status"
            ></div>
        </div>
    `;

    document.body.appendChild(editor);

    const minimized =
        document.createElement("button");

    minimized.id =
        "wt-editor-minimized";

    minimized.textContent =
        "🌳 EDITOR";

    document.body.appendChild(
        minimized
    );

    const titlebar =
        editor.querySelector(
            "#wt-editor-titlebar"
        );

    const minimizeButton =
        editor.querySelector(
            "#wt-editor-minimize"
        );

    const closeButton =
        editor.querySelector(
            "#wt-editor-close"
        );

    const search =
        editor.querySelector(
            "#wt-editor-search"
        );

    const select =
        editor.querySelector(
            "#wt-editor-element"
        );

    const lockButton =
        editor.querySelector(
            "#wt-editor-lock"
        );

    const xInput =
        editor.querySelector(
            "#wt-editor-x"
        );

    const yInput =
        editor.querySelector(
            "#wt-editor-y"
        );

    const widthInput =
        editor.querySelector(
            "#wt-editor-width"
        );

    const heightInput =
        editor.querySelector(
            "#wt-editor-height"
        );

    const scaleInput =
        editor.querySelector(
            "#wt-editor-scale"
        );

    const scaleValue =
        editor.querySelector(
            "#wt-editor-scale-value"
        );

    const cssOutput =
        editor.querySelector(
            "#wt-editor-css"
        );

    const status =
        editor.querySelector(
            "#wt-editor-status"
        );

    function labelFor(el, index) {
        const key =
            keyFor(el, index);

        const text =
            (el.textContent || "")
                .trim()
                .replace(/\s+/g, " ");

        if (text) {
            return (
                key +
                " — " +
                text.slice(0, 35)
            );
        }

        return key;
    }

    function populate(filter = "") {
        const previous =
            selected
                ? selected.dataset.editorIndex
                : null;

        select.innerHTML = "";

        elements.forEach((el, index) => {
            const label =
                labelFor(el, index);

            if (
                filter &&
                !label
                    .toLowerCase()
                    .includes(
                        filter.toLowerCase()
                    )
            ) {
                return;
            }

            const option =
                document.createElement("option");

            option.value =
                String(index);

            option.textContent =
                label;

            select.appendChild(option);
        });

        if (
            previous &&
            [...select.options]
                .some(
                    option =>
                        option.value === previous
                )
        ) {
            select.value = previous;
        }
    }

    function persist() {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(saved)
        );
    }

    function selectElement(el) {
        if (!el) return;

        if (selected) {
            selected.classList.remove(
                "wt-editor-selected"
            );
        }

        selected = el;

        selected.classList.add(
            "wt-editor-selected"
        );

        select.value =
            selected.dataset.editorIndex;

        updateControls();
    }

    function updateControls() {
        if (!selected) return;

        const s =
            stateFor(
                selected,
                indexOf(selected)
            );

        xInput.value = s.tx;
        yInput.value = s.ty;

        const rect =
            selected.getBoundingClientRect();

        widthInput.value =
            Math.round(rect.width);

        heightInput.value =
            Math.round(rect.height);

        const percent =
            Math.round(
                s.scale * 100
            );

        scaleInput.value =
            percent;

        scaleValue.textContent =
            `${percent}%`;

        lockButton.textContent =
            s.locked
                ? "🔒 UNLOCK"
                : "🔓 LOCK";

        status.innerHTML =
            `<strong>${keyFor(
                selected,
                indexOf(selected)
            )}</strong><br>` +
            `Move: ${s.tx}px, ${s.ty}px<br>` +
            `Size: ${Math.round(rect.width)} × ` +
            `${Math.round(rect.height)}px<br>` +
            `Scale: ${percent}%<br>` +
            `Status: ` +
            `${s.locked ? "LOCKED" : "UNLOCKED"}`;

        updateCSS();
    }

    function setMove(x, y) {
        if (!selected) return;

        const s =
            stateFor(
                selected,
                indexOf(selected)
            );

        if (s.locked) return;

        s.tx =
            Math.round(Number(x) || 0);

        s.ty =
            Math.round(Number(y) || 0);

        s.changedMove =
            s.tx !== 0 ||
            s.ty !== 0;

        applyState(selected);
        persist();
        updateControls();
    }

    function moveBy(x, y) {
        if (!selected) return;

        const s =
            stateFor(
                selected,
                indexOf(selected)
            );

        if (s.locked) return;

        setMove(
            s.tx + x,
            s.ty + y
        );
    }

    function applySize() {
        if (!selected) return;

        const s =
            stateFor(
                selected,
                indexOf(selected)
            );

        if (s.locked) return;

        s.width =
            Math.max(
                1,
                Math.round(
                    Number(widthInput.value) || 1
                )
            );

        s.height =
            Math.max(
                1,
                Math.round(
                    Number(heightInput.value) || 1
                )
            );

        s.changedSize = true;

        applyState(selected);
        persist();
        updateControls();
    }

    function setScale(value) {
        if (!selected) return;

        const s =
            stateFor(
                selected,
                indexOf(selected)
            );

        if (s.locked) return;

        s.scale =
            Math.max(
                0.25,
                Math.min(
                    3,
                    Number(value) / 100
                )
            );

        s.changedScale =
            Math.abs(s.scale - 1) > 0.001;

        applyState(selected);
        persist();
        updateControls();
    }

    function resetSelected() {
        if (!selected) return;

        const s =
            stateFor(
                selected,
                indexOf(selected)
            );

        s.tx = 0;
        s.ty = 0;
        s.scale = 1;
        s.width = null;
        s.height = null;
        s.changedMove = false;
        s.changedScale = false;
        s.changedSize = false;

        selected.style.removeProperty(
            "translate"
        );

        selected.style.removeProperty(
            "scale"
        );

        selected.style.removeProperty(
            "width"
        );

        selected.style.removeProperty(
            "height"
        );

        applyState(selected);
        persist();
        updateControls();
    }

    function resetAll() {
        elements.forEach((el, index) => {
            const s =
                stateFor(el, index);

            s.tx = 0;
            s.ty = 0;
            s.scale = 1;
            s.width = null;
            s.height = null;
            s.changedMove = false;
            s.changedScale = false;
            s.changedSize = false;

            el.style.removeProperty(
                "translate"
            );

            el.style.removeProperty(
                "scale"
            );

            el.style.removeProperty(
                "width"
            );

            el.style.removeProperty(
                "height"
            );

            applyState(el);
        });

        persist();
        updateControls();
    }

    function unlockAll() {
        elements.forEach((el, index) => {
            const s =
                stateFor(el, index);

            s.locked = false;

            applyState(el);
        });

        persist();
        updateControls();
    }

    function cssFor(el, index) {
        const s =
            stateFor(el, index);

        if (
            !s.changedMove &&
            !s.changedScale &&
            !s.changedSize
        ) {
            return "";
        }

        let css =
            `${keyFor(el, index)} {\n`;

        if (s.changedMove) {
            css +=
                `    translate: ${s.tx}px ${s.ty}px;\n`;
        }

        if (s.changedScale) {
            css +=
                `    scale: ${s.scale};\n`;
        }

        if (s.changedSize) {
            if (s.width !== null) {
                css +=
                    `    width: ${s.width}px;\n`;
            }

            if (s.height !== null) {
                css +=
                    `    height: ${s.height}px;\n`;
            }
        }

        css += "}\n\n";

        return css;
    }

    function updateCSS() {
        let output =
            "/* =========================================\n" +
            "   WORD TREE HOMEPAGE EDITOR OVERRIDES\n" +
            "   Paste at the END of the appropriate CSS file.\n" +
            "   Only changed elements are included.\n" +
            "   ========================================= */\n\n";

        let changed = false;

        elements.forEach((el, index) => {
            const css =
                cssFor(el, index);

            if (css) {
                changed = true;
                output += css;
            }
        });

        if (!changed) {
            output +=
                "/* No changes made yet. */\n";
        }

        cssOutput.value =
            output;
    }

    async function copyCSS() {
        updateCSS();

        try {
            await navigator.clipboard.writeText(
                cssOutput.value
            );

            status.innerHTML =
                "<strong>CSS COPIED</strong><br>" +
                "Paste it at the end of the CSS file.";
        } catch {
            cssOutput.focus();
            cssOutput.select();

            status.innerHTML =
                "<strong>CLIPBOARD BLOCKED</strong><br>" +
                "Press Ctrl+C to copy.";
        }
    }

    function toggleLock() {
        if (!selected) return;

        const s =
            stateFor(
                selected,
                indexOf(selected)
            );

        s.locked = !s.locked;

        applyState(selected);
        persist();
        updateControls();
    }

    function makeDraggable(el) {
        el.addEventListener(
            "pointerdown",
            event => {
                if (event.button !== 0) return;

                if (
                    event.target.closest(
                        "#wt-editor"
                    )
                ) {
                    return;
                }

                const s =
                    stateFor(
                        el,
                        indexOf(el)
                    );

                if (s.locked) {
                    event.preventDefault();
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                selectElement(el);

                dragging = true;

                const rect =
                    el.getBoundingClientRect();

                dragPointerX =
                    event.clientX -
                    rect.left;

                dragPointerY =
                    event.clientY -
                    rect.top;

                el.setPointerCapture(
                    event.pointerId
                );
            }
        );

        el.addEventListener(
            "pointermove",
            event => {
                if (
                    !dragging ||
                    selected !== el
                ) {
                    return;
                }

                const s =
                    stateFor(
                        el,
                        indexOf(el)
                    );

                if (s.locked) return;

                const rect =
                    el.getBoundingClientRect();

                const newLeft =
                    event.clientX -
                    dragPointerX;

                const newTop =
                    event.clientY -
                    dragPointerY;

                s.tx += Math.round(
                    newLeft -
                    rect.left
                );

                s.ty += Math.round(
                    newTop -
                    rect.top
                );

                s.changedMove =
                    s.tx !== 0 ||
                    s.ty !== 0;

                applyState(el);
                persist();
                updateControls();
            }
        );

        el.addEventListener(
            "pointerup",
            event => {
                if (!dragging) return;

                dragging = false;

                try {
                    el.releasePointerCapture(
                        event.pointerId
                    );
                } catch {}

                persist();
                updateControls();
            }
        );

        el.addEventListener(
            "click",
            event => {
                if (
                    event.target.closest(
                        "#wt-editor"
                    )
                ) {
                    return;
                }

                event.preventDefault();
                event.stopPropagation();

                selectElement(el);
            }
        );
    }

    elements.forEach(makeDraggable);

    select.addEventListener(
        "change",
        () => {
            selectElement(
                elements[
                    Number(select.value)
                ]
            );
        }
    );

    search.addEventListener(
        "input",
        () => {
            populate(
                search.value
            );
        }
    );

    xInput.addEventListener(
        "change",
        () => {
            if (!selected) return;

            const s =
                stateFor(
                    selected,
                    indexOf(selected)
                );

            setMove(
                Number(xInput.value),
                s.ty
            );
        }
    );

    yInput.addEventListener(
        "change",
        () => {
            if (!selected) return;

            const s =
                stateFor(
                    selected,
                    indexOf(selected)
                );

            setMove(
                s.tx,
                Number(yInput.value)
            );
        }
    );

    scaleInput.addEventListener(
        "input",
        () => {
            setScale(
                scaleInput.value
            );
        }
    );

    editor.querySelector(
        "#wt-editor-left"
    ).onclick =
        () => moveBy(-1, 0);

    editor.querySelector(
        "#wt-editor-right"
    ).onclick =
        () => moveBy(1, 0);

    editor.querySelector(
        "#wt-editor-up"
    ).onclick =
        () => moveBy(0, -1);

    editor.querySelector(
        "#wt-editor-down"
    ).onclick =
        () => moveBy(0, 1);

    editor.querySelector(
        "#wt-editor-apply-size"
    ).onclick =
        applySize;

    editor.querySelector(
        "#wt-editor-lock"
    ).onclick =
        toggleLock;

    editor.querySelector(
        "#wt-editor-reset"
    ).onclick =
        resetSelected;

    editor.querySelector(
        "#wt-editor-reset-all"
    ).onclick =
        resetAll;

    editor.querySelector(
        "#wt-editor-unlock-all"
    ).onclick =
        unlockAll;

    editor.querySelector(
        "#wt-editor-copy"
    ).onclick =
        copyCSS;

    document.addEventListener(
        "keydown",
        event => {
            if (!selected) return;

            const tag =
                document.activeElement?.tagName;

            if (
                ["INPUT", "SELECT", "TEXTAREA"]
                    .includes(tag)
            ) {
                return;
            }

            const s =
                stateFor(
                    selected,
                    indexOf(selected)
                );

            if (s.locked) return;

            if (event.key === "ArrowLeft") {
                event.preventDefault();
                moveBy(-1, 0);
            }

            if (event.key === "ArrowRight") {
                event.preventDefault();
                moveBy(1, 0);
            }

            if (event.key === "ArrowUp") {
                event.preventDefault();
                moveBy(0, -1);
            }

            if (event.key === "ArrowDown") {
                event.preventDefault();
                moveBy(0, 1);
            }
        }
    );

    /*
     * Drag the floating editor itself.
     */
    let editorDragging = false;
    let editorOffsetX = 0;
    let editorOffsetY = 0;

    titlebar.addEventListener(
        "pointerdown",
        event => {
            if (
                event.target.closest(
                    "button"
                )
            ) {
                return;
            }

            editorDragging = true;

            const rect =
                editor.getBoundingClientRect();

            editorOffsetX =
                event.clientX -
                rect.left;

            editorOffsetY =
                event.clientY -
                rect.top;

            titlebar.setPointerCapture(
                event.pointerId
            );
        }
    );

    titlebar.addEventListener(
        "pointermove",
        event => {
            if (!editorDragging) return;

            editor.style.left =
                Math.max(
                    0,
                    event.clientX -
                    editorOffsetX
                ) + "px";

            editor.style.top =
                Math.max(
                    0,
                    event.clientY -
                    editorOffsetY
                ) + "px";

            editor.style.right =
                "auto";
        }
    );

    titlebar.addEventListener(
        "pointerup",
        () => {
            editorDragging = false;
        }
    );

    minimizeButton.onclick = () => {
        editor.style.display = "none";
        minimized.style.display = "block";
    };

    minimized.onclick = () => {
        editor.style.display = "flex";
        minimized.style.display = "block";
        minimized.style.display = "none";
    };

    closeButton.onclick = () => {
        editor.remove();
        minimized.remove();

        elements.forEach(el => {
            el.classList.remove(
                "wt-editor-selected",
                "wt-editor-locked"
            );
        });
    };

    populate();

    /*
     * Prefer the tree container as the initial selection.
     * Otherwise select the first detected element.
     */
    const first =
        document.querySelector(
            ".tree-image"
        ) ||
        document.querySelector(
            ".tree-container"
        ) ||
        elements[0];

    selectElement(first);

    console.log(
        "Word Tree single-screen editor loaded.",
        elements.length,
        "elements detected."
    );
})();
"""

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        path = urlparse(self.path).path

        if path.endswith("/homepage/homepage.html"):
            file_path = self.translate_path(path)

            try:
                with open(
                    file_path,
                    "r",
                    encoding="utf-8"
                ) as f:
                    html = f.read()

                injection = (
                    "<style>" +
                    EDITOR_CSS +
                    "</style>" +
                    "<script>" +
                    EDITOR_JS +
                    "</script>"
                )

                html = html.replace(
                    "</body>",
                    injection +
                    "</body>"
                )

                data = html.encode("utf-8")

                self.send_response(200)
                self.send_header(
                    "Content-Type",
                    "text/html; charset=utf-8"
                )
                self.send_header(
                    "Content-Length",
                    str(len(data))
                )
                self.send_header(
                    "Cache-Control",
                    "no-store"
                )
                self.end_headers()

                self.wfile.write(data)
                return

            except FileNotFoundError:
                pass

        super().do_GET()

    def log_message(self, format_string, *args):
        print(
            "[Word Tree Editor]",
            format_string % args
        )


def main():
    parser = argparse.ArgumentParser()

    parser.add_argument(
        "--root",
        default=os.getcwd()
    )

    parser.add_argument(
        "--port",
        type=int,
        default=8770
    )

    args = parser.parse_args()

    root = os.path.abspath(args.root)

    homepage = os.path.join(
        root,
        "homepage",
        "homepage.html"
    )

    if not os.path.isfile(homepage):
        raise SystemExit(
            "\nCould not find:\n" +
            homepage +
            "\n\nRun this script from your " +
            "Word_Tree project root."
        )

    os.chdir(root)

    server = http.server.ThreadingHTTPServer(
        ("127.0.0.1", args.port),
        Handler
    )

    url = (
        f"http://127.0.0.1:{args.port}"
        "/homepage/homepage.html"
    )

    print()
    print("=" * 65)
    print("WORD TREE - SINGLE SCREEN HOMEPAGE EDITOR")
    print("=" * 65)
    print("URL:", url)
    print()
    print("Drag the floating editor window.")
    print("Minimize it for a clear homepage view.")
    print("Drag unlocked elements to reposition them.")
    print("Lock elements before editing around them.")
    print("Use width/height or scale to resize.")
    print("Copy Changed CSS when finished.")
    print()
    print("Your project files are NOT modified.")
    print("Press Ctrl+C to stop.")
    print("=" * 65)

    threading.Timer(
        0.5,
        lambda: webbrowser.open(url)
    ).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nStopping editor...")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
