var methodEnergy = require('method.Movement');


var roleUpgrader = {

    /** @param {Creep} creep **/
    run: function(creep) {
        //creep.pos.createConstructionSite(STRUCTURE_ROAD)
        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.upgrading && creep.store.getFreeCapacity() == 0) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        if(creep.memory.upgrading) {
            if(creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        else {
            var sources = creep.room.find(FIND_SOURCES);
            var dest = methodEnergy.dearest(creep)
            if(creep.harvest(dest) == ERR_NOT_IN_RANGE) {
                creep.moveTo(dest, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};

module.exports = roleUpgrader;