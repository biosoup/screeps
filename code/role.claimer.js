var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    newTask: function (creep) {
        // if in target room
        if (creep.room.name != creep.memory.target) {
            //go to target room
            creep.task = Tasks.goToRoom(creep.memory.target)
        } else if (creep.room.name == creep.memory.target) {
            var greyFlag = creep.room.find(FIND_FLAGS, (f) => f.color == COLOR_GREY && f.room == creep.memory.target)
            if (_.sum(greyFlag)>0) {
                // try to claim controller
                creep.task = Tasks.claim(creep.room.controller)
                creep.say("claim")
            } else {
                //reserve controller
                if (!_.isEmpty(creep.room.controller.sign)) {
                    if (creep.room.controller.sign.username != playerUsername) {
                        creep.task = Tasks.signController(creep.room.controller, roomSign)
                    }
                } else {
                    creep.task = Tasks.signController(creep.room.controller, roomSign)
                }
                creep.task = Tasks.reserve(creep.room.controller);
                creep.say("reserving")
            }

        } else {
            creep.say("confused")
        }
    }
};