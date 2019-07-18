var Tasks = require("tools.creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (creep.memory.home != undefined && creep.room.name == creep.memory.home) {
            //creep is home
            if (creep.carry.energy > 0) {
                //dump into storage
                if (!_.isEmpty(creep.room.storage)) {
                    creep.say(EM_PACKAGE)
                    creep.task = Tasks.transferAll(creep.room.storage);
                    return;
                } else {
                    //no place for stuff, find nearest container
                    var container = creep.pos.findClosestByRange(creep.room.containers)
                    creep.task = Tasks.transferAll(container)
                    return
                }
            } else {
                //go to target room
                creep.task = Tasks.goToRoom(creep.memory.target)
            }
        } else if (!_.isEmpty(creep.memory.target) && creep.room.name == creep.memory.target) {
            //creep is in taget room

            //check for hostiles
            let hostileValues = creep.room.checkForHostiles(creep.room)
            if (!_.isEmpty(hostileValues)) {
                if (hostileValues.numHostiles > 0) {
                    creep.room.createFlag(25, 25, "DEFEND-" + creep.room.name + "-" + creep.memory.home, COLOR_WHITE, COLOR_RED)
                    creep.say(EM_KILL)
                    creep.task = Tasks.goToRoom(creep.memory.home);
                    return
                }
            } else {
                if (_.sum(creep.carry) < creep.carryCapacity) {
                    //look for dropped resources
                    var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                        filter: s => s.targetedBy.length == 0
                    })
                    if (!_.isEmpty(droppedEnergy)) {
                        creep.say(EM_PIN)
                        droppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
                        creep.task = Tasks.pickup(droppedEnergy);
                        return;
                    }
                    var tombstones = _.filter(creep.room.find(FIND_TOMBSTONES), (t) => _.sum(t.store) > 0 && t.targetedBy.length == 0)
                    if (!_.isEmpty(tombstones)) {
                        tombstone = creep.pos.findClosestByRange(tombstones)
                        if (!_.isEmpty(tombstone)) {
                            creep.say(EM_KILL)
                            creep.task = Tasks.withdrawAll(tombstone);
                            return;
                        }
                    }

                    //find structures to withdraw energy from
                    var storages = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: f => (f.structureType == STRUCTURE_STORAGE || f.structureType == STRUCTURE_CONTAINER) && _.sum(f.store) > 0
                    })
                    if (!_.isEmpty(storages)) {
                        creep.say(EM_PACKAGE)
                        creep.task = Tasks.withdrawAll(storages)
                        return
                    }

                    var structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: f => f.energy > 0
                    })
                    if (!_.isEmpty(structure)) {
                        creep.say(EM_PACKAGE)
                        creep.task = Tasks.withdrawAll(structure)
                        return
                    }

                    //find nearest structure, or wall and demolish until full
                    var demo = creep.pos.findClosestByRange(FIND_STRUCTURES, {
                        filter: f => f.structureType != STRUCTURE_CONTROLLER || f.structureType != STRUCTURE_ROAD || f.structureType != STRUCTURE_KEEPER_LAIR
                    })
                    if (!_.isEmpty(demo)) {
                        creep.say(EM_BOMB)
                        creep.task = Tasks.dismantle(demo)
                        return
                    }
                } else {
                    //creep is full
                    creep.say(EM_TRUCK)
                    creep.task = Tasks.goToRoom(creep.memory.home);
                    return
                }
            }
        } else {
            creep.say("confused")
        }
    }
}