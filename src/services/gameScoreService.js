const gameScoreModel = require('../models/gameScoreModel');
const { Prisma } = require("@prisma/client");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


// Fetch all gamescore and their associated game
const getAllGameScores = async () => {
    const gamescores = await gameScoreModel.findMany({
        include: {
            children: true,
            game: true
        }
    });
    return gamescores;
};

// Fetch a specific gamescore by their ID
const getGameScoreById = async (id) => {
    return await gameScoreModel.findUnique({
        where: { id }, // Find by unique ID
        include: {
            children: true,
            game: true
        }
    });
};

// Get scores of  a specific children
const getGameScoreByChildrenId = async (id) => {
    return await gameScoreModel.findMany({
        where: { children_id: id },
        include: {
            children: true,
            game: true
        }
    });
};

// Create a new gameScore
const createGameScore = async (gamescoreDetails) => {
    console.log("Incoming request to create a gameScore...");

    return new Promise((resolve, reject) => {
        const data = {
            name: gamescoreDetails.name,
            score: gamescoreDetails.score,
            game_id: gamescoreDetails.game_id,
            children_id: gamescoreDetails.children_id,
        };
        // Create a new gamescore in the database
        gameScoreModel.create({ data }).then((res) => {
            console.log("gamescore created successfully:", res);
            resolve(true);
        }).catch((error) => {
            console.log("Failed to create gamescore.", error);
            if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
                console.log("Error in gamescore creation", error);
                reject(new Error("P2002")); // Duplicate error
            } else {
                console.log("Error in gamescore creation", error);
                reject(new Error("Unexpected error"));
            }
        }).catch((error) => {
            console.log("Error in gamescore creation", error);
            reject(new Error("Unexpected error"));
        });
    });
};

// Update gameScore details
const updateGameScore = async (id, gamescoreDetails) => {
    // Check if the gameScore exists
    const isfound = await gameScoreModel.findUnique({ where: { id } });
    if (isfound) {
        return new Promise((resolve, reject) => {
            gameScoreModel.update({
                where: { id },
                data: gamescoreDetails,
            }).then((response) => {
                resolve(response);
            }).catch((error) => {
                reject(error);
            });
        });
    } else {
        return false; // gamescore not found
    }
};

// Delete a gameScore by ID
const deleteGameScore = async (id, userId) => {
    console.log("Incoming request to delete gamescore");

    const gamescore = await gameScoreModel.findUnique({ where: { id } });
    if (gamescore) {
        try {
            console.log("gamescore found, proceeding to delete...");
            await gameScoreModel.delete({ where: { id } });
            console.log("gamescore deleted successfully");
            return true;
        } catch (error) {
            console.error("Error while deleting gamescore:", error);
            return error;
        }
    } else {
        console.log("gamescore not found");
        return 'Gamescore not found';
    }
};

// Export the service functions
module.exports = {
    getAllGameScores,
    getGameScoreById,
    getGameScoreByChildrenId,
    createGameScore,
    updateGameScore,
    deleteGameScore,
};
