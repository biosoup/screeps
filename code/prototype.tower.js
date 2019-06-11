StructureTower.prototype.defend =
    function (hostiles) {
        //if there are hostiles - attakc them    
        this.attack(hostiles);
        //var username = hostiles[0].owner.username;
        //Game.notify(`User ${username} spotted in room ${myRoomName}`);
        //console.log(this.room.name + " ALERT!!!! WE ARE UNDER ATTACK!!!!! ");
    };

StructureTower.prototype.healCreeps =
    function () {
        //....first heal any damaged creeps
        for (var name in Game.creeps) {
            // get the creep object
            var creep = Game.creeps[name];
            if (creep.hits < creep.hitsMax) {
                this.heal(creep);
                //console.log("Tower is healing Creeps.");
            }
        }
    };

StructureTower.prototype.repairStructures =
    function () {
        //...repair Buildings! :) But ONLY until HALF the energy of the tower is gone.
        //Because we don't want to be exposed if something shows up at our door :)
        var roomEnergyCapacity = this.room.energyCapacityAvailable;
        var roomEnergy = this.room.energyAvailable;
        //work only when there is max spawn energy && roomEnergy == roomEnergyCapacity


        if (this.energy > 700) {
            //Find the closest damaged Structure
            var targets = this.room.find(FIND_STRUCTURES, {
                filter: (s) =>
                    ((s.hits / s.hitsMax) < 1) &&
                    s.structureType != STRUCTURE_CONTROLLER &&
                    s.structureType != STRUCTURE_EXTENSION &&
                    s.structureType != STRUCTURE_TOWER &&
                    s.structureType != STRUCTURE_WALL &&
                    s.structureType != STRUCTURE_RAMPART &&
                    s.structureType != STRUCTURE_SPAWN
            });

            target = targets.sort(function (a, b) {
                return +a.hits - +b.hits
            })[0];
            //console.log(JSON.stringify(targets))

            if (target) {
                this.repair(target);
                //console.log(target+" "+this.room.name+" "+ this.repair(target))
            }
        } else if (this.energy > 200) {
            //Find the closest damaged Structure
            var targets = this.room.find(FIND_STRUCTURES, {
                filter: (s) =>
                    (s.hits < 1000) &&
                    s.structureType != STRUCTURE_CONTROLLER &&
                    s.structureType != STRUCTURE_EXTENSION &&
                    s.structureType != STRUCTURE_TOWER &&
                    s.structureType != STRUCTURE_WALL &&
                    s.structureType != STRUCTURE_SPAWN
            });

            target = targets.sort(function (a, b) {
                return +a.hits - +b.hits
            })[0];

            if (target) {
                this.repair(target);
            }
        }
    };