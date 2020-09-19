var methodEnergy = require('method.Movement');


var roleRunner = {

    /** @param {Creep} creep **/
    run: function(creep, i) {
        if(creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
            creep.memory.loaded = false
        }
        if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
            creep.memory.loaded = true
        }
        var containers = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER
            }
        })
        var full = 0
        var low = 0
        for(var i = 0; i < containers.length; i++){
            if(containers[i].store.getFreeCapacity(RESOURCE_ENERGY) < 1000){
                full = containers[i]
            }
            if(containers[i].store.getUsedCapacity(RESOURCE_ENERGY) < 1000){
                low = containers[i]
            }
        }
        storageContainer = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_STORAGE
            }
        })
       
        if(creep.memory.loaded && low) {
            if(creep.transfer(low, RESOURCE_ENERGY) < 0){
                creep.moveTo(low)
            }
            return
        }
        else if(full && !creep.memory.loaded) {
            if(creep.withdraw(full, RESOURCE_ENERGY) < 0){
                creep.moveTo(full)
            }
            return
        }
        if(storageContainer[0].store.getFreeCapacity() > 0 && full) {
            if(creep.transfer(storageContainer[0], RESOURCE_ENERGY) < 0){
                creep.moveTo(storageContainer[0])
            }
            return
        }
            
    }
}
        
module.exports = roleRunner;