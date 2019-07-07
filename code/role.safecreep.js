var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (creep.carry[RESOURCE_GHODIUM] >= 1000 && creep.room.controller.safeModeAvailable <= 3) {
            //go generate safemodes
        } else if (creep.room.controller.safeModeAvailable > 3) {
            //enough safemodes
        } else {
            //get ghodium
        }
    }
}