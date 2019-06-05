module.exports = {
    // a function to run the logic for this role
    work: function(creep) {
        // if in target room
        if (creep.room.name != creep.memory.target) {
            // find exit to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            // move to exit
            creep.travelTo(creep.pos.findClosestByPath(exit));
        }
        else {            
            // try to claim controller
            //console.log(creep.claimController(creep.room.controller))
            if (creep.claimController(creep.room.controller) == ERR_NOT_IN_RANGE && creep.claimController(creep.room.controller) != ERR_GCL_NOT_ENOUGH) {
                // move towards the controller
                creep.travelTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            } else if (creep.reserveController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.travelTo(creep.room.controller, {visualizePathStyle: {stroke: '#ffffff'}});
            }
            
        }
    }
};