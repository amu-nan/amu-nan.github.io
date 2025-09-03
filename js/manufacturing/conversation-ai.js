document.addEventListener('DOMContentLoaded', () => {
    // --- Element references ---
    const userQueryInput = document.getElementById('userQueryInput');
    const sendButton = document.getElementById('sendButton');
    const chatHistory = document.getElementById('chat-history');
    const backButton = document.getElementById('backButton');
    const endDemoButton = document.getElementById('endDemoButton');

    // Conversation array in backend format
    const chatHistoryArray = [];

    // --- Backend Endpoint Configuration ---
    // Corrected URL to match the backend's /chat/manufacturing endpoint.
    const backendUrl = "http://127.0.0.1:8000/chat/manufacturing";

    // --- Chatbot Functions ---
    function addMessage(sender, text, isTyping = false) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ria-message');
        
        if (isTyping) {
            messageDiv.id = 'typing-indicator'; 
            messageDiv.innerHTML = `<p class="loading-dots"><span></span><span></span><span></span></p>`;
        } else {
            const paragraph = document.createElement('p');
            paragraph.textContent = text;
            messageDiv.appendChild(paragraph);
        }

        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;

        if (!isTyping) {
            chatHistoryArray.push({
                role: sender === 'user' ? 'user' : 'assistant',
                content: text
            });
        }
    }

    async function sendQueryToBackend(query) {
        // --- Real API Integration (Now Active) ---
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

        addMessage('user', userQuery);
        userQueryInput.value = '';

        addMessage('ria', null, true);

        try {
            const aiResponse = await sendQueryToBackend(userQuery);

            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }

            addMessage('ria', aiResponse);
        } catch (error) {
            console.error("Error fetching AI response:", error);
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
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

    backButton.addEventListener('click', (event) => {
        event.preventDefault();
        history.back();
    });

    endDemoButton.addEventListener('click', (event) => {
        event.preventDefault();
        window.location.href = '../../index.html';
    });

    // --- Initial greeting ---
    addMessage('ria', "Hello! I'm Ria. I'm ready to answer questions about the consolidated manufacturing data. How can I help?");
});
