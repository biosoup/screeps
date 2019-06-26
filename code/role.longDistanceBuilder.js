var Tasks = require("creep-tasks");

module.exports = {
    // a function to run the logic for this role
    /** @param {Creep} creep */
    newTask: function (creep) {

        // if target is defined and creep is not in target room
        if (creep.memory.target != undefined && creep.memory.target != null && creep.memory.target != "" && creep.room.name != creep.memory.target) {
            creep.task = Tasks.goToRoom(creep.memory.target)
        } else {
            // if creep need energy, get him refilled
            if (creep.carry.energy > 0) {
                //find critical repair sites
                var closestRepairSite = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: (s) =>
                        ((s.hits / s.hitsMax) < 0.5) &&
                        s.structureType != STRUCTURE_CONTROLLER &&
                        s.structureType != STRUCTURE_EXTENSION &&
                        s.structureType != STRUCTURE_TOWER &&
                        s.structureType != STRUCTURE_WALL &&
                        s.structureType != STRUCTURE_RAMPART &&
                        s.structureType != STRUCTURE_SPAWN
                });


                //find construction sites
                var closestConstructionSite = creep.pos.findClosestByPath(FIND_CONSTRUCTION_SITES);


                if (closestRepairSite != undefined && closestRepairSite != null) {
                    //go reapir
                    creep.task = Tasks.repair(closestRepairSite);
                    creep.say("repairing")

                } else if (closestConstructionSite != undefined && closestConstructionSite != null) {
                    //go build
                    creep.task = Tasks.build(closestConstructionSite);
                    creep.say("building");

                } else {
                    //if nothing is to be built, do something useful

                    //Find the closest damaged Structure
                    var targets = creep.room.find(FIND_STRUCTURES, {
                        filter: (s) =>
                            (s.hits < s.hitsMax) &&
                            s.structureType != STRUCTURE_CONTROLLER &&
                            s.structureType != STRUCTURE_EXTENSION &&
                            s.structureType != STRUCTURE_TOWER &&
                            s.structureType != STRUCTURE_WALL &&
                            s.structureType != STRUCTURE_SPAWN
                    });

                    if (targets != undefined) {
                        target = targets.sort(function (a, b) {
                            return +a.hits - +b.hits
                        })[0];
                        if (target) {
                            creep.task = Tasks.repair(target);
                            creep.say("repairing")
                        }
                    } else {
                        //add code to repair walls to 1mil hits
                        if (creep.room.storage != undefined) {
                            if (creep.room.storage.store[RESOURCE_ENERGY] > 300000) {
                                var targets = creep.room.find(FIND_STRUCTURES, {
                                    filter: (s) =>
                                        (s.hits < 1000000) && s.structureType == STRUCTURE_WALL
                                });

                                if (target != undefined) {
                                    target = targets.sort(function (a, b) {
                                        return +a.hits - +b.hits
                                    })[0];
                                    if (target) {
                                        creep.task = Tasks.repair(target);
                                        creep.say("repairing")
                                    }
                                } else {
                                    creep.say("nothing to do")
                                    creep.task = Tasks.upgrade(creep.room.controller);
                                }
                            } else {
                                creep.say("nothing to do")
                                creep.task = Tasks.upgrade(creep.room.controller);
                            }
                        } else {
                            creep.say("nothing to do")
                            creep.task = Tasks.upgrade(creep.room.controller);
                        }


                    }
                }


            } else {
                var container;
                //look for storage
                if (creep.room.storage != undefined) {
                    if (creep.room.storage.store[RESOURCE_ENERGY] > 100) {
                        container = creep.room.storage;
                    } else {
                        //if storage is empty find container
                        container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                            filter: s => s.structureType == STRUCTURE_CONTAINER &&
                                s.store[RESOURCE_ENERGY] > 100
                        });
                    }
                } else {
                    container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
                        filter: s => s.structureType == STRUCTURE_CONTAINER &&
                            s.store[RESOURCE_ENERGY] > 100
                    });
                }

                //add a withraw task
                if (container != undefined && container != null) {
                    creep.task = Tasks.withdraw(container);
                } else {
                    // Harvest from an empty source if there is one, else pick any source
                    /* let sources = creep.room.find(FIND_SOURCES);
                    let unattendedSource = _.filter(sources, source => source.targetedBy.length == 0);
                    if (unattendedSource != undefined && unattendedSource != null) {
                        unattendedSource = creep.pos.findClosestByPath(unattendedSource);
                        creep.task = Tasks.harvest(unattendedSource);
                    } else { */
                    let source = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);
                    if (source != undefined && source != null) {
                        //console.log(creep + " " + source)
                        creep.task = Tasks.harvest(source);
                    }
                    //}
                    creep.say("no energy source")
                }
            }
        }


    }
};