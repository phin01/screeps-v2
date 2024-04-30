var __c = require('__constants');
var __f = require('__functions');


var roleHarvester = {
    /** @param {Creep} creep **/
    run: function(creep) {

        // GATHER ENERGY FROM LOCAL STORAGE OR NEARBY SOURCES
        if(creep.carry.energy < creep.carryCapacity && creep.ticksToLive > __c.TICKS_LEFT) {
            __f.gatherEnergy(creep);
        }
        else {

            // CHECK IF TOWERS ARE AVAILABLE AND IN NEED OF ENERGY (HIGH PRIORITY!)
            var towers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => { return structure.structureType == STRUCTURE_TOWER && structure.energy < structure.energyCapacity; }});

            if (towers.length > 0) {
                if(creep.transfer(towers[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(towers[0], {visualizePathStyle: {stroke: '#ffffff'}});} 
            }

            // CHECK IF OTHER STRUCTURES ARE IN NEED OF ENERGY (FOCUS ON SPAWNING STRUCTURES, NO STORING ENERGY FROM REGULAR HARVESTERS)
            else {
                var targets = creep.room.find(FIND_STRUCTURES, {
                    filter: (structure) => {
                        return (structure.structureType == STRUCTURE_EXTENSION || structure.structureType == STRUCTURE_SPAWN) &&
                            structure.energy < structure.energyCapacity;
                    }
                });

                if(targets.length > 0) {
                    if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }

            }
            
        }
    }
	
};

module.exports = roleHarvester;