document.addEventListener('DOMContentLoaded', () => {
    // --- Get company name from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get('company');

    if (companyName) {
        document.getElementById('companyNameDisplay').textContent = `${companyName}'s`;
    }

    // --- Element references ---
    const userQueryInput = document.getElementById('userQueryInput');
    const sendButton = document.getElementById('sendButton');
    const chatHistory = document.getElementById('chat-history');
    const backButton = document.getElementById('backButton');
    const endDemoButton = document.getElementById('endDemoButton');

    // Conversation array in backend format
    let chatHistoryArray = [];

    // --- Backend Endpoint Configuration ---
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
            messageDiv.innerHTML = marked.parse(text);
        }

        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    async function sendQueryToBackend(query) {
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
            console.log("Backend response for subsequent queries:", data);
            return data;
        } catch (error) {
            console.error("Error sending query:", error);
            // Return a structured object with a default response and empty history
            return {
                response: "Sorry, I'm having trouble connecting right now. Please try again later.",
                conversation_history: []
            };
        }
    }

    async function sendQuery() {
        const userQuery = userQueryInput.value.trim();
        if (!userQuery) return;

        addMessage('user', userQuery);
        userQueryInput.value = '';

        addMessage('ria', null, true);

        try {
            const backendResponse = await sendQueryToBackend(userQuery);

            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }

            const aiResponseText = backendResponse.response;
            chatHistoryArray = backendResponse.conversation_history;

            addMessage('ria', aiResponseText);
        } catch (error) {
            console.log("Error fetching AI response:", error);
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
