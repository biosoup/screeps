// version 0.3
const CPUdebug = false;

if (CPUdebug == true) {
    let cpu = Game.cpu.getUsed();
    console.log("CPU@Start: " + cpu + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket);
    global.reqCPU = Game.cpu.getUsed();
    global.start = Game.time;
    console.log('CPU@Initialization: ' + (global.reqCPU - cpu) + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket);
}

//system imports
const stats = require('stats');
require("creep-tasks");
var Traveler = require('Traveler');
require('globals')

//to be implemented into my code - mainly Terminal code
require('functions.game');

// import modules
require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');
require('prototype.room');

module.exports.loop = function () {
    stats.reset()

    let cpu = Game.cpu.getUsed();
    if (Game.time == global.start) {
        cpu -= global.reqCPU;
    }
    if (cpu >= 35) {
        console.log("<font color=#ff0000 type='highlight'>CPU@LoopStart: " + cpu + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket + "</font>");
    }

    // check for memory entries of died creeps by iterating over Memory.creeps
    for (var name in Memory.creeps) {
        // and checking if the creep is still alive
        if (Game.creeps[name] == undefined) {
            //TODO: pull lifestats from a creep

            // if not, delete the memory entry
            delete Memory.creeps[name];
        }
    }

    var CPUdebugString = "CPU Debug<br><br>";
    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Start: " + Game.cpu.getUsed())
    }

    // find all towers
    var towers = _.filter(Game.structures, s => s.structureType == STRUCTURE_TOWER);

    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Start Tower Code: " + Game.cpu.getUsed())
    }
    // for each tower
    for (var tower of towers) {
        //find hostiles
        var hostiles = tower.pos.findClosestByRange(FIND_HOSTILE_CREEPS);

        if (hostiles != null) {
            tower.defend(hostiles);
        } else if (hostiles == null) {
            //if there are no hostiles....
            tower.healCreeps();
            if ((Game.time % 7) == 0 && Game.cpu.bucket > 5000) {
                tower.repairStructures();
            }
        }
    }

    //run every 25 ticks and only when we have spare bucket CPU
    if ((Game.time % 5) == 0 && Game.cpu.bucket > 5000) {
        if (CPUdebug == true) {
            CPUdebugString = CPUdebugString.concat("<br>Start Spawn Code: " + Game.cpu.getUsed())
        }
        // for each spawn
        /* for (var spawnName in Game.spawns) {
            //update minimum number of creeps
            Game.spawns[spawnName].creepSpawnCounts(Game.spawns[spawnName]);
            // run spawn logic
            Game.spawns[spawnName].spawnCreepsIfNecessary();
        } */

        for (let roomName in Game.rooms) {
            Game.rooms[roomName].creepSpawnRun(Game.rooms[roomName]);
        }
    }

    // for each spawn
    for (var spawnName in Game.spawns) {
        if (CPUdebug == true) {
            CPUdebugString = CPUdebugString.concat("<br>Start Spawn visualisation Code: " + Game.cpu.getUsed())
        }
        //if spawning just add visuals
        if (Game.spawns[spawnName].spawning) {
            var spawningCreep = Game.creeps[Game.spawns[spawnName].spawning.name];
            var Percentage = (((Game.spawns[spawnName].spawning.needTime - Game.spawns[spawnName].spawning.remainingTime) / Game.spawns[spawnName].spawning.needTime) * 100).toFixed(2);
            var symbol = '\uD83D\uDEA7';
            Game.spawns[spawnName].room.visual.text(
                symbol + spawningCreep.memory.role + ' ' + Percentage + '%',
                Game.spawns[spawnName].pos.x - 1,
                Game.spawns[spawnName].pos.y - 10, {
                    size: '0.7',
                    align: 'left',
                    opacity: 0.5,
                    'backgroundColor': '#040404',
                    color: 'white'
                });
        }
    }

    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Start Rooms Code: " + Game.cpu.getUsed())
    }
    //go through rooms
    for (let roomName in Game.rooms) {
        if ((Game.time % 57) == 0 && Game.cpu.bucket > 5000) {
            //refresh room data
            Game.rooms[roomName].refreshData(roomName)
        }

        //run link balancing
        if ((Game.time % 3) == 0 && Game.cpu.bucket > 5000) {
            Game.rooms[roomName].linksRun(roomName)
        }
    }




    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Start Tasks Code: " + Game.cpu.getUsed())
    }
    // ************ NEW TASK SYSTEM ************
    for (let creep in Game.creeps) {
        //if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start Creep"+creep+" work Code: " + Game.cpu.getUsed())}

        //if creep is idle, give him work
        if (Game.creeps[creep].isIdle) {
            Game.creeps[creep].runRole()
        } else if (!Game.creeps[creep].hasValidTask) {
            Game.creeps[creep].runRole()
        }

    }

    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Start Creep run Code: " + Game.cpu.getUsed())
    }
    // Now that all creeps have their tasks, execute everything
    for (let creep in Game.creeps) {
        //if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start Creep"+creep+" run Code: " + Game.cpu.getUsed())}

        //console.log(creep)
        Game.creeps[creep].run();
    }



    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Start stats Code: " + Game.cpu.getUsed())
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

        stats.addSimpleStat(Game.spawns[spawnName].room.name + '-energy-container', containerStorage);
        //console.log(Game.spawns[spawnName].room.name + ' energy-container')
    }

    //check for hostiles in any room
    var countHostiles = 0;
    for (let roomName in Game.rooms) {
        var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
        if (hostiles.length > 0) {
            //console.log(roomName + " found hostiles: " + hostiles.length)
            countHostiles = countHostiles + hostiles.length
        }
    }
    stats.addSimpleStat('hostiles', countHostiles);


    stats.addSimpleStat('creep-population', Object.keys(Game.creeps).length);

    stats.commit();

    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Finish: " + Game.cpu.getUsed());
        console.log(CPUdebugString);
    }
};