/*
dynamic spawning
    - low lever (RCL 0-3)
        - maximize harvesters
        - miners for sources
        - 1 upgrader, 1 builder, 1 wallrepair to 500k
        - all based on the e/t that can be brought in
    - mid level (RCL 4-6)
        - remote mining to fill storage
        - dynamic number of upgraders mixed in the que
        - wallrepair to 2 mil 
        - spawnAttendant + lorry
        - add claimers
    - high level (RCL 7+)
        - add mining, trading and scientist

*/

module.exports = {
    getCreepsToSpawn: function (spawnRoom) {
        let globalSpawningStatus = 0;
        let cpuStart = Game.cpu.getUsed();

        if (!_.isEmpty(spawnRoom.memory.roomArray)) {
            for (var s in spawnRoom.memory.roomArray.spawns) {
                var testSpawn = Game.getObjectById(spawnRoom.memory.roomArray.spawns[s]);
                if (testSpawn != null && testSpawn.spawning == null && testSpawn.memory.spawnRole != "x") {
                    globalSpawningStatus++;
                }
                //if multiple spawns are in room, and one of them is spawning, wait for next round
            }
        }

        if (spawnRoom.checkForDefeat(spawnRoom)) {
            //room has been defeated, no need to spawn anymore
            return -1;
        }

        if (globalSpawningStatus == 0) {
            //All spawns busy, inactive or player lost control of the room
            return -1;
        }

        //get creeps that are not about to die
        let allMyCreeps = _.filter(Game.creeps, (c) => c.memory.home == spawnRoom.name && (c.ticksToLive > (c.body.length * 3) - 3 || c.spawning == true));

        //get RCL
        var rcl = spawnRoom.controller.level

        //Check for sources & minerals
        let numberOfSources = spawnRoom.memory.roomArray.sources.length;

        let numberOfExploitableMineralSources = spawnRoom.memory.roomArray.extractors.length;
            let roomMineralType;
            //Check mineral type of the room
            if (numberOfExploitableMineralSources > 0) {
                // Assumption: There is only one mineral source per room
                let mineral = Game.getObjectById(spawnRoom.memory.roomArray.minerals[0]);
                if (!_.isEmpty(mineral)) {
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
        minimumSpawnOf["scientist"] = 0;
        minimumSpawnOf["transporter"] = 0;
        minimumSpawnOf["SKHarvester"] = 0; //unused
        minimumSpawnOf["SKHauler"] = 0; //unused
        minimumSpawnOf["safecreep"] = 0;

        //check for hostiles in spawnRoom
        var hostileValues = spawnRoom.checkForHostiles(spawnRoom)
        var numberOfTowers = spawnRoom.find(spawnRoom.towers, {
            filter: (s) => s.energy > 0
        });

        if (hostileValues.numHostiles > 0) {
            console.log("Being attacked by " + hostileValues.numHostiles + " with:" + hostileValues.maxAttackBodyParts + " attack parts")

            //Get number of towers
            if (numberOfTowers > 0) {
                //lower by the amount of towers
                hostileValues.numHostiles = hostileValues.numHostiles - numberOfTowers;
            }

            //guard spawning code
        }

        //get flags for a room


        //based on rcl, call specific functions with independent logic, that will return prepared list
        if (rcl <= 3) {
            //code for low level RCL
            /* 
            - maximize harvesters
            - miners for sources
            - 1 upgrader, 1 builder, 1 wallrepair to 500k
            - all based on the e/t that can be brought in 
            */

        } else if (rcl <= 6) {
            //code for mid level RCL
            /*
            - remote mining to fill storage
            - dynamic number of upgraders mixed in the que
            - wallrepair to 2 mil 
            - spawnAttendant + lorry
            - add claimers
            - add minig
            */

        } else {
            //code for high level RCL
            /*
            - add mining, trading and scientist
            */
            

        }
    },

    getSpawnList: function (spawnRoom, minimumSpawnOf, numberOf) {
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
    }
}