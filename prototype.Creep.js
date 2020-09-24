var DO_NOT_REPAIR = [STRUCTURE_WALL];

function sourceUsers(source){
    let count = 0
    for(let name in Game.creeps){
        let creep = Game.creeps[name]
        if(creep.memory.target == source.id){
            count++
        }
    }
    return count
}

function autoRepair(creep){
	if(creep.store[RESOURCE_ENERGY] > 0){
		var damaged  = creep.pos.findInRange(FIND_STRUCTURES, 1, {
			filter: (structure) => {
				return (structure.pos != creep.pos && (structure.hits / structure.hitsMax) < 0.8)
					&& !DO_NOT_REPAIR.includes(structure.structureType);
			}
		});
		if(damaged.length > 0){
			creep.say("auto 🛠");
			var repair_result = creep.repair(damaged[0]);
		}
	}
}

Creep.prototype.movePath = function(){
  var path = Room.deserializePath(this.memory.path)
  if(this.moveByPath(this.memory.path) == OK){
    path.shift()
    this.memory.path = Room.serializePath(path)
    return OK
  } else {
    this.memory.failedMoves = this.memory.failedMoves + 1
    return ERR_INVALID_ARGS
  }
}
Creep.prototype.autoPathTo = function(target){
	autoRepair(this)
  if(!this.memory.path){
    this.memory.path = this.room.findPath(this.pos, target.pos, {
      ignoreCreeps: true,
      serialize: true,
    })
  }
  this.movePath()
  var patience = Math.floor(Math.random() * 5)
  if(this.memory.failedMoves >= patience){
    this.memory.failedMoves = 0
    this.memory.path = this.room.findPath(this.pos, target.pos, {
      ignoreCreeps: false,
      serialize: true,
    })
    return this.movePath()
  }
  return ERR_NOT_FOUND
}

Creep.prototype.bestEnergySource = function(){
  let maxUsers = 2
  var sources = this.room.find(FIND_SOURCES, {
    filter: (source) => {
      return (sourceUsers(source) <= maxUsers &&
              source.energy > 0)
    }
  })
  var containers = this.room.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return ( structure.structureType == STRUCTURE_CONTAINER ||
        structure.structureType == STRUCTURE_STORAGE
      )
        //structure.store.getUsedCapacity() >= this.creep.store.getFreeCapacity())
        //structure.memory.users.split(";").length <= structure.memory.maxUsers
      //)
    }
  })
  var tombStones = this.room.find(FIND_TOMBSTONES, {
    filter: (tomb) => {
      return tomb.store.getUsedCapacity() >= 50
    }
  })
  var openEnergy = this.room.find(FIND_DROPPED_RESOURCES, {
    filter: (energy) => {
        return ( energy.amount >= 100 &&
                 sourceUsers(energy) <= maxUsers)
    }
  })

  if(openEnergy.length > 0){
    return _.sortBy(openEnergy, energy => this.pos.getRangeTo(energy))[0]
  }

  if(tombStones.length > 0){
    return _.sortBy(tombStones, energy => this.pos.getRangeTo(energy))[0]
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

Creep.prototype.selfMaintain = function(){
  var spawn = Game.getObjectById(Memory.homespawn)
  var energyCap = spawn.room.energyCapacityAvailable
  if(this.ticksToLive < 250 && this.memory.body >= energyCap){
    this.memory.renew = true
  }
  if(this.ticksToLive >=1400 || this.memory.body < energyCap || this.room.energyAvailable < energyCap * 0.25 || spawn.spawning){
    this.memory.renew = false
  }
  if(this.memory.renew){
    this.say("🔧")
    this.autoPathTo(spawn)
    return true
  }
}

Creep.prototype.acquireEnergy = function(){
  if(this.selfMaintain()){
    return OK
  }
  if(!this.memory.target){
    let dest = this.bestEnergySource()
    if(!dest){
      return
    }
    this.memory.target = dest.id
  }
  var dest = Game.getObjectById(this.memory.target)
  if(!dest){
    this.memory.target = ""
    return false
  }
  var result
  if(dest.store){
    result = this.withdraw(dest, RESOURCE_ENERGY)
  }
  else {
    if(this.pos.getRangeTo(dest) > 1){
      result = ERR_NOT_IN_RANGE
    } else {
      if(dest.energyCapacity){
        result = this.harvest(dest)
      } else {
        result = this.pickup(dest)
      }
    }
  }
  if(result == ERR_NOT_IN_RANGE) {
    this.autoPathTo(dest, {visualizePathStyle: {stroke: '#ffaa00'}})
  }
  if(result == ERR_NOT_ENOUGH_ENERGY) {
    this.memory.target = ""
  }
  return result
}
