var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (creep.carry.energy > 0) {
            if(creep.fillStructures(creep)) {
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