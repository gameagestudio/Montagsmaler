var context = null;
var sock = null;
var pathPoints = [];
var isPainting = false;
var myTurn = null;

$(document).ready(function() {
    convertTouchToMouse("canvas");
	context = document.getElementById("canvas").getContext("2d");
    
    
    //
    // Socket fun
    //
    
    $("#status").html("Connecting...");
    sock = io.connect();
    sock.on("connect", function(data) {
        $("#status").html("Waiting for other player..");
    });

    sock.on("turn", function(data) {
        pathPoints = [];
        redraw();
        myTurn = data.turn;
        if(data.turn === "draw") {
            $("#status").html("You need to draw \"" + data.word + "\"");
        } else if(data.turn === "guess") {
            $("#status").html("You need to guess");
        }
    });
    
    sock.on("draw", function(point) {
        pathPoints.push(point);
        redraw();
    });
    
    sock.on("guess", function(guess) {
        console.log("guess: " + guess.word);
    });
    
    
    //
    // Mouse events
    //
    
    $("#canvas").mousedown(function(e) {
        if(myTurn !== "draw") return;
        isPainting = true;
        addPathPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
        redraw();
    });
    
    $("#canvas").mousemove(function(e) {
        if(myTurn !== "draw") return;
        if(isPainting) {
            addPathPoint(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, false);
            redraw();
        }
    });
    
    $("#canvas").mouseup(function() { isPainting = false; });
        
    
    //
    // Keyboard event
    //
    
    $("#guessform").submit(function() {
        if(myTurn !== "guess") return;
        sock.emit("guess", { word: $("#guess").val()});
    });
    
    
    //
    // Drawing related
    //
    
    function addPathPoint(x,y, restart) {
        var point = {
            "x": x, 
            "y": y,
            "restart": restart
        };
        
        sock.emit("draw", point);
        
        pathPoints.push(point);
    }
    
    function redraw() {
        context.clearRect(0, 0, 500, 500);
        context.strokeStyle = "#000";
        context.lineJoin    = "round";
        context.lineWidth   = 2;
        
        for(var i=0;i<pathPoints.length-1;i++) {
            context.beginPath();
            context.moveTo(pathPoints[i].x, pathPoints[i].y);
            if(!pathPoints[i+1].restart)
                context.lineTo(pathPoints[i+1].x, pathPoints[i+1].y);
            context.closePath();
            context.stroke();
        }
    }
});
