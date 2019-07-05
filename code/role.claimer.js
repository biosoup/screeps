var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    newTask: function (creep) {
        
        if (creep.room.name != creep.memory.target) {
            //go to target room
            creep.task = Tasks.goToRoom(creep.memory.target)
            creep.say(EM_TRUCK);
            return;

        } else if (creep.room.name == creep.memory.target) {
            // if in target room
            
            //check for grey flags to claim the room
            var greyFlag = creep.room.find(FIND_FLAGS, (f) => f.color == COLOR_GREY && f.room == creep.memory.target)
            console.log(JSON.stringify(greyFlag))
            if (greyFlag.length > 0) {
                // try to claim controller
                //creep.task = Tasks.claim(creep.room.controller)
                creep.say(EM_FLAG+""+M_FLAG+""+EM_FLAG)
                return;

            } else {
                //reserve controller
                console.log(1)
                if (!_.isEmpty(creep.room.controller.sign)) {
                    if (creep.room.controller.sign.username != playerUsername) {
                        creep.task = Tasks.signController(creep.room.controller, roomSign)
                    }
                } else {
                    creep.task = Tasks.signController(creep.room.controller, roomSign)
                }
                creep.task = Tasks.reserve(creep.room.controller);
                creep.say(EM_FLAG)
                return;
                
            }
        } else {
            creep.say("confused")
        }
    }
};