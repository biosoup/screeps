var roleBuilder = require('role.builder');

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    work: function (creep) {
        // if target is defined and creep is not in target room
        if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
            // find exit to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            // move to exit
            creep.travelTo(creep.pos.findClosestByPath(exit));
            // return the function to not do anything else
            return;
        }

        
        // if creep is trying to repair something but has no energy left
        if (creep.memory.working == true && creep.carry.energy == 0) {
            // switch state
            creep.memory.working = false;
            creep.memory.targetW = false;
        }
        // if creep is harvesting energy but is full
        else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
            // switch state
            creep.memory.working = true;
        }

        // if creep is supposed to repair something
        if (creep.memory.working == true) {
            // find closest structure with less than max hits
            // Exclude walls because they have way too many max hits and would keep
            // our repairers busy forever. We have to find a solution for that later.
            var structure = creep.room.find(FIND_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL
            });
            
            structure = structure.sort(function (a, b) {
                return +a.hits - +b.hits
            })[0];
            

            // if we find one
            if (structure != undefined) {
                creep.memory.targetW = structure.id;
                // try to repair it, if it is out of range
                if (creep.repair(structure) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.travelTo(structure);
                }
            }
            // if we can't fine one
            else {
                // look for construction sites
                roleBuilder.work(creep);
            }
        }
        // if creep is supposed to get energy
        else {
            creep.getEnergy(true, true);
        }
    }
};