let styles = require('styles')

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

Creep.prototype.targeted = function() {
  let targetList = []
  _.forEach(Memory.creeps, (creep, id) => {
    if(creep.target == this.id){
      targetList.push(Game.creeps[id])
    }
  })
  return targetList
}

Object.defineProperty(Creep.prototype, 'stored', {
	get: function() {
    if(!this.store){
      return 100
    }
    let used = 0
    for(let resource of RESOURCES_ALL){
      used += this.store.getUsedCapacity(resource)
    }
    return used
	},
	enumerable: false,
	configurable: true
});

Object.defineProperty(Creep.prototype, 'capacity', {
	get: function() {
    if(!this.store){
      return 0
    }
    return this.store.getCapacity()
	},
	enumerable: false,
	configurable: true
});

Creep.prototype.work = function(target){
  if(target.level){
    return this.upgradeController(target)
  }
  return this.build(target)
}

Object.defineProperty(Creep.prototype, 'usage', {
	get: function() {
    let withdrawl = 0
    let deposit   = 0
    let net = this.stored
    let capacity = this.capacity
    _.forEach(Memory.taskQueue, function(t){
      if(t.dest == this.id){
        let target = genRoom.getObject(t.target)
        if(t.type == "deposit"){
          deposit += target.stored
        }
        if(t.type == "withdrawl"){
          withdrawl -= target.capacity
        }
      }
    })
    net = net + deposit - withdrawl
    return (net/capacity) * 100
	},
	enumerable: false,
	configurable: true
});

Object.defineProperty(Creep.prototype, 'netEnergy', {
	get: function() {
    return this.store.getUsedCapacity(RESOURCE_ENERGY)
	},
	enumerable: false,
	configurable: true
});

Object.defineProperty(Creep.prototype, 'energyCapacity', {
	get: function() {
    return this.store.getFreeCapacity(RESOURCE_ENERGY)
	},
	enumerable: false,
	configurable: true
});

Creep.prototype.get = function(target){
  if(target.amount){ return this.pickup(target)}
  if(target.store){ return this.withdraw(target, RESOURCE_ENERGY)}
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

Creep.prototype.bestEnergySource = function(capacity){
  let sources = this.room.allEnergy()

  let volitile = []
  let stable = []
  let storages = []
  _.forEach(Game.rooms, function(room, key){
    let roomEnergy = room.allEnergy()
    volitile = volitile.concat(roomEnergy.volitile)
    stable = stable.concat(roomEnergy.stable)
    storages = storages.concat(roomEnergy.storage)
  })
  for(let sources of [volitile, stable, storages]){
    let validSources = _.filter(sources, function(s){ return s.netEnergy > capacity})
    if(validSources.length == 0){ continue }
    return _.sortBy(validSources, s => this.pos.getRangeTo(s.pos))[0]
  }
  for(let sources of [volitile, stable, storages]){
    let validSources = _.filter(sources, function(s){ return s.netEnergy > capacity})
    if(validSources.length == 0){ continue }
    return _.sortBy(validSources, s => 0 - s.netEnergy)[0]
  }
}

Creep.prototype.selfMaintain = function(){
  var spawn = Game.getObjectById(Memory.homespawn)
  var energyCap = this.room.energyCapacityAvailable
  if(this.ticksToLive < 250 && this.memory.body >= energyCap && energyCap > 300){
    this.memory.renew = true
  }
  if(this.ticksToLive >=1400 || this.memory.body < energyCap || this.room.energyAvailable < energyCap * 0.25){
    this.memory.renew = false
  }
  if(this.memory.renew){
    this.say("🔧")
    //this.autoPathTo(spawn)
    this.moveTo(spawn)
    spawn.renew(this)
    return true
  }
}

Creep.prototype.get = function(dest){
  if(dest.store){
    for(let resource of RESOURCES_ALL){
      let result = this.withdraw(dest, resource)
      if(result == OK || result == ERR_NOT_IN_RANGE){
        return result
      }
    }
  }
  if(dest.amount){
    for(let resource of RESOURCES_ALL){
      let result = this.pickup(dest, resource)
      if(result == OK || result == ERR_NOT_IN_RANGE){
        return result
      }
    }
  }
  throw('unable to get resources from:' + dest)
}

Creep.prototype.give = function(dest){
  if(dest.store){
    for(let resource of RESOURCES_ALL){
      let result = this.transfer(dest, resource)
      if(result == OK || result == ERR_NOT_IN_RANGE){
        return result
      }
    }
  }
  throw('unable to give resources to:' + dest)
}

Creep.prototype.acquireEnergy = function(){
  if(this.selfMaintain()){
    return OK
  }
  if(!this.memory.target){
    let dest = this.bestEnergySource(this.energyCapacity)
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
    this.moveTo(dest, {visualizePathStyle: styles.collect})
  }
  if(result == ERR_NOT_ENOUGH_ENERGY) {
    this.memory.target = ""
  }
  return result
}
