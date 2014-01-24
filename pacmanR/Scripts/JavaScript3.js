function psengine() {

    //stores points
    //stores triangle index?

    this.cosx = 0;
    this.cosy = 0;
    this.cosz = 0;
    this.sinx = 0;
    this.siny = 0;
    this.sinz = 0;

}

psengine.prototype.precompute = function () {

    this.cosx = Math.cos(CameraRot.x);
    this.cosy = Math.cos(CameraRot.y);
    this.cosz = Math.cos(CameraRot.z);
    this.sinx = Math.sin(CameraRot.x);
    this.siny = Math.sin(CameraRot.y);
    this.sinz = Math.sin(CameraRot.z);

}

psengine.prototype.cameratransform = function (somepoint) {



    var WorkingVertex = { x: somepoint.x, y: somepoint.y, z: somepoint.z }




    var xdif = somepoint.x - CameraPos.x;
    var ydif = somepoint.y - CameraPos.y;
    var zdif = somepoint.z - CameraPos.z;


    //transform the 3d points to the camera perspective
    WorkingVertex.x = this.cosy * (this.sinz * ydif + this.cosz * xdif) - this.siny * zdif;
    WorkingVertex.y = this.sinx * (this.cosy * zdif + this.siny * (this.sinz * ydif + this.cosz * xdif)) + this.cosx * (this.cosz * ydif - this.sinz * xdif);
    WorkingVertex.z = this.cosx * (this.cosy * zdif + this.siny * (this.sinz * ydif + this.cosz * xdif)) - this.sinx * (this.cosz * ydif - this.sinz * xdif);






    WorkingVertex.y = -WorkingVertex.y;

    //clip to a near view plane


    return WorkingVertex;


};

var mouseX = 0;
var mouseY = 0;
var mycamera = new psengine();
var ghostModel = new Image();
ghostModel.src = 'img/pacman.PNG';

function KeyboardState() {

    var self = this;

    this.KEYSTATE = new Array(110);

    for (var i = 0; i < 100; i++) {

        this.KEYSTATE[i] = 0;

    }

    self.upkey = false;
    self.downkey = false;
    self.leftkey = false;
    self.rightkey = false;
    self.changed = false;

    self.akey = false;
    self.skey = false;
    self.dkey = false;
    self.wkey = false;

    self.ikey = false;
    self.kkey = false;
    self.jkey = false;
    self.lkey = false;



}

KeyboardState.prototype.setkeydown = function (keynum) {



    if ((keynum < 30) || (keynum > 99)) {

    }
    else {


        if (this.KEYSTATE[keynum] == 0) {
            this.KEYSTATE[keynum] = 1;

        }

    }


};

KeyboardState.prototype.setkeyup = function (keynum) {

    if ((keynum < 30) || (keynum > 99)) {

    }
    else {


        this.KEYSTATE[keynum] = 0;


    }


};

KeyboardState.prototype.isKeyDown = function (keynum) {

    if (this.KEYSTATE[keynum] > 0) {

        return true;

    }

    return false;



}




function levelData() {
    var self = this;
    this.wallheight = 3;
    this.wallData = new Array();
    this.wallVertex = new Array();
    this.wallFaces = new Array();
    this.wallNormal = new Array();

    this.testghost = null;

    this.blocksize = .5;
}

function sortFunction(a, b) {

    return (a.angletocamera.distance - b.angletocamera.distance);

};

levelData.prototype.addFloor = function (x, z) {

    var nextindex = this.wallVertex.length;

    var width = 2;

    this.wallVertex.push({ x: x - width, y: 0, z: z + width });
    this.wallVertex.push({ x: x + width, y: 0, z: z + width });
    this.wallVertex.push({ x: x - width, y: 0, z: z - width });
    this.wallVertex.push({ x: x + width, y: 0, z: z - width });



    this.wallFaces.push({ a: nextindex, b: nextindex + 2, c: nextindex + 3, color: { r: 72, g: 72, b: 72 } });
    this.wallFaces.push({ a: nextindex + 3, b: nextindex + 1, c: nextindex, color: { r: 72, g: 72, b: 72 } });


};

levelData.prototype.addSegment = function (x1, z1, x2, z2) {
    var y1 = 0;
    var y2 = 3;

    for (var i = 0; i < 3; i++) {

        y1 = i;
        y2 = i + 1;

        var nextindex = this.wallVertex.length;

        this.wallVertex.push({ x: x1, y: y1, z: z1 });
        this.wallVertex.push({ x: x2, y: y1, z: z2 });
        this.wallVertex.push({ x: x2, y: y2, z: z2 });
        this.wallVertex.push({ x: x1, y: y2, z: z1 });



        this.wallFaces.push({ a: nextindex + 2, b: nextindex + 1, c: nextindex, color: { r: 0, g: 140, b: 0 } });
        this.wallFaces.push({ a: nextindex, b: nextindex + 3, c: nextindex + 2, color: { r: 0, g: 140, b: 0 } });

    }

};

levelData.prototype.addWall = function (center, rotation) {

    var nextindex = this.wallVertex.length;





};

levelData.prototype.addBlock = function (x1, y1, z1) {

    var nextindex = this.wallVertex.length;

    this.wallVertex.push({ x: x1 - this.blocksize, y: y1 - this.blocksize, z: z1 + this.blocksize });
    this.wallVertex.push({ x: x1 - this.blocksize, y: y1 + this.blocksize, z: z1 + this.blocksize });
    this.wallVertex.push({ x: x1 + this.blocksize, y: y1 + this.blocksize, z: z1 + this.blocksize });
    this.wallVertex.push({ x: x1 + this.blocksize, y: y1 - this.blocksize, z: z1 + this.blocksize });
    this.wallVertex.push({ x: x1 - this.blocksize, y: y1 - this.blocksize, z: z1 - this.blocksize });
    this.wallVertex.push({ x: x1 - this.blocksize, y: y1 + this.blocksize, z: z1 - this.blocksize });
    this.wallVertex.push({ x: x1 + this.blocksize, y: y1 + this.blocksize, z: z1 - this.blocksize });
    this.wallVertex.push({ x: x1 + this.blocksize, y: y1 - this.blocksize, z: z1 - this.blocksize });

    var blockcolor = { r: 136, g: 0, b: 0 };

    this.wallFaces.push({ a: nextindex, b: nextindex + 1, c: nextindex + 2, color: blockcolor });
    this.wallFaces.push({ a: nextindex + 2, b: nextindex + 3, c: nextindex + 0, color: blockcolor });

    this.wallFaces.push({ a: nextindex + 1, b: nextindex + 5, c: nextindex + 6, color: blockcolor });
    this.wallFaces.push({ a: nextindex + 6, b: nextindex + 2, c: nextindex + 1, color: blockcolor });

    this.wallFaces.push({ a: nextindex + 5, b: nextindex + 4, c: nextindex + 7, color: blockcolor });
    this.wallFaces.push({ a: nextindex + 7, b: nextindex + 6, c: nextindex + 5, color: blockcolor });

    this.wallFaces.push({ a: nextindex + 4, b: nextindex + 0, c: nextindex + 3, color: blockcolor });
    this.wallFaces.push({ a: nextindex + 3, b: nextindex + 7, c: nextindex + 4, color: blockcolor });

    this.wallFaces.push({ a: nextindex + 3, b: nextindex + 2, c: nextindex + 6, color: blockcolor });
    this.wallFaces.push({ a: nextindex + 6, b: nextindex + 7, c: nextindex + 3, color: blockcolor });

    this.wallFaces.push({ a: nextindex + 0, b: nextindex + 5, c: nextindex + 1, color: blockcolor });
    this.wallFaces.push({ a: nextindex + 0, b: nextindex + 4, c: nextindex + 5, color: blockcolor });




};

