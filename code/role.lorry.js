var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        //console.log(creep.name+" "+creep.carry.energy)

        if (creep.carry.energy == 0) {
            // find closest container
            var containers = creep.room.find(FIND_STRUCTURES, {
                filter: s => s.structureType == STRUCTURE_CONTAINER &&
                    s.store[RESOURCE_ENERGY] > 100
            });

            //sort from the fullest
            var container = containers.sort(function (a, b) {
                return b.store[RESOURCE_ENERGY] - a.store[RESOURCE_ENERGY]
            })[0];
                        
            //add a withraw task
            if (!_.isEmpty(container)) {
                creep.task = Tasks.withdraw(container);
            } else if (!_.isEmpty(creep.room.storage)) {
                //find a link nearby the storage
                var link = creep.room.storage.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: s => s.structureType == STRUCTURE_LINK
                })[0];
                
                if (!_.isEmpty(link)) {
                    //console.log(link)
                    if (link.energy == link.energyCapacity) {
                        //the link is full
                        creep.task = Tasks.withdraw(link);
                        creep.say("using link")
                    }
                } else {
                    creep.say("no ene source")
                }
            } else {
                creep.say("noth to do")
            }
            
        } else {
            //find towers to give them their energy
            towers = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                filter: (s) => (s.structureType == STRUCTURE_TOWER) &&
                    s.energy < s.energyCapacity
            });

            //if energy is missing in main structures
            if (creep.room.energyAvailable < creep.room.energyCapacityAvailable) {
                //find spawn and extension to refill
                structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
                            s.structureType == STRUCTURE_EXTENSION) &&
                        s.energy < s.energyCapacity
                });
            } else if (!_.isEmpty(towers)) {
                // if no spawn structers need energy, then towers
                structure = towers;
            } else {
                //if nothing urgently need energy, then to storage
                structure = creep.room.storage;
            }

            if (!_.isEmpty(structure)) {
                creep.task = Tasks.transfer(structure);
            } else {
                creep.say('no place for energy')
            }
        }
    }
};