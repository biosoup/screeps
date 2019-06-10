var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (creep.carry.energy > 0) {
            //do the actual job

            // find closest spawn, extension or tower which is not full
            var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
                        s.structureType == STRUCTURE_EXTENSION) &&
                    s.energy < s.energyCapacity
            });

            if (structure == null) {
                structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_TOWER) &&
                        s.energy < s.energyCapacity
                });
            }

            // if we found one
            if (structure != undefined) {
                creep.task = Tasks.transfer(structure);
            } else {
                //if no structure as a destination, go wait near spawn
                var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_SPAWN)
                });

                creep.task = Tasks.goTo(structure);
            }


        } else {
            //look for storage
            let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => s.structureType == STRUCTURE_STORAGE &&
                    s.store[RESOURCE_ENERGY] > 500
            });

            if (container == undefined) {
                //if storage is empty find container
                container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER &&
                        s.store[RESOURCE_ENERGY]
                });
            }

            //console.log(container)
            //add a withraw task
            if (container != undefined) {
                creep.task = Tasks.withdraw(container);
            } else {
                //no work parts
                creep.say("no energy source")
            }
        }
    }
};