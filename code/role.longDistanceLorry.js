var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        let cpuStart = Game.cpu.getUsed();

        //check for hostiles
        let hostileValues = creep.room.checkForHostiles(creep.room)
        if (!_.isEmpty(hostileValues)) {
            if (hostileValues.numHostiles > 0) {
                creep.room.createFlag(25, 25, "DEFEND-" + creep.room.name + "-" + creep.memory.home, COLOR_WHITE, COLOR_RED)
                creep.task = Tasks.goToRoom(creep.memory.home);
                return
            }
        }

        if (!_.isEmpty(Game.rooms[creep.memory.home].memory.containerSources)) {
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

                    if (!_.isEmpty(validTarget)) {
                        //target found, add it to creep.memory.target
                        creep.memory.target = validTarget;
                        container = Game.getObjectById(validTarget.id)
                        if (!_.isEmpty(container)) {
                            if (validTarget.energy >= creep.carryCapacity) {
                                //go work the target
                                creep.task = Tasks.withdraw(container);
                                creep.say(EM_TRUCK)

                                //substract current request
                                r.memory.containerSources[validTarget.id].energy = r.memory.containerSources[validTarget.id].energy - creep.carryCapacity
                                validTarget.energy = validTarget.energy - creep.carryCapacity

                                if (creep.carryCapacity > container.store[RESOURCE_ENERGY]) {
                                    var carry = container.store[RESOURCE_ENERGY]
                                } else {
                                    var carry = creep.carryCapacity
                                }
                                //console.log(creep.name + " going for " + container.id + " in " + container.room.name + " with " + container.store[RESOURCE_ENERGY] + "(" + validTarget.energy + ") in distance " + validTarget.distance + " for a return of e/d " + validTarget.ed)
                            }
                        } else {
                            console.log(creep.name + " ERRRRR!!!  target not valid " + JSON.stringify(validTarget) + " " + JSON.stringify(allContainers) + " " + JSON.stringify(container))
                            delete r.memory.containerSources[validTarget.id]
                        }
                    }
                } else {
                    if (creepPossibleDistance < 50) {
                        creep.say("dying")
                        creep.suicide()
                    } else {
                        creep.memory.target = {};
                        creep.say(EM_ZZZ)
                    }
                }
            } else if (creep.room.name == creep.memory.home && creep.carry.energy > 0) {
                //creep is home and have some energy left

                //get home storage
                var homeStorage = Game.rooms[creep.memory.home].storage;
                if (!_.isEmpty(homeStorage)) {
                    //put energy into storage
                    creep.task = Tasks.transfer(homeStorage)
                    creep.say("storage full!")
                } else {
                    console.log("storage not found!!! " + creep.name + " " + creep.room.name + " " + creep.memory.home)
                    creep.say("confused storage")
                }
            } else if (creep.room.name == creep.memory.home && !_.isEmpty(creep.memory.target)) {
                //creep is home, nad target is valid
                var validContainer = creep.memory.target

                if (!_.isEmpty(validContainer)) {
                    //go work the target
                    creep.task = Tasks.withdraw(validContainer);
                    //creep.say("empty err?")
                }

            } else if (creep.room.name != creep.memory.home && creep.carry.energy > 0) {
                //creep is abroad and have some energy

                //get home storage
                var homeStorage = Game.rooms[creep.memory.home].storage;
                if (!_.isEmpty(homeStorage)) {
                    //put energy into storage
                    creep.task = Tasks.transfer(homeStorage)
                    creep.say(EM_TRUCK)
                } else {
                    console.log("storage not found!!! " + creep.name + " " + creep.room.name + " " + creep.memory.home)
                    creep.say("confused")
                }
            } else if (_.isEmpty(creep.memory.target)) {
                if (creep.carry.energy > 0) {
                    //get home storage
                    var homeStorage = Game.rooms[creep.memory.home].storage;
                    if (!_.isEmpty(homeStorage)) {
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
                if (!_.isEmpty(validTarget)) {
                    if (validTarget.store[RESOURCE_ENERGY] > 0) {
                        //go work the target
                        creep.task = Tasks.withdraw(validTarget);
                        creep.say(EM_PIN + "" + EM_TRUCK)
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
        } else {
            creep.say("no D containers")
        }
    }
};