var methodEnergy = require('method.Movement');


var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep, i) {
        var container = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER
            }
        })
        if(i>= container.length) {
            i = i - container.length
        }
        if(!creep.pos.isEqualTo(container[i].pos)){
            creep.moveTo(container[i])
            return
        }
        var mineSource = methodEnergy.nearest(creep)
        if(container[i].store.getFreeCapacity() > 0){
            creep.harvest(mineSource)
        }
    }
}

module.exports = roleMiner;