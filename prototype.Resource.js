//Resource.prototype.test = function() {
//};

Object.defineProperty(Resource.prototype, 'memory', {
	get: function() {
    if(Memory.resources[this.id] === undefined){
      Memory.resources[this.id] = {}
    }
    return Memory.resources[this.id]
	},
	enumerable: false,
	configurable: true
});

Object.defineProperty(Resource.prototype, 'netEnergy', {
	get: function() {
    if(this.resourceType == RESOURCE_ENERGY){
      let net = this.amount
      let targeters = this.targeted()
      let neg = _.reduce(targeters, function(sum, targeter){
        sum += targeter.store.getFreeCapacity()
        return sum
      }, 0)
      return net - neg
    } else {
      return 0
    }
	},
	enumerable: false,
	configurable: true
});
