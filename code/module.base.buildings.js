//BODY & ARMS building

/* 
BODY JSON
- 10 extensions included for RCL 3
- built around storage
- 5 wide / 9 tall
- includes higher lvl structures

to calculate the relative positions, just use the absolute values and compare them from spawn 1


https://screeps.arcath.net/building-planner/?share=N4IgdghgtgpiBcIQBoQGcAWEBOATB6WeADCiNgMYA2BAHGQEYCuAllbi2AOZoKhoAXAPbYIXOPFAAHIb3gBtUAA8EAJgAsqAJ4IAjAHYAvgF1DqbEIj5JIGXMUgV8VQGZteo8mVq3IHfF1aM29nTT89IK9HNTD-QODo5wBWdwDIkNUU8IDPDKy4gDYEp1dU3SKokti9CozqgIBOYpiypObnAtb21VUuyrVe7N0m-o6ykbrU1WJu+t11bt84l278vRXR0uzVXVWp3dNUNCkIAHcwPltZBAcSpb0JxMzx7sH-aZMzEGFTmGxLuw3DL3ZwzTZrUGLMoLcHQ15lXJPTpDIyHEBUTgAawB1wUeS6aJgSgEMDAaBYQguNkBeKRZXSdKGtSebxq8KGDJKyLiMIyrICvJZ+263LUu02ooCGz5ZRWaJJ2CgnAgNGpuNuPgJXzATExfxx9kmQzlXyEDDQfwAbvq1YanvUdp9UDJftgAMonc4GoGM94zUyGQxAA
 */
var body = {
    "buildings": {
        "storage": {
            "pos": [{
                "x": 2,
                "y": 4
            }]
        },
        "road": {
            "pos": [{
                "x": 1,
                "y": 4
            }, {
                "x": 1,
                "y": 5
            }, {
                "x": 2,
                "y": 5
            }, {
                "x": 2,
                "y": 5
            }, {
                "x": 3,
                "y": 5
            }, {
                "x": 3,
                "y": 4
            }, {
                "x": 3,
                "y": 3
            }, {
                "x": 1,
                "y": 3
            }, {
                "x": 2,
                "y": 3
            }, {
                "x": 2,
                "y": 6
            }, {
                "x": 2,
                "y": 2
            }, {
                "x": 4,
                "y": 2
            }, {
                "x": 0,
                "y": 2
            }, {
                "x": 0,
                "y": 6
            }, {
                "x": 4,
                "y": 6
            }, {
                "x": 2,
                "y": 7
            }, {
                "x": 2,
                "y": 1
            }, {
                "x": 1,
                "y": 0
            }, {
                "x": 3,
                "y": 0
            }, {
                "x": 1,
                "y": 8
            }, {
                "x": 3,
                "y": 8
            }]
        },
        "spawn": {
            "pos": [{
                "x": 1,
                "y": 6
            }, {
                "x": 3, // !!!! S1 / BODYCENTER !!!!
                "y": 6
            }, {
                "x": 0,
                "y": 7
            }]
        },
        "tower": {
            "pos": [{
                "x": 1,
                "y": 7
            }, {
                "x": 3,
                "y": 7
            }, {
                "x": 1,
                "y": 1
            }, {
                "x": 3,
                "y": 1
            }, {
                "x": 0,
                "y": 4
            }, {
                "x": 4,
                "y": 4
            }]
        },
        "link": {
            "pos": [{
                "x": 3,
                "y": 2
            }]
        },
        "extension": {
            "pos": [{
                "x": 4,
                "y": 5
            }, {
                "x": 4,
                "y": 3
            }, {
                "x": 0,
                "y": 3
            }, {
                "x": 0,
                "y": 5
            }, {
                "x": 4,
                "y": 1
            }, {
                "x": 0,
                "y": 1
            }, {
                "x": 0,
                "y": 8
            }, {
                "x": 4,
                "y": 8
            }, {
                "x": 4,
                "y": 0
            }, {
                "x": 0,
                "y": 0
            }]
        },
        "terminal": {
            "pos": [{
                "x": 1,
                "y": 2
            }]
        },
        "nuker": {
            "pos": [{
                "x": 2,
                "y": 0
            }]
        },
        "observer": {
            "pos": [{
                "x": 2,
                "y": 8
            }]
        },
        "powerSpawn": {
            "pos": [{
                "x": 4,
                "y": 7
            }]
        }
    }
}


