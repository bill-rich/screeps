var roleExpander = {

    /** @param {Creep} creep **/
    run: function(creep) {
        if(creep.room != Game.rooms['E47S4']){
            creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo('E47S4')));
            return            
        }
        if(creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
        }
    }
};

module.exports = roleExpander;