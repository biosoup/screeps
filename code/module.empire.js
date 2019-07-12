"use strict";

import "module.empire.task";

class empire {
    constructor(name, shard) {
        this.name = name
        this.shard = Game.shard
        
    }

    runEmpire() {
        /*
        Functions:
        - gather empire status
            - gather colony status
            - gather room inteligence
        - figure out priorities
        - generate empire tasks
        - set empire targets/goals
        - empire wide creep spawning
            - get all empire requests
            - prioritization
            - find the best colony for it
            - put it in colony spawn que
        - gather empire stats
            - from colonies
            - from remotes/interests
            - from creeps
        - publish those stats
        */


    }

    computePriorities(r) {

    }

    computeTasks(r) {

    }

    computeSpawnlist(r) {

    }

    computeSpawnPriorities(r) {

    }

    prepareSegments(args) {
        //open segments, return true when they are ready
        /*
        Known segments:
            0 - bootstrap
            1 - empire info
            2 - roomLayout
            
            99 - backup memory
        */

        //get current time
        var time = Game.time;
        //get segments
        RawMemory.setActiveSegments(args);
        //return tick when they are ready
        return time + 1;
    }

    refreshEmpireInfo() {
        //get current colonies

        //get global information
        //  gpl, cpu, bucket, etc

        var gpl = Game.gpl.level
        var gplProgressLeft = Game.gpl.progressTotal - Game.gpl.progress;

        var cpu = Game.cpu
        var cpuLeft = Game.cpu.tickLimit


    }

    refreshColonyInfo(colonyName) {
        //get all rooms belonging to colony

        //iterate through those with vision
        //  check if something is on the way to others? send scout?

        //combined stats
    }

    refreshRoomInfo(roomName) {
        //get individual room info

        //sources, containers

        //enemies

        //refresh longer data
        //  roomArray, roomLayout
    }

    refreshRoomLayout(r) {
        //puts room layout into segment
    }

