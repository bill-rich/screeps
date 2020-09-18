var methodEnergy = {

    nearest: function(creep) {
        var sources = creep.room.find(FIND_SOURCES);
        var sorted = _.sortBy(sources, s => creep.pos.getRangeTo(s))
        return sorted[0]
    },
    
    dearest: function(creep) {
        var sources = creep.room.find(FIND_SOURCES);
        return sources[0]
    },
    
    ruins: function(creep) {
      var ruins = creep.room.find(FIND_STRUCTURES)
      return ruins[1]
    }
}

module.exports = methodEnergy;
