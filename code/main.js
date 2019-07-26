/** main.js */
'use strict';

/* global DEFER_REQUIRE */

const MemHack = require('./tools/MemHack');
MemHack.register()

const profiler = require('./tools/screeps-profiler');
const stats = require('./tools/stats');
const Traveler = require('./tools/Traveler');

global.Player = require('Player');

// Deffered modules though we can load when we have cpu for it
DEFER_REQUIRE('global');
DEFER_REQUIRE('./tools/tools.prototype.Room.structures');
DEFER_REQUIRE("./tools/tools.creep-tasks");


module.exports.loop = function () {
	profiler.wrap(function () {
		MemHack.pretick()
		stats.reset()

		// 0) Garbage collection
		if (Game.time % 1 == 0) {
			if (Memory.creeps)
				_.difference(Object.keys(Memory.creeps), Object.keys(Game.creeps)).forEach(function (key) {
					if (Memory.creeps[key].tasks)
						for (let roomName in Memory.creeps[key].tasks) {
							let taskCode = Memory.creeps[key].tasks[roomName];
							if (Game.rooms[roomName] && Game.rooms[roomName].getTasks().collection[taskCode])
								Game.rooms[roomName].getTasks().collection[taskCode].assignmentDelete(key);
						}
					delete Memory.creeps[key]
				});
			if (Memory.flags)
				_.difference(Object.keys(Memory.flags), Object.keys(Game.flags)).forEach(function (key) {
					delete Memory.flags[key]
				});
			if (Memory.rooms)
				//_.difference(Object.keys(Memory.rooms),Object.keys(Game.rooms)).forEach(function(key) {delete Memory.rooms[key]});
				if (Memory.spawns)
					_.difference(Object.keys(Memory.spawns), Object.keys(Game.spawns)).forEach(function (key) {
						delete Memory.spawns[key]
					});
			if (Memory.structures)
				_.difference(Object.keys(Memory.structures), Object.keys(Game.structures)).forEach(function (key) {
					delete Memory.structures[key]
				});
		}

		// 1) empire tasks

		// 2) colony tasks

		// 3) room tasks

		// 4) Defense

		// 5) Creep Run

		// 6) Spawn Run

		// 7) Room run

		// 8) Stats
		if ((Game.time % 5) == 0 && Game.cpu.bucket > 100) {
			var spawnBusy = {};
			for (var spawnName in Game.spawns) {
				if (Game.spawns[spawnName].spawning) {
					spawnBusy[Game.spawns[spawnName].name] = Game.spawns[spawnName].spawning.needTime - Game.spawns[spawnName].spawning.remainingTime;
				} else {
					spawnBusy[Game.spawns[spawnName].name] = 0;
				}
			}
			stats.addStat('spawn-busy', {}, spawnBusy)

			var countHostiles = 0;
			for (var roomName in Game.rooms) {
				var hostiles = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS);
				if (hostiles.length > 0) {
					countHostiles = countHostiles + hostiles.length
				}
			}

			//check for hostiles in any room
			stats.addSimpleStat('hostiles', countHostiles);
			stats.addSimpleStat('creep-population', Object.keys(Game.creeps).length);

			stats.commit();
		}
	});
}