//require('util.functions')
//require('prototype.Spawn')
require('prototype.pos')
require('prototype.Room')
require('prototype.Resource')
require('prototype.Source')
require('prototype.RoomObject')
require('prototype.Spawn')
require('prototype.ConstructionSite')
require('prototype.Creep')
require('prototype.Structure')
let tower = require('tower')
let styles = require('styles')

module.exports.loop = function () {
  
  pruneMemory()
  setUpMemory()

  clearTowQueue()
  spawnTasks()
  creepTasks()

  roomTasks()
  towerTasks()

}


function roomTasks(){
  for(let room of _.values(Game.rooms)){
    room.buildExtensions()
    room.createRoads()
  }
}

function towerTasks(){
  _.forEach(_.values(Game.rooms), function(room){
    _.forEach(room.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_TOWER
      }
    }), function(t){
      let towerObj = new tower(t)
      towerObj.run()
    })
  })
}

function clearTowQueue(){
  Memory.towQueue = {}
}

function creepTasks(){
  for(let creepType in CREEP_TYPES){
    let genCreep = new CREEP_TYPES[creepType]["object"]()
    for(let creep of genCreep.find()){
      let creepModel = new CREEP_TYPES[creepType]["object"](creep)
      creepModel.run()
    }
  }
}

function spawnTasks(){
  let bestSpawn = _.first(_.sortBy(_.values(Game.spawns), s => s.level))
  _.forEach(Game.spawns, spawn => {
    spawn.spawnInfo()
    if(spawn.id == bestSpawn.id){
      let result = spawn.spawnCreeps() 
      if(result != OK){
        console.log("Error Spawning: " + result)
      }
    }
  })
}

function pruneMemory(){
  _.forEach(Memory.creeps, (memCreep, key) => {
    if(!Game.creeps[key]){
      console.log("deleting:" + key)
      delete Memory.creeps[key]
    }
  })
}

function setUpMemory() {
  let memoryArrays = [ "ignoreRoom", "enemyRoom", "allies", "spawnQueue" ]
  let memoryObjects = [ "sources", "towQueue", "structures" ]

  memoryArrays.forEach(memItem => {
    if(Memory[memItem] === undefined){
      Memory[memItem] = []
    }
  })

  memoryObjects.forEach(memItem => {
    if(Memory[memItem] === undefined){
      Memory[memItem] = {}
    }
  })
}
