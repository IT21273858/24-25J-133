const identifyShapeService = require('../services/IdentifyShape');

const getIdentifyShape = async (req, res) => {
    try {
        // Check if imagePath is provided in the request body
        const { imagePath, displayTime = 5 } = req.body; // Default displayTime to 5 if not provided

        // Call the identify shape service
        const identificationResult = await identifyShapeService.identifyShape();
        console.log(identificationResult);

        // Handle the response
        if (identificationResult && identificationResult.success) {
            console.log("Shape Identification Result:", identificationResult.data);

            // Log when the shape will be hidden
            console.log(`Shape will be hidden after ${displayTime} seconds.`);

            // Set a timeout for hiding the shape after displayTime (simulating the hide effect)
            setTimeout(() => {
                console.log("Shape is now hidden after the display time ends.");
            }, displayTime * 1000); // Convert displayTime to milliseconds

            return res.status(200).json({
                status: true,
                identifiedShape: identificationResult.data,
                message: "Shape identified successfully.",
            });
        } else {
            console.error("Shape Identification Error:", identificationResult?.message || "Unknown error.");
            return res.status(400).json({
                status: false,
                message: identificationResult?.message || "Error identifying shape.",
            });
        }
    } catch (error) {
        console.error("Error during shape identification:", error.message);
        res.status(500).json({
            status: false,
            message: "Error during shape identification.",
            error: error.message || "Unknown error.",
        });
    }
};

module.exports = {
    getIdentifyShape,
};
