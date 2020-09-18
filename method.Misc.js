/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('method.Misc');
 * mod.thing == 'a thing'; // true
 */

var methodRoomSetup = {
    energyContainers: function(r) {
        var sources = r.find(FIND_SOURCES)
        var targets = r.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_SPAWN
            }
        })
        for(var s in sources){
            var path = r.findPath(sources[s].pos, targets[0].pos)
            console.log("Placing container at " + path[0].x + "," + path[0].y)
            r.createConstructionSite(path[0].x, path[0].y, STRUCTURE_CONTAINER)
        }
    }
}

module.exports = methodRoomSetup