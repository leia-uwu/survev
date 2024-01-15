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
 - [ ] Getting objects to not overlap (WIP)
 - [ ] Spawning objects on beach and rivers properly
 - [x] Port Terrain and river code
 - [ ] Randomized River generation (WIP)

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
 - [x] Main spring
 - [x] Main Summer
 - [x] Desert
 - [x] Faction
 - [x] Halloween
 - [x] Potato
 - [x] Potato spring
 - [x] Snow
 - [x] Woods
 - [x] Woods snow
 - [x] Woods Spring

Modes not in the leaked definitions (need map generation code):
 - [ ] Woods summer
 - [ ] Savannah
 - [ ] Cobalt
 - [ ] turkey

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
 	- [x] Disconnect
 	- [x] Input
 	- [ ] Edit (empty class on client, idk what it was for, probably debugging stuff)
 	- [x] Joined
 	- [x] Update (deserialization still needs to be done, but its not used for now)
 	- [x] Kill
 	- [x] GameOver
 	- [x] Pickup
 	- [x] Map
 	- [x] Spectate
 	- [x] DropItem
 	- [x] Emote
 	- [x] PlayerStats
 	- [ ] AdStatus
 	- [x] Loadout
 	- [x] RoleAnnouncement
 	- [x] Stats
 	- [ ] UpdatePass (also an empty class on client)
 	- [x] AliveCounts
 	- [ ] PerkModeRoleSelect
 - [ ] Connections limit per ip
 - [ ] Banning Ips
 - [ ] Matchmaking algorithm
