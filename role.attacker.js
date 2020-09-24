module.exports = class {
  constructor(creep){
    this.creep = creep
  }

  run(){
    if(Memory.enemyRoom && this.creep.room.name != Memory.enemyRoom){
      let exitDir = this.creep.room.findExitTo(Memory.enemyRoom)
      let exit = this.creep.pos.findClosestByRange(exitDir)
      this.creep.moveTo(exit)
    }
    if(this.creep.room.name == Memory.enemyRoom){

      let enemies = this.creep.room.enemyTargets()
      if(enemies.length == 0){
        Memory.enemyRoom = ""
      }
      let sortedEnemies =  _.sortBy(enemies, enemy => this.creep.pos.getRangeTo(enemy))
      if(this.creep.attack(sortedEnemies[0]) == ERR_NOT_IN_RANGE){
        this.creep.moveTo(sortedEnemies[0])
      }
    }
    if(!Memory.enemyRoom){
      this.creep.memory.suicide = true
      this.creep.moveTo(Game.getObjectById(Memory.homespawn))
    }
  }
}

