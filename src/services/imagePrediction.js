const axios = require("axios");
const fs = require("fs");

const predictShape = async (req) => {
    // Ensure the request contains the required image file
    if (!req.file) {
        return {
            success: false,
            message: "No image file uploaded. Please include an image for prediction.",
        };
    }

    try {
        // Path to the uploaded image
        const imagePath = req.file.path;

        // Create form data for the image upload
        const FormData = require("form-data");
        const formData = new FormData();
        formData.append("image", fs.createReadStream(imagePath));

        // Send the image to the Python Flask API
        const response = await axios.post("http://127.0.0.1:5000/predict", formData, {
            headers: formData.getHeaders(),
        });

        // Extract the prediction result
        const predictionResult = response.data;

        // Clean up the uploaded image file
        fs.unlinkSync(imagePath);

        // Return the prediction result
        return {
            success: true,
            data: predictionResult,
        };
    } catch (error) {
        // Log error for debugging
        console.error("Error fetching shape prediction:", error.message);

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
    predictShape
};
