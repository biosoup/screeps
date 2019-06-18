var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    newTask: function (creep) {
        // get source
        if (creep.memory.target != undefined && creep.room.name != creep.memory.target) {
            creep.task = Tasks.goToRoom(creep.memory.target)
        } else if (creep.memory.target != undefined && creep.room.name == creep.memory.target) {
            let sources = creep.room.find(FIND_SOURCES);
            let unattendedSource = _.filter(sources, source => source.targetedBy.length == 0);
            if (unattendedSource !== undefined && unattendedSource != null) {
                var source = creep.pos.findClosestByPath(unattendedSource);

            }

            if (source == null) {
                var source = sources[0];
            }

            //console.log(creep+" "+source)

            if (source != null) {
                // find container next to source
                var container = source.pos.findInRange(FIND_STRUCTURES, 1, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER
                })[0];

                if (typeof container !== 'undefined') {
                    // if creep is on top of the container
                    if (creep.pos.isEqualTo(container.pos)) {
                        //if container needs repairs
                        if ((container.hits / container.hitsMax) < 0.7 && creep.carry.energy > 0) {
                            creep.task = Tasks.repair(container)
                            creep.say("repairing")
                        } else {
                            //if there is a free space in container
                            if (container.store[RESOURCE_ENERGY] < container.storeCapacity) {
                                // harvest source
                                creep.task = Tasks.harvest(source);
                                creep.say("harvesting")
                            } else {
                                if ((container.hits / container.hitsMax) < 0.7 && container.store[RESOURCE_ENERGY] == container.storeCapacity) {
                                    creep.task = Tasks.withdraw(container);
                                }
                                
                                creep.say("nothing to do")
                            }
                        }


                    } else {
                        // if creep is not on top of the container
                        creep.travelTo(container);
                    }

                } else {
                    creep.say("missing container")
                    if (creep.carry.energy < creep.carryCapacity) {
                        //console.log(creep+" "+source+" "+creep.room.name)
                        creep.task = Tasks.harvest(source);
                    } else {
                        //go build stuff?
                        var buildSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);
                        if (buildSite != undefined && buildSite != null) {
                            creep.task = Tasks.build(buildSite);
                            creep.say("building")
                        }
                        
                    }
                }

            } else {
                creep.say("missing source")
                console.log(Game.time + " Smth wrong with: " + creep + " " + source + " " + creep.room.name) //+" "+JSON.stringify(sources)
            }


        } else {
            creep.say("confused")
        }
    }
};