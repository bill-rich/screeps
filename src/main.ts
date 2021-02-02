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
  me.say("sucker")
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
