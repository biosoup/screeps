require("tools.creep-tasks");
var Tasks = require("tools.creep-tasks");

let builder = require('role.builder')
let upgrader = require('role.upgrader')
let harvester = require('role.harvester')
let longDistanceHarvester = require('role.longDistanceHarvester')
let claimer = require('role.claimer')
let miner = require('role.miner')
let guard = require('role.guard')
let einarr = require('role.einarr')
let runner = require('./role.runner')
let scout = require('./role.scout')
let transporter = require('role.transporter')
let mineralHarvester = require('role.mineralHarvester')
let longDistanceMiner = require('role.longDistanceMiner')
let longDistanceLorry = require('role.longDistanceLorry')
let longDistanceBuilder = require('role.longDistanceBuilder')
let scientist = require('role.scientist')
let wallRepairer = require('role.wallRepairer')
let herocreep = require('./role.herocreep')
let demolisher = require('role.demolisher')


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
        } else if (this.memory.role == 'guard') {
            guard.nonTask(this)
        } else if (this.memory.role == 'einarr') {
            einarr.nonTask(this)
        } else if (this.memory.role == 'runner') {
            runner.newTask(this)
        } else if (this.memory.role == 'scout') {
            scout.newTask(this)
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
        } else if (this.memory.role == 'herocreep') {
            herocreep.newTask(this)
        } else if (this.memory.role == 'demolisher') {
            demolisher.newTask(this)
        } else {
            console.log("error - missing creep " + this.name + " role " + this.memory.role + " " + this.room.name)
            //purge old/wrong roles
            if (this.memory.role == "spawnAttendant" || this.memory.role == "lorry") {
                this.suicide()
            }
        }
    };

Creep.prototype.getEnergy = function (creep, useSource) {
    // 1) storage, 2) continers, 3) harvest

    //if no hostiles around, go for dropped resources
    var hostiles = creep.room.find(FIND_HOSTILE_CREEPS)
    if (hostiles.length == 0) {
        //look for dropped resources
        var droppedEnergy = creep.room.find(FIND_DROPPED_RESOURCES, {
            filter: s => s.targetedBy.length == 0
        })
        if (!_.isEmpty(droppedEnergy)) {
            droppedEnergy = creep.pos.findClosestByRange(droppedEnergy)
            creep.task = Tasks.pickup(droppedEnergy);
            return;
        }
        var tombstones = _.filter(creep.room.find(FIND_TOMBSTONES), (t) => _.sum(t.store) > 0 && t.targetedBy.length == 0)
        if (!_.isEmpty(tombstones)) {
            tombstone = creep.pos.findClosestByRange(tombstones)
            if (!_.isEmpty(tombstone)) {
                if (!_.isEmpty(creep.room.storage)) {
                    creep.task = Tasks.withdrawAll(tombstone);
                    return;
                } else {
                    creep.task = Tasks.withdraw(tombstone, RESOURCE_ENERGY);
                    return;
                }
            }
        }
    }

    //get from terminal, when full
    if (!_.isEmpty(creep.room.terminal)) {
        if (creep.room.terminal.store[RESOURCE_ENERGY] > (creep.room.memory.resourceLimits.energy.minTerminal * 1.2)) {
            //we have excess energy, probably incoming
            creep.task = Tasks.withdraw(creep.room.terminal, RESOURCE_ENERGY);
            return;
        }
    }

    //link in body core
    if (!_.isEmpty(creep.room.storage)) {
        var link = creep.room.storage.pos.findInRange(FIND_STRUCTURES, 2, {
            filter: s => s.structureType == STRUCTURE_LINK && s.energy == s.energyCapacity
        })[0];
        if (!_.isEmpty(link)) {
            creep.task = Tasks.withdraw(link);
            return;
        }
    }

    //get from continer
    if (_.isEmpty(creep.room.links)) {
        var containers = creep.room.containers.filter(s => s.store[RESOURCE_ENERGY] >= 1000)
        if (!_.isEmpty(containers)) {
            var container = creep.pos.findClosestByRange(containers)
            if (!_.isEmpty(container)) {
                creep.task = Tasks.withdraw(container);
                return true;
            }
        }
    }

    //get from storage
    if (!_.isEmpty(creep.room.storage)) {
        if (creep.room.storage.store[RESOURCE_ENERGY] > 100) {
            creep.task = Tasks.withdraw(creep.room.storage);
            return true;
        }
    }

    // if no container was found and the Creep should look for Sources
    if (useSource) {
        let sources = creep.room.find(FIND_SOURCES);
        let unattendedSource = _.filter(sources, source => source.targetedBy.length == 0);
        if (!_.isEmpty(unattendedSource)) {
            unattendedSource = creep.pos.findClosestByRange(unattendedSource);
            if (!_.isEmpty(unattendedSource)) {
                creep.task = Tasks.harvest(unattendedSource);
                creep.say(EM_HAMMER, true)
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
                    creep.say(EM_HAMMER, true)
                    return true;
                } else {
                    var rand = _.random(sources.length - 1)
                    creep.task = Tasks.harvest(sources[rand]);
                    creep.say(EM_HAMMER, true)
                    return true;
                }
            }
        }
    }
};

