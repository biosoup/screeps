StructureTower.prototype.defend =
    function () {

        var hostiles = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        //console.log(hostiles);

        //if there are hostiles - attakc them    
        if (hostiles != null) {
            this.attack(hostiles);
            //var username = hostiles[0].owner.username;
            //Game.notify(`User ${username} spotted in room ${myRoomName}`);
            console.log("ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ");
        }

        //if there are no hostiles....
        if (hostiles === null) {

            //....first heal any damaged creeps
            for (let name in Game.creeps) {
                // get the creep object
                var creep = Game.creeps[name];
                if (creep.hits < creep.hitsMax) {
                    tower.heal(creep);
                    console.log("Tower is healing Creeps.");
                }
            }


            //...repair Buildings! :) But ONLY until HALF the energy of the tower is gone.
            //Because we don't want to be exposed if something shows up at our door :)
            var roomEnergyCapacity = this.room.energyCapacityAvailable;
            var roomEnergy = this.room.energyAvailable;
            //work only when there is max spawn energy
            if (this.energy >= (this.energyCapacity / 2) && roomEnergy == roomEnergyCapacity) {
                //Find the closest damaged Structure
                var targets = this.room.find(FIND_STRUCTURES, {
                    filter: (s) =>
                        (s.hits < 250000 && s.hits < s.hitsMax) &&
                        s.structureType != STRUCTURE_CONTROLLER &&
                        s.structureType != STRUCTURE_EXTENSION &&
                        s.structureType != STRUCTURE_TOWER &&
                        s.structureType != STRUCTURE_SPAWN
                    //|| (s.structureType == STRUCTURE_WALL && s.hits < 30000)
                    //|| (s.structureType == STRUCTURE_RAMPART && s.hits < 30000)
                });

                target = targets.sort(function (a, b) {
                    return +a.hits - +b.hits
                })[0];
                //console.log(target);

                if (target) {
                    this.repair(target);

                    //console.log("The tower is repairing buildings.");
                }
            }


        }
    };
