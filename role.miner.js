module.exports = {
    // a function to run the logic for this role
    run: function (creep) {


        //get number of sources in room
        //var sourceCount = creep.room.find(FIND_SOURCES);
        //console.log(sourceCount.length);        

        // get source
        let source = Game.getObjectById(creep.memory.sourceId);
        //var source = creep.pos.findClosestByRange(FIND_SOURCES);        
        //console.log(source);


        // find container next to source
        let container = source.pos.findInRange(FIND_STRUCTURES, 1, {
            filter: s => s.structureType == STRUCTURE_CONTAINER
        })[0];
        //console.log(container);

        if (typeof container !== 'undefined') {
            // if creep is on top of the container
            if (creep.pos.isEqualTo(container.pos)) {
                // harvest source
                creep.harvest(source);
            }
            // if creep is not on top of the container
            else {
                // move towards it
                creep.moveTo(container);
            }

            //když je to rozbité
        } else {
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
                // find closest spawn, extension or tower which is not full
                var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    // the second argument for findClosestByPath is an object which takes
                    // a property called filter which can be a function
                    // we use the arrow operator to define it
                    filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
                            s.structureType == STRUCTURE_EXTENSION ||
                            s.structureType == STRUCTURE_TOWER) &&
                        s.energy < s.energyCapacity
                });

                if (structure == undefined) {
                    structure = creep.room.storage;
                }

                // if we found one
                if (structure != undefined) {
                    // try to transfer energy, if it is not in range
                    if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        // move towards it
                        creep.moveTo(structure);
                    }
                }
            }
            // if creep is supposed to harvest energy from source
            else {
                creep.getEnergy(false, true);
            }
        }

    }
};
