require("creep-tasks");

let builder = require('role.builder')
let upgrader = require('role.upgrader')
let harvester = require('role.harvester')
let longDistanceHarvester = require('role.longDistanceHarvester')
let claimer = require('role.claimer')
let miner = require('role.miner')
let lorry = require('role.lorry')
let guard = require('role.guard')
let spawnAttendant = require('role.spawnAttendant')
let transporter = require('role.transporter')
let mineralHarvester = require('role.mineralHarvester')
let longDistanceMiner = require('role.longDistanceMiner')
let longDistanceLorry = require('role.longDistanceLorry')
let longDistanceBuilder = require('role.longDistanceBuilder')
let scientist = require('role.scientist')
let wallRepairer = require('role.wallRepairer')


Creep.prototype.runRole =
    function () {
        //console.log(this)
        if (this.memory.role == 'builder') {
            builder.newTask(this)
        } else if (this.memory.role == 'upgrader') {
            upgrader.newTask(this)
        } else if (this.memory.role == 'harvester') {
            harvester.newTask(this)
        } else if (this.memory.role == 'longDistanceHarvester') {
            longDistanceHarvester.newTask(this)
        } else if (this.memory.role == 'claimer') {
            claimer.newTask(this)
        } else if (this.memory.role == 'miner') {
            miner.newTask(this)
        } else if (this.memory.role == 'lorry') {
            lorry.newTask(this)
        } else if (this.memory.role == 'guard') {
            guard.newTask(this)
        } else if (this.memory.role == 'spawnAttendant') {
            spawnAttendant.newTask(this)
        } else if (this.memory.role == 'transporter') {
            transporter.newTask(this)
        } else if (this.memory.role == 'mineralHarvester') {
            mineralHarvester.newTask(this)
        } else if (this.memory.role == 'longDistanceMiner') {
            longDistanceMiner.newTask(this)
        } else if (this.memory.role == 'longDistanceLorry') {
            longDistanceLorry.newTask2(this)
        } else if (this.memory.role == 'longDistanceBuilder') {
            longDistanceBuilder.newTask(this)
        } else if (this.memory.role == 'scientist') {
            scientist.newTask(this)
        } else if (this.memory.role == 'wallRepairer') {
            wallRepairer.newTask(this)
        } else {
            console.log("error - missing creep role " + this.memory.role + " " + this.room.name)
        }
    };

/** @function 
    @param {bool} useContainer
    @param {bool} useSource */
Creep.prototype.getEnergy =
    function (useContainer, useSource) {
        /** @type {StructureContainer} */
        var container;
        // if the Creep should look for containers
        if (useContainer) {
            // find closest storage
            container = this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => (s.structureType == STRUCTURE_STORAGE) &&
                    s.store[RESOURCE_ENERGY] > 300
            });

            //if storage empty
            if (container == undefined) {
                container = this.pos.findClosestByPath(FIND_STRUCTURES, {
                    filter: s => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) &&
                        s.store[RESOURCE_ENERGY] > 100
                });
            }

            // if one was found
            if (container != undefined) {
                // try to withdraw energy, if the container is not in range
                if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.travelTo(container);
                }
            }
        }
        // if no container was found and the Creep should look for Sources
        if (container == undefined && useSource) {
            // find closest source
            var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

            // try to harvest energy, if the source is not in range
            if (this.harvest(source) == ERR_NOT_IN_RANGE) {
                // move towards it
                this.travelTo(source);
            }
        }
    };

Creep.prototype.storeAllBut = function (resource) {
    // send creep to storage to empty itself into it, keeping one resource type. Use null to drop all resource types.
    // returns true if only carrying allowed resource
    if (arguments.length == 0 && _.sum(this.carry) == 0) {
        return true;
    }
    if (arguments.length == 1 && (_.sum(this.carry) == this.carry[resource] || _.sum(this.carry) == 0)) {
        return true;
    }

    if (_.sum(this.carry) > 0) {
        var targetContainer = this.findResource(RESOURCE_SPACE, STRUCTURE_STORAGE);
        if (targetContainer == null) {
            targetContainer = this.findResource(RESOURCE_SPACE, STRUCTURE_CONTAINER);
        }
        if (this.pos.getRangeTo(targetContainer) > 1) {
            this.travelTo(targetContainer);
        } else {
            for (var res in this.carry) {
                if (arguments.length == 1 && resource == res) {
                    //keep this stuff
                } else {
                    this.transfer(targetContainer, res);
                }
            }
        }
        return false;
    } else {
        return true;
    }
};


