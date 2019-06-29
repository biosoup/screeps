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
        var target = {};

        if (this.energy > 200) {
            //Find the closest damaged Structure
            var targets = this.room.find(FIND_STRUCTURES, {
                filter: (s) =>
                    (s.hits < 500) &&
                    s.structureType != STRUCTURE_CONTROLLER
            });

            if (targets.length > 0) {
                target = _.first(targets)
            }

            if (target) {
                this.repair(target);
                //console.log(target + " " + target.hits + " " + this.room.name + " " + this.repair(target))
            }
        }

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
                    s.structureType != STRUCTURE_EXTRACTOR &&
                    s.structureType != STRUCTURE_SPAWN
            });

            if (targets.length > 0) {
                target = _.first(_.sortByOrder(targets, ["hits"], ["asc"]));
            }
            
            if (target) {
                var result = this.repair(target);
                //console.log(target + " " + target.hits + " " + this.room.name + " " + result)
            }
        }
    };