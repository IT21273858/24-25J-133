const axios = require("axios");

// Service to generate a digit sequence
const generateDigitSequence = async (sequenceLength = 5) => {
    try {
        // Send GET request to Flask API to generate a digit sequence
        const response = await axios.get("http://127.0.0.1:5000/generate-digit-sequence", {
            params: { sequenceLength },
        });

        console.log("Response from generate digit sequence:", response.data);

        // Extract data from the response
        const { digit_sequence, display_time, sequence_length } = response.data;

        // Return the response data in a structured format
        return {
            success: true,
            data: {
                digitSequence: digit_sequence,
                displayTime: display_time,
                sequenceLength: sequence_length,
            },
        };
    } catch (error) {
        // Log error for debugging
        console.error("Error generating digit sequence:", error);

        // Handle specific error scenarios
        if (error.response) {
            // Flask API returned an error response
            return {
                success: false,
                message: "Error from Flask API.",
                status: error.response.status,
                error: error.response.data,
            };
        } else if (error.request) {
            // Request was made, but no response received
            return {
                success: false,
                message: "No response from Flask API.",
                error: error.message,
            };
        } else {
            // Unexpected errors
            return {
                success: false,
                message: "Unexpected error occurred.",
                error: error.message,
            };
        }
    }
};

// Export the service
module.exports = {
    generateDigitSequence,
};
