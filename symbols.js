
// Disclaimer, I hate js, don't expect to find good code here
// Also, that a good excuse to do ugly code, yoohoo!

// I don't understand what I am doiiiiiiing!
SNS="http://www.w3.org/2000/svg";

// Settings
var Settings = {
    MinNbOfPoints: 1,
    MaxNbOfPoints: 3,
    BoxH: 20,
    BoxW: 20,
    GridH: 4,
    GridW: 4,
};

// Grid ----------------------
var Grid = {

    Grid: function(h, w) {
        this.h = h;
        this.w = w;
        this.grid = new Array(h);
        for (var i=0; i<h; ++i) {
            this.grid[i] = new Array(w);
            for (var j=0; j<w; ++j) {
                this.grid[i][j] = false;
            }
        }
    },

    intRand: function(max) {
        return Math.floor(Math.random()*max);
    },

    GridPoint: function(i, j) {
        this.i = i;
        this.j = j;
    },

};

// I am sick
Grid.GridPoint.prototype.toPoint = function() {
    return new Svg.Point((2*this.j+1) * (Settings.BoxW/2),
                     (2*this.i+1) * (Settings.BoxH/2));
}

Grid.GridPoint.prototype.toString = function() {
    return this.i + " " + this.j;
}

Grid.Grid.prototype.getNewRandomPoint = function(noRewrite) {
    if (noRewrite) { this.preconditionGridIsNotFull(); }
    while (true) {
        var i = Grid.intRand(this.h);
        var j = Grid.intRand(this.w);
        if (noRewrite) {
            if (!this.grid[i][j]) {
                this.grid[i][j] = true;
                return new Grid.GridPoint(i,j);
            } else {
                continue;
            }
        } else {
            return new Grid.GridPoint(i,j);
        }
    }
}

Grid.Grid.prototype.preconditionGridIsNotFull = function() {
    for (var i=0; i<this.h; ++i) {
        for (var j=0; j<this.w; ++j) {
            if (!this.grid[i][j]) { return; }
        }
    }
    throw "Grid is full, cannot go on";
}


// Svg ----------------------
var Svg = {
    Point: function(x, y) {
        this.x = x;
        this.y = y;
    },

    QuadraticPoint: function(a, b, type) {
        this.a = a;
        this.b = b;
        this.type = type || "q";
    },
}

// And now I'm gonna puke
Svg.Point.prototype.toString = function() {
    return this.x+","+this.y;
}

Svg.QuadraticPoint.prototype.toString = function() {
    return this.type+this.a+" "+this.b;
}


// Symbol ----------------------
var Symbol = {
    Symbol: function() {
        this.grid = new Grid.Grid(Settings.GridH, Settings.GridW);
        this.points = [];
        var nbOfPoints = Symbol.getRandomNbPoint();
        for (var i=0; i<nbOfPoints; ++i) {
            var point = this.getNewPoint();
            this.points.push(point);
        }
    },

    getRandomNbPoint: function() {
        return Math.random()*(Settings.MaxNbOfPoints - Settings.MinNbOfPoints) + Settings.MinNbOfPoints;
    },
}

Symbol.Symbol.prototype.getNewPoint = function() {
    return new Svg.QuadraticPoint(this.getNewCurvePoint(), this.getNewEdgePoint(), "Q");
}

Symbol.Symbol.prototype.getNewEdgePoint = function() {
    return this.grid.getNewRandomPoint(true).toPoint();
}

Symbol.Symbol.prototype.getNewCurvePoint = function() {
    return this.grid.getNewRandomPoint(true).toPoint();
}

Symbol.Symbol.prototype.toPath = function(x, y) {
    if (this.points.length == 0) { throw "No points"; }
    return "M"+new Svg.Point(x,y)+" "+this.points.join(" ");
}

function test() {
    var board = document.getElementById("board");
    var new_path = document.createElementNS(SNS, "path");
    new_path.setAttributeNS(null, "d", new Symbol.Symbol().toPath(0,0));
    board.appendChild(new_path);
    console.log(new_path.getBoundingClientRect().width);

}
