var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    newTask: function (creep) {
        // if in target room
        if (creep.room.name != creep.memory.target) {
            //go to target room
            creep.task = Tasks.goToRoom(creep.memory.target)
        } else if (creep.room.name == creep.memory.target) {

            if (creep.room.name == "W32N13") {
                // try to claim controller
                creep.task = Tasks.claim(creep.room.controller)
                //if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE && creep.claimController(creep.room.controller) != ERR_GCL_NOT_ENOUGH) {}

            } else {
                //reserve controller
                if (!_.isEmpty(creep.room.controller.sign)) {
                    if (creep.room.controller.sign.username != playerUsername) {
                        creep.task = Tasks.signController(creep.room.controller, "Not yet fully automated... :(")
                    }
                } else {
                    creep.task = Tasks.signController(creep.room.controller, "Not yet fully automated... :(")
                }
                creep.task = Tasks.reserve(creep.room.controller);
            }

        } else {
            creep.say("confused")
        }
    }
};