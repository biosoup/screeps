var Tasks = require("tools.creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (_.sum(creep.carry) > creep.carry[RESOURCE_ENERGY] && !_.isEmpty(creep.room.storage)) {
            //creep has something other than energy
            creep.task = Tasks.transferAll(creep.room.storage);
            creep.say("other!", true)
            return;
        } else if (creep.carry.energy > 50) {
            /*
                NEW TODO:
                - lofic for lookFor around the creep
                - refill and move on the same tick
            */

            //do the actual job
            if (creep.fillStructures(creep)) {
                return;
            }
        } else {
            if (creep.getEnergy(creep, false)) {
                return;
            }
        }
    }
};