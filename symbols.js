
// Disclaimer, I hate js, don't expect to find good code here
// Also, that a good excuse to do ugly code, yoohoo!

// I don't understand what I am doiiiiiiing!
SNS="http://www.w3.org/2000/svg";

// Settings
var Settings = {
    MinNbOfPoints: 1,
    MaxNbOfPoints: 3,
    BoxH: 8,
    BoxW: 8,
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
    return "GridPoint:" + this.i + "," + this.j;
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

Svg.Point.prototype.toDraw = function(ox, oy) {
    return (this.x+ox)+","+(this.y+oy);
}

Svg.QuadraticPoint.prototype.toString = function() {
    return this.type+this.a+" "+this.b;
}

Svg.QuadraticPoint.prototype.toDraw = function(ox, oy) {
    return this.type+this.a.toDraw(ox,oy)+" "+this.b.toDraw(ox,oy);
}

// Symbol ----------------------
var Symbol = {
    Symbol: function() {
        this.grid = new Grid.Grid(Settings.GridH, Settings.GridW);
        this.points = [this.getNewEdgePoint()];
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

Symbol.Symbol.prototype.toDraw = function(ox, oy) {
    if (this.points.length == 0) { throw "No points"; }
    var drawStr = "M";
    for (var i = 0; i<this.points.length; ++i) {
        var point = this.points[i];
        drawStr += point.toDraw(ox,oy)+" ";
    }
    return drawStr;
}

// Alphabet ----------------------
var Alphabet = {
    Alphabet: function() {
        this.mapping = {};
        for (var i=0; i<base.length; ++i) {
            var c = base.charAt(i);
            this.mapping[c] = new Symbol.Symbol();
        }
    }
}

Alphabet.Alphabet.prototype.toDraw = function(text) {
    for (var c in text) {

    }
}

var UI = {
    drawSymbol: function(symb, x, y) {
        var board = document.getElementById("board");
        var new_path = document.createElementNS(SNS, "path");
        new_path.setAttributeNS(null, "d", symb.toDraw(x, y));
        board.appendChild(new_path);
        //console.log(new_path.getBoundingClientRect().width);
    },

    drawAlphabet: function(alpha, text) {
        var x = 0;
        var y = 0;
        var width = document.getElementById("board").getAttribute("width");
        if (!text) { text = base; }
        for (var i=0; i<text.length; ++i) {
            var c = text.charAt(i).toLowerCase();
            UI.drawSymbol(alpha.mapping[c], x, y);
            x += Settings.BoxW * (Settings.GridW - 1);
            if (x > width) {
                x = 0;
                y += Settings.BoxH * Settings.GridH;
            }
        }
    },

    clearPaths: function() {
        var node = document.getElementById("board");
        while (node.firstChild) {
            node.removeChild(node.firstChild);
        }
    }
}

base = "abcdefghijklmnopqrstuvwxyz ";
alpha = new Alphabet.Alphabet();
function setup() {
    inputChanged();
    document.getElementById("input").addEventListener("input", function(evt) {
        input = document.getElementById("input").value;
        inputChanged(input);
    }, false);
}

function inputChanged(input) {
    UI.clearPaths();
    UI.drawAlphabet(alpha, input);
}