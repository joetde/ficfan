
// Disclaimer, I hate js, don't expect to find good code here
// Also, that a good excuse to do ugly code, yoohoo!

// I don't understand what I am doiiiiiiing!
SNS="http://www.w3.org/2000/svg";

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.toString = function() {
    return this.x+","+this.y;
}

function QuadraticPoint(ax, ay, bx, by, type) {
    this.a = new Point(ax, ay);
    this.b = new Point(bx, by);
    this.type = type || "q";
}

QuadraticPoint.prototype.toString = function() {
    return this.type+" "+this.a+" "+this.b;
}

function Symbol(points) {
    this.points = [];
    for (var i = 0; i<points.length; ++i) {
        quad = points[i];
        if (quad.length != 4) { throw "Symbol contructor receive only arrays of 4-element arrays"; }
        this.points.push(new QuadraticPoint(quad[0], quad[1], quad[2], quad[3]));
    }
}

Symbol.prototype.toPath = function(x, y) {
    if (this.points.length == 0) { throw "No points"; }
    return "M "+new Point(x,y)+" "+this.points.join(" ");
}

function createNewSymbol() {
    var arr = [];
    for (var i in [0,0,0]) {
        var quad = [];
        for (var j in [0,0,0,0]) {
            quad.push(Math.random()*100 - 50);
        }
        arr.push(quad);
    }
    return new Symbol(arr);
}

function test() {
    var board = document.getElementById("board");
    var new_path = document.createElementNS(SNS, "path");
    new_path.setAttributeNS(null, "d", createNewSymbol().toPath(110,100));
    board.appendChild(new_path);
}