/*
ARMS
- 6 arms needed total, 5 with extensions, 1 with labs
- 5 wide, 5 tall
- connect on corners, with no overlaps to body
*/
var armExtensionsTopLeft = {
    "buildings": {
        "road": {
            "pos": [{
                "x": 1,
                "y": 1
            }, {
                "x": 0,
                "y": 0
            }, {
                "x": 2,
                "y": 2
            }, {
                "x": 3,
                "y": 3
            }]
        },
        "extension": {
            "pos": [{
                "x": 1,
                "y": 0
            }, {
                "x": 2,
                "y": 0
            }, {
                "x": 2,
                "y": 1
            }, {
                "x": 3,
                "y": 1
            }, {
                "x": 3,
                "y": 2
            }, {
                "x": 0,
                "y": 1
            }, {
                "x": 0,
                "y": 2
            }, {
                "x": 1,
                "y": 2
            }, {
                "x": 1,
                "y": 3
            }, {
                "x": 2,
                "y": 3
            }]
        }
    }
}
var armExtensionsTopRight = {
    "buildings": {
        "road": {
            "pos": [{
                "x": 3,
                "y": 0
            }, {
                "x": 2,
                "y": 1
            }, {
                "x": 1,
                "y": 2
            }, {
                "x": 0,
                "y": 3
            }]
        },
        "extension": {
            "pos": [{
                "x": 1,
                "y": 0
            }, {
                "x": 2,
                "y": 0
            }, {
                "x": 3,
                "y": 1
            }, {
                "x": 3,
                "y": 2
            }, {
                "x": 0,
                "y": 1
            }, {
                "x": 1,
                "y": 3
            }, {
                "x": 2,
                "y": 3
            }, {
                "x": 1,
                "y": 1
            }, {
                "x": 2,
                "y": 2
            }, {
                "x": 0,
                "y": 2
            }]
        },
        "spawn": {
            "pos": []
        }
    }
}

var armLabsTopLeft = {
    "buildings": {
        "lab": {
            "pos": [{
                "x": 1,
                "y": 0
            }, {
                "x": 2,
                "y": 0
            }, {
                "x": 3,
                "y": 2
            }, {
                "x": 2,
                "y": 3
            }, {
                "x": 1,
                "y": 3
            }, {
                "x": 0,
                "y": 2
            }, {
                "x": 0,
                "y": 1
            }, {
                "x": 3,
                "y": 1
            }, {
                "x": 2,
                "y": 1
            }, {
                "x": 1,
                "y": 2
            }]
        },
        "road": {
            "pos": [{
                "x": 1,
                "y": 1
            }, {
                "x": 0,
                "y": 0
            }, {
                "x": 2,
                "y": 2
            }, {
                "x": 3,
                "y": 3
            }]
        }
    }
}
var armLabsTopRight = {
    "buildings": {
        "lab": {
            "pos": [{
                "x": 1,
                "y": 0
            }, {
                "x": 1,
                "y": 1
            }, {
                "x": 2,
                "y": 2
            }, {
                "x": 2,
                "y": 0
            }, {
                "x": 3,
                "y": 2
            }, {
                "x": 2,
                "y": 3
            }, {
                "x": 1,
                "y": 3
            }, {
                "x": 0,
                "y": 2
            }, {
                "x": 0,
                "y": 1
            }, {
                "x": 3,
                "y": 1
            }]
        },
        "road": {
            "pos": [{
                "x": 3,
                "y": 0
            }, {
                "x": 2,
                "y": 1
            }, {
                "x": 1,
                "y": 2
            }, {
                "x": 0,
                "y": 3
            }]
        }
    }
}