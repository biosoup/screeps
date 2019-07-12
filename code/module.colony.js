//module: colony

/*
- gather colony data
    - layout
    - rooms terrain
    - put all into segments
        - one segment for each colony?
- figure out current colony status
    - level
    - what is happening
    - what needs to happen
- figure current status
    - main room
    - remote rooms
    - interest rooms
- figure current tasks
    - run logic based on them
- run colony logic
    - flag logic
    - spawning
        - colony que
        - empire requests
        - prioritization
        - spawn assigment
        - creep memory preparation
    - link logic
    - storage logic
    - terminal logic
    - market logic
    - labs logic
- gather colony stats and send them to empire
- create room visuals



*/
module.exports = {
    refreshContainerSources: function (r) {
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
    },

    linksRun: function (r) {
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
    },

    checkForDefeat: function (spawnRoom) {
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
                //console.log(JSON.stringify(greyFlags))
                for (var flag of greyFlags) {
                    flag.remove()
                }
            }
            return false;
        }
    },
};