"use strict";

/** ADD
- structure placement
    - road building system for main room
    - bunker around spawn
*/

//import the base blueprints
require("module.colony.autobuild.buildings");

Room.prototype.roomEconomy = function () {
    let cpuStart = Game.cpu.getUsed();
    var rcl = this.controller.level

    if (rcl == 0) {
        //run only in relevant rooms
        return null
    }

    var numberOfSources = this.find(FIND_SOURCES).length

    var maxEnergyIncome = (numberOfSources * SOURCE_ENERGY_CAPACITY) / ENERGY_REGEN_TIME //max 20 e/t

    //in room miners
    var numberOfMiners = _.filter(Game.creeps, (c) => c.memory.home == this.name && c.memory.role == "miner");
    //var miningPerTick = _.countBy(buildingPlans.miner[rcl].body).work * HARVEST_POWER
    var miningPerTickMax = (numberOfMiners.length * SOURCE_ENERGY_CAPACITY) / ENERGY_REGEN_TIME

    //remote miners
    var numberOfRemoteMiners = _.filter(Game.creeps, (c) => c.memory.home == this.name && c.memory.role == "longDistanceMiner");
    //var remoteMiningPerTick = _.countBy(buildingPlans.longDistanceMiner[rcl].body).work * HARVEST_POWER
    var remoteMiningPerTickMax = (numberOfRemoteMiners.length * SOURCE_ENERGY_CAPACITY) / ENERGY_REGEN_TIME

    var numberOfRoads = this.find(FIND_STRUCTURES, {
        filter: (f) => f.structureType == STRUCTURE_ROAD
    }).length
    var roadDecay = (numberOfRoads * ROAD_DECAY_AMOUNT) / ROAD_DECAY_TIME / REPAIR_POWER //without wearout, non spawm roads only

    var numberOfRamparts = this.find(FIND_STRUCTURES, {
        filter: (f) => f.structureType == STRUCTURE_RAMPART
    }).length
    var rampartsDecay = (numberOfRamparts * RAMPART_DECAY_AMOUNT) / RAMPART_DECAY_TIME / REPAIR_POWER

    var numberOfContainers = this.find(FIND_STRUCTURES, {
        filter: (f) => f.structureType == STRUCTURE_CONTAINER
    }).length
    var containersDecay = (numberOfContainers * CONTAINER_DECAY) / CONTAINER_DECAY_TIME_OWNED / REPAIR_POWER



    //energy needed for construction
    var constructions = this.find(FIND_CONSTRUCTION_SITES)
    var constructionCost = _.sum(constructions, "progressTotal") - _.sum(constructions, "progress")

    //energy needed for walls
    var numberOfWallRepairers = _.filter(Game.creeps, (c) => c.memory.home == this.name && (c.memory.role == "wallRepairer" || c.memory.role == "builder"));
    if (!_.isEmpty(buildingPlans.wallRepairer[rcl])) {
        var fortifyPerTickMax = _.countBy(buildingPlans.wallRepairer[rcl].body).work * REPAIR_POWER
        var fortifyCostPerTick = _.countBy(buildingPlans.wallRepairer[rcl].body).work //costs one nergy per work part
    } else {
        var fortifyPerTickMax = 0
        var fortifyCostPerTick = 0
    }
    var structuresToBeFortified = this.find(FIND_STRUCTURES, {
        filter: (f) => f.structureType == STRUCTURE_WALL || f.structureType == STRUCTURE_RAMPART
    })
    var fortifyWorkLeft = (structuresToBeFortified.length * WALLMAX) - _.sum(structuresToBeFortified, "hits")
    var fortifyWorkLeftTicks = fortifyWorkLeft / fortifyPerTickMax
    if (fortifyWorkLeftTicks < 0) {
        fortifyWorkLeftTicks = 0
    }

    //rcl
    var praiseLeft = this.controller.progressTotal - this.controller.progress

    var oldProgress = this.memory.RCLprogress
    var amountPraisedLastTick = this.controller.progress - oldProgress
    this.memory.RCLprogress = this.controller.progress

    //aproximate amount energy avalible per tick
    var energySurpluss = miningPerTickMax + remoteMiningPerTickMax - roadDecay - rampartsDecay - containersDecay - (numberOfWallRepairers.length * fortifyCostPerTick)

    //storage
    if (!_.isEmpty(this.storage)) {
        var storageEnergy = this.storage.store[RESOURCE_ENERGY]
        var storageTarget = MINSURPLUSENERGY * rcl
        var ticksToStorageTarget = ((storageTarget - storageEnergy) / energySurpluss).toFixed(2)
    }

    this.visual.text("Room: energy production: " + (remoteMiningPerTickMax + miningPerTickMax) + " with " + numberOfRemoteMiners.length + " remote miners",
        2, 5, {
            size: '0.7',
            align: 'left',
            opacity: 0.5,
            'backgroundColor': '#040404',
            color: 'white'
        });
    this.visual.text("Roads: " + roadDecay.toFixed(2) + " | Ramparts: " + rampartsDecay.toFixed(2) + " | Containers: " + containersDecay.toFixed(2) + " | F/R/B: " + (numberOfWallRepairers.length * fortifyCostPerTick).toFixed(2),
        2, 6, {
            size: '0.7',
            align: 'left',
            opacity: 0.5,
            'backgroundColor': '#040404',
            color: 'white'
        });
    this.visual.text("Energy surpluss: " + energySurpluss.toFixed(2) + " | construction cost left: " + constructionCost + " | fortify left: " + fortifyWorkLeftTicks.toFixed(2) + " ticks",
        2, 7, {
            size: '0.7',
            align: 'left',
            opacity: 0.5,
            'backgroundColor': '#040404',
            color: 'white'
        });
    this.visual.text("RCL Praise left: " + praiseLeft.toFixed(2) + " (" + (praiseLeft / energySurpluss).toFixed(2) + " ticks) | Praised last tick: " + amountPraisedLastTick + " (" + (praiseLeft / amountPraisedLastTick).toFixed(2) + " ticks)",
        2, 8, {
            size: '0.7',
            align: 'left',
            opacity: 0.5,
            'backgroundColor': '#040404',
            color: 'white'
        });
    this.visual.text("Storage energy target: " + storageTarget + " | Ticks to reach: " + ticksToStorageTarget + " | (CPU used: " + (Game.cpu.getUsed() - cpuStart).toFixed(2) + ")",
        2, 9, {
            size: '0.7',
            align: 'left',
            opacity: 0.5,
            'backgroundColor': '#040404',
            color: 'white'
        });

    return energySurpluss;
}

Room.prototype.countDefences = function () {
    var structures = this.find(FIND_STRUCTURES, {
        filter: (f) => f.structureType == STRUCTURE_WALL || f.structureType == STRUCTURE_RAMPART
    })
    return structures.length
}

Room.prototype.basicVisuals = function () {
    var rcl = this.controller.level
    var rclPercent = (this.controller.progress / this.controller.progressTotal * 100).toFixed(2)
    var rclLeft = (this.controller.progressTotal - this.controller.progress).toFixed(2)
    var gcl = Game.gcl.level
    var gclPercent = (Game.gcl.progress / Game.gcl.progressTotal * 100).toFixed(2)
    var gclLeft = (Game.gcl.progressTotal - Game.gcl.progress).toFixed(2)

    this.visual.text("GCL: level " + gcl + " | " + gclPercent + "% progress left: " + gclLeft, 2, 2, {
        size: '0.7',
        align: 'left',
        opacity: 0.5,
        'backgroundColor': '#040404',
        color: 'white'
    });

    this.visual.text("RCL: level " + rcl + " | " + rclPercent + "% progress left: " + rclLeft, 2, 3, {
        size: '0.7',
        align: 'left',
        opacity: 0.5,
        'backgroundColor': '#040404',
        color: 'white'
    });

    if (!_.isEmpty(this.spawns)) {
        var spawningCreep = {}
        for (var s in this.spawns) {
            var spawnName = this.spawns[s]
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
                this.visual.text(
                    spawningCreep[s].percent + '% ' + spawningCreep[s].name + ' ', 47, 2 + i, {
                        size: '0.7',
                        align: 'right',
                        opacity: 0.5,
                        'backgroundColor': '#040404',
                        color: 'white'
                    });
                i++;
            }
        }
    }
}

Room.prototype.buildRoad = function (from, to) {
    //requires two IDs
    var origin = Game.getObjectById(from)
    var destination = Game.getObjectById(to)

    //work only when there are NO construction sites
    var constructionSites = origin.room.find(FIND_CONSTRUCTION_SITES)
    if (constructionSites.length > 0) {
        return "already constructing"
    }

    var path = origin.pos.findPathTo(destination, {
        ignoreCreeps: true,
        ignoreRoads: false
    });
    const terrain = origin.room.getTerrain();

    var number = 0
    for (var step in path) {

        var tile = terrain.get(path[step].x, path[step].y)
        if (tile == TERRAIN_MASK_WALL) {
            //something already there
        } else {
            var response = origin.room.createConstructionSite(path[step].x, path[step].y, STRUCTURE_ROAD);
            if (response == OK) {
                number++;
            }
        }
    }
    //TODO: for a road ending at room end, check road coming from the other side as well
    if (number > 0) {
        console.log("finished road building loop with " + number + " new roads");
    }
};

Room.prototype.buildRoadXY = function (fx, fy, tx, ty) {
    //requires two X Y (this first one is not created)
    var origin = new RoomPosition(fx, fy, this.name)
    var destination = new RoomPosition(tx, ty, this.name)
    console.log("Create road from: " + origin + "to: " + destination);

    var path = origin.findPathTo(destination, {
        ignoreCreeps: true,
        ignoreRoads: false
    });
    const terrain = this.getTerrain();
    for (var step in path) {

        var tile = terrain.get(path[step].x, path[step].y)
        if (tile == TERRAIN_MASK_WALL) {
            //something already there
        } else {
            this.createConstructionSite(path[step].x, path[step].y, STRUCTURE_ROAD);
        }
    } //for
    console.log("finsihed for loop");
};

Room.prototype.removeSites = function () {
    var room = this
    var sites = room.find(FIND_MY_CONSTRUCTION_SITES);
    var i = sites.length
    while (--i) {
        sites[i].remove();
    }
};

