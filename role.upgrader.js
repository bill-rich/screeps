
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
    let targets = []
    for(let name in Game.rooms){
      let room = new Room(name)
      let controller = room.find(FIND_STRUCTURES, {
        filter: (struct) => {
          return struct.structureType == STRUCTURE_CONTROLLER
        }
      })[0]
      //if(room && room.controller.my){
        targets.push(controller)
      //}
    }
    let target = _.sortBy(targets, controller => this.creep.sourceUsers(controller))[0]
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

