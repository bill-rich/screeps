var MIN_ATTACKERS = 0

StructureSpawn.prototype.spawn_creeps = function() {
        Memory.homespawn = this.id
        var sources = this.room.find(FIND_SOURCES).length;
        var harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester').length;
        var builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder').length;
        var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader').length;
        var miners = _.filter(Game.creeps, (creep) => creep.memory.role == 'miner').length;
        var attackers = _.filter(Game.creeps, (creep) => creep.memory.role == 'attacker').length;
        var remoteharvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'remoteharvester').length;
        var hostiles = this.room.find(FIND_HOSTILE_CREEPS).length;

        var storedEnergy = 0;
        if(this.room.storage){
            storedEnergy = this.room.storage.store[RESOURCE_ENERGY];
        }
        var containers = this.room.find(FIND_STRUCTURES).filter(
            struct => struct.structureType == STRUCTURE_CONTAINER
        );
        var containedEnergy = containers.reduce(
            ( accumulator, struct ) => accumulator + struct.store[RESOURCE_ENERGY],
            0
        );

        var wanted_harvesters = needed_harvs(this.room);
        var wanted_builders = wanted_harvesters + Math.floor((storedEnergy + containedEnergy) / (275 * this.room.controller.level));
        var wanted_builders = wanted_builders + Math.floor(storedEnergy / 5000);
				var wanted_miners = this.room.find(FIND_SOURCES).length
        var wanted_remoteharvesters = 2;
        var wanted_attackers = MIN_ATTACKERS+(2*hostiles);
        if(Memory.enemyRoom){
          wanted_attackers = wanted_attackers +2
        }
				var wanted_upgraders = 1

        var counts_str = ("H:" + harvesters + "/" + wanted_harvesters
                          + " B:" + builders+ "/" + wanted_builders
                          + " M:" + miners + "/" + wanted_miners
                          + " R:" + remoteharvesters + "/" + wanted_remoteharvesters
                          + " U:" + upgraders + "/" + wanted_upgraders
                          + " A:" + attackers + "/" + wanted_attackers
                          + " E:" + (storedEnergy + containedEnergy)
                         );

        var energyAvailable = this.room.energyAvailable;
        var energyCap = this.room.energyCapacityAvailable;
        if(Object.values(Game.creeps).length < 3){
            // not many creeps. lets error on being an early room and just use 300
            console.log("fail over, report low cap:" + this.room.energyAvailable);
            energyCap = this.room.energyAvailable;
        }
        for(let name in Game.creeps){
          let creep = Game.creeps[name]
          let range = this.pos.getRangeTo(creep.pos)
          if(range <= 1 && creep.memory.suicide == true){
            this.recycleCreep(creep)
          }
          if(range <= 1 && creep.ticksToLive < 1510 && energyCap - creep.memory.body < 250){
            if(this.renewCreep(creep) == OK){
              creep.say("Yay! " + creep.ticksToLive)
            }
          }
          if(range <= 1 && energyCap - creep.memory.body > 250 && creep.ticksToLive < 250){
            creep.say("Oh no!")
            //this.recycleCreep(creep)
          }
        }
        spawn_counts(this, counts_str);
        spawn_info(this, energyAvailable, energyCap);
        if(this.spawning){
            //busy
            return -1;
        }
        if(harvesters < wanted_harvesters) {
            return this.createHarvester(energyCap);
        }
        if(miners < wanted_miners) {
            return this.createMiner(energyCap);
        }
        if(builders < wanted_builders) {
            return this.createBuilder(energyCap);
        }
        if(upgraders < wanted_upgraders) {
            return this.createUpgrader(energyCap);
        }
        if(attackers < wanted_attackers) {
            return this.createAttacker(energyCap);;
        }
        return this.createRemoteHarvester(energyCap);;
        console.log("Nothing to spawn");
        return -2;
    }

    StructureSpawn.prototype.createBuilder = function(energyCap) {
        var energyAvailable = this.room.energyAvailable;

        if(energyAvailable < energyCap){
            //lets wait to make workers
            return ERR_NOT_ENOUGH_ENERGY;
        }
        // always make [work, carry, move]*X which costs 200 per x
        // don't make workers bigger than size 4 for now
        var bodySize = Math.min(Math.floor(energyAvailable / 200), 4);
        var body = [];
        for(let i=0; i<bodySize; i++){
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
        }
        var newName = 'builder' + Game.time;
        return this.spawnCreep(body, newName, {memory: {role: 'builder', building: true, body: energyCap}});
    };

    StructureSpawn.prototype.createUpgrader = function(energyCap) {
        var energyAvailable = this.room.energyAvailable;

        if(energyAvailable < energyCap){
            //lets wait to make upgraders
            return ERR_NOT_ENOUGH_ENERGY;
        }
        // always make [work,work, carry, move]*X which costs 200 per x
        // don't make upgraders bigger than size 4 for now
        var bodySize = Math.min(Math.floor(energyAvailable / 200), 4);
        var body = [];
        for(let i=0; i<bodySize; i++){
            body.push(WORK);
            body.push(CARRY);
            body.push(MOVE);
        }
        var newName = 'upgrader' + Game.time;
        return this.spawnCreep(body, newName, {memory: {role: 'upgrader', body: energyCap}});
    };

    StructureSpawn.prototype.createMiner = function(energyCap) {

        var body = [WORK,WORK,CARRY,MOVE];
        if( energyCap >= 450 ){
            body = [WORK,WORK,WORK,CARRY,MOVE,MOVE];
        }
        if( energyCap >= 550 ){
            body = [WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE];
        }
        if( energyCap > 700 ){
            body = [WORK,WORK,WORK,WORK,WORK,CARRY,MOVE,MOVE,MOVE];
        }
        console.log("ecap" + energyCap + "spawning harv" + body);
        var newName = 'Miner' + Game.time;
        return this.spawnCreep(body, newName, {memory: {role: 'miner', body: energyCap}});
    };

    StructureSpawn.prototype.createHarvester = function(energyCap) {
        var energyAvailable = this.room.energyAvailable;

        if(energyAvailable < energyCap || energyAvailable < 300){
            //lets wait to make janitors
            return ERR_NOT_ENOUGH_ENERGY;
        }
        // always make [carry, carry, move]*X which costs 200 per x
        // don't make janitors bigger than size 10 for now
        var bodySize = Math.min(Math.floor((energyAvailable) / 300), 10);
        var body = [];
        for(let i=0; i<bodySize; i++){
            body.push(WORK);
            body.push(CARRY);
            body.push(CARRY);
            body.push(MOVE);
            body.push(MOVE);
        }
        var newName = 'Harvester' + Game.time;
        return this.spawnCreep(body, newName, {memory: {role: 'harvester', pickingUp: true, body: energyCap}});
    };

    StructureSpawn.prototype.createAttacker = function(energyCap) {
        var energyAvailable = this.room.energyAvailable;

        if(energyAvailable < energyCap){
            //lets wait to make attackers
            return ERR_NOT_ENOUGH_ENERGY;
        }
        // always make [attack, tough, move, move]*X which costs 190 per x
        // don't make attackers bigger than size 4 for now
        // and only use half available
        var bodySize = Math.min(Math.floor(energyAvailable / 2 / 190), 4);
        var body = [];
        for(let i=0; i<bodySize; i++){
            body.push(ATTACK);
            body.push(TOUGH);
            body.push(MOVE);
            body.push(MOVE);
        }
        var newName = 'attacker' + Game.time;
        return this.spawnCreep(body, newName, {memory: {role: 'attacker', body: energyCap, targetRoom: Memory.enemyRoom}});
    };


    StructureSpawn.prototype.createRemoteHarvester = function(energyCap) {
        var body = [WORK,WORK,WORK,WORK,
                    CARRY,CARRY,CARRY,CARRY,
                    MOVE,MOVE,MOVE,MOVE,
                    MOVE,MOVE,MOVE,MOVE];
        if( energyCap >= 1800){
          var body = [WORK,WORK,WORK,WORK,
                      CARRY,CARRY,CARRY,CARRY,
                      CARRY,CARRY,CARRY,CARRY,
                      CARRY,CARRY,CARRY,CARRY,
                      MOVE,MOVE,MOVE,MOVE,
                      MOVE,MOVE,MOVE,MOVE,
                      MOVE,MOVE,MOVE,MOVE,
                      MOVE,MOVE,MOVE,MOVE];
        }

        var newName = 'remoteharvester' + Game.time;
        var exits= Game.map.describeExits(this.room.name);
        if(exits){
            // only not true if simulation I think
            for(let roomDirection in Game.map.describeExits(this.room.name)){
              var targetRoom = Game.map.describeExits(this.room.name)[roomDirection.toString()]
              let count = 0
              for(let name in Game.creeps){
                if(Game.creeps[name].memory.targetRoom && Game.creeps[name].memory.targetRoom == targetRoom){
                  count++
                }
              }
              if(count < 2){
                console.log("WANT TO GO TO:" + targetRoom)
                return this.spawnCreep(body, newName, {memory: {role: 'remoteharvester',
                                                                home: this.room.name,
                                                                targetRoom: targetRoom, body: 10000}});
              }
            }
        }
    };



function needed_harvs(room){
    let sources = room.find(FIND_SOURCES);
    let count = 0;
    for(let s of sources){
        for(let p of s.pos.adjacent()){
            if(p.canBuild()){
                count+=1;
            }
        }
    }
    //return count
    return Math.floor(count/2);
}

function spawn_info(myspawn, availible_energy, energyCap){
    var infostr;
    if(myspawn.spawning) {
        var spawningCreep = Game.creeps[myspawn.spawning.name];
        infostr = '🛠️' + spawningCreep.memory.role;
    }
    else{
        infostr = "🔋" + availible_energy + "/" +energyCap;
    }
    myspawn.room.visual.text(
        infostr,
        myspawn.pos.x - 1,
        myspawn.pos.y,
        {align: 'right', opacity: 0.8});
}

function spawn_counts(myspawn, counts_str){
    myspawn.room.visual.text(
        counts_str,
        myspawn.pos.x,
        myspawn.pos.y+1.5,
        {align: 'center', opacity: 0.8});
}
