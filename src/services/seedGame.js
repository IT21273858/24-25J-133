const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const seedGames = async () => {
    const games = [
        // Shape Recognition Games
        {
            name: "Shape Identifier",
            level: "easy",
            description: "Identify shapes in images",
            model_type: "shape",
            instructions: "Select the shape shown in the image",
            play_time: "5",
        },
        {
            name: "Shape Sequence Builder",
            level: "medium",
            description: "Complete the sequence of shapes",
            model_type: "shape",
            instructions: "Arrange the shapes in the correct order",
            play_time: "7",
        },
        {
            name: "Advanced Shape Match",
            level: "hard",
            description: "Match shapes based on specific criteria",
            model_type: "shape",
            instructions: "Select all matching shapes from the options",
            play_time: "10",
        },
        // Pattern Recognition Games
        {
            name: "Pattern Completion",
            level: "easy",
            description: "Predict the next shape in a simple sequence",
            model_type: "pattern",
            instructions: "Select the next shape in the pattern",
            play_time: "5",
        },
        {
            name: "Pattern Memory Test",
            level: "medium",
            description: "Recall and predict sequences of increasing length",
            model_type: "pattern",
            instructions: "Memorize and predict the next in the sequence",
            play_time: "8",
        },
        {
            name: "Logical Pattern Solver",
            level: "hard",
            description: "Solve complex patterns and predict the next shape",
            model_type: "pattern",
            instructions: "Solve the puzzle based on logical patterns",
            play_time: "12",
        },
    ];

    for (const game of games) {
        await prisma.game.create({ data: game });
    }

    console.log("Game data seeded successfully!");
    await prisma.$disconnect();
};

seedGames().catch((e) => {
    console.error(e);
    prisma.$disconnect();
});
