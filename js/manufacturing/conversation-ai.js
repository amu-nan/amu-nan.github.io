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

    // --- Chatbot Functions ---
    const RIA_ICON_SRC = '../../images/Ria-icon.png'; 
    
    // Function to check if a string contains valid Plotly JSON
    function isPlotlyJson(str) {
        try {
            const json = JSON.parse(str);
            return json.data && json.layout;
        } catch (e) {
            return false;
        }
    }

    // Function to extract Plotly JSON from text
    function extractPlotlyJson(text) {
        const jsonMatch = text.match(/\{[\s\S]*"data"[\s\S]*"layout"[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const json = JSON.parse(jsonMatch[0]);
                if (json.data && json.layout) {
                    return {
                        json: json,
                        textBefore: text.substring(0, jsonMatch.index).trim(),
                        textAfter: text.substring(jsonMatch.index + jsonMatch[0].length).trim()
                    };
                }
            } catch (e) {
                console.error('Failed to parse extracted JSON:', e);
            }
        }
        return null;
    }

    // Function to wrap tables in scroll containers
    function wrapTablesInScrollContainers(container) {
        const tables = container.querySelectorAll('table');
        tables.forEach(table => {
            // Skip if already wrapped
            if (table.parentElement.classList.contains('table-wrapper')) {
                return;
            }
            
            // Create wrapper
            const wrapper = document.createElement('div');
            wrapper.classList.add('table-wrapper');
            
            // Wrap the table
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
            
            // Add scroll event listener to hide the scroll hint
            wrapper.addEventListener('scroll', function() {
                if (this.scrollLeft > 10) {
                    this.classList.add('scrolled');
                }
            });
        });
    }

    // Function to add fullscreen capability to plots
    function makePlotExpandable(plotContainer, plotId) {
        // Create expand button
        const expandBtn = document.createElement('button');
        expandBtn.classList.add('plot-expand-btn');
        expandBtn.innerHTML = '⛶ Fullscreen';
        expandBtn.title = 'View plot in fullscreen';
        
        // Add button to plot container
        const plotDiv = plotContainer.querySelector('.plotly-chart');
        plotDiv.style.position = 'relative';
        plotDiv.appendChild(expandBtn);
        
        // Handle expand
        expandBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openPlotFullscreen(plotId);
        });
    }

    // Function to open plot in fullscreen
    function openPlotFullscreen(plotId) {
        // Create fullscreen overlay
        const overlay = document.createElement('div');
        overlay.classList.add('plot-fullscreen-overlay', 'active');
        
        const content = document.createElement('div');
        content.classList.add('plot-fullscreen-content');
        
        // Close button
        const closeBtn = document.createElement('button');
        closeBtn.classList.add('plot-fullscreen-close');
        closeBtn.innerHTML = '×';
        closeBtn.title = 'Close fullscreen';
        
        // Create fullscreen plot container
        const fullscreenPlotId = 'fullscreen-' + plotId;
        const fullscreenPlot = document.createElement('div');
        fullscreenPlot.id = fullscreenPlotId;
        fullscreenPlot.style.width = '100%';
        fullscreenPlot.style.height = '100%';
        
        content.appendChild(closeBtn);
        content.appendChild(fullscreenPlot);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        // Get original plot data
        const originalPlot = document.getElementById(plotId);
        if (originalPlot && originalPlot.data && originalPlot.layout) {
            // Clone the plot to fullscreen
            Plotly.newPlot(fullscreenPlotId, originalPlot.data, originalPlot.layout, {
                responsive: true,
                displayModeBar: true,
                displaylogo: false
            });
        }
        
        // Close handlers
        closeBtn.addEventListener('click', () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
            }
        });
        
        // ESC key to close
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.classList.remove('active');
                setTimeout(() => overlay.remove(), 300);
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
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
                textContent.style.width = '100%';
                
                // Clean up the text
                let cleanedText = text;
                cleanedText = cleanedText.replace(/\[DEBUG\][^\n]*/g, '');
                cleanedText = cleanedText.replace(/PLOT_PATH:\/Users\/[^\n]*/g, '');
                cleanedText = cleanedText.replace(/PLOT_PATH:\/home\/[^\n]*/g, '');
                cleanedText = cleanedText.replace(/PLOT_PATH:[A-Z]:\\[^\n]*/g, '');
                
                // Try to extract Plotly JSON
                const plotData = extractPlotlyJson(cleanedText);
                
                if (plotData) {
                    console.log('Found Plotly JSON in message');
                    
                    // Text before plot
                    if (plotData.textBefore) {
                        const beforeDiv = document.createElement('div');
                        beforeDiv.innerHTML = marked.parse(plotData.textBefore);
                        textContent.appendChild(beforeDiv);
                    }
                    
                    // Create plot container
                    const plotContainer = document.createElement('div');
                    plotContainer.classList.add('plot-container');
                    
                    // Add hint text
                    const plotHint = document.createElement('p');
                    plotHint.classList.add('plot-hint');
                    plotHint.textContent = '📊 Interactive Business Intelligence View:';
                    plotContainer.appendChild(plotHint);
                    
                    // Create unique ID
                    const plotId = 'plot-' + Math.random().toString(36).substr(2, 9);
                    
                    // Create div for Plotly chart
                    const plotDiv = document.createElement('div');
                    plotDiv.id = plotId;
                    plotDiv.classList.add('plotly-chart');
                    plotContainer.appendChild(plotDiv);
                    
                    textContent.appendChild(plotContainer);
                    
                    // Text after plot
                    if (plotData.textAfter) {
                        const afterDiv = document.createElement('div');
                        afterDiv.innerHTML = marked.parse(plotData.textAfter);
                        textContent.appendChild(afterDiv);
                    }
                    
                    // Render the plot
                    setTimeout(() => {
                        try {
                            // Ensure layout is responsive
                            const layout = {
                                ...plotData.json.layout,
                                autosize: true,
                                height: 500 // Increased default height for better visibility
                            };
                            
                            Plotly.newPlot(plotId, plotData.json.data, layout, {
                                responsive: true,
                                displayModeBar: true,
                                displaylogo: false,
                                modeBarButtonsToRemove: ['lasso2d', 'select2d']
                            });
                            
                            console.log('Plot rendered successfully');
                            
                            // Add fullscreen capability
                            makePlotExpandable(plotContainer, plotId);
                            
                        } catch (error) {
                            console.error('Error rendering plot:', error);
                            plotDiv.innerHTML = `
                                <p style="color: #e74c3c; padding: 1rem; background: #fee; border-radius: 8px;">
                                    ⚠️ Failed to render plot. Error: ${error.message}
                                </p>
                            `;
                        }
                    }, 100);
                    
                } else {
                    // No plot - render as standard markdown
                    textContent.innerHTML = marked.parse(cleanedText);
                }
                
                // Wrap any tables in scroll containers
                setTimeout(() => {
                    wrapTablesInScrollContainers(textContent);
                }, 50);
                
                // Handle existing plot images
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
