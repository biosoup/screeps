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

        if (typeof container !== 'undefined') {

            // if creep is on top of the container
            if (creep.pos.isEqualTo(container.pos)) {

                //if there is a free space in container
                if (container.store[RESOURCE_ENERGY] < container.storeCapacity) {
                    // harvest source
                    creep.task = Tasks.harvest(source);

                } else {
                    //look for a link
                    var link = source.pos.findInRange(FIND_STRUCTURES, 1, {
                        filter: s => s.structureType == STRUCTURE_LINK
                    })[0];

                    if (link.energy < link.energyCapacity) {
                        //there is a space in the link
                        creep.task = Tasks.transfer(link);
                    } else {
                        //free time!
                        creep.say("nothing to do")

                        // TBD - maybe check RCL level and add the link / or container?
/* 
                        //find construction sites
                        var closestConstructionSite = creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 3);
                        if (closestConstructionSite !== undefined) {
                            //go build
                            creep.task = Tasks.build(closestConstructionSite);
                            creep.say("building");
                        } else {
                            //if nothing is to be built, do something useful

                            //Find the closest damaged Structure
                            var targets = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                                filter: (s) =>
                                    ((s.hits / s.hitsMax) < 1) &&
                                    s.structureType != STRUCTURE_CONTROLLER &&
                                    s.structureType != STRUCTURE_EXTENSION &&
                                    s.structureType != STRUCTURE_TOWER &&
                                    s.structureType != STRUCTURE_WALL &&
                                    s.structureType != STRUCTURE_SPAWN
                            });

                            if (target !== undefined) {
                                target = targets.sort(function (a, b) {
                                    return +a.hits - +b.hits
                                })[0];

                                if (target) {
                                    creep.task = Tasks.repair(target);
                                }
                            } */



                        //}


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
                creep.say("using link")
                var link = source.pos.findInRange(FIND_STRUCTURES, 2, {
                    filter: s => s.structureType == STRUCTURE_LINK
                })[0];
                if (link !== undefined) {
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
};