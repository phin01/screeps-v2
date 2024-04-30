var __constants = require('__constants');


/* **************************************************************************** */
/* 
/* SPAWN FUNCTIONS
/* 
/* **************************************************************************** */

// RETURN A LIST OF CREEPS OF A CERTAIN TYPE
function listOfCreeps(creepType, i, currentRoom) {
    i = i || 0;
    var creepTypeList = _.filter(Game.creeps, (creep) => { return creep.memory.role == creepType && creep.memory.index == i && creep.memory.room == currentRoom});
    // var creepTypeList = _.filter(Game.creeps, (creep) => { return (creep.memory.role == creepType && creep.memory.index == i && creep.memory.room == currentRoom) || (creep.memory.role == creepType && creep.memory.index == i)});
    return creepTypeList;
}

// SPAWN A CREEP OF A CERTAIN TYPE
function spawnCreepOfType(creepType, creepLevel, i, currentRoom, currentSpawn) {
    i = i || 0;
    currentRoom = currentRoom || 'W3S15';
    var newName = currentRoom + '_' + creepType + '_' + Game.time;
        var result = Game.spawns[currentSpawn].spawnCreep(creepLevel, newName, {memory: { role: '' + creepType + '', tank: 'EMPTY', index: i, room: ''+ currentRoom +'' }});
        if(result == 0) {
            console.log('Spawning new ' + creepType + ': ' + newName);    
        }
}

// CHECK IF THERE'S ENOUGH ENERGY IN THE ROOM TO ALLOW FOR A NEW SPAWN
function enoughEnergy() {
    var roomEnergy = Game.spawns['' + __constants.SP_NAME +''].room.energyAvailable;
    if (roomEnergy > __constants.MINIMUM_ENERGY) {
        return true;
    }
    else {
        return false;
    }
}

// RETURN CURRENT ROOM ENERGY
function roomEnergy() {
    return Game.spawns['' + __constants.SP_NAME +''].room.energyAvailable;
}

// CHECK IF A HARVESTER IS ON THE BRINK OF DEATH (ALLOW TIME TO RESPAWN IT PROPERLY)
function harvesterDying() {

    var harvester0_List = listOfCreeps('dedicatedHarvester', 0);
    var harvester1_List = listOfCreeps('dedicatedHarvester', 1);
    var dying = false;

    for (var name in harvester0_List) {
        if(harvester0_List[name].ticksToLive < __constants.HARVERSTER_TICKS_LEFT) {
            dying = true;
        }
    }

    for (var name in harvester1_List) {
        if(harvester1_List[name].ticksToLive < __constants.HARVERSTER_TICKS_LEFT) {
            dying = true;
        }
    }
    return dying;
}

// RETURN COST OF HARVESTER BASED ON BODY TYPE
function harvesterCost(hvArray) {
    var cost = 0;

    for(var i = 0; i < hvArray.length; ++i) {
        if(hvArray[i] == WORK) { cost = cost + 100}
        if(hvArray[i] == CARRY || hvArray[i] == MOVE) { cost = cost + 50}
    }

    return cost;

}

// IN CASE ALL CONSTRUCTIONS ARE OVER, REPURPOSE BUILDERS INTO TRANSPORTERS
function repurposeBuilders(currentSpawn) {
    var currentRoom = Game.spawns[currentSpawn].room.name;
    var constructionSites = Game.spawns[currentSpawn].room.find(FIND_CONSTRUCTION_SITES);
    var buildersList = listOfCreeps(__constants.ROLE_BUILDER, 0, currentRoom);

    if(buildersList.length > 0 && constructionSites.length < 1) {
        for (var name in buildersList) {
            console.log(buildersList[name] + ' shall become more useful as a transporter...');
            buildersList[name].memory.role = __constants.ROLE_TRANSPORTER;
        }

    }

}



/* **************************************************************************** */
/* 
/* REPAIR FUNCTIONS
/* 
/* **************************************************************************** */


// DETERMINE WHETHER A STRUCTURE IS BROKEN ENOUGH TO WARRANT A PERSONAL REPAIRER CREEP
function brokenStructures() {
    var targets = Game.spawns['' + __constants.SP_NAME + ''].room.find(FIND_STRUCTURES, {
        filter: object => object.hits < object.hitsMax * __constants.REPAIR_THRESHOLD });

    if(targets.length > 0) {
        //console.log("Broken structure!");
        return true;
    }
    else {
        return false;
    }
}

