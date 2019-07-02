//BODY & ARMS building

/* 
BODY JSON
- 10 extensions included for RCL 3
- built around storage
- 5 wide / 9 tall
- includes higher lvl structures

to calculate the relative positions, just use 
 */
var body = {
    "buildings": {
        "storage": {
            "pos": [{
                "x": 24,
                "y": 17
            }]
        },
        "road": {
            "pos": [{
                "x": 23,
                "y": 17
            }, {
                "x": 23,
                "y": 18
            }, {
                "x": 24,
                "y": 18
            }, {
                "x": 24,
                "y": 18
            }, {
                "x": 25,
                "y": 18
            }, {
                "x": 25,
                "y": 17
            }, {
                "x": 25,
                "y": 16
            }, {
                "x": 23,
                "y": 16
            }, {
                "x": 24,
                "y": 16
            }, {
                "x": 24,
                "y": 19
            }, {
                "x": 24,
                "y": 15
            }, {
                "x": 26,
                "y": 15
            }, {
                "x": 22,
                "y": 15
            }, {
                "x": 22,
                "y": 19
            }, {
                "x": 26,
                "y": 19
            }, {
                "x": 24,
                "y": 20
            }, {
                "x": 24,
                "y": 14
            }, {
                "x": 23,
                "y": 13
            }, {
                "x": 25,
                "y": 13
            }, {
                "x": 23,
                "y": 21
            }, {
                "x": 25,
                "y": 21
            }]
        },
        "spawn": {
            "pos": [{
                "x": 23,
                "y": 19
            }, {
                "x": 25,
                "y": 19
            }, {
                "x": 22,
                "y": 20
            }]
        },
        "tower": {
            "pos": [{
                "x": 23,
                "y": 20
            }, {
                "x": 25,
                "y": 20
            }, {
                "x": 23,
                "y": 14
            }, {
                "x": 25,
                "y": 14
            }, {
                "x": 22,
                "y": 17
            }, {
                "x": 26,
                "y": 17
            }]
        },
        "link": {
            "pos": [{
                "x": 25,
                "y": 15
            }]
        },
        "extension": {
            "pos": [{
                "x": 26,
                "y": 18
            }, {
                "x": 26,
                "y": 16
            }, {
                "x": 22,
                "y": 16
            }, {
                "x": 22,
                "y": 18
            }, {
                "x": 26,
                "y": 14
            }, {
                "x": 22,
                "y": 14
            }, {
                "x": 22,
                "y": 21
            }, {
                "x": 26,
                "y": 21
            }, {
                "x": 26,
                "y": 13
            }, {
                "x": 22,
                "y": 13
            }]
        },
        "terminal": {
            "pos": [{
                "x": 23,
                "y": 15
            }]
        },
        "nuker": {
            "pos": [{
                "x": 24,
                "y": 13
            }]
        },
        "observer": {
            "pos": [{
                "x": 24,
                "y": 21
            }]
        },
        "powerSpawn": {
            "pos": [{
                "x": 26,
                "y": 20
            }]
        }
    }
};


/*
ARMS
- 6 arms needed total, 5 with extensions, 1 with labs
- 5 wide, 5 tall
- connect on corners, with no overlaps to body
*/
var armExtensionsTopLeft = {
    "buildings": {
        "lab": {
            "pos": []
        },
        "road": {
            "pos": [{
                "x": 25,
                "y": 19
            }, {
                "x": 24,
                "y": 18
            }, {
                "x": 26,
                "y": 20
            }, {
                "x": 27,
                "y": 21
            }]
        },
        "extension": {
            "pos": [{
                "x": 25,
                "y": 18
            }, {
                "x": 26,
                "y": 18
            }, {
                "x": 26,
                "y": 19
            }, {
                "x": 27,
                "y": 19
            }, {
                "x": 27,
                "y": 20
            }, {
                "x": 24,
                "y": 19
            }, {
                "x": 24,
                "y": 20
            }, {
                "x": 25,
                "y": 20
            }, {
                "x": 25,
                "y": 21
            }, {
                "x": 26,
                "y": 21
            }]
        }
    }
}
var armExtensionsTopRight = {
    "buildings": {
        "lab": {
            "pos": []
        },
        "road": {
            "pos": [{
                "x": 27,
                "y": 18
            }, {
                "x": 26,
                "y": 19
            }, {
                "x": 25,
                "y": 20
            }, {
                "x": 24,
                "y": 21
            }]
        },
        "extension": {
            "pos": [{
                "x": 25,
                "y": 18
            }, {
                "x": 26,
                "y": 18
            }, {
                "x": 27,
                "y": 19
            }, {
                "x": 27,
                "y": 20
            }, {
                "x": 24,
                "y": 19
            }, {
                "x": 25,
                "y": 21
            }, {
                "x": 26,
                "y": 21
            }, {
                "x": 25,
                "y": 19
            }, {
                "x": 26,
                "y": 20
            }, {
                "x": 24,
                "y": 20
            }]
        }
    }
}

var armLabsTopLeft = {
    "buildings": {
        "lab": {
            "pos": [{
                "x": 25,
                "y": 18
            }, {
                "x": 26,
                "y": 18
            }, {
                "x": 27,
                "y": 20
            }, {
                "x": 26,
                "y": 21
            }, {
                "x": 25,
                "y": 21
            }, {
                "x": 24,
                "y": 20
            }, {
                "x": 24,
                "y": 19
            }, {
                "x": 27,
                "y": 19
            }, {
                "x": 26,
                "y": 19
            }, {
                "x": 25,
                "y": 20
            }]
        },
        "road": {
            "pos": [{
                "x": 25,
                "y": 19
            }, {
                "x": 24,
                "y": 18
            }, {
                "x": 26,
                "y": 20
            }, {
                "x": 27,
                "y": 21
            }]
        }
    }
}
var armLabsTopRight = {
    "buildings": {
        "lab": {
            "pos": [{
                "x": 25,
                "y": 18
            }, {
                "x": 25,
                "y": 19
            }, {
                "x": 26,
                "y": 20
            }, {
                "x": 26,
                "y": 18
            }, {
                "x": 27,
                "y": 20
            }, {
                "x": 26,
                "y": 21
            }, {
                "x": 25,
                "y": 21
            }, {
                "x": 24,
                "y": 20
            }, {
                "x": 24,
                "y": 19
            }, {
                "x": 27,
                "y": 19
            }]
        },
        "road": {
            "pos": [{
                "x": 27,
                "y": 18
            }, {
                "x": 26,
                "y": 19
            }, {
                "x": 25,
                "y": 20
            }, {
                "x": 24,
                "y": 21
            }]
        }
    }
}