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
let mineralHarvester = require('role.mineralHarvester')
let longDistanceMiner = require('role.longDistanceMiner')
let longDistanceLorry = require('role.longDistanceLorry')


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
        } else if (this.memory.role == 'mineralHarvester') {
            mineralHarvester.newTask(this)
        } else if (this.memory.role == 'longDistanceMiner') {
            longDistanceMiner.newTask(this)
        } else if (this.memory.role == 'longDistanceLorry') {
            longDistanceLorry.newTask(this)
        } else {
            console.log("error "+this.memory.role+" "+this.room.name)
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