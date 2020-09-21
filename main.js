module.exports.loop = function () {
  var room = new roomInfo()
  for(var name in Game.creeps){
    var creep = new creepInfo(Game.creeps[name])
    creep.getEnergy()
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

  getEnergy(){
    var source = this.bestEnergySource()
    var flag = this.navStartFlag(source)
    if(this.creep.store.getFreeCapacity() == 0){
      this.creep.memory.waypoint = ""
      this.creep.memory.task = ""
      return
    }
    if(!this.creep.memory.task){
      this.creep.memory.task = "loadEnergy"
    }
    if(!this.creep.memory.waypoint && this.creep.pos.getRangeTo(source) > this.creep.pos.getRangeTo(flag)){
        this.creep.memory.waypoint = flag.name
    }

    if(!this.creep.memory.waypoint){
      if(this.creep.harvest(source) == ERR_NOT_IN_RANGE){
        this.creep.moveTo(source)
      }
      return
    }

    if(!this.creep.pos.isEqualTo(Game.flags[this.creep.memory.waypoint])){
      this.creep.say("Moving")
      console.log(this.creep.moveTo(Game.flags[this.creep.memory.waypoint]))
    }
    else {
      if(Game.flags[this.creep.memory.waypoint].memory.type == "trafficIn"){
        this.creep.memory.waypoint = this.navEndFlag(source).name
      }
      else {
        this.creep.memory.waypoint = ""
      }
    }
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



class creepActions{
  acquireEnergy(creep){
  }
  
  upgradeController(){
  }

  refillSpawnEnergy(){
  }

  buildConstruction(){
  }

  mineEnergy(){
  }

  gotoMiningSpot(){
  }
}
