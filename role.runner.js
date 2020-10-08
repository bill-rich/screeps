module.exports = class {
  constructor(creep){
    this.creep = creep
  }

  find(){
    return util.findCreepsByRole("runner")
  }

  wanted(){
    return CREEP_TYPES["carry"]["object"].find().length
  }

  run(creep){
    let currentTarget = Game.getObjectById(creep.memory.target)
    if(currentTarget && !currentTarget.memory.dest){
      creep.memory.target = ""
    }
    if(!creep.memory.target){
      let target = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
        filter: (towCreep) => {
          return (!util.isTargeted(towCreep) &&
                  towCreep.memory.dest
          )
        }
      })
      if(target){
        creep.memory.target = target.id
      }
    }
    if(creep.memory.target){
      let target = Game.getObjectById(creep.memory.target)
      if(!target){
        creep.memory.target = ""
        return
      }
			if(creep.pull(target) == ERR_NOT_IN_RANGE){
				creep.moveTo(target);
			} else {
				let targetDest = new RoomPosition(target.memory.dest.x, target.memory.dest.y, target.memory.dest.roomName)
				target.move(creep)
				if((targetDest.occupied() && creep.pos.isNearTo(targetDest)) || (!targetDest.occupied() && creep.pos.getRangeTo(targetDest) == 0)) {
					creep.move(creep.pos.getDirectionTo(target));
				} else {
					creep.moveTo(targetDest);
				}
			}
		}
  }
}

