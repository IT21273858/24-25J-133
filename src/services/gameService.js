const gameModel = require('../models/gameModel');
const { Prisma } = require("@prisma/client");

// Fetch all games and their associated game
const getAllGames = async () => {
    const game = await gameModel.findMany();
    return game;
};

// Fetch a specific game by their ID
const getGameById = async (id) => {
    return await gameModel.findUnique({
        where: { id }, // Find by unique ID
    });
};

// Create a new game
const createGame = async (gameDetails) => {
    console.log("Incoming request to create a game...");

    return new Promise((resolve, reject) => {
        const data = {
            name: gameDetails.name,
            level: gameDetails.level,
            password: hashedPassword,
            description: gameDetails.description,
            play_time: gameDetails.play_time,
        };
        // Create a new game in the database
        gameModel.create({ data }).then((res) => {
            console.log("game created successfully:", res);
            resolve(true);
        }).catch((error) => {
            console.log("Failed to create game account.", error);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                console.log("Error in game creation", error);
                reject(new Error("P2002")); // Duplicate error
            } else {
                console.log("Error in game creation", error);
                reject(new Error("Unexpected error"));
            }
        }).catch((error) => {
            console.log("Error in game creation", error);
            reject(new Error("Unexpected error"));
        });
    });
};

// Update game details
const updateGame = async (id, gameDetails) => {
    // Check if the game exists
    const isfound = await gameModel.findUnique({ where: { id } });
    if (isfound) {
        return new Promise((resolve, reject) => {
            gameModel.update({
                where: { id },
                data: gameDetails,
            }).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    } else {
        return false; // game not found
    }
};

// Delete a game by ID
const deleteGame = async (id, userId) => {
    console.log("Incoming request to delete game");

    const game = await gameModel.findUnique({ where: { id } });
    if (game) {
        try {
            console.log("game found, proceeding to delete...");
            await gameModel.delete({ where: { id } });
            console.log("game deleted successfully");
            return true;
        } catch (error) {
            console.error("Error while deleting game:", error);
            return error;
        }
    } else {
        console.log("game not found");
        return 'Game not found';
    }
};

// Export the service functions
module.exports = {
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame
};
