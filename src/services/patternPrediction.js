const axios = require("axios");
const fs = require("fs");

const predictPattern = async (difficulty) => {
    // Ensure the difficulty level is provided
    if (!difficulty) {
        return {
            success: false,
            message: "Difficulty level is required. Please provide 'easy', 'medium', or 'hard'.",
        };
    }

    try {
        console.log("Difficulty level from response is:", difficulty);
        
        // Send the difficulty level to the Python Flask API
        const response = await axios.post("http://127.0.0.1:5000/predict-pattern", { difficulty });

        // Extract the prediction result
        const predictionResult = response.data;

        // Return the prediction result
        return {
            success: true,
            data: predictionResult,
        };
    } catch (error) {
        // Log error for debugging
        console.error("Error fetching pattern prediction:", error.message);

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
    predictPattern,
};
