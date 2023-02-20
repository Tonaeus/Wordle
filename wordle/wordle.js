// Board size
var height = 4;
var width = 4;

// Current tile
var row = 0;
var col = 0;

// Game state
var gameOver = false;
var win = false;

// Fetched words and hints
var json = {};
var item = "";
var word = "TONY";
var hint = "Tony";
var uneditedWord = "Tony";
var loading = false;

// Themes
var themes = {
	dark: {
		"--backgroundC": "#121213",
		"--borderC": "#FFFFFF",
		"--highlightC": "#454545",
		"--textC": "#FFFFFF",
		"--iconC": "#FFFFFF",
		"--correctC": "#538D4D",
		"--presentC": "#B59F3B",
		"--absentC": "#3A3A3C",
		"--lostC": "#FFFFFF",
		"--lostTextC": "#121213",
	},
	light: {
		"--backgroundC": "#FFFFFF",
		"--borderC": "#D3D3D3",
		"--highlightC": "#EEEEEE",
		"--textC": "#121213",
		"--iconC": "#121213",
		"--correctC": "#6AAA64",
		"--presentC": "#C9B458",
		"--absentC": "#787C7E",
		"--lostC": "#FF0000",
		"--lostTextC": "#FFFFFF",
	},
};

// Tile highlight
var arr = [
	[0, 0], [0, 1], [0, 2], [0, 3],
	[1, 0], [1, 1], [1, 2], [1, 3],
	[2, 0], [2, 1], [2, 2], [2, 3],
	[3, 0], [3, 1], [3, 2], [3, 3],
];
var position = 0;

window.onload = function () {
	fetchWord();
	intialize();
};

// Fetches dictionary
async function fetchWord() {
	const btn = document.getElementById("btn");
	btn.innerHTML = `<button id= "load" disabled><span>Loading...</span></button>`;

	const res = await fetch("https://api.masoudkf.com/v1/wordle", {
		headers: {
			"x-api-key": "sw0Tr2othT1AyTQtNDUE06LqMckbTiKWaVYhuirv",
		},
	});
	json = await res.json();

	loading = true;
	btn.innerHTML = `<label id="reset"><span>Start Over</span></label>`;

	guessWord();
	tileUpdate(0);
}

// Selects a word and hint pair
function guessWord() {
	item = json.dictionary[Number.parseInt(Math.random() * json.dictionary.length)];

	word = item.word.toUpperCase();
	hint = item.hint;

	uneditedWord = item.word;

	// console.log(word);
	// console.log(hint);
}

// Creates board
function createBoard() {
	for (let r = 0; r < height; r++) {
		for (let c = 0; c < width; c++) {
			let tile = document.createElement("span");
			tile.id = r.toString() + "-" + c.toString();
			tile.classList.add("tile");
			tile.innerText = "";
			document.getElementById("board").appendChild(tile);
		}
	}
}

// Highlights input tile
function tileUpdate(move, column) {
	if (win) {
		return;
	}
	if (position != 16) {
		let oldTile = document.getElementById(
		arr[position][0].toString() + "-" + arr[position][1]
		);
		oldTile.className = "tile";
	}

	position += move;

	if (position != 16 && column != 4) {
		let newTile = document.getElementById(
			arr[position][0].toString() + "-" + arr[position][1]
		);
		newTile.classList.add("tileUpdate");
	}
}

