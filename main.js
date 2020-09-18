
var roleHarvester = require('role.Harvester');
var roleMiner = require('role.Miner');
var roleUpgrader = require('role.Upgrader');
var roleBuilder = require('role.Builder');
var roleExpander = require('role.Expander');
var roleAttacker = require('role.Attacker');
var methodRoomSetup = require('method.Misc');


module.exports.loop = function () {
    //methodRoomSetup.energyContainers(Game.spawns['TheFort'].room)
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var expanders = _.filter(Game.creeps, (creep) => creep.memory.role == 'expander');
    var attackers = _.filter(Game.creeps, (creep) => creep.memory.role == 'attacker');
    var spawnEnergy = Game.spawns['TheFort'].store.getUsedCapacity('energy')
    if(spawnEnergy >= 150) {
        if(attackers.length < 1) {
            var newName = 'Attacker' + Game.time;
            console.log('Spawning new attacker: ' + newName);
            Game.spawns['TheFort'].spawnCreep([ATTACK,MOVE], newName,
                {memory: {role: 'attacker'}});
        }
        if(harvesters.length < 2) {
            var newName = 'Harvester' + Game.time;
            console.log('Spawning new harvester: ' + newName);
            Game.spawns['TheFort'].spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], newName,
                {memory: {role: 'harvester'}});
            return
        }
        if(builders.length < 2) {
            var newName = 'Builder' + Game.time;
            console.log('Spawning new builder: ' + newName);
            Game.spawns['TheFort'].spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], newName,
                {memory: {role: 'builder'}});
        }
        if(upgraders.length < 6) {
            var newName = 'Upgrader' + Game.time;
            console.log('Spawning new upgrader: ' + newName);
            Game.spawns['TheFort'].spawnCreep([WORK,CARRY,CARRY,MOVE,MOVE], newName,
                {memory: {role: 'upgrader'}});
        }
        if(expanders.length < 0) {
            var newName = 'Expander' + Game.time;
            console.log('Spawning new expander: ' + newName);
            Game.spawns['TheFort'].spawnCreep([CLAIM,MOVE], newName,
                {memory: {role: 'expander'}});
        }
    }
    var i=0
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'harvester') {
            roleHarvester.run(creep, i);
            i++
        }
        if(creep.memory.role == 'upgrader') {
            roleUpgrader.run(creep, i);
        }
        if(creep.memory.role == 'builder') {
            roleBuilder.run(creep, i);
        }
        if(creep.memory.role == 'expander') {
            roleExpander.run(creep, i);
        }
        if(creep.memory.role == 'miner') {
            //roleMiner.run(creep, i);
        }
        if(creep.memory.role == 'attacker') {
            roleAttacker.run(creep, i);
        }
    }

}
