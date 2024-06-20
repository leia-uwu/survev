## TODO LIST / PROGRESS

### Player
 - [x] Moving
 - [x] Collision
 - [x] Health and dying
 - [x] Kill messages
 - [x] Armor and vests
 - [x] Adrenaline
 - [x] Scopes
 - [x] Consumable items
 - [x] Spectating
 - [x] Slowdown on water
 - [ ] Kill Leader
 - [x] Loadouts
 - [x] Emotes
 - [ ] Roles and cobalt classes

### Guns
 - [x] Firing logic (should be 1/1 to surviv firing logic)
 - [x] fix bullet spawn layer when on stairs
 - [x] Switch delays
 - [x] Firing delays
 - [x] Ammo
 - [x] Reloading
 - [x] Burst guns
 - [ ] Projectile guns (potato cannon and spud gun)


### Bullets
 - [x] Collision
 - [x] Reflection
 - [x] Culling
 - [ ] Damage falloff

### Melee weapons
 - [x] Collision
 - [x] Delays
 - [x] Auto use (hook)

### Obstacles
 - [x] Spawning, destroying, collision
 - [x] Windows
 - [x] Doors
 - [x] Sliding doors
 - [x] Auto opening doors
 - [x] Door layer on stairs
 - [x] Buttons
 - [x] Loot

### Buildings
 - [x] Generation
 - [x] Ceiling Zoom
 - [x] Destroying and damaging ceilings
 - [x] Puzzles
 - [ ] Occupied emitters (like Smoke from cabins when player is inside)
 - [ ] Heal regions (club pool sauna)
 - [ ] Gore regions (club pool blood on kills)

### Structures
 - [x] Generation
 - [x] Switching layers (currently kinda buggy and needs refactoring)

### Map Generation
 - [x] Basic generation
 - [x] Getting objects to not overlap
 - [x] Spawning objects on beach and rivers properly
 - [x] Port Terrain and river code
 - [ ] Randomized River generation (WIP)

### Loot
 - [x] Loot game object
 - [x] Loot tables
 - [x] Physics
 - [x] Picking up loot
 - [x] Switching layers
 - [ ] Fix loot on bridges
 - [x] River flow

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
 - [x] Explosive Rounds

won't list all that need to be competently done because lazy

### Squad / Duos
 - [ ] API
 - [ ] Map Indicators
 - [ ] Randomized duos / squads when not using create team

### Other features
 - [x] Explosions
 - [ ] Throwables
 - [ ] Airdrops
 - [ ] Planes
 - [x] Gas

### Server and core stuff
 - [x] Port all definitions from the clients
 - [x] Debundle client and share code and definitions
 - [ ] Separating API and Game servers
 - [ ] Connections limit per ip
 - [ ] Banning Ips
 - [ ] Matchmaking algorithm
