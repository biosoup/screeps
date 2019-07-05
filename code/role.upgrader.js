var Tasks = require("creep-tasks");

module.exports = upgrader = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (creep.carry.energy > 0) {
            //do the actual job
            if (!_.isEmpty(creep.room.controller.sign)) {
                if (creep.room.controller.sign.username != playerUsername) {
                    creep.task = Tasks.signController(creep.room.controller, roomSign)
                }
            } else {
                creep.task = Tasks.signController(creep.room.controller, roomSign)
            }
            creep.task = Tasks.upgrade(creep.room.controller);
            return
        } else {
            //first link nearby
            var links = creep.room.links.filter(s => s.energy > 0)
            var link = creep.pos.findInRange(links, 2)
            if (!_.isEmpty(link)) {
                creep.task = Tasks.withdraw(link[0]);
                creep.say(EM_LIGHTNING)
                return;
            }

            //then container nearby
            var containers = creep.room.containers.filter(s => s.energy > 0)
            var containerNearby = creep.pos.findInRange(containers, 2)
            if (!_.isEmpty(containerNearby)) {
                creep.task = Tasks.withdraw(containerNearby[0]);
                creep.say(EM_PACKAGE)
                return;
            }

            if(creep.getEnergy(creep, true)) {
                return;
            }

            creep.say("ERR!!")
        }
    }
};