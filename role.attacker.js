module.exports = class {
  constructor(creep){
    this.creep = creep
  }
  find(){
    return _.reduce(Game.creeps, function(workers, creep, key) {
      if(creep.memory.role == "attacker"){
        workers.push(creep)
      }
      return workers
    }, [])
  }

  wanted(){
    for(let room of _.values(Game.rooms)){
      if(room.find(FIND_HOSTILE_CREEPS).length > 0){
        Memory.room.push(room.name)
      }
    }
    if(Memory.enemyRoom.length > 0){
      return 2
    }
    return 0
  }

  run(){
    if(Memory.enemyRoom && Memory.enemyRoom[0] && this.creep.room.name != Memory.enemyRoom[0]){
      let exitDir = this.creep.room.findExitTo(Memory.enemyRoom[0])
      let exit = this.creep.pos.findClosestByRange(exitDir)
      this.creep.moveTo(exit)
    }
    if(this.creep.room.name == Memory.enemyRoom[0]){

      let enemies = this.creep.room.enemyTargets()
      if(enemies.length == 0){
        for(let i in Memory.enemyRoom){
          if(Memory.enemyRoom[i] == this.creep.room.name){
            delete Memory.enemyRooms[i]
          }
        }
      }
      let sortedEnemies =  _.sortBy(enemies, enemy => this.creep.pos.getRangeTo(enemy))
      if(this.creep.attack(sortedEnemies[0]) == ERR_NOT_IN_RANGE){
        this.creep.moveTo(sortedEnemies[0])
      }
    }
    if(Memory.enemyRoom.length == 0){
      this.creep.memory.suicide = true
      this.creep.moveTo(Game.getObjectById(Memory.homespawn))
    }
  }
}
