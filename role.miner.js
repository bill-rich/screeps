
module.exports = class {
  constructor(creep){
    this.creep = creep
  }

  run(){
    if(this.creep.store.getFreeCapacity() == 0){
      this.creep.drop(RESOURCE_ENERGY)
    }
    if(!this.creep.memory.miningTarget){
      for(let source of this.creep.room.find(FIND_SOURCES)){
        let found = false
        for(let name in Game.creeps){
          if(source.id == Game.creeps[name].memory.miningTarget){
            found = true
          }
        }
        if(!found){
          this.creep.memory.miningTarget = source.id
        }
      }
    }
    var source = Game.getObjectById(this.creep.memory.miningTarget)
    var container = this.creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_CONTAINER &&
          structure.pos.getRangeTo(source.pos) == 1
        )
      }
    })[0]
    if(container && this.creep.pos.getRangeTo(container.pos) ){
      this.creep.moveTo(container)
      return
    }
    var result = this.creep.harvest(source)
    if(result == ERR_NOT_IN_RANGE){
      this.creep.moveTo(source)
    }
    if(result == OK && !container){
      this.creep.room.createConstructionSite(this.creep.pos, STRUCTURE_CONTAINER)
    }
  }
}
