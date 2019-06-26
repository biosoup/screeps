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
                    creep.say("tranfering")
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
                creep.task = Tasks.goToRoom(creep.memory.home)
            } else if (creep.carry.energy < creep.carryCapacity && creep.memory.target != undefined && creep.room.name == creep.memory.target) {
                //creep is in target room and have a free space

                // find closest container
                var containers = creep.room.find(FIND_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER &&
                        s.store[RESOURCE_ENERGY] > 0
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

    },

    newTask2: function (creep) {
        let cpuStart = Game.cpu.getUsed();
        if (creep.room.name == creep.memory.home && (creep.carry.energy == 0 || _.isEmpty(creep.memory.target))) {
            //creep is home, empty, with no target
            var r = creep.room;

            //get creep TTL
            var creepPossibleDistance = (creep.ticksToLive / 2) - 40;

            //get all possible targets
            var allContainers = _.filter(r.memory.containerSources, (c) => c.energy >= creep.carryCapacity && c.distance != false && c.distance < creepPossibleDistance);

            //console.log(JSON.stringify(validContainers))
            //console.log(JSON.stringify(_.difference(containerTargets, allContainers)))
            //console.log(_.size(validContainers)+" "+JSON.stringify(_.sortByOrder(validContainers, ['ed'], ['desc'], _.values)[0]))

            //sort by distance and amount
            if (_.size(allContainers) > 0) {
                //sort valid conteiners by best
                validContainer = _.sortByOrder(allContainers, ['ed'], ['desc'], _.values)

                //get other long distance lorries, and their check for same target
                var allMinerCreeps = _.map(_.filter(Game.creeps, (c) => c.memory.home == r.name && c.memory.role == "longDistanceLorry"), "c.memory.target");

                //check for duplicate targets
                var validTarget;
                for (var c in allMinerCreeps) {
                    for (i = 0; i < _.size(validContainer); i++) { 
                        if (c.id != validContainer[i].id) {
                            validTarget = validContainer[i]
                            break;
                        }
                      }
                }

                if (validTarget != undefined && validTarget != null) {
                    //target found, add it to creep.memory.target
                    creep.memory.target = validTarget;
                    container = Game.getObjectById(validTarget.id)
                    if (container != null) {
                        if (validTarget.energy >= creep.carryCapacity) {
                            //go work the target
                            creep.task = Tasks.withdraw(container);
                            creep.say("target found!")

                            //substract current request
                            r.memory.containerSources[validTarget.id].energy = r.memory.containerSources[validTarget.id].energy-creep.carryCapacity
                            validTarget.energy = validTarget.energy-creep.carryCapacity

                            if (creep.carryCapacity > container.store[RESOURCE_ENERGY]) {
                                var carry = container.store[RESOURCE_ENERGY]
                            } else {
                                var carry = creep.carryCapacity
                            }
                            console.log(creep.name + " going for " + container.id + " in " + container.room.name + " with " + container.store[RESOURCE_ENERGY] + "("+validTarget.energy+") in distance " + validTarget.distance + " for a return of e/d " + validTarget.ed)
                        }
                    } else {
                        console.log(creep.name + " ERRRRR!!!  target not valid " + JSON.stringify(validTarget) + " " + JSON.stringify(validContainers) + " " + JSON.stringify(allContainers) + " " + JSON.stringify(containerTargets))
                    }
                }
            } else {
                if (creepPossibleDistance < 100) {
                    creep.say("dying")
                } else {
                    creep.memory.target = {};
                    creep.say("no valid target")
                }
            }
        } else if (creep.room.name == creep.memory.home && creep.carry.energy > 0) {
            //creep is home and have some energy left

            //get home storage
            var homeStorage = Game.rooms[creep.memory.home].storage;
            if (homeStorage != undefined && homeStorage != null) {
                //put energy into storage
                creep.task = Tasks.transfer(homeStorage)
                creep.say("to storage!")
            } else {
                console.log("storage not found!!! " + creep.name + " " + creep.room.name + " " + creep.memory.home)
                creep.say("confused storage")
            }
        } else if (creep.room.name == creep.memory.home && !_.isEmpty(creep.memory.target)) {
            //creep is home, nad target is valid
            var validContainer = creep.memory.target

            if (validContainer != undefined && validContainer != null) {
                //go work the target
                creep.task = Tasks.withdraw(validContainer);
                //creep.say("empty err?")
            }

        } else if (creep.room.name != creep.memory.home && creep.carry.energy > 0) {
            //creep is abroad and have some energy

            //get home storage
            var homeStorage = Game.rooms[creep.memory.home].storage;
            if (homeStorage != undefined && homeStorage != null) {
                //put energy into storage
                creep.task = Tasks.transfer(homeStorage)
                creep.say("to storage!")
            } else {
                console.log("storage not found!!! " + creep.name + " " + creep.room.name + " " + creep.memory.home)
                creep.say("confused")
            }
        } else if (_.isEmpty(creep.memory.target)) {
            if (creep.carry.energy > 0) {
                //get home storage
                var homeStorage = Game.rooms[creep.memory.home].storage;
                if (homeStorage != undefined && homeStorage != null) {
                    //put energy into storage
                    creep.task = Tasks.transfer(homeStorage)
                    creep.say("to storage!")
                } else {
                    console.log("storage not found!!! " + creep.name + " " + creep.room.name + " " + creep.memory.home)
                    creep.say("confused")
                }
            } else if (creep.ticksToLive < 200) {
                creep.say("dying")
            } else {
                creep.say("empty task")
                //get home storage
                var homeStorage = Game.rooms[creep.memory.home].storage;
                creep.task = Tasks.goTo(homeStorage)
            }
        } else if (creep.room.name != creep.memory.home && creep.carry.energy == 0 && !_.isEmpty(creep.memory.target)) {
            //creep is abroad, nad target is valid
            var validTarget = creep.memory.target
            validTarget = Game.getObjectById(validTarget.id)
            if (validTarget != undefined && validTarget != null) {
                if (validTarget.store[RESOURCE_ENERGY] > 0) {
                    //go work the target
                    creep.task = Tasks.withdraw(validTarget);
                    creep.say("to target!")
                } else {
                    creep.say("target empty")
                    creep.memory.target = {}
                    creep.task = Tasks.goToRoom(creep.memory.home)
                }
            }
        } else {
            //something wrong
            //console.log("creep confused!!! " + creep.name + " " + creep.room.name + " " + creep.carry.energy + " " + JSON.stringify(creep.memory.target) + " " + _.isEmpty(creep.memory.target))
            creep.say("run confused")
            //console.log(JSON.stringify(creep.memory))

            creep.memory.target = {}
            //creep.task = Tasks.goToRoom(creep.memory.home)

        }
        //console.log(creep.name+" CPU used: " + (Game.cpu.getUsed() - cpuStart))
    }
};