    refreshRoomArray(r) {
        // puts room structures IDs into memory

        let roomCreeps = Game.rooms[r].find(FIND_MY_CREEPS);
        var refresh = false;

        //  Refresher
        if (Game.rooms[r].controller != undefined && Game.rooms[r].controller.owner != undefined && Game.rooms[r].controller.owner.username == playerUsername && Game.rooms[r].memory.roomArray == undefined) {
            Game.rooms[r].memory.roomArray = {};
        } else if (Game.rooms[r].memory.roomArray == undefined && Game.rooms[r].controller != undefined && roomCreeps > 0) {
            Game.rooms[r].memory.roomArray = {};
        } else if (refresh == true) {
            Game.rooms[r].memory.roomArray = {};
        }

        var searchResult;
        if (roomCreeps > 0 || (Game.rooms[r].controller != undefined &&
                Game.rooms[r].controller.owner != undefined &&
                Game.rooms[r].controller.owner.username == playerUsername) ||
            Game.rooms[r].memory.roomArray == undefined) {

            if (Game.rooms[r].memory.roomArray == undefined) {
                Game.rooms[r].memory.roomArray = {};
            }

            // Preloading room structure
            if (Game.rooms[r].memory.roomArraySources != undefined) {
                delete Game.rooms[r].memory.roomArraySources;
            }
            var sourceIDs = [];
            searchResult = Game.rooms[r].find(FIND_SOURCES);
            for (let s in searchResult) {
                sourceIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.sources = sourceIDs;

            if (Game.rooms[r].memory.roomArrayMinerals != undefined) {
                delete Game.rooms[r].memory.roomArrayMinerals;
            }
            var mineralIDs = [];
            searchResult = Game.rooms[r].find(FIND_MINERALS);
            for (let s in searchResult) {
                mineralIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.minerals = mineralIDs;

            if (Game.rooms[r].memory.roomArrayContainers != undefined) {
                delete Game.rooms[r].memory.roomArrayContainers;
            }
            var containerIDs = [];
            searchResult = Game.rooms[r].find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER
            });
            for (let s in searchResult) {
                containerIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.containers = containerIDs;

            if (Game.rooms[r].memory.roomArrayPowerSpawns != undefined) {
                delete Game.rooms[r].memory.roomArrayPowerSpawns;
            }
            var powerSpawnIDs = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_POWER_SPAWN
            });
            for (let s in searchResult) {
                powerSpawnIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.powerSpawns = powerSpawnIDs;

            if (Game.rooms[r].memory.roomArraySpawns != undefined) {
                delete Game.rooms[r].memory.roomArraySpawns;
            }
            var spawnIDs = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_SPAWN
            });
            for (let s in searchResult) {
                spawnIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.spawns = spawnIDs;

            if (Game.rooms[r].memory.roomArrayExtensions != undefined) {
                delete Game.rooms[r].memory.roomArrayExtensions;
            }
            var extensionIDs = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_EXTENSION
            });
            for (let s in searchResult) {
                extensionIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.extensions = extensionIDs;

            if (Game.rooms[r].memory.roomArrayLinks != undefined) {
                delete Game.rooms[r].memory.roomArrayLinks;
            }
            var LinkIDs = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LINK
            });
            for (let s in searchResult) {
                LinkIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.links = LinkIDs;

            if (Game.rooms[r].memory.roomArrayLabs != undefined) {
                delete Game.rooms[r].memory.roomArrayLabs;
            }
            var LabIDs = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LAB
            });
            for (let s in searchResult) {
                LabIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.labs = LabIDs;

            if (Game.rooms[r].memory.roomArrayExtractors != undefined) {
                delete Game.rooms[r].memory.roomArrayExtractors;
            }
            var ExtractorIDs = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_EXTRACTOR
            });
            for (let s in searchResult) {
                ExtractorIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.extractors = ExtractorIDs;

            if (Game.rooms[r].memory.roomArrayRamparts != undefined) {
                delete Game.rooms[r].memory.roomArrayRamparts;
            }
            var rampartIDs = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_RAMPART
            });
            for (let s in searchResult) {
                rampartIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.ramparts = rampartIDs;

            if (Game.rooms[r].memory.roomArrayNukers != undefined) {
                delete Game.rooms[r].memory.roomArrayNukers;
            }
            var nukerIDs = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_NUKER
            });
            for (let s in searchResult) {
                nukerIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.nukers = nukerIDs;

            if (Game.rooms[r].memory.roomArrayObservers != undefined) {
                delete Game.rooms[r].memory.roomArrayObservers;
            }
            var observerIDs = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_OBSERVER
            });
            for (let s in searchResult) {
                observerIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.observers = observerIDs;

            if (Game.rooms[r].memory.roomArrayTowers != undefined) {
                delete Game.rooms[r].memory.roomArrayTowers;
            }
            var towerIDs = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_TOWER
            });
            for (let s in searchResult) {
                towerIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.towers = towerIDs;

            if (Game.rooms[r].memory.roomArrayLairs != undefined) {
                delete Game.rooms[r].memory.roomArrayLairs;
            }
            var lairIDs = [];
            searchResult = Game.rooms[r].find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_KEEPER_LAIR
            });
            for (let s in searchResult) {
                lairIDs.push(searchResult[s].id);
            }
            Game.rooms[r].memory.roomArray.lairs = lairIDs;
        }

        //Check master spawn
        if (Game.rooms[r].memory.masterSpawn != undefined && Game.getObjectById(Game.rooms[r].memory.masterSpawn) == null) {
            delete Game.rooms[r].memory.masterSpawn;
        }
        if (Game.rooms[r].memory.masterSpawn == undefined && Game.rooms[r].memory.roomArray != undefined && Game.rooms[r].memory.roomArray.spawns != undefined) {
            if (Game.rooms[r].memory.roomArray.spawns.length == 1) {
                Game.rooms[r].memory.masterSpawn = Game.rooms[r].memory.roomArray.spawns[0];
            } else if (Game.rooms[r].memory.roomArray.spawns.length > 1) {
                for (var id in Game.rooms[r].memory.roomArray.spawns) {
                    var testSpawn = Game.getObjectById(Game.rooms[r].memory.roomArray.spawns[id]);
                    if (testSpawn.memory.spawnRole == 1) {
                        Game.rooms[r].memory.masterSpawn = Game.rooms[r].memory.roomArray.spawns[id];
                    }
                }
            }
        }
    }

    spawnListPrioritization(spawnRoom, minimumSpawnOf, numberOf) {

    }

    publishEmpireStats() {

    }
}