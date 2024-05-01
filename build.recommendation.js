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
    // const destPosition = new RoomPosition(32, 18, spawnBase.room.name);
    // const path = spawnBase.room.findPath(spawnBase.pos, destPosition);
    // console.log(checkSpotAvailable(spawnBase, destPosition.x, destPosition.y));


    
    // BUILD PRIORITY
    // Extensions (as many as Controller level allows)
    // Tower (Controller level 3)
    // Roads

    // Build extensions according to controller level capacity
    const currentExtensions = __f.filterByStructure(currentStructures, STRUCTURE_EXTENSION).concat( 
                                __f.filterByStructure(currentConstructions, STRUCTURE_EXTENSION));

    if(currentExtensions.length < getExtensionCapacity(room.controller.level)) {
        // first extension, build it around the spawn, ideally against a wall
        if(currentExtensions.length == 0){
            recommendedPosition = defineBuildPosition(spawnBase, 10, noOccupiedAdjacent=false, nextToWall=true, minSurroundingWalls=3);
            if(recommendedPosition) {
                buildStructure(spawnBase, recommendedPosition.x, recommendedPosition.y, STRUCTURE_EXTENSION);
            }                
            else{
                console.log("Could not find a suitable location to build first EXTENSION");
            }
        }

        // Additional extensions, prioritize building in locations:
        // - Next to existing extensions
        // - Next to walls
        // - With as many adjacent free squares possible, for easier access
        // Decrease restrictions if they don't match
        else {
            for (let i = 0; i < currentExtensions.length; i++) {
                var ext = currentExtensions[i];
                console.log(`Eval ${ext.pos.x} ${ext.pos.y}`);
                recommendedPosition = defineBuildPosition(ext, 1, noOccupiedAdjacent=false, nextToWall=true, minSurroundingWalls=3);
                if(recommendedPosition) {
                    buildStructure(spawnBase, recommendedPosition.x, recommendedPosition.y, STRUCTURE_EXTENSION);
                    break;
                }
                recommendedPosition = defineBuildPosition(ext, 1, noOccupiedAdjacent=false, nextToWall=true, minSurroundingWalls=2);
                if(recommendedPosition) {
                    buildStructure(spawnBase, recommendedPosition.x, recommendedPosition.y, STRUCTURE_EXTENSION);
                    break;
                }
                recommendedPosition = defineBuildPosition(ext, 1, noOccupiedAdjacent=false, nextToWall=true, minSurroundingWalls=1);
                if(recommendedPosition) {
                    buildStructure(spawnBase, recommendedPosition.x, recommendedPosition.y, STRUCTURE_EXTENSION);
                    break;
                }
                else{
                    console.log(`Could not find a suitable location to build EXTENSION #${currentExtensions.length + 1}`);
                }
            }
        }
    }


    // If no existing Towers and no towers under construction, create one
    if(__f.filterByStructure(currentStructures, STRUCTURE_TOWER).length == 0 && 
        __f.filterByStructure(currentConstructions, STRUCTURE_TOWER).length == 0 &&
        room.controller.level > 2) {
        recommendedStructure = STRUCTURE_TOWER;
        recommendedPosition = defineBuildPosition(spawnBase, 5);
        console.log(`Building recommendation: TOWER at X:${recommendedPosition.x} Y:${recommendedPosition.y}`);
        buildStructure(recommendedPosition.x, recommendedPosition.y, STRUCTURE_TOWER);
    }


}



function defineBuildPosition(referenceStructure, range, noOccupiedAdjacent=true, nextToWall=false, minSurroundingWalls=0, flexSurroundingWalls=false){
    var longestDistance = 0;
    var mostDistant;
    // console.log(`${flexSurroundingWalls} ${minSurroundingWalls}`);

    objects = referenceStructure.room.lookAtArea(referenceStructure.pos.y - range, 
                                                referenceStructure.pos.x - range, 
                                                referenceStructure.pos.y + range, 
                                                referenceStructure.pos.x + range, true);
    for (let i = 0; i < objects.length; i++) {
        var currentDistance = getDistanceBetweenPoints(referenceStructure.pos.x, referenceStructure.pos.y, objects[i].x, objects[i].y);
        if(currentDistance >= longestDistance && 
            checkSpotAvailable(referenceStructure, objects[i].x, objects[i].y) && 
            checkIfNoAdjacentStructures(referenceStructure, objects[i].x, objects[i].y) == noOccupiedAdjacent &&
            checkIfNextToWall(referenceStructure, objects[i].x, objects[i].y) == nextToWall &&
            checkNumberAdjacentWalls(referenceStructure, objects[i].x, objects[i].y) >= minSurroundingWalls
        ) {
            longestDistance = currentDistance;
            mostDistant = i;
        };
    }
    if(mostDistant)
        return objects[mostDistant];
    if(flexSurroundingWalls && minSurroundingWalls > 1)
        return defineBuildPosition(referenceStructure, range, noOccupiedAdjacent, nextToWall, minSurroundingWalls - 1, flexSurroundingWalls);
    return false;
}

function getDistanceBetweenPoints(x1, y1, x2, y2){
    return Math.sqrt(Math.abs(x2 - x1)^2 + Math.abs(y2 - y1)^2);
}

function checkIfNoAdjacentStructures(referenceStructure, x, y){
    const adjacentSquares = referenceStructure.room.lookAtArea(y-1, x-1, y+1, x+1, true);
    for (let i = 0; i < adjacentSquares.length; i++) {
        if(['source', 'structure', 'creep', 'constructionSite'].includes(adjacentSquares[i].type)) return false;
        if(['wall'].includes(adjacentSquares[i].terrain)) return false;
    }
    return true;
}

function checkSpotAvailable(referenceStructure, spotX, spotY) {
    const spotDetails = referenceStructure.room.lookAt(spotX, spotY);
    for (let i = 0; i < spotDetails.length; i++){
        if(['source', 'structure', 'creep', 'constructionSite'].includes(spotDetails[i].type)) return false;
        if(['wall'].includes(spotDetails[i].terrain)) return false;
    }
    return true;
}

function checkIfNextToWall(referenceStructure, x, y){
    const adjacentSquares = referenceStructure.room.lookAtArea(y-1, x-1, y+1, x+1, true);
    for (let i = 0; i < adjacentSquares.length; i++) {
        if(['wall'].includes(adjacentSquares[i].terrain)) return true;
    }
    return false;
}

function checkNumberAdjacentWalls(referenceStructure, x, y){
    const adjacentSquares = referenceStructure.room.lookAtArea(y-1, x-1, y+1, x+1, true);
    var adjacentWalls = 0;
    for (let i = 0; i < adjacentSquares.length; i++) {
        if(['wall'].includes(adjacentSquares[i].terrain))
            adjacentWalls++;
    }
    return adjacentWalls;
}

function buildStructure(referenceStructure, x, y, structureType){
    const result = referenceStructure.room.createConstructionSite(x, y, structureType);
    if (result == 0){
        console.log(`${structureType.toUpperCase()} queued for construction successfully`);
    } else {
        console.log(`ERROR: Could not build ${structureType.toUpperCase()} - Error Code ${result}`);
    }
}

function listSpotDetails(referenceStructure, x, y){
    const spotDetails = referenceStructure.room.lookAt(x, y);
    for (let i = 0; i < spotDetails.length; i++){
        console.log(`type: ${spotDetails[i].type} terrain: ${spotDetails[i].terrain}`);
    }
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