levelData.prototype.createMesh = function () {

    var nextindex;

    for (var i = 0; i < this.wallData.length; i++) {

        nextindex = this.wallVertex.length;

        this.wallVertex.push({ x: this.wallData[i].x1, y: -this.wallheight, z: this.wallData[i].z1 });
        this.wallVertex.push({ x: this.wallData[i].x2, y: -this.wallheight, z: this.wallData[i].z2 });
        this.wallVertex.push({ x: this.wallData[i].x2, y: 0, z: this.wallData[i].z2 });
        this.wallVertex.push({ x: this.wallData[i].x1, y: 0, z: this.wallData[i].z1 });

        //this.wallFaces.push({a:nextindex, b:nextindex+1, c:nextindex+2});
        //this.wallFaces.push({a:nextindex+2, b:nextindex+3, c:nextindex});

        this.wallFaces.push({ a: nextindex + 2, b: nextindex + 1, c: nextindex });
        this.wallFaces.push({ a: nextindex, b: nextindex + 3, c: nextindex + 2 });

    }



};




levelData.prototype.draw = function () {

    //outputdiv.innerHTML = '  ';



    var angletocamera = 0;

    var CenterX = CanvasWidth / 2;
    var CenterY = CanvasHeight / 2;

    var PointList = new Array();
    var VertexList = new Array();
    var NormalList = new Array();

    // For each vertex point

    var cosx = Math.cos(CameraRot.x);
    var cosy = Math.cos(CameraRot.y);
    var cosz = Math.cos(CameraRot.z);
    var sinx = Math.sin(CameraRot.x);
    var siny = Math.sin(CameraRot.y);
    var sinz = Math.sin(CameraRot.z);




    for (var i = 0; i < this.wallVertex.length; i++) {
        // The resulting vertex point we are working on
        // Note that we are creating a new object, not making a copy-reference
        var WorkingVertex = { x: this.wallVertex[i].x, y: this.wallVertex[i].y, z: this.wallVertex[i].z }




        var xdif = this.wallVertex[i].x - CameraPos.x;
        var ydif = this.wallVertex[i].y - CameraPos.y;
        var zdif = this.wallVertex[i].z - CameraPos.z;


        //transform the 3d points to the camera perspective
        WorkingVertex.x = cosy * (sinz * ydif + cosz * xdif) - siny * zdif;
        WorkingVertex.y = sinx * (cosy * zdif + siny * (sinz * ydif + cosz * xdif)) + cosx * (cosz * ydif - sinz * xdif);
        WorkingVertex.z = cosx * (cosy * zdif + siny * (sinz * ydif + cosz * xdif)) - sinx * (cosz * ydif - sinz * xdif);






        WorkingVertex.y = -WorkingVertex.y;

        //clip to a near view plane


        VertexList[i] = WorkingVertex;



        if (WorkingVertex.z < .1) {

            //outputdiv.innerHTML += ' z: ' + WorkingVertex.z;
            WorkingVertex.z = .1;

            var ScreenX = (RatioConst * (WorkingVertex.x)) / (WorkingVertex.z);
            var ScreenY = (RatioConst * (WorkingVertex.y)) / (WorkingVertex.z);


            PointList[i] = { x: CenterX + ScreenX, y: CenterY + ScreenY };

        }
        else {

            var ScreenX = (RatioConst * (WorkingVertex.x)) / (WorkingVertex.z);
            var ScreenY = (RatioConst * (WorkingVertex.y)) / (WorkingVertex.z);


            PointList[i] = { x: CenterX + ScreenX, y: CenterY + ScreenY };


        }






    }

    var orderedFaces = new Array();

    //TODO : rewrite array as just index dictionary and distance

    for (var i = 0; i < this.wallFaces.length; i++) {
        angletocamera = isFrontFace(this.wallVertex[this.wallFaces[i].a], this.wallVertex[this.wallFaces[i].b], this.wallVertex[this.wallFaces[i].c], 0);
        orderedFaces[i] = {
            a: this.wallFaces[i].a, b: this.wallFaces[i].b, c: this.wallFaces[i].c, d: angletocamera, color: { r: this.wallFaces[i].color.r, b: this.wallFaces[i].color.b, g: this.wallFaces[i].color.g, type: 0 }
        };



    }

    mycamera.precompute();

    //a ghost, image, distance, position
    this.testghost = mycamera.cameratransform({ x: -2, y: 1, z: 6 });
    this.testghost.type = 1;
    this.testghost.d = angletocamera;
    this.testghost.d.distance = vectorLength(this.testghost.x, this.testghost.y, this.testghost.z);

    orderedFaces.push(this.testghost);


    orderedFaces.sort(function (a, b) {
        return (b.d.distance - a.d.distance);
    });



    for (var i = 0; i < orderedFaces.length; i++) {


        if (orderedFaces[i].type > 0) {

            if (orderedFaces[i].z <= 0.5) {

            }
            else {

                var ScreenXx = (RatioConst * (orderedFaces[i].x)) / (orderedFaces[i].z);
                var ScreenYy = (RatioConst * (orderedFaces[i].y)) / (orderedFaces[i].z);


                DrawSprite(CenterX + ScreenXx, CenterY + ScreenYy, ghostModel, (ghostModel.width * 2) / orderedFaces[i].z, (ghostModel.height * 2) / orderedFaces[i].z);

            }
        }
        else {




            //for (var i = 0; i < 24; i++) {


            //angletocamera = isFrontFace(this.wallVertex[this.wallFaces[i].a], this.wallVertex[this.wallFaces[i].b], this.wallVertex[this.wallFaces[i].c], 0);

            if ((VertexList[orderedFaces[i].a].z >= .2) || (VertexList[orderedFaces[i].b].z >= .2) || (VertexList[orderedFaces[i].c].z >= .2)) {
                if (orderedFaces[i].d.angle >= 1.57) {  //return this AFTER
                    //if (1 > 0) {


                    // Find the four points we are working on
                    var PointA = PointList[orderedFaces[i].a];
                    var PointB = PointList[orderedFaces[i].b];
                    var PointC = PointList[orderedFaces[i].c];



                    //compute color
                    //var tricolor = {r:136,g:0,b:0};
                    var tricolor = orderedFaces[i].color;

                    /*
                    tricolor.r = (((orderedFaces[i].d.angle - 1.57) / 1.57) * tricolor.r) + ((tricolor.r * 2) / orderedFaces[i].d.distance);
                    tricolor.g = (((orderedFaces[i].d.angle - 1.57) / 1.57) * tricolor.g) + ((tricolor.g * 2) / orderedFaces[i].d.distance);
                    tricolor.b = (((orderedFaces[i].d.angle - 1.57) / 1.57) * tricolor.b) + ((tricolor.b * 2) / orderedFaces[i].d.distance);
                    */
                    tricolor.r = ((orderedFaces[i].d.angle - 1.57) / 1.57) * ((tricolor.r * 8) / (orderedFaces[i].d.distance));
                    tricolor.g = ((orderedFaces[i].d.angle - 1.57) / 1.57) * ((tricolor.g * 16) / (orderedFaces[i].d.distance * orderedFaces[i].d.distance)) + .3 * tricolor.g;
                    tricolor.b = ((orderedFaces[i].d.angle - 1.57) / 1.57) * ((tricolor.b * 16) / (orderedFaces[i].d.distance * orderedFaces[i].d.distance)) + .3 * tricolor.b;



                    // Render the face by looking up our vertex list
                    DrawTri(PointA.x, PointA.y, PointB.x, PointB.y, PointC.x, PointC.y, tricolor);




                }
            }

        }


    }

}


psengine.prototype.render = function () {


};

var context = null;
var switchy = 1;
var outputdiv = document.getElementById('debugtext');




