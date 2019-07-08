var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    nonTask: function (creep) {
        //heal
        if (creep.hits < creep.hitsMax) {
            creep.heal(creep)
        }

        if (creep.room.name == creep.memory.target) {
            //if in target room

            //FIXME: attack healers first
            //find hostiles
            var hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
            if (!_.isEmpty(hostile)) {
                //get into range and kill
                creep.task = Tasks.attack(hostile)
                creep.say("Hostile!" + EM_SWORDS);
                return;
            } else {


                //find damaged creeps
                var hitCreeps = creep.pos.findClosestByRange(FIND_CREEPS, {
                    filter: c => c.hits < c.hitsMax
                })
                if (!_.isEmpty(hitCreeps)) {
                    creep.task = Tasks.heal(hitCreeps)
                    creep.say(EM_SYRINGE)
                    return
                }


                //remove flags when no enemies
                var whiteFlags = _.first(_.filter(Game.flags, (f) => f.color == COLOR_WHITE && f.room == creep.room))
                if (!_.isEmpty(whiteFlags)) {
                    creep.say(EM_FLAG)
                    whiteFlags.remove()
                }

                if ((Game.time % 3) == 0) {
                    creep.say(EM_SINGING)
                    var center = new RoomPosition(25,25,creep.room.name)
                    //creep.task = Tasks.goTo(center)
                    return
                }


            }

        } else {
            //go to target room
            creep.task = Tasks.goToRoom(creep.memory.target)
        }

    }
}