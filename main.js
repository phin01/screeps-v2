// OVERALL FUNCTIONS
var __f = require('__functions');

// CREEP ROLES
var roleHarvester = require('role.harvester');
var roleUpgrader = require('role.upgrader');
var roleBuilder = require('role.builder');

// SPAWN ROUTINE
var __spawn = require('spawn.recommendation');

// BUILD ROUTINE
var __build = require('build.recommendation');

module.exports.loop = function () {

	// CLEAR DEAD CREEPS FROM MEMORY
    for(var name in Memory.creeps) {
        if(!Game.creeps[name]) {
            delete Memory.creeps[name];
            console.log('Clearing non-existing creep memory:', name);
        }
    }

	/* ***************************************************** */
    /* SPAWN ROOM ROUTINES
    /* ***************************************************** */

    var spawnList = Game.spawns;
    for (spawn in spawnList) {

        // CHECK IF SPAWN IS UNDER ATTACK, OTHERWISE PUT THE TOWERS TO WORK ON REPAIRS
        // if(!__f.checkAttack(spawn)) { __f.towerRepair(spawn); }

		// CHECK BUILD RECOMMENDATIONS
		__build.buildRecommendation(spawn);

        // REPURPOSE BUILDERS IN SPAWN'S ROOM
        // __f.repurposeBuilders(spawn);

        // CREEP SPAWN RECOMMENDATION FOR CURRENT SPAWN'S ROOM
        __spawn.spawnRecommendation(spawn);

        // IF AVAILABLE, TRANSFER ENERGY BETWEEN LINKS IN SPAWN'S ROOM
        // __f.linkTransfer(spawn);
       
    }

	/* ***************************************************** */
    /* CREEP WORK ROUTINES
    /* ***************************************************** */

    for(var name in Game.creeps) {
        var creep = Game.creeps[name];

		if(creep.memory.role == 'harvester') { roleHarvester.run(creep); }
		if(creep.memory.role == 'upgrader') { roleUpgrader.run(creep); }
        if(creep.memory.role == 'builder') { roleBuilder.run(creep); }
	}


}