Room.prototype.buildRoadsRoom = function () {
    var room = this

    if (!_.isEmpty(room.storage)) {
        var center = room.storage
    } else {
        var center = room.spawns[0];
    }

    var structures = room.containers
    structures.push(room.controller)
    if (!_.isEmpty(room.extractor)) {
        structures.push(room.extractor)
    }


    //TODO: add exits
    // can be null when no path
    /* var exit_top = center.pos.findClosestByPath(FIND_EXIT_TOP)
    var exit_left = center.pos.findClosestByPath(FIND_EXIT_LEFT)
    var exit_right = center.pos.findClosestByPath(FIND_EXIT_RIGHT)
    var exit_bottom = center.pos.findClosestByPath(FIND_EXIT_BOTTOM) */


    //TODO: make smarter and check existing road construction sites?

    console.log(room, "buildroads for", structures.length);
    for (var i = 0; i < structures.length; i++) {
        this.buildRoad(structures[i].id, center.id);
    }
};

Room.prototype.baseBunker = function (spawnName) {
    //TODO: finish this
    //build a rampart bunker around spawn
    var s1 = Game.spawns[spawnName]
    var tlc = new RoomPosition(s1.pos.x - 5, s1.pos.y - 9, s1.pos.roomName) //top left corner
    var brc = new RoomPosition(s1.pos.x + 5, s1.pos.y + 4, s1.pos.roomName) //bottom right corner
    var rcl = this.controller.level
    var room = Game.rooms[s1.pos.roomName];
    var numberOfTowers = room.find(FIND_MY_STRUCTURES, {
        filter: f => f.structureType == STRUCTURE_TOWER
    })

    if (rcl >= 4 && numberOfTowers.length >= 1) {
        //find important buildings
        //check if they have rampart
        //place rampart

        //place ramparts on the edge
        //check if there is no wall
    }
};

Room.prototype.baseRCLBuildCheck = function () {
    var room = this;
    if (!_.isEmpty(room.memory.masterSpawn)) {
        var s1 = Game.getObjectById(room.memory.masterSpawn)
    } else {
        return null
    }
    var tlc = new RoomPosition(s1.pos.x - 5, s1.pos.y - 9, s1.pos.roomName)
    room = Game.rooms[s1.pos.roomName];
    var base = baseRCL2; //check against lvl2

    if (!_.isEmpty(base.buildings.extension)) {
        var extensionsCount = 0
        for (var s of base.buildings.extension.pos) {
            //go through different buildings
            var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
            var place = room.lookForAt(LOOK_STRUCTURES, destination)

            place = _.filter(place, (f) => f.structureType == STRUCTURE_EXTENSION)

            if (place.length > 0) {
                extensionsCount = extensionsCount + 1
                //something here, chech for extension
            } else {
                //nothing there, which is bad
            }
        }
    }

    if (extensionsCount == 5) {
        return true;
    } else {
        return false;
    }
}

Room.prototype.baseRCLBuild = function () {
    //concole command: 
    // Game.rooms.E15N12.baseRCLBuild()

    var room = this;
    if (!_.isEmpty(room.memory.masterSpawn)) {
        var s1 = Game.getObjectById(room.memory.masterSpawn)
    } else {
        return null
    }
    var tlc = new RoomPosition(s1.pos.x - 5, s1.pos.y - 9, s1.pos.roomName)
    var rcl = this.controller.level
    room = Game.rooms[s1.pos.roomName];

    if (!this.baseRCLBuildCheck() && rcl > 2) {
        //not current layout
        return "not current layout";
    }


    //fixed placement for each RCL level
    switch (rcl) {
        case 1:
            //FIXME:
            //containers for sources
            for (var s in this.sources) {
                //set containers for sources
                var freeSpaces = s.room.lookForAtArea(LOOK_TERRAIN, s.pos.y - 1, s.pos.x - 1, s.pos.y + 1, s.pos.x + 1, true);
                freeSpaces = freeSpaces.filter(f => f.terrain != "wall" && f.terrain != "source")
                var closestPlaceForContainer = s1.pos.findClosestByRange(freeSpaces) // <- isuue here??
                room.createConstructionSite(closestPlaceForContainer.pos.x, closestPlaceForContainer.pos.y, STRUCTURE_CONTAINER)
            }

            //container for controller
            var freeSpaces = room.controller.room.lookForAtArea(LOOK_TERRAIN, room.controller.pos.y - 1, room.controller.pos.x - 1, room.controller.pos.y + 1, room.controller.pos.x + 1, true);
            freeSpaces = freeSpaces.filter(f => f.terrain != "wall" && f.terrain != "controller")
            var closestPlaceForContainer = s1.pos.findClosestByRange(freeSpaces)
            room.createConstructionSite(closestPlaceForContainer.pos.x, closestPlaceForContainer.pos.y, STRUCTURE_CONTAINER)

            break
        case 2:
            //+5 extensions, ramparts, walls
            if (!_.isEmpty(baseRCL2)) {
                var base = baseRCL2
            }
            break
        case 3:
            //+5 extensions, +1 tower
            if (!_.isEmpty(baseRCL3)) {
                var base = baseRCL3
            }
            break
        case 4:
            //+10 extensions, storage
            if (!_.isEmpty(baseRCL4)) {
                var base = baseRCL4
            }

            if (!_.isEmpty(baseRCLdefences)) {
                //TODO: adjust postition x-1, y-1 & add to the base array

            }
            break
        case 5:
            //+10 extensions, +1 tower, 2 links
            if (!_.isEmpty(baseRCL5)) {
                var base = baseRCL5
            }
            break
        case 6:
            //+10 extensions, +1 link, extractor, 3 labs, terminal
            if (!_.isEmpty(baseRCL6)) {
                var base = baseRCL6
            }

            //build an extractor
            var mineral = _.first(this.find(FIND_MINERALS))
            if (!_.isEmpty(mineral)) {
                if (_.isEmpty(room.extractor)) {
                    var place = room.lookForAt(LOOK_STRUCTURES, mineral)
                    if (place.length == 0) {
                        this.createConstructionSite(mineral, STRUCTURE_EXTRACTOR)
                    }
                    //and build a road for it
                    this.buildRoad(this.storage.id, mineral.id)
                }
            }

            // define inner labs, only when build
            if (room.labs.length >= 3 && room.memory.innerLabs[0].labID == "[LAB_ID]" && room.memory.innerLabs[1].labID == "[LAB_ID]") {
                //labs IDs not defined

                //look for stuctures
                var lab0 = _.first(_.filter(room.lookForAt(LOOK_STRUCTURES, tlc.x + 5, tlc.y + 1), f => f.structureType == STRUCTURE_LAB))
                var lab1 = _.first(_.filter(room.lookForAt(LOOK_STRUCTURES, tlc.x + 5, tlc.y + 2), f => f.structureType == STRUCTURE_LAB))
                console.log("Lab0: " + lab0.id + " Lab1: " + lab1.id)
                //check if they are truly there
                if (!_.isEmpty(lab0.id) && !_.isEmpty(lab1.id)) {
                    room.memory.innerLabs[0].labID = lab0.id;
                    room.memory.innerLabs[1].labID = lab1.id;
                }
            }
            break
        case 7:
            //+10 extensions, +1 tower, +1 link, +3 labs, +1 spawn
            if (!_.isEmpty(baseRCL7)) {
                var base = baseRCL7
            }
            break
        case 8:
            //+10 extensions, +3 tower, +2 link, +1 spawn, +4 labs, observer, power spawn
            if (!_.isEmpty(baseRCL8)) {
                var base = baseRCL8
            }
            break
    }

    if (!_.isEmpty(base)) {
        //place the buildings
        if (!_.isEmpty(base.buildings.extension)) {
            for (var s of base.buildings.extension.pos) {
                //go through different buildings
                var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
                var place = room.lookForAt(LOOK_STRUCTURES, destination)

                //console.log(JSON.stringify(destination) + " " + place.length)

                if (place.length > 0) {
                    //something here
                } else {
                    //nothing there
                    room.createConstructionSite(destination, STRUCTURE_EXTENSION)
                }
            }
        }
        if (!_.isEmpty(base.buildings.tower)) {
            for (var s of base.buildings.tower.pos) {
                //go through different buildings
                var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
                var place = room.lookForAt(LOOK_STRUCTURES, destination)
                if (place.length > 0) {
                    //something here
                } else {
                    //nothing there
                    room.createConstructionSite(destination, STRUCTURE_TOWER)
                }
            }
        }
        if (!_.isEmpty(base.buildings.storage)) {
            for (var s of base.buildings.storage.pos) {
                //go through different buildings
                var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
                var place = room.lookForAt(LOOK_STRUCTURES, destination)
                if (place.length > 0) {
                    //something here
                } else {
                    //nothing there
                    room.createConstructionSite(destination, STRUCTURE_STORAGE)
                }
            }
        }
        if (!_.isEmpty(base.buildings.road)) {
            for (var s of base.buildings.road.pos) {
                //go through different buildings
                var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
                var place = room.lookForAt(LOOK_STRUCTURES, destination)
                const terrain = room.getTerrain();
                var tile = terrain.get(tlc.x + s.x, tlc.y + s.y)
                if (place.length > 0 || tile == TERRAIN_MASK_WALL) {
                    //something here
                } else {
                    //nothing there
                    room.createConstructionSite(destination, STRUCTURE_ROAD)
                }
            }
        }
        if (!_.isEmpty(base.buildings.terminal)) {
            for (var s of base.buildings.terminal.pos) {
                //go through different buildings
                var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
                var place = room.lookForAt(LOOK_STRUCTURES, destination)
                if (place.length > 0) {
                    //something here
                } else {
                    //nothing there
                    room.createConstructionSite(destination, STRUCTURE_TERMINAL)
                }
            }
        }
        if (!_.isEmpty(base.buildings.link)) {
            for (var s of base.buildings.link.pos) {
                //go through different buildings
                var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
                var place = room.lookForAt(LOOK_STRUCTURES, destination)
                if (place.length > 0) {
                    //something here
                } else {
                    //nothing there
                    room.createConstructionSite(destination, STRUCTURE_LINK)
                }
            }
        }
        if (!_.isEmpty(base.buildings.spawn)) {
            for (var s of base.buildings.spawn.pos) {
                //go through different buildings
                var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
                var place = room.lookForAt(LOOK_STRUCTURES, destination)
                if (place.length > 0) {
                    //something here
                } else {
                    //nothing there
                    room.createConstructionSite(destination, STRUCTURE_SPAWN)
                }
            }
        }
        if (!_.isEmpty(base.buildings.nuker)) {
            for (var s of base.buildings.nuker.pos) {
                //go through different buildings
                var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
                var place = room.lookForAt(LOOK_STRUCTURES, destination)
                if (place.length > 0) {
                    //something here
                } else {
                    //nothing there
                    room.createConstructionSite(destination, STRUCTURE_NUKER)
                }
            }
        }
        if (!_.isEmpty(base.buildings.lab)) {
            for (var s of base.buildings.lab.pos) {
                //go through different buildings
                var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
                var place = room.lookForAt(LOOK_STRUCTURES, destination)
                if (place.length > 0) {
                    //something here
                } else {
                    //nothing there
                    room.createConstructionSite(destination, STRUCTURE_LAB)
                }
            }
        }
        if (!_.isEmpty(base.buildings.powerSpawn)) {
            for (var s of base.buildings.powerSpawn.pos) {
                //go through different buildings
                var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
                var place = room.lookForAt(LOOK_STRUCTURES, destination)
                if (place.length > 0) {
                    //something here
                } else {
                    //nothing there
                    room.createConstructionSite(destination, STRUCTURE_POWER_SPAWN)
                }
            }
        }
        if (!_.isEmpty(base.buildings.observer)) {
            for (var s of base.buildings.observer.pos) {
                //go through different buildings
                var destination = new RoomPosition(tlc.x + s.x, tlc.y + s.y, tlc.roomName)
                var place = room.lookForAt(LOOK_STRUCTURES, destination)
                if (place.length > 0) {
                    //something here
                } else {
                    //nothing there
                    room.createConstructionSite(destination, STRUCTURE_OBSERVER)
                }
            }
        }
        return base.rcl
    } else {
        return null
    }
};

