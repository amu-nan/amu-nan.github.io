document.addEventListener('DOMContentLoaded', () => {
    // --- Get company name from URL ---
    const urlParams = new URLSearchParams(window.location.search);
    const companyName = urlParams.get('company');

    if (companyName) {
        const displayElement = document.getElementById('companyNameDisplay');
        if (displayElement) displayElement.textContent = `${companyName}'s`;
    }

    // --- Element references ---
    const userQueryInput = document.getElementById('userQueryInput');
    const sendButton = document.getElementById('sendButton');
    const chatHistory = document.getElementById('chat-history');
    
    // --- UPDATED: Select the specific logout button class ---
    const backButton = document.querySelector('.logout-btn');

    // Conversation array in backend format
    let chatHistoryArray = [];

    // --- UPDATED: Backend Endpoint Configuration (Port 8001) ---
    const backendUrl = "http://127.0.0.1:8001/api/v1/text"; // Fixed Path & Port
    const backendBaseUrl = "http://127.0.0.1:8001";

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
            if (table.parentElement.classList.contains('table-wrapper')) {
                return;
            }
            const wrapper = document.createElement('div');
            wrapper.classList.add('table-wrapper');
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
            
            wrapper.addEventListener('scroll', function() {
                if (this.scrollLeft > 10) {
                    this.classList.add('scrolled');
                }
            });
        });
    }

    // Function to add fullscreen capability to plots
    function makePlotExpandable(plotContainer, plotId) {
        const expandBtn = document.createElement('button');
        expandBtn.classList.add('plot-expand-btn');
        expandBtn.innerHTML = '<i class="fa-solid fa-expand"></i>';
        expandBtn.title = 'View plot in fullscreen';
        
        const plotDiv = plotContainer.querySelector('.plotly-chart');
        plotDiv.style.position = 'relative';
        plotDiv.appendChild(expandBtn);
        
        expandBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            openPlotFullscreen(plotId);
        });
    }

    // Function to open plot in fullscreen
    function openPlotFullscreen(plotId) {
        const overlay = document.createElement('div');
        overlay.classList.add('plot-fullscreen-overlay', 'active');
        
        const content = document.createElement('div');
        content.classList.add('plot-fullscreen-content');
        
        const closeBtn = document.createElement('button');
        closeBtn.classList.add('plot-fullscreen-close');
        closeBtn.innerHTML = '<i class="fa-solid fa-times"></i>';
        closeBtn.title = 'Close fullscreen';
        
        const fullscreenPlotId = 'fullscreen-' + plotId;
        const fullscreenPlot = document.createElement('div');
        fullscreenPlot.id = fullscreenPlotId;
        fullscreenPlot.style.width = '100%';
        fullscreenPlot.style.height = '100%';
        
        content.appendChild(closeBtn);
        content.appendChild(fullscreenPlot);
        overlay.appendChild(content);
        document.body.appendChild(overlay);
        
        const originalPlot = document.getElementById(plotId);
        if (originalPlot && originalPlot.data && originalPlot.layout) {
            Plotly.newPlot(fullscreenPlotId, originalPlot.data, originalPlot.layout, {
                responsive: true,
                displayModeBar: true,
                displaylogo: false
            });
        }
        
        const closeFullscreen = () => {
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 300);
        };

        closeBtn.addEventListener('click', closeFullscreen);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) closeFullscreen();
        });
        
        const escHandler = (e) => {
            if (e.key === 'Escape') {
                closeFullscreen();
                document.removeEventListener('keydown', escHandler);
            }
        };
        document.addEventListener('keydown', escHandler);
    }
    
    function addMessage(sender, text, isTyping = false) {
        if (!chatHistory) return; // Guard clause

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ria-message');
    
        if (isTyping) {
            messageDiv.id = 'typing-indicator';
            messageDiv.innerHTML = `<div class="ria-message-content">
                                        <img src="${RIA_ICON_SRC}" alt="Ria Icon" class="ria-message-icon">
                                        <div class="loading-dots"><span></span><span></span><span></span></div>
                                    </div>`;
        } else {
            if (sender === 'ria' || sender === 'bot') {
                const messageWrapper = document.createElement('div');
                messageWrapper.classList.add('ria-message-content');
                
                const iconImg = document.createElement('img');
                iconImg.src = RIA_ICON_SRC;
                iconImg.alt = 'Ria Icon';
                iconImg.classList.add('ria-message-icon');
                messageWrapper.appendChild(iconImg);
                
                const textContent = document.createElement('div');
                textContent.style.width = '100%';
                
                let cleanedText = text || "";
                // Clean up debug info
                cleanedText = cleanedText.replace(/\[DEBUG\][^\n]*/g, '');
                cleanedText = cleanedText.replace(/PLOT_PATH:[^\n]*/g, '');
                
                const plotData = extractPlotlyJson(cleanedText);
                
                if (plotData) {
                    if (plotData.textBefore) {
                        const beforeDiv = document.createElement('div');
                        beforeDiv.innerHTML = marked.parse(plotData.textBefore);
                        textContent.appendChild(beforeDiv);
                    }
                    
                    const plotContainer = document.createElement('div');
                    plotContainer.classList.add('plot-container');
                    
                    const plotHint = document.createElement('p');
                    plotHint.classList.add('plot-hint');
                    plotHint.textContent = '📊 Interactive Business Intelligence View:';
                    plotContainer.appendChild(plotHint);
                    
                    const plotId = 'plot-' + Math.random().toString(36).substr(2, 9);
                    const plotDiv = document.createElement('div');
                    plotDiv.id = plotId;
                    plotDiv.classList.add('plotly-chart');
                    plotContainer.appendChild(plotDiv);
                    
                    textContent.appendChild(plotContainer);
                    
                    if (plotData.textAfter) {
                        const afterDiv = document.createElement('div');
                        afterDiv.innerHTML = marked.parse(plotData.textAfter);
                        textContent.appendChild(afterDiv);
                    }
                    
                    setTimeout(() => {
                        try {
                            const layout = {
                                ...plotData.json.layout,
                                autosize: true,
                                height: 450,
                                paper_bgcolor: 'rgba(0,0,0,0)',
                                plot_bgcolor: 'rgba(0,0,0,0)',
                                font: { family: 'Work Sans, sans-serif' }
                            };
                            
                            Plotly.newPlot(plotId, plotData.json.data, layout, {
                                responsive: true,
                                displayModeBar: true,
                                displaylogo: false,
                                modeBarButtonsToRemove: ['lasso2d', 'select2d']
                            });
                            makePlotExpandable(plotContainer, plotId);
                        } catch (error) {
                            console.error('Error rendering plot:', error);
                            plotDiv.innerHTML = `<p style="color: #e74c3c;">⚠️ Failed to render plot.</p>`;
                        }
                    }, 100);
                    
                } else {
                    textContent.innerHTML = marked.parse(cleanedText);
                }
                
                setTimeout(() => wrapTablesInScrollContainers(textContent), 50);
                
                messageWrapper.appendChild(textContent);
                messageDiv.appendChild(messageWrapper);
            } else {
                // User message
                messageDiv.innerHTML = marked.parse(text || "");
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
                    text: query, // Changed from 'query' to 'text' to match standard RIA payload
                    need_action_items: true,
                    include_tts: false,
                    conversation_history: chatHistoryArray
                }),
            });

            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error("Error sending query:", error);
            return {
                reply_preview: "Sorry, I'm having trouble connecting right now. Please ensure the RIA backend (Port 8001) is running.",
                conversation_history: []
            };
        }
    }

    async function sendQuery() {
        const userQuery = userQueryInput.value.trim();
        if (!userQuery) return;

        addMessage('user', userQuery);
        userQueryInput.value = '';

        addMessage('ria', null, true); // Show typing

        try {
            const backendResponse = await sendQueryToBackend(userQuery);

            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) typingIndicator.remove();

            // Handle standard RIA response format
            const aiResponseText = backendResponse.reply_preview || backendResponse.response || "No response received.";
            
            // Append Action Items if available
            let finalResponse = aiResponseText;
            if(backendResponse.micro_agent && backendResponse.micro_agent.action_items) {
                finalResponse += "\n\n**Action Items:**\n";
                backendResponse.micro_agent.action_items.forEach(item => {
                    finalResponse += `- ${item.description}\n`;
                });
            }

            addMessage('ria', finalResponse);
        } catch (error) {
            const typingIndicator = document.getElementById('typing-indicator');
            if (typingIndicator) typingIndicator.remove();
            addMessage('ria', "Sorry, I encountered a system error.");
        }
    }

    // --- Event listeners ---
    if(sendButton) {
        sendButton.addEventListener('click', sendQuery);
    }

    if(userQueryInput) {
        userQueryInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault();
                sendQuery();
            }
        });
    }

    // --- UPDATED: Back Button Navigation ---
    if(backButton) {
        backButton.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = 'admin-dashboard.html';
        });
    }

    // --- Initial greeting ---
    addMessage('ria', "Hello! I'm Ria. I'm ready to answer questions about your manufacturing data. How can I help?");
});