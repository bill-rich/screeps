let cardinal_dirs = [[1,0],[-1,0],[0,1],[0,-1]];
let diagonal_dirs = [[1,1],[1,-1],[-1,1],[-1,-1]];

RoomPosition.prototype.diagonals = function() {
        let positions = [];
        for(let d of diagonal_dirs){
            positions.push(new RoomPosition(this.x+d[0], this.y+d[1], this.roomName));
        }
        return positions;

};

RoomPosition.prototype.cardinals = function() {
        let positions = [];
        for(let d of cardinal_dirs){
            positions.push(new RoomPosition(this.x+d[0], this.y+d[1], this.roomName));
        }
        return positions;

};

RoomPosition.prototype.adjacent = function() {
        return this.diagonals().concat(this.cardinals());
};

RoomPosition.prototype.canBuild = function() {
        let isWall = this.lookFor(LOOK_TERRAIN)[0] == 'wall';
        let hasBlockingStruct = this.lookFor(LOOK_STRUCTURES).filter(s => OBSTACLE_OBJECT_TYPES.includes(s.structureType)).length > 0;
        return !(isWall || hasBlockingStruct);
};
