
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
        if(!structure){
          return false
        }
        return (structure.structureType == STRUCTURE_CONTAINER &&
          structure.pos.getRangeTo(source.pos) == 1
        )
      }
    })
    var containerConstruction = this.creep.room.find(FIND_CONSTRUCTION_SITES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_CONTAINER &&
          structure.pos.getRangeTo(source.pos) == 1
        )
      }
    })
    if(container.length > 0 && this.creep.pos.getRangeTo(container[0].pos) ){
      this.creep.autoPathTo(container[0])
      return
    }
    var result = this.creep.harvest(source)
    if(result == ERR_NOT_IN_RANGE){
      this.creep.autoPathTo(source)
    }
    if(result == OK && !container && !containerConstruction){
      this.creep.room.createConstructionSite(this.creep.pos, STRUCTURE_CONTAINER)
    }
  }
}
