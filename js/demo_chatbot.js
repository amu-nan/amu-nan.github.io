document.addEventListener('DOMContentLoaded', () => {
    // --- Element references ---
    const ownerDisplay = document.getElementById('owner-display');
    const orgDisplay = document.getElementById('org-display');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');
    const uploadSubmitBtn = document.getElementById('upload-submit-btn');
    const actionButtonsContainer = document.querySelector('.action-buttons-container');
    const sendButton = document.getElementById('sendButton');
    const userQueryInput = document.getElementById('userQueryInput');
    const chatHistory = document.getElementById('chatHistory');
    const backButton = document.getElementById('backButton');
    const endDemoButton = document.getElementById('endDemoButton');

    // Conversation array in backend format
    const chatHistoryArray = [];

    // --- Display owner/org from local storage ---
    const ownerName = localStorage.getItem('ownerName');
    const orgName = localStorage.getItem('orgName');

    if (ownerName && orgName) {
        ownerDisplay.textContent = ownerName;
        orgDisplay.textContent = orgName;
    } else {
        window.location.href = 'owner.html';
    }

    // --- Excel Upload Handling ---
    fileInput.addEventListener('change', (event) => {
        fileList.innerHTML = '';
        const files = event.target.files;

        if (files.length > 0) {
            uploadSubmitBtn.disabled = false;
            for (const file of files) {
                const listItem = document.createElement('li');
                listItem.textContent = file.name;
                fileList.appendChild(listItem);
            }
        } else {
            uploadSubmitBtn.disabled = true;
        }
    });

    uploadSubmitBtn.addEventListener('click', () => {
        const file = fileInput.files[0];
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('organization_name', orgName);
        formData.append('owner_name', ownerName);

        const uploadUrl = "http://127.0.0.1:8000/upload_excel/";

        fetch(uploadUrl, {
            method: 'POST',
            body: formData,
        })
        .then(response => {
            if (!response.ok) throw new Error('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log('File uploaded successfully!', data);
            alert('File uploaded successfully! You can now navigate to the Chatbot or Dashboard.');
            actionButtonsContainer.style.display = 'block';
            uploadSubmitBtn.style.display = 'none';
        })
        .catch(error => {
            console.error('File upload failed:', error);
            alert('File upload failed. Please check the console for details.');
        });
    });

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
