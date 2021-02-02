import { ErrorMapper } from "utils/ErrorMapper";
import {find} from "lodash";

// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  console.log(`Current game tick is ${Game.time}`);

  maintainMemory()
  spawnCreeps()
  runCreeps()

});

function maintainMemory() {
  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }
}

function spawnCreeps(){
  for(const name in Game.spawns){
    const spawn = Game.spawns[name]
    const booterCount = findCreepsByRole("booter")
    if(spawn.room && spawn.room.controller && spawn.room.controller.level < 3 && spawn.spawning == null && booterCount.length < 5)  {
        spawn.spawnCreep([WORK, MOVE, CARRY], `booter${Game.time}`, {memory: { role: "booter", room: spawn.room.name, working: false }} )
    }
  }
}

const CreepTypes: CreepType[] = [
  { 
    Name: "booter",
    BodyParts: [WORK, CARRY, MOVE],
    Run: booterRun,
  },
]

function booterRun(me: Creep){
  const sources = me.room.find(FIND_SOURCES) 
  sources.sort(function(a,b):number{return me.pos.findPathTo(a.pos.x, a.pos.y).length - me.pos.findPathTo(b.pos.x, b.pos.y).length})
  let source: Source
  if(sources.length > 0){
    source = sources[0]
  } else {
    me.say("ERROR:NO SOURCES")
    return
  }

  if(me.store.getUsedCapacity(RESOURCE_ENERGY) == 0 || (me.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && me.pos.findPathTo(source.pos.x, source.pos.y).length < 5)){
    if(me.harvest(source) == ERR_NOT_IN_RANGE){
      me.moveTo(source.pos.x, source.pos.y)
    }
    return
  }

  const spawns = me.room.find(FIND_MY_SPAWNS)
  if(spawns.length > 0 && spawns[0].store.getFreeCapacity(RESOURCE_ENERGY) > 0){
    if(me.transfer(spawns[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE){
      me.moveTo(spawns[0].pos.x, spawns[0].pos.y)
    }
    return
  }

  const controller = me.room.controller
  if(controller){
    if(me.upgradeController(controller) == ERR_NOT_IN_RANGE){
      me.moveTo(controller.pos.x, controller.pos.y)
    }
  }
}

function runCreeps(){
  for(const creepType of CreepTypes){
    for(const creep of findCreepsByRole(creepType.Name)){
      creepType.Run(creep)
    }
  }
}


interface CreepType {
  Name: string
  BodyParts: BodyPartConstant[]
  Run: Function
}

function findCreepsByRole(role: string): Creep[] {
  let creeps: Creep[] = []
  for(const name in Memory.creeps){
    const creep = Game.creeps[name]
    if(creep.memory.role == role){
      creeps.push(Game.creeps[name])
    }
  }
  return creeps
}
