## Welcome to Donny Games!
##### This is my very own crash course into websocket development via making a Poker Game
<img width="758" alt="Screenshot 2023-10-06 at 11 42 40 PM" src="https://github.com/DonovanVA/donnygamesBackend/assets/86190604/ef3a0301-f595-4c13-955f-1c721230d2e5">

### frontend:
https://github.com/DonovanVA/donnygames

### 1.Installation
##### Install dependencies
```
npm install
```
##### Start the backend
```
npm start
```
### 2. Current Issues READ BELOW:
##### This application still has some bugs and issues. Unfortunately, poker is a highly complicated game with various winning logic that I could not wrap my head around, would like some help:
1. Tie breakers for same pairs and straights in src/Poker/Lib/HandStrength.ts
2. starting player during each round has to be correct (in src/Poker/Lib/TurnOrderManagement.ts)
3. Next round issues when next round button is pressed, after a few turns, there will be no button showing up at all for the next turn (link to frontend: https://github.com/DonovanVA/donnygames)

##### Yet to be tested:
1. Side pot winning allocation when player alls in and win/loses