var CubeVertex =
[
    { x: -1, y: -1, z: 1 },
    { x: -1, y: 1, z: 1 },
    { x: 1, y: 1, z: 1 },
    { x: 1, y: -1, z: 1 },
    { x: -1, y: -1, z: -1 },
    { x: -1, y: 1, z: -1 },
    { x: 1, y: 1, z: -1 },
    { x: 1, y: -1, z: -1 },
    /*
    { x: -5, y: -1, z: 1 },
    { x: -5, y: 1, z: 1 },
    { x: -3, y: 1, z: 1 },
    { x: -3, y: -1, z: 1 },
    { x: -5, y: -1, z: -1 },
    { x: -5, y: 1, z: -1 },
    { x: -3, y: 1, z: -1 },
    { x: -3, y: -1, z: -1 },
    */
];




var CubeFaces =
[
    { a: 0, b: 1, c: 2, i: 1 },
    { a: 2, b: 3, c: 0, i: 1 },

    { a: 1, b: 5, c: 6, i: 2 },
    { a: 6, b: 2, c: 1, i: 2 },

    { a: 5, b: 4, c: 7, i: 3 },
    { a: 7, b: 6, c: 5, i: 3 },

    { a: 4, b: 0, c: 3, i: 4 },
    { a: 3, b: 7, c: 4, i: 4 },

    { a: 3, b: 2, c: 6, i: 5 },
    { a: 6, b: 7, c: 3, i: 5 },

    { a: 0, b: 5, c: 1, i: 6 },
    { a: 0, b: 4, c: 5, i: 6 },
];

/*

{ a: 8, b: 9, c: 10, i: 9 },
{ a: 10, b: 11, c: 8, i: 9 },

// Top
{ a: 9, b: 13, c: 14, i: 2 },
{ a: 14, b: 10, c: 9, i: 2 },

// Back
{ a: 13, b: 12, c: 15, i: 3 },
{ a: 15, b: 14, c: 13, i: 3 },

// Bottom
{ a: 12, b: 8, c: 11, i: 4 },
{ a: 11, b: 15, c: 12, i: 4 },

// Right
{ a: 11, b: 10, c: 14, i: 5 },
{ a: 14, b: 15, c: 11, i: 5 },

// Left
{ a: 8, b: 13, c: 9, i: 6 },
{ a: 8, b: 12, c: 13, i: 6 },

];
*/

var newLevel = new levelData();
var keyboard = new KeyboardState();


var CameraPos = { x: 0, y: 1.5, z: -10 };

// Camera rotation (Pitch, yaw, roll)
var CameraRot = { x: 0, y: 0, z: 0 };


// Camera distortion
var RatioConst = 360;

var CanvasHeight = 0;
var CanvasWidth = 0;

function MapEditor() {

    var outputdiv = document.getElementById('debugtext');
    context = document.getElementById('myCanvas').getContext('2d');

    var leveldata = [];

    for (var i = 0; i < 50; i++) {

        leveldata[i] = [];

        for (var j = 0; j < 50; j++) {

            leveldata[i][j] = 0;

        }

    }


    CanvasWidth = context.canvas.clientWidth;
    CanvasHeight = context.canvas.clientHeight;


    var switchy = 0;

    var pointArray = new Array();

    var temppoint = null;



    $("#myCanvas").mousemove(function (e) {

        mouseX = Math.floor(((e.pageX - this.offsetLeft) - (CanvasWidth / 2)) / 10);
        mouseY = Math.floor(((e.pageY - this.offsetTop) - (CanvasHeight / 2)) / 10);


    });

    $("#myCanvas").mousedown(function () {

        if (switchy == 0) {

            temppoint = { x: mouseX, y: mouseY };


            switchy = 1;
        }
        else {

            var unitlength = { x: mouseX - temppoint.x, y: mouseY - temppoint.y };

            var len = Math.sqrt(unitlength.x * unitlength.x + unitlength.y * unitlength.y);
            unitlength.x = unitlength.x / len;
            unitlength.y = unitlength.y / len;

            //pointArray.push({ x1: temppoint.x, y1: temppoint.y, x2: temppoint.x + unitlength.x, y2: temppoint.y + unitlength.y });

            for (var i = 0; i <= len - 1; i++) {
                pointArray.push({ x1: temppoint.x + (i) * unitlength.x, y1: temppoint.y + (i) * unitlength.y, x2: temppoint.x + (i + 1) * unitlength.x, y2: temppoint.y + (i + 1) * unitlength.y });

                outputdiv.innerHTML += ' <br> newLevel.addSegment(' + (pointArray[pointArray.length - 1].x1) + ', ' + (pointArray[pointArray.length - 1].y1) + ', ' + (pointArray[pointArray.length - 1].x2) + ', ' + (pointArray[pointArray.length - 1].y2) + '); ';

            }






            temppoint = null;
            switchy = 0;

        }


        /*
        switchy = leveldata[mouseX][mouseY];

        if (switchy > 0) {

            leveldata[mouseX][mouseY] = 0;
        }
        else {
            leveldata[mouseX][mouseY] = 1;

        }

        */
    });

    function translatetoscreen(xx, yy) {

        var newpoint = { x: 0, y: 0 };

        newpoint.x = (10 * xx + (CanvasWidth / 2));
        newpoint.y = (10 * yy + (CanvasHeight / 2));

        return newpoint;

    }

    function DrawMap() {

        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

        var temp = { x: 0, y: 0 };
        //outputdiv.innerHTML = mouseX + '   ' +  mouseY;
        //draw everything

        context.clearRect(0, 0, CanvasWidth, CanvasHeight);
        context.fillStyle = "gray";
        context.fillRect(0, 0, CanvasWidth, CanvasHeight);
        context.fillStyle = "blue";

        temp = translatetoscreen(mouseX, mouseY);

        context.fillRect(temp.x - 2, temp.y - 2, 4, 4);

        /*

        for (var i = 0; i < 50; i++) {

            for (var j = 0; j < 50; j++) {



                if (leveldata[i][j] > 0) {

                    outputdiv.innerHTML += ' <Br>newLevel.addBlock(' + i + ',0,' + j + ');';
                    outputdiv.innerHTML += ' <Br>newLevel.addBlock(' + i + ',1,' + j + ');';
                    outputdiv.innerHTML += ' <Br>newLevel.addBlock(' + i + ',2,' + j + ');';

                    context.fillRect(i * 10, j * 10, 10, 10);

                }
                else {


                }

            }

        }
        */


        if (temppoint == null) {


        }
        else {
            context.beginPath();

            temp = translatetoscreen(temppoint.x, temppoint.y);
            context.moveTo(temp.x, temp.y);

            temp = translatetoscreen(mouseX, mouseY);
            context.lineTo(temp.x, temp.y);
            context.stroke();


        }

        for (var i = 0; i < pointArray.length; i++) {

            context.beginPath();
            temp = translatetoscreen(pointArray[i].x1, pointArray[i].y1);

            context.moveTo(temp.x, temp.y);

            temp = translatetoscreen(pointArray[i].x2, pointArray[i].y2);
            context.lineTo(temp.x, temp.y);
            context.stroke();

            //outputdiv.innerHTML += ' <br> newLevel.addSegment(' + (pointArray[i].x1) + ', ' + (pointArray[i].y1) + ', ' + (pointArray[i].x2) + ', ' + (pointArray[i].y2) + '); ';

        }




        requestAnimationFrame(DrawMap);


    };

    DrawMap();

};


