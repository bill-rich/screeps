var styles = require('styles')

module.exports = class {
  constructor(creep){
    this.creep = creep
  }
  run() {
    if(this.creep.selfMaintain()){
      return OK
    }
    if(!Memory.claimRoom){
      this.creep.memory.suicide = true
      this.creep.moveTo(Game.getObjectById(Memory.homespawn))
    }
    if(this.creep.room.name != Memory.claimRoom){
      const exitDir = Game.map.findExit(this.creep.room, Memory.claimRoom);
      const exit = this.creep.pos.findClosestByRange(exitDir);
      this.creep.moveTo(exit, {visualizePathStyle: styles.prio,
                          reusePath: 10});
    }
    else{
      let controller = this.creep.room.controller
      if(this.creep.claimController(controller) == ERR_NOT_IN_RANGE){
        this.creep.moveTo(controller)
      }
    }
  }
};

