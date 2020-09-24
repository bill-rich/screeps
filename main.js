require('prototype.Room')
require('prototype.Creep')
require('prototype.Spawn')
require('prototype.pos')

let roleAttacker = require('role.attacker')
let roleHarvester = require('role.harvester')
let roleBuilder = require('role.builder')
let roleMiner = require('role.miner')
let roleUpgrader = require('role.upgrader')
let roleRemoteHarvester = require('role.remoteharvester')
let tower = require('tower')
var styles = require('styles')

module.exports.loop = function () {
  var room, harvesters, spawn, builders, miners, upgraders
  harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
  builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
  miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
  upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
  for(room in Game.rooms){
    var nroom = Game.rooms[room]
    if(!nroom.controller.my){
      continue
    }

    nroom.createRoads()
    spawn = Game.rooms[room].find(FIND_STRUCTURES, {
      filter: (structure) => {
        return structure.structureType == STRUCTURE_SPAWN
      }
    })[0]
    spawn.spawn_creeps()
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
      if(creep.memory.role == 'remoteharvester') {
        var miner = new roleRemoteHarvester(creep)
        miner.run(creep)
      }
      if(creep.memory.role == 'attacker') {
        var attacker = new roleAttacker(creep)
        attacker.run(creep)
      }
    }
  }
}

