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
    // Use this URL for the local demo backend provided by the team.
    // const backendUrl = "http://127.0.0.1:8000/chat";

    // When the real backend is ready, use this commented-out URL instead.
    const liveBackendUrl = 'YOUR_LIVE_LLM_ENDPOINT_HERE';

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
        // --- Demo Simulation (Active for now) ---
        // Once the backend is ready, comment out this block and uncomment the API call below.
        return new Promise(resolve => {
            setTimeout(() => {
                const cannedResponses = [
                    "Based on the consolidated documents, the total number of work orders for Q3 was 450.",
                    "I can confirm that the 'Customer_data.xlsx' file contains information for 52 new clients.",
                    "The CAD file for the 'XYZ-Model' shows a material spec of 6061-T6 aluminum, with a tolerance of +/- 0.05mm.",
                    "The primary bottleneck identified in the latest production report is the assembly line, which saw an 8% increase in downtime last month.",
                    "Our analysis of the CRM data suggests a 15% increase in lead conversion rate from the Midwest region."
                ];
                const randomIndex = Math.floor(Math.random() * cannedResponses.length);
                resolve(cannedResponses[randomIndex]);
            }, 2000); // 2-second typing delay
        });

        // --- Real API Integration (Commented out for now) ---
        /*
        try {
            const response = await fetch(liveBackendUrl, {
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
        */
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

    if (backButton) backButton.addEventListener('click', () => history.back());
    if (endDemoButton) endDemoButton.addEventListener('click', () => {
        // Clear local storage if needed, or redirect.
        // localStorage.clear();
        window.location.href = '../../index.html';
    });

    // --- Initial greeting ---
    addMessage('ria', "Hello! I'm Ria. I'm ready to answer questions about the consolidated manufacturing data. How can I help?");
});
