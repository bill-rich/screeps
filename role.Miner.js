var methodEnergy = require('method.Movement');


var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep, i) {
        var container = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER
            }
        })
        if(!creep.pos.isEqualTo(container[0].pos)){
            if(!creep.moveTo(container[0])){
                creep.say("blocked")
            }
            return
        }
        var mineSource = methodEnergy.nearest(creep)
        if(container[0].store.getFreeCapacity() > 0){
            creep.harvest(mineSource)
        }
    }
}

module.exports = roleMiner;