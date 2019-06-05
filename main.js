const stats = require('stats');
var Traveler = require('Traveler');
require("creep-tasks");

// import modules
require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');
require('prototype.room');



module.exports.loop = function () {
    stats.reset()

    // check for memory entries of died creeps by iterating over Memory.creeps
    for (var name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            //TODO: pull lifestats from a creep

            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }

    // for each creeps
    for (var name in Game.creeps) {
            // run creep logic
            Game.creeps[name].runRole();
    }

    // find all towers
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    // for each tower
    for (var tower of towers) {
        // run tower logic
        tower.defend();
    }

    //run every 25 ticks and only when we have spare bucket CPU
    if ((Game.time % 25) == 0 && Game.cpu.bucket > 5000) {

        var allspawns = _.filter(Game.spawns, s => s.structureType == STRUCTURE_SPAWN);
        // check for each spawn the numbers are set
        for (var spawns of allspawns) {

            //console.log("Initializing rooms");

            //put minCreeps in memory
            minCreeps = {};
            //define all the roles and amount
            var numberOfCreeps = {};
            spawns.memory.minCreeps = minCreeps;

            //FOR EACH ROOM AUTOMATIC SETUP

            //miner for number of sources
            var numberOfSources = (spawns.room.find(FIND_SOURCES)).length;
            var creepsInRoom = spawns.room.find(FIND_MY_CREEPS);


            var evolve = numberOfCreeps['miner'] = _.sum(creepsInRoom, (c) => c.memory.role == 'miner');
            spawns.memory.minCreeps.miner = numberOfSources;
            spawns.memory.minCreeps.lorry = numberOfSources + 1;
            spawns.memory.minCreeps.harvester = numberOfSources - evolve;

            //service creeps
            spawns.memory.minCreeps.upgrader = numberOfSources;
            if (spawns.room.storage.isActive) {
                spawns.memory.minCreeps.spawnAttendant = 1;
                spawns.memory.minCreeps.lorry = spawns.memory.minCreeps.lorry - 1;
            }

            //create a builder for construction sites
            var numberOfConstructionSites = (spawns.room.find(FIND_CONSTRUCTION_SITES)).length;
            spawns.memory.minCreeps.builder = _.round(numberOfConstructionSites / 5, 1);

            //create repairer only when needed
            var numberOfRepairSites = (spawns.room.find(FIND_STRUCTURES, {
                filter: (s) =>
                    ((s.hits / s.hitsMax) < 0.5) &&
                    s.structureType != STRUCTURE_CONTROLLER &&
                    s.structureType != STRUCTURE_EXTENSION &&
                    s.structureType != STRUCTURE_TOWER &&
                    s.structureType != STRUCTURE_WALL &&
                    s.structureType != STRUCTURE_SPAWN
            })).length;
            if (numberOfRepairSites >= 5) {
                //spawns.memory.minCreeps.repairer = _.round(numberOfRepairSites / 10, 1);
                spawns.memory.minCreeps.repairer = 1
            }

            //figure when wall repair is needed
            var numberOfRepairWalls = (spawns.room.find(FIND_STRUCTURES, {
                filter: (s) =>
                    (s.hits < 30000) &&
                    s.structureType == STRUCTURE_WALL
            })).length;
            if (numberOfRepairWalls >= 5) {
                spawns.memory.minCreeps.wallRepairer = _.round(numberOfRepairWalls / 10, 1);
            }

            //ROOM SPECIFIC SPAWNING
            if (spawns.room.name == 'W28N14') {
                spawns.memory.minCreeps.claimers = 0
                spawns.memory.minCreeps.LongDistanceHarvester = 4
                spawns.memory.minCreeps.guard = 0
                spawns.memory.booted = true;

                spawns.memory.minLongDistanceHarvesters = {}
                spawns.memory.minLongDistanceHarvesters.W28N13 = 2
                spawns.memory.minLongDistanceHarvesters.W27N14 = 2
                spawns.memory.minLongDistanceHarvesters.W27N15 = 0
                spawns.memory.minLongDistanceBuilders = {}
                spawns.memory.minLongDistanceBuilders.W28N13 = 1
                spawns.memory.minLongDistanceBuilders.W27N14 = 1
                spawns.memory.minGuards = {}
                spawns.memory.minGuards.W27N15 = 0
                spawns.memory.claimer = {};
                spawns.memory.claimer.W28N13 = 0;
                spawns.memory.claimer.W29N14 = 0;
            }

            if (spawns.room.name == "W29N14") {
                spawns.memory.minCreeps.claimers = 0
                spawns.memory.minCreeps.LongDistanceHarvester = 1
                spawns.memory.minCreeps.guard = 0
                spawns.memory.booted = true;

                spawns.memory.minLongDistanceHarvesters = {}
                spawns.memory.minLongDistanceHarvesters.W29N13 = 1
                spawns.memory.minLongDistanceBuilders = {}
                spawns.memory.minLongDistanceBuilders.W29N13 = 1
                spawns.memory.minGuards = {}
                spawns.memory.minGuards.W29N14 = 0
                spawns.memory.claimer = {};
                spawns.memory.claimer.W29N13 = 0;
            }
            //console.log(Game.time+" Room " + spawns.room.name + " initialized!")
        }

        // for each spawn
        for (var spawnName in Game.spawns) {
            // run spawn logic
            for (var spawns of allspawns) {
                Game.spawns[spawnName].spawnCreepsIfNecessary();
            }
        }
    }

    //check for new tasks everywhere
/*     if ((Game.time % 5) == 0 && Game.cpu.bucket > 5000) {
        for (var roomName in Game.rooms) {
            var roomName = Game.rooms[roomName];
            //find possible sources in room
            var energySources = roomName.find(FIND_STRUCTURES, {
                filter: (s) =>
                    s.structureType == STRUCTURE_CONTAINER ||
                    //s.structureType == STRUCTURE_LINK ||
                    s.structureType == STRUCTURE_TERMINAL
                //|| s.structureType == STRUCTURE_STORAGE
            });
            //add dropped resources
            //energySources = energySources.concat(roomName.find(FIND_DROPPED_RESOURCES));

            //check if memory for room exists
            if (roomName.memory.tasks == undefined) {
                roomName.memory.tasks = {};
            }

            if (energySources !== undefined && energySources.length > 0) {
                //console.log(roomName + " " + JSON.stringify(energySources))
                for (var energySource of energySources) {
                    //check if the task is not currently present

                    if (!roomName.getExistingTransportTask(roomName, energySource)) {
                        //add transport task
                        roomName.addTransportTask(roomName, energySource);
                    }
                }
            }

        }
    } */


    //new task system
    if ((Game.time % 5) == 0 && Game.cpu.bucket > 5000) {
        //cycle creeps
        for (var creep in Game.creeps) {
            if (creep.isIdle) {
                //give new task
                role = creep.role;
                //creep.newTask()
            } else if (creep.hasValidTask) {
                //run creep
                //creep.run();
            }
        }
    }




    //other stats
    var containers = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: {
            structureType: STRUCTURE_CONTAINER
        }
    });
    var containerStorage = 0;
    for (var container of containers) {
        containerStorage = containerStorage + container.store[RESOURCE_ENERGY];
    }
    Game.spawns['Spawn1'].memory.energy = {};
    Game.spawns['Spawn1'].memory.energy.containerStorage = containerStorage;
    Game.spawns['Spawn1'].memory.energy.containerCount = containers.length;

    stats.addSimpleStat('energy-container', containerStorage);
    stats.addSimpleStat('creep-population', Object.keys(Game.creeps).length);

    stats.commit();
};