// RETURNS AN ARRAY OF STRUCTURES BASED ON STRUCTURE TYPE, REPAIR THRESHOLD AND MINIMUM AMOUNT OF MAX HITS
// !! WORKS WITH fixStructure FUNCTION !!
function findStructure(creep, structType, minHits) {
    minHits = minHits || 0;
    
    var doubleArray = [];
    doubleArray[0] = creep.room.find(FIND_STRUCTURES, { filter: (structure) => { return ((structure.structureType == structType) && structure.hits < structure.hitsMax * __constants.EMERGENCY_REPAIR_THRESHOLD && structure.hitsMax > minHits);}});
    doubleArray[1] = creep.room.find(FIND_STRUCTURES, { filter: (structure) => { return ((structure.structureType == structType) && structure.hits < structure.hitsMax * __constants.REPAIR_THRESHOLD && structure.hitsMax > minHits);}});
    
    return doubleArray;
}

// FIX STRUCTURE FROM ARRAY TYPE
function fixStructure(creep, structureArray) {
    if(creep.repair(structureArray[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(structureArray[0], {visualizePathStyle: {stroke: '#ffffff'}});
    }
}


// RETURN CLOSES STRUCTURE OF A CERTAIN TYPE BELOW REPAIR THRESHOLD
// !! WORKS WITH fixClosestStructure FUNCTION !!
function findClosestBrokenStructure(creep, structType, minHits) {
    minHits = minHits || 0;
    var struct = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: function (structure) { return structure.structureType == structType && structure.hits < structure.hitsMax * __constants.REPAIR_THRESHOLD && structure.hitsMax > minHits; }});
    return struct;
}

// FIX CLOSEST STRUCTURE
function fixClosestStructure(creep, struct) {
    if(creep.repair(struct) == ERR_NOT_IN_RANGE) {
        creep.moveTo(struct, {visualizePathStyle: {stroke: '#ffffff'}});
    }
}


// TOWER REPAIR
function towerRepair(currentSpawn) {
    // spawnBase = Game.spawns['' + currentSpawn + '']
    spawnBase = Game.spawns[currentSpawn]

    // TOWERS WITH ENOUGH ENERGY TO SPEND ON REPAIRS ENERGY
    var allTowers = spawnBase.room.find(FIND_STRUCTURES, { filter: function (structure) { return structure.structureType == STRUCTURE_TOWER && structure.energy > structure.energyCapacity * __constants.TOWER_REPAIR_THRESHOLD; }});

    for (var towerName in allTowers) {
        tower = allTowers[towerName];

        // GET LIST OF STRUCTURES THAT COULD BE FIXED BY THE TOWER
        var nearbyRoads = findStructure(tower, STRUCTURE_ROAD, 0);
        var nearbyContainers = findStructure(tower, STRUCTURE_CONTAINER, 0);
        var nearbyLinks = findStructure(tower, STRUCTURE_LINK, 0);
        var nearbyExtractors = findStructure(tower, STRUCTURE_EXTRACTOR, 0);

        // START INITIAL MAINTENANCE OF RAMPARTS
        initialRamparts = spawnBase.room.find(FIND_STRUCTURES, { filter: (structure) => { return ((structure.structureType == STRUCTURE_RAMPART) && structure.hits < __constants.RAMPART_INITIAL_REPAIR);}});
        if(initialRamparts.length > 0) {
            tower.repair(initialRamparts[0]);
        }

        // PERFORM EMERGENCY REPAIRS
        else if (nearbyRoads[0].length > 0) { tower.repair(nearbyRoads[0][0]); }
        else if (nearbyContainers[0].length > 0) { tower.repair(nearbyContainers[0][0]); }
        else if (nearbyLinks[0].length > 0) { tower.repair(nearbyLinks[0][0]); }
        else if (nearbyExtractors[0].length > 0) { tower.repair(nearbyExtractors[0][0]); }

        // PERFORM REGULAR REPAIRS
        else if (nearbyRoads[1].length > 0) { tower.repair(nearbyRoads[1][0]); }
        else if (nearbyContainers[1].length > 0) { tower.repair(nearbyContainers[1][0]); }
        else if (nearbyLinks[1].length > 0) { tower.repair(nearbyLinks[1][0]); }
        else if (nearbyExtractors[1].length > 0) { tower.repair(nearbyExtractors[1][0]); }

        else { }

    }
}



