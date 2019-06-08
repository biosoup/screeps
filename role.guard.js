var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    newTask: function (creep) {
        if (creep.room.name == creep.memory.target) {
            // find source
            var hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                filter: function (object) {
                    return object.owner != "Source Keeper";
                }
            });

            if (hostile) {
                creep.say("Hostile!");
                creep.task = Tasks.attack(hostile)
            }

            var structure = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                filter: function (object) {
                    return object.structureType != STRUCTURE_CONTROLLER &&
                        object.structureType != STRUCTURE_KEEPER_LAIR &&
                        object.structureType != STRUCTURE_WALL;
                }
            });

            if (structure == null) {
                structure = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                    filter: s => s.structureType == STRUCTURE_WALL ||
                        s.structureType == STRUCTURE_RAMPART
                })[0];
            }

            if (structure == null) {
                structure = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, {
                    filter: function (object) {
                        return object.structureType == STRUCTURE_CONTROLLER;
                    }
                });
            }

            if (!hostile && structure) {
                creep.task = Tasks.attack(structure)
            }

            if (Game.flags.GUARD_MOVE) {
                creep.cancelOrder("move"); /* cancel ALL move orders */
                creep.task = Tasks.goTo(Game.flags.GUARD_MOVE)
                if (hostile) {
                    creep.task = Tasks.attack(hostile)
                    creep.task = Tasks.attack(structure)

                    //add a healing between guards
                }
            }

            if(creep.hit < creep.hitsMax) {
                creep.task = Tasks.heal(creep)
            }

        } else {
            //go to target room
            creep.task = Tasks.goToRoom(creep.memory.target)
        }
    }
}