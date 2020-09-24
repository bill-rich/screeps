Room.prototype.energySources = function(){
  return this.find(FIND_SOURCES)
}

Room.prototype.spawns = function(){
  return this.find(FIND_STRUCTURES, {
    filter: (structure) => {
      return structure.structureType == STRUCTURE_SPAWN
    }
  })
}

Room.prototype.createRoads = function(){
  var sources = this.energySources()
  var spawns = this.spawns()
  for(let source of sources){
    for(let spawn of this.spawns()){
      var path = this.findPath(source.pos, spawn.pos, {
        ignoreCreeps: true,
        ignoreRoads:  true,
      })
      for(let coord of path){
        if(coord == path[0]){
          continue
        }
        this.createConstructionSite(coord.x,coord.y, STRUCTURE_ROAD)
      }
      var path = this.findPath(source.pos, this.controller.pos, {
        ignoreCreeps: true,
        ignoreRoads:  true,
      })
      for(let coord of path){
        if(coord == path[0] || coord == path[path.length-1]){
          continue
        }
        this.createConstructionSite(coord.x,coord.y, STRUCTURE_ROAD)
      }
    }
  }
}

Room.prototype.enemyTargets = function(){
  let enemyStructures = this.find(FIND_HOSTILE_STRUCTURES)
  let enemyCreeps = this.find(FIND_HOSTILE_CREEPS, {
    filter: (creep) => {
      return !Memory.allies.includes(creep.owner)
    }
  })
  return enemyStructures.concat(enemyCreeps)
}
