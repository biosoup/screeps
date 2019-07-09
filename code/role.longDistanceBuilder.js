var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {

        // if target is defined and creep is not in target room
        if (!_.isEmpty(creep.memory.target) && creep.room.name != creep.memory.target) {
            creep.task = Tasks.goToRoom(creep.memory.target)
        } else {
            if (creep.carry.energy > 0) {
                //has energy -> do work

                //do not let controleer to downgrade
                if (creep.room.controller.ticksToDowngrade < 5000) {
                    creep.task = Tasks.transfer(creep.room.storage);
                    return;
                }

                //find important buidlsites
                var closestImportantConstructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
                    filter: (s) =>
                        s.structureType == STRUCTURE_SPAWN
                });
                if (!_.isEmpty(closestImportantConstructionSite)) {
                    creep.task = Tasks.build(closestImportantConstructionSite);
                    creep.say(EM_BUILD + " " + EM_EXCLAMATION);
                    return;
                }

                var closestImportantConstructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER ||
                        s.structureType == STRUCTURE_EXTENSION ||
                        s.structureType == STRUCTURE_TOWER
                });
                if (!_.isEmpty(closestImportantConstructionSite)) {
                    creep.task = Tasks.build(closestImportantConstructionSite);
                    creep.say(EM_BUILD + " " + EM_EXCLAMATION);
                    return;
                }

                //find buildsites
                var closestConstructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
                if (!_.isEmpty(closestConstructionSite)) {
                    creep.task = Tasks.build(closestConstructionSite);
                    creep.say(EM_BUILD);
                    return;
                }

                //find repairs
                var closestRepairSite = creep.room.find(FIND_STRUCTURES, {
                    filter: (s) =>
                        s.structureType != STRUCTURE_CONTROLLER && s.hits < s.hitsMax
                });
                var closestRepairSite = _.first(_.sortBy(closestRepairSite, "hits"))
                if (!_.isEmpty(closestRepairSite)) {
                    //sort them by hits
                    creep.task = Tasks.repair(closestRepairSite);
                    creep.say(EM_WRENCH);
                    return;
                }

                //nothing to do -> upgrade controller
                if (creep.room.controller.my) {
                    creep.task = Tasks.upgrade(creep.room.controller);
                    creep.say(EM_LIGHTNING);
                    return;
                } else {
                    creep.say(EM_SINGING);
                    return
                }

            } else {
                if (creep.getEnergy(creep, true)) {
                    return;
                }
            }
        }
    }
};