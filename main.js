
var roleHarvester = require('role.Harvester');
var roleMiner = require('role.Miner');
var roleUpgrader = require('role.Upgrader');
var roleBuilder = require('role.Builder');
var roleExpander = require('role.Expander');
var roleAttacker = require('role.Attacker');
var roleRunner = require('role.Runner');
var methodRoomSetup = require('method.Misc');


module.exports.loop = function () {
    var tower = Game.getObjectById('5f65100c7f58927b257d2466');
    if(tower) {
        var closestHostile = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(closestHostile) {
            tower.attack(closestHostile);
        }
        var structs = tower.room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        })
        var closestDamagedStructure = tower.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.hits < structure.hitsMax
        });
        for(i=0; i<structs.length; i++){
            if((structs[i].structureType != STRUCTURE_WALL && structs[i].structureType != STRUCTURE_RAMPART) || structs[i].structureType == STRUCTURE_WALL && structs[i].hits < 1000 || structs[i].structureType == STRUCTURE_RAMPART && structs[i].hits < 1000){
                tower.repair(structs[i]);
                break
            }
        }

    }
    var sourceContainers = methodRoomSetup.energyContainers(Game.spawns['TheFort'].room)
    var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester');
    var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder');
    var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader');
    var expanders = _.filter(Game.creeps, (creep) => creep.memory.role == 'expander');
    var attackers = _.filter(Game.creeps, (creep) => creep.memory.role == 'attacker');
    var runners = _.filter(Game.creeps, (creep) => creep.memory.role == 'runner');
    var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner');
    var minerMod = 0
    for (var i=0; i < miners.length; i++){
        if(miners[i].ticksToLive < 120) {
            minerMod++
        }
    }
    var spawnEnergy = methodRoomSetup.totalEnergy()
    if(spawnEnergy >= 150) {
        if(attackers.length < 0) {
            var newName = 'Attacker' + Game.time;
            console.log('Spawning new attacker: ' + newName);
            Game.spawns['TheFort'].spawnCreep([ATTACK,MOVE], newName,
                {memory: {role: 'attacker'}});
        }
    }
    if(spawnEnergy >= 400) {
        if(runners.length < 2) {
            var newName = 'Runner' + Game.time;
            console.log('Spawning new runner: ' + newName);
            Game.spawns['TheFort'].spawnCreep([CARRY,CARRY,CARRY,CARRY,MOVE,MOVE], newName,
                {memory: {role: 'runner'}});
        }
        if(harvesters.length < 3) {
            var newName = 'Harvester' + Game.time;
            console.log('Spawning new harvester: ' + newName);
            Game.spawns['TheFort'].spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], newName,
                {memory: {role: 'harvester'}});
        }
        if(builders.length < 3) {
            var newName = 'Builder' + Game.time;
            console.log('Spawning new builder: ' + newName);
            Game.spawns['TheFort'].spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], newName,
                {memory: {role: 'builder'}});
        }
        if(upgraders.length < 1) {
            var newName = 'Upgrader' + Game.time;
            console.log('Spawning new upgrader: ' + newName);
            Game.spawns['TheFort'].spawnCreep([WORK,WORK,CARRY,CARRY,MOVE,MOVE], newName,
                {memory: {role: 'upgrader'}});
        }
        if(expanders.length < 0) {
            var newName = 'Expander' + Game.time;
            console.log('Spawning new expander: ' + newName);
            Game.spawns['TheFort'].spawnCreep([CLAIM,MOVE], newName,
                {memory: {role: 'expander'}});
        }
        if(miners.length - minerMod < sourceContainers.length && spawnEnergy >= 550) {
            var newName = 'Miner' + Game.time;
            console.log('Spawning new miner: ' + newName);
            Game.spawns['TheFort'].spawnCreep([MOVE,WORK,WORK,WORK,WORK,WORK], newName,
                {memory: {role: 'miner'}});
        }
    }
    var i=0
    var c=0
    for(var name in Game.creeps) {
        var creep = Game.creeps[name];
        if(creep.memory.role == 'miner') {
            roleMiner.run(creep, c);
            c++
        }
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
        if(creep.memory.role == 'attacker') {
            roleAttacker.run(creep, i);
        }
        if(creep.memory.role == 'runner') {
            roleRunner.run(creep, i);
        }
    }

}
