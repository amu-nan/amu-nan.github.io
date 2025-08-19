
document.addEventListener('DOMContentLoaded', (event) => {
    // This code runs once the page is fully loaded.
    
    // --- CONSOLIDATE PAGE LOGIC ---
    const uploadBox = document.getElementById('upload-box');
    const fileUpload = document.getElementById('file-upload');
    const browseLink = document.querySelector('.browse-link');
    const uploadStatus = document.getElementById('upload-status');
    const fileNameDisplay = document.getElementById('file-name-display');
    const statusProgress = document.getElementById('status-progress');
    const statusText = document.getElementById('status-text');
    const continueBtn = document.getElementById('continue-btn');

    if (uploadBox && fileUpload && continueBtn) {
        browseLink.addEventListener('click', () => fileUpload.click());
        fileUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handleFile(file);
            }
        });
        uploadBox.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadBox.classList.add('dragover');
        });
        uploadBox.addEventListener('dragleave', () => {
            uploadBox.classList.remove('dragover');
        });
        uploadBox.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadBox.classList.remove('dragover');
            const file = e.dataTransfer.files[0];
            if (file) {
                handleFile(file);
            }
        });

        async function handleFile(file) {
            fileNameDisplay.textContent = file.name;
            uploadStatus.style.display = 'block';
            statusText.textContent = 'Processing...';
            statusProgress.style.width = '0%';
            continueBtn.style.display = 'none';

            // Send file to your consolidate endpoint
            const formData = new FormData();
            formData.append('file', file);

            try {
                // IMPORTANT: Replace 'YOUR_CONSOLIDATE_ENDPOINT_URL' with your actual endpoint
                const response = await fetch('YOUR_CONSOLIDATE_ENDPOINT_URL', {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();
                console.log('Upload Success:', result);
                
                statusProgress.style.width = '100%';
                statusText.textContent = 'Upload Complete!';
                
                // Once successful, show the continue button
                setTimeout(() => {
                    continueBtn.style.display = 'block';
                }, 500);

                // Store data to be used in the next step
                sessionStorage.setItem('excelData', JSON.stringify(result.data));

            } catch (error) {
                console.error('Error:', error);
                statusText.textContent = 'Upload Failed!';
                alert('File upload failed.');
            }
        }

        continueBtn.addEventListener('click', () => {
            window.location.href = 'organize.html';
        });
    }

    // --- ORGANIZE PAGE LOGIC ---
    const bubbles = document.querySelectorAll('.bubble');
    const orgNameInput = document.getElementById('org-name');
    const organizeContinueBtn = document.getElementById('organize-continue-btn');

    if (bubbles && orgNameInput && organizeContinueBtn) {
        bubbles.forEach(bubble => {
            bubble.addEventListener('click', () => {
                bubble.classList.toggle('selected');
                updateContinueButtonState();
            });
        });

        orgNameInput.addEventListener('input', updateContinueButtonState);

        function updateContinueButtonState() {
            const orgName = orgNameInput.value.trim();
            const hasSelectedBubble = document.querySelector('.bubble.selected');
            if (orgName && hasSelectedBubble) {
                organizeContinueBtn.disabled = false;
                organizeContinueBtn.style.opacity = '1';
                organizeContinueBtn.style.cursor = 'pointer';
            } else {
                organizeContinueBtn.disabled = true;
                organizeContinueBtn.style.opacity = '0.5';
                organizeContinueBtn.style.cursor = 'not-allowed';
            }
        }
        
        organizeContinueBtn.addEventListener('click', async () => {
            const orgName = orgNameInput.value;
            const selectedEntities = Array.from(document.querySelectorAll('.bubble.selected'))
                                           .map(el => el.dataset.entity);
            
            const payload = {
                organization_name: orgName,
                selected_entities: selectedEntities,
            };

            try {
                // IMPORTANT: Replace 'YOUR_ORGANIZE_ENDPOINT_URL' with your actual endpoint
                const response = await fetch('YOUR_ORGANIZE_ENDPOINT_URL', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                const result = await response.json();
                console.log('Organization Setup Success:', result);

                sessionStorage.setItem('orgName', orgName);
                sessionStorage.setItem('selectedEntities', JSON.stringify(selectedEntities));
                window.location.href = 'rbac.html';

            } catch (error) {
                console.error('Error:', error);
                alert('Organization setup failed.');
            }
        });

        updateContinueButtonState();
    }

    // --- RBAC PAGE LOGIC (optional if needed in future) ---

    // --- SEARCH PAGE LOGIC ---
    const patientSelectInput = document.getElementById('patient-select-input');
    const uploadSection = document.getElementById('upload-section');
    const detailedSearchForm = document.getElementById('detailed-search-form');
    
    let workingData = null;
    const excelData = sessionStorage.getItem('excelData');

    if (patientSelectInput && uploadSection && detailedSearchForm) {
        if (excelData) {
            workingData = JSON.parse(excelData);
            const patients = [...new Set(workingData.map(item => item.Patient_name))];
            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient;
                option.textContent = patient;
                patientSelectInput.appendChild(option);
            });
        }

        patientSelectInput.addEventListener('change', (e) => {
            const selectedPatient = e.target.value;
            if (selectedPatient) {
                uploadSection.style.display = 'block';
                sessionStorage.setItem('selectedPatientName', selectedPatient);
                
                const selectedPatientData = workingData.find(p => p.Patient_name === selectedPatient);
                sessionStorage.setItem('selectedPatientId', selectedPatientData.Patient_ID);

            } else {
                uploadSection.style.display = 'none';
            }
        });

        detailedSearchForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            const file = document.getElementById('file-upload-2').files[0];
            const patientName = document.getElementById('patient-select-input').value;
            
            if (!file || !patientName) {
                alert('Please select a patient and a file.');
                return;
            }

            const selectedPatientData = workingData.find(p => p.Patient_name === patientName);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('metadata', JSON.stringify({
                patient_name: selectedPatientData.Patient_name,
                patient_id: selectedPatientData.Patient_ID
            }));

            try {
                // IMPORTANT: Replace 'YOUR_SEARCH_UPLOAD_ENDPOINT_URL' with your actual endpoint
                const response = await fetch('YOUR_SEARCH_UPLOAD_ENDPOINT_URL', {
                    method: 'POST',
                    body: formData,
                });
                const result = await response.json();
                console.log('Upload Success:', result);
                alert('Document uploaded successfully!');
                
                window.location.href = 'chatbot.html';

            } catch (error) {
                console.error('Error:', error);
                alert('Document upload failed.');
            }
        });
    }

    // --- CHATBOT PAGE LOGIC ---
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const sendBtn = document.getElementById('send-btn');
    const patientIdSpan = document.getElementById('patient-id-span');

    if (chatBox && chatInput && sendBtn) {
        const patientId = sessionStorage.getItem('selectedPatientId');
        if (patientId) {
            patientIdSpan.textContent = patientId;
        }

        sendBtn.addEventListener('click', handleChatSubmit);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleChatSubmit();
            }
        });

        async function handleChatSubmit() {
            const userMessage = chatInput.value.trim();
            if (userMessage === '') return;

            displayMessage(userMessage, 'user');
            chatInput.value = '';

            const payload = {
                query: userMessage,
                patient_id: sessionStorage.getItem('selectedPatientId'),
            };

            try {
                // IMPORTANT: Replace 'YOUR_CHATBOT_ENDPOINT_URL' with your actual endpoint
                const response = await fetch('YOUR_CHATBOT_ENDPOINT_URL', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });
                const botResponse = await response.json();
                displayMessage(botResponse.text, 'bot');
            } catch (error) {
                console.error('Error:', error);
                displayMessage("Sorry, I'm having trouble connecting.", 'bot');
            }
        }

        function displayMessage(message, type) {
            const messageEl = document.createElement('div');
            messageEl.classList.add('message', type);
            messageEl.textContent = message;
            chatBox.appendChild(messageEl);
            chatBox.scrollTop = chatBox.scrollHeight;
        }
    }
});
