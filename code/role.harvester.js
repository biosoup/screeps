var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (creep.carry.energy > 0) {
            //do not let controleer to downgrade
            if(creep.room.controller.ticksToDowngrade < 5000) {
                creep.task = Tasks.transfer(creep.room.storage);
                return;
            }

            //find important buidlsites
            var closestImportantConstructionSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER
            });
            if (!_.isEmpty(closestImportantConstructionSite)) {
                creep.task = Tasks.build(closestImportantConstructionSite);
                creep.say(EM_BUILD + " " + EM_EXCLAMATION);
                return;
            }
            //leave the rest for builders

            //fill structures
            if(creep.fillStructures(creep)) {
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
            if(creep.getEnergy(creep, true)) {
                return;
            }
        }
    }
};