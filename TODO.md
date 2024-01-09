## TODO LIST / PROGRESS

### Player
 - [x] Moving
 - [x] Collision
 - [x] Health and dying
 - [x] Kill messages
 - [x] Armor and vests
 - [ ] Adrenaline
 - [ ] Scopes
 - [ ] Consumable items
 - [ ] Spectating
 - [x] Slowdown on water
 - [ ] Kill Leader
 - [ ] Loadouts
 - [ ] Emotes
 - [ ] Roles and cobalt classes

### Guns
 - [x] Firing logic (should be 1/1 to surviv firing logic)
 - [ ] fix bullet spawn layer when on stairs
 - [ ] Switch delays
 - [ ] Firing delays
 - [ ] Ammo
 - [ ] Reloading


### Bullets
 - [x] Collision
 - [x] Reflection
 - [x] Culling
 - [ ] Damage falloff

### Melee weapons
 - [x] Collision
 - [x] Delays
 - [ ] Auto use (hook)

### Obstacles
 - [x] Spawning, destroying, collision
 - [x] Windows
 - [x] Doors
 - [x] Sliding doors
 - [ ] Auto opening doors
 - [ ] Door layer on stairs
 - [x] Buttons
 - [x] Loot

### Buildings
 - [x] Generation
 - [ ] Ceiling Zoom
 - [ ] Destroying and damaging ceilings
 - [x] Puzzles

### Structures
 - [x] Generation
 - [x] Switching layers (currently kinda buggy and needs refactoring)

### Map Generation
 - [x] Basic generation
 - [ ] Getting objects to not overlap
 	- [x] Partially done
 - [ ] Spawning objects on beach and rivers properly
 - [x] Port Terrain and river code
 - [ ] Randomized River generation

### Loot
 - [x] Loot game object
 - [x] Loot tables
 - [x] Physics
 - [ ] Picking up loot
 - [ ] Switching layers
 - [ ] River flow

### Modes defs
Some modes server definitions were leaked in an old stats page app.js
but they are outdated and missing some stuff
this is the ones ported so far (but not fully updated):
 - [x] Main Mode
 - [x] Desert
 - [x] Faction
 - [x] Halloween
 - [x] Potato
 - [x] Woods
 - [ ] Seasonal variants of normal and woods map

Modes not in the leaked definitions:
 - [ ] Cobalt
 - [ ] Savannah

### Perks
 - [ ] Cast Iron Skin
	 - [x] Bullet Reflection
	 - [ ] Size Change
	 - [ ] Damage Reduction
 - [ ] Splinter
	 - [ ] Damage reduction of main bullet
 - [x] Explosive Rounds (logic is done but requires explosions)

won't list all that need to be competently done because lazy

### Squad / Duos
 - [ ] API
 - [ ] Map Indicators
 - [ ] Randomized duos / squads when not using create team

### Other features
 - [ ] Explosions
 - [ ] Throwables
 - [ ] Airdrops
 - [ ] Planes
 - [ ] Gas

### Server and core stuff
 - [x] Port all definitions from the client
 - [x] Port all game objects serializations
 - [ ] Port all msgs serializations
 	- [x] Join
 	- [ ] Disconnect
 	- [x] Input
 	- [ ] Edit
 	- [x] Joined
 	- [x] Update
 	- [x] Kill
 	- [x] GameOver
 	- [ ] Pickup
 	- [x] Map
 	- [ ] Spectate
 	- [ ] DropItem
 	- [ ] Emote
 	- [x] PlayerStats
 	- [ ] AdStatus
 	- [ ] Loadout
 	- [ ] RoleAnnouncement
 	- [ ] Stats
 	- [ ] UpdatePass
 	- [x] AliveCounts
 	- [ ] PerkModeRoleSelect
 - [ ] Connections limit per ip
 - [ ] Banning Ips
 - [ ] Matchmaking algorithm
