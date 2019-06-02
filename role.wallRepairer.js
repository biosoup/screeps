var roleBuilder = require('role.builder');

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    run: function (creep) {
        var startCpu = Game.cpu.getUsed();
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
        //creep.say(creep.memory.working+" "+creep.memory.target);
        if (creep.memory.working == true && creep.memory.targetW == false) {
            // find all walls in the room
            var walls = creep.room.find(FIND_STRUCTURES, {
                filter: (s) =>
                    (s.structureType == STRUCTURE_WALL || s.structureType == STRUCTURE_RAMPART) &&
                    s.hits < 50000
            });

            target = walls.sort(function (a, b) {
                return +a.hits - +b.hits
            })[0]


            // if we find a wall that has to be repaired
            if (target != undefined) {
                creep.memory.targetW = target.id;
                creep.say(target.hits)
                // try to repair it, if not in range
                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.travelTo(target);
                }
            }
            // if we can't fine one
            else {
                // look for construction sites
                roleBuilder.run(creep);
            }

            //pracuje a uz zna svuj cil
        } else if (creep.memory.working == true && creep.memory.targetW != false) {

            const target = creep.room.find(FIND_STRUCTURES, {
                filter: s => s.id == creep.memory.targetW
            })[0];

            //console.log(target);
            if (target != undefined) {
                // try to repair it, if not in range
                //console.log(creep.repair(target));

                if (creep.repair(target) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    creep.travelTo(target);
                }
            }
            // if we can't fine one
            else {
                // look for construction sites
                roleBuilder.run(creep);
            }

            // if creep is supposed to get energy
        } else {
            creep.getEnergy(true, true);
        }
        //kontrola spotreby CPU
        var elapsed = Game.cpu.getUsed() - startCpu;
        //console.log('Wall repair has used '+elapsed+' CPU time');
    }

};
