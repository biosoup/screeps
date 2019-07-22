var Tasks = require("tools.creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        //scout nearby rooms

        // if target is defined and creep is not in target room
        if (!_.isEmpty(creep.memory.target) && creep.room.name != creep.memory.target) {
            creep.task = Tasks.goToRoom(creep.memory.target)
        } else if (!_.isEmpty(creep.memory.target) && creep.room.name == creep.memory.target) {
            //in target room, search for exits other than back

            //refresh room data
            creep.room.refreshData(creep.room.name)
            
            if (!_.isEmpty(creep.room.memory.roomArray)) {
                //get exits from roomArray
                var exits = creep.room.memory.roomArray.exits
            }
            for (const exit in exits) {
                const nextRoomName = exits[exit];
                if (!(nextRoomName in creep.memory.roomArray)) {
                    //select unscouted next target
                    creep.memory.target = nextRoomName;
                    break;
                }
            }

            if (creep.room.name != creep.room.target) {
                //go to next target
                creep.task = Tasks.goToRoom(creep.room.target)
                return
            } else {
                //no room around need scouting, choose at random

            }

        } else {
            //
        }
    }
}