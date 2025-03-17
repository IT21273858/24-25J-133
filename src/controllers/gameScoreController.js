const gameScoreService = require('../services/gameScoreService');

// Controller to get all GamesScores
const getAllGameScores = async (req, res) => {
    try {
        // Retrieve all GameScore using the game service
        const games = await gameScoreService.getAllGameScores();
        if (games) {
            // Respond with a success status and the data
            res.status(200).json({ status: true, games, message: "Data retrieved successfully" });
        } else {
            // If no GameScore found, respond with 404
            res.status(404).json({ status: false, message: "No data available" });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ error: 'Error retrieving GameScore' });
    }
};

// Controller to get a gameScore by ID
const getGameScoreById = async (req, res) => {
    const { id } = req.params; // Extract ID from request parameters
    try {
        // Retrieve gamescore data by ID
        const gamescore = await gameScoreService.getGameScoreById(id);
        if (gamescore) {
            // Respond with success if gamescore found
            res.status(200).json({ status: true, gamescore, message: "GameScore found" });
        } else {
            // Respond with 404 if gamescore not found
            res.status(404).json({ status: false, error: 'GameScore not found' });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ status: false, error: 'Error retrieving GameScore' });
    }
};
// Controller to get a gameScore For a Children
const getGameScoreByChildrenId = async (req, res) => {
    console.log("Get gamescore by id",req.params)
    const { id } = req.params; // Extract ID from request parameters
    try {
        // Retrieve gamescore data by ID
        const gamescore = await gameScoreService.getGameScoreByChildrenId(id);
        if (gamescore) {
            // Respond with success if gamescore found
            res.status(200).json({ status: true, gamescore, message: "GameScore found" });
        } else {
            // Respond with 404 if gamescore not found
            res.status(404).json({ status: false, error: 'GameScore not found' });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ status: false, error: 'Error retrieving GameScore' });
    }
};

// Controller to create a new gamescore
const createGameScore = (req, res) => {
    try {
        // Use game service to create a new gamescore
        const gamescore = gameScoreService.createGameScore(req.body);

        gamescore
            .then(() => {
                // Respond with success status when gamescore is created
                res.status(201).json({ status: true, message: "GameScore created successfully" });
            })
            .catch((error) => {
                // Handle specific and generic errors
                if (error.message === 'P2002') {
                    res.status(403).json({ status: false, message: "New user cannot be created with this email", code: "P2002" });
                } else {
                    res.status(404).json({ status: false, message: "GameScore creation unsuccessful Please Provide full details", code: "P4002" });
                }
            });
    } catch (error) {
        // Handle server error
        res.status(500).json({ error: `Game could not be created - ${error}` });
    }
};

// Controller to update an existing gameScore
const updateGameScore = async (req, res) => {
    const { id } = req.params; // Extract ID from request parameters
    try {
        // Use gamescore service to update gamescore data
        const gamescore = await gameScoreService.updateGameScore(id, req.body);
        if (gamescore) {
            // Respond with success if gamescore is updated
            res.status(200).json({ status: true, message: "Gamescore updated successfully" });
        } else {
            // Respond with 404 if gamescore not found for update
            res.status(404).json({ status: false, message: "No user found to update" });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ error: 'Gamescore could not be updated' });
    }
};

// Controller to delete a gamescore
const deleteGameScore = async (req, res) => {
    const { id } = req.params; // Extract ID from request parameters
    const userId = req.body.id; // Get user ID from request body
    try {
        // Use game service to delete gamescore
        const response = await gameScoreService.deleteGameScore(id, userId);
        if (response === 'Not a Game') {
            res.status(403).json({ status: false, message: response });
        } else if (response === 'Game not found') {
            res.status(404).json({ status: false, message: response });
        } else {
            res.status(200).json({ status: true, message: 'Gamescore deleted' });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ status: false, error: 'Gamescore could not be deleted' });
    }
};


// Export all controllers
module.exports = {
    getAllGameScores,
    getGameScoreById,
    getGameScoreByChildrenId,
    createGameScore,
    updateGameScore,
    deleteGameScore
};