Room.prototype.refreshContainerSources = function (r) {
    r = Game.rooms[r];
    //get home room storage
    if (!_.isEmpty(r.storage)) {
        //get rooms with longDistanceMiners in it
        var allMinerCreeps = _.filter(Game.creeps, (c) => c.memory.home == r.name && c.memory.role == "longDistanceMiner");
        var inRooms = _.map(allMinerCreeps, "memory.target")

        //get continers in those rooms
        var containerList = [];
        for (let roomName of inRooms) {
            if (!_.isEmpty(roomName)) {
                if (!_.isEmpty(Game.rooms[roomName])) {
                    if (!_.isEmpty(Game.rooms[roomName].containers)) {
                        var roomContainers = Game.rooms[roomName].containers
                        containerList = [...containerList, ...roomContainers]
                    }
                }
            }
        }

        var storagePosition = r.storage.pos;

        //if the memory space is not there
        if (r.memory.containerSources === undefined) {
            r.memory.containerSources = {};
        }

        //if refersh time, empty all container data
        if ((Game.time % DELAYFLOWROOMCHECK) == 0 && Game.cpu.bucket > 5000) {
            r.memory.containerSources = {};
        }



        //get info about containers
        for (let container of containerList) {
            if (!_.isEmpty(container) && !_.isEmpty(container)) {
                if (!_.isEmpty(r.memory.containerSources[container.id])) {
                    if (!_.isEmpty(container.room.controller.reservation)) {
                        if (container.room.controller.reservation.username == playerUsername) {
                            var energyCapacity = SOURCE_ENERGY_CAPACITY
                        }
                    } else {
                        var energyCapacity = SOURCE_ENERGY_NEUTRAL_CAPACITY
                    }

                    //check for how many creep target it
                    var incomingLorries = _.filter(container.targetedBy, f => _.first(_.words(f.name, /[^-]+/g)) == "longDistanceLorry")
                    var carryParts = 0
                    if (!_.isEmpty(incomingLorries)) {
                        //get their body size
                        carryParts = _.sum(incomingLorries, h => _.sum(h.body, part => part.type === CARRY))
                    }

                    var energyNeededForCarry = carryParts * CARRY_CAPACITY

                    var valid = false
                    if (container.store[RESOURCE_ENERGY] >= energyNeededForCarry) {
                        valid = true
                    }
                    //console.log(carryParts + " " + incomingLorries.length+ " "+valid)

                    if ((r.memory.containerSources[container.id].time + 30) < Game.time) {
                        //if the container ID exists, just update it
                        r.memory.containerSources[container.id].id = container.id
                        r.memory.containerSources[container.id].pos = container.pos
                        r.memory.containerSources[container.id].time = Game.time
                        //add info about validity of target
                        r.memory.containerSources[container.id].valid = valid
                        //add info about the current capacity based on reservation
                        r.memory.containerSources[container.id].energyCapacity = energyCapacity
                        //add info about current energy levels
                        r.memory.containerSources[container.id].energy = container.store[RESOURCE_ENERGY]
                        //add info for sorting
                        r.memory.containerSources[container.id].ed = container.store[RESOURCE_ENERGY] / (r.memory.containerSources[container.id].distance * 2)
                    }
                } else {
                    //if it does not exists, create it and calculate distance
                    r.memory.containerSources[container.id] = {}
                    r.memory.containerSources[container.id].id = container.id
                    r.memory.containerSources[container.id].pos = container.pos
                    r.memory.containerSources[container.id].valid = valid
                    r.memory.containerSources[container.id].energyCapacity = energyCapacity
                    r.memory.containerSources[container.id].energy = container.store[RESOURCE_ENERGY]
                    r.memory.containerSources[container.id].time = Game.time

                    let distance = PathFinder.search(
                        storagePosition, container.pos, {
                            // We need to set the defaults costs higher so that we
                            // can set the road cost lower in `roomCallback`
                            plainCost: 2,
                            swampCost: 10,

                            roomCallback: function (roomName) {
                                let room = Game.rooms[roomName];
                                // In this example `room` will always exist, but since 
                                // PathFinder supports searches which span multiple rooms 
                                // you should be careful!
                                if (!room) return;
                                let costs = new PathFinder.CostMatrix;
                                room.find(FIND_STRUCTURES).forEach(function (struct) {
                                    if (struct.structureType === STRUCTURE_ROAD) {
                                        // Favor roads over plain tiles
                                        costs.set(struct.pos.x, struct.pos.y, 1);
                                    } else if (struct.structureType !== STRUCTURE_CONTAINER &&
                                        (struct.structureType !== STRUCTURE_RAMPART ||
                                            !struct.my)) {
                                        // Can't walk through non-walkable buildings
                                        costs.set(struct.pos.x, struct.pos.y, 0xff);
                                    }
                                });
                                return costs;
                            },
                        }
                    );
                    if (distance[4] != true) {
                        r.memory.containerSources[container.id].distance = distance.path.length
                        r.memory.containerSources[container.id].ed = container.store[RESOURCE_ENERGY] / (r.memory.containerSources[container.id].distance * 2)
                    } else {
                        r.memory.containerSources[container.id].distance = false
                        r.memory.containerSources[container.id].ed = 0
                    }
                }
            }
        }
    } else {
        return -1;
    }
};

Room.prototype.refreshData =
    function (r) {
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

        //FIXME: add postion to IDs as well

        var searchResult;
        if (roomCreeps > 0 || (Game.rooms[r].controller != undefined &&
                Game.rooms[r].controller.owner != undefined &&
                Game.rooms[r].controller.owner.username == playerUsername) ||
            Game.rooms[r].memory.roomArray == undefined) {

            // Preloading room structure
            if (Game.rooms[r].memory.roomArray == undefined) {
                Game.rooms[r].memory.roomArray = {};
            }

            //time of last check
            Game.rooms[r].memory.roomArray.lastCheck = Game.time;

            //Hostile structures
            var hostileStructures = [];
            var hostileStructuresPos = [];
            searchResult = Game.rooms[r].find(FIND_HOSTILE_STRUCTURES);
            for (let s in searchResult) {
                hostileStructures.push(searchResult[s].id);
                hostileStructuresPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.hostileStructures = hostileStructures;
            Game.rooms[r].memory.roomArray.hostileStructuresPos = hostileStructuresPos;

            //Hostile creeps
            var hostiles = Game.rooms[r].find(FIND_HOSTILE_CREEPS, {
                filter: h => h.owner.username != "Invader"
            })
            if (hostiles > 0) {
                Game.rooms[r].memory.roomArray.hostileCreeps = [hostiles.length, _.first(hostiles).owner.username];
            } else {
                Game.rooms[r].memory.roomArray.hostileCreeps = [0, null]
            }



            //avaliable exits
            Game.rooms[r].memory.roomArray.exits = Game.map.describeExits(r);

            //Room sources
            if (Game.rooms[r].memory.roomArraySources != undefined) {
                delete Game.rooms[r].memory.roomArraySources;
            }
            var sourceIDs = [];
            var sourceIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_SOURCES);
            for (let s in searchResult) {
                sourceIDs.push(searchResult[s].id);
                sourceIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.sources = sourceIDs;
            Game.rooms[r].memory.roomArray.sourcesPos = sourceIDsPos;

            if (Game.rooms[r].memory.roomArrayMinerals != undefined) {
                delete Game.rooms[r].memory.roomArrayMinerals;
            }
            var mineralIDs = [];
            var mineralIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_MINERALS);
            for (let s in searchResult) {
                mineralIDs.push(searchResult[s].id);
                mineralIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.minerals = mineralIDs;
            Game.rooms[r].memory.roomArray.mineralsPos = mineralIDsPos;

            //containers
            if (Game.rooms[r].memory.roomArrayContainers != undefined) {
                delete Game.rooms[r].memory.roomArrayContainers;
            }
            var containerIDs = [];
            var containerIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER
            });
            for (let s in searchResult) {
                containerIDs.push(searchResult[s].id);
                containerIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.containers = containerIDs;
            Game.rooms[r].memory.roomArray.containersPos = containerIDsPos;

            //room MY_structures
            if (Game.rooms[r].memory.roomArrayPowerSpawns != undefined) {
                delete Game.rooms[r].memory.roomArrayPowerSpawns;
            }
            var powerSpawnIDs = [];
            var powerSpawnIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_POWER_SPAWN
            });
            for (let s in searchResult) {
                powerSpawnIDs.push(searchResult[s].id);
                powerSpawnIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.powerSpawns = powerSpawnIDs;
            Game.rooms[r].memory.roomArray.powerSpawnsPos = powerSpawnIDsPos;

            if (Game.rooms[r].memory.roomArraySpawns != undefined) {
                delete Game.rooms[r].memory.roomArraySpawns;
            }
            var spawnIDs = [];
            var spawnIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_SPAWN
            });
            for (let s in searchResult) {
                spawnIDs.push(searchResult[s].id);
                spawnIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.spawns = spawnIDs;
            Game.rooms[r].memory.roomArray.spawnsPos = spawnIDsPos;

            if (Game.rooms[r].memory.roomArrayExtensions != undefined) {
                delete Game.rooms[r].memory.roomArrayExtensions;
            }
            var extensionIDs = [];
            var extensionIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_EXTENSION
            });
            for (let s in searchResult) {
                extensionIDs.push(searchResult[s].id);
                extensionIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.extensions = extensionIDs;
            Game.rooms[r].memory.roomArray.extensionsPos = extensionIDsPos;

            if (Game.rooms[r].memory.roomArrayLinks != undefined) {
                delete Game.rooms[r].memory.roomArrayLinks;
            }
            var LinkIDs = [];
            var LinkIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LINK
            });
            for (let s in searchResult) {
                LinkIDs.push(searchResult[s].id);
                LinkIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.links = LinkIDs;
            Game.rooms[r].memory.roomArray.linksPos = LinkIDsPos;

            if (Game.rooms[r].memory.roomArrayLabs != undefined) {
                delete Game.rooms[r].memory.roomArrayLabs;
            }
            var LabIDs = [];
            var LabIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_LAB
            });
            for (let s in searchResult) {
                LabIDs.push(searchResult[s].id);
                LabIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.labs = LabIDs;
            Game.rooms[r].memory.roomArray.labsPos = LabIDsPos;

            if (Game.rooms[r].memory.roomArrayExtractors != undefined) {
                delete Game.rooms[r].memory.roomArrayExtractors;
            }
            var ExtractorIDs = [];
            var ExtractorIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_EXTRACTOR
            });
            for (let s in searchResult) {
                ExtractorIDs.push(searchResult[s].id);
                ExtractorIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.extractors = ExtractorIDs;
            Game.rooms[r].memory.roomArray.extractorsPos = ExtractorIDsPos;

            if (Game.rooms[r].memory.roomArrayRamparts != undefined) {
                delete Game.rooms[r].memory.roomArrayRamparts;
            }
            var rampartIDs = [];
            var rampartIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_RAMPART
            });
            for (let s in searchResult) {
                rampartIDs.push(searchResult[s].id);
                rampartIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.ramparts = rampartIDs;
            Game.rooms[r].memory.roomArray.rampartsPos = rampartIDsPos;

            if (Game.rooms[r].memory.roomArrayNukers != undefined) {
                delete Game.rooms[r].memory.roomArrayNukers;
            }
            var nukerIDs = [];
            var nukerIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_NUKER
            });
            for (let s in searchResult) {
                nukerIDs.push(searchResult[s].id);
                nukerIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.nukers = nukerIDs;
            Game.rooms[r].memory.roomArray.nukersPos = nukerIDsPos;

            if (Game.rooms[r].memory.roomArrayObservers != undefined) {
                delete Game.rooms[r].memory.roomArrayObservers;
            }
            var observerIDs = [];
            var observerIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_OBSERVER
            });
            for (let s in searchResult) {
                observerIDs.push(searchResult[s].id);
                observerIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.observers = observerIDs;
            Game.rooms[r].memory.roomArray.observersPos = observerIDsPos;

            if (Game.rooms[r].memory.roomArrayTowers != undefined) {
                delete Game.rooms[r].memory.roomArrayTowers;
            }
            var towerIDs = [];
            var towerIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_MY_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_TOWER
            });
            for (let s in searchResult) {
                towerIDs.push(searchResult[s].id);
                towerIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.towers = towerIDs;
            Game.rooms[r].memory.roomArray.towersPos = towerIDsPos;

            //Source Keepers
            if (Game.rooms[r].memory.roomArrayLairs != undefined) {
                delete Game.rooms[r].memory.roomArrayLairs;
            }
            var lairIDs = [];
            var lairIDsPos = [];
            searchResult = Game.rooms[r].find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_KEEPER_LAIR
            });
            for (let s in searchResult) {
                lairIDs.push(searchResult[s].id);
                lairIDsPos.push(searchResult[s].pos);
            }
            Game.rooms[r].memory.roomArray.lairs = lairIDs;
            Game.rooms[r].memory.roomArray.lairsPos = lairIDsPos;

            if (hostileStructures.length > 0) {
                //we got a hostile room
                Game.rooms[r].memory.roomArray.type = "hostile"
            } else if (lairIDs.length > 0) {
                // SK room
                Game.rooms[r].memory.roomArray.type = "SK"
            } else {
                //normal room
                Game.rooms[r].memory.roomArray.type = "normal"
            }
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
                    if (!_.isEmpty(testSpawn)) {
                        if (testSpawn.memory.spawnRole == 1) {
                            Game.rooms[r].memory.masterSpawn = Game.rooms[r].memory.roomArray.spawns[id];
                        }
                    }
                }
            }
        }
    };

