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
                creep.moveTo(creep.pos.findClosestByRange(creep.room.findExitTo('E2S45')));
                console.log("moving rooms");
            }
        }
        else {
            console.log("attacking");
            console.log("target");
            console.log(target);
            creep.moveTo(target);
            attack_ret = creep.attack(target);
            console.log(attack_ret);
            rattack_ret = creep.rangedAttack(target);
            console.log("rattack");
            console.log(rattack_ret);

        }
    }
};

module.exports = roleAttacker;