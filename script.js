// Implementing category-based voting for shirt and board designs
// Users can vote 2 times for each category

let maxVotesShirt = 2; // Max votes for shirt designs
let maxVotesBoard = 2; // Max votes for board designs

let currentVotesShirt = 0; // Current votes for shirt designs
let currentVotesBoard = 0; // Current votes for board designs

function voteForShirt(designId) {
    if (currentVotesShirt < maxVotesShirt) {
        // Logic to register vote for shirt design
        currentVotesShirt++;
        console.log(`Voted for shirt design: ${designId}`);
    } else {
        console.log('Maximum votes reached for shirt designs.');
    }
}

function voteForBoard(designId) {
    if (currentVotesBoard < maxVotesBoard) {
        // Logic to register vote for board design
        currentVotesBoard++;
        console.log(`Voted for board design: ${designId}`);
    } else {
        console.log('Maximum votes reached for board designs.');
    }
}