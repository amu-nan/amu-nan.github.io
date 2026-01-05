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
    const backendBaseUrl = "http://127.0.0.1:8000";

    // --- GitHub Pages Configuration for Interactive Plots ---
    function getGitHubPagesBase() {
        // If in production (GitHub Pages), construct the base URL from current location
        if (window.location.hostname.includes('github.io')) {
            const pathParts = window.location.pathname.split('/').filter(p => p);
            const basePath = pathParts.slice(0, -2).join('/');
            return window.location.origin + (basePath ? '/' + basePath : '');
        }
        return '';
    }

    const githubPagesBase = getGitHubPagesBase();

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
                // Create a wrapper for the icon and the message content
                const messageWrapper = document.createElement('div');
                messageWrapper.classList.add('ria-message-content');
                
                // Create and append the icon image
                const iconImg = document.createElement('img');
                iconImg.src = RIA_ICON_SRC;
                iconImg.alt = 'Ria Icon';
                iconImg.classList.add('ria-message-icon');
                messageWrapper.appendChild(iconImg);
                
                // Create the text content container
                const textContent = document.createElement('div');
                textContent.style.width = '100%'; // Ensure full width for plots
                
                // Check if the message contains a PLOT_PATH
                if (text.includes('PLOT_PATH:')) {
                    // Process the message with inline plots
                    processMessageWithPlots(text, textContent);
                } else {
                    // Standard markdown parsing (no plots)
                    textContent.innerHTML = marked.parse(text);
                }
                
                // Handle existing plot images (keep your existing logic)
                const plotImages = textContent.querySelectorAll('img[src*="/plots/"]');
                plotImages.forEach(img => {
                    if (img.src.includes('/plots/') && !img.src.startsWith(backendBaseUrl)) {
                        const plotPath = img.src.split('/plots/')[1];
                        img.src = `${backendBaseUrl}/plots/${plotPath}`;
                    }
                    
                    img.onerror = function() {
                        console.error('Failed to load image:', this.src);
                        this.alt = 'Failed to load plot image';
                    };
                });
                
                messageWrapper.appendChild(textContent);
                messageDiv.appendChild(messageWrapper);
            } else {
                // For user messages, just add the text
                messageDiv.innerHTML = marked.parse(text);
            }
        }
        
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    // Function to process messages with inline plots
    function processMessageWithPlots(text, container) {
        // Split the text by PLOT_PATH markers
        const parts = text.split(/(PLOT_PATH:\/plots\/[^\s]+\.html)/g);
        
        parts.forEach((part, index) => {
            if (part.startsWith('PLOT_PATH:')) {
                // This is a plot path - create iframe
                const plotPath = part.replace('PLOT_PATH:', '').trim();
                const plotUrl = githubPagesBase ? `${githubPagesBase}${plotPath}` : plotPath;
                
                console.log('Loading plot from:', plotUrl);
                
                // Create plot container (inline with text)
                const plotContainer = document.createElement('div');
                plotContainer.classList.add('plot-container');
                
                // Add hint text
                const plotHint = document.createElement('p');
                plotHint.classList.add('plot-hint');
                plotHint.textContent = '📊 Interactive Business Intelligence View:';
                plotContainer.appendChild(plotHint);
                
                // Create iframe
                const iframe = document.createElement('iframe');
                iframe.src = plotUrl;
                iframe.width = '100%';
                iframe.height = '500px';
                iframe.frameBorder = '0';
                iframe.title = 'Business Plot';
                iframe.style.borderRadius = '8px';
                iframe.style.border = '1px solid #ddd';
                
                iframe.onload = function() {
                    console.log('Plot loaded successfully:', plotUrl);
                };
                
                iframe.onerror = function() {
                    console.error('Failed to load plot:', plotUrl);
                    plotContainer.innerHTML = `
                        <p style="color: #e74c3c; padding: 1rem; background: #fee; border-radius: 8px;">
                            ⚠️ Failed to load interactive plot. The plot may not be deployed yet.
                        </p>
                    `;
                };
                
                plotContainer.appendChild(iframe);
                
                // Add fullscreen link
                const fullscreenLink = document.createElement('a');
                fullscreenLink.href = plotUrl;
                fullscreenLink.target = '_blank';
                fullscreenLink.rel = 'noreferrer';
                fullscreenLink.classList.add('fullscreen-link');
                fullscreenLink.innerHTML = 'Open in New Tab ↗';
                plotContainer.appendChild(fullscreenLink);
                
                // Append plot to container
                container.appendChild(plotContainer);
                
            } else if (part.trim()) {
                // This is regular text - parse as markdown
                const textDiv = document.createElement('div');
                textDiv.innerHTML = marked.parse(part);
                container.appendChild(textDiv);
            }
        });
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