function moveCamera() {





    if (keyboard.isKeyDown(65)) {

        CameraPos.z += .1 * Math.sin(3.14 - CameraRot.y);
        CameraPos.x += .1 * Math.cos(3.14 - CameraRot.y);
    }

    if (keyboard.isKeyDown(68)) {

        CameraPos.z -= .1 * Math.sin(3.14 - CameraRot.y);
        CameraPos.x -= .1 * Math.cos(3.14 - CameraRot.y);
    }

    if (keyboard.isKeyDown(83)) {

        CameraPos.z -= .1 * Math.sin(1.57 - CameraRot.y);
        CameraPos.x -= .1 * Math.cos(1.57 - CameraRot.y);
    }

    if (keyboard.isKeyDown(87)) {

        CameraPos.z += .1 * Math.sin(1.57 - CameraRot.y);
        CameraPos.x += .1 * Math.cos(1.57 - CameraRot.y);

    }


    if (keyboard.isKeyDown(73)) {

        CameraRot.x -= .05;
    }
    if (keyboard.isKeyDown(75)) {

        CameraRot.x += .05;
    }
    if (keyboard.isKeyDown(74)) {

        CameraRot.y -= .05;
    }
    if (keyboard.isKeyDown(76)) {

        CameraRot.y += .05;
    }


}

