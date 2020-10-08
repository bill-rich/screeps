class utilFunctions {
  constructor(){}

  allKnownRooms(){
    let rooms = []
    for(let roomName in Game.rooms){
      let room = Game.rooms[roomName]
      rooms.push(room)
    }
    return rooms
  }

  otherTargeters(target, role){
    let others = []
    for(let creep of this.findCreepsByRole(role)){
      if(creep.memory.target == target){
        others.push(creep)
      }
    }
    return others
  }

  allFreeEnergy(){
    let energy = 0
    for(let e of this.allFreeResources()){
      energy += e.amount
    }
    for(let e of this.allContainers()){
      energy += e.store.getUsedCapacity(RESOURCE_ENERGY)
    }
    return energy
  }

  allContainers(){
    let containers = []
    for(let room of this.allKnownRooms()){
      let roomContainers = room.find(FIND_STRUCTURES, {
        filter: (struct) => {
          return struct.structureType == STRUCTURE_CONTAINER
        }
      })
      containers = containers.concat(roomContainers)
    }
    return containers
  }

  allFreeResources(){
    let resources = []
    for(let room of this.allKnownRooms()){
      let roomResources = room.find(FIND_DROPPED_RESOURCES)
      resources = resources.concat(roomResources)
    }
    return resources
  }

  allSources(){
    let sources = []
    for(let room of this.allKnownRooms()){
      let roomSources = room.find(FIND_SOURCES)
      sources = sources.concat(roomSources)
    }
    return sources
  }

  creepCost(body){
    let cost = 0
    for(let part of body){
      cost += BODYPART_COST[part]
    }
    return cost
  }

  allSpawns(){
    let allSpawns = []
    for(let room of this.allKnownRooms()){
      let spawns = room.find(FIND_STRUCTURES, {                                    
        filter: (struct) => {                                                      
          return (                                                                 
            struct.structureType == STRUCTURE_SPAWN &&                             
            struct.my                                                              
          )                                                                        
        }                                                                          
      })  
      allSpawns = allSpawns.concat(spawns)
    }
    return allSpawns
  }

  findCreepsByRole(role){
    let creeps = []
    for(let name in Game.creeps){
      let creep = Game.creeps[name]
      if(creep.memory.role == role){
        creeps.push(creep)
      }
    }
    return creeps
  }

  allMyControllers(){
    let allControllers = []
    for(let room of this.allKnownRooms()){
      let controllers = room.find(FIND_STRUCTURES, {                                    
        filter: (struct) => {                                                      
          return (                                                                 
            struct.structureType == STRUCTURE_CONTROLLER &&
            struct.my                                                              
          )                                                                        
        }                                                                          
      })  
      allControllers = allControllers.concat(controllers)
    }
    return allControllers
  }

  isTargeted(source){
    let count = 0
    for(let name in Game.creeps){
      let creep = Game.creeps[name]
      if(creep.memory.target == source.id){
        count++
      }
    }
    return count
  }

  isMiningTargeted(source){
    for(let name in Game.creeps){
      let creep = Game.creeps[name]
      if(creep.memory.miningTarget == source.id){
        return true
      }
    }
    return false
  }
}

global.util = new(utilFunctions)

