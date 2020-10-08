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
