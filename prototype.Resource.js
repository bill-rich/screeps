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

Object.defineProperty(Resource.prototype, 'stored', {
	get: function() {
    return this.amount
	},
	enumerable: false,
	configurable: true
});

Object.defineProperty(Resource.prototype, 'capacity', {
	get: function() {
    return this.amount
  },
	enumerable: false,
	configurable: true
});

Object.defineProperty(Resource.prototype, 'usage', {
	get: function() {
    let resource = this
    let withdrawl = 0
    let deposit   = 0
    let net = resource.stored
    let capacity = resource.capacity
    _.forEach(Memory.taskQueue, function(t){
      if(t.dest == resource.id){
        let target = genRoom.getObject(t.target)
        if(t.type == "deposit"){
          deposit += target.stored
        }
        if(t.type == "pickup"){
          withdrawl += target.capacity
        }
      }
    })
    net = net + deposit - withdrawl
    return (net/capacity) * 100
	},
	enumerable: false,
	configurable: true
});
