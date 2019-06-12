var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (creep.carry.energy > 0) {
            //do the actual job

            //find core base structures
            var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
                        s.structureType == STRUCTURE_EXTENSION
                        //|| s.structureType == STRUCTURE_TOWER
                    ) &&
                    s.energy < s.energyCapacity
            });

            //find towers
            if (structure == undefined) {
                structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_TOWER) &&
                        s.energy < s.energyCapacity
                });
            }

            //no structures, dump energy into storage
            if (structure == undefined) {
                structure = creep.room.storage;
            }

            if (structure != undefined) {
                //if structure found, do work
                creep.task = Tasks.transfer(structure);
            } else {
                //if no structure as a destination, go build
                var closestConstructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                if (closestConstructionSite !== undefined && closestConstructionSite != null) {
                    //go build
                    creep.task = Tasks.build(closestConstructionSite);
                    creep.say("building");
                } else {
                    creep.say("nothing to do")
                    creep.task = Tasks.upgrade(creep.room.controller);
                }
            }
        } else {
            let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => s.structureType == STRUCTURE_CONTAINER &&
                    s.store[RESOURCE_ENERGY]
            });

            //console.log(creep)

            if (container == undefined) {
                // Harvest from an empty source if there is one, else pick any source
                /* let sources = creep.room.find(FIND_SOURCES);
                let unattendedSource = _.filter(sources, source => source.targetedBy.length == 0);
                if (unattendedSource) {
                    unattendedSource = creep.pos.findClosestByPath(unattendedSource);
                    console.log(unattendedSource)
                    creep.task = Tasks.harvest(unattendedSource);
                } else { */
                let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                if (source !== undefined && source !== null) {
                    //console.log(creep + " " + source)
                    creep.task = Tasks.harvest(source);
                }
                //}
            } else {
                creep.task = Tasks.withdraw(container);
            }
        }

    }
};