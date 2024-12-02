const identifyShapeService = require('../services/IdentifyShape');

const getIdentifyShape = async (req, res) => {
    try {
        // Check if imagePath is provided in the request body
        const { imagePath } = req.body;
        

        // Call the identify shape service
        const identificationResult = await identifyShapeService.identifyShape();
        console.log(identificationResult);
        

        // Handle the response
        if (identificationResult && identificationResult.success) {
            console.log("Shape Identification Result:", identificationResult.data);
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
