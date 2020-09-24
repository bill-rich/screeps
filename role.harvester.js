let roleUpgrader = require('role.upgrader')
var styles = require('styles')

module.exports = class {
  constructor(creep){
    this.creep = creep
  }

  run(){
    if(this.creep.store.getFreeCapacity() == 0 && this.creep.memory.pickingUp == true){
      this.creep.memory.pickingUp = false
      this.creep.memory.target = ""
    }
    if(this.creep.store.getUsedCapacity() == 0 && this.creep.memory.pickingUp == false){
      this.creep.memory.pickingUp = true
      this.creep.memory.target = ""
    }
    if(this.creep.memory.pickingUp){
      this.creep.acquireEnergy()
    }
    else {
      if(!this.creep.memory.target && !this.creep.memory.pickingUp){
        var targets = this.creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return ((structure.structureType == STRUCTURE_EXTENSION ||
              //structure.structureType == STRUCTURE_CONTAINER ||
              structure.structureType == STRUCTURE_SPAWN ||
              structure.structureType == STRUCTURE_TOWER ) &&
              structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
            )
          }
        })
        if(targets.length > 0) {
          var sortedTargets = _.sortBy(targets, target => this.creep.pos.getRangeTo(target))
          var target = sortedTargets[0]
          for(let t of sortedTargets){
            if(t.structureType != STRUCTURE_CONTAINER) {
              target = t
              break
            }
          }
          this.creep.memory.target = target.id
        }
      }
      if(!this.creep.memory.target && this.creep.store[RESOURCE_ENERGY] > 0){
        this.creep.say("⬆")
        var upgrader = new roleUpgrader(this.creep)
        upgrader.run()
      }
      target = Game.getObjectById(this.creep.memory.target)
      if(this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        //this.creep.moveTo(target, {visualizePathStyle: {stroke: '#ffffff'}});
        this.creep.autoPathTo(target, {visualizePathStyle: styles.harvest})
      } else {
        this.creep.memory.target = ""
      }
      return
    }
  }
}

