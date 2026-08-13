const navButtons =
    document.querySelectorAll(".nav-button");


navButtons.forEach(button => {

    button.addEventListener("click", () => {

        const page =
            button.dataset.page;

        switch (page) {

            case "something":

                alert(
                    "SOMETHING ELSE section"
                );

                break;


            case "important":

                alert(
                    "IMPORTANT WORDS section"
                );

                break;


            case "pals":

                alert(
                    "PALS section"
                );

                break;


            case "profile":

                alert(
                    "PROFILE section"
                );

                break;

        }

    });

});