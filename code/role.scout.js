var Tasks = require("tools.creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        //scout nearby rooms

        // if target is defined and creep is not in target room
        if (!_.isEmpty(creep.memory.target) && creep.room.name != creep.memory.target) {
            creep.task = Tasks.goToRoom(creep.memory.target)
        } else if(!_.isEmpty(creep.memory.target) && creep.room.name == creep.memory.target) {
            //in target room, search for exits other than back
        } else {
            
        }
    }
}