console.log("demo_chatbot.js loaded");

document.addEventListener('DOMContentLoaded', () => {
    // --- Element references ---
    const userQueryInput = document.getElementById('userQueryInput');
    const sendButton = document.getElementById('sendButton');
    const chatHistory = document.getElementById('chat-history');
    const backButton = document.getElementById('backButton');
    const endDemoButton = document.getElementById('endDemoButton');
    const ownerDisplay = document.getElementById('owner-display');
    const orgDisplay = document.getElementById('org-display');

    // Conversation array in backend format
    const chatHistoryArray = [];

    // --- Display owner/org from local storage ---
    const ownerName = localStorage.getItem('ownerName');
    const orgName = localStorage.getItem('orgName');

    if (ownerName && orgName) {
        ownerDisplay.textContent = ownerName;
        orgDisplay.textContent = orgName;
    } else {
        window.location.href = 'owner.html';
    }

    // --- Chatbot Functions ---
    function addMessage(sender, text, isTyping = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ria-message');
        
        // Check if the message is a typing indicator
        if (isTyping) {
            // Add a unique ID for easy removal
            messageDiv.id = 'typing-indicator'; 
            messageDiv.innerHTML = `<p class="loading-dots"><span></span><span></span><span></span></p>`;
        } else {
            const paragraph = document.createElement('p');
            paragraph.textContent = text;
            messageDiv.appendChild(paragraph);
        }

        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        // Only add to conversation array if it's not a temporary typing message
        if (!isTyping) {
            chatHistoryArray.push({
                role: sender === 'user' ? 'user' : 'assistant',
                content: text
            });
        }
    }

    async function sendQueryToBackend(query) {
        const backendUrl = "http://127.0.0.1:8000/chat/demo";

        try {
            const response = await fetch(backendUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    query: query,
                    conversation_history: chatHistoryArray
                }),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("Backend error response:", text);
                throw new Error(`HTTP ${response.status}`);
            }

            const data = await response.json();
            return data.response;
        } catch (error) {
            console.error("Error sending query:", error);
            return "Sorry, I'm having trouble connecting right now. Please try again later.";
        }
    }

    async function sendQuery() {
        const userQuery = userQueryInput.value.trim();
        if (!userQuery) return;

        // 1. Add user's message
        addMessage('user', userQuery);
        userQueryInput.value = '';

        // 2. Add the temporary typing indicator message
        addMessage('ria', null, true); // The `null` is a placeholder for the text

        try {
            // 3. Wait for the backend response
            const aiResponse = await sendQueryToBackend(userQuery);

            // 4. Find and remove the typing indicator
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }

            // 5. Add the actual AI response message
            addMessage('ria', aiResponse);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            // In case of an error, also remove the typing indicator
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            // Add a fallback error message
            addMessage('ria', "Sorry, I'm having trouble getting a response. Please try again.");
        }
    }

    // --- Event listeners ---
    sendButton.addEventListener('click', sendQuery);

    userQueryInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendQuery();
        }
    });

    if (backButton) backButton.addEventListener('click', () => history.back());
    if (endDemoButton) endDemoButton.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../index.html';
    });

    // --- Initial greeting ---
    addMessage('ria', "Hello! I'm Ria. I'm ready to answer your questions about the patient data. How can I help?");
});
