var sharedb = require('sharedb/lib/client');

// Open WebSocket connection to ShareDB server
var socket = new WebSocket('ws://' + window.location.host);
var connection = new sharedb.Connection(socket);

//code tutorial: https://github.com/williammalone/Simple-HTML5-Drawing-App
//window.addEventListener('resize', resizeCanvas);
var canvas = document.getElementsByTagName('canvas')[0];
var context = canvas.getContext("2d");
var color = document.getElementById('color');
var lineWidth = document.getElementById('lineWidth');
canvas.width = 4999;
canvas.height = 4999;

var isMouseDown;
canvas.addEventListener('mousedown', function(event){
  isMouseDown = true;  
  var drawingPoint = {x: (event.pageX - event.target.offsetLeft), y: (event.pageY - event.target.offsetTop), isMouseDragging: false, color: color.value, lineWidth: parseInt(lineWidth.value)};
  addDrawingPoint(drawingPoint);

});
canvas.addEventListener('mousemove', function(e){
  if(isMouseDown){
    var drawingPoint = {x: (event.pageX - event.target.offsetLeft), y: (event.pageY - event.target.offsetTop), isMouseDragging: true, color: color.value, lineWidth: parseInt(lineWidth.value)};
    addDrawingPoint(drawingPoint);
  }
});
canvas.addEventListener('mouseup', function(e){ isMouseDown = false; });
canvas.addEventListener('mouseleave', function(e){ isMouseDown = false; });

function draw(drawingPoints){
  if (!drawingPoints){ return; }
  context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas			
  for(var i=0; i < drawingPoints.length; i++) {		      
    context.strokeStyle = drawingPoints[i].color;
    context.lineJoin = "round";
    context.lineWidth = drawingPoints[i].lineWidth;
    context.beginPath();
    if(drawingPoints[i].isMouseDragging && i){
      context.moveTo(drawingPoints[i-1].x, drawingPoints[i-1].y);
     }else{
       context.moveTo(drawingPoints[i].x-1, drawingPoints[i].y);
     }
     context.lineTo(drawingPoints[i].x, drawingPoints[i].y);
     context.closePath();
     context.stroke();
  }
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
  // See https://github.com/ottypes/json0 for list of valid operations.
  doc.submitOp([{p: [''], li:drawingPoint}]);
  //doc.submitOp([{p:[path,idx], li:obj}]);
}

// Expose to index.html
//global.addDrawingPoint = addDrawingPoint;