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

Room.prototype.allStorage = function(){
  // TODO: Fix this crap
  let storage = _.reduce(Game.rooms, function(col, room, key){
    col = col.concat(room.find(FIND_MY_STRUCTURES, {
      filter: s => {
        return (s.structureType == STRUCTURE_STORAGE)
      }
    }))
    return col
  }, [])
  return storage
}

Room.prototype.getObject = function(identifier){
  if(identifier.x){
    return new RoomPosition(identifier.x, identifier.y, identifier.roomName)
  }
  if(typeof(identifier) == "string"){
    return Game.getObjectById(identifier)
  }
}

Room.prototype.perform = function(target, dest, taskType){
  switch(taskType){
    case "harvest":
      return target.harvest(dest)
    case "move":
      return target.moveTo(dest)
    case "pickup":
      return target.get(dest)
    case "deposit":
      return target.give(dest)
    case "work":
      return target.work(dest)
    default:
      throw('Room.perform: unknown task type:' + taskType)
  }
}

Room.prototype.allBaseStorage = function(){
  // TODO: Fix this crap
  let storage = _.reduce(Game.rooms, function(col, room, key){
    col = col.concat(room.find(FIND_MY_STRUCTURES, {
      filter: s => {
        return (s.structureType == STRUCTURE_SPAWN ||
          s.structureType == STRUCTURE_EXTENSION ||
          s.structureType == STRUCTURE_TOWER)
      }
    }))
    return col
  }, [])
  return storage
}

Room.prototype.allSources = function(){
  return _.reduce(Game.rooms, function(allSources, room, name) {
    return allSources.concat(room.find(FIND_SOURCES))
  }, [])
}

Room.prototype.allEnergy = function(){
  let resources = this.find(FIND_DROPPED_RESOURCES, {
    filter: (r) => {
      return r.netEnergy > 0
    }
  })
  let tombstones = this.find(FIND_TOMBSTONES, {
    filter: t => {
      return t.netEnergy > 0
    }
  })
  let ruins = this.find(FIND_RUINS, {
    filter: r => {
      return r.netEnergy > 0
    }
  })
  let containers = this.find(FIND_STRUCTURES, {
    filter: s => {
      return s.structureType == STRUCTURE_CONTAINER && s.netEnergy > 0
    }
  })
  let storages = this.find(FIND_MY_STRUCTURES, {
    filter: s => {
      return s.structureType == STRUCTURE_STORAGE && s.netEnergy > 0
    }
  })
  let volitile = resources.concat(tombstones)
  let stable = containers.concat(ruins)
  return {
    volitile: volitile,
    stable:   stable,
    storage:  storages
  }
}

Room.prototype.createRoads = function(){
  if(this.controller.level < 2){
    return OK
  }
  if(_.values(Game.constructionSites).length > 0){
    return OK
  }
  var sources = this.allSources()
  var spawns = this.spawns()
  for(let source of sources){
    for(let spawn of this.spawns()){
      //var path = this.findPath(source.pos, spawn.pos, {
      var path = PathFinder.search(source.pos, spawn.pos, {
        ignoreCreeps: true,
        //ignoreRoads:  true,
      }).path
      for(let coord of path){
        if(coord == path[0]){
          continue
        }
        let room = Game.rooms[coord.roomName]
        if(room.createConstructionSite(coord.x,coord.y, STRUCTURE_ROAD) == OK){
          return OK
        }
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


Room.prototype.adjacentRooms = function(){
  let rooms = []
  _.forEach(_.keys(Game.rooms), function(roomName){
    _.forEach(_.values(Game.map.describeExits(roomName)), function(adjacentRoom) {
      if(!_.values(Game.rooms).includes(adjacentRoom)){
        rooms.push({
          source: roomName,
          target: adjacentRoom
        })
      }
    })
  })
  return rooms
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

Room.prototype.buildContainers = function() {
  for(let source of this.find(FIND_SOURCES)){
    let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
      filter: s => {
        return s.structureType == STRUCTURE_CONTAINER
      }
    })
    if(containers.length == 0){
      for(let pos of source.pos.adjacent()){
        if(pos.canBuild()){
          return pos.createConstructionSite(STRUCTURE_CONTAINER)
        }
      }
    }
  }
}

Room.prototype.buildExtensions = function(){

  for(let structureType of [ STRUCTURE_EXTENSION, STRUCTURE_TOWER, STRUCTURE_STORAGE ]){
    var controller = this.controller;
    if(!controller){return;}
    var level = controller.level;
    if(!level){return;}
    var allowed_extensions = CONTROLLER_STRUCTURES[structureType][level];
    var extensions = this.find(FIND_STRUCTURES,{filter: {structureType: structureType}});
    var extensions_pending = this.find(FIND_CONSTRUCTION_SITES,{filter: {structureType: structureType}}).length;

    if(extensions_pending < 1 && allowed_extensions > extensions.length){
      this.placeNextBestExtension(extensions, structureType);
      return
    }
  }

}

Room.prototype.placeNextBestExtension = function(extensions, structureType){

  const candidates = [];
  const myspawns = this.find(FIND_MY_STRUCTURES, {
    filter: s => {
      return s.structureType == STRUCTURE_SPAWN
    }
  })
  extensions = extensions.concat(myspawns);
  for(const e of extensions){
    if(e){
      for(const d of e.pos.diagonals()){
        if(d.canBuild()){
          // we can build here, but will it cause traffic
          // lets check if its cardinals are buildable;
          if(d.cardinals().every(c => c.canBuild())){
            candidates.push(d);
          }
        }
      }
    }
  }
  if(myspawns[0]){
    const selected = candidates[Math.floor(Math.random()*candidates.length)];
    const created =  this.createConstructionSite(selected, structureType);
  }
}
