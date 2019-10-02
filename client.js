var sharedb = require('sharedb/lib/client');

// Open WebSocket connection to ShareDB server
var socket = new WebSocket('wss://' + window.location.host);
var connection = new sharedb.Connection(socket);

//window.addEventListener('resize', resizeCanvas);
var canvas = document.getElementsByTagName('canvas')[0];
var context = canvas.getContext("2d");
function resizeCanvas() {
  canvas.width = 9999;
  canvas.height = 9999;
}
resizeCanvas();

var clickX = [];
var clickY = [];
var clickDrag = [];
var paint;

canvas.addEventListener('mousedown', function(event){		
  paint = true;  
  addClick(event.pageX - event.target.offsetLeft, event.pageY - event.target.offsetTop);
  redraw();

});
canvas.addEventListener('mousemove', function(e){
  if(paint){
    addClick(e.pageX - e.target.offsetLeft, e.pageY - e.target.offsetTop, true);
    redraw();
  }
});
canvas.addEventListener('mouseup', function(e){ paint = false; });
canvas.addEventListener('mouseleave', function(e){ paint = false; });

function addClick(x, y, dragging)
{
  clickX.push(x);
  clickY.push(y);
  clickDrag.push(dragging);
}

function redraw(){
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas
  
  context.strokeStyle = "#df4b26";
  context.lineJoin = "round";
  context.lineWidth = 5;
			
  for(var i=0; i < clickX.length; i++) {		
    context.beginPath();
    if(clickDrag[i] && i){
      context.moveTo(clickX[i-1], clickY[i-1]);
     }else{
       context.moveTo(clickX[i]-1, clickY[i]);
     }
     context.lineTo(clickX[i], clickY[i]);
     context.closePath();
     context.stroke();
  }
}

// Create local Doc instance mapped to 'examples' collection document with id 'counter'
var doc = connection.get('examples', 'counter');

// Get initial value of document and subscribe to changes
doc.subscribe(showNumbers);
// When document changes (by this client or any other, or the server),
// update the number on the page
doc.on('op', showNumbers);

function showNumbers() {
  //document.querySelector('#num-clicks').textContent = doc.data.numClicks;
};

// When clicking on the '+1' button, change the number in the local
// document and sync the change to the server and other connected
// clients
function increment() {
  // Increment `doc.data.numClicks`. See
  // https://github.com/ottypes/json0 for list of valid operations.
  doc.submitOp([{p: ['numClicks'], na: 1}]);
}

// Expose to index.html
global.increment = increment;
