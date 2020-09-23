module.exports = class {
  constructor(creep){
    this.creep = creep
  }
    run() {
        if(this.creep.room.name != this.creep.memory.targetRoom){
            if(this.creep.store[RESOURCE_ENERGY] > 0){
                // console.log("dropping off");
                var droppoint = Game.getObjectById('79f9994e9df890c');
                if (droppoint) {
                    var energyToTransfer = this.creep.store[RESOURCE_ENERGY];
                    var transfered = this.creep.transfer(droppoint, RESOURCE_ENERGY);
                    if (transfered == ERR_NOT_IN_RANGE) {
                        this.creep.moveTo(droppoint, {visualizePathStyle: styles.store,
                                                 reusePath: 50,
                        });
                    }
                    if(transfered == OK){
                        if(Memory.remoteScore == null){
                            Memory.remoteScore = {};
                        }
                        if(!Memory.remoteScore[this.creep.name]){
                            Memory.remoteScore[this.creep.name] = 0;
                        }
                        Memory.remoteScore[this.creep.name] += energyToTransfer;
                    }
                }
            }
            // we are empty go lookin
            else{
                // console.log("goin remote");
                const exitDir = Game.map.findExit(this.creep.room, this.creep.memory.targetRoom);
                const exit = this.creep.pos.findClosestByRange(exitDir);
                this.creep.moveTo(exit, {visualizePathStyle: styles.prio,
                                    reusePath: 10});
            }

        }
        //other wise we are in the room
        else{
            // console.log("in da room " + this.creep.memory.targetRoom);
            if(this.creep.store.getFreeCapacity(RESOURCE_ENERGY) > 0){
                var source = this.creep.pos.findClosestByRange(FIND_SOURCES);
                if (this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(source, {visualizePathStyle: styles.prio,
                                          reusePath: 50,
                    });
                }
            }
            // we are full go home
            else{
                // console.log("got da goods");
                const exitDir = Game.map.findExit(this.creep.room, this.creep.memory.home);
                const exit = this.creep.pos.findClosestByRange(exitDir);
                this.creep.moveTo(exit, {visualizePathStyle: styles.store,
                                    reusePath: 50,
                });
            }
        }
    }
};
