require('prototype.Room')
require('prototype.Creep')
require('prototype.Spawn')
require('prototype.pos')

let roleHarvester = require('role.harvester')
let roleBuilder = require('role.builder')
let roleMiner = require('role.miner')
let roleUpgrader = require('role.upgrader')
let roleRemoteHarvester = require('role.remoteharvester')
let tower = require('tower')

module.exports.loop = function () {
  var room, harvesters, spawn, builders, miners, upgraders
  harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
  miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
  upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
  for(room in Game.rooms){
    var nroom = Game.rooms[room]

    nroom.createRoads()
    spawn = Game.rooms[room].find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_SPAWN
      }
    })[0]
    spawn.spawn_creeps()
    //if(builders.length < 6 && Game.rooms[room].energyAvailable >= 300) {
    //  var newName = 'Builder' + Game.time;
    //  console.log('Spawning new builder: ' + newName);
    //  spawn.spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], newName,
    //    {memory: {role: 'builder'}});
    //}
    //if(upgraders.length < 1 && Game.rooms[room].energyAvailable >= 300) {
    //  var newName = 'Upgrader' + Game.time;
    //  console.log('Spawning new upgrader: ' + newName);
    //  spawn.spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], newName,
    //    {memory: {role: 'upgrader'}});
    //}
    //if(miners.length < 2 && Game.rooms[room].energyAvailable >= 300) {
    //  var newName = 'miner' + Game.time;
    //  console.log('Spawning new harvester: ' + newName);
    //  spawn.spawnCreep([WORK,WORK,CARRY,MOVE], newName,
    //    {memory: {role: 'miner'}});
    //}
    //if(harvesters.length < 3 && Game.rooms[room].energyAvailable >= 300) {
    //  var newName = 'Harvester' + Game.time;
    //  console.log('Spawning new harvester: ' + newName);
    //  spawn.spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], newName,
    //    {memory: {role: 'harvester'}});
    //}
    var towers = nroom.find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_TOWER
      }
    })

    for(let t of towers){
      let towerObj = new tower(t)
      towerObj.run()
    }
    
    for(var name in Game.creeps) {
      var creep = Game.creeps[name]
      if(creep.memory.role == 'harvester') {
        var harvester = new roleHarvester(creep)
        harvester.run(creep)
      }
      if(creep.memory.role == 'builder') {
        var builder = new roleBuilder(creep)
        builder.run(creep)
      }
      if(creep.memory.role == 'miner') {
        var miner = new roleMiner(creep)
        miner.run(creep)
      }
      if(creep.memory.role == 'upgrader') {
        var miner = new roleUpgrader(creep)
        miner.run(creep)
      }
      if(creep.memory.role == 'remoteHarvester') {
        var miner = new roleRemoteHarvester(creep)
        miner.run(creep)
      }
    }
  }
}

