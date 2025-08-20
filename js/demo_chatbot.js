console.log("demo_chatbot.js loaded");
document.addEventListener('DOMContentLoaded', () => {
    // --- Element references ---
    const userQueryInput = document.getElementById('user-query');
    const sendButton = document.getElementById('send-btn');
    const chatHistory = document.getElementById('chat-history');
    const backButton = document.querySelector('.back-btn');
    const endDemoButton = document.querySelector('.end-demo-btn');
    
    // Conversation array in backend format
    const chatHistoryArray = [];

    // --- Display owner/org from local storage ---
    const ownerName = localStorage.getItem('ownerName');
    const orgName = localStorage.getItem('orgName');

    if (ownerName && orgName) {
        document.getElementById('owner-display').textContent = ownerName;
        document.getElementById('org-display').textContent = orgName;
    } else {
        window.location.href = 'owner.html';
    }

    // --- Chatbot Functions ---
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ria-message');

        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        messageDiv.appendChild(paragraph);
        chatHistory.appendChild(messageDiv);

        // Auto-scroll
        chatHistory.scrollTop = chatHistory.scrollHeight;

        chatHistoryArray.push({
            role: sender === 'user' ? 'user' : 'assistant',
            content: text
        });
    }

    async function sendQueryToBackend(query) {
        // This URL should point to your FastAPI chatbot endpoint
        const backendUrl = "http://127.0.0.1:8000/chat";

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

        const aiResponse = await sendQueryToBackend(userQuery);
        addMessage('ria', aiResponse);
    }

    sendButton.addEventListener('click', sendQuery);

    userQueryInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            sendQuery();
        }
    });

    // --- Go Back & End Demo Buttons ---
    if (backButton) backButton.addEventListener('click', () => history.back());
    if (endDemoButton) endDemoButton.addEventListener('click', () => {
        localStorage.clear();
        window.location.href = '../index.html';
    });

    // --- Initial greeting ---
    addMessage('ria', "Hello! I'm Ria. I'm ready to answer your questions about the patient data. How can I help?");
});
