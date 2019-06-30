var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for creep role
    /** @param {Creep} creep */
    newTask: function (creep) {
        // check for home room
        if (creep.room.name != creep.memory.home) {
            //return to home room
            creep.task = Tasks.goToRoom(creep.memory.home)
        } else {
            if (creep.carry.energy > 0) {
                //find structures that need repairing
                var ramparts = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_RAMPART && s.hits < WALLMAX
                });
                ramparts = _.sortBy(ramparts, "hits");

                var walls = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) => s.structureType == STRUCTURE_WALL && s.hits < WALLMAX
                });
                walls = _.sortBy(walls, "hits");

                if (walls.length > 0 && ((ramparts[0] != undefined && walls[0].hits < ramparts[0].hits) || (ramparts.length == 0))) {
                    target = walls[0];
                } else if (ramparts.length > 0) {
                    target = ramparts[0];
                }

                // if we find a wall that has to be repaired
                if (!_.isEmpty(target)) {
                    creep.task = Tasks.repair(target)
                } else {
                    creep.say("bored")
                }
            } else {
                var container;
                //look for storage
                if (!_.isEmpty(creep.room.storage)) {
                    if (creep.room.storage.store[RESOURCE_ENERGY] > 100) {
                        container = creep.room.storage;
                    } else {
                        //if storage is empty find container
                        container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: s => s.structureType == STRUCTURE_CONTAINER &&
                                s.store[RESOURCE_ENERGY] > 100
                        });
                    }
                } else {
                    container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER &&
                            s.store[RESOURCE_ENERGY] > 100
                    });
                }

                //add a withraw task
                if (!_.isEmpty(container)) {
                    creep.task = Tasks.withdraw(container);
                } else {
                    let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                    if (source != undefined && source != null) {
                        creep.task = Tasks.harvest(source);
                    }
                    creep.say("no energy source")
                }
            }
        }
    }
}