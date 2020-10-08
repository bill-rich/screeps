var roleMiner  = require('role.miner')
var roleWorker = require('role.worker')
var roleTransport = require('role.transport')
var roleScout = require('role.scout')

global.miner =  new roleMiner()
global.worker = new roleWorker()
global.transport = new roleTransport()
global.scout = new roleScout()


var MIN_ATTACKERS = 0

global.CREEP_TYPES = {
  miner: {
    body          : [MOVE,WORK],
    maxMultiplier : 5,
    memory        : { role: "miner" },
    object        : roleMiner
  },
  worker: {
    body          : [MOVE,WORK,CARRY],
    maxMultiplier : 9999,
    memory        : { role: "worker" },
    object        : roleWorker
  },
  transport: {
    body          : [MOVE,CARRY,CARRY],
    maxMultiplier : 9999,
    memory        : { role: "transport" },
    object        : roleTransport
  },
  scout: {
    body          : [MOVE,CLAIM],
    maxMultiplier : 2,
    memory        : { role: "scout" },
    object        : roleScout
  },
}

StructureSpawn.prototype.spawnCreeps = function() {
  let finalResult = OK
  for(let creepType in CREEP_TYPES){
    try{
      let result = this.spawn(creepType) 
      if(result != OK){
        finalResult = result
      } else {
        break
      }
    } catch(err){
      console.log(err)
    }
  }
  return finalResult
}
StructureSpawn.prototype.spawnInfo = function(){
  var infostr;
  if(this.spawning) {
    var spawningCreep = Game.creeps[this.spawning.name];
    infostr = '🛠️' + spawningCreep.memory.role;
  }
  else{
    infostr = "🔋" + this.room.energyAvailable + "/" + this.room.energyCapacityAvailable
  }
  this.room.visual.text(
    infostr,
    this.pos.x - 1,
    this.pos.y,
    {align: 'right', opacity: 0.8});
}

StructureSpawn.prototype.creepCost = function(body){
    let cost = 0
    for(let part of body){
      cost += BODYPART_COST[part]
    }
    return cost
  }

StructureSpawn.prototype.spawn = function(creepType) {
//  // TODO: Improve queueing
  if(this.spawning){
    return OK
  }
  _.forEach( CREEP_TYPES, (value, key, map) => {
    let creepType = new value["object"]()
    if(creepType.find().length + Memory.spawnQueue.filter(queue => queue == key) < creepType.wanted()){
      console.log("adding "+ key +" to the queue")
      Memory.spawnQueue.push(key)
    }
  })
  if(Memory.spawnQueue.length > 0){
    creepType = Memory.spawnQueue.shift()
    let energyAvailable = this.room.energyAvailable
    let energyCapacity  = this.room.energyCapacityAvailable
    let bodyUnit        = CREEP_TYPES[creepType]["body"]
    let bodyUnitCost    = this.creepCost(bodyUnit)
    let bodyMax         = CREEP_TYPES[creepType]["maxMultiplier"]
    let bodyMultiplier  = Math.min(Math.floor(energyCapacity/bodyUnitCost), bodyMax)
    let memory          = CREEP_TYPES[creepType]["memory"]
    let name            = creepType + Game.time

    if(transport.find().length == 0 || miner.find().length == 0){
      energyCapacity = 300
    }
    let body = []
    for(let i=1; i <= bodyMultiplier; i++){
      body = body.concat(bodyUnit)
      if(this.creepCost(body) + bodyUnitCost > energyCapacity){
        break
      }
    }
    if(this.creepCost(body) > energyAvailable) {
      Memory.spawnQueue.unshift(creepType)
      return OK
    }
    console.log("spawning " + name)
    return this.spawnCreep(body, name, { memory: memory })
  }
  return OK
}


