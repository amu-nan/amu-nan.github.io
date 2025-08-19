document.addEventListener('DOMContentLoaded', () => {
    const userQueryInput = document.getElementById('user-query');
    const sendBtn = document.getElementById('send-btn');
    const chatHistory = document.getElementById('chat-history');

    // Retrieve patient name from the previous page (if needed)
    // You could use localStorage or URL parameters for this
    // For now, we'll use a placeholder
    const patientName = "John Doe"; // In a real app, this would be dynamic

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

        // Add user message to history and UI
        appendMessage('user', query);
        conversationHistory.push({ role: 'user', content: query });
        userQueryInput.value = '';

        // Prepare payload for backend (simulated)
        const payload = {
            patientName: patientName,
            query: query,
            conversationHistory: conversationHistory
        };

        // You would typically use fetch() here to send the payload to your backend.
        // Example:
        // fetch('your-backend-api/chatbot', {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify(payload)
        // })
        // .then(response => response.json())
        // .then(data => {
        //     // Handle the AI response and add it to the chat history
        //     const aiResponse = data.response;
        //     appendMessage('ria', aiResponse);
        //     conversationHistory.push({ role: 'ria', content: aiResponse });
        // })
        // .catch((error) => {
        //     console.error('Error:', error);
        //     appendMessage('ria', 'Sorry, I am unable to connect right now. Please try again later.');
        // });

        // For now, let's simulate a response
        setTimeout(() => {
            const simulatedResponse = `I received your query about ${patientName} related to "${query}". I'm processing this information for you.`;
            appendMessage('ria', simulatedResponse);
            conversationHistory.push({ role: 'ria', content: simulatedResponse });
        }, 1000);
    };

    sendBtn.addEventListener('click', handleQuery);
    userQueryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleQuery();
        }
    });
});
