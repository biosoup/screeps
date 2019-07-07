/** ADD
- structure placement
    - road building system
    - bunker around spawn


*/

// find best routes between spawn bunker and resources
// OR find best routes between spawn and room borders
Room.prototype.roads =
    function () {

        //add task for it to be built
    };

//place rampard and extensions automatically around spawn
Room.prototype.bunker =
    function () {

        //add task for it to be built
    };

Room.prototype.refreshContainerSources =
    function (r) {
        r = Game.rooms[r];
        //get home room storage
        if (r.storage != undefined) {
            //get rooms with longDistanceMiners in it
            var allMinerCreeps = _.filter(Game.creeps, (c) => c.memory.home == r.name && c.memory.role == "longDistanceMiner");
            var inRooms = _.map(allMinerCreeps, "memory.target")

            //get continers in those rooms
            var containerList = [];
            for (let roomName of inRooms) {
                if (!_.isEmpty(roomName)) {
                    if (Game.rooms[roomName] != undefined) {
                        var roomContainers = Game.rooms[roomName].find(FIND_STRUCTURES, {
                            filter: s => s.structureType == STRUCTURE_CONTAINER
                        });
                        containerList = [...containerList, ...roomContainers]
                    }
                }
            }

            storagePosition = r.storage.pos;

            //if the memory space is not there
            if (r.memory.containerSources === undefined) {
                r.memory.containerSources = {};
            }

            //if refersh time, empty all continer data
            if ((Game.time % DELAYFLOWROOMCHECK) == 0 && Game.cpu.bucket > 5000) {
                r.memory.containerSources = {};
            }

            //get info about containers
            for (let container of containerList) {
                if (container != undefined && container != null) {
                    if (r.memory.containerSources[container.id] != undefined) {
                        if ((r.memory.containerSources[container.id].time + 30) < Game.time) {
                            //if the container ID exists, just update it
                            r.memory.containerSources[container.id].id = container.id
                            r.memory.containerSources[container.id].pos = container.pos
                            r.memory.containerSources[container.id].energy = container.store[RESOURCE_ENERGY]
                            r.memory.containerSources[container.id].time = Game.time
                            r.memory.containerSources[container.id].ed = container.store[RESOURCE_ENERGY] / (r.memory.containerSources[container.id].distance * 2)
                        }
                    } else {
                        //if it does not exists, create it and calculate distance
                        r.memory.containerSources[container.id] = {}
                        r.memory.containerSources[container.id].id = container.id
                        r.memory.containerSources[container.id].pos = container.pos
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
            //console.log(r.name + " " + JSON.stringify(r.memory.containerSources));

            /*  
            W28N14 {"5cfed049c4be3409e53dab3d":{"pos":{"x":15,"y":35,"roomName":"W27N15"},"energy":2000,"time":8004585,"distance":82},"5cff24da5b0b7e667bffeb4f":{"pos":{"x":38,"y":21,"roomName":"W27N14"},"energy":1610,"time":8004585,"distance":75},"5cff237a63738f09b78089bb":{"pos":{"x":34,"y":17,"roomName":"W28N15"},"energy":1470,"time":8004585,"distance":81},"5cfed38c15b6e542a338d399":{"pos":{"x":20,"y":10,"roomName":"W28N13"},"energy":1207,"time":8004585,"distance":19},"5cfeeb0fff1e577e6595b3d4":{"pos":{"x":25,"y":16,"roomName":"W28N13"},"energy":1756,"time":8004585,"distance":28}}
            W29N14 {"5d0748ce001e5f10d3711de2":{"pos":{"x":5,"y":23,"roomName":"W29N13"},"energy":1950,"time":8004585,"distance":36}}
            W32N13 {"5d09fae741a69b286384a8fd":{"pos":{"x":23,"y":8,"roomName":"W33N13"},"energy":0,"time":8004585,"distance":70},"5d0a00100c39a428613cc024":{"pos":{"x":35,"y":24,"roomName":"W33N13"},"energy":2000,"time":8004585,"distance":54}} 
            */
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
            distanceName = _.first(_.map(_.sortByOrder(distance, ['dist'], ['asc']), _.values))[0];

            spawnRoom.createFlag(25, 25, "DEFEND-" + spawnRoom.name + "-" + distanceName, COLOR_WHITE, COLOR_YELLOW)
            console.log(spawnRoom.name + " has been defeated!! Sending recovery team!!")

            //FIXME: claim flag only when safe –> when full complement of guards is in place

            //var inRooms = _.sum(allMyCreeps, (c) => c.memory.role == 'guard' && c.memory.target == spawnRoom.name)
            spawnRoom.createFlag(24, 24, "CLAIM-" + spawnRoom.name + "-" + distanceName, COLOR_GREY, COLOR_PURPLE)
        } else {
            console.log(spawnRoom.name + " has been defeated!! Occupied by " + hostiles.length)
        }
        return true;
    } else {
        var greyFlags = _.filter(Game.flags, (f) => f.color == COLOR_WHITE && f.pos.roomName == spawnRoom.name)
        if (spawnRoom.controller.level >= 3 && !_.isEmpty(greyFlags) && !_.isEmpty(spawnRoom.towers)) {
            console.log(JSON.stringify(greyFlags))
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
        let roomMineralType;

        //Check mineral type of the room
        if (numberOfExploitableMineralSources > 0) {
            // Assumption: There is only one mineral source per room
            let mineral = Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]);
            if (mineral != undefined) {
                roomMineralType = mineral.mineralType;
            }
        }

        // Define spawn minima
        let minimumSpawnOf = {};
        //Volume defined by flags
        minimumSpawnOf["longDistanceHarvester"] = 0;
        minimumSpawnOf["claimer"] = 0;
        minimumSpawnOf["bigClaimer"] = 0; //unused
        minimumSpawnOf["guard"] = 0;
        minimumSpawnOf["miner"] = 0;
        minimumSpawnOf["longDistanceMiner"] = 0;
        minimumSpawnOf["demolisher"] = 0; //unused
        minimumSpawnOf["spawnAttendant"] = 0;
        minimumSpawnOf["longDistanceLorry"] = 0;
        minimumSpawnOf["longDistanceBuilder"] = 0;
        minimumSpawnOf["attacker"] = 0; //unused
        minimumSpawnOf["healer"] = 0; //unused
        minimumSpawnOf["einarr"] = 0; //unused
        minimumSpawnOf["archer"] = 0; //unused
        minimumSpawnOf["scientist"] = 0; //unused
        minimumSpawnOf["transporter"] = 0;
        minimumSpawnOf["SKHarvester"] = 0; //unused
        minimumSpawnOf["SKHauler"] = 0; //unused

        // LL code for miners and long distances

        //room interests
        let roomInterests = {}

        //get all flags with code PURPLE for remote HARVESTERS
        var redFlags = _.filter(Game.flags, (f) => f.color == COLOR_RED && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
        //get remote mining rooms for this spawnroom
        if (!_.isEmpty(redFlags)) {
            for (var flag of redFlags) {
                //roomInterests.room = [harvesters, sources/miners, lorries, builders, claimers, guards]
                roomInterests[flag.pos.roomName] = [flag.secondaryColor, 0, 0, 1, 0, 1]
            }
        }

        // flag based remote mining
        if (!_.isEmpty(spawnRoom.storage)) {
            //get all flags with code PURPLE for remote MINERS
            var purpleFlags = _.filter(Game.flags, (f) => f.color == COLOR_PURPLE && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
            //get remote mining rooms for this spawnroom
            if (!_.isEmpty(purpleFlags)) {
                for (var flag of purpleFlags) {
                    //roomInterests.room = [harvesters, sources/miners, lorries, builders, claimers, guards]
                    //builders & guard = boolean
                    roomInterests[flag.pos.roomName] = [0, flag.secondaryColor, 1.5, 1, 1, 1]
                    //FIXME: dynamic number of lorries, based on distance, e/t and RCL
                }
            }
        }

        //flag based room defense
        if (!_.isEmpty(spawnRoom.storage)) {
            //get gcl and number of rooms
            var whiteFlags = _.filter(Game.flags, (f) => f.color == COLOR_WHITE && _.last(_.words(f.name, /[^-]+/g)) == spawnRoom.name)
            if (!_.isEmpty(whiteFlags)) {
                for (var flag of whiteFlags) {
                    //roomInterests.room = [harvesters, sources/miners, lorries, builders, claimers, guards]
                    //builders & guard = boolean
                    roomInterests[flag.pos.roomName] = [0, 0, 0, 2, 0, flag.secondaryColor]
                    var defend = flag.pos.roomName;
                }
            }
        }

        //flag based room claiming
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
                        if (Game.room[flag.room].controller.my) {
                            roomInterests[flag.pos.roomName] = [0, 0, 0, flag.secondaryColor, 0, 1]
                        } else {
                            roomInterests[flag.pos.roomName] = [0, 0, 0, flag.secondaryColor, 1, 1]
                            var newRoom = flag.pos.roomName;
                        }
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
                        } else {
                            //remove flag
                            flag.remove()
                        }
                    }
                }
            }
        }



        //console.log(spawnRoom.name+" "+JSON.stringify(roomInterests))

        let longDistanceHarvester = {}
        let longDistanceMiner = {}
        let longDistanceLorry = {}
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
                minimumSpawnOf.longDistanceLorry += roomInterests[interest][2];
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
                    if ((numOfConstrustions.length + numOfRepairsites.length) > 0) {
                        roomInterests[interest][3] = roomInterests[interest][3]
                    } else {
                        roomInterests[interest][3] = 0
                    }

                    minimumSpawnOf.longDistanceBuilder += roomInterests[interest][3];
                    if (inRooms < roomInterests[interest][3]) {
                        longDistanceBuilder[interest] = roomInterests[interest][3]
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
                if (Game.rooms[interest] != undefined) {
                    //if hostiles present, spawn a task force!
                    var numHostiles = Game.rooms[interest].find(FIND_HOSTILE_CREEPS)
                    if (numHostiles.length > 0) {
                        //check hostiles body composition
                        var maxAttackBodyParts = 0;
                        var AttackBodyParts = 0;
                        for (var h in hostiles) {
                            AttackBodyParts = 0;
                            console.log(JSON.stringify(hostiles[h].body))
                            for (var part in hostiles[h].body) {
                                if (hostiles[h].body[part].type == ATTACK || hostiles[h].body[part].type == RANGED_ATTACK) {
                                    //attacking body part found
                                    AttackBodyParts++;
                                }
                            }
                            if (AttackBodyParts > maxAttackBodyParts) {
                                maxAttackBodyParts = AttackBodyParts;
                            }
                        }

                        if (AttackBodyParts > 0) {
                            //roomInterests[interest][5] = numHostiles.length * 2;
                            console.log("being attacked by " + AttackBodyParts + " attack parts")
                        } else {
                            console.log("R enemy scout in " + interest)
                        }

                        roomInterests[interest][5] = numHostiles.length * 2;

                        //hostiles, do not do anything else
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
                    } else if (interest == defend) {
                        roomInterests[interest][5] = roomInterests[interest][5];
                    } else {
                        roomInterests[interest][5] = 0
                    }
                    minimumSpawnOf.guard += roomInterests[interest][5];
                    if (inRooms < roomInterests[interest][5]) {
                        guard[interest] = roomInterests[interest][5]
                    }
                    if (minimumSpawnOf.guard > 0) {
                        console.log(interest + " " + JSON.stringify(guard) + " " + minimumSpawnOf.guard)
                    }
                }
            }
        }

        //console.log(spawnRoom.name + " " + JSON.stringify(guard) + " " + minimumSpawnOf.guard)

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
        if (spawnRoom.storage != undefined) {
            if (spawnRoom.storage.store[RESOURCE_ENERGY] > (100000 * spawnRoom.controller.level) && spawnRoom.controller.level < 8) {
                //add more upgraders
                var mutiply = spawnRoom.storage.store[RESOURCE_ENERGY] / (100000 * spawnRoom.controller.level)
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
            minimumSpawnOf["wallRepairer"] = Math.ceil(numberOfSources * 0.5);
        }


        // spawnAttendant
        if (spawnRoom.storage != undefined) {
            minimumSpawnOf["spawnAttendant"] = 1;
            if (spawnRoom.storage.store[RESOURCE_ENERGY] > 50000 && spawnRoom.energyAvailable < (spawnRoom.energyCapacityAvailable / 2)) {
                //minimumSpawnOf["spawnAttendant"] = 2;
            }

            //pull back on lorries when storage is overflowing
            if (_.sum(spawnRoom.storage.store) > 900000) {
                minimumSpawnOf.longDistanceLorry = Math.ceil(minimumSpawnOf.longDistanceLorry / 3);
            } else {
                //round that number
                minimumSpawnOf.longDistanceLorry = Math.ceil(minimumSpawnOf.longDistanceLorry);
            }
        }

        var numberOfMiners = _.sum(allMyCreeps, (c) => c.memory.role == 'miner' && c.memory.home == spawnRoom.name)
        var numberOfSA = _.sum(allMyCreeps, (c) => c.memory.role == 'spawnAttendant' && c.memory.home == spawnRoom.name)
        var numberOfLorries = _.sum(allMyCreeps, (c) => c.memory.role == 'lorry' && c.memory.home == spawnRoom.name)

        // lorry, Harvester & Repairer
        minimumSpawnOf["miner"] = numberOfSources;

        //minimumSpawnOf["lorry"] = minimumSpawnOf.miner - numberOfSA
        minimumSpawnOf["lorry"] = 1;


        minimumSpawnOf["harvester"] = numberOfSources - Math.ceil(numberOfMiners / 2) - numberOfLorries - numberOfSA
        //minimumSpawnOf["builder"] = Math.ceil(numberOfSources * 0.5);

        //console.log(spawnRoom.name+" "+minimumSpawnOf["harvester"])

        /** Rest **/

        // Miner
        minimumSpawnOf["mineralHarvester"] = numberOfExploitableMineralSources;
        if (spawnRoom.storage == undefined || Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]) == null || Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]).mineralAmount == 0) {
            minimumSpawnOf.mineralHarvester = 0;
        }
        //console.log("mineralHarvester "+spawnRoom.name+"–"+minimumSpawnOf["mineralHarvester"]+"–"+numberOfExploitableMineralSources)

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
                        delta = checkTerminalLimits(spawnRoom, res);
                        terminalDelta += Math.abs(delta.amount);
                        //console.log(terminalDelta)
                    }

                    for (var res in spawnRoom.storage.store) {
                        delta = checkTerminalLimits(spawnRoom, res);
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

        // Adjustments in case of hostile presence
        var hostileValues = spawnRoom.checkForHostiles(spawnRoom);
        var numberOfTowers = spawnRoom.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_TOWER && s.energy > 0
        });
        if (!_.isEmpty(hostileValues)) {
            if (hostileValues.numHostiles > 0) {
                console.log("Being attacked by " + hostileValues.numHostiles + " with:" + hostileValues.maxAttackBodyParts + " attack parts")

                //Get number of towers
                if (numberOfTowers > 0) {
                    //lower by the amount of towers
                    hostileValues.numHostiles = hostileValues.numHostiles - numberOfTowers;
                }

                minimumSpawnOf.guard = hostileValues.numHostiles * 2;
                guard[spawnRoom.name] = hostileValues.numHostiles * 2;

                //limit everything else
                minimumSpawnOf.upgrader = 0;
                minimumSpawnOf.builder = 0;
                minimumSpawnOf.longDistanceHarvester = 0;
                minimumSpawnOf.mineralHarvester = 0;
                minimumSpawnOf.spawnAttendant = 0;
                minimumSpawnOf.longDistanceMiner = 0;
                minimumSpawnOf.longDistanceLorry = 0;
                minimumSpawnOf.longDistanceBuilder = 0;
                minimumSpawnOf.demolisher = 0;
                minimumSpawnOf.wallRepairer *= 2;
            }
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

        var containerEnergy = spawnRoom.find(FIND_STRUCTURES, {
            filter: (s) => s.structureType == STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 1900
        });

        /* 
        FIXME:
            - more agressive spawning on lower RCL
            - fixed numbers for now
        */

        if (rcl == 2) {
            minimumSpawnOf.lorry = 0
        }

        if (rcl <= 3) {
            let sources = spawnRoom.find(FIND_SOURCES);
            var freeSpots = 0
            for (var s of sources) {
                //check how many free space each has
                var freeSpaces = spawnRoom.lookForAtArea(LOOK_TERRAIN, s.pos.y - 1, s.pos.x - 1, s.pos.y + 1, s.pos.x + 1, true);
                freeSpaces = freeSpaces.filter(f => f.terrain == "wall")
                freeSpots = freeSpots + (9 - freeSpaces.length)
            }
            minimumSpawnOf.harvester = freeSpots;
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
            minimumSpawnOf.spawnAttendant = minimumSpawnOf.spawnAttendant + 1
        }
        let spawnList = this.getSpawnList(spawnRoom, minimumSpawnOf, numberOf);
        let spawnEntry = 0;

        if (spawnList != null && spawnList.length > 0) {
            for (var s in spawnRoom.memory.roomArray.spawns) {
                // Iterate through spawns
                let testSpawn = Game.getObjectById(spawnRoom.memory.roomArray.spawns[s]);
                if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {
                    var debug = [spawnList, minimumSpawnOf, numberOf]
                    //console.log(spawnRoom.name + " " + JSON.stringify(debug) + " *** ticks needed: " + neededTicksToSpawn)

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
                    } else if (spawnList[spawnEntry] == "guard") {
                        if (_.isEmpty(guard)) {
                            console.log("ERR spawning a GUARD!! " + JSON.stringify(minimumSpawnOf.guard))
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
            prio: 5,
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
        spawnAttendant: {
            name: "spawnAttendant",
            prio: 15,
            energyRole: false,
            min: minimumSpawnOf.spawnAttendant,
            max: numberOf.spawnAttendant,
            minEnergy: buildingPlans.spawnAttendant[rcl - 1].minEnergy
        },
        lorry: {
            name: "lorry",
            prio: 20,
            energyRole: true,
            min: minimumSpawnOf.lorry,
            max: numberOf.lorry,
            minEnergy: buildingPlans.lorry[rcl - 1].minEnergy
        },
        scientist: {
            name: "scientist",
            prio: 220,
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
            prio: 150,
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
            prio: 2400,
            energyRole: false,
            min: minimumSpawnOf.transporter,
            max: numberOf.transporter,
            minEnergy: buildingPlans.transporter[rcl - 1].minEnergy
        }
    };

    if ((numberOf.harvester + numberOf.lorry + numberOf.spawnAttendant) == 0) {
        // Set up miniHarvester to spawn
        tableImportance.miniharvester.min = 1;
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

        var hostiles = spawnRoom.find(FIND_HOSTILE_CREEPS);

        //Surplus Upgrader Spawning
        if (numberOf.harvester + numberOf.lorry + numberOf.spawnAttendant > 0 && hostiles.length == 0 && spawnRoom.controller.level < 8) {
            let container = spawnRoom.find(FIND_STRUCTURES, {
                filter: (s) => s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE
            });
            let containerEnergy = 0;
            for (let e in container) {
                containerEnergy += container[e].store[RESOURCE_ENERGY];
            }
            if (containerEnergy > (100000 * spawnRoom.controller.level) + 100000) {
                //spawnList.push("upgrader");
            }
        }

        return spawnList;
    } else {
        return null;
    }
};

Room.prototype.checkForHostiles = function (roomName) {
    /*  TODO:
        return number of hostiles
        return number of attack & heal parts combined
    */

    //FIXME: add a check for friendly units / Invaders
    var hostiles = roomName.find(FIND_HOSTILE_CREEPS);
    if (hostiles.length > 0) {
        var value = {};
        //check hostiles body composition
        var maxAttackBodyParts = 0;
        var maxHealBodyParts = 0;
        var numberOfAttackBodyParts = 0;
        var numberOfHealBodyParts = 0;
        var AttackBodyParts = 0;
        var HealBodyParts = 0;
        for (var h in hostiles) {
            AttackBodyParts = 0;
            for (var part in hostiles[h].body) {
                if (hostiles[h].body[part].type == ATTACK || hostiles[h].body[part].type == RANGED_ATTACK) {
                    //attacking body part found
                    AttackBodyParts++;
                }
                if (hostiles[h].body[part].type == HEAL) {
                    //attacking body part found
                    HealBodyParts++;
                }
            }
            if (AttackBodyParts > maxAttackBodyParts) {
                maxAttackBodyParts = AttackBodyParts;
                numberOfAttackBodyParts += AttackBodyParts;
            }
            if (HealBodyParts > maxHealBodyParts) {
                maxHealBodyParts = HealBodyParts;
                numberOfHealBodyParts += HealBodyParts
            }
        }

        value["numHostiles"] = hostiles.length;

        value["maxAttack"] = maxAttackBodyParts;
        value["numAttack"] = numberOfAttackBodyParts;

        value["maxHeal"] = maxHealBodyParts;
        value["numHeal"] = numberOfHealBodyParts;

        if (hostiles.length == 1 && maxAttackBodyParts == 0 && maxHealBodyParts == 0) {
            value["scout"] = true
        }

        return value;
    } else {
        return null;
    }
};