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

    // Conversation array in backend format
    let chatHistoryArray = [];

    // --- Backend Endpoint Configuration ---
    const backendUrl = "http://127.0.0.1:8000/chat/manufacturing";

    // --- Chatbot Functions ---
    const RIA_ICON_SRC = '../../images/Ria-icon.png';

    function addMessage(sender, text, isTyping = false) {
        const chatHistory = document.getElementById('chat-history');
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ria-message');
    
        if (isTyping) {
            messageDiv.id = 'typing-indicator';
            messageDiv.innerHTML = `<div class="ria-message-content">
                                        <img src="${RIA_ICON_SRC}" alt="Ria Icon" class="ria-message-icon">
                                        <p class="loading-dots"><span></span><span></span><span></span></p>
                                    </div>`;
        } else {
            if (sender === 'ria') {
                const messageWrapper = document.createElement('div');
                messageWrapper.classList.add('ria-message-content');
                
                const iconImg = document.createElement('img');
                iconImg.src = RIA_ICON_SRC;
                iconImg.alt = 'Ria Icon';
                iconImg.classList.add('ria-message-icon');
                messageWrapper.appendChild(iconImg);
                
                const textContent = document.createElement('div');
                // Parse markdown (this will convert ![alt](url) to <img> tags)
                textContent.innerHTML = marked.parse(text);
                
                // Add error handling for plot images
                const plotImages = textContent.querySelectorAll('img[src*="/plots/"]');
                plotImages.forEach(img => {
                    img.onerror = function() {
                        console.error('Failed to load image:', this.src);
                        this.alt = 'Failed to load plot image';
                        this.style.border = '2px dashed #ccc';
                        this.style.padding = '20px';
                        this.style.textAlign = 'center';
                    };
                });
                
                messageWrapper.appendChild(textContent);
                messageDiv.appendChild(messageWrapper);
            } else {
                // For user messages
                messageDiv.innerHTML = marked.parse(text);
            }
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
            return data;
        } catch (error) {
            console.error("Error sending query:", error);
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
        sendButton.classList.remove('active'); // Remove pulse when sent

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
            console.error("Error fetching AI response:", error);
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
            addMessage('ria', "Sorry, I'm having trouble getting a response. Please try again.");
        }
    }

    // Add pulse effect to send button when typing
    userQueryInput.addEventListener('input', () => {
        if (userQueryInput.value.trim()) {
            sendButton.classList.add('active');
        } else {
            sendButton.classList.remove('active');
        }
    });

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

    // --- Initial greeting ---
    addMessage('ria', "Hello! I'm Ria. I'm ready to answer questions about your manufacturing data. How can I help?");
});
