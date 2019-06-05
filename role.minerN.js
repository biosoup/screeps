module.exports = {
    // a function to run the logic for this role
    work: function (creep) {

        // get source
        var source = Game.getObjectById(creep.memory.sourceId);

        if (source != null) {
            // find container next to source
            var container = source.pos.findInRange(FIND_STRUCTURES, 1, {
                filter: s => s.structureType == STRUCTURE_CONTAINER
            })[0];
        } else {
            creep.say("missing container")
        }

        //console.log(JSON.stringify(container))

        if (typeof container !== 'undefined') {
            // if creep is on top of the container
            //console.log(container.store[RESOURCE_ENERGY] +" of "+container.storeCapacity)
            if (creep.pos.isEqualTo(container.pos)) {
                if (container.store[RESOURCE_ENERGY] < container.storeCapacity) {
                    // harvest source
                    creep.harvest(source);
                }

            }
            // if creep is not on top of the container
            else {
                // move towards it
                creep.travelTo(container);
            }

        }

        /* ADD
        - logic for when link is next to him
        - if link is missing, and RCL is high enough, place it down, and construct it
        
        */

        if (creep.carryCapacity > creep.carry) {
            // find link next to them
            var link = creep.pos.findInRange(FIND_STRUCTURES, 2, {
                filter: s => s.structureType == STRUCTURE_LINK
            })[0];

            //console.log(JSON.stringify(link))

            if (typeof link !== 'undefined') {
                if (link.energy < link.energyCapacity) {
                    creep.withdraw(container, RESOURCE_ENERGY)
                    creep.transfer(link, RESOURCE_ENERGY)
                }
            }
        }


    }
};