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

            var closestConstructionSite
            if (creep.room.energyAvailable == creep.room.energyCapacityAvailable) {
                closestConstructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES, {
                    filter: (s) => s.structureType == STRUCTURE_CONTAINER ||
                        s.structureType == STRUCTURE_EXTENSION
                });
            }

            if (_.isEmpty(closestConstructionSite) && _.isEmpty(structure)) {
                closestConstructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES)
            }

            if (structure != undefined && closestConstructionSite == undefined) {
                //if structure found, do work
                creep.task = Tasks.transfer(structure);
            } else {
                //if no structure as a destination, go build
                if (closestConstructionSite != undefined && closestConstructionSite != null) {
                    //go build
                    creep.task = Tasks.build(closestConstructionSite);
                    creep.say(":hammer:");
                } else {
                    creep.say(":sleeping_bed:")
                    creep.task = Tasks.upgrade(creep.room.controller);
                }
            }
        } else {
            let container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => s.structureType == STRUCTURE_CONTAINER &&
                    s.store[RESOURCE_ENERGY] > 100
            });

            if (container == undefined) {
                if (creep.room.storage != undefined) {
                    container = creep.room.storage;
                }
            }

            if (container == undefined) {
                //find a link nerby the container
                var link = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_LINK &&
                        s.energy > 100
                });

                if (link != undefined && link != null) {
                    container = link
                }
            }


            //console.log(creep)

            if (container == undefined) {
                // Harvest from an empty source if there is one, else pick any source
                let sources = creep.room.find(FIND_SOURCES);
                let unattendedSource = _.filter(sources, source => source.targetedBy.length == 0);
                if (!_.isEmpty(unattendedSource)) {
                    unattendedSource = creep.pos.findClosestByPath(unattendedSource);
                    creep.task = Tasks.harvest(unattendedSource);
                } else {
                    let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                    if (source != undefined && source !== null) {
                        creep.task = Tasks.harvest(source);
                    }
                }
            } else {
                creep.task = Tasks.withdraw(container);
            }
        }

    }
};