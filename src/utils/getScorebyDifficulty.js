const getScoreByDifficulty = (diff) =>{
    switch(diff){
        case "Easy":
            return 10
        case "Medium":
            return 20;
        case "Hard":
            return 30;
        default:
            return 0;
    }
}

module.exports ={
    getScoreByDifficulty
}