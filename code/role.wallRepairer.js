var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for creep role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (!_.isEmpty(creep.memory.home) && creep.room.name != creep.memory.home) {
            creep.task = Tasks.goToRoom(creep.memory.target)
        } else {
            if (creep.carry.energy > 0) {
                //find structures that need repairing
                var ramparts = creep.room.ramparts.filter(s => s.hits < WALLMAX);
                var walls = creep.room.constructedWalls.filter(s => s.hits < WALLMAX);
                //sort by hits
                var rampart = _.first(_.sortBy(ramparts, "hits"));
                var wall = _.first(_.sortBy(walls, "hits"));
                //console.log(creep.room.name+" R:"+rampart.hits+" W:"+wall.hits)
                
                if (rampart.hits<wall.hits) {
                    var target = rampart;
                } else {
                    var target = wall;
                }

                // if we find a wall that has to be repaired
                if (!_.isEmpty(target)) {
                    creep.task = Tasks.repair(target)
                    creep.say(EM_WRENCH)
                    return
                } else {
                    //nothing to do -> upgrade controller
                    if (creep.room.controller.my) {
                        creep.task = Tasks.upgrade(creep.room.controller);
                        creep.say(EM_LIGHTNING);
                        return;
                    } else {
                        creep.say(EM_SINGING);
                        return
                    }
                }
            } else {
                //get energy
                if (creep.getEnergy(creep, true)) {
                    return;
                }
            }
        }
    }
}