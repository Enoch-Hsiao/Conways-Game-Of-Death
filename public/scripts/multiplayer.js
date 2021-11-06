import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.3.0/firebase-app.js'
import { getDatabase, ref, set, push, child, get, onValue } from "https://www.gstatic.com/firebasejs/9.3.0/firebase-database.js";

// TODO: Replace the following with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyAODKoKrUY4-8QWpN_jnunw5So9LvG3ERM",
  authDomain: "conways-game-of-death.firebaseapp.com",
  databaseURL: "https://conways-game-of-death-default-rtdb.firebaseio.com",
  projectId: "conways-game-of-death",
  storageBucket: "conways-game-of-death.appspot.com",
  messagingSenderId: "493535520033",
  appId: "1:493535520033:web:fb20cbcc9f5bfdf3b88a60"
};

const app = initializeApp(firebaseConfig);

let database = getDatabase(app);
// assume user is host
let gameData = {
    numPixels: 15,
    iterations: 500,
    boardSize: 30,
    timerPerGeneration: 50,
    gameState: 'configuration'
  };

let keyValueForGame = push(ref(database, 'gameSessions'), {
    numPixels: 15,
    iterations: 500,
    boardSize: 30,
    timerPerGeneration: 50,
    gameState: 'configuration'
  }).key;

let host = true
let player2Present = false
document.getElementById("game-PIN-value").innerHTML = 'Game PIN:' + keyValueForGame

const db = getDatabase()
const dbRef = ref(getDatabase());

let gameSessionRef = ref(db, `gameSessions/${keyValueForGame}`);
function gameDataChange(host) {
  onValue(gameSessionRef, (snapshot) => {
    gameData = snapshot.val();
    console.log(gameData);
    if (gameData.player2Present && gameData.gameState == "configuration") {
      player2Present = true;
      document.getElementById("join-game").style.display = "none";
      if(host) {
        document.getElementById("game-state").innerHTML = "Please enter your configuration for the game as the host.";
      } else {
        document.getElementById("game-state").innerHTML = "Please wait for the host to configure the game";
      }
    }
  });
}

function checkPIN() {
  let PIN = document.getElementById('game-PIN').value;
  if (PIN.trim() === '') {
    document.getElementById("not-valid").innerHTML = 'PIN is blank!';
    return;
  }
  if (PIN === keyValueForGame) {
    document.getElementById("not-valid").innerHTML = 'You cannot join your own game!';
    return;
  }
  get(child(dbRef, `gameSessions/${PIN}`)).then((snapshot) => {
    let data = snapshot.val();
    if (!snapshot.exists()) {
      document.getElementById("not-valid").innerHTML = 'No game found for game PIN!';
      return;
    } 
    if (data.player2Present) {
      document.getElementById("not-valid").innerHTML = 'Game is already full!';
      return;
    } 
    keyValueForGame = PIN;
    document.getElementById("game-PIN-value").innerHTML = 'Game PIN:' + PIN;
    document.getElementById("join-game").style.display = "none";
    document.getElementById("star-player-1").style.display = "none";
    document.getElementById("star-player-2").style.display = "inline-block";
    data['player2Present'] = true;
    set(ref(database, `gameSessions/${PIN}`), data).key;
    gameSessionRef = ref(db, `gameSessions/${PIN}`);
    gameData = data;
    host = false;
    gameDataChange(host);
  })
}

document.getElementById('Enter Game').addEventListener('click', checkPIN);

initialConfig();

function initialConfig() {
  let fillerButton = document.getElementById("filler-button");
  fillerButton.disabled = true;
  fillerButton.style.background = '#202020';
  fillerButton.style.color = 'white';
  gameDataChange(true);
}
let helpModal = document.getElementById("help-modal");
let helpButton = document.getElementById("help-button");
let closeButtonHelpButton = document.getElementsByClassName("close-button-help-model")[0];

helpButton.onclick = function() {
  helpModal.style.display = "flex";
}
closeButtonHelpButton .onclick = function() {
  helpModal.style.display = "none";
}
window.onclick = function(event) {
  if (event.target === helpModal) {
    helpModal.style.display = "none";
  }
}

function handleBoxClick(e) {
  let cursorPosition = getCursorPosition(e);
  let pixel = gameCtx.getImageData(cursorPosition.x, cursorPosition.y, 1, 1).data;
  // If the pixel has 0 opacity then color it in when clicked (0 opacity means white)
  if (toolSelected === "filler" && (pixel[3] === 0 || pixel[0] === 255 && pixel[1] === 255 && pixel[2] === 255) && numBoxesUsed < MAX_BOX_COUNT) {
    let color = "#FF0000";
    // TODO: UPDATE LIVE COUNTER ON SCREEN
    numBoxesUsed += 1;
    colorBox(cursorPosition.x, cursorPosition.y, color);
  } else if (toolSelected === "eraser" && pixel[0] === 255 && pixel[1] === 0) {
    let color = "#FFFFFF";
    // TODO: UPDATE LIVE COUNTER ON SCREEN
    numBoxesUsed -= 1;
    colorBox(cursorPosition.x, cursorPosition.y, color);
  }
}

function getCursorPosition(e) {
  let rect = gameCanvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
}

function colorBox(x, y, color) {
  let xBoxCoord = Math.floor(x / boxWidth);
  let yBoxCoord = Math.floor(y / boxHeight);
  let correctedX = xBoxCoord * boxWidth;
  let correctedY = yBoxCoord * boxHeight;

  gameCtx.beginPath();
  gameCtx.fillStyle = color;
  gameCtx.fillRect(correctedX, correctedY, boxWidth, boxHeight);
  gameCtx.stroke();
  gameCtx.beginPath();
  gameCtx.fillStyle = "#000000";
  gameCtx.rect(correctedX, correctedY, boxWidth, boxHeight);
  gameCtx.stroke();
}