Room.prototype.linksRun =
    function (r) {
        // Link code
        if (Game.rooms[r].memory.roomArray != undefined && Game.rooms[r].memory.roomArray.links != undefined && Game.rooms[r].memory.roomArray.links.length > 1) {
            var fillLinks = [];
            var emptyLinks = [];
            var targetLevel = 0;

            if (Game.rooms[r].memory.linksEmpty == undefined) {
                // Prepare link roles
                var emptyArray = [];
                emptyArray.push("[LINK_ID]");
                Game.rooms[r].memory.linksEmpty = emptyArray;
            }

            for (var link in Game.rooms[r].memory.roomArray.links) {
                if (Game.getObjectById(Game.rooms[r].memory.roomArray.links[link]) != undefined) {
                    if (Game.rooms[r].memory.linksEmpty == undefined || Game.rooms[r].memory.linksEmpty.indexOf(Game.rooms[r].memory.roomArray.links[link]) == -1) {
                        fillLinks.push(Game.getObjectById(Game.rooms[r].memory.roomArray.links[link]));
                        targetLevel += Game.getObjectById(Game.rooms[r].memory.roomArray.links[link]).energy;
                    } else {
                        emptyLinks.push(Game.getObjectById(Game.rooms[r].memory.roomArray.links[link]));
                    }
                }
            }
            targetLevel = Math.ceil(targetLevel / fillLinks.length / 100); //Targetlevel is now 0 - 8
            fillLinks = _.sortBy(fillLinks, "energy");
            //Empty emptyLinks
            for (var link in emptyLinks) {
                if (emptyLinks[link].cooldown == 0 && emptyLinks[link].energy > 0) {
                    for (var i = 0; i < fillLinks.length; i++) {
                        if (fillLinks[i].energy < 800) {
                            if (fillLinks[i].energy + emptyLinks[link].energy < 799) {
                                emptyLinks[link].transferEnergy(fillLinks[i], emptyLinks[link].energy);
                            } else if (fillLinks[i].energy < 790) {
                                emptyLinks[link].transferEnergy(fillLinks[i], (800 - fillLinks[i].energy));
                            }
                        }
                    }
                    break;
                }
            }
            fillLinks = _.sortBy(fillLinks, "energy");

            if (targetLevel > 0 && fillLinks.length > 1) {
                var minLevel = 99;
                var maxLevel = 0;
                var maxLink;
                var minLink;

                for (var link in fillLinks) {
                    if (Math.ceil(fillLinks[link].energy / 100) <= targetLevel && Math.ceil(fillLinks[link].energy / 100) <= minLevel) {
                        //Receiver link
                        minLevel = Math.ceil(fillLinks[link].energy / 100);
                        minLink = fillLinks[link];
                    } else if (fillLinks[link].cooldown == 0 && Math.ceil(fillLinks[link].energy / 100) >= targetLevel && Math.ceil(fillLinks[link].energy / 100) >= maxLevel) {
                        //Sender link
                        maxLevel = Math.ceil(fillLinks[link].energy / 100);
                        maxLink = fillLinks[link];
                    }
                }

                if (maxLink != undefined && maxLink.id != minLink.id && fillLinks.length > 1 && maxLevel > targetLevel) {
                    maxLink.transferEnergy(minLink, (maxLevel - targetLevel) * 100);
                }
            }
        }
    };

Room.prototype.checkForDefeat = function (spawnRoom) {
    if (_.isEmpty(spawnRoom.controller.owner)) {
        //check for DEMOLITION flag
        var demoFlags = _.filter(Game.flags, (f) => f.color == COLOR_ORANGE && f.pos.roomName == spawnRoom.name)
        if (!_.isEmpty(demoFlags)) {
            return "demolition in progress"
        }

        var hostiles = spawnRoom.find(FIND_HOSTILE_CREEPS)
        if (hostiles.length == 0) {
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
            var distanceName = _.first(_.map(_.sortByOrder(distance, ['dist'], ['asc']), _.values))[0];

            spawnRoom.createFlag(25, 25, "DEFEND-" + spawnRoom.name + "-" + distanceName, COLOR_WHITE, COLOR_YELLOW)
            console.log(spawnRoom.name + " has been defeated!! Sending recovery team!!")

            //FIXME: claim flag only when safe –> when full complement of guards is in place

            //var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.target == spawnRoom.name)

            //spawnRoom.createFlag(24, 24, "CLAIM-" + spawnRoom.name + "-" + distanceName, COLOR_GREY, COLOR_PURPLE)
        } else {
            console.log(spawnRoom.name + " has been defeated!! Occupied by " + hostiles.length)
        }
        return true;
    } else {
        var greyFlags = _.filter(Game.flags, (f) => f.color == COLOR_WHITE && f.pos.roomName == spawnRoom.name)
        if (spawnRoom.controller.level >= 3 && !_.isEmpty(greyFlags) && !_.isEmpty(spawnRoom.towers)) {
            //console.log(JSON.stringify(greyFlags))
            for (var flag of greyFlags) {
                flag.remove()
            }
        }
        return false;
    }
};

