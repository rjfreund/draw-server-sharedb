var sharedb = require('sharedb/lib/client');

// Open WebSocket connection to ShareDB server
var socket = new WebSocket('ws://' + window.location.host);
var connection = new sharedb.Connection(socket);

  //document.body.style.cursor = 'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="7" width="7" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" stroke="red" fill="transparent" stroke-width="5"/></svg>\') 3.5 3.5, auto;';
  //document.body.style.cursor = 'url(./dist/circle.svg), auto';
  //document.body.style.cursor = String.raw`url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="7" width="7" viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" stroke="red" fill="transparent" stroke-width="5"/></svg>') 3.5 3.5, auto;`;


//code tutorial: https://github.com/williammalone/Simple-HTML5-Drawing-App
//window.addEventListener('resize', resizeCanvas);
var canvas = document.getElementsByTagName('canvas')[0];
var svg = document.getElementsByTagName('svg')[0];
var context = canvas.getContext("2d");
var color = document.getElementById('color');
var lineWidth = document.getElementById('lineWidth');
canvas.width = 4999;
canvas.height = 4999;

const ringDiv = document.createElement("div");
ringDiv.id = "pointer-ring";
document.body.insertBefore(ringDiv, document.body.children[0])

let mouseX = -100
let mouseY = -100
let ringX = -100
let ringY = -100
let ring = {
  pointerColor: "#750c7e",
  ringSize: parseInt(lineWidth.value)*0.5,  
}
let isHover = false
let mouseDown = false
const init_pointer = (options = {}) => {

    window.onmousemove = (mouse) => {
        mouseX = mouse.clientX
        mouseY = mouse.clientY
    }

    window.onmousedown = (mouse) => {
        mouseDown = true
    }

    window.onmouseup = (mouse) => {
        mouseDown = false
    }

    const trace = (a, b, n) => {
        return (1 - n) * a + n * b;
    }
    window["trace"] = trace

    const getOption = (option) => {
        
        if (options[option] == undefined) {
            return ring[option]
        } else {
            return options[option]
        }
    }

    const render = () => {
        ringX = trace(ringX, mouseX, 0.2)
        ringY = trace(ringY, mouseY, 0.2)

        if (document.querySelector(".p-action-click:hover")) {            
            isHover = true
        } else {            
            isHover = false
        }
        ringDiv.style.borderColor = getOption("pointerColor")
        if (mouseDown) {
            //ringDiv.style.padding = getOption("ringClickSize") + "px"
        } else {
            ringDiv.style.padding = getOption("ringSize") + "px"
        }
        
        ringDiv.style.transform = `translate(${ringX - (ring.ringSize*1.5)}px, ${ringY - (ring.ringSize*1.5)}px)`

        requestAnimationFrame(render)
    }
    requestAnimationFrame(render)
}

init_pointer();

lineWidth.addEventListener('change', function(event){
  console.log(event.target);
  ring.ringSize = event.target.value * 0.5;
})

var isMouseDown;
canvas.addEventListener('mousedown', function(event){
  isMouseDown = true;
  ringDiv.style.display = 'none';
  var drawingPoint = {x: (event.pageX - event.target.offsetLeft), y: (event.pageY - event.target.offsetTop), isMouseDragging: false, color: color.value, lineWidth: parseInt(lineWidth.value)};
  addDrawingPoint(drawingPoint);
});
canvas.addEventListener('mousemove', function(e){  
  if(isMouseDown){
    var drawingPoint = {x: (event.pageX - event.target.offsetLeft), y: (event.pageY - event.target.offsetTop), isMouseDragging: true, color: color.value, lineWidth: parseInt(lineWidth.value)};
    addDrawingPoint(drawingPoint);
  }
});
canvas.addEventListener('mouseup', function(e){ 
  isMouseDown = false; 
  ringDiv.style.display = 'block';
  var drawingPoint = {x: (event.pageX - event.target.offsetLeft), y: (event.pageY - event.target.offsetTop), isMouseDragging: false, color: color.value, lineWidth: parseInt(lineWidth.value)};
  addDrawingPoint(drawingPoint);
});
canvas.addEventListener('mouseleave', function(e){ 
  isMouseDown = false; 
  ringDiv.style.display = 'block';
});

function draw(drawingPoints){
  if (!drawingPoints){ return; }
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas			
  drawingPoints.reverse().map(function(drawingPoint, i){
    context.strokeStyle = drawingPoints[i].color;
    context.lineJoin = "round";
    context.lineCap='round';
    context.lineWidth = drawingPoints[i].lineWidth;
    context.beginPath();
    if (i>1 && drawingPoints[i-1].isMouseDragging && drawingPoints[i].isMouseDragging){
      context.moveTo(drawingPoints[i-1].x, drawingPoints[i-1].y);
    }else{
      context.moveTo(drawingPoints[i].x-1, drawingPoints[i].y);
    }
    context.lineTo(drawingPoints[i].x, drawingPoints[i].y);
    //context.closePath();
    context.stroke();
  });  
}

// Create local Doc instance mapped to 'examples' collection document with id 'counter'
var doc = connection.get('someCollectionName', 'drawings');

// Get initial value of document and subscribe to changes
doc.subscribe(displayDrawingPoints);
// When document changes (by this client or any other, or the server),
// update the page
doc.on('op', displayDrawingPoints);

function displayDrawingPoints() {
  draw(doc.data);  
};

function addDrawingPoint(drawingPoint) {  
  console.log(drawingPoint);
  // See https://github.com/ottypes/json0 for list of valid operations.
  doc.submitOp([{p: [''], li:drawingPoint}]);
  //doc.submitOp([{p:[path,idx], li:obj}]);
}

function throttle(func, limit){
  let lastFunc
  let lastRan
  return function() {
    const context = this
    const args = arguments
    if (!lastRan) {
      func.apply(context, args)
      lastRan = Date.now()
    } else {
      clearTimeout(lastFunc)
      lastFunc = setTimeout(function() {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args)
          lastRan = Date.now()
        }
      }, limit - (Date.now() - lastRan))
    }
  }
}