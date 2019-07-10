//require plans for body and arms
require("./module.colony.base.buildings")


module.exports = {
    run: function (roomName) {
        //find all positions for body, that are big anough

        //find for that body, if six arms can be placed

        //prepare the body to be placed

        //write into memory RCL based body structure
    },

    findPlaceForBody: function (roomName) {
        //get whole room

        //find a place of appropriate size

    },

    findPlaceForArm: function (roomName, bodyCenter) {
        //check for existing arm count

    },

    getX: function (pos) {
        return pos.x;
    },

    getY: function (pos) {
        return pos.y;
    },

    getRoomName: function (pos) {
        return pos.roomName;
    },

    placeBody: function (roomName, bodyCenter) {
        //if no bodyCenter is sent or if a spawn already exists
        var roomSpawns = Game.rooms[roomName].find(FIND_MY_SPAWNS)
        if (_.isEmpty(bodyCenter) || _.sum(roomSpawns) > 0) {
            bodyCenter = roomSpawns[0].pos;
        }

        if (!_.isEmpty(bodyCenter)) {
            //get a corner from the bodycenter / Spawn1 position
            //offset is HARDCODED!
            var corner = new RoomPosition(this.getX(bodyCenter) - 3, this.getY(bodyCenter) - 6, this.getRoomName(bodyCenter));
            //calculate body
            var buildings = body.buildings;
            var bodySkeleton = {}
            //go through different buildings
            for (var item in buildings) {
                //now on level of eg. roads > go deeper!
                bodySkeleton[item] = {}
                //actual position are object in an array
                var i = 0;
                _.forEach(item[0], function (x, y) {
                    //add an actual room position to skeleton
                    bodySkeleton[item].i = new RoomPosition(this.getX(corner) + x, this.getY(corner) + y, this.getRoomName(corner));
                    i++;
                });
                //should have all body items done
                return bodySkeleton;
            }
        } else {
            return -1;
        }
    },

    placeArmExtensions: function (roomName, bodyConnection, armType) {
        if (!_.isEmpty(bodyConnection) && !_.isEmpty(armType)) {
            //calculate body
            var buildings;
            switch (armType) {
                case "armExtensionsTopLeft":
                    buildings = armExtensionsTopLeft;
                    break;
                case "armExtensionsTopRight":
                    buildings = armExtensionsTopRight;
                    break;
                case "armLabsTopLeft":
                    buildings = armLabsTopLeft;
                    break;
                case "armLabsTopRight":
                    buildings = armLabsTopRight;
                    break;
            }

            var armSkeleton = {}
            //go through different buildings
            for (var item in buildings) {
                //now on level of eg. roads > go deeper!
                armSkeleton[item] = {}
                //actual position are object in an array
                var i = 0;
                _.forEach(item[0], function (x, y) {
                    //add an actual room position to skeleton
                    armSkeleton[item].i = new RoomPosition(this.getX(bodyConnection) + x, this.getY(bodyConnection) + y, this.getRoomName(bodyConnection));
                    i++;
                });
                //should have all body items done
                return armSkeleton;
            }
        } else {
            return -1;
        }
    },

    placeContainers: function (roomName) {

    },

    placeLinks: function (roomName) {

    },

    placeRoads: function (roomName, startPosition, endPosition) {

    },

    placeArmLabs: function (roomName, bodyCenter) {

    },

    getBodyRealPositions: function (roomName, bodyCenter) {

    },

    getArmRealPositions: function (roomName, bodyCenter, topSideConnection) {

    },

    getBaseFromMemory: function (roomName) {

    },

    setBaseToMemory: function (roomName, bodyCenter, arm1connection, arm2connection, arm3connection, ) {

    },

    showBuildPlan = function (roomName) {
        const debugSymbols = {
            container: '⊔',
            exit: '🚪',
            extension: '⚬',
            lab: '🔬',
            link: '🔗',
            nuker: '☢',
            observer: '👁',
            powerSpawn: '⚡',
            rampart: '#',
            road: '·',
            spawn: '⭕',
            storage: '⬓',
            terminal: '⛋',
            tower: '⚔',
        };
        const visual = new RoomVisual(this.roomName);

        //get room layout from memory
        if (!_.isEmpty(Game.room[roomName].memory.baseSkeleton)) {
            var roomSkeleton = Game.room[roomName].memory.baseSkeleton;
        } else {
            console.log("ERR: room skeleton missing")
            return -1;
        }

        // *** REDO ***

        // tower
        visual.text(debugSymbols['tower'], spawn.pos.x - 1, spawn.pos.y - 3);
        // storage
        visual.text(debugSymbols['storage'], spawn.pos.x, spawn.pos.y - 2);
        // link
        visual.text(debugSymbols['link'], spawn.pos.x, spawn.pos.y - 4);
        // spawns
        visual.text(debugSymbols['spawn'], spawn.pos.x + 1, spawn.pos.y - 1);
        visual.text(debugSymbols['spawn'], spawn.pos.x - 1, spawn.pos.y - 1);
        // terminal
        visual.text(debugSymbols['terminal'], spawn.pos.x + 1, spawn.pos.y - 3);
        // other towers
        visual.text(debugSymbols['tower'], spawn.pos.x - 2, spawn.pos.y - 2);
        visual.text(debugSymbols['tower'], spawn.pos.x - 2, spawn.pos.y - 4);
        visual.text(debugSymbols['tower'], spawn.pos.x - 1, spawn.pos.y - 6);
        visual.text(debugSymbols['tower'], spawn.pos.x - 2, spawn.pos.y - 5);
        // labs
        visual.text(debugSymbols['lab'], spawn.pos.x, spawn.pos.y + 2);
        visual.text(debugSymbols['lab'], spawn.pos.x - 1, spawn.pos.y + 2);
        visual.text(debugSymbols['lab'], spawn.pos.x - 1, spawn.pos.y + 3);
        visual.text(debugSymbols['lab'], spawn.pos.x + 1, spawn.pos.y + 3);
        visual.text(debugSymbols['lab'], spawn.pos.x + 1, spawn.pos.y + 4);
        visual.text(debugSymbols['lab'], spawn.pos.x, spawn.pos.y + 4);
        visual.text(debugSymbols['lab'], spawn.pos.x - 2, spawn.pos.y + 3);
        visual.text(debugSymbols['lab'], spawn.pos.x - 2, spawn.pos.y + 4);
        visual.text(debugSymbols['lab'], spawn.pos.x, spawn.pos.y + 5);
        visual.text(debugSymbols['lab'], spawn.pos.x - 1, spawn.pos.y + 5);
        // nuker
        visual.text(debugSymbols['nuker'], spawn.pos.x - 1, spawn.pos.y - 5);
        // power spawn
        visual.text(debugSymbols['powerSpawn'], spawn.pos.x + 1, spawn.pos.y - 5);
        // observer
        visual.text(debugSymbols['observer'], spawn.pos.x, spawn.pos.y - 6);
        // initial spawn roads
        new RoomVisual(this.room).circle(spawn.pos.x, spawn.pos.y - 1, {
            fill: 'grey',
            stroke: 'grey',
            radius: 0.15
        });
        new RoomVisual(this.room).circle(spawn.pos.x, spawn.pos.y - 3, {
            fill: 'grey',
            stroke: 'grey',
            radius: 0.15
        });
        new RoomVisual(this.room).circle(spawn.pos.x - 1, spawn.pos.y - 2, {
            fill: 'grey',
            stroke: 'grey',
            radius: 0.15
        });
        new RoomVisual(this.room).circle(spawn.pos.x + 1, spawn.pos.y - 2, {
            fill: 'grey',
            stroke: 'grey',
            radius: 0.15
        });
        new RoomVisual(this.room).circle(spawn.pos.x + 1, spawn.pos.y, {
            fill: 'grey',
            stroke: 'grey',
            radius: 0.15
        });
        new RoomVisual(this.room).circle(spawn.pos.x - 1, spawn.pos.y, {
            fill: 'grey',
            stroke: 'grey',
            radius: 0.15
        });
        new RoomVisual(this.room).circle(spawn.pos.x, spawn.pos.y + 1, {
            fill: 'grey',
            stroke: 'grey',
            radius: 0.15
        });
        new RoomVisual(this.room).circle(spawn.pos.x - 1, spawn.pos.y + 2, {
            fill: 'grey',
            stroke: 'grey',
            radius: 0.15
        });
        new RoomVisual(this.room).circle(spawn.pos.x + 1, spawn.pos.y + 2, {
            fill: 'grey',
            stroke: 'grey',
            radius: 0.15
        });
    }

};