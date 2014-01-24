function psengine() {

    //stores points
    //stores triangle index?


}

var mouseX = 0;
var mouseY = 0;

function levelData() {
    var self = this;
    this.wallheight = 3;
    this.wallData = new Array();
    this.wallVertex = new Array();
    this.wallFaces = new Array();
    this.wallNormal = new Array();

    this.blocksize = .5;
}

function sortFunction(a, b) {

    return (a.angletocamera.distance - b.angletocamera.distance);

};

levelData.prototype.addSegment = function (x1, z1, x2, z2) {


    if (x2 > x1) {

        this.wallData.push({ x1: x1, z1: z1, x2: x2, z2: z2 })
    }
    else {
        this.wallData.push({ x1: x2, z1: z2, x2: x1, z2: z1 })

    }

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

    //var blockcolor = { r: 136, g: 0, b: 0 };

    this.wallFaces.push({ a: nextindex, b: nextindex + 1, c: nextindex + 2 });
    this.wallFaces.push({ a: nextindex + 2, b: nextindex + 3, c: nextindex + 0 });

    this.wallFaces.push({ a: nextindex + 1, b: nextindex + 5, c: nextindex + 6 });
    this.wallFaces.push({ a: nextindex + 6, b: nextindex + 2, c: nextindex + 1 });

    this.wallFaces.push({ a: nextindex + 5, b: nextindex + 4, c: nextindex + 7 });
    this.wallFaces.push({ a: nextindex + 7, b: nextindex + 6, c: nextindex + 5 });

    this.wallFaces.push({ a: nextindex + 4, b: nextindex + 0, c: nextindex + 3 });
    this.wallFaces.push({ a: nextindex + 3, b: nextindex + 7, c: nextindex + 4 });

    this.wallFaces.push({ a: nextindex + 3, b: nextindex + 2, c: nextindex + 6 });
    this.wallFaces.push({ a: nextindex + 6, b: nextindex + 7, c: nextindex + 3 });

    this.wallFaces.push({ a: nextindex + 0, b: nextindex + 5, c: nextindex + 1 });
    this.wallFaces.push({ a: nextindex + 0, b: nextindex + 4, c: nextindex + 5 });




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



        }

        // Convert from x,y,z to x,y
        // This is called a projection transform
        // We are projecting from 3D back to 2D
        var ScreenX = (RatioConst * (WorkingVertex.x)) / (WorkingVertex.z);
        var ScreenY = (RatioConst * (WorkingVertex.y)) / (WorkingVertex.z);

        // Save this on-screen position to render the line locations
        PointList[i] = { x: CenterX + ScreenX, y: CenterY + ScreenY };
    }

    var orderedFaces = new Array();

    for (var i = 0; i < this.wallFaces.length; i++) {
        angletocamera = isFrontFace(this.wallVertex[this.wallFaces[i].a], this.wallVertex[this.wallFaces[i].b], this.wallVertex[this.wallFaces[i].c], 0);
        orderedFaces[i] = { a: this.wallFaces[i].a, b: this.wallFaces[i].b, c: this.wallFaces[i].c, d: angletocamera };



    }

    orderedFaces.sort(function (a, b) {
        return (b.d.distance - a.d.distance);
    });



    for (var i = 0; i < orderedFaces.length; i++) {
        //for (var i = 0; i < 24; i++) {


        //angletocamera = isFrontFace(this.wallVertex[this.wallFaces[i].a], this.wallVertex[this.wallFaces[i].b], this.wallVertex[this.wallFaces[i].c], 0);

        if ((VertexList[orderedFaces[i].a].z >= .2) || (VertexList[orderedFaces[i].b].z >= .2) || (VertexList[orderedFaces[i].c].z >= .2)) {
            if (orderedFaces[i].d.angle >= 1.57) {



                // Find the four points we are working on
                var PointA = PointList[orderedFaces[i].a];
                var PointB = PointList[orderedFaces[i].b];
                var PointC = PointList[orderedFaces[i].c];



                //compute color
                var tricolor = { r: 135, g: 0, b: 0 };


                tricolor.r = (((orderedFaces[i].d.angle - 1.57) / 1.57) * tricolor.r) + (400 / orderedFaces[i].d.distance);
                tricolor.g = (((orderedFaces[i].d.angle - 1.57) / 1.57) * tricolor.g) + (400 / orderedFaces[i].d.distance);
                tricolor.b = (((orderedFaces[i].d.angle - 1.57) / 1.57) * tricolor.b) + (400 / orderedFaces[i].d.distance);

                // Render the face by looking up our vertex list
                DrawTri(PointA.x, PointA.y, PointB.x, PointB.y, PointC.x, PointC.y, orderedFaces[i].d);




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

var CameraPos = { x: 0, y: 1, z: -10 };

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

        mouseX = Math.floor((e.pageX - this.offsetLeft) / 10);
        mouseY = Math.floor((e.pageY - this.offsetTop) / 10);


    });

    $("#myCanvas").mousedown(function () {
        /*
        if (switchy == 0) {

            temppoint = { x: mouseX, y: mouseY };
           
            
            switchy=1;
        }
        else {

            pointArray.push({ x1: temppoint.x, y1: temppoint.y, x2: mouseX, y2: mouseY });
            temppoint = null;
            switchy = 0;

        }*/



        switchy = leveldata[mouseX][mouseY];

        if (switchy > 0) {

            leveldata[mouseX][mouseY] = 0;
        }
        else {
            leveldata[mouseX][mouseY] = 1;

        }


    });



    function DrawMap() {

        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;


        outputdiv.innerHTML = '  ';
        //draw everything

        context.clearRect(0, 0, CanvasWidth, CanvasHeight);
        context.fillStyle = "gray";
        context.fillRect(0, 0, CanvasWidth, CanvasHeight);
        context.fillStyle = "blue";


        for (var i = 0; i < 50; i++) {

            for (var j = 0; j < 50; j++) {



                if (leveldata[i][j] > 0) {

                    outputdiv.innerHTML += ' <Br>newLevel.addBlock(' + i + ',0,' + j + ');';
                    context.fillRect(i * 10, j * 10, 10, 10);

                }
                else {


                }

            }

        }

        /*
        if (temppoint == null) {


        }
        else {
            context.beginPath();
            context.moveTo(temppoint.x, temppoint.y);
            context.lineTo(mouseX, mouseY);
            context.stroke();

            
        }

        for (var i = 0; i < pointArray.length; i++) {

            context.beginPath();
            context.moveTo(pointArray[i].x1, pointArray[i].y1);
            context.lineTo(pointArray[i].x2, pointArray[i].y2);
            context.stroke();

            outputdiv.innerHTML += ' <br> newLevel.addSegment(' + (pointArray[i].x1 / 10-38) + ', ' + (pointArray[i].y1 / 10-20) + ', ' + (pointArray[i].x2 / 10-38) + ', ' + (pointArray[i].y2 / 10-20) + '); ';

        }

        */


        requestAnimationFrame(DrawMap);


    };

    DrawMap();

};



