const axios = require("axios");
const fs = require("fs");

const GenerateShape = async (difficulty) => {
    // Ensure the difficulty level is provided
    if (!difficulty) {
        return {
            success: false,
            message: "Difficulty level is required. Please provide 'easy', 'medium', or 'hard'.",
        };
    }

    try {
        console.log("Difficulty level from response is:", difficulty);
        var num_shapes = 3;

        if (difficulty === 'easy') {
            num_shapes = 3;
        } else if (difficulty === 'medium') {
            num_shapes = 5;
        } else if (difficulty === 'hard') {
            num_shapes = 7;
        } else {
            num_shapes = 2
        }

        // Send the difficulty level to the Python Flask API
        const response = await axios.post("http://127.0.0.1:5000/generate-shapes", { num_shapes });

        // Extract the generation result
        const generationResult = response.data;

        // Return the generation result
        return {
            success: true,
            data: generationResult,
        };
    } catch (error) {
        // Log error for debugging
        console.error("Error fetching shape generation:", error.message);

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
    GenerateShape,
};
