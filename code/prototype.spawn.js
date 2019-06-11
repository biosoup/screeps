var listOfRoles = ['harvester', 'builder', 'upgrader', 'miner', 'lorry', 'claimer', 'spawnAttendant', 'mineralHarvester'];

// create a new function for StructureSpawn
StructureSpawn.prototype.spawnCreepsIfNecessary =
    function () {
        const startCpu = Game.cpu.getUsed();

        /** @type {Room} */
        var room = this.room;

        var spawningWhat = '';

        //if spawn is not working
        if (this.spawning == null) {
            // find all creeps in room
            /** @type {Array.<Creep>} */
            var creepsInRoom = room.find(FIND_MY_CREEPS);

            // count the number of creeps alive for each role in this room
            // _.sum will count the number of properties in Game.creeps filtered by the
            //  arrow function, which checks for the creep being a specific role
            /** @type {Object.<string, number>} */
            var numberOfCreeps = {};
            for (var role of listOfRoles) {
                numberOfCreeps[role] = _.sum(creepsInRoom, (c) => c.memory.role == role);
            }
            var maxEnergy = room.energyCapacityAvailable;
            var name = undefined;

            // if no harvesters are left AND either no miners or no lorries are left
            //  create a backup creep
            if (numberOfCreeps['harvester'] == 0 && numberOfCreeps['spawnAttendant'] == 0) {
                // if there are still miners or enough energy in Storage left
                if (numberOfCreeps['miner'] > 0 || (room.storage != undefined && room.storage.store[RESOURCE_ENERGY] >= 150 + 550)) {
                    // create a lorry
                    name = this.createLorry(room.energyAvailable, 'spawnAttendant', room.name);
                    spawningWhat = 'lorry1';
                }
                // if there is no miner and not enough energy in Storage left
                else {
                    // create a harvester because it can work on its own
                    name = this.createCustomCreep(room.energyAvailable, 'harvester');
                    spawningWhat = 'harvester';
                }
            }
            // if no backup creep is required
            else {
                // check if all sources have miners
                var sources = room.find(FIND_SOURCES);

                // iterate over all sources
                for (var source of sources) {

                    // if the source has no miner
                    if (!_.some(creepsInRoom, c => c.memory.role == 'miner' && c.memory.sourceId == source.id)) {

                        // check whether or not the source has a container
                        /** @type {Array.StructureContainer} */
                        var containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                            filter: s => s.structureType == STRUCTURE_CONTAINER
                        });

                        // if there is a container next to the source
                        if (containers.length > 0) {
                            // spawn a miner
                            name = this.createMiner(source.id, maxEnergy, room.name, room.name);
                            spawningWhat = 'miner';
                            break;
                        }
                    }
                }
            }

            // if none of the above caused a spawn command check for other roles
            if (name == undefined) {

                for (var role of listOfRoles) {
                    // check for claim order
                    var numberOfClaimers = {};
                    var targetRoom = room.name;

                    if (role == 'claimer' && this.memory.minCreeps.claimers > 0) {
                        for (var roomName in this.memory.claimer) {
                            numberOfClaimers[roomName] = _.sum(Game.creeps, (c) => c.memory.role == 'claimer' && c.memory.target == roomName)

                            if (numberOfClaimers[roomName] < this.memory.claimer[roomName]) {
                                name = this.createClaimer(roomName);
                                spawningWhat = 'claimer';
                            }
                        }
                    }

                    // if no claim order was found, check other roles
                    else if (numberOfCreeps[role] < this.memory.minCreeps[role]) {
                        var sources = room.find(FIND_SOURCES);
                        for (var source of sources) {
                            var containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
                                filter: s => s.structureType == STRUCTURE_CONTAINER
                            });
                        }

                        var terminal = source.room.find(FIND_STRUCTURES, {
                            filter: s => s.structureType == STRUCTURE_TERMINAL
                        });


                        if (role == 'lorry' && containers.length > 0) {
                            //spawn lorry, but only when there are containers for miners
                            name = this.createLorry(maxEnergy, role, room.name);
                            spawningWhat = 'lorry2';
                        } else if (role == 'spawnAttendant') {
                            name = this.createLorry(maxEnergy, role, room.name);
                            spawningWhat = 'spawnAttendant';

                        } else if (role != 'claimer' && role != 'miner' && role != 'mineralHarvester') {
                            name = this.createCustomCreep(maxEnergy, role, targetRoom);
                            spawningWhat = "c-" + role;

                        } else if (role == 'miner' && containers.length > 0) {
                            ////spawn miner, but only when there are containers for miners
                            name = this.createCustomCreep(maxEnergy, role, targetRoom);
                            spawningWhat = "miner-c";
                        } else if (role == 'mineralHarvester' && terminal != undefined) {
                            name = this.createCustomCreep(maxEnergy, role, targetRoom);
                            spawningWhat = "mineralHarvester-c";
                        }
                        break;

                    }
                }
            }

            //DEBUG for what is wrong
            //console.log(name);

            // if none of the above caused a spawn command check for LongDistanceMiners
            /** @type {Object.<string, number>} */
            var numberOfLongDistanceMiners = {};
            if (name == undefined) {
                // count the number of long distance miners globally
                for (var roomName in this.memory.minLongDistanceMiners) {
                    numberOfLongDistanceMiners[roomName] = _.sum(Game.creeps, (c) =>
                        c.memory.role == 'longDistanceMiner' && c.memory.target == roomName)
                    //console.log(numberOfLongDistanceMiners[roomName] +" "+this.memory.minLongDistanceMiners[roomName])

                    if (numberOfLongDistanceMiners[roomName] < this.memory.minLongDistanceMiners[roomName]) {
                        name = this.createMiner(0, maxEnergy, room.name, roomName, "longDistanceMiner");
                        spawningWhat = 'longDistanceMiner';
                    }
                }
            }

            // if none of the above caused a spawn command check for LongDistanceLorries
            /** @type {Object.<string, number>} */
            var numberOfLongDistanceLorries = {};
            if (name == undefined) {
                // count the number of long distance harvesters globally
                for (var roomName in this.memory.minLongDistanceLorries) {
                    numberOfLongDistanceLorries[roomName] = _.sum(Game.creeps, (c) =>
                        c.memory.role == 'longDistanceLorry' && c.memory.target == roomName)

                    if (numberOfLongDistanceLorries[roomName] < this.memory.minLongDistanceLorries[roomName]) {
                        name = this.createLorry(maxEnergy, "longDistanceLorry", room.name, roomName);
                        spawningWhat = 'longDistanceLorry';
                    }
                }
            }

            // if none of the above caused a spawn command check for LongDistanceHarvesters
            /** @type {Object.<string, number>} */
            var numberOfLongDistanceHarvesters = {};
            if (name == undefined) {
                // count the number of long distance harvesters globally
                for (var roomName in this.memory.minLongDistanceHarvesters) {
                    numberOfLongDistanceHarvesters[roomName] = _.sum(Game.creeps, (c) =>
                        c.memory.role == 'longDistanceHarvester' && c.memory.target == roomName)

                    if (numberOfLongDistanceHarvesters[roomName] < this.memory.minLongDistanceHarvesters[roomName]) {
                        name = this.createLongDistanceHarvester(maxEnergy, 5, room.name, roomName);
                        spawningWhat = 'longDistanceHarvester';
                    }
                }
            }

            // if none of the above caused a spawn command check for LongDistanceBuilders
            var numberOfLongDistanceBuilders = {};
            if (name == undefined) {
                // count the number of long distance harvesters globally
                for (var roomName in this.memory.minLongDistanceBuilders) {
                    numberOfLongDistanceBuilders[roomName] = _.sum(Game.creeps, (c) =>
                        c.memory.role == 'builder' && c.memory.target == roomName)

                    if (numberOfLongDistanceBuilders[roomName] < this.memory.minLongDistanceBuilders[roomName]) {
                        name = this.createCustomCreep(800, 'builder', roomName);
                        spawningWhat = 'longDistanceBuilder';
                    }
                }
            }

            var numberOfGuards = {};
            if (name == undefined) {
                // count the number of guards
                for (var roomName in this.memory.minGuards) {
                    numberOfGuards[roomName] = _.sum(Game.creeps, (c) => c.memory.role == 'guard' && c.memory.target == roomName)

                    if (numberOfGuards[roomName] < this.memory.minGuards[roomName]) {
                        name = this.createGuard(room.name, roomName);
                        spawningWhat = 'guard';
                    }
                }
            }

            var debug = 0;

            // print name to console if spawning was a success
            if (name != undefined && _.isString(name) || debug == 1) {
                //console.log(this.name + " in " + this.room.name + " spawned new creep: " + name + " (" + Game.creeps[name].memory.role + ")");
                for (var role of listOfRoles) {
                    //console.log(role + ": " + numberOfCreeps[role]);
                    //console.log(role + " " + (this.memory.minCreeps[role] - numberOfCreeps[role]) + " current: " + numberOfCreeps[role] + " out of  " + this.memory.minCreeps[role]);
                }
                for (var roomName in numberOfLongDistanceHarvesters) {
                    //console.log("LongDistanceHarvester" + roomName + ": " + numberOfLongDistanceHarvesters[roomName]);
                }
                for (var roomName in numberOfGuards) {
                    //console.log("Guard" + roomName + ": " + numberOfGuards[roomName]);
                }
            }

            if (spawningWhat != '' && name != undefined) {
                console.log(this.name + " at " + Game.time + " wants: " + spawningWhat + " resulting in:" + name)
            }

            //kontrola spotreby CPU
            const elapsed = Game.cpu.getUsed() - startCpu;
            //console.log('Spawning has used '+elapsed+' CPU time');
        }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createCustomCreep =
    function (energy, roleName, target) {
        // create a balanced body as big as possible with the given energy
        var numberOfParts = Math.floor(energy / 200);

        var targetRoom = target;
        // make sure the creep is not too big (more than 45 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(45 / 3));
        var body = [];
        for (var i = 0; i < numberOfParts; i++) {
            body.push(WORK);
        }
        for (var i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (var i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body and the given role
        return this.createCreep(body, roleName + "-c-" + this.name + "-" + targetRoom + "-" + Game.time, {
            role: roleName,
            working: false,
            targetW: false,
            target: targetRoom
        });
    };


StructureSpawn.prototype.createLongDistanceHarvester =
    function (energy, numberOfWorkParts, home, target) {
        // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
        var body = [];
        for (var i = 0; i < numberOfWorkParts; i++) {
            body.push(WORK);
        }

        // 150 = 100 (cost of WORK) + 50 (cost of MOVE)
        energy -= 150 * numberOfWorkParts;

        var numberOfParts = Math.floor(energy / 100);
        // make sure the creep is not too big (more than 35 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor((35 - numberOfWorkParts * 2) / 2));
        for (var i = 0; i < numberOfParts; i++) {
            body.push(CARRY);
        }
        for (var i = 0; i < numberOfParts + numberOfWorkParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body
        return this.createCreep(body, 'longDistanceHarvester-' + target + "-" + Game.time, {
            role: 'longDistanceHarvester',
            home: home,
            target: target
        });
    };


StructureSpawn.prototype.createGuard =
    function (home, target) {
        return this.createCreep([TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, MOVE, MOVE, ATTACK, MOVE, MOVE, RANGED_ATTACK, MOVE, RANGED_ATTACK, HEAL], 'guard-' + target + "-" + Game.time, {
            role: 'guard',
            home: home,
            target: target
        });
    };


StructureSpawn.prototype.createClaimer =
    function (target) {
        return this.createCreep([CLAIM, MOVE, MOVE, MOVE], 'claimer-' + target + "-" + Game.time, {
            role: 'claimer',
            target: target
        });
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createMiner =
    function (sourceId, energy, home, target, role = 'miner') {
        if (role == "longDistanceMiner") {
            if (energy > 860) {
                energy = 1050
            }
            var numberOfParts = Math.floor((energy - 400) / 100);
            var body = [];
            body.push(MOVE)
            body.push(MOVE)
            body.push(MOVE)
            body.push(MOVE)
            body.push(MOVE)
            body.push(CARRY)
            body.push(CARRY)
            body.push(CARRY)
            body.push(CARRY)
            for (var i = 0; i < numberOfParts; i++) {
                body.push(WORK);
            }
        } else {
            if (energy > 860) {
                energy = 850
            }
            var numberOfParts = Math.floor((energy - 200 - 50) / 100);
            var body = [];
            body.push(MOVE)
            body.push(CARRY)
            body.push(CARRY)
            body.push(CARRY)
            body.push(CARRY)
            for (var i = 0; i < numberOfParts; i++) {
                body.push(WORK);
            }
        }
        return this.createCreep(body, role + '-' + this.name + "-" + target + "-" + Game.time, {
            role: role,
            sourceId: sourceId,
            home: home,
            target: target
        });
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createLorry =
    function (energy, role = 'lorry', home, target) {
        // create a body with twice as many CARRY as MOVE parts
        var numberOfParts = Math.floor(energy / 150);
        // make sure the creep is not too big (more than 20 parts)
        numberOfParts = Math.min(numberOfParts, Math.floor(20 / 3));
        var body = [];
        for (var i = 0; i < numberOfParts * 2; i++) {
            body.push(CARRY);
        }
        for (var i = 0; i < numberOfParts; i++) {
            body.push(MOVE);
        }

        // create creep with the created body and the role 'lorry'
        return this.createCreep(body, role + '-' + this.name + "-" + target + "-" + Game.time, {
            role: role,
            home: home,
            target: target
        });
    };