function Main() {

    var self = this;
    var mouseX = 0;
    var mouseY = 0;



    $(document).keyup(function (e) {

        keyboard.setkeyup(e.which);

    });



    $(document).keydown(function (e) {

        keyboard.setkeydown(e.which);

        var keyid = e.which;
        /*
        if (keyid == 65) {

            CameraPos.z += .1 * Math.sin(3.14-CameraRot.y);
            CameraPos.x += .1 * Math.cos(3.14-CameraRot.y);
        }
        else if (keyid == 68) {

            CameraPos.z -= .1 * Math.sin(3.14 - CameraRot.y);
            CameraPos.x -= .1 * Math.cos(3.14 - CameraRot.y);
        }
        else if (keyid == 83) {

            CameraPos.z -= .1 * Math.sin(1.57 - CameraRot.y);
            CameraPos.x -= .1 * Math.cos(1.57 - CameraRot.y);
        }
        else if (keyid == 87) {

            CameraPos.z += .1*Math.sin(1.57-CameraRot.y);
            CameraPos.x += .1*Math.cos(1.57-CameraRot.y);

        }


        else if (keyid == 73) {

            CameraRot.x += .05;
        }
        else if (keyid == 75) {

            CameraRot.x -= .05;
        }
        else if (keyid == 74) {

            CameraRot.y -= .05;
        }
        else if (keyid == 76) {

            CameraRot.y += .05;
        }

        outputdiv.innerHTML = Math.cos(CameraRot.y) + '    ' + Math.sin(CameraRot.y);

        */

    });

    $("#myCanvas").mousemove(function (e) {

        mouseX = e.pageX - this.offsetLeft;
        mouseY = e.pageY - this.offsetTop;

        outputdiv.innerHTML = mouseX + '   ' + mouseY;


    });


    context = document.getElementById('myCanvas').getContext('2d');

    CanvasWidth = context.canvas.clientWidth;
    CanvasHeight = context.canvas.clientHeight;

    newLevel.addBlock(3, 6, 3);
    newLevel.addBlock(3, 4, 3);
    newLevel.addBlock(3, 3, 3);
    newLevel.addBlock(3, 2, 3);
    newLevel.addBlock(3, 1, 3);
    newLevel.addBlock(3, 0, 3);


    for (var xc = -30; xc < 30; xc = xc + 4) {
        for (var yc = -30; yc < 30; yc = yc + 4) {


            newLevel.addFloor(xc, yc);

        }


    }


    newLevel.addSegment(-11, 0, -10, 0);
    newLevel.addSegment(-10, 0, -9, 0);
    newLevel.addSegment(-9, 0, -8, 0);
    newLevel.addSegment(-8, 0, -7, 0);
    newLevel.addSegment(-7, 0, -6, 0);
    newLevel.addSegment(-6, 0, -5, 0);
    newLevel.addSegment(-5, 0, -4, 0);
    newLevel.addSegment(-4, 0, -3, 0);
    newLevel.addSegment(-3, 0, -2, 0);
    newLevel.addSegment(-2, 0, -1, 0);
    newLevel.addSegment(-1, 0, 0, 0);
    newLevel.addSegment(0, 0, 1, 0);
    newLevel.addSegment(1, 0, 2, 0);
    newLevel.addSegment(2, 0, 3, 0);
    newLevel.addSegment(3, 0, 3, -1);
    newLevel.addSegment(3, -1, 3, -2);
    newLevel.addSegment(3, -2, 2, -2);
    newLevel.addSegment(2, -2, 1, -2);
    newLevel.addSegment(1, -2, 0, -2);
    newLevel.addSegment(0, -2, -1, -2);
    newLevel.addSegment(-1, -2, -2, -2);
    newLevel.addSegment(-2, -2, -3, -2);
    newLevel.addSegment(-3, -2, -4, -2);
    newLevel.addSegment(-4, -2, -5, -2);
    newLevel.addSegment(-5, -2, -6, -2);
    newLevel.addSegment(-6, -2, -7, -2);
    newLevel.addSegment(-7, -2, -8, -2);
    newLevel.addSegment(-8, -2, -9, -2);
    newLevel.addSegment(-9, -2, -10, -2);
    newLevel.addSegment(-10, -2, -11, -2);
    newLevel.addSegment(-11, -2, -11, -1);
    newLevel.addSegment(-11, -1, -11, 0);
    newLevel.addSegment(6, -7, 6, -6);
    newLevel.addSegment(6, -6, 6, -5);
    newLevel.addSegment(6, -5, 6, -4);
    newLevel.addSegment(6, -4, 6, -3);
    newLevel.addSegment(6, -3, 6, -2);
    newLevel.addSegment(6, -2, 6, -1);
    newLevel.addSegment(6, -1, 6, 0);
    newLevel.addSegment(6, 0, 6, 1);
    newLevel.addSegment(6, 1, 6, 2);
    newLevel.addSegment(6, 2, 6, 3);
    newLevel.addSegment(6, 3, 6, 4);
    newLevel.addSegment(6, 4, 6, 5);
    newLevel.addSegment(6, 5, 7, 5);
    newLevel.addSegment(7, 5, 8, 5);
    newLevel.addSegment(8, 5, 8, 4);
    newLevel.addSegment(8, 4, 8, 3);
    newLevel.addSegment(8, 3, 8, 2);
    newLevel.addSegment(8, 2, 8, 1);
    newLevel.addSegment(8, 1, 8, 0);
    newLevel.addSegment(8, 0, 8, -1);
    newLevel.addSegment(8, -1, 8, -2);
    newLevel.addSegment(8, -2, 8, -3);
    newLevel.addSegment(8, -3, 8, -4);
    newLevel.addSegment(8, -4, 8, -5);
    newLevel.addSegment(8, -5, 8, -6);
    newLevel.addSegment(8, -6, 8, -7);
    newLevel.addSegment(8, -7, 7, -7);
    newLevel.addSegment(7, -7, 6, -7);
    newLevel.addSegment(-16, 5, -16, 4);
    newLevel.addSegment(-16, 4, -16, 3);
    newLevel.addSegment(-16, 3, -16, 2);
    newLevel.addSegment(-16, 2, -16, 1);
    newLevel.addSegment(-16, 1, -16, 0);
    newLevel.addSegment(-16, 0, -16, -1);
    newLevel.addSegment(-16, -1, -16, -2);
    newLevel.addSegment(-16, -2, -16, -3);
    newLevel.addSegment(-16, -3, -16, -4);
    newLevel.addSegment(-16, -4, -16, -5);
    newLevel.addSegment(-16, -5, -16, -6);
    newLevel.addSegment(-16, -6, -16, -7);
    newLevel.addSegment(-16, -7, -17, -7);
    newLevel.addSegment(-17, -7, -18, -7);
    newLevel.addSegment(-18, -7, -18, -6);
    newLevel.addSegment(-18, -6, -18, -5);
    newLevel.addSegment(-18, -5, -18, -4);
    newLevel.addSegment(-18, -4, -18, -3);
    newLevel.addSegment(-18, -3, -18, -2);
    newLevel.addSegment(-18, -2, -18, -1);
    newLevel.addSegment(-18, -1, -18, 0);
    newLevel.addSegment(-18, 0, -18, 1);
    newLevel.addSegment(-18, 1, -18, 2);
    newLevel.addSegment(-18, 2, -18, 3);
    newLevel.addSegment(-18, 3, -18, 4);
    newLevel.addSegment(-18, 4, -18, 5);
    newLevel.addSegment(-18, 5, -17, 5);
    newLevel.addSegment(-17, 5, -16, 5);
    newLevel.addSegment(-16, 5, -15, 5);
    newLevel.addSegment(-15, 5, -14, 5);
    newLevel.addSegment(-14, 5, -13, 5);
    newLevel.addSegment(-13, 5, -12, 5);
    newLevel.addSegment(-12, 5, -11, 5);
    newLevel.addSegment(-11, 5, -10, 5);
    newLevel.addSegment(-10, 5, -9, 5);
    newLevel.addSegment(-9, 5, -9, 4);
    newLevel.addSegment(-9, 4, -9, 3);
    newLevel.addSegment(-9, 3, -10, 3);
    newLevel.addSegment(-10, 3, -11, 3);
    newLevel.addSegment(-11, 3, -12, 3);
    newLevel.addSegment(-12, 3, -13, 3);
    newLevel.addSegment(-13, 3, -14, 3);
    newLevel.addSegment(-14, 3, -15, 3);
    newLevel.addSegment(-15, 3, -16, 3);
    newLevel.addSegment(6, 3, 5, 3);
    newLevel.addSegment(5, 3, 4, 3);
    newLevel.addSegment(4, 3, 3, 3);
    newLevel.addSegment(3, 3, 2, 3);
    newLevel.addSegment(2, 3, 1, 3);
    newLevel.addSegment(1, 3, 0, 3);
    newLevel.addSegment(0, 3, -1, 3);
    newLevel.addSegment(-1, 3, -2, 3);
    newLevel.addSegment(-2, 3, -2, 4);
    newLevel.addSegment(-2, 4, -2, 5);
    newLevel.addSegment(-2, 5, -1, 5);
    newLevel.addSegment(-1, 5, 0, 5);
    newLevel.addSegment(0, 5, 1, 5);
    newLevel.addSegment(1, 5, 2, 5);
    newLevel.addSegment(2, 5, 3, 5);
    newLevel.addSegment(3, 5, 4, 5);
    newLevel.addSegment(4, 5, 5, 5);
    newLevel.addSegment(5, 5, 6, 5);
    newLevel.addSegment(-5, 5, -6, 5);
    newLevel.addSegment(-6, 5, -6, 6);
    newLevel.addSegment(-6, 6, -6, 7);
    newLevel.addSegment(-6, 7, -6, 8);
    newLevel.addSegment(-6, 8, -6, 9);
    newLevel.addSegment(-6, 9, -6, 10);
    newLevel.addSegment(-6, 10, -6, 11);
    newLevel.addSegment(-6, 11, -6, 12);
    newLevel.addSegment(-6, 12, -6, 13);
    newLevel.addSegment(-6, 13, -5, 13);
    newLevel.addSegment(-5, 13, -5, 12);
    newLevel.addSegment(-5, 12, -5, 11);
    newLevel.addSegment(-5, 11, -5, 10);
    newLevel.addSegment(-5, 10, -5, 9);
    newLevel.addSegment(-5, 9, -5, 8);
    newLevel.addSegment(-5, 8, -5, 7);
    newLevel.addSegment(-5, 7, -5, 6);
    newLevel.addSegment(-5, 6, -5, 5);
    newLevel.addSegment(-5, 13, -4, 13);
    newLevel.addSegment(-4, 13, -3, 13);
    newLevel.addSegment(-3, 13, -2, 13);
    newLevel.addSegment(-2, 13, -1, 13);
    newLevel.addSegment(-1, 13, 0, 13);
    newLevel.addSegment(0, 13, 1, 13);
    newLevel.addSegment(1, 13, 2, 13);
    newLevel.addSegment(2, 13, 3, 13);
    newLevel.addSegment(3, 13, 4, 13);
    newLevel.addSegment(4, 13, 5, 13);
    newLevel.addSegment(5, 13, 6, 13);
    newLevel.addSegment(6, 13, 7, 13);
    newLevel.addSegment(7, 13, 8, 13);
    newLevel.addSegment(8, 13, 9, 13);
    newLevel.addSegment(9, 12, 9, 11);
    newLevel.addSegment(9, 11, 9, 10);
    newLevel.addSegment(9, 13, 9, 12);
    newLevel.addSegment(9, 10, 8.002541300169264, 9.92875295001209);
    newLevel.addSegment(8.002541300169264, 9.92875295001209, 7.00508260033853, 9.857505900024181);
    newLevel.addSegment(7.00508260033853, 9.857505900024181, 6.007623900507795, 9.78625885003627);
    newLevel.addSegment(6.007623900507795, 9.78625885003627, 5.01016520067706, 9.715011800048362);
    newLevel.addSegment(5.01016520067706, 9.715011800048362, 4.012706500846324, 9.643764750060452);
    newLevel.addSegment(4.012706500846324, 9.643764750060452, 3.0152478010155894, 9.572517700072542);
    newLevel.addSegment(3.0152478010155894, 9.572517700072542, 2.0177891011848548, 9.501270650084633);
    newLevel.addSegment(2.0177891011848548, 9.501270650084633, 1.0203304013541192, 9.430023600096723);
    newLevel.addSegment(1.0203304013541192, 9.430023600096723, 0.022871701523383692, 9.358776550108812);
    newLevel.addSegment(0.022871701523383692, 9.358776550108812, -0.9745869983073518, 9.287529500120904);
    newLevel.addSegment(-0.9745869983073518, 9.287529500120904, -1.9720456981380856, 9.216282450132994);
    newLevel.addSegment(-1.9720456981380856, 9.216282450132994, -2.969504397968821, 9.145035400145083);
    newLevel.addSegment(-2.969504397968821, 9.145035400145083, -3.9669630977995567, 9.073788350157175);
    newLevel.addSegment(-3.9669630977995567, 9.073788350157175, -4.9644217976302905, 9.002541300169264);
    newLevel.addSegment(-6, 9, -6.99654575824488, 9.08304547985374);
    newLevel.addSegment(-6.99654575824488, 9.08304547985374, -7.993091516489759, 9.16609095970748);
    newLevel.addSegment(-7.993091516489759, 9.16609095970748, -8.989637274734639, 9.24913643956122);
    newLevel.addSegment(-8.989637274734639, 9.24913643956122, -9.986183032979518, 9.33218191941496);
    newLevel.addSegment(-9.986183032979518, 9.33218191941496, -10.982728791224398, 9.4152273992687);
    newLevel.addSegment(-10.982728791224398, 9.4152273992687, -11.979274549469277, 9.49827287912244);
    newLevel.addSegment(-11.979274549469277, 9.49827287912244, -12.975820307714157, 9.58131835897618);
    newLevel.addSegment(-12.975820307714157, 9.58131835897618, -13.972366065959037, 9.66436383882992);
    newLevel.addSegment(-13.972366065959037, 9.66436383882992, -14.968911824203916, 9.74740931868366);
    newLevel.addSegment(-14.968911824203916, 9.74740931868366, -15.965457582448796, 9.8304547985374);
    newLevel.addSegment(-15.965457582448796, 9.8304547985374, -16.962003340693677, 9.91350027839114);
    newLevel.addSegment(-16.962003340693677, 9.91350027839114, -17.958549098938555, 9.99654575824488);
    newLevel.addSegment(-18, 10, -18, 11);
    newLevel.addSegment(-18, 11, -18, 12);
    newLevel.addSegment(-18, 12, -18, 13);
    newLevel.addSegment(-18, 13, -17, 13);
    newLevel.addSegment(-17, 13, -16, 13);
    newLevel.addSegment(-16, 13, -15, 13);
    newLevel.addSegment(-15, 13, -14, 13);
    newLevel.addSegment(-14, 13, -13, 13);
    newLevel.addSegment(-13, 13, -12, 13);
    newLevel.addSegment(-12, 13, -11, 13);
    newLevel.addSegment(-11, 13, -10, 13);
    newLevel.addSegment(-10, 13, -9, 13);
    newLevel.addSegment(-9, 13, -8, 13);
    newLevel.addSegment(-8, 13, -7, 13);
    newLevel.addSegment(-7, 13, -6, 13);
    newLevel.addSegment(-22, 13, -22, 12);
    newLevel.addSegment(-22, 12, -22, 11);
    newLevel.addSegment(-22, 11, -22, 10);
    newLevel.addSegment(-22, 10, -22, 9);
    newLevel.addSegment(-22, 9, -22, 8);
    newLevel.addSegment(-22, 8, -22, 7);
    newLevel.addSegment(-22, 7, -22, 6);
    newLevel.addSegment(-22, 6, -22, 5);
    newLevel.addSegment(-22, 5, -22, 4);
    newLevel.addSegment(-22, 4, -22, 3);
    newLevel.addSegment(-22, 3, -22, 2);
    newLevel.addSegment(-22, 2, -22, 1);
    newLevel.addSegment(-22, 1, -22, 0);
    newLevel.addSegment(-22, 0, -22, -1);
    newLevel.addSegment(-22, -1, -22, -2);
    newLevel.addSegment(-22, -2, -22, -3);
    newLevel.addSegment(-22, -3, -22, -4);
    newLevel.addSegment(-22, -4, -22, -5);
    newLevel.addSegment(-22, -5, -22, -6);
    newLevel.addSegment(-22, -6, -22, -7);
    newLevel.addSegment(-22, -7, -23, -7);
    newLevel.addSegment(-23, -7, -24, -7);
    newLevel.addSegment(-24, -7, -24, -6);
    newLevel.addSegment(-24, -6, -24, -5);
    newLevel.addSegment(-24, -5, -24, -4);
    newLevel.addSegment(-24, -4, -24, -3);
    newLevel.addSegment(-24, -3, -24, -2);
    newLevel.addSegment(-24, -2, -24, -1);
    newLevel.addSegment(-24, -1, -24, 0);
    newLevel.addSegment(-24, 0, -24, 1);
    newLevel.addSegment(-24, 1, -24, 2);
    newLevel.addSegment(-24, 2, -24, 3);
    newLevel.addSegment(-24, 3, -24, 4);
    newLevel.addSegment(-24, 4, -24, 5);
    newLevel.addSegment(-24, 5, -24, 6);
    newLevel.addSegment(-24, 6, -24, 7);
    newLevel.addSegment(-24, 7, -24, 8);
    newLevel.addSegment(-24, 8, -24, 9);
    newLevel.addSegment(-24, 9, -24, 10);
    newLevel.addSegment(-24, 10, -24, 11);
    newLevel.addSegment(-24, 11, -24, 12);
    newLevel.addSegment(-24, 12, -24, 13);
    newLevel.addSegment(-24, 13, -23, 13);
    newLevel.addSegment(-23, 13, -22, 13);
    newLevel.addSegment(-13, -5, -12, -5);
    newLevel.addSegment(-12, -5, -11, -5);
    newLevel.addSegment(-11, -5, -10, -5);
    newLevel.addSegment(-10, -5, -10, -6);
    newLevel.addSegment(-10, -6, -10, -7);
    newLevel.addSegment(-10, -7, -10, -8);
    newLevel.addSegment(-10, -8, -10, -9);
    newLevel.addSegment(-10, -9, -10, -10);
    newLevel.addSegment(-10, -10, -10, -11);
    newLevel.addSegment(-10, -11, -10, -12);
    newLevel.addSegment(-10, -12, -10, -13);
    newLevel.addSegment(-10, -13, -11, -13);
    newLevel.addSegment(-11, -13, -12, -13);
    newLevel.addSegment(-12, -13, -13, -13);
    newLevel.addSegment(-13, -13, -14, -13);
    newLevel.addSegment(-14, -13, -15, -13);
    newLevel.addSegment(-15, -13, -16, -13);
    newLevel.addSegment(-16, -13, -17, -13);
    newLevel.addSegment(-17, -13, -18, -13);
    newLevel.addSegment(-18, -13, -19, -13);
    newLevel.addSegment(-19, -13, -20, -13);
    newLevel.addSegment(-20, -13, -21, -13);
    newLevel.addSegment(-21, -13, -22, -13);
    newLevel.addSegment(-22, -13, -23, -13);
    newLevel.addSegment(-23, -13, -24, -13);
    newLevel.addSegment(-24, -13, -24, -12);
    newLevel.addSegment(-24, -12, -24, -11);
    newLevel.addSegment(-24, -11, -24, -10);
    newLevel.addSegment(-24, -10, -23, -10);
    newLevel.addSegment(-23, -10, -22, -10);
    newLevel.addSegment(-22, -10, -21, -10);
    newLevel.addSegment(-21, -10, -20, -10);
    newLevel.addSegment(-20, -10, -19, -10);
    newLevel.addSegment(-19, -10, -18, -10);
    newLevel.addSegment(-18, -10, -17, -10);
    newLevel.addSegment(-17, -10, -16, -10);
    newLevel.addSegment(-16, -10, -15, -10);
    newLevel.addSegment(-15, -10, -14, -10);
    newLevel.addSegment(-14, -10, -13, -10);
    newLevel.addSegment(-13, -10, -13, -9);
    newLevel.addSegment(-13, -9, -13, -8);
    newLevel.addSegment(-13, -8, -13, -7);
    newLevel.addSegment(-13, -7, -13, -6);
    newLevel.addSegment(-13, -6, -13, -5);



    /*

    for (var ii = -10; ii < 5; ii++) {
        for (var jj = -10; jj < 5; jj++) {

            newLevel.addBlock(ii, -1, jj);
            newLevel.addBlock(ii, 3, jj);

            if ((jj == -10)||(ii==-10)||(ii==4)||(jj==4)) {
                newLevel.addBlock(ii, 1, jj);
                newLevel.addBlock(ii, 0, jj);
                newLevel.addBlock(ii, 2, jj);

            }


        }
    }

    */


    //var context = document.getElementById('daggerctx').getContext('2d');


    /*
    newLevel.addSegment(-9, -1, -3, -1);
    newLevel.addSegment(-3, -5, -3, -1);

    newLevel.addSegment(3, -1, 6, -1);
    newLevel.addSegment(3, -1, 3, -5);


    newLevel.addSegment(-22, -8, -22, 13);
    newLevel.addSegment(-22, 13, 4, 13);
    newLevel.addSegment(4, 13, 4, -8);
    newLevel.addSegment(4, -8, -23, -8);
    newLevel.addSegment(-20, -6, -20, 9);
    newLevel.addSegment(-21, 9, -19, 9);
    newLevel.addSegment(-19, 8, -19, -6);
    newLevel.addSegment(-20, -6, -20, -6);
    newLevel.addSegment(-17, -1, -15, -1);
    newLevel.addSegment(-15, -1, -15, 5);
    newLevel.addSegment(-15, 5, -17, 5);
    newLevel.addSegment(-17, 5, -17, -1);
    newLevel.addSegment(-14, 3, -5, 3);
    newLevel.addSegment(-5, 3, -5, 1);
    newLevel.addSegment(-6, 1, -14, 1);
    newLevel.addSegment(-14, 1, -14, 2);
    newLevel.addSegment(-13, 3, -13, 8);
    newLevel.addSegment(-13, 8, -11, 8);
    newLevel.addSegment(-11, 8, -11, 3);
    newLevel.addSegment(-9, 4, -9, 10);
    newLevel.addSegment(-9, 9, -8, 9);
    newLevel.addSegment(-7, 9, -7, 4);
    newLevel.addSegment(-7, 3, -9, 4);


    newLevel.createMesh();
    */


    //newLevel.draw();

    DrawScene();


};

