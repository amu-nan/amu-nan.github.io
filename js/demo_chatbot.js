document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const userQueryInput = document.getElementById('user-query');
    const sendButton = document.getElementById('send-btn');
    const backButton = document.querySelector('.back-btn');
    const endDemoButton = document.querySelector('.end-demo-btn');

    // This is a placeholder function for sending the query to the backend
    async function sendQueryToBackend(query) {
        // Replace this URL with your actual chatbot backend endpoint
        const backendUrl = 'YOUR_BACKEND_CHATBOT_ENDPOINT'; 

        try {
            const response = await fetch(backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data.response; // Assuming the backend returns a JSON object with a 'response' key
        } catch (error) {
            console.error('Error sending query:', error);
            return "Sorry, I'm having trouble connecting right now. Please try again later.";
        }
    }

    // Function to add a message to the chat history
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ria-message');
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        
        messageDiv.appendChild(paragraph);
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll to the bottom
    }

    // Handle user input
    sendButton.addEventListener('click', async () => {
        const userQuery = userQueryInput.value.trim();
        if (userQuery) {
            addMessage('user', userQuery);
            userQueryInput.value = '';

            // Simulate AI response
            const aiResponse = await sendQueryToBackend(userQuery);
            addMessage('ria', aiResponse);
        }
    });

    userQueryInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            sendButton.click();
        }
    });

    // Handle the "Go Back" button
    if (backButton) {
        backButton.addEventListener('click', () => {
            history.back();
        });
    }

    // Handle the "End Demo" button
    if (endDemoButton) {
        endDemoButton.addEventListener('click', () => {
            localStorage.clear(); // Clears any stored data
            window.location.href = '../index.html'; // Redirect to the splash page
        });
    }
});
