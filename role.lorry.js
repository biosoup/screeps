var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    work: function (creep) {


        // if creep is bringing energy to a structure but has no energy left
        if (creep.carry.energy > 0) {
            var task = creep.memory.currentTask;
            if (task != undefined) {
                var source = Game.getObjectById(task['source']);
                creep.task = Tasks.withdraw(source)
            } else {
                //console.log("faulty current task memory")
                if (!creep.isActive) {
                    if (creep.room.energyAvailable < 500) {
                        structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                            filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
                                    s.structureType == STRUCTURE_EXTENSION) &&
                                s.energy < s.energyCapacity
                        });

                        if (structure == undefined) {
                            structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                                // the second argument for findClosestByPath is an object which takes
                                // a property called filter which can be a function
                                // we use the arrow operator to define it
                                filter: (s) => (s.structureType == STRUCTURE_TOWER) &&
                                    s.energy < s.energyCapacity
                            });
                        }
                    } else {
                        structure = creep.room.storage;
                    }

                    creep.task = Tasks.transfer(structure);
                    
                    //console.log(structure)
                } else if (creep.hasValidTask) {
                    creep.run()
                }

            }
        } else {
            var task = creep.memory.currentTask;
            if (task != undefined) {
                var destination = Game.getObjectById(task['destination']);
                creep.task = Tasks.transfer(destination)
            } else {
                //console.log("faulty current task memory")
                if (!creep.isActive) {
                    // find closest container
                    var containers = creep.room.find(FIND_STRUCTURES, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER &&
                            s.store[RESOURCE_ENERGY]
                    });

                    var container = containers.sort(function (a, b) {
                        return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]
                    })[0];

                    if (container == undefined) {
                        container = creep.room.storage;
                    }

                } else if (creep.hasValidTask) {
                    creep.run()
                }
            }
        }
    }
};