Room.prototype.creepSpawnRun =
    function (spawnRoom) {
        let globalSpawningStatus = 0;
        let cpuStart = Game.cpu.getUsed();

        if (spawnRoom.memory.roomArray != undefined) {
            for (var s in spawnRoom.memory.roomArray.spawns) {
                var testSpawn = Game.getObjectById(spawnRoom.memory.roomArray.spawns[s]);
                if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {
                    globalSpawningStatus++;
                }
                //if multiple spawns are in room, and one of them is spawning, wait for next round

            }
        }

        if (this.checkForDefeat(spawnRoom)) {
            //room has been defeated, no need to spawn anymore
            return -1;
        }

        if (globalSpawningStatus == 0) {
            //All spawns busy, inactive or player lost control of the room
            return -1;
        }
        let allMyCreeps = _.filter(Game.creeps, (c) => c.memory.home == spawnRoom.name && (c.ticksToLive > (c.body.length * 3) - 3 || c.spawning == true));

        //Check for sources & minerals
        let numberOfSources = spawnRoom.memory.roomArray.sources.length;
        let numberOfExploitableMineralSources = spawnRoom.memory.roomArray.extractors.length;

        // Define spawn minima
        let minimumSpawnOf = {};
        //Volume defined by flags
        minimumSpawnOf["longDistanceHarvester"] = 0;
        minimumSpawnOf["claimer"] = 0;
        minimumSpawnOf["bigClaimer"] = 0; //unused
        minimumSpawnOf["guard"] = 0;
        minimumSpawnOf["miner"] = 0;
        minimumSpawnOf["longDistanceMiner"] = 0;
        minimumSpawnOf["demolisher"] = 0;
        minimumSpawnOf["runner"] = 0;
        minimumSpawnOf["scout"] = 0;
        minimumSpawnOf["longDistanceLorry"] = 0;
        minimumSpawnOf["longDistanceBuilder"] = 0;
        minimumSpawnOf["attacker"] = 0; //unused
        minimumSpawnOf["healer"] = 0; //unused
        minimumSpawnOf["einarr"] = 0;
        minimumSpawnOf["archer"] = 0; //unused
        minimumSpawnOf["scientist"] = 0; //unused
        minimumSpawnOf["transporter"] = 0;
        minimumSpawnOf["SKHarvester"] = 0; //unused
        minimumSpawnOf["SKHauler"] = 0; //unused
        minimumSpawnOf["herocreep"] = 0;

        // LL code for miners and long distances

        //room interests
        let roomInterests = {}

        // REMOTE HARVEST
        var redFlags = _.filter(Game.flags, (f) => f.color == COLOR_RED && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
        //get remote mining rooms for this spawnroom
        if (!_.isEmpty(redFlags)) {
            for (var flag of redFlags) {
                //roomInterests.room = [harvesters, sources/miners, lorries, builders, claimers, guards]
                roomInterests[flag.pos.roomName] = [flag.secondaryColor, 0, 0, 1, 0, 1]
            }
        }

        // REMOTE MINING
        if (!_.isEmpty(spawnRoom.storage)) {
            //get all flags with code PURPLE for remote MINERS
            var purpleFlags = _.filter(Game.flags, (f) => f.color == COLOR_PURPLE && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
            //get remote mining rooms for this spawnroom
            if (!_.isEmpty(purpleFlags)) {
                for (var flag of purpleFlags) {
                    //roomInterests.room = [harvesters, sources/miners, lorries, builders, claimers, guards]
                    //builders & guard = boolean
                    roomInterests[flag.pos.roomName] = [0, flag.secondaryColor, 0, 1, 1, 1]
                    //FIXME: dynamic number of lorries, based on distance, e/t and RCL
                }
            }
        }

        //add longDistanceLorries based on distance to sources
        if (!_.isEmpty(spawnRoom.memory.containerSources)) {
            var cS = spawnRoom.memory.containerSources;


            // get combined distance to all sources
            var sumDistance = _.sum(cS, c => c.distance) * 2 //times 2 for round trip
            var count = _.keys(cS).length
            var avgDistance = sumDistance / count

            // add overhead

            //we have 5-10e/t production at the targets
            var avgEnergyCapacity = (_.sum(cS, c => c.energyCapacity) / ENERGY_REGEN_TIME) / count


            // calculate the number of creeps needed
            let rrcl = spawnRoom.controller.level;
            var LDLorryBody = buildingPlans["longDistanceLorry"][rrcl - 1].body
            var numCarryBody = _.sum(LDLorryBody, b => b == "carry")
            var lorryCarryCapacity = numCarryBody * CARRY_CAPACITY


            var creepsNeeded = ((avgDistance * avgEnergyCapacity) / lorryCarryCapacity) * count


            if (false) {
                var creepsCrurrent = _.filter(allMyCreeps, (c) => c.memory.role == 'longDistanceLorry' && c.memory.home == spawnRoom.name).length
                console.log(spawnRoom.name + " distance: " + sumDistance + " count: " + count + " e/t: " + avgEnergyCapacity + " avgDist: " + (avgDistance).toFixed(2) + " carryCapacity: " +
                    lorryCarryCapacity + " = creepsNeed: " + (creepsNeeded).toFixed(2) + " currently: " + creepsCrurrent);
            }

            if (!_.isEmpty(spawnRoom.storage)) {
                if (_.sum(spawnRoom.storage.store) < 950000) {
                    minimumSpawnOf.longDistanceLorry = _.ceil(creepsNeeded)
                }
            }
        }


        // DEFENSE
        if (!_.isEmpty(spawnRoom.storage)) {
            //get gcl and number of rooms
            var whiteFlags = _.filter(Game.flags, (f) => f.color == COLOR_WHITE && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
            if (!_.isEmpty(whiteFlags)) {
                for (var flag of whiteFlags) {
                    //check if there are avaliable quards
                    var avaliableGuards = _.filter(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.target == spawnRoom.name)
                    if (avaliableGuards.length > 0) {
                        //we have guards ready
                        for (var c in avaliableGuards) {
                            //send all to deal with stuff
                            avaliableGuards[c].memory.target = flag.pos.roomName
                            if (avaliableGuards[c].hasValidTask) {
                                //avaliableGuards[c].task.fork(creepsInDanger[c].runRole())
                            }
                        }
                    } else {
                        //spawn more guards

                        //roomInterests.room = [harvesters, sources/miners, lorries, builders, claimers, guards]
                        //builders & guard = boolean
                        roomInterests[flag.pos.roomName] = [0, 0, 0, 0, 0, flag.secondaryColor]
                        var defend = flag.pos.roomName;
                    }
                    //break tasks for all creeps in room
                    var creepsInDanger = _.filter(allMyCreeps, (c) => c.memory.role != 'guard' && c.memory.target == flag.pos.roomName)
                    for (var c in creepsInDanger) {
                        if (creepsInDanger[c].room.name != creepsInDanger[c].memory.home) {
                            //if other room than home -> go home
                            if (creepsInDanger[c].hasValidTask) {
                                //creepsInDanger[c].task.fork(creepsInDanger[c].runRole())
                            }
                        }
                    }
                }
            }
        }

        // CLAIM ROOM
        if (!_.isEmpty(spawnRoom.storage)) {
            //get gcl and number of rooms
            var gcl = Game.gcl.level;
            var numberOfRooms = _.sum(Game.rooms, room => room.controller && room.controller.my)
            var greyFlags = _.filter(Game.flags, (f) => f.color == COLOR_GREY && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
            if (gcl > numberOfRooms) {
                if (!_.isEmpty(greyFlags)) {
                    for (var flag of greyFlags) {
                        //roomInterests.room = [harvesters, sources/miners, lorries, builders, claimers, guards]
                        //builders & guard = boolean
                        roomInterests[flag.pos.roomName] = [0, 0, 0, flag.secondaryColor, 1, 1]
                        var newRoom = flag.pos.roomName;
                    }
                }
            } else {
                if (!_.isEmpty(greyFlags)) {
                    for (var flag of greyFlags) {
                        var spawnExists = Game.rooms[flag.pos.roomName].spawns
                        if (spawnExists.length == 0) {
                            //roomInterests.room = [harvesters, sources/miners, lorries, builders, claimers, guards]
                            //builders & guard = boolean
                            roomInterests[flag.pos.roomName] = [0, 0, 0, flag.secondaryColor, 0, 1]
                            var newRoom = flag.pos.roomName;
                        } else {
                            //remove flag
                            flag.remove()
                        }
                    }
                }
            }
        }

        //ATTACK
        var attackFlags = _.filter(Game.flags, (f) => f.color == COLOR_BROWN && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
        var einarr = {}
        if (!_.isEmpty(attackFlags)) {
            for (var flag of attackFlags) {
                minimumSpawnOf.einarr = flag.secondaryColor
                einarr[flag.pos.roomName] = flag.secondaryColor
            }
        }

        if (einarr.length > 0) {
            console.log(spawnRoom.name + " " + JSON.stringify(einarr))
        }

        //DEMOLISH
        var demoFlags = _.filter(Game.flags, (f) => f.color == COLOR_ORANGE && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
        var demolisher = {}
        if (!_.isEmpty(demoFlags)) {
            for (var flag of demoFlags) {
                minimumSpawnOf.demolisher = minimumSpawnOf.demolisher + flag.secondaryColor
                demolisher[flag.pos.roomName] = flag.secondaryColor
            }
        }


        let longDistanceHarvester = {}
        let longDistanceMiner = {}
        let longDistanceBuilder = {}
        let claimer = {}
        let guard = {}

        for (let interest in roomInterests) {
            if (roomInterests[interest][0] > 0) {
                var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'longDistanceHarvester' && c.memory.target == interest)
                minimumSpawnOf.longDistanceHarvester += roomInterests[interest][0] - inRooms;
                if (inRooms < roomInterests[interest][0]) {
                    longDistanceHarvester[interest] = roomInterests[interest][0]
                }
                //console.log(interest+" "+inRooms+" "+roomInterests[interest][0]+" "+minimumSpawnOf.longDistanceHarvester)
            }
            if (roomInterests[interest][1] > 0) {
                var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'longDistanceMiner' && c.memory.target == interest)
                minimumSpawnOf.longDistanceMiner += roomInterests[interest][1];
                if (inRooms < roomInterests[interest][1]) {
                    longDistanceMiner[interest] = roomInterests[interest][1]
                }

                //check for controller reservation status
                var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'claimer' && c.memory.target == interest)
                if (Game.rooms[interest] != undefined) {
                    //console.log(JSON.stringify(Game.rooms[interest].controller))
                    if (Game.rooms[interest].controller != undefined && Game.rooms[interest].controller.reservation != undefined) {
                        if (Game.rooms[interest].controller.reservation.username == playerUsername) {
                            var reservationLeft = Game.rooms[interest].controller.reservation.ticksToEnd
                            if (reservationLeft < 3000) {
                                minimumSpawnOf.claimer += 1 - inRooms;
                                if (inRooms < 1) {
                                    claimer[interest] = 1;
                                }
                            }
                        } else {
                            minimumSpawnOf.claimer += 1 - inRooms;
                            if (inRooms < 1) {
                                claimer[interest] = 1;
                            }
                        }
                    } else {
                        minimumSpawnOf.claimer += 1 - inRooms;
                        if (inRooms < 1) {
                            claimer[interest] = 1;
                        }
                    }
                }
                //console.log(interest+" "+inRooms+" "+roomInterests[interest][1]+" "+minimumSpawnOf.longDistanceMiner)
            }
            if (roomInterests[interest][2] > 0) {
                //code moved somewhere else :)

                //minimumSpawnOf.longDistanceLorry += roomInterests[interest][2];
            }
            if (roomInterests[interest][3] > 0) {
                var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'longDistanceBuilder' && c.memory.target == interest)
                //if construction or repairs are needed, launch a builder
                if (Game.rooms[interest] != undefined) {
                    var numOfConstrustions = Game.rooms[interest].find(FIND_CONSTRUCTION_SITES)
                    var numOfRepairsites = Game.rooms[interest].find(FIND_STRUCTURES, {
                        filter: (s) =>
                            ((s.hits / s.hitsMax) < 0.7) &&
                            s.structureType != STRUCTURE_CONTROLLER &&
                            s.structureType != STRUCTURE_WALL &&
                            s.structureType != STRUCTURE_RAMPART
                    });
                    //console.log(interest+" "+numOfConstrustions.length +" "+ numOfRepairsites.length)
                    if (interest == newRoom) {
                        minimumSpawnOf.longDistanceBuilder += roomInterests[interest][3];
                    } else if ((numOfConstrustions.length + numOfRepairsites.length) > 0) {
                        roomInterests[interest][3] = _.ceil((numOfConstrustions.length + numOfRepairsites.length) / 10)
                    } else {
                        roomInterests[interest][3] = 0
                    }

                    if (roomInterests[interest][3] > 2) {
                        roomInterests[interest][3] = 2
                    }

                    minimumSpawnOf.longDistanceBuilder += roomInterests[interest][3];
                    if (inRooms < roomInterests[interest][3]) {
                        longDistanceBuilder[interest] = roomInterests[interest][3]
                    }

                    //console.log(interest + " " + newRoom + " " + roomInterests[interest][3] + " " + minimumSpawnOf.longDistanceBuilder)
                } else {
                    //no vision into the room
                    if (interest == newRoom) {
                        minimumSpawnOf.longDistanceBuilder += roomInterests[interest][3];
                        if (inRooms < roomInterests[interest][3]) {
                            longDistanceBuilder[interest] = roomInterests[interest][3]
                        }
                    }
                }
            }
            if (roomInterests[interest][4] > 0) {
                if (interest == newRoom) {
                    var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'claimer' && c.memory.target == interest)
                    minimumSpawnOf.claimer += 1 - inRooms;
                    if (inRooms < 1) {
                        claimer[interest] = 1;
                    }
                }
            }
            if (roomInterests[interest][5] > 0) {
                var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.target == interest)
                var inRoomsCurrent = _.sum(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.home == spawnRoom.name && c.memory.target != interest)
                if (Game.rooms[interest] != undefined) {
                    //if I have vision, check for other properties of hostiles

                    //if hostiles present, spawn a task force!
                    let hostileValues = spawnRoom.checkForHostiles(Game.rooms[interest])
                    if (!_.isEmpty(hostileValues)) {
                        if (hostileValues.numHostiles > 0) {
                            if (hostileValues.numberOfAttackBodyParts > 0) {
                                console.log("*!!!* " + interest + " Being attacked by " + hostileValues.numHostiles + " with: " + hostileValues.numberOfAttackBodyParts + " attack parts and " + hostileValues.numberOfHealBodyParts + " heal parts. Response team: " + inRooms)
                                if (hostileValues.numberOfAttackBodyParts < 3 && hostileValues.numberOfHealBodyParts < 2) {
                                    //small invader
                                    roomInterests[interest][5] = hostileValues.numHostiles;
                                } else {
                                    //big invader or with healers
                                    roomInterests[interest][5] = hostileValues.numHostiles * 2;
                                }

                                //hostiles, do not spawn anything else for this room
                                roomInterests[interest][0] = 0
                                minimumSpawnOf.longDistanceHarvester = minimumSpawnOf.longDistanceHarvester - roomInterests[interest][0];
                                roomInterests[interest][1] = 0
                                minimumSpawnOf.longDistanceMiner = minimumSpawnOf.longDistanceMiner - roomInterests[interest][1];
                                roomInterests[interest][2] = 0
                                minimumSpawnOf.longDistanceLorry = minimumSpawnOf.longDistanceLorry - roomInterests[interest][2];
                                roomInterests[interest][3] = 0
                                minimumSpawnOf.longDistanceBuilder = minimumSpawnOf.longDistanceBuilder - roomInterests[interest][3];
                                roomInterests[interest][4] = 0
                                minimumSpawnOf.claimer = minimumSpawnOf.claimer - roomInterests[interest][4];
                            } else {
                                console.log("R enemy scout in " + interest)
                            }
                        } else {
                            //should not happen
                            roomInterests[interest][5] = 0;
                            console.log("guard code - smth wrong")
                        }

                        //update the minimumSpawnOf
                        minimumSpawnOf.guard += roomInterests[interest][5];

                        //update count for spawn loop
                        if (inRooms < roomInterests[interest][5]) {
                            guard[interest] = roomInterests[interest][5]
                        }
                        //FIXME: not spawning enough guards

                        //console.log("Enemy in " + interest + " with " + inRooms + " guards dispathed from " + spawnRoom.name + " " + JSON.stringify(guard) + " " + minimumSpawnOf.guard)
                    }
                } else {
                    //we do not have vision - rely on flag

                    //check for flag
                    var whiteFlags = _.first(_.filter(Game.flags, (f) => f.color == COLOR_WHITE && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name && f.pos.roomName == interest))
                    if (!_.isEmpty(whiteFlags)) {
                        minimumSpawnOf.guard += roomInterests[interest][5] + inRoomsCurrent;
                        if (inRooms < roomInterests[interest][5]) {
                            guard[interest] = roomInterests[interest][5]
                        }

                        console.log("Enemy in " + whiteFlags.pos.roomName + " with " + inRooms + " guards dispathed from " + _.last(_.words(whiteFlags.name, /[^-]+/g)) + "/" + spawnRoom.name + " " + JSON.stringify(guard) + " " + minimumSpawnOf.guard)
                    }
                }
            }
        }

        /* if (minimumSpawnOf.guard > 0) {
            var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.home == spawnRoom.name)
            console.log("Enemy! " + inRooms + " guards from " + spawnRoom.name + " " + JSON.stringify(guard) + " " + minimumSpawnOf.guard)
        } */

        /**Spawning volumes scaling with # of sources in room**/
        var constructionSites = spawnRoom.find(FIND_MY_CONSTRUCTION_SITES);
        var constructionOfRampartsAndWalls = 0;

        // Builder
        if (constructionSites.length == 0) {
            minimumSpawnOf.builder = 0;
        } else {
            //There are construction sites
            var progress = 0;
            var totalProgress = 0;
            for (var w in constructionSites) {
                progress += constructionSites[w].progress;
                totalProgress += constructionSites[w].progressTotal;
                if (constructionSites[w].structureType == STRUCTURE_RAMPART || constructionSites[w].structureType == STRUCTURE_WALL) {
                    constructionOfRampartsAndWalls++;
                }
            }
            minimumSpawnOf.builder = Math.ceil((totalProgress - progress) / 5000);

            if (minimumSpawnOf.builder > Math.ceil(numberOfSources * 1.5)) {
                minimumSpawnOf.builder = Math.ceil(numberOfSources * 1.5);
            }
            //console.log(minimumSpawnOf.builder+" "+totalProgress +" "+progress)
        }


        // Upgrader
        minimumSpawnOf["upgrader"] = 1;
        if (!_.isEmpty(spawnRoom.storage)) {
            var terminalExcessEnergy = 0
            if (!_.isEmpty(spawnRoom.terminal)) {
                if (spawnRoom.terminal.store[RESOURCE_ENERGY] > (spawnRoom.memory.resourceLimits.energy.minTerminal * 1.2)) {
                    terminalExcessEnergy = spawnRoom.terminal.store[RESOURCE_ENERGY] - (spawnRoom.memory.resourceLimits.energy.minTerminal * 1.2)
                }
            }
            if ((spawnRoom.storage.store[RESOURCE_ENERGY] + terminalExcessEnergy) > (MINSURPLUSENERGY * spawnRoom.controller.level) && spawnRoom.controller.level < 8) {
                //add more upgraders
                var mutiply = spawnRoom.storage.store[RESOURCE_ENERGY] / (MINSURPLUSENERGY * spawnRoom.controller.level)
                minimumSpawnOf.upgrader = _.ceil(2 * mutiply)
            }
        }

        //Wall Repairer – CONSTRUCTION
        var wallRepairTargets = spawnRoom.find(FIND_STRUCTURES, {
            filter: (s) => (s.structureType == STRUCTURE_RAMPART || s.structureType == STRUCTURE_WALL) && s.hits < WALLMAX
        });
        if (constructionOfRampartsAndWalls == 0) {
            minimumSpawnOf["wallRepairer"] = 0;
        }
        if (wallRepairTargets.length > 0) {
            if (_.isEmpty(spawnRoom.storage)) {
                minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources * 0.5);
            } else {
                if (spawnRoom.storage.store[RESOURCE_ENERGY] > (MINSURPLUSENERGY * spawnRoom.controller.level)) {
                    //minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources);
                    minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources * 0.5);
                } else {
                    minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources * 0.5);
                }
            }
        }


        // runner
        if (spawnRoom.storage != undefined) {
            minimumSpawnOf["runner"] = 1;

            //pull back on lorries when storage is overflowing
            if (_.sum(spawnRoom.storage.store) > 900000) {
                minimumSpawnOf.longDistanceLorry = Math.floor(minimumSpawnOf.longDistanceLorry / 3);
            } else {
                //round that number
                minimumSpawnOf.longDistanceLorry = Math.floor(minimumSpawnOf.longDistanceLorry);
            }
        }

        var numberOfMiners = _.sum(allMyCreeps, (c) => c.memory.role == 'miner' && c.memory.home == spawnRoom.name)
        var numberOfSA = _.sum(allMyCreeps, (c) => c.memory.role == 'runner' && c.memory.home == spawnRoom.name)

        // lorry, Harvester & Repairer
        minimumSpawnOf["miner"] = numberOfSources;
        minimumSpawnOf["harvester"] = numberOfSources - Math.ceil(numberOfMiners / 2) - numberOfSA



        /** Rest **/

        // Miner
        minimumSpawnOf["mineralHarvester"] = numberOfExploitableMineralSources;
        if (spawnRoom.storage == undefined || Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]) == null || Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]).mineralAmount == 0) {
            minimumSpawnOf.mineralHarvester = 0;
        }

        // Transporter
        var spawnTransporter = false;
        if (spawnRoom.terminal != undefined) {
            if (spawnRoom.memory.terminalTransfer != undefined) {
                spawnTransporter = true;
            } else {
                var terminalDelta;
                if (spawnRoom.memory.terminalDelta == undefined || Game.time % 10 == 0 || spawnRoom.memory.terminalDelta != 0) {
                    terminalDelta = 0;
                    for (var res in spawnRoom.terminal.store) {
                        var delta = checkTerminalLimits(spawnRoom, res);
                        terminalDelta += Math.abs(delta.amount);
                        //console.log(terminalDelta)
                    }

                    for (var res in spawnRoom.storage.store) {
                        var delta = checkTerminalLimits(spawnRoom, res);
                        terminalDelta += Math.abs(delta.amount);
                        //console.log(terminalDelta)
                    }
                } else {
                    terminalDelta = spawnRoom.memory.terminalDelta;
                }
                if (terminalDelta > 0) {
                    spawnTransporter = true;
                }
            }
            if (spawnTransporter) {
                minimumSpawnOf.transporter = 1;
            }
        }

        // Scientist
        if (spawnRoom.memory.labOrder != undefined) {
            var info = spawnRoom.memory.labOrder.split(":");
            if (info[3] == "prepare" || info[3] == "done") {
                minimumSpawnOf.scientist = 1;
            }
        }

        //HEROcreep
        if (!_.isEmpty(spawnRoom.storage)) {
            var powerSpawn = spawnRoom.find(FIND_STRUCTURES, {
                filter: f => f.structureType == STRUCTURE_POWER_SPAWN
            })
            if (!_.isEmpty(powerSpawn) && spawnRoom.storage.store[RESOURCE_POWER] >= 100 && spawnRoom.storage.store[RESOURCE_ENERGY] >= MINSURPLUSENERGY) {
                minimumSpawnOf.herocreep = 1
            }

            if (spawnRoom.storage.store[RESOURCE_GHODIUM] >= 1000 && spawnRoom.controller.safeModeAvailable <= 3) {
                minimumSpawnOf.herocreep = 1
            }
        }


        //Scout
        //minimumSpawnOf.scout = 1;


        // Adjustments in case of hostile presence
        var hostileValues = spawnRoom.checkForHostiles(spawnRoom);
        var numberOfTowers = spawnRoom.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy > 0
        });
        if (!_.isEmpty(hostileValues)) {
            if (hostileValues.numHostiles > 0) {
                //console.log("Being attacked by " + hostileValues.numHostiles + " with:" + hostileValues.maxAttackBodyParts + " attack parts")

                //Get number of towers
                if (numberOfTowers >= hostileValues.numHostiles) {
                    //towers shoudl be enough
                } else {
                    if (hostileValues.numHostiles >= 4) {
                        //siege mode, just support walls!
                        minimumSpawnOf.guard = 0;
                        guard[spawnRoom.name] = 0;
                    } else {
                        if (spawnRoom.controller.safeMode == undefined) {
                            //only when safe mode is not active
                            minimumSpawnOf.guard = hostileValues.numHostiles;
                            guard[spawnRoom.name] = hostileValues.numHostiles;
                        }
                    }
                }




                if (spawnRoom.controller.safeMode == undefined) {
                    //limit everything else
                    minimumSpawnOf.upgrader = 0;
                    minimumSpawnOf.builder = 0;
                    minimumSpawnOf.longDistanceHarvester = 0;
                    minimumSpawnOf.mineralHarvester = 0;
                    minimumSpawnOf.runner = 0;
                    minimumSpawnOf.longDistanceMiner = 0;
                    minimumSpawnOf.longDistanceLorry = 0;
                    minimumSpawnOf.longDistanceBuilder = 0;
                    minimumSpawnOf.demolisher = 0;
                }
                minimumSpawnOf.wallRepairer *= 2;
            }
        }

        //keep at least one guard ready
        var avaliableGuards = _.filter(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.target == spawnRoom.name)
        var remoteMiners = _.filter(allMyCreeps, (c) => c.memory.role == 'longDistanceMiner' && c.memory.home == spawnRoom.name)
        if (avaliableGuards.length == 0 && remoteMiners.length > 0) {
            minimumSpawnOf.guard = 1;
            guard[spawnRoom.name] = 1;
        }



        // Measuring number of active creeps
        let counter = _.countBy(allMyCreeps, "memory.role");
        let roleList = (Object.getOwnPropertyNames(minimumSpawnOf));
        for (let z in roleList) {
            if (roleList[z] != "length" && counter[roleList[z]] == undefined) {
                counter[roleList[z]] = 0;
            }
        }
        let numberOf = counter;
        numberOf.claimer = 0; //minimumSpawnOf only contains claimer delta. Hence numberOf.claimer is always 0

        // Role selection
        let energy = spawnRoom.energyCapacityAvailable;
        let name = undefined;
        let rcl = spawnRoom.controller.level;

        /* 
        FIXME:
            - more agressive spawning on lower RCL
            - fixed numbers for now
        */

        if (rcl <= 3) {
            /* minimumSpawnOf.guard += 1
            guard[spawnRoom.name] += 1 */

            if (numberOfMiners == 0) {
                let sources = spawnRoom.find(FIND_SOURCES);
                var freeSpots = 0
                for (var s of sources) {
                    //check how many free space each has
                    var freeSpaces = spawnRoom.lookForAtArea(LOOK_TERRAIN, s.pos.y - 1, s.pos.x - 1, s.pos.y + 1, s.pos.x + 1, true);
                    freeSpaces = freeSpaces.filter(f => f.terrain == "wall")
                    freeSpots = freeSpots + (9 - freeSpaces.length)
                }
                minimumSpawnOf.harvester = freeSpots * 2;
                if (minimumSpawnOf.harvester > 10) {
                    minimumSpawnOf.harvester = 10
                }
            } else {
                minimumSpawnOf.harvester = numberOfSources * 2
            }
        }

        if (rcl <= 2) {
            minimumSpawnOf.runner = 1
        }

        //we can claim new room, pause upgraders
        if (!_.isEmpty(newRoom)) {
            minimumSpawnOf.upgrader = 0
            minimumSpawnOf.longDistanceMiner = 0
            minimumSpawnOf.longDistanceLorry = 0
        }

        //keep a builder until we have towers for repairs
        if ((rcl < 3 || numberOfTowers.length == 0) && minimumSpawnOf.builder == 0) {
            minimumSpawnOf.builder = 1;
        }

        //Check whether spawn trying to spawn too many creeps
        let missingBodyParts = 0;
        for (let rn in minimumSpawnOf) {
            if (!_.isEmpty(minimumSpawnOf[rn]) && !_.isEmpty(buildingPlans[rn])) {
                missingBodyParts += minimumSpawnOf[rn] * buildingPlans[rn][rcl - 1].body.length;
            }
        }
        let neededTicksToSpawn = 3 * missingBodyParts;
        let neededTicksThreshold = 1300 * spawnRoom.memory.roomArray.spawns.length;
        if (neededTicksToSpawn > neededTicksThreshold) {
            console.log("<font color=#ff0000 type='highlight'>Warning: Possible bottleneck to spawn creeps needed for room " + spawnRoom.name + "  detected: " + neededTicksToSpawn + " ticks > " + neededTicksThreshold + " ticks</font>");
            minimumSpawnOf.runner = minimumSpawnOf.runner + 1
        }
        if (spawnRoom.energyAvailable < (spawnRoom.energyCapacityAvailable / 2) && minimumSpawnOf.runner == 1) {
            minimumSpawnOf.runner = minimumSpawnOf.runner + 1
        }
        let spawnList = this.getSpawnList(spawnRoom, minimumSpawnOf, numberOf);
        let spawnEntry = 0;

        if (spawnList != null && spawnList.length > 0) {
            for (var s in spawnRoom.memory.roomArray.spawns) {
                // Iterate through spawns
                let testSpawn = Game.getObjectById(spawnRoom.memory.roomArray.spawns[s]);
                if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {
                    
                    if (false) {
                        var debug = [spawnList, minimumSpawnOf, numberOf]
                        console.log(spawnRoom.name + " " + JSON.stringify(debug) + " *** ticks needed: " + neededTicksToSpawn)
                    }

                    // Spawn!
                    if (spawnList[spawnEntry] == "miner") {
                        // check if all sources have miners
                        var sources = spawnRoom.memory.roomArray.sources

                        // iterate over all sources
                        for (var source of sources) {
                            source = Game.getObjectById(source);

                            // if the source has no miner
                            if (!_.some(allMyCreeps, c => c.memory.role == 'miner' && c.memory.sourceId == source.id)) {

                                // check whether or not the source has a container
                                var containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                                    filter: s => s.structureType == STRUCTURE_CONTAINER
                                });

                                // if there is a container next to the source
                                if (containers.length > 0 && spawnRoom.energyAvailable >= 300) {
                                    // spawn a miner
                                    name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName, source.id);
                                } else {
                                    // check whether or not the source has a link
                                    var containers = source.pos.findInRange(FIND_STRUCTURES, 2, {
                                        filter: s => s.structureType == STRUCTURE_LINK
                                    });

                                    // if there is a container next to the source
                                    if (containers.length > 0 && spawnRoom.energyAvailable >= 300) {
                                        name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName, source.id);
                                    }
                                }
                            }
                        }
                    } else if (spawnList[spawnEntry] == "claimer") {
                        for (var roomName in claimer) {
                            name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
                        }
                    } else if (spawnList[spawnEntry] == "longDistanceHarvester") {
                        for (var roomName in longDistanceHarvester) {
                            name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
                        }
                    } else if (spawnList[spawnEntry] == "longDistanceMiner") {
                        for (var roomName in longDistanceMiner) {
                            name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
                        }
                    } else if (spawnList[spawnEntry] == "longDistanceBuilder") {
                        for (var roomName in longDistanceBuilder) {
                            name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
                        }
                    } else if (spawnList[spawnEntry] == "einarr") {
                        for (var roomName in einarr) {
                            name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
                        }
                    } else if (spawnList[spawnEntry] == "demolisher") {
                        for (var roomName in demolisher) {
                            name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
                        }
                    } else if (spawnList[spawnEntry] == "guard") {
                        if (_.isEmpty(guard)) {
                            console.log("ERR spawning a GUARD!! in " + spawnRoom.name + " " + JSON.stringify(minimumSpawnOf.guard))
                        }
                        for (var roomName in guard) {
                            name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name, roomName);
                        }
                    } else {
                        name = testSpawn.createCustomCreep(energy, spawnList[spawnEntry], spawnRoom.name);
                    }
                    testSpawn.memory.lastSpawnAttempt = spawnList[spawnEntry];
                    if (!(name < 0) && name != undefined) {
                        testSpawn.memory.lastSpawn = spawnList[spawnEntry];
                        if (LOG_SPAWN == true) {
                            console.log("<font color=#00ff22 type='highlight'>" + testSpawn.name + " is spawning creep: " + name + " in room " + spawnRoom.name + ". (CPU used: " + (Game.cpu.getUsed() - cpuStart) + ") on tick " + Game.time + "<br> creeps left: " + JSON.stringify(spawnList) + "</font>");
                        }
                        spawnEntry++;
                    }
                }
                if (spawnEntry >= spawnList.length) {
                    break;
                }
            }
        }
    };

