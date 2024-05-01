var __c = require('__constants');
var __f = require('__functions');


function buildRecommendation(SPAWN_NAME) {

    

    const spawnBase = Game.spawns[SPAWN_NAME]
    const room = spawnBase.room;
    const currentConstructions = spawnBase.room.find(FIND_CONSTRUCTION_SITES);
    const currentStructures = spawnBase.room.find(FIND_STRUCTURES);

    var recommendedStructure;
    var recommendedPosition;

    // test path
    // const destPosition = new RoomPosition(35, 15, spawnBase.room.name);
    // const path = spawnBase.room.findPath(spawnBase.pos, destPosition);
    // console.log(path.length);


    
    // BUILD PRIORITY
    // Extensions (as many as Controller level allows)
    // Tower (Controller level 3)
    // Roads

    // Build extensions according to controller level capacity
    if(__f.filterByStructure(currentStructures, STRUCTURE_EXTENSION).length < getExtensionCapacity(room.controller.level)) {
        
        // first extension, build it around the spawn, ideally against a wall
        if(__f.filterByStructure(currentStructures, STRUCTURE_EXTENSION).length == 0){
            recommendedPosition = defineBuildPosition(spawnBase, 10, noAdjacent=false, nextToWall=true);
            // console.log(`${recommendedPosition.x} ${recommendedPosition.y}`);
        }
        
        // console.log('build ext');
    }


    // If no existing Towers and no towers under construction, create one
    if(__f.filterByStructure(currentStructures, STRUCTURE_TOWER).length == 0 && 
        __f.filterByStructure(currentConstructions, STRUCTURE_TOWER).length == 0 &&
        room.controller.level > 2) {
        recommendedStructure = STRUCTURE_TOWER;
        recommendedPosition = defineBuildPosition(spawnBase, 5);
        console.log(`Building recommendation: TOWER at X:${recommendedPosition.x} Y:${recommendedPosition.y}`);
        const result = spawnBase.room.createConstructionSite(recommendedPosition.x, recommendedPosition.y, STRUCTURE_TOWER);
        console.log(result);
    }


}



function defineBuildPosition(referenceStructure, range, noOccupiedAdjacent=true, nextToWall=false, minFreeAdjacent=0){
    var longestDistance = 0;
    var mostDistant;

    objects = referenceStructure.room.lookAtArea(referenceStructure.pos.y - range, 
                                                referenceStructure.pos.x - range, 
                                                referenceStructure.pos.y + range, 
                                                referenceStructure.pos.x + range, true);
    for (let i = 0; i < objects.length; i++) {
        var currentDistance = getDistanceBetweenPoints(referenceStructure.pos.x, referenceStructure.pos.y, objects[i].x, objects[i].y);
        if(currentDistance > longestDistance && 
            checkSpotAvailable(referenceStructure, objects[i].x, objects[i].y) &&
            checkIfNoAdjacentStructures(referenceStructure, objects[i].x, objects[i].y) == noOccupiedAdjacent
        ) {
            longestDistance = currentDistance;
            mostDistant = i;
        };
    }
    return objects[mostDistant];
}

function getDistanceBetweenPoints(x1, y1, x2, y2){
    return Math.sqrt((x2 - x1)^2 + (y2 - y1)^2)
}

function checkIfNoAdjacentStructures(referenceStructure, x, y){
    const adjacentSquares = referenceStructure.room.lookAtArea(y-1, x-1, y+1, x+1, true);
    for (let i = 0; i < adjacentSquares.length; i++) {
        if(['source', 'structure', 'creep'].includes(spotDetails[i].type)) return false;
        if(['wall'].includes(spotDetails[i].terrain)) return false;
    }
    return true;
}

function checkSpotAvailable(referenceStructure, spotX, spotY) {
    const spotDetails = referenceStructure.room.lookAt(spotX, spotY);
    for (let i = 0; i < spotDetails.length; i++){
        if(['source', 'structure', 'creep'].includes(spotDetails[i].type)) return false;
        if(['wall'].includes(spotDetails[i].terrain)) return false;
    }
    return true;
}

function checkIfNextToWall(referenceStructure, x, y){
    const adjacentSquares = referenceStructure.room.lookAtArea(y-1, x-1, y+1, x+1, true);
    for (let i = 0; i < adjacentSquares.length; i++) {
        if(['wall'].includes(spotDetails[i].terrain)) return true;
    }
    return false;
}


function getExtensionCapacity(controllerLevel) {
    switch(controllerLevel) {
        case 2:
            return 5;
        default:
            return (controllerLevel - 2) * 10;
    }
}


module.exports = { buildRecommendation };