function DrawScene() {

    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

    //draw everything

    moveCamera();

    context.clearRect(0, 0, CanvasWidth, CanvasHeight);
    context.fillStyle = "gray";
    context.fillRect(0, 0, CanvasWidth, CanvasHeight);


    var CenterX = CanvasWidth / 2;
    var CenterY = CanvasHeight / 2;

    /*

    var PointList = new Array();
    var VertexList = new Array();
    // For each vertex point

    var cosx = Math.cos(CameraRot.x);
    var cosy = Math.cos(CameraRot.y);
    var cosz = Math.cos(CameraRot.z);
    var sinx = Math.sin(CameraRot.x);
    var siny = Math.sin(CameraRot.y);
    var sinz = Math.sin(CameraRot.z);

    


    for (var i = 0; i < CubeVertex.length; i++) {
        // The resulting vertex point we are working on
        // Note that we are creating a new object, not making a copy-reference
        var WorkingVertex = { x: CubeVertex[i].x, y: CubeVertex[i].y, z: CubeVertex[i].z }

       

        var xdif = CubeVertex[i].x - CameraPos.x;
        var ydif = CubeVertex[i].y - CameraPos.y;
        var zdif = CubeVertex[i].z - CameraPos.z;
        

        //transform the 3d points to the camera perspective
        WorkingVertex.x = cosy * (sinz * ydif + cosz * xdif) - siny * zdif;
        WorkingVertex.y = sinx * (cosy * zdif + siny*(sinz * ydif + cosz * xdif)) + cosx * (cosz * ydif - sinz * xdif);
        WorkingVertex.z = cosx * (cosy * zdif + siny * (sinz * ydif + cosz * xdif)) - sinx * (cosz * ydif - sinz * xdif);

        

        VertexList[i] = WorkingVertex;

        // Convert from x,y,z to x,y
        // This is called a projection transform
        // We are projecting from 3D back to 2D
        var ScreenX = (RatioConst * (WorkingVertex.x)) / (WorkingVertex.z);
        var ScreenY = (RatioConst * (WorkingVertex.y)) / (WorkingVertex.z);

        // Save this on-screen position to render the line locations
        PointList[i] = { x: CenterX + ScreenX, y: CenterY + ScreenY };
    }
    
    for (var i = 0; i < CubeFaces.length; i++) {

        if (isFrontFace(CubeVertex[CubeFaces[i].a], CubeVertex[CubeFaces[i].b], CubeVertex[CubeFaces[i].c], CubeFaces[i].i) >= 1.57) {

        

            // Find the four points we are working on
            var PointA = PointList[CubeFaces[i].a];
            var PointB = PointList[CubeFaces[i].b];
            var PointC = PointList[CubeFaces[i].c];

           
                DrawTri(PointA.x, PointA.y, PointB.x, PointB.y, PointC.x, PointC.y);

            
        }
    }

    */

    newLevel.draw();


    requestAnimationFrame(DrawScene);

};

