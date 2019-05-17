const LOW_RES_DELAY = 20;
const HIGH_RES_DELAY = 800;
const DEFAULT_WIDTH = 3.2;
const KEYBINDS = {
	"w": "up",
	"s": "down",
	"a": "left",
	"d": "right",
	"e": "in",
	"q": "out",
};

const progressBar = document.getElementById("progress");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let xOffset = 0;
let yOffset = 0;
let zoom = 1;
let lowResTimeout;
let highResTimeout;

window.onload = () => {
	readHash();
	initDrawing();
}

window.onresize = initDrawing;

window.onkeydown = (e) => {
	const c = String.fromCharCode(e.keyCode);
	const step = 0.1 * zoom;
	const fac = 0.9;
	
	switch (KEYBINDS[c.toLowerCase()]) {
		case "up": yOffset -= step;
			break;
		case "down": yOffset += step;
			break;
		case "left": xOffset -= step;
			break;
		case "right": xOffset += step;
			break;
		case "in": zoom *= fac;
			break;
		case "out": zoom /= fac;
			break;
		default: return;
	}

	updateHash();
	initDrawing();
}

function updateHash() {
	location.hash = [zoom, xOffset, yOffset].join("/");
}

function readHash() {
	if (!location.hash)
		return;

	values = location.hash.substr(1).split("/");
	zoom = +values[0];
	xOffset = +values[1];
	yOffset = +values[2];
}

function initDrawing() {
	clearTimeout(lowResTimeout);
	clearTimeout(highResTimeout);
	lowResTimeout = setTimeout(drawLowRes, LOW_RES_DELAY);
	highResTimeout = setTimeout(drawHighRes, HIGH_RES_DELAY);
}

function drawLowRes() {
	let f = 1 / Math.pow(zoom, 0.5);
	let iterations = 0.5 * f + 20;
	setTimeout(() => draw(0.06, iterations), 0);
}

function drawHighRes() {
	let f = 1 / Math.pow(zoom, 0.5);
	let iterations = 0.5 * f + 30;
	setTimeout(() => draw(0.7, iterations), 0);
}

function draw(resolution, iterations) {
	canvas.width = window.innerWidth * resolution;
	canvas.height = window.innerHeight * resolution;

	let width = DEFAULT_WIDTH;
	let fac = width / canvas.width;
	let height = canvas.height * fac;

	for (let cX = 0; cX < canvas.width; cX++) {
		let x = cX / canvas.width - 0.5;
		x *= width;
		x *= zoom;
		x += xOffset;
		
		for (let cY = 0; cY < canvas.height; cY++) {
			let y = cY / canvas.height - 0.5;
			y *= height;
			y *= zoom;
			y += yOffset;

			let z = {x: 0, y: 0};
			let i;
			for (i = 0; i < iterations; i++) {
				let _x = (z.x * z.x - z.y * z.y) + x;
				let _y = 2 * (z.x * z.y) + y;
				if (_x * _x + _y * _y > 4) break;
				z.x = _x;
				z.y = _y;
			}

			set(cX, cY, getColor(i, iterations));
		}
	}
}

function getColor(i, iterations) {
	const p = i / iterations;
	const h = 360 * p;
    const s = 100 * p;
    const l = 100 * (1 - p) - (i % 100);
 
    return `hsl(${h}, ${s}%, ${l}%)`;
}

function set(x, y, color) {
	ctx.fillStyle = color;
	ctx.fillRect(x, y, 1, 1);
}
