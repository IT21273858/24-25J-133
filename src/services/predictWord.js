const axios = require("axios");


// Service to generate a word (new function)
const generateWord = async () => {
    try {
        // Send POST request to generate a word
        const response = await axios.get("http://127.0.0.1:5000/generate-word");
        console.log("Response from generate word:", response.data);
        
        // Extract the result from the response
        const generationResult = response.data;

        // Return the generated word
        return {
            success: true,
            data: generationResult,
        };
    } catch (error) {
        // Log error for debugging
        console.error("Error generating word:", error.message);

        // Handle API errors
        if (error.response) {
            // API responded with a status code outside the 2xx range
            return {
                success: false,
                message: "Flask API error occurred.",
                status: error.response.status,
                error: error.response.data,
            };
        } else if (error.request) {
            // Request was made but no response was received
            return {
                success: false,
                message: "No response from Flask API.",
                error: error.message,
            };
        } else {
            // Other errors
            return {
                success: false,
                message: "Unexpected error occurred.",
                error: error.message,
            };
        }
    }
};

module.exports = {
    
    generateWord,
};
