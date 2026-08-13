const wordNodes =
    document.querySelectorAll(".word-node");


wordNodes.forEach(node => {

    node.addEventListener("click", () => {

        const word =
            node.dataset.word;

        openWordPopup(word);

    });

});