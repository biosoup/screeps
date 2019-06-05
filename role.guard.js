/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('guard'); // -> 'a thing'
 */

module.exports = {
        // a function to run the logic for this role
        work: function (creep) {
            if (creep.room.name == creep.memory.target) {
                // find source
                var hostile = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS, {
                    filter: function (object) {
                        return object.owner != "Source Keeper";
                    }
                });
                if (hostile) {
                    creep.say("Hostile!");
                    if (creep.rangedAttack(hostile) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(hostile);
                    }
                    creep.rangedAttack(hostile);
                }

                //var structure = creep.pos.findClosestByPath(FIND_HOSTILE_STRUCTURES, { filter: function (object) { return object.structureType != STRUCTURE_CONTROLLER && object.structureType != STRUCTURE_KEEPER_LAIR;}});
                
                if (structure == null) {
                    var structure = creep.pos.findInRange(FIND_STRUCTURES, 3, {
                        filter: s => s.structureType == STRUCTURE_WALL
                        || s.structureType == STRUCTURE_RAMPART
                    })[0];
                }
                
                //console.log(structure)
                
                if (!hostile && structure) {
                    //console.log("Attack: "+structure + creep.attack(structure));
                    if (creep.rangedAttack(structure) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(structure);
                    }
                }

                var construction = creep.pos.findClosestByPath(FIND_HOSTILE_CONSTRUCTION_SITES, {
                    filter: function (object) {
                        return object.structureType != STRUCTURE_CONTROLLER && object.structureType != STRUCTURE_KEEPER_LAIR;
                    }
                });
                if (hostile == null && structure == null && construction) {
                    ; //TODO IMPLEMENT STOMP
                    if (creep.rangedAttack(construction) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(construction);
                    }
                }

                if (Game.flags.GUARD_MOVE) {
                    creep.cancelOrder("move"); /* cancel ALL move orders */
                    creep.travelTo(Game.flags.GUARD_MOVE);
                    if (hostile) {
                        creep.rangedAttack(hostile);
                        creep.rangedAttack(structure);
                        //creep.attack(hostile);
                        
                        //add a healing between guards
                    }
                }

                // if not in target room
            } else {
                //console.log(creep.memory.target)
                // find exit to target room
                var exit = creep.room.findExitTo(creep.memory.target);
                // move to exit
                creep.travelTo(creep.pos.findClosestByRange(exit));
            }
        }
}
