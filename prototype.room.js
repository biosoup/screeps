/** ADD
- task management system
- task prioritization
    1) tower below 50%
    2) build orders
    3) repair orders
    4) upgrade controller
- spawn requests based on number of tasks

- structure placement
    - road building system
    - bunker around spawn


*/

// add a task tracking and prioritization system

Room.prototype.task =
    function (roomName, target, workType) {
        //all room task are stored in memory as nested objects

    };

Room.prototype.taskMultiRoom =
    function (roomNameSource, roomNameTarget, target, workType) {
        //distant tasks

    };

// find best routes between spawn bunker and resources
// OR find best routes between spawn and room borders
Room.prototype.roads =
    function () {

        //add task for it to be built
    };

//place rampard and extensions automatically around spawn
Room.prototype.bunker =
    function () {

        //add task for it to be built
    };

/* 
TODO implement new lorry system

foreach energy source
    add a current status into memory

    add a priority&properties based on ifs (recheck every x ticks?)
        type of source
            ground 1
            container 2
            storage 3
            link 3
        distance to link
            if distance 1 -> let miner handle it
        distance to storage/spawn
            for each square lower
        owned/distant room
            owned 1
            distant 2
        current fill level
            add score by being closer to full
    add a task to do something with it
        transfer ground energy to nearest container
        transfer container to storage
        transfer container to link
        transfer from link to storage
        (transfer from storage to spawn & extensions))

foreach lorry
    if idle, check for task with highest priority
    claim the task into memory
        delete from room/global memory

for number of tasks
    spawn additional lorries 
    
*/

Room.prototype.addTransportTask =
    function (roomName, energySource) {
        //source matrix
        this.room = roomName;

        // source matrix - name : priority
        var sources = [
            ['StructureContainer', 2],
            ['Resource', 1],
            ['StructureLink', 3],
            ['StructureStorage', 4],
            ['StructureTerminal', 3]
        ]

        //find possible destination
        //check if storage exists
        if (this.room.storage != undefined) {
            //console.log(this.room.storage.store[RESOURCE_ENERGY] < this.room.storage.storeCapacity)

            //if storage is not full
            if (this.room.storage.store[RESOURCE_ENERGY] < this.room.storage.storeCapacity) {
                var destination = this.room.storage;
            } else if (this.room.terminal != undefined && (this.room.terminal.store[RESOURCE_ENERGY] < this.room.terminal.storeCapacity[RESOURCE_ENERGY])) {
                //if storage full, move to terminal for sell
            }
        } else {
            //if not, move energy to spawn and extensions
            var destination = this.room.find(FIND_MY_STRUCTURES, {
                filter: (s) => (
                        s.structureType == STRUCTURE_EXTENSION ||
                        s.structureType == STRUCTURE_SPAWN
                    ) &&
                    s.energy < s.energyCapacity
            });
        }
        if (destination != undefined) {
            //source / dest postition
            
            //add an exception when only ID is beaing passed around
            if (typeof energySource === 'object' && energySource !== null ) {
                sourcePosition = energySource.pos;
            } else if(energySource !== null) {
                sourcePosition = Game.getObjectById(energySource);
                console.log(JSON.stringify(sourcePosition))
            } else {
                console.log("wrong energysource soemthing...")
            }

            destPosition = destination.pos;
            var distance = this.room.findPath(sourcePosition, destPosition, {
                ignoreCreeps: true
            });

            //prioritization
            var sourcePriority;
            var capacityFilled;
            if (energySource.structureType == STRUCTURE_CONTAINER) {
                sourcePriority = 2;
                capacityFilled = energySource.store[RESOURCE_ENERGY] / energySource.storeCapacity;
                //currentEnergyAmount = energySource.store[RESOURCE_ENERGY];
            } else if (energySource.structureType == STRUCTURE_LINK || energySource.structureType == STRUCTURE_TERMINAL) {
                sourcePriority = 3;
                capacityFilled = energySource.energy / energySource.energyCapacity;
                //currentEnergyAmount = energySource.energy;
            } else if (energySource.structureType == STRUCTURE_STORAGE) {
                sourcePriority = 4;
                capacityFilled = energySource.store[RESOURCE_ENERGY] / energySource.storeCapacity;
                //currentEnergyAmount = energySource.store[RESOURCE_ENERGY];
            } else {
                //should only be dropped energy
                if (energySource.resourceType == RESOURCE_ENERGY && energySource.amount > 300) {
                    sourcePriority = 1;
                    capacityFilled = 1;
                } else {
                    console.log("ERR - addTransportTask - unknown energy source");
                    return;
                }
            }

            //calculate final priority
            var score = (sourcePriority / distance.length) * capacityFilled;
            score = score.toFixed(2)
            //console.log(energySource+" "+score);

            //do not create task with same target and origin
            if (distance.length > 0) {
                //check if memory for room exists
                if (this.room.memory.tasks == undefined) {
                    this.room.memory.tasks = {};
                }

                //write to memory
                this.room.memory.tasks[energySource.id] = {
                    source: energySource.id,
                    destination: destination.id,
                    priority: sourcePriority,
                    distance: distance.length,
                    time: Game.time,
                    score: score
                };

            }
        }
    };


Room.prototype.assignTransportTask =
    function (roomName, creep) {
        //get from room memory
        this.room = roomName;
        var tasks = this.room.memory.tasks;

        //get creep position
        creepPosition = creep.pos;
        //get creep carry size
        creepCarry = creep.carryCapacity;

        var scoreList = [];
        for (var source in tasks) {
            sourceId = tasks[source];
            scoreList.push([source, sourceId['score']])
        }

        //find best task
        scoreList = scoreList.sort(function (a, b) {
            return b[1] - a[1];
        });


        if (scoreList.length > 0) {

            bestTask = tasks[scoreList[0][0]]
            //console.log(JSON.stringify(bestTask))

            var remainingEnergyAtSource = Game.getObjectById(bestTask['source']).store[RESOURCE_ENERGY] - creepCarry;
            //console.log(remainingEnergyAtSource)

            //clear old task
            creep.memory.currentTask = {};

            //write into worker memory
            creep.memory.currentTask = bestTask;
            //delete this.room.memory.tasks[bestTask['source']];

            //write remainder back into room memory, if it exists
            if (remainingEnergyAtSource > 0) {
                //this.room.addTransportTask(roomName, bestTask[source], remainingEnergyAtSource);
            }
            return true;
        } else {
            console.log("weird task?")
            return false;
        }

    };

Room.prototype.getExistingTransportTask =
    function (roomName, energySource) {
        //check if source id is in memory
        var task = roomName.memory.tasks[energySource.id];

        //if we have found one, return true
        if (task != undefined) {
            //check if the task, that is being checked, is not too old
            var timeDiff = Game.time - task['time'];
            if (timeDiff > 100 && energySource != undefined) {
                if (task != undefined) {
                    delete roomName.memory.tasks[energySource];
                    return false;
                } else {
                    console.log("old task, but not in memory?")
                }
            }
            return true;
        } else {
            return false;
        }
    }

Room.prototype.purgeTransportTask =
    function (roomName) {
        //purge all tasks
        this.room = roomName;
        this.room.memory.tasks = {};
        return true;
    };

Room.prototype.countTransportTask =
    function (roomName, energySource = {}) {
        //count all outstanding task in a room
        this.room = roomName;
        var sourcePosition = energySource.pos;

        // TODO
    };