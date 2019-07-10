var Tasks = require("./x.creep-tasks");

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

            //look for dropped resources
            var droppedEnergy = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES)
            if (!_.isEmpty(droppedEnergy)) {
                creep.task = Tasks.pickup(droppedEnergy);
                return;
            }
            var tombstones = _.filter(creep.room.find(FIND_TOMBSTONES), (t) => _.sum(t.store) > 0)
            if (!_.isEmpty(tombstones)) {
                tombstone = creep.pos.findClosestByPath(tombstones)
                if (!_.isEmpty(tombstone)) {
                    creep.task = Tasks.withdrawAll(tombstone);
                    return;
                }
            }

            //get from continer
            var containers = creep.room.containers.filter(s => s.store[RESOURCE_ENERGY] == s.storeCapacity)
            var container = creep.pos.findClosestByPath(containers)
            if (!_.isEmpty(container)) {
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
                        //no link -> creep standby
                        creep.say("no ene/link")
                    }
                } else {
                    //enough energy in storage
                    creep.task = Tasks.withdraw(creep.room.storage);
                    return;
                }
            } else {
                creep.say("no ene source")
            }

        }
    }
};