Creep.prototype.findResource =
    function (resource, sourceTypes) {
        if (this.memory.targetBuffer != undefined) {
            let tempTarget = Game.getObjectById(this.memory.targetBuffer);
            if (tempTarget == undefined || this.memory.roomBuffer != this.room.name) {
                delete this.memory.targetBuffer;
            } else if (resource == RESOURCE_SPACE) {
                if (tempTarget.energy != undefined && tempTarget.energyCapacity - tempTarget.energy == 0) {
                    delete this.memory.targetBuffer;
                } else if (tempTarget.storeCapacity != undefined && tempTarget.storeCapacity - _.sum(tempTarget.store) == 0) {
                    delete this.memory.targetBuffer;
                }
            } else if (resource == RESOURCE_ENERGY && tempTarget.energy != undefined && tempTarget.energy == 0) {
                delete this.memory.targetBuffer;
            } else if (resource != RESOURCE_ENERGY && tempTarget.store[resource] == 0) {
                delete this.memory.targetBuffer;
            }
        }

        if (this.memory.targetBuffer != undefined && this.memory.resourceBuffer != undefined && this.memory.resourceBuffer == resource && Game.time % DELAYRESOURCEFINDING != 0) {
            //return buffered resource
            return Game.getObjectById(this.memory.targetBuffer);
        } else if (this.room.memory.roomArray != undefined) {
            let IDBasket = [];
            let tempArray = [];

            for (let argcounter = 1; argcounter < arguments.length; argcounter++) {
                // Go through requested sourceTypes
                switch (arguments[argcounter]) {
                    case FIND_SOURCES:
                        if (resource == RESOURCE_ENERGY) {
                            tempArray = this.room.memory.roomArray.sources;
                            for (var s in tempArray) {
                                if (Game.getObjectById(tempArray[s]).energy > 0) {
                                    IDBasket.push(Game.getObjectById(tempArray[s]));
                                }
                            }
                        }
                        break;

                    case STRUCTURE_EXTENSION:
                        if (resource == RESOURCE_ENERGY) {
                            tempArray = this.room.memory.roomArray.extensions;
                            for (var s in tempArray) {
                                if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).energy > 0) {
                                    IDBasket.push(Game.getObjectById(tempArray[s]));
                                }
                            }
                        } else if (resource == RESOURCE_SPACE) {
                            // Look for links with space left
                            tempArray = this.room.memory.roomArray.extensions;
                            for (var s in tempArray) {
                                let container = Game.getObjectById(tempArray[s]);
                                if (Game.getObjectById(tempArray[s]) != null && container.energy < container.energyCapacity) {
                                    IDBasket.push(container);
                                }
                            }
                        }
                        break;

                    case STRUCTURE_SPAWN:
                        if (resource == RESOURCE_ENERGY) {
                            tempArray = this.room.memory.roomArray.spawns;
                            for (var s in tempArray) {
                                if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).energy > 0) {
                                    IDBasket.push(Game.getObjectById(tempArray[s]));
                                }
                            }
                        } else if (resource == RESOURCE_SPACE) {
                            // Look for spawns with space left
                            tempArray = this.room.memory.roomArray.spawns;
                            for (var s in tempArray) {
                                let container = Game.getObjectById(tempArray[s]);
                                if (container.energy < container.energyCapacity) {
                                    IDBasket.push(container);
                                }
                            }
                        }
                        break;

                    case STRUCTURE_LINK:
                        if (resource == RESOURCE_ENERGY) {
                            tempArray = this.room.memory.roomArray.links;
                            for (var s in tempArray) {
                                if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).energy > 0) {
                                    IDBasket.push(Game.getObjectById(tempArray[s]));
                                }
                            }
                        } else if (resource == RESOURCE_SPACE) {
                            // Look for links with space left
                            tempArray = this.room.memory.roomArray.links;
                            for (var s in tempArray) {
                                let container = Game.getObjectById(tempArray[s]);
                                if (Game.getObjectById(tempArray[s]) != null && container.energy < container.energyCapacity) {
                                    IDBasket.push(container);
                                }
                            }
                        }
                        break;

                    case STRUCTURE_TOWER:
                        if (resource == RESOURCE_ENERGY) {
                            tempArray = this.room.memory.roomArray.towers;
                            for (var s in tempArray) {
                                if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).energy > 0) {
                                    IDBasket.push(Game.getObjectById(tempArray[s]));
                                }
                            }
                        } else if (resource == RESOURCE_SPACE) {
                            // Look for links with space left
                            tempArray = this.room.memory.roomArray.towers;
                            for (var s in tempArray) {
                                let container = Game.getObjectById(tempArray[s]);
                                if (Game.getObjectById(tempArray[s]) != null && container.energy < container.energyCapacity) {
                                    IDBasket.push(container);
                                }
                            }
                        }
                        break;

                    case STRUCTURE_CONTAINER:
                        if (resource == RESOURCE_SPACE) {
                            // Look for containers with space left
                            tempArray = this.room.memory.roomArray.containers;
                            for (var s in tempArray) {
                                if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).storeCapacity - _.sum(Game.getObjectById(tempArray[s]).store) > 0) {
                                    IDBasket.push(Game.getObjectById(tempArray[s]));
                                }
                            }
                        } else {
                            // Look for containers with resource
                            tempArray = this.room.memory.roomArray.containers;
                            for (var s in tempArray) {
                                if (Game.getObjectById(tempArray[s]) != null && Game.getObjectById(tempArray[s]).store[resource] > 0) {
                                    IDBasket.push(Game.getObjectById(tempArray[s]));
                                }
                            }
                        }
                        break;

                    case STRUCTURE_STORAGE:
                        if (resource == RESOURCE_SPACE) {
                            // Look for storage with space left
                            if (this.room.storage != undefined && this.room.storage.storeCapacity - _.sum(this.room.storage.store) > 0) {
                                IDBasket.push(this.room.storage);
                            }
                        } else {
                            // Look for containers with resource
                            if (this.room.storage != undefined && this.room.storage != undefined && this.room.storage.store[resource] > 0) {
                                IDBasket.push(this.room.storage);
                            }
                        }
                        break;

                    case STRUCTURE_TERMINAL:
                        if (resource == RESOURCE_SPACE) {
                            // Look for storage with space left
                            if (this.room.terminal != undefined && this.room.terminal.storeCapacity - _.sum(this.room.terminal.store) > 0) {
                                IDBasket.push(this.room.terminal);
                            }
                        } else {
                            // Look for containers with resource
                            if (this.room.terminal != undefined && this.room.terminal.store[resource] > 0) {
                                IDBasket.push(this.room.terminal);
                            }
                        }
                        break;
                }
            }

            //Get path to collected objects
            var target = this.pos.findClosestByPath(IDBasket);
            this.memory.resourceBuffer = resource;
            if (target != null) {
                this.memory.targetBuffer = target.id;
                this.memory.roomBuffer = this.room.name;
                return target;
            } else {
                return null;
            }
        }
    };