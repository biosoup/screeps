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
            var link = creep.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: s => s.structureType == STRUCTURE_LINK &&
                    s.energy > 0
            })[0];
            if (!_.isEmpty(link)) {
                creep.task = Tasks.withdraw(link);
                return;
            }

            //then container nearby
            var containerNearby = creep.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: s => s.structureType == STRUCTURE_CONTAINER &&
                    s.energy > 0
            })[0];
            if (!_.isEmpty(containerNearby)) {
                creep.task = Tasks.withdraw(containerNearby);
                return;
            }

            //then use storage if there is anything in it
            if (!_.isEmpty(creep.room.storage)) {
                if (creep.room.storage.store[RESOURCE_ENERGY] > 500) {
                    creep.task = Tasks.withdraw(creep.room.storage);
                    return;
                }
            }

            //then closest container
            var container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => s.structureType == STRUCTURE_CONTAINER &&
                    s.store[RESOURCE_ENERGY] > 100
            });
            if (!_.isEmpty(container)) {
                creep.task = Tasks.withdraw(container);
                return;
            }

            //everything failed, harvest
            let source = creep.pos.findClosestByPath(FIND_SOURCES);
            if (!_.isEmpty(source)) {
                creep.task = Tasks.harvest(source);
                return;
            }

            creep.say("ERR!!")
        }
    }
};