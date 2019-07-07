// version 0.5
const CPUdebug = false;

if (CPUdebug == true) {
    let cpu = Game.cpu.getUsed();
    console.log("CPU@Start: " + cpu + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket);
    global.reqCPU = Game.cpu.getUsed();
    global.start = Game.time;
    console.log('CPU@Initialization: ' + (global.reqCPU - cpu) + " / Tick: " + Game.time + " / Bucket: " + Game.cpu.bucket);
}

//system imports
require('globals')
require('prototype.Room.structures');
//const profiler = require('screeps-profiler');
const stats = require('stats');
require("creep-tasks");
var Traveler = require('Traveler');
require('functions.game');

// import modules
require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');
require('prototype.room');
var market = require('module.market');

// PROFILER
//profiler.enable();

module.exports.loop = function () {
    //profiler.wrap(function () {
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

    //Fill myRooms
    for (let m in myroomlist) {
        myRooms[myroomlist[m].name] = myroomlist[m];
    }

    //run every 25 ticks and only when we have spare bucket CPU
    if ((Game.time % DELAYSPAWNING) == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
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
            if (!_.isEmpty(Game.rooms[roomName].memory.roomArray)) {
                if (!_.isEmpty(Game.rooms[roomName].memory.roomArray.spawns)) {
                    Game.rooms[roomName].creepSpawnRun(Game.rooms[roomName]);
                }
            }
        }
    }

    // for each spawn
    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Start Spawn visualisation Code: " + Game.cpu.getUsed())
    }
    for (var spawnName in Game.spawns) {
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
        CPUdebugString = CPUdebugString.concat("<br>Start Tasks Code: " + Game.cpu.getUsed())
    }
    // ************ NEW TASK SYSTEM ************
    for (let creep in Game.creeps) {
        //if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start Creep"+creep+" work Code: " + Game.cpu.getUsed())}
        //console.log(Game.creeps[creep])

        try {
            //if creep is idle, give him work
            if (Game.creeps[creep].isIdle) {
                Game.creeps[creep].runRole()
            } else if (!Game.creeps[creep].hasValidTask) {
                Game.creeps[creep].runRole()
            }
        } catch (err) {
            Game.creeps[creep].say("RUN ROLE ERR!!")
            console.log("RUN ROLE ERR: " + creep + " " + err.stack)
        }
    }

    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Start Rooms Code: " + Game.cpu.getUsed())
    }
    //go through rooms
    for (let roomName in Game.rooms) {
        var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS, {
            filter: f => f.owner != "Invader"
        })
        var towers = Game.rooms[roomName].towers
        if (!_.isEmpty(Game.rooms[roomName].controller)) {
            if (Game.rooms[roomName].controller.level > 0 && (hostiles.length - (towers.length * 2)) > 0) {
                if (_.isEmpty(Game.rooms[roomName].controller.safeModeCooldown) && _.isEmpty(Game.rooms[roomName].controller.safeMode) && Game.rooms[roomName].controller.safeModeAvailable > 0) {
                    Game.rooms[roomName].controller.activateSafeMode()
                } else if (!_.isEmpty(Game.rooms[roomName].controller.safeModeCooldown) && _.isEmpty(Game.rooms[roomName].controller.safeMode)) {
                    //room on cooldown, but safemode not active

                    //get closest other spawns
                    var flagRoomName = spawnRoom.name
                    var distance = {}
                    for (let roomName in Game.rooms) {
                        var r = Game.rooms[roomName];
                        if (!_.isEmpty(r.memory.roomArray.spawns)) {
                            if (r.name != flagRoomName) {
                                distance[r.name] = {}
                                distance[r.name].name = r.name
                                distance[r.name].dist = Game.map.getRoomLinearDistance(r.name, flagRoomName);
                            }
                        }
                    }
                    distanceName = _.first(_.map(_.sortByOrder(distance, ['dist'], ['asc']), _.values))[0];

                    //check if flag does not exists
                    var whiteFlags = _.filter(Game.flags, (f) => f.color == COLOR_WHITE && _.words(f.name, /[^-]+/g)[1] == Game.rooms[roomName].name)
                    if (_.isEmpty(whiteFlags)) {
                        //set a flag
                        spawnRoom.createFlag(25, 25, "DEFEND-" + spawnRoom.name + "-" + distanceName, COLOR_WHITE, COLOR_YELLOW)
                        console.log(spawnRoom.name + " in troubles!! Sending response team!!")
                    }
                } else {
                    //no avaliable safe modes –> send response team

                    //get closest other spawns
                    var flagRoomName = spawnRoom.name
                    var distance = {}
                    for (let roomName in Game.rooms) {
                        var r = Game.rooms[roomName];
                        if (!_.isEmpty(r.memory.roomArray.spawns)) {
                            if (r.name != flagRoomName) {
                                distance[r.name] = {}
                                distance[r.name].name = r.name
                                distance[r.name].dist = Game.map.getRoomLinearDistance(r.name, flagRoomName);
                            }
                        }
                    }
                    distanceName = _.first(_.map(_.sortByOrder(distance, ['dist'], ['asc']), _.values))[0];

                    //check if flag does not exists
                    var whiteFlags = _.filter(Game.flags, (f) => f.color == COLOR_WHITE && _.words(f.name, /[^-]+/g)[1] == Game.rooms[roomName].name)
                    if (_.isEmpty(whiteFlags)) {
                        //set a flag
                        spawnRoom.createFlag(25, 25, "DEFEND-" + spawnRoom.name + "-" + distanceName, COLOR_WHITE, COLOR_YELLOW)
                        console.log(spawnRoom.name + " in troubles!! Sending response team!!")
                    }
                }
            }
        }

        if ((Game.time % DELAYFLOWROOMCHECK) == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
            //refresh room data
            Game.rooms[roomName].refreshData(roomName)
        }

        //run link balancing
        if ((Game.time % DELAYLINK) == 0 && Game.cpu.bucket > CPU_THRESHOLD) {
            Game.rooms[roomName].linksRun(roomName)

            Game.rooms[roomName].refreshContainerSources(roomName)
        }

        // find all towers
        var towers = Game.rooms[roomName].towers
        if (!_.isEmpty(towers)) {
            //find hostiles in the room
            var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
            if (hostiles.length > 0) {
                for (var tower of towers) {
                    var closestTarget = tower.pos.findClosestByRange(hostiles)
                    // all towers attack
                    tower.attack(closestTarget);
                }
            } else {
                for (var tower of towers) {
                    tower.healCreeps();
                }
            }

            if (_.isEmpty(hostiles)) {
                for (var tower of towers) {
                    //no hostiles, one tower to repair
                    tower.repairStructures();
                }
            }
        }

        // default resource limits
        market.resourceLimits(roomName);
        // market buy and auto sell
        market.marketCode(CPUdebug);
        // balance resources
        market.resourceBalance(CPUdebug);
        // terminal transfers
        market.terminalCode(roomName, CPUdebug);

        market.productionCode(roomName);

        market.labCode(roomName);
    }

    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Start Creep run Code: " + Game.cpu.getUsed())
    }
    // Now that all creeps have their tasks, execute everything
    for (let creep in Game.creeps) {
        //if (CPUdebug == true) {CPUdebugString = CPUdebugString.concat("<br>Start Creep"+creep+" run Code: " + Game.cpu.getUsed())}

        //console.log(creep)
        try {
            Game.creeps[creep].run();
        } catch (err) {
            Game.creeps[creep].say("MAIN ERR!!")
            console.log("MAIN ERR: " + creep + " at: " + err.stack)
            Game.creeps[creep].task = {}
        }
    }

    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Start stats Code: " + Game.cpu.getUsed())
    }
    //other stats
    //var elapsedInSeconds = ((new Date()).getTime() - Memory.stats.lastTS) / 1000
    if ((Game.time % 10) == 0 && Game.cpu.bucket > 100) {
        var spawnBusy = {};
        for (var spawnName in Game.spawns) {
            if (Game.spawns[spawnName].spawning) {
                spawnBusy[Game.spawns[spawnName].name] = Game.spawns[spawnName].spawning.needTime - Game.spawns[spawnName].spawning.remainingTime;
            } else {
                spawnBusy[Game.spawns[spawnName].name] = 0;
            }
        }
        stats.addStat('spawn-busy', {}, spawnBusy)

        var containerStats = {};
        var hostilesStats = {};
        var countHostiles = 0;
        for (var roomName in Game.rooms) {
            var containers = Game.rooms[roomName].containers
            var containerStorage = 0;
            if (!_.isEmpty(containers)) {
                for (var container of containers) {
                    containerStorage = containerStorage + container.store[RESOURCE_ENERGY];
                }
                containerStats[Game.rooms[roomName].name] = containerStorage;
            }
            var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
            if (hostiles.length > 0) {
                countHostiles = countHostiles + hostiles.length
                hostilesStats[Game.rooms[roomName].name] = hostiles.length
            }
        }
        stats.addStat('energy-container', {}, containerStats)
        stats.addStat('hostiles-room', {}, hostilesStats)

        //check for hostiles in any room
        stats.addSimpleStat('hostiles', countHostiles);
        stats.addSimpleStat('creep-population', Object.keys(Game.creeps).length);

        stats.commit();
    }


    /* *** TEST SPACE *** */

    try {


    } catch (err) {
        console.log("ERR: " + err)
    }
    //var closeSpawn = spawnName.findClosestByRange(Game.spawns, {filter: s=> s.room.name != spawnName.room.name})
    //console.log(JSON.stringify(closeSpawn))


    if (CPUdebug == true) {
        CPUdebugString = CPUdebugString.concat("<br>Finish: " + Game.cpu.getUsed());
        console.log(CPUdebugString);
    }
    //});
};