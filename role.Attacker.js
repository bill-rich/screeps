var roleAttacker = {
    /** @param {Creep} creep **/
    run: function(creep) {
        var target = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
            filter: function(object) {
                return object.getActiveBodyparts(ATTACK) >= 0;
            }
        });
        if (!target) {
            if(creep.room != Game.rooms['E2S45']){
                creep.say("NIL ERROR", true)
                creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo('E2S45')), {visualizePathStyle: {stroke: '#ffffff'}})
                //creep.moveTo(creep.room.findExitTo('E2S45'), {visualizePathStyle: {stroke: '#ffffff'}});
                //console.log(creep.moveTo(RoomPosition(27,37, creep.room.name), {visualizePathStyle: {stroke: '#ffffff'}}))

            }
        }
        else {
            creep.say("ELIMINATE", true)
            creep.moveTo(target);
            attack_ret = creep.attack(target);
            rattack_ret = creep.rangedAttack(target);

        }
    }
};

module.exports = roleAttacker;