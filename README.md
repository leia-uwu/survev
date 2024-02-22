# Open sourced surviv.io
Reverse engineered surviv.io client and server.

This is really work in progress and nowhere near finished

### [TODO LIST AND PROGRESS](./TODO.md)

## Running locally

start client development server with `pnpm dev:client`

and server with `pnpm dev:server`

or cd into server and client directories and run `pnpm dev` for each

## Production builds
Build client and server with `pnpm -r build`

Start the server with `pnpm start` on the server directory

you can use `pnpm preview` on the client to use vite preview server, but [nginx](https://nginx.org) is more recommended for that
