## Welcome to Poker game backend

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
### 2. Current Issues
##### This application still has some bugs and issues
1. Tie breakers for same pairs and straights in src/Poker/Lib/HandStrength.ts
2. starting player during each round has to be correct (in src/Poker/Lib/TurnOrderManagement.ts)
3. Next round issues when next round button is pressed, after a few turns, there will be no button showing up at all for the next turn (link to frontend: https://github.com/DonovanVA/donnygames)