function vectorLength(x, y, z) {

    return Math.sqrt(x * x + y * y + z * z);

};

function findNormal(PointA, PointB, PointC) {

    var vertexA = { x: PointB.x - PointA.x, y: PointB.y - PointA.y, z: PointB.z - PointA.z };
    var vertexB = { x: PointC.x - PointA.x, y: PointC.y - PointA.y, z: PointC.z - PointA.z };

    var temp = vectorLength(vertexA.x, vertexA.y, vertexA.z);

    vertexA.x = vertexA.x / temp;
    vertexA.y = vertexA.y / temp;
    vertexA.z = vertexA.z / temp;

    temp = vectorLength(vertexB.x, vertexB.y, vertexB.z);

    vertexB.x = vertexB.x / temp;
    vertexB.y = vertexB.y / temp;
    vertexB.z = vertexB.z / temp;


    var crossPro = { x: (vertexA.y * vertexB.z - vertexA.z * vertexB.y), y: -1 * (vertexA.x * vertexB.z - vertexA.z * vertexB.x), z: (vertexA.x * vertexB.y - vertexA.y * vertexB.x) };


    return crossPro;
};

function isFrontFace(PointA, PointB, PointC, num) {



    var vertexA = { x: PointB.x - PointA.x, y: PointB.y - PointA.y, z: PointB.z - PointA.z };
    var vertexB = { x: PointC.x - PointA.x, y: PointC.y - PointA.y, z: PointC.z - PointA.z };
    var PointAverage = { x: (Math.min(PointA.x, PointB.x, PointC.x) + Math.max(PointA.x, PointB.x, PointC.x)) / 2, y: (Math.min(PointA.y, PointB.y, PointC.y) + Math.max(PointA.y, PointB.y, PointC.y)) / 2, z: (Math.min(PointA.z, PointB.z, PointC.z) + Math.max(PointA.z, PointB.z, PointC.z)) / 2 };

    //var PointAverage = { x: (PointA.x + PointB.x + PointC.x) / 3, y: (PointA.y + PointB.y + PointC.y) / 3, z: (PointA.z + PointB.z + PointC.z) / 3 };




    var temp = vectorLength(vertexA.x, vertexA.y, vertexA.z);

    vertexA.x = vertexA.x / temp;
    vertexA.y = vertexA.y / temp;
    vertexA.z = vertexA.z / temp;

    temp = vectorLength(vertexB.x, vertexB.y, vertexB.z);

    vertexB.x = vertexB.x / temp;
    vertexB.y = vertexB.y / temp;
    vertexB.z = vertexB.z / temp;

    //var crossPro = { x: (PointA.y * PointB.z - PointA.z * PointB.y), y: -1 * (PointA.x * PointB.z - PointA.z * PointB.x), z: (PointA.x * PointB.y - PointA.y * PointB.x) };

    //var crossPro = { x: (vertexA.y * vertexB.z - vertexA.z * vertexB.y), y: -1 * (vertexA.x * vertexB.z - vertexA.z * vertexB.x), z: (vertexA.x * vertexB.y - vertexA.y * vertexB.x) };

    var crossPro = { x: (vertexA.y * vertexB.z - vertexA.z * vertexB.y), y: -1 * (vertexA.x * vertexB.z - vertexA.z * vertexB.x), z: (vertexA.x * vertexB.y - vertexA.y * vertexB.x) };
    //   x: Ay * Bz - Az * By
    //   y: -(Ax * Bz - Az * Bx)
    //   z: Ax * By - Ay * Bx

    //var cameraToPoint = { x: PointA.x - CameraPos.x, y: PointA.y - CameraPos.y, z: PointA.z - CameraPos.z };

    //var cameraToPoint = { x: CameraPos.x - PointA.x, y: CameraPos.y - PointA.y, z: CameraPos.z - PointA.z };
    var cameraToPoint = { x: CameraPos.x - PointAverage.x, y: CameraPos.y - PointAverage.y, z: CameraPos.z - PointAverage.z };
    // var cameraToPoint1 = { x: CameraPos.x - PointA.x, y: CameraPos.y - PointA.y, z: CameraPos.z - PointA.z };
    // var cameraToPoint2 = { x: CameraPos.x - PointB.x, y: CameraPos.y - PointB.y, z: CameraPos.z - PointB.z };
    // var cameraToPoint3 = { x: CameraPos.x - PointC.x, y: CameraPos.y - PointC.y, z: CameraPos.z - PointC.z };

    temp = vectorLength(cameraToPoint.x, cameraToPoint.y, cameraToPoint.z);

    // var temp1 = vectorLength(cameraToPoint1.x, cameraToPoint1.y, cameraToPoint1.z);
    // var temp2 = vectorLength(cameraToPoint2.x, cameraToPoint2.y, cameraToPoint2.z);
    // var temp3 = vectorLength(cameraToPoint3.x, cameraToPoint3.y, cameraToPoint3.z);

    // var temp4 = Math.max(temp1, temp2, temp3);

    var someNumber = (cameraToPoint.x * crossPro.x + cameraToPoint.y * crossPro.y + cameraToPoint.z * crossPro.z) / (Math.sqrt(cameraToPoint.x * cameraToPoint.x + cameraToPoint.y * cameraToPoint.y + cameraToPoint.z * cameraToPoint.z) * Math.sqrt(crossPro.x * crossPro.x + crossPro.y * crossPro.y + crossPro.z * crossPro.z));

    var backAngle = Math.acos(someNumber);
    /*
    if (num == 1) {

        if (switchy == 1) {
            outputdiv.innerHTML = ' A :  ' + PointA.x + '  ' + PointA.y + '   ' + PointA.z + ' angle:  ' + backAngle;
            switchy++;
        }
        else {
            outputdiv.innerHTML += ' B :  ' + PointA.x + '  ' + PointA.y + '   ' + PointA.z + ' angle:  ' + backAngle;
            switchy = 1;

        }
    }
    */

    //outputdiv.innerHTML = '   ' + CameraRot.y;

    return { angle: backAngle, distance: temp };
    //if (backAngle < 1.57) { return false; }
    //else { return true; }

}

