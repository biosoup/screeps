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
            if (container != undefined) {
                creep.task = Tasks.withdraw(container);
            } else if (creep.room.storage != undefined) {
                //find a link nerby the container
                var link = creep.room.storage.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: s => s.structureType == STRUCTURE_LINK
                })[0];
                
                if (link != undefined && link != null) {
                    //console.log(link)
                    if (link.energy == link.energyCapacity) {
                        //the link is full
                        creep.task = Tasks.withdraw(link);
                        creep.say("using link")
                    } /* else {
                        creep.task = Tasks.withdraw(creep.room.storage);
                        creep.say("using container")
                    } */
                } else {
                    creep.say("no ene source")
                }
            } else {
                creep.say("noth to do")
            }
            
        } else {
            //find towers to give them their energy
            towers = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                // the second argument for findClosestByPath is an object which takes
                // a property called filter which can be a function
                // we use the arrow operator to define it
                filter: (s) => (s.structureType == STRUCTURE_TOWER) &&
                    s.energy < s.energyCapacity
            });

            //if energy is missing in main structures
            if (creep.room.energyAvailable < (creep.room.energyCapacityAvailable/2)) {
                //find spawn and extension to refill
                structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_SPAWN ||
                            s.structureType == STRUCTURE_EXTENSION) &&
                        s.energy < s.energyCapacity
                });
            } else if (towers != undefined) {
                // if no spawn structers need energy, then towers
                structure = towers;
            } else {
                //if nothing urgently need energy, then to storage
                structure = creep.room.storage;
            }

            if (structure != undefined) {
                creep.task = Tasks.transfer(structure);
            } else {
                creep.say('no place for energy')
            }
        }
    }
};