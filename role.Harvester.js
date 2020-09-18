var methodEnergy = require('method.Movement');


var roleHarvester = {

    /** @param {Creep} creep **/
    run: function(creep, i) {
        //creep.pos.createConstructionSite(STRUCTURE_ROAD)
        if(creep.store.getFreeCapacity() > 0) {
            //var dest = methodEnergy.ruins(creep)
            var dest = methodEnergy.nearest(creep)
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER)
                }
            })
            //dest = containers[0]
            if(creep.harvest(dest) == ERR_NOT_IN_RANGE) {
              creep.moveTo(dest, {visualizePathStyle: {stroke: '#ffaa00'}});
            }
        }
        else {
            var targets = creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_TOWER) &&
                        structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
                }
            });
            for(i=0; i<targets.length; i++){
                if(targets[i].structureType == STRUCTURE_EXTENSION) {
                    targets[0] = targets[i]
                    break
                }
            }
            if(targets.length > 0) {
                if(creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    creep.moveTo(targets[0], {visualizePathStyle: {stroke: '#ffffff'}});
                }
            }
        }
    }
};

module.exports = roleHarvester;
