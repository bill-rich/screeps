let styles = require("styles")

module.exports = class {
  constructor(creep){
    this.creep = creep
  }

  find(){
    let result =  _.reduce(Game.creeps, function(scout, creep, key) {
      if(creep.memory.role == "scout"){
        scout.push(creep)
      }
      return scout
    }, [])
    return result
  }

  wanted(){
    let rooms = _.values(Game.rooms)[0].adjacentRooms()
    return _.unique(rooms).length
  }

  run(){
    let self = this
    this.creep.memory.target = ""
    if(!this.creep.memory.target){
      for(let adjacent of this.creep.room.adjacentRooms()){
        let assigned = _.filter(_.values(Game.creeps), function(creep){
          return creep.memory.target == adjacent.target
        })
        if(assigned.length == 0 ){
          self.creep.memory.target = adjacent.target
          self.creep.memory.home = adjacent.source
          break
        }
      }
    }
    if(this.creep.room.name != this.creep.memory.target && this.creep.room.name != this.creep.memory.home){
      let room = Game.rooms[this.creep.memory.home]
      if(!room.controller){
        //console.log("No controller in room " + room.name)
        return
      }
      this.creep.moveTo(room.controller.pos)
      return
    }
    if(this.creep.room.name != this.creep.memory.target){
      let room = Game.rooms[this.creep.memory.home]
      let exitDir = room.findExitTo(this.creep.memory.target)
      let exit = this.creep.pos.findClosestByPath(exitDir)
      this.moveTo(exit)
    }
    if(this.creep.room.name == this.creep.memory.target){
      let room = Game.rooms[this.creep.memory.target]
      let controllers =_.filter(_.values(Game.rooms), function(r){ return (r.controller && r.controller.my) })
      if(Game.gcl > controllers.length){
        if(this.creep.claimController(room.controller) == ERR_NOT_IN_RANGE){
          this.creep.moveTo(room.controller)
        }
      } else {
        if(this.creep.reserveController(room.controller) == ERR_NOT_IN_RANGE){
          this.creep.moveTo(room.controller)
        }

      }
    }
  }

  moveTo(dest){
    this.creep.moveTo(dest, {visualizePathStyle: styles.prio})
  }
}
