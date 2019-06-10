var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    newTask: function (creep) {
        // if in target room
        if (creep.room.name != creep.memory.target) {
            //go to target room
            creep.task = Tasks.goToRoom(creep.memory.target)
        } else if (creep.room.name == creep.memory.target) {
            // try to claim controller
            //creep.task = Tasks.claim(creep.room.controller)
            //if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE && creep.claimController(creep.room.controller) != ERR_GCL_NOT_ENOUGH) {}

            //reserve controller
            if(creep.room.controller.owner != creep.owner && creep.room.controller.owner != undefined) {
                if (creep.attackController(creep.room.controller) != -11 || creep.attackController(creep.room.controller) != ERR_NOT_IN_RANGE ) {
                    creep.attackController(creep.room.controller)
                    creep.say("attacking controller")
                } else {
                    creep.travelTo(creep.room.controller, {
                        visualizePathStyle: {
                            stroke: '#ffffff'
                        }
                    });
                }
            } else {
                creep.task = Tasks.reserve(creep.room.controller);
            }

        } else {
            creep.say("confused")
        }
    }
};