/* =========================================
   WORD TREE - INBOX + CHAT
   ========================================= */


/* =========================================
   SERVER
   ========================================= */

const API_BASE_URL =
    "https://cuddly-parakeet-q75547g7rq724rrp-8010.app.github.dev/proxy";

const SOCKET_BASE_URL =
    "https://cuddly-parakeet-q75547g7rq724rrp-3000.app.github.dev";


/* =========================================
   LOGGED IN USER
   ========================================= */

const storedUser = localStorage.getItem("wordtree_user");

if (!storedUser) {
    alert("You must log in first.");
    window.location.href = "../../login/login.html";

    throw new Error("No logged-in user.");
}

const currentUser = JSON.parse(storedUser);
const CURRENT_USER_ID = String(currentUser.id);


/* =========================================
   STATE
   ========================================= */

let users = [];
let selectedUser = null;
let socketRegistered = false;


/* =========================================
   ELEMENTS
   ========================================= */

const backButton =
    document.getElementById("backButton");

const searchUsers =
    document.getElementById("searchUsers");

const peopleList =
    document.getElementById("peopleList");

const noChatSelected =
    document.getElementById("noChatSelected");

const activeChat =
    document.getElementById("activeChat");

const chatUserName =
    document.getElementById("chatUserName");

const chatUserStatus =
    document.getElementById("chatUserStatus");

const chatMessages =
    document.getElementById("chatMessages");

const messageInput =
    document.getElementById("messageInput");

const sendMessageButton =
    document.getElementById("sendMessage");


/* =========================================
   BACK BUTTON
   ========================================= */

backButton?.addEventListener("click", () => {
    window.location.href =
        "../../homepage/homepage.html";
});


/* =========================================
   SOCKET
   ========================================= */

const socket = io(SOCKET_BASE_URL, {
    transports: [
        "websocket",
        "polling"
    ]
});


socket.on("connect", () => {
    console.log(
        "Socket connected:",
        socket.id
    );

    socket.emit(
        "register",
        {
            userId:
                CURRENT_USER_ID
        },
        response => {
            if (!response?.success) {
                console.error(
                    "Socket registration failed:",
                    response
                );

                return;
            }

            socketRegistered = true;

            console.log(
                "Registered as:",
                CURRENT_USER_ID
            );
        }
    );
});


socket.on("disconnect", () => {
    socketRegistered = false;
});


socket.on("connect_error", error => {
    console.error(
        "Socket error:",
        error
    );
});


/* =========================================
   RECEIVE LIVE MESSAGE
   ========================================= */

socket.on("receiveMessage", message => {
    console.log(
        "Received message:",
        message
    );

    /*
       If the message belongs to the chat
       currently open on the right side,
       display it immediately.
    */

    if (
        selectedUser &&
        String(message.senderId) ===
        String(selectedUser.id)
    ) {
        addMessageToScreen(
            message,
            "incoming"
        );
    }

    /*
       Update the person in the pal list
       so they can be moved/highlighted later
       if you want unread messages.
    */

    updateUserPreview(
        message.senderId,
        getMessageText(message)
    );
});


/* =========================================
   LOAD PEOPLE FROM DATABASE
   ========================================= */

async function loadUsers() {
    peopleList.innerHTML = `
        <div class="empty-users">
            LOADING USERS...
        </div>
    `;

    try {
        const response =
            await fetch(
                `${API_BASE_URL}/users`
            );

        if (!response.ok) {
            throw new Error(
                `Could not load users: ${response.status}`
            );
        }

        const data =
            await response.json();

        /*
           Remove logged-in user from
           their own pal list.
        */

        users = data.filter(user =>
            String(user.id) !==
            CURRENT_USER_ID
        );

        renderUsers(users);

    } catch (error) {
        console.error(
            "User loading error:",
            error
        );

        peopleList.innerHTML = `
            <div class="empty-users">
                COULD NOT LOAD USERS
            </div>
        `;
    }
}


/* =========================================
   DISPLAY PEOPLE
   ========================================= */

function renderUsers(userList) {
    peopleList.innerHTML = "";

    if (userList.length === 0) {
        peopleList.innerHTML = `
            <div class="empty-users">
                NO OTHER USERS FOUND
            </div>
        `;

        return;
    }

    userList.forEach(user => {
        const button =
            document.createElement("button");

        button.type = "button";
        button.className = "person-item";

        button.dataset.userId =
            String(user.id);

        button.innerHTML = `
            

            <div class="person-info">

                <strong>
                    ${escapeHtml(user.username)}
                </strong>

                <span class="person-preview">
                    Click to chat
                </span>

            </div>
        `;

        /*
           IMPORTANT:
           NO PAGE REDIRECT.

           Clicking a person opens their
           conversation on the RIGHT.
        */

        button.addEventListener(
            "click",
            () => {
                openConversation(user);
            }
        );

        peopleList.appendChild(
            button
        );
    });

    highlightSelectedUser();
}


