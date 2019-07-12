"use strict";

class empireTaskList {
    constructor(empire) {
        this.name = empire
        this.shard = Game.shard
        this.taskList = this.getTaskListFromMemory(name)
    }

    get(empire) {
        //get all tasks in task list

    }

    addTaskToList () {

    }

    saveTaskListToMemory() {

    }

    getTaskListFromMemory() {

    }
}

class empireTask {
    constructor(taskName, target, options = {}) {
        this.name = taskName
        this.target = target
        this.tick = Game.time;
        this.options = options;
        this.isFinished = false
    }
}