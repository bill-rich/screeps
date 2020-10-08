let styles = require('styles')

module.exports = class {
  constructor(creep){
    this.creep = creep
  }

  find(){
    return _.reduce(Game.creeps, function(workers, creep, key) {
      if(creep.memory.role == "miner"){
        workers.push(creep)
      }
      return workers
    }, [])
  }

  wanted(){
    return _.first(_.values(Game.rooms)).allSources().length
  }

  run(){
    let sources = _.sortBy(this.creep.room.allSources(), source => source.pos.getRangeTo(this.creep.pos))
    for(let source of sources) {
      if(source.targeted().length == 0 || (source.targeted().length == 1 && source.targeted()[0].id == this.creep.id)){
        this.creep.memory.target = source.id
        break    
      }
    }
    let source = Game.getObjectById(this.creep.memory.target)
    let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: (s) => {
        return s.structureType == STRUCTURE_CONTAINER
      }
    })
    if(container.length > 0){
      this.moveTo(container[0])
    } 
    if(this.creep.harvest(source) == ERR_NOT_IN_RANGE){
      if(this.creep.pos.findInRange(FIND_STRUCTURES, 0, {
        filter: s => {
          return s.structureType == STRUCTURE_CONTAINER
        }
      })){
        //this.creep.pos.createConstructionSite(STRUCTURE_CONTAINER)
      }
      this.moveTo(source)
    }
  }

  moveTo(dest){
    this.creep.moveTo(dest, {visualizePathStyle: styles.repair})
    //Memory.towQueue[this.creep.id] = dest.pos
  }
}