/* =========================================
   SEARCH PEOPLE
   ========================================= */

searchUsers?.addEventListener(
    "input",
    () => {
        const value =
            searchUsers.value
                .trim()
                .toLowerCase();

        const filtered =
            users.filter(user =>
                user.username
                    ?.toLowerCase()
                    .includes(value)
            );

        renderUsers(filtered);
    }
);


/* =========================================
   OPEN CHAT ON RIGHT SIDE
   ========================================= */

async function openConversation(user) {
    selectedUser = user;

    /*
       Hide "select someone" screen.
    */

    if (noChatSelected) {
        noChatSelected.hidden = true;
    }

    /*
       Show chat panel.
    */

    if (activeChat) {
        activeChat.hidden = false;
    }

    /*
       Change chat header.
    */

    if (chatUserName) {
        chatUserName.textContent =
            user.username;
    }

    if (chatUserStatus) {
        chatUserStatus.textContent =
            "CONVERSATION";
    }

    /*
       Keep pal list visible and highlight
       the selected user.
    */

    highlightSelectedUser();

    /*
       Load messages between YOU and
       selected person.
    */

    await loadConversation();

    messageInput?.focus();
}


/* =========================================
   HIGHLIGHT SELECTED PERSON
   ========================================= */

function highlightSelectedUser() {
    document
        .querySelectorAll(".person-item")
        .forEach(item => {
            item.classList.remove("active");

            if (
                selectedUser &&
                String(item.dataset.userId) ===
                String(selectedUser.id)
            ) {
                item.classList.add("active");
            }
        });
}


/* =========================================
   LOAD CHAT HISTORY
   ========================================= */

async function loadConversation() {
    if (!selectedUser) {
        return;
    }

    /*
       Save the ID we started loading.

       This prevents a slow request from Alice
       replacing Bob's chat if the user clicks
       Bob before Alice finishes loading.
    */

    const requestedUserId =
        String(selectedUser.id);

    chatMessages.innerHTML = `
        <div class="empty-chat">
            LOADING...
        </div>
    `;

    try {
        const response =
            await fetch(
                `${API_BASE_URL}/words/conversation/${encodeURIComponent(
                    CURRENT_USER_ID
                )}/${encodeURIComponent(
                    requestedUserId
                )}`
            );

        if (!response.ok) {
            throw new Error(
                `Could not load messages: ${response.status}`
            );
        }

        const messages =
            await response.json();

        /*
           User may have switched chats
           while fetch was running.
        */

        if (
            !selectedUser ||
            String(selectedUser.id) !==
            requestedUserId
        ) {
            return;
        }

        chatMessages.innerHTML = "";

        if (messages.length === 0) {
            showEmptyChat();
            return;
        }

        messages.forEach(message => {
            const type =
                String(message.senderId) ===
                CURRENT_USER_ID
                    ? "outgoing"
                    : "incoming";

            addMessageToScreen(
                message,
                type
            );
        });

    } catch (error) {
        console.error(
            "Message history error:",
            error
        );

        if (
            selectedUser &&
            String(selectedUser.id) ===
            requestedUserId
        ) {
            chatMessages.innerHTML = `
                <div class="empty-chat">
                    COULD NOT LOAD MESSAGES
                </div>
            `;
        }
    }
}


/* =========================================
   EMPTY CHAT
   ========================================= */

function showEmptyChat() {
    chatMessages.innerHTML = `
        <div class="empty-chat">

            <div class="empty-chat-icon">
                💬
            </div>

            <h2>
                START YOUR CONVERSATION
            </h2>

            <p>
                Send the first message.
            </p>

        </div>
    `;
}


/* =========================================
   SEND BUTTON
   ========================================= */

sendMessageButton?.addEventListener(
    "click",
    sendCurrentMessage
);


/* =========================================
   ENTER TO SEND
   ========================================= */

messageInput?.addEventListener(
    "keydown",
    event => {
        if (
            event.key === "Enter" &&
            !event.shiftKey
        ) {
            event.preventDefault();

            sendCurrentMessage();
        }
    }
);


/* =========================================
   SEND MESSAGE
   ========================================= */

async function sendCurrentMessage() {
    if (!selectedUser) {
        alert(
            "Select someone first."
        );

        return;
    }

    if (!socketRegistered) {
        alert(
            "Chat is still connecting."
        );

        return;
    }

    const text =
        messageInput.value.trim();

    if (!text) {
        return;
    }

    const receiver =
        selectedUser;

    sendMessageButton.disabled = true;

    try {
        const components =
            await buildMessageComponents(
                text
            );

        socket.emit(
            "sendMessage",
            {
                receiverId:
                    String(receiver.id),

                components
            },
            response => {
                sendMessageButton.disabled =
                    false;

                if (!response?.success) {
                    alert(
                        response?.message ||
                        "Could not send message."
                    );

                    return;
                }

                /*
                   Only display it if we're
                   still looking at the same chat.
                */

                if (
                    selectedUser &&
                    String(selectedUser.id) ===
                    String(receiver.id)
                ) {
                    addMessageToScreen(
                        response.message,
                        "outgoing"
                    );

                    messageInput.value = "";
                    messageInput.focus();
                }

                updateUserPreview(
                    receiver.id,
                    getMessageText(
                        response.message
                    )
                );
            }
        );

    } catch (error) {
        sendMessageButton.disabled =
            false;

        console.error(
            "Send error:",
            error
        );

        alert(error.message);
    }
}


