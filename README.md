# Multiplayer Tic-Tac-Toe 

Welcome to multiplayer tic-tac-toe! 

## Features

- When two clients (players) are connected to the server the game starts!
- Any subsequent clients that join are view-only spectators.
- At any point either player can resign by entering `r`. A message is sent to all clients signaling the opposing player win. 
- If either player disconnects, a message is sent to all clients signaling the opposing player win.
- The board is numbered 1-9. Players take turns choosing a location to mark their corresponding O or X.
- The game is over and all clients disconnect when there is a winner or a tie.
- Socket.io is leveraged to support full-duplex communication between client and server.
- New clients can join and start a new game while the server remains running.

## Setup

- `npm i -g yarn`
- `nvm use`
- `yarn install`

To run with yarn (ts-node): 
- `yarn start:server 5050`
- `yarn start:client localhost 5050`

To run with node:
- `yarn build`
- `cd dist`
- `node ./server 5050`
- `node ./client localhost 5050`
