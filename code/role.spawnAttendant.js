var Tasks = require("tools.creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (creep.carry.energy > 50) {
            //do the actual job
            if(creep.fillStructures(creep)) {
                return;
            }
        } else {
            if(creep.getEnergy(creep, false)) {
                return;
            }
        }
    }
};