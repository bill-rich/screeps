let roleUpgrader = require('role.upgrader')

module.exports = class {
  constructor(creep){
    this.creep = creep
  }

  run(){
    if(this.creep.memory.building && this.creep.store[RESOURCE_ENERGY] == 0) {
      this.creep.memory.building = false;
      this.creep.memory.target = ""
      this.creep.say('harvest');
    }
    if(!this.creep.memory.building && this.creep.store.getFreeCapacity() == 0) {
      this.creep.memory.building = true;
      this.creep.memory.target = ""
      this.creep.say('build');
    }
    if(!this.creep.memory.target && this.creep.memory.building){
      var unsortedTargets = this.creep.room.find(FIND_CONSTRUCTION_SITES);
      var targets = _.sortBy(unsortedTargets, target => this.creep.pos.getRangeTo(target))
      if(targets.length > 0){
        this.creep.memory.target = targets[0].id
      }
    }
    if(!this.creep.memory.target && this.creep.store[RESOURCE_ENERGY] > 0){
      var upgrader = new roleUpgrader(this.creep)
      upgrader.run()
    }
    if(this.creep.memory.building && this.creep.memory.target) {
      var target = Game.getObjectById(this.creep.memory.target)
      var result = this.creep.build(target)
      if(result == ERR_NOT_IN_RANGE) {
        this.creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}})
      }
      if(result == ERR_INVALID_TARGET) {
        this.creep.memory.target = ""
      }
    }
    if(!this.creep.memory.building) {
      this.creep.acquireEnergy()
    }
    
  }
}

