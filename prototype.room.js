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