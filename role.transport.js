let styles = require('styles')
module.exports = class {
  constructor(creep){
    this.creep = creep
  }

  find(){
    return [].concat(_.reduce(Game.creeps, function(workers, creep, key) {
      if(creep.memory.role == "transport"){
        workers.push(creep)
      }
      return workers
    }, []))
  }

  wanted(){
    //return 3
    return globalWorker.find().length + _.values(genRoom.allSources()).length * 2
  }

  run(){
    // Clear target if it no longer exists
    if(this.creep.memory.target && (!Game.getObjectById(this.creep.memory.target) || !Memory.towQueue[this.creep.memory.target])){
      this.creep.memory.target = ''
    }

    // Set creep's delivering status
    if(this.creep.energyCapacity == 0){
      this.creep.memory.delivering = true
      this.creep.memory.target = ""
    }
    if(this.creep.netEnergy == 0){
      this.creep.memory.delivering = false
      this.creep.memory.target = ""
    }

    if(!this.creep.memory.delivering){
      this.creep.acquireEnergy()
      //let target = this.selectEnergySource()
      //if(!target){
      //  return false
      //}
      //this.creep.memory.target = target.id
      //if(this.creep.get(target) == ERR_NOT_IN_RANGE){
      //  this.moveTo(target.pos)
      //}
    } else {
      // Determine where to drop the energy and do it
      let target = this.selectDeliveryTarget()
      if(target && target.structureType && target.structureType == STRUCTURE_STORAGE){
        console.log(this.creep.name + " is delivering to storage")
      }
      if(target){
        this.creep.memory.target = target.id
        if(this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
          this.moveTo(target, styles.store)
        }
      }
    }
  }

  tow(){
    if(this.creep.memory.target){
      let target = Game.getObjectById(this.creep.memory.target)
      if(!target){
        this.creep.memory.target = ""
        return
      }
			if(this.creep.pull(target) == ERR_NOT_IN_RANGE){
				this.creep.moveTo(target);
			} else {
				let targetDest = new RoomPosition(Memory.towQueue[target.id].x, Memory.towQueue[target.id].y, Memory.towQueue[target.id].roomName)
				target.move(this.creep)
				if((targetDest.occupied() && this.creep.pos.isNearTo(targetDest)) || (!targetDest.occupied() && this.creep.pos.getRangeTo(targetDest) == 0)) {
					this.creep.move(this.creep.pos.getDirectionTo(target));
				} else {
					this.creep.moveTo(targetDest);
				}
			}
      delete this.creep.memory.tow
		}
  }

  selectDeliveryTarget(){
    let workers = _.filter(worker.find(), function(w){
      return w.energyCapacity > 25
    })
    let storage = this.creep.room.allStorage()
    let base = _.filter(this.creep.room.allBaseStorage(), function(b){return b.energyCapacity > 0})
    base = _.filter(this.creep.room.allBaseStorage(), function(b){return b.store.getFreeCapacity(RESOURCE_ENERGY) > 0})
    if(base.length > 0){
      return _.sortBy(base, w => w.pos.getRangeTo(this.creep.pos))[0]
    }
    if(workers.length > 0){
      return _.sortBy(workers, w => w.pos.getRangeTo(this.creep.pos))[0]
    }
    if(storage.length > 0) {
      return _.sortBy(storage, s => s.pos.getRangeTo(this.creep.pos))[0]
    }
  }

  moveTo(dest, style){
    this.creep.moveTo(dest, {visualizePathStyle: style} )
  }

  selectEnergySource(){
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
      let validSources = _.filter(sources, function(s){ return s.netEnergy > 300})
      if(validSources.length == 0){ continue }
      return _.sortBy(validSources, s => this.creep.pos.getRangeTo(s.pos))[0]
      return _.sortBy(sources, s => this.creep.pos.getRangeTo(s.pos))[0]
    }
  }

  assignTowTasks(){
    let transports = this.find()
    let targets = Object.assign({}, Memory.towQueue)
    let routes = []
    for(let i in transports){
      if(Memory.towQueue[transports[i].memory.target]){
        delete targets[transports[i].memory.target]
        transports.splice(i,1)
      }
    }

    // Create a list of all possible routes and their costs.
    _.forEach(transports, function(transport) {
      _.forEach(targets, function(destRaw, key) {
        let dest = new RoomPosition(destRaw.x, destRaw.y, destRaw.roomName)
        let target = Game.getObjectById(key)
        routes.push({
          tower:  transport.id,
          target: key,
          cost:   PathFinder.search(target.pos, dest).cost + PathFinder.search(transport.pos, target.pos).cost
        })
      })
    })

    // Sort the routes by the total cost.
    let sortedRoutes = _.sortBy(routes, r => r.cost)

    // Delete any further tow tasks that involve the tower or towee.
    while(sortedRoutes.length > 0) {
      let tower = Game.getObjectById(sortedRoutes[0].tower)
      let target = sortedRoutes[0].target
      tower.memory.target = target
      for(let i in sortedRoutes){
        if(sortedRoutes[i].tower == tower.id || sortedRoutes[i].target == target){
          sortedRoutes.splice(i,1)
        }
      }
    }
  }


  socialism(){
    let nearby = this.creep.pos.findInRange(FIND_MY_CREEPS, 1, {
      filter: (c) => {
        c.memory.role == "worker"
      }
    })
    if(nearby.length > 0){
      let lowest = _.sortBy(nearby, nearCon => nearCon.store.getUsedCapacity(RESOURCE_ENERGY))[0]
      let transferAmount = Math.floor((this.store.getUsedCapacity(RESOURCE_ENERGY) - lowest.store.getUsedCapacity(RESOURCE_ENERGY))/2)
    }
  }

  selectTarget(){
    let conSites = _.sortBy(Game.constructionSites, c => c.progress/c.progressTotal)
    for(let conSite of conSites){
      if(conSite.targeted().length <= MAX_WORKERS){
        return conSite
      }
    }
    let controllers = _.filter(Game.structures, c => {return c.structureType == STRUCTURE_CONTROLLER})
    return _.sortBy(controllers, c => c.targeted())[0]
  }

  work(target){
    if(target.progress !== undefined){
      return this.creep.build(target)
    }
    if(target.level !== undefined){
      return this.creep.upgradeController(target)
    }
    return ERR_INVALID_TARGET
  }
}
