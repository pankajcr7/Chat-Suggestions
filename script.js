// script.js
// Initialize the Google AI Studio API client
const API_KEY = 'AIzaSyBmrwuCfEkKQ6Fdcjt7KeLuvpKyBqWgiOQ'; // Replace with your actual API key
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

let selectedReplyType = 'polite'; // Default reply type

// Initialize chat history
let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
let currentMessageId = null;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load chat history
    loadChatHistory();
    
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const suggestButton = document.getElementById('suggestButton');
    const newChatButton = document.getElementById('newChatButton');
    
    // New chat button handler
    newChatButton.addEventListener('click', () => {
        chatHistory = []; // Clear chat history
        saveToLocalStorage(); // Update local storage
        document.getElementById('chatMessages').innerHTML = ''; // Clear displayed messages
        document.getElementById('suggestionArea').style.display = 'none'; // Hide suggestion area
        messageInput.value = ''; // Clear input field
    });

    // Send message handler
    sendButton.addEventListener('click', () => {
        const message = messageInput.value.trim();
        if (message) {
            addMessage('their', message);
            messageInput.value = '';
            showActionButtons(chatHistory.length - 1);
        }
    });

    // Enter key handler
    messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendButton.click();
        }
    });

    // Suggestion button handler
    suggestButton.addEventListener('click', () => {
        const suggestionArea = document.getElementById('suggestionArea');
        suggestionArea.style.display = 'block';
    });

    // Reply type button handlers
    document.querySelectorAll('.reply-type-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const replyType = button.dataset.type;
            const lastMessage = chatHistory[chatHistory.length - 1];
            
            if (lastMessage) {
                try {
                    const suggestions = await getReplySuggestion(lastMessage.text, replyType);
                    displaySuggestions(suggestions);
                } catch (error) {
                    console.error('Error getting suggestions:', error);
                    displaySuggestions('Sorry, there was an error generating suggestions. Please try again.');
                }
            }
        });
    });
});

function addMessage(type, text) {
    const message = {
        id: Date.now(),
        type,
        text,
        timestamp: new Date().toLocaleTimeString()
    };
    
    chatHistory.push(message);
    saveToLocalStorage();
    displayMessage(message);
}

function displayMessage(message) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message message-${message.type}`;
    messageDiv.innerHTML = `
        ${message.text}
        <div class="timestamp">${message.timestamp}</div>
        ${message.type === 'their' ? `
            <div class="action-buttons" id="actions-${message.id}">
                <button class="action-btn" onclick="replyToMessage(${message.id})">Reply</button>
                <button class="action-btn" onclick="getSuggestions(${message.id})">Get Suggestions</button>
            </div>
        ` : ''}
    `;
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showActionButtons(messageIndex) {
    const message = chatHistory[messageIndex];
    if (message && message.type === 'their') {
        currentMessageId = message.id;
        const suggestionArea = document.getElementById('suggestionArea');
        suggestionArea.style.display = 'block';
    }
}

function replyToMessage(messageId) {
    currentMessageId = messageId;
    const messageInput = document.getElementById('messageInput');
    messageInput.focus();
}

function getSuggestions(messageId) {
    currentMessageId = messageId;
    const suggestionArea = document.getElementById('suggestionArea');
    suggestionArea.style.display = 'block';
}

function displaySuggestions(suggestions) {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = `
        <div class="suggestions-content">
            ${suggestions}
            <div class="suggestion-actions">
                <button class="action-btn" onclick="useReply(0)">Use Reply 1</button>
                <button class="action-btn" onclick="useReply(1)">Use Reply 2</button>
                <button class="action-btn" onclick="useReply(2)">Use Reply 3</button>
            </div>
        </div>
    `;
}

function useReply(index) {
    const suggestionsDiv = document.getElementById('suggestions');
    const suggestions = suggestionsDiv.textContent.split(/\d\./g).filter(Boolean);
    
    if (suggestions[index]) {
        const reply = suggestions[index].trim();
        addMessage('your', reply);
        document.getElementById('suggestionArea').style.display = 'none';
    }
}

function loadChatHistory() {
    chatHistory.forEach(message => displayMessage(message));
}

function saveToLocalStorage() {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}

async function getReplySuggestion(input, replyType) {
    console.log('Generating suggestion for type:', replyType); // Debug log

    // Create a context string from the entire chat history
    const contextMessages = chatHistory.map(msg => `${msg.type === 'their' ? 'Them' : 'You'}: ${msg.text}`).join('\n');
    
    const replyStyles = {
        flirty: "Create a flirty response that playfully expresses romantic interest using simple language.",
        funny: "Generate a humorous response that is easy to understand and will make them laugh.",
        tricky: "Create a clever response that maintains intrigue, using straightforward words.",
        polite: "Generate a respectful response that is warm, friendly, and easy to read.",
        spicy: "Create a bold response that is daring and a bit provocative, but still uses simple language."
    };

    const contextPrompt = `You are RIZZ AI, a dating coach assistant. 
    Here is the conversation history:
    ${contextMessages}
    
    Based on this conversation, ${replyStyles[replyType]}
    
    Generate 3 different response options in this style:
    1.
    2.
    3.
    
    Make sure each response is unique and matches the requested ${replyType} tone.`;

    console.log('Context Prompt:', contextPrompt); // Debug log

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: contextPrompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.8,
                    topK: 40,
                    topP: 0.95,
                    maxOutputTokens: 1024,
                }
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText); // Log the error response
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('API Response:', data); // Log the successful response
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}

function showLoading() {
    const suggestionsDiv = document.getElementById('suggestions');
    suggestionsDiv.innerHTML = '<div class="loading">Generating suggestions... 💭</div>';
}

function hideLoading() {
    const loadingDiv = document.querySelector('.loading');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Regular chat functionality
document.getElementById('sendButton').addEventListener('click', async () => {
    const userInput = document.getElementById('userInput').value;
    if (!userInput.trim()) return;

    displayMessage('You: ' + userInput);
    document.getElementById('userInput').value = '';

    try {
        const response = await getAIResponse(userInput);
        displayMessage('RIZZ AI: ' + response);
    } catch (error) {
        console.error('Error:', error);
        displayMessage('RIZZ AI: Sorry, I encountered an error. Please try again.');
    }
});

async function getAIResponse(input) {
    // Context prompt to guide the AI's responses
    const contextPrompt = `You are RIZZ AI, a dating coach assistant. You help users with:
    - Crafting engaging opening lines
    - Navigating difficult conversations
    - Planning dates
    - Boosting confidence
    - Providing dating advice
    
    User message: ${input}
    
    Provide a helpful, friendly, and specific response while maintaining a supportive tone.`;

    const requestBody = {
        contents: [{
            parts: [{
                text: contextPrompt
            }]
        }],
        generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
        },
        safetySettings: [
            {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            },
            {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
            }
        ]
    };

    try {
        const response = await fetch(`${API_URL}?key=${API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;

    } catch (error) {
        console.error('Error calling Gemini API:', error);
        throw error;
    }
}