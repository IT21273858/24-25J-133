const axios = require("axios");

const identifyShape = async () => {
    try {

        const response = await axios.get("http://127.0.0.1:5000/generate-and-predict");

        // Extract the result from the response
        const identificationResult = response.data;

        // Return the identification result
        return {
            success: true,
            data: identificationResult,
        };
    } catch (error) {
        // Log error for debugging
        console.error("Error fetching shape identification:", error.message);

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
    identifyShape,
};
