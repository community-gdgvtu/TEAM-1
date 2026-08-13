// =====================================
// PROFILE PICTURE POPUP
// =====================================


function initializeProfilePopup() {

    const popup =
        document.getElementById("profilePopup");


    const closeButton =
        document.getElementById("closeProfilePopup");


    const uploadButton =
        document.getElementById(
            "uploadProfilePicture"
        );
    const profileUserName =
        document.getElementById("profileUserName");

    profileUserName.textContent = "All_Might";


    // CLOSE BUTTON

    closeButton.addEventListener(
        "click",
        () => {

            popup.classList.remove("active");

        }
    );


    // CLICK OUTSIDE POPUP

    popup.addEventListener(
        "click",
        (event) => {

            if (event.target === popup) {

                popup.classList.remove("active");

            }

        }
    );


    // ESCAPE KEY

    document.addEventListener(
        "keydown",
        (event) => {

            if (event.key === "Escape") {

                popup.classList.remove("active");

            }

        }
    );


    // BACKEND PLACEHOLDER

    uploadButton.addEventListener(
        "click",
        () => {

            console.log(
                "BACKEND TODO: Upload profile picture"
            );

        }
    );

}


// OPEN POPUP

function openProfilePopup() {

    const popup =
        document.getElementById("profilePopup");

    popup.classList.add("active");

}