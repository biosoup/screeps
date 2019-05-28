/** TODO or TO BE DONE

- multiroom focused rewrite
    - https://www.reddit.com/r/screeps/comments/6uzqkb/tips_for_multiroom_architecture/dmozat8/
    - smarter energy redistribution
        - room based logic
        - calculate aginst maximum energy production

- stats !!
    - process execution time
    - enemies present
    - number of buildings and their progress
    - number of each spawn type
    - defenses statistics
        - including tower stats
    - spawn busy time
    - screeps work
        - energy transfers
        - idle time per workgroup !!!
    
- visual / console
    - add a visual for spawn
    - next spawn
    - add a say to creeps
    - add s console status/visual about how the room is running
    
- better console conrol
    - on room level?

- longdistanceharvester
    - logic for source selection

- tower logic
    - better energy conience

- spawner logic 
    - better spawning process -> multiwork creep
    - spawn que with prioritization
    - compute expected ROI of worker
    
- lorry logic
    - do not supply tower?
    - prioritization!
    
- multiwork creep
    - internal prioritization of tasks -> room level !
    - big as possible
    - spawned number based on number of outstading tasks
        - always keep
            - 1x harvester
            - 1x upgrader    
        - 1x builder for each 2 construction sites
        - 1x repairer, when tower not repairing
        - ?x miner (1 per source)
        - ?x lorry (1 per miner)
    - change roles based on task list
    - task focused (no change in middle of work, work till empty)
    - better pathing (target in memory, separate logic for movement)
    - recycling
    
- distatntWorkers
    - distantMiner
        - ROI tracking
        - source selection based on flags
    - distantBuilder

- defense / attack creeps
    - flag based attack waves
    
- structure mapping
    - get all cureent structures
    - optimal structure placement
    - flags for future expansion + visuals
    - 1 space between spawn<>link<>storage

*/