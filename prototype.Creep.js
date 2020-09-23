
Creep.prototype.bestEnergySource = function(){
  var sources = this.room.find(FIND_SOURCES, {
    filter: (source) => {
      //return Memory.users <= Memory.maxUsers
      return true
    }
  })
  var containers = this.room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return ( structure.structureType == STRUCTURE_CONTAINER)
        //structure.store.getUsedCapacity() >= this.creep.store.getFreeCapacity())
        //structure.memory.users.split(";").length <= structure.memory.maxUsers
      //)
    }
  })
  var openEnergy = this.room.find(FIND_DROPPED_RESOURCES, {
    filter: (energy) => {
      return energy.amount >= 100
    }
  })

  if(openEnergy.length > 0){
    return _.sortBy(openEnergy, energy => this.pos.getRangeTo(energy))[0]
  }

  if(containers.length > 0){
    var sortedContainers = _.sortBy(containers, container => this.pos.getRangeTo(container))
    for(let i in sortedContainers){
      var container = sortedContainers[i]
      if(container.store && container.store.getUsedCapacity() >= this.store.getFreeCapacity()){
        return container
      }
    }
  }

  if(sources.length > 0){
    return _.sortBy(sources, source => this.pos.getRangeTo(source))[0]
  }
}

Creep.prototype.acquireEnergy = function(){
  if(!this.memory.target){
    let dest = this.bestEnergySource()
    this.memory.target = dest.id
  }
  var dest = Game.getObjectById(this.memory.target)
  var result
  if(dest.structureType){
    result = this.withdraw(dest, RESOURCE_ENERGY)
  }
  else {
    if(this.pos.getRangeTo(dest) > 1){
      result = ERR_NOT_IN_RANGE
    } else {
      if(dest.energyCapacity){
        this.harvest(dest)
      } else {
        this.pickup(dest)
      }
    }
  }
  if(result == ERR_NOT_IN_RANGE) {
    this.moveTo(dest, {visualizePathStyle: {stroke: '#ffaa00'}})
  }
  if(result == ERR_NOT_ENOUGH_ENERGY) {
    this.memory.target = ""
  }
}