Room.prototype.getSpawnList = function (spawnRoom, minimumSpawnOf, numberOf) {
    let rcl = spawnRoom.controller.level;

    let tableImportance = {
        harvester: {
            name: "harvester",
            prio: 10,
            energyRole: true,
            min: minimumSpawnOf.harvester,
            max: numberOf.harvester,
            minEnergy: buildingPlans.harvester[rcl - 1].minEnergy
        },
        miniharvester: {
            name: "miniharvester",
            prio: 1,
            energyRole: true,
            min: 0,
            max: 0,
            minEnergy: buildingPlans.miniharvester[rcl - 1].minEnergy
        },
        miner: {
            name: "miner",
            prio: 11,
            energyRole: true,
            min: minimumSpawnOf.miner,
            max: numberOf.miner,
            minEnergy: buildingPlans.miner[rcl - 1].minEnergy
        },
        builder: {
            name: "builder",
            prio: 60,
            energyRole: false,
            min: minimumSpawnOf.builder,
            max: numberOf.builder,
            minEnergy: buildingPlans.builder[rcl - 1].minEnergy
        },
        repairer: {
            name: "repairer",
            prio: 170,
            energyRole: false,
            min: minimumSpawnOf.repairer,
            max: numberOf.repairer,
            minEnergy: buildingPlans.repairer[rcl - 1].minEnergy
        },
        wallRepairer: {
            name: "wallRepairer",
            prio: 130,
            energyRole: false,
            min: minimumSpawnOf.wallRepairer,
            max: numberOf.wallRepairer,
            minEnergy: buildingPlans.wallRepairer[rcl - 1].minEnergy
        },
        mineralHarvester: {
            name: "mineralHarvester",
            prio: 200,
            energyRole: false,
            min: minimumSpawnOf.mineralHarvester,
            max: numberOf.mineralHarvester,
            minEnergy: buildingPlans.mineralHarvester[rcl - 1].minEnergy
        },
        upgrader: {
            name: "upgrader",
            prio: 80,
            energyRole: false,
            min: minimumSpawnOf.upgrader,
            max: numberOf.upgrader,
            minEnergy: buildingPlans.upgrader[rcl - 1].minEnergy
        },
        runner: {
            name: "runner",
            prio: 15,
            energyRole: true,
            min: minimumSpawnOf.runner,
            max: numberOf.runner,
            minEnergy: buildingPlans.runner[rcl - 1].minEnergy
        },
        scientist: {
            name: "scientist",
            prio: 200,
            energyRole: false,
            min: minimumSpawnOf.scientist,
            max: numberOf.scientist,
            minEnergy: buildingPlans.scientist[rcl - 1].minEnergy
        },
        longDistanceHarvester: {
            name: "longDistanceHarvester",
            prio: 100,
            energyRole: true,
            min: minimumSpawnOf.longDistanceHarvester,
            max: numberOf.longDistanceHarvester,
            minEnergy: buildingPlans.longDistanceHarvester[rcl - 1].minEnergy
        },
        longDistanceMiner: {
            name: "longDistanceMiner",
            prio: 120,
            energyRole: true,
            min: minimumSpawnOf.longDistanceMiner,
            max: numberOf.longDistanceMiner,
            minEnergy: buildingPlans.longDistanceMiner[rcl - 1].minEnergy
        },
        claimer: {
            name: "claimer",
            prio: 140,
            energyRole: false,
            min: minimumSpawnOf.claimer,
            max: numberOf.claimer,
            minEnergy: buildingPlans.claimer[rcl - 1].minEnergy
        },
        bigClaimer: {
            name: "bigClaimer",
            prio: 160,
            energyRole: false,
            min: minimumSpawnOf.bigClaimer,
            max: numberOf.bigClaimer,
            minEnergy: buildingPlans.bigClaimer[rcl - 1].minEnergy
        },
        guard: {
            name: "guard",
            prio: 11,
            energyRole: false,
            min: minimumSpawnOf.guard,
            max: numberOf.guard,
            minEnergy: buildingPlans.guard[rcl - 1].minEnergy
        },
        demolisher: {
            name: "demolisher",
            prio: 230,
            energyRole: true,
            min: minimumSpawnOf.demolisher,
            max: numberOf.demolisher,
            minEnergy: buildingPlans.demolisher[rcl - 1].minEnergy
        },
        longDistanceLorry: {
            name: "longDistanceLorry",
            prio: 220,
            energyRole: true,
            min: minimumSpawnOf.longDistanceLorry,
            max: numberOf.longDistanceLorry,
            minEnergy: buildingPlans.longDistanceLorry[rcl - 1].minEnergy
        },
        longDistanceBuilder: {
            name: "longDistanceBuilder",
            prio: 70,
            energyRole: true,
            min: minimumSpawnOf.longDistanceBuilder,
            max: numberOf.longDistanceBuilder,
            minEnergy: buildingPlans.longDistanceBuilder[rcl - 1].minEnergy
        },
        attacker: {
            name: "attacker",
            prio: 80,
            energyRole: false,
            min: minimumSpawnOf.attacker,
            max: numberOf.attacker,
            minEnergy: buildingPlans.attacker[rcl - 1].minEnergy
        },
        archer: {
            name: "archer",
            prio: 80,
            energyRole: false,
            min: minimumSpawnOf.apaHatchi,
            max: numberOf.apaHatchi,
            minEnergy: buildingPlans.archer[rcl - 1].minEnergy
        },
        healer: {
            name: "healer",
            prio: 90,
            energyRole: false,
            min: minimumSpawnOf.healer,
            max: numberOf.healer,
            minEnergy: buildingPlans.healer[rcl - 1].minEnergy
        },
        einarr: {
            name: "einarr",
            prio: 50,
            energyRole: false,
            min: minimumSpawnOf.einarr,
            max: numberOf.einarr,
            minEnergy: buildingPlans.einarr[rcl - 1].minEnergy
        },
        transporter: {
            name: "transporter",
            prio: 2000,
            energyRole: false,
            min: minimumSpawnOf.transporter,
            max: numberOf.transporter,
            minEnergy: buildingPlans.transporter[rcl - 1].minEnergy
        },
        herocreep: {
            name: "herocreep",
            prio: 90,
            energyRole: false,
            min: minimumSpawnOf.herocreep,
            max: numberOf.herocreep,
            minEnergy: buildingPlans.herocreep[rcl - 1].minEnergy
        },
        scout: {
            name: "scout",
            prio: 20,
            energyRole: false,
            min: minimumSpawnOf.scout,
            max: numberOf.scout,
            minEnergy: buildingPlans.scout[rcl - 1].minEnergy
        }
    };

    if ((numberOf.harvester + numberOf.runner) == 0) {
        // Set up miniHarvester to spawn
        tableImportance.miniharvester.min = 1
    }

    tableImportance = _.filter(tableImportance, function (x) {
        return (!(x.min == 0 || x.min == x.max || x.max > x.min))
    });

    if (tableImportance.length > 0) {
        tableImportance = _.sortBy(tableImportance, "prio");

        let spawnList = [];
        for (let c in tableImportance) {
            for (let i = 0; i < (tableImportance[c].min - tableImportance[c].max); i++) {
                spawnList.push(tableImportance[c].name);
            }
        }

        /* var hostiles = spawnRoom.find(FIND_HOSTILE_CREEPS);

        //Surplus Upgrader Spawning
        if (numberOf.harvester + numberOf.runner > 0 && hostiles.length == 0 && spawnRoom.controller.level < 8) {
            let container = spawnRoom.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE
            });
            let containerEnergy = 0;
            for (let e in container) {
                containerEnergy += container[e].store[RESOURCE_ENERGY];
            }
            if (containerEnergy > (MINSURPLUSENERGY * spawnRoom.controller.level) + 100000) {
                //spawnList.push("upgrader");
            }
        } */

        return spawnList;
    } else {
        return null;
    }
};

