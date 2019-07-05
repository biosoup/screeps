var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    nonTask: function (creep) {
        //heal
        if(creep.hits < creep.hitsMax) {
            creep.heal(creep)
        }
        
        if (creep.room.name == creep.memory.target) {
            //if in target room

            //find hostiles
            var hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
            if (!_.isEmpty(hostile)) {
                //get into range and kill
                if (creep.rangedAttack(hostile) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(hostile);
                }
                creep.say("Hostile!"+EM_SWORDS);
                return;
            } else {
                creep.say(EM_SINGING)
            }

        } else {
            //go to target room
            creep.task = Tasks.goToRoom(creep.memory.target)
        }

    }
}