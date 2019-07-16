var Tasks = require("tools.creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {
        if (_.sum(creep.carry) > creep.carry[RESOURCE_ENERGY] && !_.isEmpty(creep.room.storage)) {
            //creep has something other than energy
            creep.task = Tasks.transferAll(creep.room.storage);
            creep.say("other")
            return;
        } else if (creep.carry[RESOURCE_ENERGY] > 0) {
            // creep has energy -> work

            if (creep.fillStructures(creep)) {
                return;
            }

            if (!_.isEmpty(creep.room.storage)) {
                //we have storage
                if (creep.room.storage.store[RESOURCE_ENERGY] > (100000 * creep.room.controller.level)) {
                    //enough stored energy, look for link nearby and send enegy from it
                    var link = creep.room.storage.pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: s => s.structureType == STRUCTURE_LINK &&
                            s.energy < s.energyCapacity
                    })[0];
                    if (!_.isEmpty(link)) {
                        creep.task = Tasks.transfer(link);
                        return;
                    } else {
                        //no link or link full 

                        //creep.task = Tasks.transfer(creep.room.storage);
                        return;
                    }
                }
            } else {
                creep.say("no storage")
            }
        } else {
            //creep is empty

            //FIXME: do not go near hostiles!

            var hostiles = creep.room.find(FIND_HOSTILE_CREEPS)
            if (hostiles.length == 0) {
                //look for dropped resources
                var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
                    filter: s => s.targetedBy.length == 0
                })
                if (!_.isEmpty(droppedEnergy)) {
                    droppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
                    creep.task = Tasks.pickup(droppedEnergy);
                    return;
                }
                var tombstones = _.filter(creep.room.find(FIND_TOMBSTONES), (t) => _.sum(t.store) > 0 && t.targetedBy.length == 0)
                if (!_.isEmpty(tombstones)) {
                    tombstone = creep.pos.findClosestByRange(tombstones)
                    if (!_.isEmpty(tombstone)) {
                        if (!_.isEmpty(creep.room.storage)) {
                            creep.task = Tasks.withdrawAll(tombstone);
                            return;
                        } else {
                            creep.task = Tasks.withdraw(tombstone, RESOURCE_ENERGY);
                            return;
                        }
                    }
                }
            }

            //get from continer
            var containers = creep.room.containers.filter(s => s.store[RESOURCE_ENERGY] >= (s.storeCapacity - creep.carryCapacity - 50) && s.targetedBy.length == 0)
            if (!_.isEmpty(containers)) {
                var container = creep.pos.findClosestByRange(containers)
                creep.task = Tasks.withdraw(container);
                return;
            }

            //no suitable containers
            if (!_.isEmpty(creep.room.storage)) {
                //we have storage
                if (creep.room.storage.store[RESOURCE_ENERGY] < (100000 * creep.room.controller.level)) {
                    //if storage energy is low, look for link nearby and get enegy from it
                    var link = creep.room.storage.pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: s => s.structureType == STRUCTURE_LINK
                    })[0];
                    if (!_.isEmpty(link)) {
                        creep.task = Tasks.withdraw(link);
                        return;
                    } else {
                        //go sign the controller
                        creep.graffity()

                        //no link -> creep standby
                        if ((Game.time % 3) == 0) {
                            creep.say(EM_TEA)
                        }

                        //switch to transporter, if needed
                        var spawnTransporter = false;
                        if (spawnRoom.terminal != undefined) {
                            if (spawnRoom.memory.terminalTransfer != undefined) {
                                spawnTransporter = true;
                            } else {
                                var terminalDelta;
                                if (spawnRoom.memory.terminalDelta == undefined || Game.time % 10 == 0 || spawnRoom.memory.terminalDelta != 0) {
                                    terminalDelta = 0;
                                    for (var res in spawnRoom.terminal.store) {
                                        var delta = checkTerminalLimits(spawnRoom, res);
                                        terminalDelta += Math.abs(delta.amount);
                                        //console.log(terminalDelta)
                                    }

                                    for (var res in spawnRoom.storage.store) {
                                        var delta = checkTerminalLimits(spawnRoom, res);
                                        terminalDelta += Math.abs(delta.amount);
                                        //console.log(terminalDelta)
                                    }
                                } else {
                                    terminalDelta = spawnRoom.memory.terminalDelta;
                                }
                                if (terminalDelta > 0) {
                                    spawnTransporter = true;
                                }
                            }
                            if (spawnTransporter) {
                                creep.memory.role = "transporter"
                            }
                        }

                        //switch to scientist, if needed
                        if (spawnRoom.memory.labOrder != undefined) {
                            var info = spawnRoom.memory.labOrder.split(":");
                            if (info[3] == "prepare" || info[3] == "done") {
                                creep.memory.role = "scientist"
                            }
                        }
                    }
                } else {
                    //enough energy in storage
                    creep.task = Tasks.withdraw(creep.room.storage);
                    return;
                }
            } else {
                //go sign the controller
                creep.graffity()

                if ((Game.time % 3) == 0) {
                    creep.say(EM_TEA)
                }

            }

        }
    }
};