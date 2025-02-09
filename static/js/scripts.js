document.addEventListener('DOMContentLoaded', function() {
    const fileInput = document.getElementById('fileInput');
    const chatSendButton = document.getElementById('chatSendButton');
    const chatInput = document.getElementById('chatInput');
    const uploadedImage = document.getElementById('uploadedImage');
    const summaryText = document.querySelector('.summary-text');

    if (fileInput) {
        fileInput.addEventListener('change', async function(event) {
            const file = event.target.files[0];
            if (file) {
                const localImageUrl = URL.createObjectURL(file);
                uploadedImage.src = localImageUrl;
                uploadedImage.style.display = 'block';

                const formData = new FormData();
                formData.append('file', file);
                formData.append('question', 'Describe this image.');

                summaryText.textContent = "Loading model ...";
                summaryText.style.display = 'block';

                await new Promise(resolve => requestAnimationFrame(resolve));

                try {
                    const response = await fetch('/upload/', {
                        method: 'POST',
                        body: formData,
                    });

                    if (!response.ok) throw new Error("Network response was not ok");
                    const data = await response.json();

                    summaryText.textContent = data.analysis_result || "No analysis result available";
                } catch (error) {
                    console.error('There was a problem with the upload:', error);
                    summaryText.textContent = "Failed to load model or analyze image.";
                }
            }
        });
    }

    function sendMessage() {
        let message = chatInput.value.trim();

        if (message) {
            addMessage(message, 'user-message');

            fetch('/chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'question': message
                }),
            })
            .then(response => response.json())
            .then(data => {
                const botResponse = data.response;

                addMessage(botResponse, 'bot-message');
            })
            .catch(error => {
                console.error('Error during chat:', error);
                addMessage('Sorry, there was an error processing your request.', 'bot-message');
            });

            chatInput.value = '';
            scrollToLatestMessage();
        } else {
            alert('Please enter a question.');
        }
    }

    function addMessage(content, className) {
        const chatSessionDiv = document.getElementById('chatSession');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${className}`;
        messageDiv.innerHTML = content.replace(/\n/g, '<br>');
        chatSessionDiv.appendChild(messageDiv);
    }

    function scrollToLatestMessage() {
        const chatSessionDiv = document.getElementById('chatSession');
        chatSessionDiv.scrollTop = chatSessionDiv.scrollHeight;
    }

    if(chatSendButton){
        chatSendButton.addEventListener('click', sendMessage);
    }else{
        console.error('Chat send button not found.');
    }

    if(chatInput){
        chatInput.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
            }
        });
    }else{
        console.error('Chat input not found.');
    }
});