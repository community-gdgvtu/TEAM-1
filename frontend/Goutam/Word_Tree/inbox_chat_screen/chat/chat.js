/* =========================================
   WORD TREE - CHAT SCREEN
   FRONTEND ONLY
   ========================================= */

/* BACK TO INBOX */

const backToInbox = document.getElementById("backToInbox");

if (backToInbox) {
    backToInbox.addEventListener("click", () => {
        window.location.href = "../inbox/inbox.html";
    });
}

/* MESSAGE ELEMENTS */

const messageInput = document.getElementById("messageInput");
const sendMessage = document.getElementById("sendMessage");
const chatMessages = document.getElementById("chatMessages");

/* SEND MESSAGE */

if (sendMessage) {
    sendMessage.addEventListener("click", sendCurrentMessage);
}

/* ENTER TO SEND */

if (messageInput) {
    messageInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendCurrentMessage();
        }
    });
}

/* SEND CURRENT MESSAGE */

function sendCurrentMessage() {
    if (!messageInput) {
        return;
    }

    const message = messageInput.value.trim();

    if (message === "") {
        return;
    }

    /*
     * BACKEND TODO:
     * Send message to backend.
     *
     * Backend will handle:
     * - User ID
     * - Recipient ID
     * - Message storage
     * - Timestamp
     * - Delivery status
     * - Read status
     */

    console.log("BACKEND TODO: Send message:", message);

    /* TEMPORARY FRONTEND PREVIEW */

    addTemporaryMessage(message, "outgoing");

    messageInput.value = "";
}

/* TEMPORARY MESSAGE DISPLAY */

function addTemporaryMessage(message, type) {
    if (!chatMessages) {
        return;
    }

    const emptyChat = chatMessages.querySelector(".empty-chat");

    if (emptyChat) {
        emptyChat.remove();
    }

    const messageElement = document.createElement("div");
    messageElement.classList.add("message");

    if (type === "incoming") {
        messageElement.classList.add("message-incoming");
    } else {
        messageElement.classList.add("message-outgoing");
    }

    const messageText = document.createElement("p");
    messageText.textContent = message;

    const timestamp = document.createElement("span");
    timestamp.textContent = "MESSAGE_TIMESTAMP";

    messageElement.appendChild(messageText);
    messageElement.appendChild(timestamp);

    chatMessages.appendChild(messageElement);

    chatMessages.scrollTop = chatMessages.scrollHeight;
}

/* MORE OPTIONS */

const chatMoreButton = document.getElementById("chatMoreButton");
const chatOptions = document.getElementById("chatOptions");

if (chatMoreButton && chatOptions) {
    chatMoreButton.addEventListener("click", (event) => {
        event.stopPropagation();
        chatOptions.classList.toggle("active");
    });
}

/* CLOSE OPTIONS */

document.addEventListener("click", (event) => {
    if (
        chatOptions &&
        chatMoreButton &&
        !chatOptions.contains(event.target) &&
        !chatMoreButton.contains(event.target)
    ) {
        chatOptions.classList.remove("active");
    }
});

/* VIEW PROFILE */

const viewProfile = document.getElementById("viewProfile");

if (viewProfile) {
    viewProfile.addEventListener("click", () => {
        /*
         * BACKEND TODO:
         * Open selected user's profile.
         */

        console.log("BACKEND TODO: View user profile");

        chatOptions.classList.remove("active");
    });
}

/* REPORT USER */

const reportUser = document.getElementById("reportUser");

if (reportUser) {
    reportUser.addEventListener("click", () => {
        /*
         * BACKEND TODO:
         * Connect to moderation/reporting system.
         */

        console.log("BACKEND TODO: Report user");

        chatOptions.classList.remove("active");
    });
}

/* BLOCK USER */

const blockUser = document.getElementById("blockUser");

if (blockUser) {
    blockUser.addEventListener("click", () => {
        /*
         * BACKEND TODO:
         * Connect to user blocking system.
         */

        console.log("BACKEND TODO: Block user");

        chatOptions.classList.remove("active");
    });
}

/* ATTACHMENT BUTTON */

const attachmentButton = document.getElementById("attachmentButton");

if (attachmentButton) {
    attachmentButton.addEventListener("click", () => {
        /*
         * BACKEND TODO:
         * Implement file/image sharing.
         */

        console.log("BACKEND TODO: Attach file");
    });
}

/* BACKEND INTEGRATION NOTES */

/*
 * Backend should eventually provide:
 *
 * CURRENT_USER_ID
 * CURRENT_USER_NAME
 * CURRENT_USER_PROFILE_IMAGE
 *
 * RECIPIENT_ID
 * RECIPIENT_NAME
 * RECIPIENT_PROFILE_IMAGE
 * RECIPIENT_ONLINE_STATUS
 *
 * MESSAGE_ID
 * MESSAGE_CONTENT
 * MESSAGE_TIMESTAMP
 * MESSAGE_SENDER_ID
 * MESSAGE_READ_STATUS
 *
 * Backend can populate:
 *
 * #chatUserName
 * #chatUserImage
 * #chatUserStatus
 * #chatMessages
 *
 * and handle sending through:
 *
 * sendCurrentMessage()
 */

/* READY */

console.log("Word Tree chat screen loaded.");