function Main() {

    var self = this;
    var mouseX = 0;
    var mouseY = 0;


    $(document).keydown(function (e) {


        var keyid = e.which;

        if (keyid == 65) {

            CameraPos.x -= .05;
        }
        else if (keyid == 68) {

            CameraPos.x += .05;
        }
        else if (keyid == 83) {

            CameraPos.z -= .05;
        }
        else if (keyid == 87) {

            CameraPos.z += .05;
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

    ////

    newLevel.addBlock(1, 0, 2);
    newLevel.addBlock(1, 0, 3);
    newLevel.addBlock(1, 0, 4);
    newLevel.addBlock(1, 0, 5);
    newLevel.addBlock(1, 0, 6);
    newLevel.addBlock(1, 0, 7);
    newLevel.addBlock(1, 0, 8);
    newLevel.addBlock(1, 0, 9);
    newLevel.addBlock(1, 0, 10);
    newLevel.addBlock(1, 0, 11);
    newLevel.addBlock(1, 0, 12);
    newLevel.addBlock(1, 0, 13);
    newLevel.addBlock(1, 0, 14);
    newLevel.addBlock(1, 0, 15);
    newLevel.addBlock(1, 0, 16);
    newLevel.addBlock(1, 0, 17);
    newLevel.addBlock(1, 0, 18);
    newLevel.addBlock(2, 0, 2);
    newLevel.addBlock(2, 0, 18);
    newLevel.addBlock(3, 0, 2);
    newLevel.addBlock(3, 0, 18);
    newLevel.addBlock(4, 0, 2);
    newLevel.addBlock(4, 0, 18);
    newLevel.addBlock(5, 0, 2);
    newLevel.addBlock(5, 0, 18);
    newLevel.addBlock(6, 0, 2);
    newLevel.addBlock(7, 0, 2);
    newLevel.addBlock(8, 0, 2);
    newLevel.addBlock(9, 0, 2);
    newLevel.addBlock(10, 0, 2);
    newLevel.addBlock(11, 0, 2);
    newLevel.addBlock(12, 0, 2);
    newLevel.addBlock(12, 0, 3);
    newLevel.addBlock(12, 0, 18);
    newLevel.addBlock(13, 0, 2);
    newLevel.addBlock(13, 0, 3);
    newLevel.addBlock(13, 0, 18);
    newLevel.addBlock(14, 0, 2);
    newLevel.addBlock(14, 0, 18);
    newLevel.addBlock(15, 0, 2);
    newLevel.addBlock(15, 0, 13);
    newLevel.addBlock(15, 0, 18);
    newLevel.addBlock(16, 0, 2);
    newLevel.addBlock(16, 0, 3);
    newLevel.addBlock(16, 0, 4);
    newLevel.addBlock(16, 0, 5);
    newLevel.addBlock(16, 0, 6);
    newLevel.addBlock(16, 0, 7);
    newLevel.addBlock(16, 0, 8);
    newLevel.addBlock(16, 0, 9);
    newLevel.addBlock(16, 0, 10);
    newLevel.addBlock(16, 0, 11);
    newLevel.addBlock(16, 0, 12);
    newLevel.addBlock(16, 0, 13);
    newLevel.addBlock(16, 0, 14);
    newLevel.addBlock(16, 0, 15);
    newLevel.addBlock(16, 0, 16);
    newLevel.addBlock(16, 0, 17);
    newLevel.addBlock(16, 0, 18);
    newLevel.addBlock(17, 0, 4);
    newLevel.addBlock(17, 0, 16);



    for (var ii = -5; ii < 5; ii++) {
        for (var jj = -5; jj < 5; jj++) {

            newLevel.addBlock(ii, -1, jj);

        }
    }




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

    temp = vectorLength(cameraToPoint.x, cameraToPoint.y, cameraToPoint.z);

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

function DrawTri(x1, y1, x2, y2, x3, y3, angletocamera) {
    // Shortext context handle
    var tricolor = { r: 136, g: 0, b: 0 };







    tricolor.r = (((angletocamera.angle - 1.57) / 1.57) * tricolor.r) + (300 / angletocamera.distance);
    tricolor.g = (((angletocamera.angle - 1.57) / 1.57) * tricolor.g) + (300 / angletocamera.distance);
    tricolor.b = (((angletocamera.angle - 1.57) / 1.57) * tricolor.b) + (300 / angletocamera.distance);


    //outputdiv.innerHTML += ' distance:  ' + angletocamera.distance + '    ' + tricolor.r + '<br>';

    // Set width and cap style
    context.fillStyle = 'rgb(' + Math.floor(Math.min(255, tricolor.r)) + ',' + Math.floor(Math.min(255, tricolor.g)) + ',' + Math.floor(Math.min(255, tricolor.b)) + ' )';
    context.strokeStyle = 'rgb(' + Math.floor(Math.min(255, tricolor.r)) + ',' + Math.floor(Math.min(255, tricolor.g)) + ',' + Math.floor(Math.min(255, tricolor.b)) + ' )';
    context.lineWidth = 1;
    context.lineCap = "butt";
    context.lineJoin = "round";



    // Draw from point to point
    context.beginPath();
    //context.moveTo(x1, y1);
    //context.lineTo(x2, y2);
    //context.lineTo(x3, y3);

    context.moveTo(Math.round(x1), Math.round(y1));
    context.lineTo(Math.round(x2), Math.round(y2));
    context.lineTo(Math.round(x3), Math.round(y3));

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