function isFrontFace3(PointA, PointB, PointC, num) {



    var vertexA = { x: PointB.x - PointA.x, y: PointB.y - PointA.y, z: PointB.z - PointA.z };
    var vertexB = { x: PointC.x - PointA.x, y: PointC.y - PointA.y, z: PointC.z - PointA.z };

    var temp = vectorLength(vertexA.x, vertexA.y, vertexA.z);

    vertexA.x = vertexA.x / temp;
    vertexA.y = vertexA.y / temp;
    vertexA.z = vertexA.z / temp;

    temp = vectorLength(vertexB.x, vertexB.y, vertexB.z);

    vertexB.x = vertexB.x / temp;
    vertexB.y = vertexB.y / temp;
    vertexB.z = vertexB.z / temp;

    //var crossPro = { x: (PointA.y * PointB.z - PointA.z * PointB.y), y: -1 * (PointA.x * PointB.z - PointA.z * PointB.x), z: (PointA.x * PointB.y - PointA.y * PointB.x) };
    var crossPro = { x: (vertexA.y * vertexB.z - vertexA.z * vertexB.y), y: -1 * (vertexA.x * vertexB.z - vertexA.z * vertexB.x), z: (vertexA.x * vertexB.y - vertexA.y * vertexB.x) };
    //   x: Ay * Bz - Az * By
    //   y: -(Ax * Bz - Az * Bx)
    //   z: Ax * By - Ay * Bx

    //var cameraToPoint = { x: PointA.x - CameraPos.x, y: PointA.y - CameraPos.y, z: PointA.z - CameraPos.z };

    var cameraToPoint = { x: 0, y: 0, z: -1 };

    var someNumber = (cameraToPoint.x * crossPro.x + cameraToPoint.y * crossPro.y + cameraToPoint.z * crossPro.z) / (Math.sqrt(cameraToPoint.x * cameraToPoint.x + cameraToPoint.y * cameraToPoint.y + cameraToPoint.z * cameraToPoint.z) * Math.sqrt(crossPro.x * crossPro.x + crossPro.y * crossPro.y + crossPro.z * crossPro.z));

    var backAngle = Math.acos(someNumber);
    /*
    if (num == 1) {

        if (switchy == 1) {
            outputdiv.innerHTML = ' A :  ' + PointA.x + '  ' + PointA.y + '   ' + PointA.z + ' angle:  ' + backAngle;
            switchy++;
        }
        else {
            outputdiv.innerHTML += ' B :  ' + PointA.x + '  ' + PointA.y + '   ' + PointA.z + ' angle:  ' + backAngle;
            switchy = 1;

        }
    }
    */

    //outputdiv.innerHTML = '   ' + CameraRot.y;

    return backAngle;
    //if (backAngle < 1.57) { return false; }
    //else { return true; }

}


function isFrontFace2(PointA, PointB, PointC) {



    var vertexA = { x: PointB.x - PointA.x, y: PointB.y - PointA.y, z: PointB.z - PointA.z };
    var vertexB = { x: PointC.x - PointA.x, y: PointC.y - PointA.y, z: PointC.z - PointA.z };

    var temp = vectorLength(vertexA.x, vertexA.y, vertexA.z);

    vertexA.x = vertexA.x / temp;
    vertexA.y = vertexA.y / temp;
    vertexA.z = vertexA.z / temp;

    temp = vectorLength(vertexB.x, vertexB.y, vertexB.z);

    vertexB.x = vertexB.x / temp;
    vertexB.y = vertexB.y / temp;
    vertexB.z = vertexB.z / temp;


    //outputdiv.innerHTML += '  ' + JSON.stringify(PointB);

    //var crossPro = { x: (PointA.y * PointB.z - PointA.z * PointB.y), y: -1 * (PointA.x * PointB.z - PointA.z * PointB.x), z: (PointA.x * PointB.y - PointA.y * PointB.x) };
    var crossPro = { x: (vertexA.y * vertexB.z - vertexA.z * vertexB.y), y: -1 * (vertexA.x * vertexB.z - vertexA.z * vertexB.x), z: (vertexA.x * vertexB.y - vertexA.y * vertexB.x) };
    //   x: Ay * Bz - Az * By
    //   y: -(Ax * Bz - Az * Bx)
    //   z: Ax * By - Ay * Bx

    //outputdiv.innerHTML += '   ' + crossPro.z;

    if (crossPro.z <= 0.05) {
        return true;

    }



}

function DrawSprite(x, y, image, width, height) {

    context.drawImage(image, x - width / 2, y - height / 2, width, height);

}

function DrawTri(x1, y1, x2, y2, x3, y3, tricolor) {
    // Shortext context handle
    //var tricolor = { r: 72, g: 72, b: 72 };




    /*
    

    tricolor.r = (((angletocamera.angle - 1.57) / 1.57) * tricolor.r) + (300 / angletocamera.distance);
    tricolor.g = (((angletocamera.angle - 1.57) / 1.57) * tricolor.g) + (300 / angletocamera.distance);
    tricolor.b = (((angletocamera.angle - 1.57) / 1.57) * tricolor.b) + (300 / angletocamera.distance);

    */
    //outputdiv.innerHTML += ' distance:  ' + angletocamera.distance + '    ' + tricolor.r + '<br>';

    // Set width and cap style
    context.fillStyle = 'rgb(' + Math.floor(Math.min(255, tricolor.r)) + ',' + Math.floor(Math.min(255, tricolor.g)) + ',' + Math.floor(Math.min(255, tricolor.b)) + ' )';
    context.strokeStyle = 'rgb(' + Math.floor(Math.min(255, tricolor.r)) + ',' + Math.floor(Math.min(255, tricolor.g)) + ',' + Math.floor(Math.min(255, tricolor.b)) + ' )';
    context.lineWidth = 0;
    context.lineCap = "butt";
    context.lineJoin = "round";



    // Draw from point to point
    context.beginPath();
    //context.moveTo(x1, y1);
    //context.lineTo(x2, y2);
    //context.lineTo(x3, y3);

    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);

    /*
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineTo(x3, y3);
    */

    context.closePath();
    context.stroke();
    context.fill();

    // Revert context
    context.restore();

    // Done rendering triangle
};

