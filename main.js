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

global.genRoom = _.first(_.values(Game.rooms))

module.exports.loop = function () {
  
  pruneMemory()
  setUpMemory()

  genRoom.buildExtensions()
  genRoom.createRoads()
  genRoom.buildContainers()

  spawnTasks()
  createTasks()
  runTasks()
}

function runTasks(){
  for(let task of Memory.taskQueue){
    try{
      let target = genRoom.getObject(task.target)
      let dest   = genRoom.getObject(task.dest)
      if(genRoom.perform(target, dest, task.type) == ERR_NOT_IN_RANGE){
        genRoom.perform(target, dest, "move")
      }
    } catch(err) {
      console.log("Error running task. target:" + task.target + ", dest:" + task.dest + "   " + err)
    }
  }
}

function createTasks(){
  Memory.taskQueue = []
  Memory.taskQueue = Memory.taskQueue.concat(miningTasks())
  transportTasks()
  workerTasks()
}

function transportTasks(){
  let allOptions = []
  let deliverers = _.filter(globalTransport.find(), function(t){
    return t.netEnergy > 0
  })
  let pickers = _.filter(globalTransport.find(), function(t){
    return t.energyCapacity > 0
  })
  let baseStorage = _.filter(genRoom.allBaseStorage(), function(s){
    for(let resource of RESOURCES_ALL){
      if(s.store.getFreeCapacity(resource) > 0){
        return true
      }
    }
  })

  // Need to prioritize volitile. TODO: Add unique function so we can combine multiple lists.
  allOptions = allOptions.concat(generatePossibleTasks(genRoom.allEnergy().volitile, pickers, "pickup"))
  allOptions = allOptions.concat(generatePossibleTasks(genRoom.allEnergy().stable, pickers, "pickup"))
  allOptions = allOptions.concat(generatePossibleTasks(genRoom.allEnergy().storage, pickers, "pickup"))
  allOptions = allOptions.concat(generatePossibleTasks(baseStorage, deliverers, "deposit"))
  allOptions = allOptions.concat(generatePossibleTasks(genRoom.allEnergy().storage, deliverers, "deposit"))
  return sortCapacityTasks(allOptions)
}

function generatePossibleTasks(dests, targets, taskType){
  let allOptions = []
  for(let dest of dests){
    for(let target of targets){
      let task = {
        type:  taskType,
        dest:  dest.id,
        target: target.id,
        cost:  PathFinder.search(dest.pos, target.pos).cost,
      }
      allOptions.push(task)
    }
  }
  return allOptions
}

function workerTasks() {
  let allOptions = []
  let builders = _.filter(globalWorker.find(), function(t){
    return t.netEnergy > 0
  })
  let pickers = _.filter(globalWorker.find(), function(t){
    return t.energyCapacity > 0
  })
  let conSites = _.values(Game.constructionSites)
  let controllers = _.reduce(Game.rooms, function (acc, val, key){
    if(val.controller.my){
      acc.push(val.controller)
    }
    return acc
  }, [] )

  allOptions = allOptions.concat(generatePossibleTasks(genRoom.allEnergy().volitile, pickers, "pickup"))
  allOptions = allOptions.concat(generatePossibleTasks(genRoom.allEnergy().stable, pickers, "pickup"))
  allOptions = allOptions.concat(generatePossibleTasks(genRoom.allEnergy().storage, pickers, "pickup"))
  allOptions = allOptions.concat(generatePossibleTasks(conSites, builders, "work"))
  allOptions = allOptions.concat(generatePossibleTasks(controllers, builders, "work"))

  return sortCapacityTasks(allOptions, 0.5)
}

function miningTasks(){
  let allOptions = []
  for(let source of genRoom.allSources()){
    for(let miner of globalMiner.find()){
      let task = {
        type:  "harvest",
        dest:  source.id,
        target: miner.id,
        cost:  PathFinder.search(source.pos, miner.pos).cost,
      }
      allOptions.push(task)
    }
  }
  let sorted = sortUniqueTasks(allOptions)

  // Make miners move to containers if they exist near the source
  return _.reduce(sorted, function(acc, task){
    let container = genRoom.getObject(task.dest).pos.findInRange(FIND_STRUCTURES, 1,  {
      filter: s => {
        return s.structureType == STRUCTURE_CONTAINER
      }
    })
    let target = genRoom.getObject(task.target)
    if(task.type == "harvest" && container.length > 0 && !target.pos.isEqualTo(container[0].pos)){
      task.dest = container[0].id
      task.type = "move"
    }
    acc.push(task)
    return acc
  }, [])
}

function sortCapacityTasks(taskList, coPenalty = 0){
  if(taskList.length == 0){
    return []
  }
  let returnList = []
  let sorted = _.sortBy(taskList, function(t){ 
    let targeted = _.filter(Memory.taskQueue, function(et){
      return et.dest == t.dest
    })
    return t.cost + (t.cost * coPenalty * targeted.length)
  })
  let best = sorted.shift()
  Memory.taskQueue.push(best)
  sorted = _.reduce(sorted, function(acc, value) {
    let valObject = genRoom.getObject(value.dest)
    if(value.target != best.target && ((value.type == "deposit" && valObject.usage < 100) || (value.type == "pickup" && valObject.usage > 0) || value.type == "work")){
      acc.push(value)
    }
    return acc
  }, [])
  return returnList.concat(sortCapacityTasks(sorted, coPenalty))
}

function sortUniqueTasks(taskList){
  if(taskList.length == 0){
    return []
  }
  let returnList = []
  let sorted = _.sortBy(taskList, t => t.cost)
  let best = sorted.shift()
  sorted = _.reduce(sorted, function(acc, value) {
    if(value.target != best.target && value.dest != best.dest){
      acc.push(value)
    }
    return acc
  }, [])
  returnList.push(best)
  return returnList.concat(sortUniqueTasks(sorted))
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
      delete Memory.creeps[key]
    }
  })
}

function setUpMemory() {
  let memoryArrays = [ "ignoreRoom", "enemyRoom", "allies", "spawnQueue", "taskQueue" ]
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
