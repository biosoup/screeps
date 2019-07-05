var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    newTask: function (creep) {
        // get source
        var source = Game.getObjectById(creep.memory.sourceId);

        if (source != null) {
            // find container next to source
            var container = source.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: s => s.structureType == STRUCTURE_CONTAINER
            })[0];
        } else {
            creep.say("missing source")
        }

        if (source == undefined || source == null) {
            console.log(creep + " " + source)
        }

        //creep has container
        if (typeof container !== 'undefined') {

            // if creep is on top of the container
            if (creep.pos.isEqualTo(container.pos)) {

                if (container.hits < container.hitsMax && creep.carry.energy > 0) {
                    creep.task = Tasks.repair(container)
                    creep.say("\u{1F477}")
                    
                } else if (creep.carry.energy == creep.carryCapacity) {
                    //look for a link
                    var link = source.pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: s => s.structureType == STRUCTURE_LINK
                    })[0];

                    if (link != undefined && link != null) {
                        //console.log(link)
                        if (link.energy < link.energyCapacity) {
                            //there is a space in the link
                            creep.task = Tasks.transfer(link);
                        } else if (container.store[RESOURCE_ENERGY] < container.storeCapacity) {
                            // harvest source
                            creep.task = Tasks.harvest(source);
                        }
                    } else {
                        if (container.store[RESOURCE_ENERGY] < container.storeCapacity) {
                            // harvest source
                            creep.task = Tasks.harvest(source);
                        }
                    }
                } else if (container.store[RESOURCE_ENERGY] < container.storeCapacity) {
                    //container has free space

                    // harvest source
                    creep.task = Tasks.harvest(source);
                } else {
                    creep.say("full container")
                    if (creep.carry.energy < creep.carryCapacity) {
                        // harvest source
                        creep.task = Tasks.harvest(source);
                    }
                }
            } else {
                // if creep is not on top of the container
                creep.travelTo(container);
            }

        } else {
            creep.say("missing container")
            if (creep.carry.energy < creep.carryCapacity) {
                creep.task = Tasks.harvest(source);
            } else {
                var buildSite = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
                if (buildSite != undefined && buildSite != null) {
                    creep.task = Tasks.build(buildSite);
                    creep.say("\u{1F3D7}")
                } else {
                    creep.say("using link")
                    var link = source.pos.findInRange(FIND_STRUCTURES, 2, {
                        filter: s => s.structureType == STRUCTURE_LINK
                    })[0];
                    if (link != undefined) {
                        if (link.energy < link.energyCapacity) {
                            //there is a space in the link
                            creep.task = Tasks.transfer(link);
                        }
                    } else {
                        creep.say("no link")
                    }
                }

            }
        }
    }
};