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

Object.defineProperty(Structure.prototype, 'stored', {
	get: function() {
    if(!this.store){
      return 100
    }
    let used = 0
    for(let resource of RESOURCES_ALL){
      used += this.store.getUsedCapacity(resource)
    }
    return used
	},
	enumerable: false,
	configurable: true
});

Object.defineProperty(Structure.prototype, 'capacity', {
	get: function() {
    if(!this.store){
      return 0
    }
    return this.store.getCapacity(RESOURCE_ENERGY)
	},
	enumerable: false,
	configurable: true
});

Object.defineProperty(Structure.prototype, 'usage', {
	get: function() {
    if(!this.store){
      return 100
    }
    let struct = this
    let withdrawl = 0
    let deposit   = 0
    let net = struct.stored
    let capacity = struct.capacity
    _.forEach(Memory.taskQueue, function(t){
      if(t.dest == struct.id){
        let target = genRoom.getObject(t.target)
        if(t.type == "deposit"){
          deposit += target.stored
        }
        if(t.type == "withdrawl"){
          withdrawl -= target.capacity
        }
      }
    })
    net = net + deposit - withdrawl
    return (net/capacity) * 100
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
