module.exports = class {
  constructor(tower){
    this.tower = tower
  }

  run(){
		var closestHostile = this.tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
		if(closestHostile) {
				this.tower.attack(closestHostile);
		}
		var structs = this.tower.room.find(FIND_STRUCTURES, {
				filter: (structure) => structure.hits < structure.hitsMax
		})
		var closestDamagedStructure = this.tower.pos.findClosestByRange(FIND_STRUCTURES, {
				filter: (structure) => structure.hits < structure.hitsMax
		});
		for(i=0; i<structs.length; i++){
				if((structs[i].structureType != STRUCTURE_WALL && structs[i].structureType != STRUCTURE_RAMPART) || 
						structs[i].structureType == STRUCTURE_WALL && structs[i].hits < 1000 || 
						structs[i].structureType == STRUCTURE_RAMPART && structs[i].hits < 1000){
						this.tower.repair(structs[i]);
						break
				}
		}
  }
}

