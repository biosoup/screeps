var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
            //creep is not in target room

            if (creep.carry.energy > 0 && creep.memory.home != undefined && creep.room.name == creep.memory.home) {
                //have energy and is at home - dump energy into storage
                var structure = creep.room.storage;
                if (structure != undefined && creep.room.storage.store[RESOURCE_ENERGY] < creep.room.storage.storeCapacity) {
                    creep.task = Tasks.transfer(structure);
                } else {
                    creep.say('no place for energy')
                }

            } else if (creep.carry.energy == 0 && creep.memory.home != undefined && creep.room.name == creep.memory.home) {
                //no energy left, but is at home - go to work room

                //go to target room
                creep.task = Tasks.goToRoom(creep.memory.target)

            } else {
                //is not home yet - go home
                creep.task = Tasks.goToRoom(creep.memory.home)
            }



        } else {

            if (creep.carry.energy > 0 && creep.memory.target != undefined && creep.room.name == creep.memory.target) {
                //Find the closest damaged Structure
                var target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) =>
                        (s.hits < s.hitsMax) &&
                        s.structureType == STRUCTURE_ROAD
                });

                if (target !== undefined && target != null) {
                    creep.task = Tasks.repair(target);
                    creep.say("repairing")
                } else {
                    creep.task = Tasks.goToRoom(creep.memory.home)
                }
            } else if (creep.carry.energy < creep.carryCapacity && creep.memory.target != undefined && creep.room.name == creep.memory.target) {
                //creep is in target room and have a free space

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
                } else {
                    creep.say("no ene source")
                }
            } else if (creep.carry.energy == creep.carryCapacity && creep.memory.target != undefined && creep.room.name == creep.memory.target) {
                //creep is full - go to home room
                creep.task = Tasks.goToRoom(creep.memory.home)
            } else {
                //creep is in wrong state?? - go home
                creep.task = Tasks.goToRoom(creep.memory.home)
            }
        }

    }
};