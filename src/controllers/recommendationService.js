const recommendationService = require('../services/recommendationService');

const getRecommendation = async (req, res) => {
    try {
        const recommendations = await recommendationService.getAllRecommendations();
        if (recommendations) {
            res.status(200).json({ status: true, recommendations, message: "Data retreived sucess" });
        }
        else {
            res.status(404).json({ status: false, message: "Not Data Available" })
        }
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving recommendations', message: error });
    }
};

module.exports = {
    getRecommendation
};
