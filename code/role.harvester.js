var Tasks = require("tools.creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (creep.carry.energy > 0) {
            //do not let controleer to downgrade
            if (creep.room.controller.ticksToDowngrade < 5000) {
                creep.task = Tasks.upgrade(creep.room.controller)
                return;
            }

            //fill structures
            if (creep.fillStructures(creep)) {
                return;
            }

            //find important buidlsites
            var closestImportantConstructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER ||
                    s.structureType == STRUCTURE_EXTENSION
            });
            if (!_.isEmpty(closestImportantConstructionSite)) {
                creep.task = Tasks.build(closestImportantConstructionSite);
                creep.say(EM_BUILD + " " + EM_EXCLAMATION);
                return;
            }

            //dump into storage
            if (!_.isEmpty(creep.room.storage)) {
                creep.task = Tasks.transfer(creep.room.storage);
                return;
            } else {
                //nothing to do -> upgrade controller
                if (creep.room.controller.my) {
                    creep.task = Tasks.upgrade(creep.room.controller);
                    creep.say(EM_LIGHTNING);
                    return;
                } else {
                    creep.task = Tasks.upgrade(creep.room.controller);
                    creep.say(EM_SINGING);
                    return
                }
            }
        } else {
            var hostiles = creep.room.find(FIND_HOSTILE_CREEPS)
            if (hostiles.length == 0) {
                //look for dropped resources
                var droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
                if (!_.isEmpty(droppedEnergy)) {
                    creep.task = Tasks.pickup(droppedEnergy);
                    return;
                }
                var tombstones = _.filter(creep.room.find(FIND_TOMBSTONES), (t) => _.sum(t.store) > 0)
                if (!_.isEmpty(tombstones)) {
                    tombstone = creep.pos.findClosestByPath(tombstones)
                    if (!_.isEmpty(tombstone)) {
                        if (!_.isEmpty(creep.room.storage)) {
                            creep.task = Tasks.withdrawAll(tombstone);
                            return;
                        } else {
                            creep.task = Tasks.withdraw(tombstone, RESOURCE_ENERGY);
                            return;
                        }
                    }
                }
            }

            if (creep.getEnergy(creep, true)) {
                return;
            }
        }
    }
};