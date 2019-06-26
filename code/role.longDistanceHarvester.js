var Tasks = require("creep-tasks");

let longDistanceHarvester = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (creep.memory.home != undefined && creep.room.name == creep.memory.home) {
            //if in home room
            if (creep.carry.energy > 0) {
                // check if spawn needs energy
                var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                    filter: (s) => (s.structureType == STRUCTURE_SPAWN) &&
                        s.energy < s.energyCapacity
                });

                //if spawn is ok, then to storage
                if (structure == undefined) {
                    structure = creep.room.storage;
                }

                //if there is no storage, then to container
                if (structure == undefined) {
                    structure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER
                        //&& s.store < s.storeCapacity
                    });
                }

                if (structure != undefined) {
                    //if full and destination known, dump energy
                    creep.task = Tasks.transfer(structure)
                } else {
                    //if no structure as a destination, go wait near spawn
                    var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
                        filter: (s) => (s.structureType == STRUCTURE_SPAWN)
                    });

                    creep.task = Tasks.goTo(structure);
                }
            } else {
                //go to target room
                creep.task = Tasks.goToRoom(creep.memory.target)
            }
        } else if (creep.memory.target != undefined && creep.room.name == creep.memory.target) {
            //if in target room

            //console.log(creep)

            // if creep need energy, get him refilled
            if (creep.carry.energy < creep.carryCapacity) {
                let sources = creep.room.find(FIND_SOURCES);
                let unattendedSource = _.filter(sources, source => source.targetedBy.length == 0);

                if (unattendedSource != undefined && unattendedSource != null) {

                    unattendedSource = creep.pos.findClosestByPath(unattendedSource);
                    if (unattendedSource !== null) {
                        //console.log(creep + " un " + unattendedSource)
                        creep.task = Tasks.harvest(unattendedSource);
                    } 
                } else {
                    if (sources != undefined) {
                        console.log(creep + " " + sources[0])
                        creep.task = Tasks.harvest(sources[0]);
                    }
                }
                creep.say("harvesting")
            } else {
                //if full, go home
                creep.task = Tasks.goToRoom(creep.memory.home)
            }
        } else {
            creep.say("confused")
        }
    }
};

module.exports = longDistanceHarvester;