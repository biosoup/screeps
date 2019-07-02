//require plans for body and arms
require("module.base.buildings")


module.exports = {
    run: function (room) {
        //find all positions for body, that are big anough

        //find for that body, if six arms can be placed

        //prepare the body to be placed

        //write into memory RCL based body structure
    },

    findPlaceForBody: function (room) {
        //get whole room

        //find a place of appropriate size

    },

    findPlaceForArm: function (room, bodyCenter) {
        //check for existing arm count

    },

    placeBody: function (room, bodyCenter) {

    },

    placeArmExtensions: function (room, bodyCenter) {

    },

    placeContainers: function (room) {

    },

    placeLinks: function(room) {

    },

    placeRoads: function(room, startPosition, endPosition) {

    },

    placeArmLabs: function (room, bodyCenter) {

    },

    getBodyRealPositions: function (room, bodyCenter) {

    },

    getArmRealPositions: function (room, bodyCenter, topSideConnection) {

    },

    getBaseFromMemory: function (room) {

    },

    setBaseToMemory: function (room, bodyCenter, arm1connection, arm2connection, arm3connection, ) {

    }

};