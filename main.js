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


  for(let room of _.values(Game.rooms)){
    room.createRoads()
    for(let tow of room.find(FIND_STRUCTURES, {
      filter: s => {
        return s.structureType == STRUCTURE_TOWER
      }
    })){
      let t = new tower(tow)
      t.run()
    }
  }

  try{
    genRoom.buildExtensions()
    genRoom.buildContainers()
  } catch (err) {
    console.log(err)
  }

  try{
    creepTasks()
  } catch (err){
    console.log(err)
  }

  try{
    spawnTasks()
  } catch (err) {
    console.log(err)
  }
  createTasks()
  runTasks()
}

function runTasks(){
  for(let task of Memory.taskQueue){
    runTask(task)
  }
  for(let creep of _.values(Game.creeps)){
    if(creep.memory.task){
      runTask(creep.memory.task)
    }
  }
}

function runTask(task){
  let target = genRoom.getObject(task.target)
  let dest   = genRoom.getObject(task.dest)
  try{
    target.memory.task = task
    let result = genRoom.perform(target, dest, task.type)
    if(result == ERR_NOT_IN_RANGE){
      result = genRoom.perform(target, dest, "move")
    }
    if(result != OK && result != ERR_TIRED){
      delete target.memory.task
    }
  } catch(err) {
    if(target && target.memory){
      delete target.memory.task
    }
    //console.log("Error running task. target:" + task.target + ", dest:" + task.dest + "   " + err)
  }
}

function createTasks(){
  if(Game.time - Memory.lastTaskTime < Memory.taskSmart){
    return
  }
  if(Game.cpu.bucket < Memory.cpuBucket){
    Memory.taskSmart++
  } else if(Memory.taskSmart >= 0) {
    Memory.taskSmart--
  }
  Memory.cpuBucket = Game.cpu.bucket
  Memory.taskQueue = []
  Memory.taskQueue = Memory.taskQueue.concat(miningTasks())
  transportTasks()
  workerTasks()
  Memory.lastTaskTime = Game.time
}

function transportTasks(){
  let allOptions = []
  let deliverers = _.filter(globalTransport.find(), function(t){
    return t.netEnergy >= 100 && !t.memory.task
  })
  let pickers = _.filter(globalTransport.find(), function(t){
    return t.energyCapacity >= 50 && !t.memory.task
  })
  let recievers = _.filter(globalWorker.find(), function(t){
    return t.energyCapacity >= 25 && !t.memory.task
  })
  let baseStorage = _.filter(genRoom.allBaseStorage(), function(s){
    for(let resource of RESOURCES_ALL){
      if(s.store.getFreeCapacity(resource) > 0){
        return true
      }
    }
  })

  // Need to prioritize volitile. TODO: Add unique function so we can combine multiple lists.
  let allEnergy = genRoom.allEnergy(100)
  let high = generatePossibleTasks(allEnergy.volitile, pickers, "pickup")
  let medium = generatePossibleTasks(allEnergy.stable, pickers, "pickup", 10)
  let low = generatePossibleTasks(allEnergy.storage, pickers, "pickup", 1000)
  let delHigh = generatePossibleTasks(baseStorage, deliverers, "deposit")
  let delLow = generatePossibleTasks(allEnergy.storage, deliverers, "deposit", 1000)
  let transfers = generatePossibleTasks(recievers, deliverers, "deposit", 10000)

  //return sortCapacityTasks([...high, ...medium, ...low, ...delHigh, ...delLow, ...transfers])
  let standardTasks = sortCapacityTasks([...high, ...medium, ...low, ...delLow, ...transfers])
  let highTasks = sortCapacityTasks([...delHigh])
  return uniqueTaskTargets([...highTasks, ...standardTasks])
}

function uniqueTaskTargets(taskList){
  return _.unique(taskList, function(task){
    return task.target
  })
}

function generatePossibleTasks(dests, targets, taskType, handicap = 1){
  let allOptions = []
  for(let dest of dests){
    for(let target of targets){
      let task = {
        type:  taskType,
        dest:  dest.id,
        target: target.id,
        cost:  PathFinder.search(dest.pos, target.pos).cost * handicap,
      }
      allOptions.push(task)
    }
  }
  return allOptions
}

function workerTasks() {
  let allOptions = []
  let builders = _.filter(globalWorker.find(), function(t){
    return t.netEnergy > 0 && !t.memory.task
  })
  let pickers = _.filter(globalWorker.find(), function(t){
    return t.energyCapacity > 0 && !t.memory.task
  })
  let conSites = _.values(Game.constructionSites)
  let controllers = _.reduce(Game.rooms, function (acc, val, key){
    if(val && val.controller && val.controller.my){
      acc.push(val.controller)
    }
    return acc
  }, [] )

  let allEnergy = genRoom.allEnergy(100)
  allOptions = allOptions.concat(generatePossibleTasks(allEnergy.volitile, pickers, "pickup"))
  allOptions = allOptions.concat(generatePossibleTasks(allEnergy.stable, pickers, "pickup"))
  allOptions = allOptions.concat(generatePossibleTasks(allEnergy.storage, pickers, "pickup"))
  allOptions = allOptions.concat(generatePossibleTasks(controllers, builders, "work"))
  let highTasks = generatePossibleTasks(conSites, builders, "work", 0.5)

  let standardTasks = sortCapacityTasks([...allOptions, ...highTasks], 0.5)
  return uniqueTaskTargets([...highTasks, ...standardTasks])
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
    if(task.type == "harvest" && container.length > 0 && target && !target.pos.isEqualTo(container[0].pos)){
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
  for(let creepType in ['scout']){
    let genCreep = new CREEP_TYPES['scout']["object"]()
    //let genCreep = new CREEP_TYPES[creepType]["object"]()
    for(let creep of genCreep.find()){
      let creepModel = new CREEP_TYPES['scout']["object"](creep)
      creepModel.run()
    }
  }
  for(let creepType in ['attacker']){
    let genCreep = new CREEP_TYPES['attacker']["object"]()
    //let genCreep = new CREEP_TYPES[creepType]["object"]()
    for(let creep of genCreep.find()){
      let creepModel = new CREEP_TYPES['attacker']["object"](creep)
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
