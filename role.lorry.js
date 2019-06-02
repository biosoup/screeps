module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function (creep) {
        // if creep is bringing energy to a structure but has no energy left
        if (creep.memory.working == true && creep.carry.energy == 0) {
            // switch state
            creep.memory.working = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to transfer energy to a structure
        if (creep.memory.working == true) {
            var structure;

            //if storage is empty, then service spawn as well
            if(creep.room.storage.store[RESOURCE_ENERGY] < 1000) {
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
            }


            if (structure == undefined) {
                structure = creep.room.storage;
            }

            // if we found one
            if (structure != undefined) {
                // try to transfer energy, if it is not in range
                if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.travelTo(structure);
                }
            }
        }
        // if creep is supposed to get energy
        else {
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

            // if one was found
            if (container != undefined) {
                // try to withdraw energy, if the container is not in range
                if (creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.travelTo(container);
                }
            }


        }
    }
};