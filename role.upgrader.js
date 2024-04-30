var __constants = require('__constants');
var TICKS_LEFT = __constants.TICKS_LEFT;

var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if (creep.carry.energy == creep.carryCapacity) { creep.memory.tank = 'FULL' };
        if (creep.carry.energy == 0) { creep.memory.tank = 'EMPTY'};

        // IF CREEP HAS NO ENERGY, GO RECHARGE
        if(creep.memory.tank == 'EMPTY' && creep.ticksToLive > TICKS_LEFT) {
            // LOOK FOR STORAGE ITEMS AND CONTAINERS WITH ENERGY
            var containers = creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: function (structure) { return ((structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) && structure.store[RESOURCE_ENERGY] > 0); }});
			if(containers) {
                if(creep.withdraw(containers, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(containers, {visualizePathStyle: {stroke: '#ffaa00'}});
                }
            }
            // IF NONE ARE AROUND, GATHER ENERGY FROM CLOSEST SOURCE
            else {
                var sources = creep.pos.findClosestByRange(FIND_SOURCES);
                if(creep.harvest(sources) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(sources, {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }

        // NOW THAT YOU HAVE NO EXCUSES, GO TO WORK!
        else {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
	}
};

module.exports = roleUpgrader;