Creep.prototype.fillStructures = function (creep, workpart = false) {
    //FIXME: change to findClosestByRange, add targetedBy check

    //fill towers
    if (!_.isEmpty(creep.room.towers)) {
        var towers = creep.room.towers.filter(s => s.energy < 500)
        var tower = creep.pos.findClosestByRange(towers)
        if (!_.isEmpty(tower)) {
            creep.task = Tasks.transfer(tower);
            return true;
        }
    }

    //fill main structures
    var spawns = creep.room.spawns.filter(s => s.energy < s.energyCapacity && s.targetedBy.length == 0)
    var structure = creep.pos.findClosestByRange(spawns)
    if (!_.isEmpty(structure)) {
        creep.task = Tasks.transfer(structure);
        return true;
    }

    var extensions = creep.room.extensions.filter(s => s.energy < s.energyCapacity && s.targetedBy.length == 0)
    var structure = creep.pos.findClosestByRange(extensions)
    if (!_.isEmpty(structure)) {
        creep.task = Tasks.transfer(structure);
        return true;
    }

    //fill towers
    var towers = creep.room.towers.filter(s => s.energy < s.energyCapacity && s.targetedBy.length == 0)
    var tower = creep.pos.findClosestByRange(towers)
    if (!_.isEmpty(tower)) {
        creep.task = Tasks.transfer(tower);
        return true;
    }

    //fill powerSpawns with energy
    var powerSpawn = creep.room.find(FIND_MY_STRUCTURES, {
        filter: f => f.structureType == STRUCTURE_POWER_SPAWN
    })
    if (!_.isEmpty(powerSpawn)) {
        creep.task = Tasks.transfer(powerSpawn[0]);
        return true;
    }

    //fill upgrade container
    if (workpart) {
        var container = _.first(creep.room.controller.pos.findInRange(creep.room.containers, 2, {
            filter: f => f.store[RESOURCE_ENERGY] < f.storeCapacity && f.targetedBy.length == 0
        }))
        if (!_.isEmpty(container)) {
            creep.task = Tasks.transfer(container);
            return;
        }
    }

    //put into storage
    if (!_.isEmpty(creep.room.storage)) {
        creep.task = Tasks.transfer(creep.room.storage);
        return true;
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

Creep.prototype.graffity = function () {
    //go sign the controller
    if (!_.isEmpty(this.room.controller.sign)) {
        if (this.room.controller.sign.text != roomSign) {
            this.task = Tasks.signController(this.room.controller, roomSign)
            return
        }
    } else {
        this.task = Tasks.signController(this.room.controller, roomSign)
        return
    }
};


Creep.prototype.findResource = function (resource, sourceTypes) {
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
        var target = this.pos.findClosestByRange(IDBasket);
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