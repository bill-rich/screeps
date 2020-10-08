module.exports = class {
  constructor(creep){
    this.creep = creep
  }

  find(){
    return util.findCreepsByRole("carry")
  }

  wanted(){
    return CREEP_TYPES["constructor"]["object"].find().length + 2
  }

  run(creep){
    if(creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0){
      creep.memory.delivering = true
    }
    if(creep.store.getUsedCapacity(RESOURCE_ENERGY) == 0){
      creep.memory.delivering = false
    }
    // If the creep isn't empty and its not currently delivering
    if(!creep.memory.delivering){
      if(!creep.memory.target){
        let target = creep.pos.findClosestByPath(util.allFreeResources(), {
          filter: (source) => {
            return ((source.amount && source.amount > creep.store.getFreeCapacity(RESOURCE_ENERGY)) || 
            (source.store && source.store.getUsedCapacity(RESOURCE_ENERGY) >= creep.store.getFreeCapacity(RESOURCE_ENERGY)))
          }
        })
        if(target){
          creep.memory.target = target.id
        }
      }
      if(creep.memory.target){
        let target = Game.getObjectById(creep.memory.target)
        let result = creep.pickup(target)
        if(result == ERR_NOT_IN_RANGE){
          creep.memory.dest = target.pos
        }
        if(!target || (target.amount == 0 || (target.store && target.store.getFreeCapcity(RESOURCE_ENERGY) == 0))){
          creep.memory.target = ""
          creep.memory.dest   = ""
        }
      }
    }
    // If the creep is ready to deliver
    if(creep.memory.delivering){
      // Find a target. First refill spawns and extensions, then builders
      if(!creep.memory.target){
        // First try to restock spawns and extentions
        let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: (struct) => {
            if(!struct.store){
              return false
            }
            return (struct.structureType == STRUCTURE_SPAWN  ||
                    struct.structureType == STRUCTURE_EXTENSION) &&
                    struct.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                    !util.isTargeted(struct)
          }
        })
        if(target){
          creep.memory.target = target.id
        }
      }
      // If there are no spawns or extensions that need to be restocked, try creeps
      if(!creep.memory.target){
        let sortedCreeps = _.sortBy(util.findCreepsByRole("constructor"), targetCreep => creep.pos.getRangeTo(targetCreep.pos))
        for(let targetCreep of sortedCreeps){
          if(targetCreep.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
            creep.memory.target = targetCreep.id
            break
          }
        }
      }
      let target = Game.getObjectById(creep.memory.target)
      if(target){
        creep.memory.target = target.id
        creep.memory.dest = target.pos
      } else {
        creep.memory.dest = ""
      }
      if(!creep.memory.target){
        creep.memory.target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
          filter: (creep) => {
            return ( creep.memory.role == "constructor" &&
                    creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                    !util.isTargeted(struct))
          }
        })
      }
      if(creep.memory.target){
        let target = Game.getObjectById(creep.memory.target)
        let result = creep.transfer(target, RESOURCE_ENERGY)
        if(result == OK || (target && target.store && target.store.getFreeCapacity(RESOURCE_ENERGY) == 0) || 
           creep.store.getFreeCapacity(RESOURCE_ENERGY) == 0 ){
          creep.memory.dest = ""
          creep.memory.target = ""
        }
        if(result == ERR_NOT_IN_RANGE){
          creep.memory.dest = target.pos
        }
      }
    }
  }

  resourceTargeted(resource){
    for(let name in Game.creeps){
      let creep = Game.creeps[name]
      if(creep.memory.target == resource.id) {
        return true
      }
    }
    return false
  }
}
