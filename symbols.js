
// Disclaimer, I hate js, don't expect to find good code here
// Also, that a good excuse to do ugly code, yoohoo!

// Todo other algo to generate ponctuation
// Space should be a special character
// Support of utf8

// Globals
var symb_base = "abcdefghijklmnopqrstuvwxyz0123456789 -+=/*'\"?!.,;:";
var speak_base = "abcdefghijklmnopqrstuvwxyz";
var speak_consonants = "bcdfghjklmnpqrstvwxz";
var speak_voyels = "aeiouy";

// I don't understand what I am doiiiiiiing!
var SNS="http://www.w3.org/2000/svg";

// Settings
var Settings = {
    MinNbOfPoints: 1,
    MaxNbOfPoints: 3,
    BoxH: 12,
    BoxW: 12,
    GridH: 3,
    GridW: 3,
    ErrorPrecision: 6,
};

// Helper ----------------------
var Helper = {

    intRand: function(max) {
        return Math.floor(Math.random()*max);
    },

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

    GridPoint: function(i, j) {
        this.i = i;
        this.j = j;
    },

};

// I am sick
Grid.GridPoint.prototype.toPoint = function() {
    return new Svg.Point((2*this.j+1) * (Settings.BoxW/2),
                     (2*this.i+1) * (Settings.BoxH/2));
};

Grid.GridPoint.prototype.toString = function() {
    return "GridPoint:" + this.i + "," + this.j;
};

Grid.Grid.prototype.getNewRandomPoint = function(noRewrite) {
    if (noRewrite) { this.preconditionGridIsNotFull(); }
    while (true) {
        var i = Helper.intRand(this.h);
        var j = Helper.intRand(this.w);
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
};

Grid.Grid.prototype.preconditionGridIsNotFull = function() {
    for (var i=0; i<this.h; ++i) {
        for (var j=0; j<this.w; ++j) {
            if (!this.grid[i][j]) { return; }
        }
    }
    throw "Grid is full, cannot go on";
};

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
};

// And now I'm gonna puke
Svg.Point.prototype.toString = function() {
    return this.x+","+this.y;
};

Svg.Point.prototype.toDraw = function(ox, oy) {
    return (this.x+ox)+","+(this.y+oy);
};

Svg.QuadraticPoint.prototype.toString = function() {
    return this.type+this.a+" "+this.b;
};

Svg.QuadraticPoint.prototype.toDraw = function(ox, oy) {
    return this.type+this.a.toDraw(ox,oy)+" "+this.b.toDraw(ox+Helper.intRand(Settings.ErrorPrecision),oy+Helper.intRand(Settings.ErrorPrecision));
};

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
};

Symbol.Symbol.prototype.getNewPoint = function() {
    return new Svg.QuadraticPoint(this.getNewCurvePoint(), this.getNewEdgePoint(), "Q");
};

Symbol.Symbol.prototype.getNewEdgePoint = function() {
    return this.grid.getNewRandomPoint(true).toPoint();
};

Symbol.Symbol.prototype.getNewCurvePoint = function() {
    return this.grid.getNewRandomPoint(false).toPoint();
};

Symbol.Symbol.prototype.toDraw = function(ox, oy) {
    if (this.points.length === 0) { throw "No points"; }
    var drawStr = "M";
    for (var i = 0; i<this.points.length; ++i) {
        var point = this.points[i];
        drawStr += point.toDraw(ox,oy)+" ";
    }
    return drawStr;
};

// Alphabet ----------------------
var Alphabet = {
    Alphabet: function() {
        this.symb_mapping = {};
        this.speak_mapping = {};
        for (var i=0; i<symb_base.length; ++i) {
            var c = symb_base.charAt(i);
            this.symb_mapping[c] = new Symbol.Symbol();
        }
        for (var i=0; i<speak_base.length; ++i) {
            var c = speak_base.charAt(i);
            var new_char = speak_base.charAt(Helper.intRand(speak_base.length));
            if (speak_consonants.indexOf(new_char) !== -1) { new_char += speak_voyels.charAt(Helper.intRand(speak_voyels.length)); }
            this.speak_mapping[c] = new_char;
        }
    }
};

var alpha = new Alphabet.Alphabet();

// UI ----------------------
var UI = {
    drawSymbol: function(symb, x, y) {
        var board = document.getElementById("board");
        var new_path = document.createElementNS(SNS, "path");
        new_path.setAttributeNS(null, "d", symb.toDraw(x, y));
        board.appendChild(new_path);
        return new_path.getBoundingClientRect();
    },

    drawAlphabet: function(alpha, text) {
        var x = 0;
        var y = 0;
        var width = document.getElementById("board").getAttribute("width");
        if (!text) { text = symb_base; }
        for (var i=0; i<text.length; ++i) {
            var c = text.charAt(i).toLowerCase();
            if (c === '\n') {
                x = 0;
                y += Settings.BoxH * Settings.GridH;
                continue;
            }
            var symbolBoundingBox = UI.drawSymbol(alpha.symb_mapping[c], x, y);
            x += symbolBoundingBox.width + Settings.BoxW / 4;
            if (x + Settings.BoxW * Settings.GridW > width) {
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
};

function inputChanged(input) {
    UI.clearPaths();
    UI.drawAlphabet(alpha, input);
}

function read() {
    var input = document.getElementById("input").value;
    var speak_string = "";
    for (var i=0; i<input.length; ++i) {
        var c = input.charAt(i);
        if (c.toLowerCase() in alpha.speak_mapping) {
            c = alpha.speak_mapping[c.toLowerCase()];
        }
        speak_string += c;
    }
    console.log(speak_string);
    var msg = new SpeechSynthesisUtterance(speak_string);
    window.speechSynthesis.speak(msg);
}

function setup() {
    inputChanged();
    document.getElementById("input").addEventListener("input", function(evt) {
        var input = document.getElementById("input").value;
        inputChanged(input);
    }, false);
}
