//Resource.prototype.test = function() {
//};
Source.prototype.targeted = function() {
  let targetList = []
  _.forEach(Memory.creeps, (creep, id) => {
    if(creep.target == this.id){
      targetList.push(Game.creeps[id])
    }
  })
  return targetList
}

Object.defineProperty(Source.prototype, 'memory', {
	get: function() {
    if(Memory.sources[this.id] === undefined){
      Memory.sources[this.id] = {}
    }
    return Memory.sources[this.id]
	},
	enumerable: false,
	configurable: true
});

Object.defineProperty(Source.prototype, 'stored', {
	get: function() {
    return this.energy
	},
	enumerable: false,
	configurable: true
});

Object.defineProperty(Source.prototype, 'capacity', {
	get: function() {
    return this.energyCapacity
  },
	enumerable: false,
	configurable: true
});

Object.defineProperty(Source.prototype, 'usage', {
	get: function() {
    let source = this
    let withdrawl = 0
    let deposit   = 0
    let net = source.stored
    let capacity = source.capacity
    _.forEach(Memory.taskQueue, function(t){
      if(t.dest == source.id){
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
