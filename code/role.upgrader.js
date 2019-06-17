var Tasks = require("creep-tasks");

module.exports = upgrader = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (creep.carry.energy > 0) {
            //do the actual job
            creep.task = Tasks.upgrade(creep.room.controller);

        } else {
            //first link nearby
            var container;
            
            container = creep.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: s => s.structureType == STRUCTURE_LINK &&
                    s.energy > 100
            })[0];

            //then use storage if there is anything in it
            if (container == undefined || container == null && creep.room.storage.store[RESOURCE_ENERGY] > 500) {
                container = creep.room.storage;
            }


            //then closest container
            if (container == undefined || container == null) {
                container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER &&
                        s.store[RESOURCE_ENERGY] > 100
                });
            }

            //add a withraw task
            if (container !== undefined && container != null) {
                creep.task = Tasks.withdraw(container);
                //console.log(JSON.stringify(container) + " 1")
            } else {
                // find closest source
                let source = creep.pos.findClosestByPath(FIND_SOURCES);
                if (source !== undefined && source != null) {
                    //console.log(creep + " " + source)
                    //creep.task = Tasks.harvest(source);
                    creep.say("harvesting")
                    return;
                }
            }
        }
    }
};