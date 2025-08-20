document.addEventListener('DOMContentLoaded', () => {
    const chatHistory = document.getElementById('chat-history');
    const userQueryInput = document.getElementById('user-query');
    const sendButton = document.getElementById('send-btn');
    const backButton = document.querySelector('.back-btn');
    const endDemoButton = document.querySelector('.end-demo-btn');

    // This array will store the conversation history
    let chatHistoryArray = [];

    // This is a placeholder function for sending the query to the backend
    async function sendQueryToBackend(query) {
        const backendUrl = "http://127.0.0.1:8000/chat/"; // <-- adjust to your chatbot endpoint

        try {
            const response = await fetch(backendUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: query,
                chat_history: chatHistoryArray
            }),
        });

        if (!response.ok) {
            throw new Error("Network response was not ok");
        }

        const data = await response.json();
        return data.response; // backend must return { "response": "..." }
    } catch (error) {
        console.error("Error sending query:", error);
        return "Sorry, I'm having trouble connecting right now. Please try again later.";
    }
}

    // Function to add a message to the chat history and update the array
    function addMessage(sender, text) {
        // Add message to the visual chat history
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chat-message');
        messageDiv.classList.add(sender === 'user' ? 'user-message' : 'ria-message');
        
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        
        messageDiv.appendChild(paragraph);
        chatHistory.appendChild(messageDiv);
        chatHistory.scrollTop = chatHistory.scrollHeight; // Auto-scroll to the bottom

        // Add message to the conversation history array for the payload
        chatHistoryArray.push({ sender, text });
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

    // Add the initial message to the chat history array
    addMessage('ria', "Hello! I'm Ria. I'm ready to answer your questions about the patient data. How can I help?");
});
