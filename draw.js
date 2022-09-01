const inElement = document.querySelector("#input");
const outElement = document.querySelector("#output");
const btn = document.querySelector("#btn");

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d");

// align canvas properly
ctx.translate(0, canvas.height);
ctx.rotate(Math.PI);
ctx.scale(-1, 1);

let equations = [];
let global_scale = 100; //global per  unit on axis
let minX = -1;
let minY = -1;
let dx;

let rect;
let width;
let height;
let left;
let bottom;
let cursorX; // x coordinate of cursor in pixels
let cursorY; // y coordinate of cursor in pixels
let cursor_x_val; // x val of cursor
let cursor_y_val; // y val of cursor

let lastX;
let lastY;

let mouseDown;

function updateRect() {
  rect = canvas.getBoundingClientRect();
  width = rect.width;
  height = rect.height;
  left = rect.left;
  bottom = rect.bottom;

}

//mouse down
canvas.addEventListener("mousedown", (e) => {
  mouseDown = true;
  cursorX = e.clientX;
  cursorY = e.clientY;
  updateRect(e);

  lastX = cursorX; // not sure
  lastY = cursorY; // not sure
});

//mouse up
['mouseup', 'mouseleave'].forEach((event) =>
    canvas.addEventListener(event, (e) => mouseDown = false)
);

//mouse move
canvas.addEventListener("mousemove", (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;

  if (!mouseDown) {
    return;
  }
  updateRect(e);

  outElement.innerHTML = `${minX - cursorX / global_scale} ${
    minY - cursorY / global_scale
  }`;
  // translate minX and minY

  let _dx = cursorX - lastX;
  let _dy = cursorY - lastY;

  minX -= _dx / global_scale;
  minY += _dy / global_scale;

  lastX = cursorX;
  lastY = cursorY;

  reDraw();
});

//scroll for zoom
canvas.addEventListener("wheel", (e) => {
  var dy = -e.deltaY;

  let x = minX + cursorX / global_scale;
  let y = minY + cursorY / global_scale;

  if (dy > 0) {
    global_scale *= 1.05;
  } else if (dy < 0) {
    global_scale *= 0.95;
  }

  minX = x - cursorX / global_scale;
  minY = y - cursorY / global_scale;

  reDraw();
});

btn.addEventListener("click", (e) => {
  let eqn = inElement.value;
  let rpn = RPN(eqn);
  let val
  var out = "invalid input";

  if (rpn) {
    let tree = parse(rpn);
    val = eval(tree)
    console.log(tree);
    equations.push({
      eqn: eqn,
      tree: tree,
    });
    draw(tree);
    out = `Graphing Y = ${eqn} and value of equation is ${val}`;
  }

  outElement.innerHTML = out;
});

// drawing function

function draw(tree) {
  let i = 0;
  dx = 1 / global_scale;

  let y;
  variables.x = minX;

  let width = canvas.width;

  //find first define point on graph
  while ((y = eval(tree)) === NaN && i < width) {
    variables.x = minX + i * dx;
    i++;
  }

  let previousY = (y - minY) * global_scale;

  for (; i < width; i++) {
    variables.x = minX + i * dx;
    y = eval(tree);

    if (y === NaN) {
      console.log(`discontinuity at x = ${x}`);
      while ((y = eval(tree)) === NaN && i < width) {
        variables.x = minX + i * dx;
        i++;
      }

      previousY = (y - minY) * global_scale;
      continue;
    }

    y = (y - minY) * global_scale;
    //draw line
    ctx.beginPath();
    ctx.moveTo(i - 1, previousY);
    // ctx.moveTo(i, previousY); // i may have to remove
    ctx.lineTo(i, y);
    ctx.lineWidth = 2;
    ctx.stroke();
    previousY = y;
  }
}

function drawAxes() {
  // draw y axes
  if (
    minX >= -canvas.width / global_scale &&
    minX <= canvas.width / global_scale
  ) {
    ctx.beginPath();
    ctx.moveTo(-minX * global_scale, 0);
    ctx.lineTo(-minX * global_scale, canvas.height);
    ctx.lineWidth = 5;
    ctx.stroke();
  }

  // draw x axes
  if (
    minY >= -canvas.height / global_scale &&
    minY <= canvas.height / global_scale
  ) {
    ctx.beginPath();
    ctx.moveTo(0, -minY * global_scale);
    ctx.lineTo(canvas.height, -minY * global_scale);
    ctx.lineWidth = 5;
    ctx.stroke();
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function reDraw() {
  clearCanvas();

  drawAxes();

  Array.from(equations).forEach((eqn) => draw(eqn.tree));
}

function reset() {
  equations = [];
  clearCanvas();
}

updateRect();
drawAxes();
