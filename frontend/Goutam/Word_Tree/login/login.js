/* =========================================
   WORD TREE LOGIN PAGE
   BACKEND + TEST BYPASS
   ========================================= */


/* =========================================
   API URL
   ========================================= */

const API_BASE_URL =
    "https://cuddly-parakeet-q75547g7rq724rrp-8010.app.github.dev/proxy";


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


loginButton?.addEventListener(
    "click",
    async () => {

        const username =
            document
                .getElementById(
                    "username"
                )
                .value
                .trim();


        const email =
            document
                .getElementById(
                    "email"
                )
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "password"
                )
                .value;


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

            console.log(
                "TEST LOGIN SUCCESSFUL"
            );


            /*
               Save a fake test user so the rest
               of the frontend can still read
               wordtree_user normally.
            */

            localStorage.setItem(
                "wordtree_user",
                JSON.stringify({
                    id: "test-user",
                    username:
                        TEST_USERNAME,
                    email:
                        TEST_EMAIL
                })
            );


            localStorage.setItem(
                "wordtree_token",
                "TEST_BYPASS"
            );


            window.location.href =
                "../homepage/homepage.html";


            return;
        }


        /* =====================================
           REAL BACKEND LOGIN
           ===================================== */

        try {

            loginButton.disabled =
                true;


            loginButton.textContent =
                "LOGGING IN...";


            /*
               Backend only checks:

               email
               password

               Username stays in the frontend,
               but is not sent for login.
            */

            const response =
                await fetch(
                    `${API_BASE_URL}/users/login`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                email,
                                password
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Login failed."
                );
            }


            /* =================================
               OPTIONAL USERNAME CHECK
               ================================= */

            /*
               Since you want username kept
               during login, make sure the
               username typed matches the
               account returned by backend.
            */

            if (
                data.user?.username !==
                username.toLowerCase()
            ) {

                throw new Error(
                    "Username does not match this account."
                );
            }


            /* =================================
               SAVE REAL SESSION
               ================================= */

            localStorage.setItem(
                "wordtree_token",
                data.token
            );


            localStorage.setItem(
                "wordtree_user",
                JSON.stringify(
                    data.user
                )
            );


            console.log(
                "LOGIN SUCCESS:",
                data.user
            );


            window.location.href =
                "../homepage/homepage.html";

        }
        catch (error) {

            console.error(
                "LOGIN ERROR:",
                error
            );


            alert(
                error.message ||
                "Could not log in."
            );

        }
        finally {

            loginButton.disabled =
                false;


            loginButton.textContent =
                "LOGIN";
        }
    }
);


/* =========================================
   CREATE ACCOUNT BUTTON
   ========================================= */

const signupButton =
    document.getElementById("signupButton");


signupButton?.addEventListener(
    "click",
    async () => {

        const username =
            document
                .getElementById(
                    "username"
                )
                .value
                .trim();


        const email =
            document
                .getElementById(
                    "email"
                )
                .value
                .trim();


        const password =
            document
                .getElementById(
                    "password"
                )
                .value;


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
           REAL BACKEND REGISTRATION
           ===================================== */

        try {

            signupButton.disabled =
                true;


            signupButton.textContent =
                "CREATING...";


            const response =
                await fetch(
                    `${API_BASE_URL}/users/register`,
                    {
                        method:
                            "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                username,
                                email,
                                password
                            })
                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Registration failed."
                );
            }


            /* =================================
               SAVE SESSION
               ================================= */

            localStorage.setItem(
                "wordtree_token",
                data.token
            );


            localStorage.setItem(
                "wordtree_user",
                JSON.stringify(
                    data.user
                )
            );


            console.log(
                "ACCOUNT CREATED:",
                data.user
            );


            window.location.href =
                "../homepage/homepage.html";

        }
        catch (error) {

            console.error(
                "REGISTRATION ERROR:",
                error
            );


            alert(
                error.message ||
                "Could not create account."
            );

        }
        finally {

            signupButton.disabled =
                false;


            signupButton.textContent =
                "CREATE ACCOUNT";
        }
    }
);