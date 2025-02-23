// Gemini API configuration
const GEMINI_API_KEY = 'YOUR_API_KEY_HERE';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// Helper function to call Gemini API
async function callGeminiAPI(prompt) {
    try {
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }]
            })
        });

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    } catch (error) {
        console.error('Error calling Gemini API:', error);
        return 'I apologize, but I encountered an error. Please try again.';
    }
}

// Function to analyze a user's message and suggest an opening line
async function suggestOpeningLine(profile) {
    const prompt = `
        As a dating expert, suggest a creative and engaging opening line for someone with these interests: ${profile.interests.join(', ')}.
        The opening line should be personalized, friendly, and spark a conversation.
    `;
    return await callGeminiAPI(prompt);
}

// Function to provide advice for difficult conversations
async function navigateDifficultConversations(topic, context) {
    const prompt = `
        As a relationship coach, provide advice on how to navigate this difficult conversation topic: "${topic}".
        Context of the situation: "${context}".
        Provide a thoughtful and empathetic response that helps maintain a positive connection.
    `;
    return await callGeminiAPI(prompt);
}

// Function to suggest date ideas based on interests
async function suggestDateIdeas(interests, location) {
    const prompt = `
        Suggest unique and creative date ideas for people interested in: ${interests.join(', ')}.
        Location: ${location}
        The suggestions should be specific, memorable, and consider both parties' interests.
    `;
    return await callGeminiAPI(prompt);
}

// Function to boost confidence with personalized affirmations
async function boostConfidence(userContext) {
    const prompt = `
        Generate a personalized confidence-boosting message for someone who:
        - Is preparing for: ${userContext.situation}
        - Feels: ${userContext.feelings}
        Make it encouraging, specific, and authentic.
    `;
    return await callGeminiAPI(prompt);
}

// Function to provide real-time feedback on a message
async function getFeedbackOnMessage(message, context) {
    const prompt = `
        Analyze this message in the context of ${context}:
        "${message}"
        Provide feedback on:
        1. Tone and appropriateness
        2. Potential improvements
        3. Suggestions for better engagement
    `;
    return await callGeminiAPI(prompt);
}

// Function to provide cultural insights
async function getCulturalInsights(culture1, culture2) {
    const prompt = `
        Provide insights and tips for communication between someone from ${culture1} culture 
        and someone from ${culture2} culture in a dating context.
        Include:
        1. Key cultural differences to be aware of
        2. Communication style tips
        3. Potential misunderstandings to avoid
    `;
    return await callGeminiAPI(prompt);
}

// Example usage with UI integration
document.addEventListener('DOMContentLoaded', () => {
    // Message analysis
    const messageInput = document.getElementById('message-input');
    const analyzeButton = document.getElementById('analyze-button');
    const feedbackDiv = document.getElementById('feedback');

    if (analyzeButton) {
        analyzeButton.addEventListener('click', async () => {
            const message = messageInput.value;
            const feedback = await getFeedbackOnMessage(message, 'dating app conversation');
            feedbackDiv.textContent = feedback;
        });
    }

    // Date suggestion
    const dateButton = document.getElementById('suggest-date-button');
    const dateSuggestionsDiv = document.getElementById('date-suggestions');

    if (dateButton) {
        dateButton.addEventListener('click', async () => {
            const interests = ['art', 'food', 'music']; // This could come from user input
            const location = 'New York'; // This could come from user input
            const suggestions = await suggestDateIdeas(interests, location);
            dateSuggestionsDiv.textContent = suggestions;
        });
    }
});

// Error handling wrapper
function handleError(fn) {
    return async (...args) => {
        try {
            return await fn(...args);
        } catch (error) {
            console.error(`Error in ${fn.name}:`, error);
            return 'An error occurred. Please try again later.';
        }
    };
}

// Wrap all async functions with error handling
const safeOpeningLine = handleError(suggestOpeningLine);
const safeNavigateConversations = handleError(navigateDifficultConversations);
const safeSuggestDates = handleError(suggestDateIdeas);
const safeBoostConfidence = handleError(boostConfidence);
const safeFeedback = handleError(getFeedbackOnMessage);
const safeCulturalInsights = handleError(getCulturalInsights); 