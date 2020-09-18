var methodEnergy = require('method.Movement');
var roleUpgrader = require('role.Upgrader');

var roleBuilder = {

    /** @param {Creep} creep **/
    run: function(creep) {

        if(creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.building = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.building && creep.store.getFreeCapacity() == 0) {
            creep.memory.building = true;
            creep.say('🚧 build');
        }
        var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
        var sources = creep.room.find(FIND_SOURCES);
        if(!targets.length && creep.store[RESOURCE_ENERGY] == 50){
            roleUpgrader.run(creep)
        }
        if(creep.memory.building && targets.length) {
            if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
            }
        }
        if(!creep.memory.building && sources.length) {
            var dest = methodEnergy.nearest(creep)
            if(creep.harvest(dest) == ERR_NOT_IN_RANGE) {
                creep.moveTo(dest, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
    }
};

module.exports = roleBuilder;