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
            if (creep.fillStructures(creep, true)) {
                return;
            }

            //find important buidlsites
            var closestImportantConstructionSite = creep.pos.findClosestByRange(FIND_MY_CONSTRUCTION_SITES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER ||
                    s.structureType == STRUCTURE_EXTENSION
            });
            if (!_.isEmpty(closestImportantConstructionSite)) {
                creep.task = Tasks.build(closestImportantConstructionSite);
                creep.say(EM_BUILD + " " + EM_EXCLAMATION, true);
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
                    creep.say(EM_LIGHTNING, true);
                    return;
                } else {
                    creep.task = Tasks.upgrade(creep.room.controller);
                    creep.say(EM_SINGING, true);
                    return
                }
            }
        } else {
            if (creep.getEnergy(creep, true)) {
                return;
            }
        }
    }
};