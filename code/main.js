// version 0.6
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
const stats = require('tools.stats');
require("tools.creep-tasks");
var Traveler = require('tools.Traveler');
require('functions.game');

// import modules
require('prototype.creep');
require('prototype.tower');
require('prototype.spawn');
require('prototype.room');
var market = require('./module.colony.market');
var spawnLogic = require('module.spawnLogic');

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
        for (let roomName in Game.rooms) {
            if (!_.isEmpty(Game.rooms[roomName].memory.roomArray)) {
                if (!_.isEmpty(Game.rooms[roomName].memory.roomArray.spawns)) {
                    Game.rooms[roomName].creepSpawnRun(Game.rooms[roomName]);
                }
            }
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
        if (!_.isEmpty(Game.rooms[roomName].controller)) {
            if (Game.rooms[roomName].controller.my) {
                //check for hostiles
                var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS, {
                    filter: f => f.owner != "Invader"
                })
                if (hostiles.length > 0) {
                    //activate safemode, when non-invaders get too close to spawn
                    var closeRange = 0;
                    for (var h in hostiles) {
                        //get closest spawn
                        /* var spawnNear = h.pos.findClosestByRange(FIND_MY_SPAWNS)
                        if (spawnNear.pos.isRangeTo(h) > closeRange) {
                            closeRange = spawnNear.pos.isRangeTo(h)
                        } */
                    }
                    console.log("closerange:" + closeRange)

                    //if hostile is closer than 6 -> safemode
                    if (closeRange < 6 && closeRange > 0) {
                        //Game.rooms[roomName].controller.activateSafeMode()
                        console.log("WARNING: Hostile too close!! SAFEMODE!!")
                    } else if (!_.isEmpty(Game.rooms[roomName].storage)) {
                        if (Game.rooms[roomName].storage.store[RESOURCE_ENERGY] > 100000) {
                            //we have energy, do siege mode
                            //TODO: implement siege mode
                        } else {
                            //no energy left, ask for help

                            //get closest other spawns
                            var flagRoomName = roomName
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
                                Game.rooms[roomName].createFlag(25, 25, "DEFEND-" + roomName + "-" + distanceName, COLOR_WHITE, COLOR_YELLOW)
                                console.log(roomName + " in troubles!! Sending response team!!")
                            }
                        }
                    } else {
                        //no avaliable storage and no safe modes –> send response team

                        //get closest other spawns
                        var flagRoomName = roomName
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
                            Game.rooms[roomName].createFlag(25, 25, "DEFEND-" + roomName + "-" + distanceName, COLOR_WHITE, COLOR_YELLOW)
                            console.log(roomName + " in troubles!! Sending response team!!")
                        }
                    }
                }
            }

            if (!_.isEmpty(Game.rooms[roomName].spawns)) {
                var spawningCreep = {}
                for (var s in Game.rooms[roomName].spawns) {
                    var spawnName = Game.rooms[roomName].spawns[s]
                    //if spawning just add visuals
                    if (spawnName.spawning) {
                        spawningCreep[spawnName] = {}
                        spawningCreep[spawnName].name = spawnName.spawning.name;
                        spawningCreep[spawnName].percent = (((spawnName.spawning.needTime - spawnName.spawning.remainingTime) / spawnName.spawning.needTime) * 100).toFixed(2);
                    }
                }
                var i = 0
                if (!_.isEmpty(spawningCreep)) {
                    for (var s in spawningCreep) {
                        Game.rooms[roomName].visual.text(
                            spawningCreep[s].percent + '% '+ spawningCreep[s].name + ' ',
                            spawnName.pos.x - 1,
                            spawnName.pos.y - 10 - i, {
                                size: '0.7',
                                align: 'left',
                                opacity: 0.5,
                                'backgroundColor': '#040404',
                                color: 'white'
                            });
                        i++;
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
            // balance resources
            market.resourceBalance(CPUdebug);
            // terminal transfers
            market.terminalCode(roomName, CPUdebug);

            market.productionCode(roomName);

            market.labCode(roomName);
        }
    }

    //run market code
    market.marketCode();

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
        if ((Game.time % 5) == 0 && Game.cpu.bucket > 100) {
            /* for (let roomName in Game.rooms) {
                
            } */
        }
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