function intialize() {
	// Variables
	var currMode = "light";

	const text = document.getElementById("text");
	text.innerHTML = "";

	const instr = document.getElementById("instruction");
	instr.innerHTML = "";
	const area = document.getElementById("playArea");

	// Creates game board
	createBoard();

	// Reset button
	document.querySelector("#btn").onclick = () => {
		if (loading) {
			if (win) {
				win = false;
				document.getElementById("region").innerHTML = `<div id="board"></div>`;
			} else {
				document.getElementById("board").innerHTML = "";
			}
			text.innerHTML = "";
			text.className = "";

			gameOver = false;

			row = 0;
			col = 0;
			createBoard();

			guessWord();

			position = 0;
			tileUpdate(0);
		}
	};

	// Theme button
	document.querySelector("#mode").onclick = () => {
		const root = document.querySelector(":root");
		if (currMode == "light") {
			const setVariables = (vars) =>
				Object.entries(vars).forEach((v) => root.style.setProperty(v[0], v[1]));
			setVariables(themes.dark);
			currMode = "dark";
		} else {
			const setVariables = (vars) =>
				Object.entries(vars).forEach((v) => root.style.setProperty(v[0], v[1]));
			setVariables(themes.light);
			currMode = "light";
		}
	};

	// Hint button
	document.querySelector("#hint").onclick = () => {
		if (!loading) {
			window.alert("Hint is being loaded!");
		} else if (text.className == "lostMessage") {
			window.alert("Answer is already provided!");
		} else if (win) {
			window.alert("You have already answered correctly!");
		} else if (text.innerHTML == "") {
			var hintMessage = document.createElement("p");
			hintMessage.innerHTML = `<i>Hint:</i> ${hint}`;
			text.appendChild(hintMessage);
			text.classList.add("hintMessage");
		} else {
			text.innerHTML = "";
			text.className = "";
		}
	};

	// Info button
	document.querySelector("#info").onclick = () => {
		if (instr.innerHTML == "") {
			instr.innerHTML = `
			<h2>How to Play</h2>
			<ul>
				<li>Start typing, the letters will appear in the boxes</li>
				<li>Remove letters with Backspace</li>
				<li>Hit Enter or Return to submit an answer</li>
				<li>Letters with green background are in the right spot</li>
				<li>Letters with yellow background exist in the word, but are in the wrong spot</li>
				<li>Letters with gray background do no exist in the word</li>
				<li>If you need a hint, click on the <b>&#63;</b> icon</li>
			</ul>
			`;
			instr.className = "instructionUpdate";
			area.className = "playAreaUpdate";
		} else {
			instr.innerHTML = "";
			instr.className = "";
			area.className = "";
		}
	};

	// Listens for key press
	document.addEventListener("keyup", (e) => {
		if (loading) {
			if (gameOver) return;

			if ("KeyA" <= e.code && e.code <= "KeyZ") {
				if (col < width) {
					let currTile = document.getElementById(row.toString() + "-" + col.toString());
					if (currTile.innerText == "") {
						currTile.innerText = e.code[3];
						col += 1;
						tileUpdate(1, col);
					}
				}
			} else if (e.code == "Backspace") {
				if (0 < col && col <= width) {
					col -= 1;
					tileUpdate(-1);
				}
				let currTile = document.getElementById(row.toString() + "-" + col.toString());
				currTile.innerText = "";
			} else if (e.code == "Enter") {
				if (col != width) {
					window.alert("You must complete the word first!");
				} else {
					update();
					row += 1;
					col = 0;
					tileUpdate(0);
				}
			}

			if (!gameOver && row == height) {
				gameOver = true;

				text.innerHTML = "";
				text.className = "";

				var lostMessage = document.createElement("p");
				lostMessage.innerHTML = `You missed the word <b>${uneditedWord}</b> and lost!`;

				document.getElementById("text").appendChild(lostMessage);
				document.getElementById("text").classList.add("lostMessage");
			}
		}
	});
}

function update() {
	// Creates object of letter count
	let correct = 0;
	let letterCount = {};
	for (let i = 0; i < word.length; i++) {
		letter = word[i];
		if (letterCount[letter]) {
			letterCount[letter] += 1;
		} else {
			letterCount[letter] = 1;
		}
	}

	// Checks for correct letters
	for (let c = 0; c < width; c++) {
		let currTile = document.getElementById(row.toString() + "-" + c.toString());
		let letter = currTile.innerText;

		if (word[c] == letter) {
			currTile.classList.add("correct");
			correct += 1;
			letterCount[letter] -= 1;
		}

		// Displays gif if guess is correct
		if (correct == width) {
			gameOver = true;

			document.getElementById("region").innerHTML =
				'<img src="https://res.cloudinary.com/mkf/image/upload/v1675467141/ENSF-381/labs/congrats_fkscna.gif" alt="ALTERNATE_TEXT"></img>';

			text.innerHTML = "";
			text.className = "";

			var winMessage = document.createElement("p");
			winMessage.innerHTML = `You guessed the word <b>${uneditedWord}</b> correctly!`;
			document.getElementById("text").appendChild(winMessage);
			document.getElementById("text").classList.add("winMessage");

			win = true;
		}
	}

	// Checks for present letters and absent letters
	if (!win) {
		for (let c = 0; c < width; c++) {
			let currTile = document.getElementById(row.toString() + "-" + c.toString());
			let letter = currTile.innerText;

			if (!currTile.classList.contains("correct")) {
				if (word.includes(letter) && letterCount[letter] > 0) {
					currTile.classList.add("present");
					letterCount[letter] -= 1;
				} else {
					currTile.classList.add("absent");
				}
			}
		}
	}
}
