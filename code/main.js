// version 0.2

const stats = require('stats');
require("creep-tasks");
var Traveler = require('Traveler');


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

    // find all towers
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    //console.log(JSON.stringify(towers))

    //find hostiles
    // for each tower
    for (var tower of towers) {
        var hostiles = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if (hostiles != null) {
            tower.defend(hostiles);
        } else if (hostiles == null) {
            //if there are no hostiles....
            tower.healCreeps();
            tower.repairStructures();
        }
    }

    //run every 25 ticks and only when we have spare bucket CPU
    if ((Game.time % 5) == 0 && Game.cpu.bucket > 5000) {

        var allspawns = _.filter(Game.spawns, s => s.structureType == STRUCTURE_SPAWN);
        // check for each spawn the numbers are set
        for (var spawns of allspawns) {
            //put minCreeps in memory
            minCreeps = {};
            //define all the roles and amount
            var numberOfCreeps = {};
            spawns.memory.minCreeps = minCreeps;

            //FOR EACH ROOM AUTOMATIC SETUP

            //miner for number of sources
            var numberOfSources = (spawns.room.find(FIND_SOURCES)).length;
            var creepsInRoom = spawns.room.find(FIND_MY_CREEPS);
            var numberOfConstructionSites = spawns.room.find(FIND_CONSTRUCTION_SITES);

            var evolve = numberOfCreeps['miner'] = _.sum(creepsInRoom, (c) => c.memory.role == 'miner');
            spawns.memory.minCreeps.miner = numberOfSources;
            spawns.memory.minCreeps.lorry = numberOfSources;
            spawns.memory.minCreeps.harvester = 1 - evolve; //numberOfSources - evolve;

            //service creeps
            if (spawns.room.storage.store[RESOURCE_ENERGY] > 5000) {
                spawns.memory.minCreeps.spawnAttendant = 1;
            }

            //create builder when construction is needed
            if (numberOfConstructionSites.length > 0) {
                spawns.memory.minCreeps.builder = 1;
            }

            //upgraders
            //make sure it is big enough - up to 15 work parts
            if (spawns.room.storage !== undefined) {
                if(spawns.room.storage.store[RESOURCE_ENERGY] > 200000) {
                    spawns.memory.minCreeps.upgrader = 2;
                } else {
                    spawns.memory.minCreeps.upgrader = 1;
                }
            }

            //ROOM SPECIFIC SPAWNING
            if (spawns.room.name == 'W28N14') {
                spawns.memory.minCreeps.mineralHarvester = 0;

                spawns.memory.minCreeps.claimers = 3
                spawns.memory.booted = true;

                spawns.memory.minLongDistanceMiners = {}
                spawns.memory.minLongDistanceMiners.W28N13 = 2 //2
                spawns.memory.minLongDistanceMiners.W28N15 = 0 //1
                spawns.memory.minLongDistanceMiners.W27N15 = 1 //1
                spawns.memory.minLongDistanceMiners.W27N14 = 0 //1

                spawns.memory.minLongDistanceLorries = {}
                spawns.memory.minLongDistanceLorries.W28N13 = 2 //1
                spawns.memory.minLongDistanceLorries.W28N15 = 0 //1
                spawns.memory.minLongDistanceLorries.W27N15 = 1 //1
                spawns.memory.minLongDistanceLorries.W27N14 = 0 //1

                spawns.memory.minLongDistanceHarvesters = {}
                spawns.memory.minLongDistanceHarvesters.W28N13 = 0 //2
                spawns.memory.minLongDistanceHarvesters.W27N14 = 0 //2 */
                

                spawns.memory.minLongDistanceBuilders = {}
                spawns.memory.minLongDistanceBuilders.W28N13 = 1
                spawns.memory.minLongDistanceBuilders.W27N14 = 1
                spawns.memory.minLongDistanceBuilders.W28N15 = 1 //1
                spawns.memory.minLongDistanceBuilders.W27N15 = 1 //1

                spawns.memory.minGuards = {}
                spawns.memory.minGuards.W27N14 = 0
                spawns.memory.minGuards.W27N15 = 0
                spawns.memory.minGuards.W28N13 = 0

                spawns.memory.claimer = {};
                spawns.memory.claimer.W28N13 = 1;
                spawns.memory.claimer.W27N14 = 1;
                spawns.memory.claimer.W27N15 = 1;
                spawns.memory.claimer.W28N15 = 1;

            }

            if (spawns.room.name == "W29N14") {
                spawns.memory.minCreeps.mineralHarvester = 0;

                spawns.memory.minCreeps.claimers = 0
                spawns.memory.booted = true;

                spawns.memory.minLongDistanceHarvesters = {}
                spawns.memory.minLongDistanceHarvesters.W29N13 = 1
                spawns.memory.minLongDistanceHarvesters.W29N15 = 2

                spawns.memory.minLongDistanceBuilders = {}
                spawns.memory.minLongDistanceBuilders.W29N13 = 1

                spawns.memory.minGuards = {}
                spawns.memory.minGuards.W29N13 = 1

                spawns.memory.claimer = {};
                spawns.memory.claimer.W29N13 = 0;
            }

            var hostiles = spawns.room.find(FIND_HOSTILE_CREEPS);
            if (hostiles.length > 1) {
                spawns.memory.minCreeps.claimers = 0
                spawns.memory.minCreeps.LongDistanceHarvester = 0
                spawns.memory.minCreeps.guard = 2
                spawns.memory.booted = true;

                spawns.memory.minGuards = {}
                spawns.memory.minGuards.W27N14 = 2

                spawns.memory.minLongDistanceHarvesters = {}
                spawns.memory.minLongDistanceBuilders = {}
                spawns.memory.claimer = {};
                console.log("Base defense spawning protocol!!" + hostiles.length)
            }
            //console.log(Game.time+" Room " + spawns.room.name + " initialized!")
        }

        // for each spawn
        for (var spawnName in Game.spawns) {
            // run spawn logic
            Game.spawns[spawnName].spawnCreepsIfNecessary();
        }
    }

    // ************ NEW TASK SYSTEM ************
    for (let creep in Game.creeps) {
        //if creep is idle, give him work
        if (Game.creeps[creep].isIdle) {
            Game.creeps[creep].runRole()
        } else if (!Game.creeps[creep].hasValidTask) {
            Game.creeps[creep].runRole()
        }

    }

    // Now that all creeps have their tasks, execute everything
    for (let creep in Game.creeps) {
        //console.log(creep)
        Game.creeps[creep].run();
    }


    //other stats
    for (var spawnName in Game.spawns) {
        var containers = Game.spawns[spawnName].room.find(FIND_STRUCTURES, {
            filter: {
                structureType: STRUCTURE_CONTAINER
            }
        });
        var containerStorage = 0;
        for (var container of containers) {
            containerStorage = containerStorage + container.store[RESOURCE_ENERGY];
        }
        Game.spawns[spawnName].memory.energy = {};
        Game.spawns[spawnName].memory.energy.containerStorage = containerStorage;
        Game.spawns[spawnName].memory.energy.containerCount = containers.length;

        stats.addSimpleStat(spawnName + ' energy-container', containerStorage);
    }


    stats.addSimpleStat('creep-population', Object.keys(Game.creeps).length);

    stats.commit();
};