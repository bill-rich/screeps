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
        for(i=0; i<targets.length; i++){
            if(targets[i].structureType == STRUCTURE_TOWER){
                targets[0] = targets[i]
                break
            }
        }
        if(!targets.length && creep.store[RESOURCE_ENERGY] > 0){
            roleUpgrader.run(creep)
        }
        if(creep.memory.building && targets.length) {
            if(creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}}) < 0){
                    creep.move(Math.floor(Math.random() * 8))
                }
            }
        }
        if(!creep.memory.building) {
            //var dest = methodEnergy.nearest(creep)
            var dest = methodEnergy.sourceContainer(creep)
            if(creep.withdraw(dest, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                if(creep.moveTo(dest, {visualizePathStyle: {stroke: '#ffaa00'}}) < 0) {
                    creep.move(Math.floor(Math.random() * 8))
                }
            }
        }
    }
};

module.exports = roleBuilder;