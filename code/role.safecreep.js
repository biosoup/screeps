var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (creep.carry[RESOURCE_GHODIUM] >= 1000 && creep.room.controller.safeModeAvailable <= 3) {
            //go generate safemodes
            if(creep.generateSafeMode(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.travelTo(creep.room.controller);
            }
        } else if (creep.room.controller.safeModeAvailable > 3) {
            //enough safemodes

            //deposit ghodium into storage
            if (_.sum(creep.carry) > 0) {
                if (!_.isEmpty(creep.room.storage)) {
                    creep.task = Tasks.transferAll(creep.room.storage)
                    return
                }
            }

            //suicide
            if (_.sum(creep.carry) == 0) {
                creep.suicide()
            }
        } else {
            //get ghodium from storage
            if (!_.isEmpty(creep.room.storage)) {
                if (creep.room.storage.store[RESOURCE_GHODIUM] >= 1000) {
                    creep.task = Tasks.withdraw(creep.room.storage, RESOURCE_GHODIUM, 1000)
                    return
                } else {
                    creep.say("not enough G")
                }
            } else {
                creep.say("no storage")
            }
        }
    }
}