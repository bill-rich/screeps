module.exports.loop = function () {
  var room = new roomInfo()
  for(var name in Game.creeps){
    var creep = new creepInfo(Game.creeps[name])
    creep.manageEnergy()
  }
}

class roomInfo{
  constructor(){
    this.room = _.filter(Game.rooms,  (room)  => room.controller.my)[0]
  }

  totalSpawnEnergy(){
    var targets = this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return (structure.structureType == STRUCTURE_EXTENSION ||
          structure.structureType == STRUCTURE_SPAWN
        );
      }
    });
    var totalEnergy = 0
    for(i=0; i < targets.length; i++){
      totalEnergy += targets[i].store.getUsedCapacity(RESOURCE_ENERGY)
    }
    return totalEnergy
  }

  energyContainers() {
    return this.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_CONTAINER
      }
    })
  }
}

class creepInfo{
  constructor(creep){
    this.creep = creep
  }
  nearestEnergySource() {
    var sources = this.creep.room.find(FIND_SOURCES);
    var sorted = _.sortBy(sources, s => this.creep.pos.getRangeTo(s))
    return sorted[0]
  }
  
  closestSourceContainer() {
     var sources = this.creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_CONTAINER && structure.store.getUsedCapacity(RESOURCE_ENERGY) > 0
      }
    });
    var sorted = _.sortBy(sources, s => creep.pos.getRangeTo(s))
    return sorted[0]
  }

  manageEnergy(){
    if(!this.creep.memory.task){
      this.creep.memory.task = "loadEnergy"
    }

    if(this.creep.memory.task == "loadEnergy"){
      this.getEnergy()
    }

    if(this.creep.memory.task == "unloadEnergy"){
      this.unloadEnergy()
    }
  }

  unloadEnergy(){
    if(!this.creep.memory.path){
      var target = this.bestEnergyTarget()
      // This could be optimized for reduced CPU because it is called when the
      // creep is past the last waypoint.
      if(!this.getNextStepTo(target)){
          console.log("ok")
        if(this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
          this.creep.moveTo(target)
        }
      }
    }
    else {
      var path = Room.deserializePath(this.creep.memory.path)
      if(this.creep.moveByPath(path) == ERR_NOT_FOUND){
        this.creep.memory.path = ""
      }
    }
    if(this.creep.store.getUsedCapacity() == 0){
      this.creep.memory.task = "loadEnergy"
    }
  }

  bestEnergyTarget() {
    // Put logic for where to put energy here
    return this.creep.room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_SPAWN
      }
    })[0]
  }

  getEnergy(){
    if(!this.creep.memory.path){
      var source = this.bestEnergySource()
      // This could be optimized for reduced CPU because it is called when the
      // creep is past the last waypoint.
      if(!this.getNextStepTo(source)){
        if(this.creep.harvest(source) == ERR_NOT_IN_RANGE){
          this.creep.moveTo(source)
        }
      }
    }
    else {
      var path = Room.deserializePath(this.creep.memory.path)
      if(this.creep.moveByPath(path) == ERR_NOT_FOUND){
        this.creep.memory.path = ""
      }
    }
    if(this.creep.store.getFreeCapacity() == 0){
      this.creep.memory.task = "unloadEnergy"
    }
  }

  getNextStepTo(destination){
    var closestStartFlag = this.navStartFlag(destination)
    var targetFlag = this.navEndFlag(destination)

    if(this.creep.pos.isEqualTo(closestStartFlag)){
      this.creep.memory.path = this.creep.room.findPath(this.creep.pos, targetFlag.pos, {
        ignoreCreeps : true,
        serialize    : true,
      })
      return true
    }
    
    if(this.creep.pos.getRangeTo(destination) > this.creep.pos.getRangeTo(closestStartFlag)){
      // Generate path
      this.creep.memory.path = this.creep.room.findPath(this.creep.pos, closestStartFlag.pos, {
        ignoreCreeps : true,
        serialize    : true,
      })
      return true
    }
    return false
  }

  bestEnergySource(){
    return this.nearestEnergySource()
  }

  navStartFlag(){
    var flags = this.creep.room.find(FIND_FLAGS, {
      filter: (flag) => {
        return flag.memory.type == "trafficIn"
      }
    })
    var sorted = _.sortBy(flags, flag => this.creep.pos.getRangeTo(flag))
    return sorted[0]
  }

  navEndFlag(source){
    var flags = this.creep.room.find(FIND_FLAGS, {
      filter: (flag) => {
        return flag.memory.type == "trafficOut"
      }
    })
    var sorted = _.sortBy(flags, flag => source.pos.getRangeTo(flag))
    return sorted[0]
  }
}



