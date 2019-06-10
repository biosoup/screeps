var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (_.sum(creep.carry) == creep.carryCapacity) {
            //do the actual job

            //find terminal
            var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_TERMINAL) &&
                    s.store < s.storeCapacity
            });

            //no structures, dump energy into storage
            if (structure == undefined) {
                structure = creep.room.storage;
            }

            if (structure != undefined && structure != null) {
                //if structure found, do work
                creep.task = Tasks.transferAll(structure);
            }
        } else {
            let source = creep.pos.findClosestByPath(FIND_MINERALS, {filter: (s) => s.mineralAmount > 0});

            //console.log(creep)
            if (source !== undefined && source !== null) {
                //console.log(creep+" "+source)
                creep.task = Tasks.harvest(source);
            }
        }

    }
};