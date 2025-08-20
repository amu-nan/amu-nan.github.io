document.addEventListener('DOMContentLoaded', () => {
    const ownerDisplay = document.getElementById('owner-display');
    const orgDisplay = document.getElementById('org-display');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const uploadSubmitBtn = document.getElementById('upload-submit-btn');
    const actionButtonsContainer = document.querySelector('.action-buttons-container');
    const sendButton = document.getElementById('sendButton');
    const userQueryInput = document.getElementById('userQueryInput');
    const chatHistory = document.getElementById('chatHistory');
    const backButton = document.getElementById('backButton');
    const endDemoButton = document.getElementById('endDemoButton');

    // Conversation array in the format backend expects
    const chatHistoryArray = [];

    // Display owner/org from local storage
    const ownerName = localStorage.getItem('ownerName');
    const orgName = localStorage.getItem('orgName');

    if (ownerName && orgName) {
        ownerDisplay.textContent = ownerName;
        orgDisplay.textContent = orgName;
    } else {
        window.location.href = 'owner.html';
    }

    // --- Chatbot function ---
    async function sendQueryToBackend(query) {
        const backendUrl = "http://127.0.0.1:8000/chat";

        try {
            const response = await fetch(backendUrl, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    query: query,
                    conversation_history: chatHistoryArray
                }),
            });

            console.log("Response status:", response.status, response.statusText);

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`HTTP ${response.status}: ${text}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error("Error sending query:", error);
            return "Sorry, I'm having trouble connecting right now. Please try again later.";
        }
    }

    // --- Function to add a message to the chat ---
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ria-message');

        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        messageDiv.appendChild(paragraph);
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Push to conversation array in backend format
        chatHistoryArray.push({
            role: sender === 'user' ? 'user' : 'assistant',
            content: text
        });
    }

    // --- Handle user input ---
    sendButton.addEventListener('click', async () => {
        const userQuery = userQueryInput.value.trim();
        if (userQuery) {
            addMessage('user', userQuery);
            userQueryInput.value = '';

            const aiResponse = await sendQueryToBackend(userQuery);
            addMessage('ria', aiResponse);
        }
    });

    userQueryInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') sendButton.click();
    });

    // --- Go Back & End Demo buttons ---
    if (backButton) backButton.addEventListener('click', () => history.back());
    if (endDemoButton) endDemoButton.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../index.html';
    });

    // --- Initial greeting ---
    addMessage('ria', "Hello! I'm Ria. I'm ready to answer your questions about the patient data. How can I help?");

});