/* **************************************************************************** */
/* 
/* DEFENSE FUNCTIONS
/* 
/* **************************************************************************** */

// CHECK IF THERE ARE ANY HOSTILE CREEPS NEARBY AN ALLY CREEP
function checkNearbyHostile(creep) {
    var hostiles = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 10);
    if(hostiles.length > 0) {
        creep.moveTo(Game.spawns['' + __constants.SP_NAME + '']);
        creep.say('RUN FOR THE HILLS!😨');
        return true;
    }
    else {
        return false;
    }
}

// CHECK IF SPAWN IS UNDER ATTACK
function checkAttack(SPAWN_NAME) {
    spawnBase = Game.spawns[SPAWN_NAME]

    // HOSTILES AROUND SPAWN 
    var hostiles = spawnBase.pos.findInRange(FIND_HOSTILE_CREEPS, 40);

    // USE TOWER TO ATTACK ENEMY CREEPS
    var towers = spawnBase.room.find(
        FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
    towers.forEach(tower => tower.attack(hostiles[0]));

    // TOWERS WITH ENERGY LEFT
    var towers = spawnBase.room.find(FIND_STRUCTURES, { filter: function (structure) { return structure.structureType == STRUCTURE_TOWER && structure.energy > 0; }});

    // IF ANY HOSTILES AROUND AND NO TOWERS TO DEFEND SPAWN, ACTIVATE SAFE MODE!
    if(hostiles.length > 0 && towers.length == 0) {
        console.log(hostiles.length + ' Hostile Creeps around Spawn');
        spawnBase.room.controller.activateSafeMode();
    }

    if (hostiles.length > 0) {
        return true;
    }
    else { 
        return false;
    }


}



/* **************************************************************************** */
/* 
/* LOCALIZATION FUNCTIONS
/* 
/* **************************************************************************** */

function gatherEnergy(creep) {
    var containers = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: function (structure) { return ((structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] > 0); }});
			if(containers) {
                if(creep.withdraw(containers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            else {
                var nearbySource = creep.pos.findClosestByRange(FIND_SOURCES);
                if(creep.harvest(nearbySource) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(nearbySource, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
}

function gatherEnergySource(creep) {
    var sources = creep.room.find(FIND_SOURCES);
    if(creep.harvest(sources[creep.memory.index]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[creep.memory.index], {visualizePathStyle: {stroke: '#ffaa00'}});
    }
}


/* **************************************************************************** */
/* 
/* HARVESTING FUNCTIONS
/* 
/* **************************************************************************** */

function linkTransfer(currentSpawn) {
    // LINK CLOSEST TO SPAWN
    var spawnLink = Game.spawns[currentSpawn].pos.findClosestByRange(FIND_STRUCTURES, { filter: function(link) { return link.structureType == STRUCTURE_LINK }});
    // ALL OTHER LINKS, SORTED FROM DISTANCE TO SPAWN
    var otherLinks = Game.spawns[currentSpawn].room.find(FIND_STRUCTURES, { filter: function(link) { return link.structureType == STRUCTURE_LINK }});
    _.sortBy(otherLinks, s => Game.spawns[currentSpawn].pos.getRangeTo(s))

    // TRANSFER FROM FURTHEST LINK TO SPAWN LINK
    if(otherLinks.length > 0 && spawnLink) {
        otherLinks[0].transferEnergy(spawnLink);
    }
    
}



module.exports = { gatherEnergySource, repurposeBuilders, linkTransfer, towerRepair, findClosestBrokenStructure, fixClosestStructure, brokenStructures, checkNearbyHostile, checkAttack, enoughEnergy, listOfCreeps, harvesterDying, spawnCreepOfType, roomEnergy, harvesterCost, findStructure, fixStructure, gatherEnergy };