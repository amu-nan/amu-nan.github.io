document.addEventListener('DOMContentLoaded', () => {
    const userQueryInput = document.getElementById('user-query');
    const sendBtn = document.getElementById('send-btn');
    const chatHistory = document.getElementById('chat-history');

    // Retrieve patient name (Placeholder for now)
    const patientName = "John Doe"; 

    let conversationHistory = [];

    const appendMessage = (sender, message) => {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message', `${sender}-message`);
        const messageParagraph = document.createElement('p');
        messageParagraph.textContent = message;
        messageDiv.appendChild(messageParagraph);
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    };

    const handleQuery = () => {
        const query = userQueryInput.value.trim();
        if (query === '') {
            return;
        }

        // 1. Add user message to screen immediately
        appendMessage('user', query);
        // conversationHistory.push({ role: 'user', content: query }); // Optional: Frontend history tracking
        userQueryInput.value = '';

        // 2. Prepare payload for the COAST backend
        // Note: We are sending 'message' because most simple FastAPIs expect that key.
        // If your app.py expects 'query', change 'message' to 'query' below.
        const payload = {
            message: query, 
            history: conversationHistory // Sending history allows the bot to remember context
        };

        // 3. Send to your Local Backend (Port 8000)
        fetch('http://127.0.0.1:8000/api/chat', { 
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Server Error: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            // 4. Handle the Real AI response
            // We assume the backend returns { "response": "..." } or { "message": "..." }
            // Adjust 'data.response' if your backend keys are different
            const aiResponse = data.response || data.message || JSON.stringify(data);
            
            appendMessage('ria', aiResponse);
            conversationHistory.push({ role: 'user', content: query });
            conversationHistory.push({ role: 'assistant', content: aiResponse });
        })
        .catch((error) => {
            console.error('Error:', error);
            appendMessage('ria', 'Error: Could not connect to the backend. Make sure uvicorn is running on port 8000.');
        });
    };

    sendBtn.addEventListener('click', handleQuery);
    userQueryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleQuery();
        }
    });
});