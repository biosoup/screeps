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
