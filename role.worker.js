let styles = require('styles')

const MAX_WORKERS = 3

module.exports = class {
  constructor(creep){
    this.creep = creep
  }

  find(){
    return _.reduce(Game.creeps, function(workers, creep, key) {
      if(creep.memory.role == "worker"){
        workers.push(creep)
      }
      return workers
    }, [])
  }

  wanted(){
    // Find a way to do all free energy
    //return Math.floor(Game.allFreeEnergy()/1000)

    let totalEnergy =_.reduce(_.first(_.values(Game.rooms)).allEnergy(), function(sum, value, key){
      sum += _.reduce(value, function(subSum, subValue, subKey){
        subSum += subValue.netEnergy
        return subSum
      }, 0)
      return sum
    }, 0)

    return Math.max(Math.floor((totalEnergy)/2000), 2)
  }

  run(){
    this.socialism()
    if(this.creep.netEnergy == 0){
      this.creep.memory.target = ""
      this.creep.acquireEnergy()
    }
    let target = this.selectTarget()
    if(this.work(target) == ERR_NOT_IN_RANGE){
      this.moveTo(target, styles.work)
    }
  }

  socialism(){
    if(this.creep.netEnergy < 25 ){ return OK }
    let nearby = this.creep.pos.findInRange(FIND_MY_CREEPS, 1, {
      filter: (c) => {
        return c.memory.role == "worker"
      }
    })
    if(nearby.length > 0){
      let lowest = _.sortBy(nearby, nearCon => nearCon.store.getUsedCapacity(RESOURCE_ENERGY))[0]
      let transferAmount = Math.floor((this.creep.store.getUsedCapacity(RESOURCE_ENERGY) - lowest.store.getUsedCapacity(RESOURCE_ENERGY))/2)
      this.creep.transfer(lowest, RESOURCE_ENERGY, transferAmount)
    }
  }

  selectTarget(){
    let conSites = _.sortBy(Game.constructionSites, c => 1 - c.progress/c.progressTotal)
    for(let conSite of conSites){
      if(conSite.targeted().length <= MAX_WORKERS){
        return conSite
      }
    }
    let controllers = _.filter(Game.structures, c => {return c.structureType == STRUCTURE_CONTROLLER})

    return _.sortBy(controllers, c => c.targeted().length)[0]
  }

  work(target){
    if(target.level !== undefined){
      return this.creep.upgradeController(target)
    }
    if(target.progress !== undefined){
      return this.creep.build(target)
    }
    return ERR_INVALID_TARGET
  }

  moveTo(dest, style){
    this.creep.moveTo(dest, {visualizePathStyle: style})
    //Memory.towQueue[this.creep.id] = dest.pos
  }
}
