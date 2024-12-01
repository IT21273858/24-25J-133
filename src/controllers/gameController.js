const gameService = require('../services/gameService');
const gameModel = require('../models/gameModel');

// Controller to get all Games
const getAllGames = async (req, res) => {
    try {
        // Retrieve all Game using the game service
        const games = await gameService.getAllGames();
        if (games) {
            // Respond with a success status and the data
            res.status(200).json({ status: true, games, message: "Data retrieved successfully" });
        } else {
            // If no Game found, respond with 404
            res.status(404).json({ status: false, message: "No data available" });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ error: 'Error retrieving Game' });
    }
};

// Controller to get a game by ID
const getGameById = async (req, res) => {
    const { id } = req.params; // Extract ID from request parameters
    try {
        // Retrieve game data by ID
        const game = await gameService.getGameById(id);
        if (game) {
            // Respond with success if game found
            res.status(200).json({ status: true, game, message: "Game found" });
        } else {
            // Respond with 404 if game not found
            res.status(404).json({ status: false, error: 'Game not found' });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ status: false, error: 'Error retrieving Game' });
    }
};

// Controller to create a new game
const createGame = (req, res) => {
    try {
        // Use game service to create a new game
        const game = gameService.createGame(req.body);

        game
            .then(() => {
                // Respond with success status when game is created
                res.status(201).json({ status: true, message: "Game created successfully" });
            })
            .catch((error) => {
                // Handle specific and generic errors
                if (error.message === 'P2002') {
                    res.status(403).json({ status: false, message: "New user cannot be created with this email", code: "P2002" });
                } else {
                    res.status(404).json({ status: false, message: "Game creation unsuccessful Please Provide full details", code: "P4002" });
                }
            });
    } catch (error) {
        // Handle server error
        res.status(500).json({ error: `Game could not be created - ${error}` });
    }
};

// Controller to update an existing game
const updateGame = async (req, res) => {
    const { id } = req.params; // Extract ID from request parameters
    try {
        // Use game service to update game data
        const game = await gameService.updateGame(id, req.body);
        if (game) {
            // Respond with success if game is updated
            res.status(200).json({ status: true, message: "Game updated successfully" });
        } else {
            // Respond with 404 if game not found for update
            res.status(404).json({ status: false, message: "No user found to update" });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ error: 'Game could not be updated' });
    }
};

// Controller to delete a game
const deleteGame = async (req, res) => {
    const { id } = req.params; // Extract ID from request parameters
    const userId = req.body.id; // Get user ID from request body
    try {
        // Use game service to delete game
        const response = await gameService.deleteGame(id, userId);
        if (response === 'Not a Game') {
            res.status(403).json({ status: false, message: response });
        } else if (response === 'Game not found') {
            res.status(404).json({ status: false, message: response });
        } else {
            res.status(200).json({ status: true, message: 'Game deleted' });
        }
    } catch (error) {
        // Handle server error
        res.status(500).json({ status: false, error: 'Game could not be deleted' });
    }
};
// Export all controllers
module.exports = {
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame
};