/* =========================================
   TURN TEXT INTO WORD-TREE COMPONENTS
   ========================================= */

async function buildMessageComponents(text) {
    const words =
        text.match(
            /[\p{L}\p{N}'’-]+/gu
        ) || [];

    if (words.length === 0) {
        throw new Error(
            "Please enter a message."
        );
    }

    const components = [];
    const missingWords = [];

    for (const word of words) {
        try {
            let response =
                await fetch(
                    `${API_BASE_URL}/words/${encodeURIComponent(
                        word
                    )}`
                );

            /*
               Try lowercase too in case
               the backend lookup is case-sensitive.
            */

            if (
                !response.ok &&
                word !== word.toLowerCase()
            ) {
                response =
                    await fetch(
                        `${API_BASE_URL}/words/${encodeURIComponent(
                            word.toLowerCase()
                        )}`
                    );
            }

            if (!response.ok) {
                missingWords.push(word);
                continue;
            }

            const group =
                await response.json();

            const translation =
                group.translations?.find(
                    translation =>
                        translation.words?.some(
                            storedWord =>
                                storedWord
                                    .toLowerCase() ===
                                word.toLowerCase()
                        )
                );

            if (!translation) {
                missingWords.push(word);
                continue;
            }

            const selectedWord =
                translation.words.find(
                    storedWord =>
                        storedWord
                            .toLowerCase() ===
                        word.toLowerCase()
                ) || word;

            components.push({
                wordGroupId:
                    String(group._id),

                selectedWord,

                language:
                    translation.language
            });

        } catch (error) {
            console.error(
                `Word lookup failed for "${word}":`,
                error
            );

            missingWords.push(word);
        }
    }

    if (missingWords.length > 0) {
        throw new Error(
            `These words are not in Word Tree yet: ${missingWords.join(", ")}`
        );
    }

    return components;
}


/* =========================================
   MESSAGE -> NORMAL TEXT
   ========================================= */

function getMessageText(message) {
    if (
        !Array.isArray(
            message.components
        )
    ) {
        return "";
    }

    return message.components
        .map(component =>
            component.selectedWord
        )
        .join(" ");
}


/* =========================================
   DISPLAY MESSAGE
   ========================================= */

function addMessageToScreen(
    message,
    type
) {
    chatMessages
        .querySelector(".empty-chat")
        ?.remove();

    const element =
        document.createElement("div");

    element.className =
        type === "outgoing"
            ? "message message-outgoing"
            : "message message-incoming";

    const text =
        document.createElement("p");

    text.textContent =
        getMessageText(message);

    const timestamp =
        document.createElement("span");

    timestamp.textContent =
        formatTimestamp(
            message.createdAt
        );

    element.appendChild(text);
    element.appendChild(timestamp);

    chatMessages.appendChild(
        element
    );

    chatMessages.scrollTop =
        chatMessages.scrollHeight;
}


/* =========================================
   PAL LIST LAST MESSAGE
   ========================================= */

function updateUserPreview(
    userId,
    messageText
) {
    const person =
        document.querySelector(
            `.person-item[data-user-id="${CSS.escape(
                String(userId)
            )}"]`
        );

    if (!person) {
        return;
    }

    const preview =
        person.querySelector(
            ".person-preview"
        );

    if (preview) {
        preview.textContent =
            messageText || "Message";
    }
}


/* =========================================
   TIME
   ========================================= */

function formatTimestamp(timestamp) {
    if (!timestamp) {
        return "";
    }

    return new Date(
        timestamp
    ).toLocaleTimeString(
        [],
        {
            hour:
                "2-digit",

            minute:
                "2-digit"
        }
    );
}


/* =========================================
   HTML SAFETY
   ========================================= */

function escapeHtml(value) {
    return String(value || "")
        .replaceAll(
            "&",
            "&amp;"
        )
        .replaceAll(
            "<",
            "&lt;"
        )
        .replaceAll(
            ">",
            "&gt;"
        )
        .replaceAll(
            '"',
            "&quot;"
        )
        .replaceAll(
            "'",
            "&#039;"
        );
}


/* =========================================
   START
   ========================================= */

loadUsers();

console.log(
    "Word Tree inbox + chat loaded."
);