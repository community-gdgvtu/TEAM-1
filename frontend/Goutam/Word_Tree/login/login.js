/* =========================================
   WORD TREE LOGIN PAGE
   FRONTEND ONLY
   ========================================= */


/* =========================================
   TEMPORARY TEST LOGIN
   REMOVE AFTER BACKEND INTEGRATION
   ========================================= */

const TEST_USERNAME = "ben";
const TEST_EMAIL = "benisten";
const TEST_PASSWORD = "ten";


/* =========================================
   PASSWORD VISIBILITY
   ========================================= */

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");


togglePassword.addEventListener(
    "click",
    () => {

        if (passwordInput.type === "password") {

            passwordInput.type = "text";

            togglePassword.textContent = "HIDE";

        } else {

            passwordInput.type = "password";

            togglePassword.textContent = "SHOW";

        }

    }
);


/* =========================================
   LOGIN BUTTON
   ========================================= */

const loginButton =
    document.getElementById("loginButton");


loginButton.addEventListener(
    "click",
    () => {

        const username =
            document.getElementById(
                "username"
            ).value.trim();

        const email =
            document.getElementById(
                "email"
            ).value.trim();

        const password =
            document.getElementById(
                "password"
            ).value;


        /* =====================================
           CHECK EMPTY FIELDS
           ===================================== */

        if (
            username === "" ||
            email === "" ||
            password === ""
        ) {

            alert(
                "Please enter your username, email and password."
            );

            return;

        }


        /* =====================================
           TEMPORARY TEST BYPASS
           ===================================== */

        if (
            username === TEST_USERNAME &&
            email === TEST_EMAIL &&
            password === TEST_PASSWORD
        ) {

            /*
             * TEST LOGIN SUCCESSFUL
             *
             * Temporary only.
             */

            window.location.href =
                "../homepage/homepage.html";

            return;

        }


        /* =====================================
           INVALID TEST LOGIN
           ===================================== */

        alert(
            "Invalid test login details."
        );

    }
);


/* =========================================
   CREATE ACCOUNT BUTTON
   ========================================= */

const signupButton =
    document.getElementById("signupButton");


signupButton.addEventListener(
    "click",
    () => {

        /*
         * BACKEND TODO:
         *
         * Connect this button to the
         * registration system later.
         */

        console.log(
            "BACKEND TODO: CREATE ACCOUNT"
        );

    }
);