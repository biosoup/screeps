var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for creep role
    /** @param {Creep} creep */
    newTask: function (creep) {

        if (creep.carry.energy > 0) {
            //find structures that need repairing
            var ramparts = creep.room.ramparts.filter(s => s.hits < WALLMAX);
            var walls = creep.room.walls.filter(s => s.hits < WALLMAX);
            var targets = {
                ...ramparts,
                ...walls
            }
            //sort by hits
            ramparts = _.sortBy(targets, "hits");

            // if we find a wall that has to be repaired
            if (!_.isEmpty(ramparts)) {
                target = ramparts[0];
                creep.task = Tasks.repair(target)
                creep.say(EM_WRENCH)
                return
            } else {
                //nothing to do -> upgrade controller
                if (creep.room.controller.my) {
                    creep.task = Tasks.upgrade(creep.room.controller);
                    creep.say(EM_LIGHTNING);
                    return;
                } else {
                    creep.say(EM_SINGING);
                    return
                }
            }
        } else {
            //get energy
            if(creep.getEnergy(creep, true)) {
                return;
            }
        }
    }
}