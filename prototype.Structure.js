Object.defineProperty(Source.prototype, 'memory', {
	get: function() {
    if(Memory.structures[this.id] === undefined){
      Memory.structures[this.id] = {}
    }
    return Memory.sources[this.id]
	},
	enumerable: false,
	configurable: true
});

Object.defineProperty(Structure.prototype, 'netEnergy', {
	get: function() {
    if(!this.store){
      return 0
    }
    return this.store.getUsedCapacity(RESOURCE_ENERGY)
	},
	enumerable: false,
	configurable: true
});

Object.defineProperty(Structure.prototype, 'energyCapacity', {
	get: function() {
    if(!this.store){
      console.log("VILLL")
      return 0
    }
    return this.store.getFreeCapacity(RESOURCE_ENERGY)
	},
	enumerable: false,
	configurable: true
});

Structure.prototype.targeted = function() {
  let targetList = []
  _.forEach(Memory.creeps, (creep, id) => {
    if(creep.target == this.id){
      targetList.push(Game.creeps[id])
    }
  })
  return targetList
}