function switchTool(tool) {
  if (tool === 'f') {
    toolSelected = "filler";
    let fillerButton = document.getElementById("filler-button");
    fillerButton.disabled = true;
    fillerButton.style.background = '#202020';
    fillerButton.style.color = 'white';
    let eraserButton = document.getElementById("eraser-button");
    eraserButton.disabled = false;
    eraserButton.style.background = 'white';
    eraserButton.style.color = 'black';
  } else {
    toolSelected = "eraser";
    let eraserButton = document.getElementById("eraser-button");
    eraserButton.disabled = true;
    eraserButton.style.background = '#202020';
    eraserButton.style.color = 'white';
    let fillerButton = document.getElementById("filler-button");
    fillerButton.disabled = false;
    fillerButton.style.background = 'white';
    fillerButton.style.color = 'black';
  }
}

async function startGame() {
  // Scale the game board down so that each box is represented by a single pixel on a new "canvas" represented by a 2D array
  let gameBoardArrayInitial = [];
  for (let row = 0; row < NUM_BOXES; ++row) {
    let innerArr = [];
    for (let boxInRow = 0; boxInRow < NUM_BOXES; ++boxInRow) {
      let cx = row * boxHeight + boxHeight / 2;
      let cy = boxInRow * boxHeight + boxHeight / 2;

      let pcolor = gameCtx.getImageData(cx, cy, 1, 1).data;
      if (pcolor.filter((e) => e === 0).length === 4 || pcolor.filter((e) => e === 255).length === 4) {
        innerArr.push({isAlive: false, controllingPlayer: null});
      } else {
        innerArr.push({isAlive: true, controllingPlayer: 1});
      }
    }
    gameBoardArrayInitial.push(innerArr);
  }

  let previousGen = makeCopy2D(gameBoardArrayInitial);
  let nextGen = makeCopy2D(gameBoardArrayInitial);
  function makeCopy2D(arr) {
    let newArr = [];
    for (let i = 0; i < arr.length; ++i) {
      let row = [];
      for (let j = 0; j < arr[i].length; ++j) {
        let cellCopy = {isAlive: arr[i][j].isAlive, controllingPlayer: arr[i][j].controllingPlayer};
        row.push(cellCopy);
      }
      newArr.push(row);
    }
    return newArr;
  }

  for (let genNum = 0; genNum < MAX_GEN_NUM; ++genNum) {
    await sleep(TIME_PER_GENERATION);
    // console.log("--------------------");
    // console.log("GENERATION " + (genNum + 1));
    // console.log("--------------------");
    // Run the simulation
    for (let col = 0; col < NUM_BOXES; ++col) {
      for (let row = 0; row < NUM_BOXES; ++row) {
        // console.log("curCell = (" + row + ", " + col + ")");
        const cell = previousGen[col][row]; // specific box
        let numNeighbors = 0; // amount of neighbors cell has
        for (let i = -1; i <= 1; ++i) { //finding current cell's neighbors. 3x3 square w/o the center square
          for (let j = -1; j <= 1; ++j) {
            if (i === 0 && j === 0) { continue; }
            let x_cell = col + i;
            let y_cell = row + j;

            if (x_cell >= 0 && y_cell >= 0 && x_cell < NUM_BOXES && y_cell < NUM_BOXES) {
              let currentNeighbor = previousGen[col + i][row + j];
              // console.log("cell at (" + row + ", " + col + ")" + (currentNeighbor.isDead ? " is dead" : " is alive"));
              if (currentNeighbor.isAlive) { numNeighbors += 1; }
            }
          }
        }

        // console.log("cell at (" + row + ", " + col + ") has " + numNeighbors + " neighbors");

        //rules of game
        //underpopulation
        if(cell.isAlive && numNeighbors < 2) { //if cur cell has less than 2 neighbors
          // console.log("Killing cell at (" + row + ", " + col + ") underpopulation");
          nextGen[col][row].isAlive = false;
          nextGen[col][row].controllingPlayer = null;
        }
        //overpopulation
        else if(cell.isAlive && numNeighbors > 3 ) { //if cur cell has more than 3 neighbors
          // console.log("Killing cell at (" + row + ", " + col + ") overpopulation");
          nextGen[col][row].isAlive = false;
          nextGen[col][row].controllingPlayer = null;
        }
        //revive
        else if(!cell.isAlive && numNeighbors === 3 ) { //if cur cell has exactly 3 neighbors and is dead
          // console.log("Reviving cell at (" + row + ", " + col + ")");
          nextGen[col][row].isAlive = true;
          nextGen[col][row].controllingPlayer = 1;
        }
      }
    }
    await(showOnScreen(nextGen));
    previousGen = makeCopy2D(nextGen);
  }
}

function showOnScreen(generationInfo) {
  // console.log(generationInfo);
  for (let i = 0; i < generationInfo.length; ++i) {
    for (let j = 0; j < generationInfo[i].length; ++j) {
      // scale the coordinates back up to full size
      let x = i * boxWidth + boxWidth / 2;
      let y = j * boxHeight + boxHeight / 2;
      // console.log("x: " + x + "   y: " + y);
      if (generationInfo[i][j].isAlive) {
        colorBox(x, y, "#FF0000");
      } else {
        colorBox(x, y, "#FFFFFF");
      }
      // gameCtx.beginPath();
      // if (i >= 3 && i <= 10) {
      //   gameCtx.fillStyle = "blue";
      // }
      // if (j >= 3 && j <= 10) {
      //   gameCtx.fillStyle = "blue";
      // }
      // gameCtx.fillRect(x - 4, y - 4, 8, 8);
      // gameCtx.stroke();
    }
  }
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }