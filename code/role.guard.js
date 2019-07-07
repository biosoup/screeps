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

            //find hostiles
            var hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS)
            if (!_.isEmpty(hostile)) {
                //get into range and kill
                if (creep.rangedAttack(hostile) == ERR_NOT_IN_RANGE) {
                    creep.travelTo(hostile);
                }
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

                var whiteFlags = _.filter(Game.flags, (f) => f.color == COLOR_WHITE && f.room == creep.room)
                if (!_.isEmpty(whiteFlags)) {
                    var spawnR = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                        filter: s => s.structureType == STRUCTURE_SPAWN
                    })
                    if (!_.isEmpty(spawnR)) {
                        //console.log(JSON.stringify(spawnR))
                        creep.moveTo(spawnR)
                    } else {
                        creep.moveTo(creep.room.controller)
                    }
                    if ((Game.time % 3) == 0) {
                        creep.say(EM_FLAG)
                    }
                    return
                }

                if ((Game.time % 3) == 0) {
                    creep.say(EM_SINGING)
                }
            }

        } else {
            //go to target room
            creep.task = Tasks.goToRoom(creep.memory.target)
        }

    }
}