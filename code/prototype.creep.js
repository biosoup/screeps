require("creep-tasks");
var Tasks = require("creep-tasks");

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
let safecreep = require('role.safecreep')


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
            guard.nonTask(this)
        } else if (this.memory.role == 'spawnAttendant') {
            spawnAttendant.newTask(this)
        } else if (this.memory.role == 'transporter') {
            transporter.newTask(this)
        } else if (this.memory.role == 'mineralHarvester') {
            mineralHarvester.newTask(this)
        } else if (this.memory.role == 'longDistanceMiner') {
            longDistanceMiner.newTask(this)
        } else if (this.memory.role == 'longDistanceLorry') {
            longDistanceLorry.newTask(this)
        } else if (this.memory.role == 'longDistanceBuilder') {
            longDistanceBuilder.newTask(this)
        } else if (this.memory.role == 'scientist') {
            scientist.newTask(this)
        } else if (this.memory.role == 'wallRepairer') {
            wallRepairer.newTask(this)
        } else if (this.memory.role == 'safecreep') {
            safecreep.newTask(this)
        } else {
            console.log("error - missing creep role " + this.memory.role + " " + this.room.name)
        }
    };

Creep.prototype.getEnergy = function (creep, useSource) {
    // 1) storage, 2) continers, 3) harvest

    //get from storage
    if (!_.isEmpty(creep.room.storage)) {
        if (creep.room.storage.store[RESOURCE_ENERGY] > 100) {
            creep.task = Tasks.withdraw(creep.room.storage);
            return true;
        }
    }

    //get from continer
    var containers = creep.room.containers.filter(s => s.store[RESOURCE_ENERGY] >= 100)
    if (!_.isEmpty(containers)) {
        var container = creep.pos.findClosestByPath(containers)
        if (!_.isEmpty(container)) {
            creep.task = Tasks.withdraw(container);
            return true;
        }
    }

    // if no container was found and the Creep should look for Sources
    if (useSource) {
        let sources = creep.room.find(FIND_SOURCES);
        let unattendedSource = _.filter(sources, source => source.targetedBy.length == 0);
        if (!_.isEmpty(unattendedSource)) {
            unattendedSource = creep.pos.findClosestByPath(unattendedSource);
            if (!_.isEmpty(unattendedSource)) {
                creep.task = Tasks.harvest(unattendedSource);
                creep.say(EM_HAMMER)
                return true;
            }
        } else {
            if (!_.isEmpty(sources)) {
                var targetSource = []
                var i = 0;
                for (var s of sources) {
                    //check how many free space each has
                    //console.log(JSON.stringify(s))
                    var freeSpaces = creep.room.lookForAtArea(LOOK_TERRAIN, s.pos.y - 1, s.pos.x - 1, s.pos.y + 1, s.pos.x + 1, true);
                    freeSpaces = freeSpaces.filter(f => f.terrain == "wall")
                    //console.log(freeSpaces.length+" "+JSON.stringify(freeSpaces))

                    //check how many targets it
                    if (freeSpaces.length + s.targetedBy.length < 9) {
                        targetSource[i] = s
                        i++
                    }
                }
                if (!_.isEmpty(targetSource)) {
                    var rand = _.random(targetSource.length - 1)
                    creep.task = Tasks.harvest(targetSource[rand]);
                    creep.say(EM_HAMMER)
                    return true;
                } else {
                    creep.say(EM_ZZZ)
                }
            }
        }
    }
};

Creep.prototype.fillStructures = function (creep) {
    //fill towers
    var towers = creep.room.towers.filter(s => s.energy < 500)
    var tower = creep.pos.findClosestByPath(towers)
    if (!_.isEmpty(tower)) {
        creep.task = Tasks.transfer(tower);
        return true;
    }

    //fill main structures
    var spawns = creep.room.spawns.filter(s => s.energy < s.energyCapacity)
    var structure = creep.pos.findClosestByPath(spawns)
    if (!_.isEmpty(structure)) {
        creep.task = Tasks.transfer(structure);
        return true;
    }

    var extensions = creep.room.extensions.filter(s => s.energy < s.energyCapacity)
    var structure = creep.pos.findClosestByPath(extensions)
    if (!_.isEmpty(structure)) {
        creep.task = Tasks.transfer(structure);
        return true;
    }

    //fill towers
    var towers = creep.room.towers.filter(s => s.energy < s.energyCapacity)
    var tower = creep.pos.findClosestByPath(towers)
    if (!_.isEmpty(tower)) {
        creep.task = Tasks.transfer(tower);
        return true;
    }

    //fill upgrade container
    var container = _.first(creep.room.controller.pos.findInRange(creep.room.containers, 2, {
        filter: f => f.store[RESOURCE_ENERGY] < f.storeCapacity
    }))
    if (!_.isEmpty(container)) {
        creep.task = Tasks.transfer(container);
        return;
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