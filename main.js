const stats = require('stats');

// import modules
require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');



module.exports.loop = function () {
    stats.reset()

    // check for memory entries of died creeps by iterating over Memory.creeps
    for (let name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }

    var allspawns = _.filter(Game.spawns, s => s.structureType == STRUCTURE_SPAWN);
    // check for each spawn the numbers are set
    for (let spawns of allspawns) {
        if (spawns.memory.booted != true) {
            //console.log(2);
            //put minCreeps in memory
            minCreeps = {};
            //define all the roles and amount
            let numberOfCreeps = {};
            let creepsInRoom = spawns.room.find(FIND_MY_CREEPS);
            var evolve = numberOfCreeps['miner'] = _.sum(creepsInRoom, (c) => c.memory.role == 'miner');
            spawns.memory.minCreeps = minCreeps;
            spawns.memory.minCreeps.upgrader = 2
            spawns.memory.minCreeps.builder = 2
            spawns.memory.minCreeps.repairer = 1
            spawns.memory.minCreeps.wallRepairer = 0
            spawns.memory.minCreeps.claimer = 0
            spawns.memory.minCreeps.LongDistanceHarvester = 4
            spawns.memory.minCreeps.miner = 2
            spawns.memory.minCreeps.harvester = 3 - evolve
            spawns.memory.minCreeps.lorry = 2
            spawns.memory.booted = true;
            spawns.memory.minLongDistanceHarvesters = {}
            spawns.memory.minLongDistanceHarvesters.W28N13 = 2
            spawns.memory.minLongDistanceHarvesters.W27N14 = 2
        }
        
        //what do want to claim/reserve
        /*
        if (Game.time % 900 === 0) {
            spawns.memory.minCreeps.claimer = 1
            spawns.memory.claimRoom = "W28N13";
        }*/
    }
    
    

    // for each creeps
    for (let name in Game.creeps) {
        // run creep logic
        Game.creeps[name].runRole();
    }

    // find all towers
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);
    // for each tower
    for (let tower of towers) {
        // run tower logic
        tower.defend();
    }

    // for each spawn
    for (let spawnName in Game.spawns) {
        // run spawn logic
        for (let spawns of allspawns) {
            Game.spawns[spawnName].spawnCreepsIfNecessary();
        }
    }

    //console.log("test");

    //other stats
    let containers = Game.spawns['Spawn1'].room.find(FIND_STRUCTURES, {
        filter: {structureType: STRUCTURE_CONTAINER}  });
    var containerStorage = 0;
    for (let container of containers) {
        containerStorage = containerStorage + container.store[RESOURCE_ENERGY];
    }
    Game.spawns['Spawn1'].memory.energy = {};
    Game.spawns['Spawn1'].memory.energy.containerStorage = containerStorage;
    Game.spawns['Spawn1'].memory.energy.containerCount = containers.length;
    stats.addSimpleStat('energy-container', containerStorage);
    stats.addSimpleStat('creep-population', Object.keys(Game.creeps).length);

    stats.commit()
};
