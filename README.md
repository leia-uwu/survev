# Open sourced surviv.io
Survev.io is an open source recreation of a hit web game "surviv.io" that has been permanently shut down.

Our goal is to immortalize it by getting the recreation as close as possible to the last canonical version of the game.

We do not consider any updates after the Kongregate acquisition canonical, so those will not be a part of the project.

## Running locally

start client development server with `pnpm dev:client`

and server with `pnpm dev:server`

or cd into server and client directories and run `pnpm dev` for each

### Additional steps for accounts
Accounts are optional, set `accountsEnabled` to false in config.ts to disable them. 
If disabled, you can skip the steps below.

First generate a private key and set encryptLoadoutSecret to it, this is used to encrypt loadouts.
```sh
openssl rand -base64 10
```
 
After that, you need to create and populate the SQLite file and apply the database schema.
```bash
 cd /server
 
 # run this everytime you make changes to the schema.ts
 pnpm run db:generate
 pnpm run db:migrate

 # start the server
 pnpm run dev
 # or
 # pnpm run dev:api
 # pnpm run dev:game
```

to interact with the database through an interface
```bash
 pnpm run db:studio 
```

to wipe the db and start over run, useful when messing up things
DO NOT RUN THIS IN PRODUCTION
```bash
 pnpm run db:wipe
```

## Production builds
See [HOSTING.md](./HOSTING.md)
