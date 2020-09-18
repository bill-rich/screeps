var methodEnergy = require('method.Movement');


var roleMiner = {

    /** @param {Creep} creep **/
    run: function(creep, i) {
        if(creep.harvest(Game.rooms['E47S5'].find(FIND_SOURCES)[1]) == ERR_NOT_IN_RANGE) {
            creep.moveTo(4,16, {visualizePathStyle: {stroke: '#ffaa00'}});
        }
    }
}

module.exports = roleMiner;