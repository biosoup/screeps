StructureSpawn.prototype.getBodyInfo =
    function (roleName, energy) {
        var bodyInfo = {};
        bodyInfo.role = roleName;

        let rcl = this.room.controller.level;
        if (buildingPlans[roleName] == undefined) {
            console.log("No building plans for " + roleName + " found!");
        } else if (buildingPlans[roleName][rcl - 1].minEnergy > energy && rcl > 1) {
            if (buildingPlans[roleName][rcl - 2].minEnergy > energy) {
                return null;
            } else {
                return buildingPlans[roleName][rcl - 2].body;
            }
        } else {
            return buildingPlans[roleName][rcl - 1].body;
        }
    };

// create a new function for StructureSpawn
StructureSpawn.prototype.createCustomCreep =
    function (energy, roleName, home = this.room, target, sourceId) {

        let body = this.getBodyInfo(roleName, this.room.energyCapacityAvailable);
        let name = roleName + "-" + home + "-" + target + "-" + Game.time;

        var testIfCanSpawn = this.spawnCreep(body, name, {
            dryRun: true
        });

        if (body != null && testIfCanSpawn == OK) {
            return this.createCreep(body, name, {
                role: roleName,
                sourceId: sourceId,
                home: home,
                target: target
            });
        }
    };