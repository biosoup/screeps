var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    newTask: function (creep) {
        // get source
        if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
            creep.task = Tasks.goToRoom(creep.memory.target)
        } else if (creep.memory.target != undefined && creep.room.name == creep.memory.target) {
            let sources = creep.room.find(FIND_SOURCES);
            let unattendedSource = _.filter(sources, source => source.targetedBy.length == 0);
            if (unattendedSource !== undefined && unattendedSource != null) {
                var source = creep.pos.findClosestByPath(unattendedSource);
            }

            if (source != null) {
                // find container next to source
                var container = source.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER
                })[0];
            } else {
                creep.say("missing source")
            }

            if (typeof container !== 'undefined') {

                // if creep is on top of the container
                if (creep.pos.isEqualTo(container.pos)) {

                    //if there is a free space in container
                    if (container.store[RESOURCE_ENERGY] < container.storeCapacity) {
                        // harvest source
                        creep.task = Tasks.harvest(source);
                    } else {
                        creep.say("nothing to do")
                    }
                } else {
                    // if creep is not on top of the container
                    creep.travelTo(container);
                }

            } else {
                creep.say("missing container")
                if (creep.carry.energy < creep.carryCapacity) {
                    creep.task = Tasks.harvest(source);
                } else {
                    //go build stuff?
                }
            }
        } else {
            creep.say("confused")
        }
    }
};