Room.prototype.checkForHostiles = function (roomName) {
    //FIXME: add a check for friendly units
    var roomName = this
    var hostiles = roomName.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        var value = {};
        //check hostiles body composition
        var maxAttackBodyParts = 0;
        var maxHealBodyParts = 0;
        var maxCarryBodyParts = 0;
        var numberOfAttackBodyParts = 0;
        var numberOfHealBodyParts = 0;
        var numberOfCarryBodyParts = 0;
        var AttackBodyParts = 0;
        var HealBodyParts = 0;
        var carryBodyParts = 0;
        for (var h in hostiles) {
            AttackBodyParts = 0;
            HealBodyParts = 0;
            carryBodyParts = 0;
            for (var part in hostiles[h].body) {
                if (hostiles[h].body[part].type == ATTACK || hostiles[h].body[part].type == RANGED_ATTACK) {
                    //attacking body part found
                    AttackBodyParts++;
                }
                if (hostiles[h].body[part].type == HEAL) {
                    //attacking body part found
                    HealBodyParts++;
                }
                if (hostiles[h].body[part].type == CARRY) {
                    //attacking body part found
                    carryBodyParts++;
                }
            }
            if (AttackBodyParts > maxAttackBodyParts) {
                maxAttackBodyParts = AttackBodyParts;
                numberOfAttackBodyParts += AttackBodyParts;
            }
            if (HealBodyParts > maxHealBodyParts) {
                maxHealBodyParts = HealBodyParts;
                numberOfHealBodyParts += HealBodyParts;
            }
            if (carryBodyParts > maxCarryBodyParts) {
                maxCarryBodyParts = carryBodyParts;
                numberOfCarryBodyParts += carryBodyParts;
            }
        }

        value["numHostiles"] = hostiles.length;

        value["maxAttackBodyParts"] = maxAttackBodyParts;
        value["numberOfAttackBodyParts"] = numberOfAttackBodyParts;

        value["maxHealBodyParts"] = maxHealBodyParts;
        value["numberOfHealBodyParts"] = numberOfHealBodyParts;

        value["maxCarryBodyParts"] = maxCarryBodyParts;
        value["numberOfCarryBodyParts"] = numberOfCarryBodyParts;

        if (hostiles.length == 1 && maxAttackBodyParts == 0 && maxHealBodyParts == 0 && maxCarryBodyParts == 0) {
            value["scout"] = true
        }

        if (!_.isEmpty(hostiles[0].owner)) {
            value["username"] = hostiles[0].owner.username
        }

        return value;
    } else {
        return null;
    }
};

Room.prototype.getType = function (roomName) {
    const res = /[EW](\d+)[NS](\d+)/.exec(roomName);
    const [, EW, NS] = res;
    const EWI = EW % 10,
        NSI = NS % 10;
    if (EWI === 0 || NSI === 0) {
        return 'Highway';
    } else if (EWI === 5 && NSI === 5) {
        return 'Center';
    } else if (Math.abs(5 - EWI) <= 1 && Math.abs(5 - NSI) <= 1) {
        return 'SourceKeeper';
    } else {
        return 'Room';
    }
};