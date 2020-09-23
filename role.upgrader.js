
module.exports = class {
  constructor(creep){
    this.creep = creep
  }

  run(){
    if(this.creep.memory.upgrading && this.creep.store[RESOURCE_ENERGY] == 0) {
      this.creep.memory.upgrading = false;
      this.creep.say('harvest');
    }
    if(!this.creep.memory.upgrading && this.creep.store.getFreeCapacity() == 0) {
      this.creep.memory.upgrading = true;
      this.creep.say('upgrade');
    }
    var target = this.creep.room.controller;
    if(this.creep.memory.upgrading) {
      if(this.creep.upgradeController(target) == ERR_NOT_IN_RANGE) {
        //this.creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}})
        this.creep.autoPathTo(target, {visualizePathStyle: {stroke: '#ffffff'}})
      }
    }
    if(!this.creep.memory.upgrading) {
      this.creep.acquireEnergy()
    }
    
  }
}

