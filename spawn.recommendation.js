var __c = require('__constants');
var __f = require('__functions');

function spawnRecommendation(SPAWN_NAME) {

    var ROOM_NAME = Game.spawns[SPAWN_NAME].room.name;

    /* ***************************************** */ 
    /* SPAWNING VARIABLES
    /* ***************************************** */ 

    // GET LIST OF CURRENT CREEPS, BY TYPE AND ROOM
    var harvesterList = __f.listOfCreeps(__c.ROLE_HARVESTER, 0, ROOM_NAME);
    var builderList = __f.listOfCreeps(__c.ROLE_BUILDER, 0, ROOM_NAME);
    var upgraderList = __f.listOfCreeps(__c.ROLE_UPGRADER, 0, ROOM_NAME);
    var wallRepairerList = __f.listOfCreeps(__c.ROLE_WALL_REPAIRER, 0, ROOM_NAME);
    var harvester0_List = __f.listOfCreeps(__c.ROLE_DEDICATED_HARVESTER, 0, ROOM_NAME);
    var harvester1_List = __f.listOfCreeps(__c.ROLE_DEDICATED_HARVESTER, 1, ROOM_NAME);
    var transporterList = __f.listOfCreeps(__c.ROLE_TRANSPORTER, 0, ROOM_NAME);

    var creepList = []

    // LIST OF TOTAL CREEPS PER ROOM
    var totalCreeps = 0; 
    var i = 0;
    for(var creep in Game.creeps) {
        if(Game.creeps[creep].memory.room == ROOM_NAME) {
            totalCreeps++;
        }
     };

    // CURRENT ENERGY LEVEL AVAILABLE FOR SPAWNING AND TOTAL ENERGY CAPACITY
    var actualEnergy = Game.spawns['' + SPAWN_NAME +''].room.energyAvailable;
    var possibleEnergy = Game.spawns['' + SPAWN_NAME +''].room.energyCapacityAvailable;

    // VARIABLES FOR NEXT CREEP TYPE
    var recommendedRole;
    var recommendedIndex = 0;
    var creepAction;
    var baseBody = [WORK, CARRY, MOVE];
    var recommendedBody = baseBody;

    // IF ALL HELL HAS BROKEN LOOSE AND THE BASE IS EMPTY, START FRESH WITH A HUMBLE HARVESTER
    if (totalCreeps == 0) {
        recommendedRole = __c.ROLE_HARVESTER;
        recommendedBody = baseBody;
    }

    // IF THINGS ARE GOING WELL, SPAWN THE BASIC, TOP PRIORITY CREEPS:
    //    - 1 UPGRADER
    //    - TBD
    //    - TBD

    else {
        if(upgraderList.length < 1){
            recommendedRole = __c.ROLE_UPGRADER;
            recommendedBody = baseBody;
        }
    }



    // IF A CREEP IS NEEDED, SPAWN IT!
    if(recommendedRole) {
        __f.spawnCreepOfType(recommendedRole, recommendedBody, recommendedIndex, ROOM_NAME, SPAWN_NAME);
    }

    // console.log('[' + Game.spawns[SPAWN_NAME].room.name + '|' + SPAWN_NAME + ']' +': ' + (harvester1_List.length + harvester0_List.length) + ' harvesters | ' + builderList.length + ' builders | ' + upgraderList.length + ' upgraders | ' + wallRepairerList.length + ' repairers | ' + transporterList.length + ' transporters --- ' + Game.spawns['' + SPAWN_NAME +''].room.energyAvailable + ' room energy - Next spawn: ' + recommendedRole);
    console.log('[' + Game.spawns[SPAWN_NAME].room.name + '|' + SPAWN_NAME + ']' +': ' + (harvesterList.length) + ' harvesters | ' + builderList.length + ' builders | ' + upgraderList.length + ' upgraders | ' + wallRepairerList.length + ' repairers | ' + transporterList.length + ' transporters --- ' + Game.spawns['' + SPAWN_NAME +''].room.energyAvailable + ' room energy - Next spawn: ' + recommendedRole);

}

module.exports = { spawnRecommendation };
