/* =========================================
   WORD TREE - INBOX
   FRONTEND ONLY
   ========================================= */

const backButton = document.getElementById("backButton");

if (backButton) {
    backButton.addEventListener("click", () => {
        window.location.href = "../../homepage/homepage.html";
    });
}

/* SEARCH */

const searchInput = document.getElementById("searchUsers");

if (searchInput) {
    searchInput.addEventListener("input", () => {
        const searchValue = searchInput.value.trim().toLowerCase();

        /*
         * BACKEND TODO:
         * Filter loaded conversations by username.
         */

        console.log("Inbox search:", searchValue);
    });
}

/* FIND A PAL */

const newPalButton = document.getElementById("newPalButton");

if (newPalButton) {
    newPalButton.addEventListener("click", () => {

        /*
         * BACKEND TODO:
         * Connect to the language-pal matching system.
         */

        console.log("BACKEND TODO: Find a language pal");
    });
}

/* CONVERSATION DATA */

/*
 * BACKEND TODO:
 *
 * The backend will provide:
 *
 * USER_ID
 * USER_NAME
 * USER_PROFILE_IMAGE
 * LAST_MESSAGE
 * MESSAGE_TIMESTAMP
 * UNREAD_COUNT
 * ONLINE_STATUS
 *
 * Example:
 *
 * {
 *     userId: "USER_ID",
 *     username: "USER_NAME",
 *     profileImage: "USER_PROFILE_IMAGE",
 *     lastMessage: "LAST_MESSAGE",
 *     timestamp: "MESSAGE_TIMESTAMP",
 *     unreadCount: "UNREAD_COUNT",
 *     online: "ONLINE_STATUS"
 * }
 */

/* OPEN CONVERSATION */

function openConversation(userId) {

    console.log("Open conversation:", userId);

    /*
     * BACKEND TODO:
     * Pass the selected user's ID to the chat screen.
     */

    window.location.href = "../chat/chat.html";
}

/* LOAD CONVERSATIONS */

function loadConversations() {

    /*
     * BACKEND TODO:
     *
     * Fetch the user's conversations.
     *
     * Future endpoint:
     *
     * GET /api/conversations
     *
     * Then populate:
     *
     * #conversationList
     */

    console.log("BACKEND TODO: Load user conversations");
}

/* INITIALIZE */

loadConversations();