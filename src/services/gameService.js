const gameModel = require('../models/gameModel');
const { Prisma } = require("@prisma/client");
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
            model_type: gameDetails.model_type,
            instructions: gameDetails.instructions,
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


const assignGameToChild = async (childId, level) => {
    try {
        // Fetch a random game for the given level
        const game = await prisma.game.findFirst({
            where: { level },
        });

        if (!game) {
            return {
                success: false,
                message: "No games available for the specified level.",
            };
        }

        // Check if a ChildLevel record exists
        let childLevel = await prisma.childLevel.findFirst({
            where: { children_id: childId },
        });

        // If no ChildLevel record exists, create one
        if (!childLevel) {
            childLevel = await prisma.childLevel.create({
                data: {
                    children_id: childId,
                    level: 0, // Default level
                    current_game_id: game.id, // Assign the current game
                },
            });
        } else {
            // Update the current game for the existing ChildLevel record
            await prisma.childLevel.update({
                where: { id: childLevel.id },
                data: {
                    current_game_id: game.id,
                },
            });
        }

        return {
            success: true,
            message: "Game assigned successfully.",
            data: {
                game,
                childLevel: { ...childLevel, current_game_id: game.id },
            },
        };
    } catch (error) {
        console.error("Error assigning game:", error.message);
        throw new Error("An error occurred while assigning the game.");
    }
};

// Fetch Assigned game for a child
const getAssignedGameForChild = async (childId) => {
    try {
        // Fetch the current child level and assigned game
        const childLevel = await prisma.childLevel.findFirst({
            where: { children_id: childId },
            include: {
                children: true, // Include child details
                game: true,     // Include the current game details
            },
        });

        if (!childLevel) {
            return {
                success: false,
                message: "No game assigned to this child.",
            };
        }

        return {
            success: true,
            data: {
                currentLevel: childLevel.level,
                currentGame: childLevel.game, // Current assigned game
                childDetails: childLevel.children, // Child details
            },
            message: "Assigned game retrieved successfully.",
        };
    } catch (error) {
        console.error("Error fetching assigned game:", error.message);
        throw new Error("An error occurred while fetching the assigned game.");
    }
};


// Verify and Update the level
const verifyGameAndUpdateLevel = async (childId, gameId, gameStatus) => {
    try {
        // Fetch the current child level
        const childLevel = await prisma.childLevel.findFirst({
            where: { children_id: childId },
        });

        if (!childLevel) {
            return {
                success: false,
                message: "Child level record not found.",
            };
        }

        // Fetch the current game
        const game = await prisma.game.findUnique({
            where: { id: gameId },
        });

        if (!game) {
            return {
                success: false,
                message: "Game not found.",
            };
        }

        // Check the game status (won or lost)
        if (gameStatus === "won") {
            // Increment the child's level
            const updatedChildLevel = await prisma.childLevel.update({
                where: { id: childLevel.id },
                data: {
                    level: childLevel.level + 1,
                },
            });

            return {
                success: true,
                message: "Game completed successfully. Child's level has been improved.",
                data: updatedChildLevel,
            };
        } else if (gameStatus === "lost") {
            return {
                success: true,
                message: "Game completed, but the child did not win. Level remains unchanged.",
            };
        } else {
            return {
                success: false,
                message: "Invalid game status provided.",
            };
        }
    } catch (error) {
        console.error("Error verifying game and updating level:", error.message);
        throw new Error("An error occurred while verifying the game or updating the level.");
    }
};


// Export the service functions
module.exports = {
    getAllGames,
    getGameById,
    createGame,
    updateGame,
    deleteGame,
    assignGameToChild,
    getAssignedGameForChild,
    verifyGameAndUpdateLevel,
};
