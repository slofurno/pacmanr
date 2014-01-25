
var context = null;
var switchy = 1;
var outputdiv = document.getElementById('debugtext');

var debugdiv = document.getElementById('debug2');

var renderCanvas = null;
var renderContext = null;
var renderImageData = null;


var ctxdata;
var ctximage;

var CanvasWidth;
var CanvasHeight;

var BackCanvasHandle = null;
var BackContextHandle = null;


var CanvasHandle = null;
var ContextHandle = null;

var parseCanvas = document.createElement('canvas');


var parseContext = parseCanvas.getContext('2d');



var Brick = new Image();
Brick.src = 'img/furnace_top.png';


var brickheight;
var brickwidth;
var brickData

Brick.onload = function () {

    parseContext.drawImage(Brick, 0, 0);
    brickData = parseContext.getImageData(0, 0, Brick.width, Brick.height);
    brickData = brickData.data;
    brickwidth = Brick.width;
    brickheight = Brick.height;
};

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

var oldtime;

psengine.prototype.precompute = function () {

    this.cosx = Math.cos(CameraRot.x);
    this.cosy = Math.cos(CameraRot.y);
    this.cosz = Math.cos(CameraRot.z);
    this.sinx = Math.sin(CameraRot.x);
    this.siny = Math.sin(CameraRot.y);
    this.sinz = Math.sin(CameraRot.z);

}

psengine.prototype.cameratransform = function(somepoint){



    var WorkingVertex = { x: somepoint.x, y: somepoint.y, z: somepoint.z }




    var xdif = somepoint.x - CameraPos.x;
    var ydif = somepoint.y - CameraPos.y;
    var zdif = somepoint.z - CameraPos.z;


    
    WorkingVertex.x = this.cosy * (this.sinz * ydif + this.cosz * xdif) - this.siny * zdif;
    WorkingVertex.y = this.sinx * (this.cosy * zdif + this.siny * (this.sinz * ydif + this.cosz * xdif)) + this.cosx * (this.cosz * ydif - this.sinz * xdif);
    WorkingVertex.z = this.cosx * (this.cosy * zdif + this.siny * (this.sinz * ydif + this.cosz * xdif)) - this.sinx * (this.cosz * ydif - this.sinz * xdif);






    WorkingVertex.y = -WorkingVertex.y;

    


    return WorkingVertex;


};

var mouseX = 0;
var mouseY = 0;
var mycamera = new psengine();

var TextureWidth = 0;
var TextureHeight = 0;
var TextureBuffer;

var ghostModel = new Image();
ghostModel.src = 'img/pacman.PNG';

TextureHandle = document.createElement("canvas");
var brickModel = new Image();


brickModel.onload = function () {
    TextureHandle.width = brickModel.width;
    TextureHandle.height = brickModel.height;
    var TextureContext = TextureHandle.getContext('2d');
    TextureContext.drawImage(brickModel, 0, 0, brickModel.width, brickModel.height);

    
    TextureWidth = brickModel.width;
    TextureHeight = brickModel.height;
    TextureBuffer = TextureContext.getImageData(0, 0, brickModel.width, brickModel.height);
}

brickModel.src = 'img/Bricks.gif';

function KeyboardState() {

    var self = this;

    this.KEYSTATE = new Array(110);

    for (var i = 0; i < 100; i++) {

        this.KEYSTATE[i] = 0;

    }

    self.upkey = false;
    self.downkey = false;
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
    

var shadedtris = 0;
var solidtris = 0;


function levelData() {
    var self = this;
    this.wallheight = 3;
    this.wallData = new Array();
    this.wallVertex = new Array();
    this.wallFaces = new Array();
    this.wallNormal = new Array();

    this.testghost = null;



    this.blocksize = .5;

    this.CubeUVs =
[
    { a:{ u:0, v:0 }, b:{ u:0, v:1 }, c:{ u:1, v:1 } },
    { a: { u: 1, v: 1 }, b: { u: 1, v: 0 }, c: { u: 0, v: 0 }},
    { a:{ u:1, v:0 }, b:{ u:0, v:0 }, c:{ u:0, v:1 } },
    { a:{ u:0, v:1 }, b:{ u:1, v:1 }, c:{ u:1, v:0 } }]

}

function sortFunction(a, b) {

    return (a.angletocamera.distance - b.angletocamera.distance);

};

levelData.prototype.addFloor = function (x, z) {

    var nextindex = this.wallVertex.length;

    var width = 2;

    this.wallVertex.push({ x: x - width, y: -.1, z: z + width });
    this.wallVertex.push({ x: x + width, y: -.1, z: z + width });
    this.wallVertex.push({ x: x - width, y: -.1, z: z - width });
    this.wallVertex.push({ x: x + width, y: -.1, z: z - width });



    this.wallFaces.push({ a: nextindex, b: nextindex + 2, c: nextindex + 3, f:0, color: { r: 72, g: 72, b: 72 } });
    this.wallFaces.push({ a: nextindex + 3, b: nextindex + 1, c: nextindex, f:1, color: { r: 72, g: 72, b: 72 } });


};

levelData.prototype.addSegment = function (x1, z1, x2, z2) {
    var y1 = 0;
    var y2 = 3;

    //for (var i = 0; i < 3; i++) {

        //y1 = i;
        //y2 = i + 1;



        var nextindex = this.wallVertex.length;

        this.wallVertex.push({ x: x1, y: y1, z: z1 });
        this.wallVertex.push({ x: x2, y: y1, z: z2 });
        this.wallVertex.push({ x: x2, y: y2, z: z2 });
        this.wallVertex.push({ x: x1, y: y2, z: z1 });



        this.wallFaces.push({ a: nextindex + 2, b: nextindex + 1, c: nextindex, color: { r: 0, g: 140, b: 0 } });
        this.wallFaces.push({ a: nextindex, b: nextindex + 3, c: nextindex + 2, color: { r: 0, g: 140, b: 0 } });

    //}

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

    this.wallFaces.push({ a: nextindex, b: nextindex + 1, c: nextindex + 2, f:0, color: { r: 136, g: 0, b: 0 } });
    this.wallFaces.push({ a: nextindex + 2, b: nextindex + 3, c: nextindex + 0, f: 1, color: { r: 136, g: 0, b: 0 } });

    this.wallFaces.push({ a: nextindex + 1, b: nextindex + 5, c: nextindex + 6, f: 0, color: { r: 136, g: 0, b: 0 } });
    this.wallFaces.push({ a: nextindex + 6, b: nextindex + 2, c: nextindex + 1, f: 1, color: { r: 136, g: 0, b: 0 } });

    this.wallFaces.push({ a: nextindex + 5, b: nextindex + 4, c: nextindex + 7, f: 0, color: { r: 136, g: 0, b: 0 } });
    this.wallFaces.push({ a: nextindex + 7, b: nextindex + 6, c: nextindex + 5, f: 1, color: { r: 136, g: 0, b: 0 } });

    this.wallFaces.push({ a: nextindex + 4, b: nextindex + 0, c: nextindex + 3, f: 0, color: { r: 136, g: 0, b: 0 } });
    this.wallFaces.push({ a: nextindex + 3, b: nextindex + 7, c: nextindex + 4, f: 1, color: { r: 136, g: 0, b: 0 } });

    this.wallFaces.push({ a: nextindex + 3, b: nextindex + 2, c: nextindex + 6, f: 0, color: { r: 136, g: 0, b: 0 } });
    this.wallFaces.push({ a: nextindex + 6, b: nextindex + 7, c: nextindex + 3, f: 1, color: { r: 136, g: 0, b: 0 } });

    this.wallFaces.push({ a: nextindex + 5, b: nextindex + 1, c: nextindex + 0, f: 2, color: { r: 136, g: 0, b: 0 } });
    this.wallFaces.push({ a: nextindex + 0, b: nextindex + 4, c: nextindex + 5, f: 3, color: { r: 136, g: 0, b: 0 } });

    /*
     this.wallFaces.push({ a: nextindex + 0, b: nextindex + 5, c: nextindex + 1, f: 0, color: { r: 136, g: 0, b: 0 } });
    this.wallFaces.push({ a: nextindex + 0, b: nextindex + 4, c: nextindex + 5, f: 1, color: { r: 136, g: 0, b: 0 } });
    */


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

    //renderImageData = context.getImageData(0, 0, CanvasWidth, CanvasHeight);
    

    var newtime = new Date;
    var fps = 1000 / (newtime - oldtime);
    oldtime = newtime;

    outputdiv.innerHTML = 'fps : ' + fps + '   textured tris drawn :  ' + shadedtris + ' , solid tris drawn: ' + solidtris ;
    shadedtris = 0;
    solidtris = 0;

    

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

    var WorkingVertex;


    for (var i = 0; i < this.wallVertex.length; i++) {
        // The resulting vertex point we are working on
        // Note that we are creating a new object, not making a copy-reference
        WorkingVertex = { x: this.wallVertex[i].x, y: this.wallVertex[i].y, z: this.wallVertex[i].z }



       
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
            //WorkingVertex.z = .1;

            var ScreenX = (RatioConst * (WorkingVertex.x)) / (.1);
            var ScreenY = (RatioConst * (WorkingVertex.y)) / (.1);


            

        }
        else {

            var ScreenX = (RatioConst * (WorkingVertex.x)) / (WorkingVertex.z);
            var ScreenY = (RatioConst * (WorkingVertex.y)) / (WorkingVertex.z);


            

        }


        //PointList[i] = { x: CenterX + ScreenX, y: CenterY + ScreenY };
        PointList[i] = { x: CenterX + ScreenX, y: CenterY + ScreenY, z:WorkingVertex.z };

        



    }

    var orderedFaces = new Array();
    var vertexdistance = new Array();

    //TODO : rewrite array as just index dictionary and distance

    for (var i = 0; i < this.wallFaces.length; i++) {
        angletocamera = isFrontFace(this.wallVertex[this.wallFaces[i].a], this.wallVertex[this.wallFaces[i].b], this.wallVertex[this.wallFaces[i].c], 0);

        angletocamera.distance2 = Math.max(VertexList[this.wallFaces[i].a].z , VertexList[this.wallFaces[i].b].z , VertexList[this.wallFaces[i].c].z);
        //angletocamera.distance2 = Math.max(VertexList[this.wallFaces[i].a].y, VertexList[this.wallFaces[i].b].y, VertexList[this.wallFaces[i].c].y);

        //angletocamera = isFrontFace3(VertexList[this.wallFaces[i].a], VertexList[this.wallFaces[i].b], VertexList[this.wallFaces[i].c], 0);

        orderedFaces[i] = {
            a: this.wallFaces[i].a, b: this.wallFaces[i].b, c: this.wallFaces[i].c, d: angletocamera, f: this.wallFaces[i].f, color: { r: this.wallFaces[i].color.r, b: this.wallFaces[i].color.b, g: this.wallFaces[i].color.g, type: 0 }


        };

        vertexdistance[this.wallFaces[i].a] = vectorLength(VertexList[this.wallFaces[i].a].x,  VertexList[this.wallFaces[i].a].y,  VertexList[this.wallFaces[i].a].z);
        vertexdistance[this.wallFaces[i].b] = vectorLength(VertexList[this.wallFaces[i].b].x,  VertexList[this.wallFaces[i].b].y,  VertexList[this.wallFaces[i].b].z);
        vertexdistance[this.wallFaces[i].c] = vectorLength(VertexList[this.wallFaces[i].c].x,  VertexList[this.wallFaces[i].c].y,  VertexList[this.wallFaces[i].c].z);



    }

    mycamera.precompute();

    //a ghost, image, distance, position
    this.testghost = mycamera.cameratransform({ x: -2, y:1, z: 6 });
    this.testghost.type = 1;
    this.testghost.d = angletocamera;
    this.testghost.d.distance = vectorLength(this.testghost.x,this.testghost.y,this.testghost.z);
    this.testghost.d.distance2 = this.testghost.d.distance;


    orderedFaces.push(this.testghost);


    orderedFaces.sort(function (a, b) {
        return (b.d.distance - a.d.distance);
    });

    var tricolor = { r: 0, g: 0, b: 0 };

    for (var i = 0; i < orderedFaces.length; i++) {


        if (orderedFaces[i].type > 0) {

            if (orderedFaces[i].z <= 0.5) {

            }
            else {

                var ScreenXx = (RatioConst * (orderedFaces[i].x)) / (orderedFaces[i].z);
                var ScreenYy = (RatioConst * (orderedFaces[i].y)) / (orderedFaces[i].z);


                DrawSprite(CenterX + ScreenXx, CenterY + ScreenYy, ghostModel, (ghostModel.width*2) / orderedFaces[i].z, (ghostModel.height*2) / orderedFaces[i].z);

            }
        }
        else {




            //for (var i = 0; i < 24; i++) {


            //angletocamera = isFrontFace(this.wallVertex[this.wallFaces[i].a], this.wallVertex[this.wallFaces[i].b], this.wallVertex[this.wallFaces[i].c], 0);

            if ((VertexList[orderedFaces[i].a].z >= .2) || (VertexList[orderedFaces[i].b].z >= .2) || (VertexList[orderedFaces[i].c].z >= .2)) {
                //if (orderedFaces[i].d.angle >= 1.57) {  //return this AFTER

                if (orderedFaces[i].d.angle >= 1) {

                //if (1 > 0) {


                    // Find the four points we are working on
                    var PointA = PointList[orderedFaces[i].a];
                    var PointB = PointList[orderedFaces[i].b];
                    var PointC = PointList[orderedFaces[i].c];

                   

                    var UVA = this.CubeUVs[orderedFaces[i].f].a;
                    var UVB = this.CubeUVs[orderedFaces[i].f].b;
                    var UVC = this.CubeUVs[orderedFaces[i].f].c;


                    var tricolor = { r: 0, g: 0, b: 0 };
                    /*
                    var PointAColor = { r: 0, g: 0, b: 0 };
                    var PointBColor = { r: 0, g: 0, b: 0 };
                    var PointCColor = { r: 0, g: 0, b: 0 };
                    */

                    var colormulti = (14 * (orderedFaces[i].d.lightangle - 1)) / orderedFaces[i].d.lightdistance;
                 

                    /*
                    tricolor.r = Math.min(colormulti * orderedFaces[i].color.r, orderedFaces[i].color.r + 80);
                    tricolor.g = Math.min(colormulti * orderedFaces[i].color.b, orderedFaces[i].color.g + 80);
                    tricolor.b = Math.min(colormulti * orderedFaces[i].color.g, orderedFaces[i].color.b + 80);
                    */



                    /*

                    var PointAMulti = (14 * (orderedFaces[i].d.la - 1)) / orderedFaces[i].d.lda; //(vertexdistance[orderedFaces[i].a]);
                    var PointBMulti = (14 * (orderedFaces[i].d.angle - 1)) / orderedFaces[i].d.distance;//(vertexdistance[orderedFaces[i].b]);
                    var PointCMulti = (14 * (orderedFaces[i].d.angle - 1)) / orderedFaces[i].d.distance;//(vertexdistance[orderedFaces[i].c]);

                   


                    PointAColor.r = Math.min(PointAMulti * orderedFaces[i].color.r, orderedFaces[i].color.r + 80);
                    PointAColor.b = Math.min(PointAMulti * orderedFaces[i].color.b, orderedFaces[i].color.b + 80);
                    PointAColor.g = Math.min(PointAMulti * orderedFaces[i].color.g, orderedFaces[i].color.g + 80);

                    PointBColor.r = Math.min(PointBMulti * orderedFaces[i].color.r, orderedFaces[i].color.r + 80);
                    PointBColor.b = Math.min(PointBMulti * orderedFaces[i].color.b, orderedFaces[i].color.b + 80);
                    PointBColor.g = Math.min(PointBMulti * orderedFaces[i].color.g, orderedFaces[i].color.g + 80);

                    PointCColor.r = Math.min(PointCMulti * orderedFaces[i].color.r, orderedFaces[i].color.r + 80);
                    PointCColor.b = Math.min(PointCMulti * orderedFaces[i].color.b, orderedFaces[i].color.b + 80);
                    PointCColor.g = Math.min(PointCMulti * orderedFaces[i].color.g, orderedFaces[i].color.g + 80);
                    
                    */

                    

                    //DrawTri(PointA.x, PointA.y, PointB.x, PointB.y, PointC.x, PointC.y, orderedFaces[i].color);

                    if (colormulti < .1) {

                        colormulti = .1;
                    }

                    ScanlineTri3(PointA, PointB, PointC, colormulti, UVA, UVB, UVC);
              
                   


                }
            }

        }

        
    }



}


psengine.prototype.render = function () {


};












var newLevel = new levelData();
var keyboard = new KeyboardState();


var CameraPos = { x: 0, y: 8, z: -10 };


var CameraRot = { x: 0, y: 0, z: 0 };

CameraRot.x = (Math.PI / 2);


var RatioConst = 360;



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


    CanvasWidth = 400;
    CanvasHeight = 300;


    var switchy = 0;

    var pointArray = new Array();

    var temppoint = null;



    $("#myCanvas").mousemove(function (e) {

        mouseX = Math.floor(((e.pageX - this.offsetLeft) - (CanvasWidth/2))/10);
        mouseY = Math.floor(((e.pageY - this.offsetTop) - (CanvasHeight/2))/10);


    });

    $("#myCanvas").mousedown(function () {
        
        if (switchy == 0) {

            temppoint = { x: mouseX, y: mouseY };
           
            
            switchy=1;
        }
        else {

            var unitlength = {x: mouseX - temppoint.x, y: mouseY - temppoint.y};

            var len = Math.sqrt(unitlength.x * unitlength.x + unitlength.y * unitlength.y);
            unitlength.x = unitlength.x / len;
            unitlength.y = unitlength.y / len;

            //pointArray.push({ x1: temppoint.x, y1: temppoint.y, x2: temppoint.x + unitlength.x, y2: temppoint.y + unitlength.y });

            for (var i = 0; i <= len-1; i++) {
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

    function translatetoscreen(xx,yy) {

        var newpoint = {x:0, y:0};

        newpoint.x = (10* xx + (CanvasWidth / 2));
        newpoint.y = (10*yy + (CanvasHeight / 2));

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

        context.fillRect(temp.x-2,temp.y-2,4,4);

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

    //console.log("xrot : " + CameraRot.x + "    yrot : " + CameraRot.y + "zrot : " + CameraRot.z);

}

function Main() {

    var self = this;
    var mouseX = 0;
    var mouseY = 0;
    
    

    $(document).keyup(function(e){

        keyboard.setkeyup(e.which);

    });

    

    $(document).keydown(function (e) {

        keyboard.setkeydown(e.which);

        var keyid = e.which;
        

    });

    $("#myCanvas").mousemove(function (e) {

        mouseX = e.pageX - this.offsetLeft;
        mouseY = e.pageY - this.offsetTop;

        //outputdiv.innerHTML = mouseX + '   ' + mouseY;


    });



    //context = document.getElementById('myCanvas').getContext('2d');


    CanvasHandle = document.getElementById("SampleCanvas");
    context = CanvasHandle.getContext("2d");

    ContextHandle = context;

    CanvasWidth = ContextHandle.canvas.clientWidth;
    CanvasHeight = ContextHandle.canvas.clientHeight;
    

   


    for (var i = -5; i <= 5; i++) {

        for (var j = -5; j <= 5; j++) {

            if ((i == -5) ||( i == 5 )||( j == -5) ||( j == 5)) {

                newLevel.addBlock(i, 1, j);

            }

        }

    }

    newLevel.addBlock(3, 6, 3);
    newLevel.addBlock(3, 4, 3);
    newLevel.addBlock(3, 3, 3);
    newLevel.addBlock(3, 2, 3);
    newLevel.addBlock(3, 1, 3);
    newLevel.addBlock(3, 0, 3);
    
    

    for (var xc = -30; xc < 30; xc = xc + 4) {
        for (var yc = -30; yc < 30; yc = yc + 4) {


            //newLevel.addFloor(xc, yc);

        }


    }
    

   
    context.clearRect(0, 0, CanvasWidth, CanvasHeight);
    //context.fillStyle = "gray";
    //context.fillRect(0, 0, CanvasWidth, CanvasHeight);

    ctximage = context.getImageData(0, 0, CanvasWidth, CanvasHeight);

    ctxdata = ctximage.data;

    DrawScene();


};

function DrawScene() {

    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

   

    moveCamera();


    
    for (var i = 0; i < CanvasHeight*CanvasWidth*4; i+=4){
       
        ctxdata[i] = 0;
        ctxdata[i+1] = 0;
        ctxdata[i+2] = 0;
        ctxdata[i+3] = 255;

    }
    

  

    var CenterX = CanvasWidth / 2;
    var CenterY = CanvasHeight / 2;

    

    newLevel.draw();

    context.putImageData(ctximage, 0, 0);

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
    //var PointAverage = { x: (Math.min(PointA.x, PointB.x, PointC.x) + Math.max(PointA.x, PointB.x, PointC.x)) / 2, y: (Math.min(PointA.y, PointB.y, PointC.y) + Math.max(PointA.y, PointB.y, PointC.y)) / 2, z: (Math.min(PointA.z, PointB.z, PointC.z) + Math.max(PointA.z, PointB.z, PointC.z)) / 2 };

    var PointAverage = { x: (Math.min(PointA.x, PointB.x, PointC.x) + Math.max(PointA.x, PointB.x, PointC.x)) / 2, y: (Math.min(PointA.y, PointB.y, PointC.y) + Math.max(PointA.y, PointB.y, PointC.y)) / 2, z: (Math.min(PointA.z, PointB.z, PointC.z) + Math.max(PointA.z, PointB.z, PointC.z)) / 2 };

    //var PointAverage = { x: (Math.max(PointA.x + PointB.x + PointC.x) - Math.min(PointA.x + PointB.x + PointC.x)) / 2 + Math.min(PointA.x + PointB.x + PointC.x), y: (Math.max(PointA.y + PointB.y + PointC.y) - Math.min(PointA.y + PointB.y + PointC.y)) / 2 + Math.min(PointA.y + PointB.y + PointC.y), z: (Math.max(PointA.z + PointB.z + PointC.z) - Math.min(PointA.z + PointB.z + PointC.z)) / 2 + Math.min(PointA.z + PointB.z + PointC.z) };




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
 



    //var cameraToPoint = { x: CameraPos.x - PointAverage.x, y: CameraPos.y - PointAverage.y, z: CameraPos.z - PointAverage.z };
    var cameraToPoint = { x: CameraPos.x - PointAverage.x, y: CameraPos.y - PointAverage.y, z: CameraPos.z - PointAverage.z };

    var lightToPoint = { x: CameraPos.x - PointAverage.x, y: 1 - PointAverage.y, z: CameraPos.z - PointAverage.z };

    var cameraToPoint1 = { x: CameraPos.x - PointA.x, y: 1 - PointA.y, z: CameraPos.z - PointA.z };
    var cameraToPoint2 = { x: CameraPos.x - PointB.x, y: 1 - PointB.y, z: CameraPos.z - PointB.z };
    var cameraToPoint3 = { x: CameraPos.x - PointC.x, y: 1 - PointC.y, z: CameraPos.z - PointC.z };


    var lightToPoint1 = { x: CameraPos.x - PointA.x, y: 1 - PointA.y, z: CameraPos.z - PointA.z };
    var lightToPoint2 = { x: CameraPos.x - PointB.x, y: 1 - PointB.y, z: CameraPos.z - PointB.z };
    var lightToPoint3 = { x: CameraPos.x - PointC.x, y: 1 - PointC.y, z: CameraPos.z - PointC.z };

    temp = vectorLength(cameraToPoint.x, cameraToPoint.y, cameraToPoint.z);
    
    var temp4 = vectorLength(lightToPoint.x, lightToPoint.y, lightToPoint.z);

    var ld1 = vectorLength(lightToPoint1.x, lightToPoint1.y, lightToPoint1.z);
    var ld2 = vectorLength(lightToPoint2.x, lightToPoint2.y, lightToPoint2.z);
    var ld3 = vectorLength(lightToPoint3.x, lightToPoint3.y, lightToPoint3.z);


    cameraToPoint.x = cameraToPoint.x / temp;
    cameraToPoint.y = cameraToPoint.y / temp;
    cameraToPoint.z = cameraToPoint.z / temp;

    lightToPoint.x = lightToPoint.x / temp4;
    lightToPoint.y = lightToPoint.y / temp4;
    lightToPoint.z = lightToPoint.z / temp4;

    var temp1 = vectorLength(cameraToPoint1.x, cameraToPoint1.y, cameraToPoint1.z);
    var temp2 = vectorLength(cameraToPoint2.x, cameraToPoint2.y, cameraToPoint2.z);
    var temp3 = vectorLength(cameraToPoint3.x, cameraToPoint3.y, cameraToPoint3.z);

    cameraToPoint1.x = cameraToPoint1.x / temp1;
    cameraToPoint1.y = cameraToPoint1.y / temp1;
    cameraToPoint1.z = cameraToPoint1.z / temp1;

    cameraToPoint2.x = cameraToPoint2.x / temp2;
    cameraToPoint2.y = cameraToPoint2.y / temp2;
    cameraToPoint2.z = cameraToPoint2.z / temp2;

    cameraToPoint3.x = cameraToPoint3.x / temp3;
    cameraToPoint3.y = cameraToPoint3.y / temp3;
    cameraToPoint3.z = cameraToPoint3.z / temp3;

   // var temp4 = Math.max(temp1, temp2, temp3);

    //var someNumber = (cameraToPoint.x * crossPro.x + cameraToPoint.y * crossPro.y + cameraToPoint.z * crossPro.z) / (Math.sqrt(cameraToPoint.x * cameraToPoint.x + cameraToPoint.y * cameraToPoint.y + cameraToPoint.z * cameraToPoint.z) * Math.sqrt(crossPro.x * crossPro.x + crossPro.y * crossPro.y + crossPro.z * crossPro.z));

    var someNumber = (cameraToPoint.x * crossPro.x + cameraToPoint.y * crossPro.y + cameraToPoint.z * crossPro.z);

    var someNumber4 = (lightToPoint.x * crossPro.x + lightToPoint.y * crossPro.y + lightToPoint.z * crossPro.z);

    var someNumber1 = (cameraToPoint1.x * crossPro.x + cameraToPoint1.y * crossPro.y + cameraToPoint1.z * crossPro.z);
    var someNumber2 = (cameraToPoint2.x * crossPro.x + cameraToPoint2.y * crossPro.y + cameraToPoint2.z * crossPro.z);
    var someNumber3 = (cameraToPoint3.x * crossPro.x + cameraToPoint3.y * crossPro.y + cameraToPoint3.z * crossPro.z);

    var backAngle = Math.acos(someNumber);

    var lightAngle = Math.acos(someNumber4);

    var backAngle1 = Math.acos(someNumber1);
    var backAngle2 = Math.acos(someNumber2);
    var backAngle3 = Math.acos(someNumber3);


    backAngle /= Math.PI / 2;

    backAngle1 /= Math.PI / 2;
    backAngle2 /= Math.PI / 2;
    backAngle3 /= Math.PI / 2;

    lightAngle /= Math.PI/2;

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

    //var temp4 = (temp1 + temp2 + temp3) / 3;

    return { angle: backAngle, distance: temp, a1: backAngle1, a2: backAngle2, a3: backAngle3, lda : ld1, ldb:ld2, ldc:ld3, lightdistance : temp4, lightangle:lightAngle };
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




function DrawSprite(x, y, image, width, height) {

    context.drawImage(image, x - width / 2, y - height / 2, width, height);

};

function TextureTri() {




}

function DrawLineGrad(xstart, xend, colorstart, colorend) {


}

function ScanlineTri(PointA, PointB, PointC, ColorA, ColorB, ColorC) {

    var outputtext = '';

    //var wtf = { r: ColorA.r, g: ColorA.g, b: ColorA.b };
    shadedtris++;
    

    var skipline = 1;


    var tempPoint = null;

    var pointList = new Array();
    /*
    pointList[0] = { x: PointA.x, y: PointA.y, color: { r: ColorA.r, g: ColorA.g, b: ColorA.b } }; //TOP
    pointList[1] = { x: PointB.x, y: PointB.y, color: { r: ColorB.r, g: ColorB.g, b: ColorB.b } }; //MID
    pointList[2] = { x: PointC.x, y: PointC.y, color: { r: ColorC.r, g: ColorC.g, b: ColorC.b } }; //BOT
    */

    pointList[0] = { x: PointA.x, y: PointA.y, color: { r: ColorA.r, g: ColorA.g, b: ColorA.b } }; //TOP
    pointList[1] = { x: PointB.x, y: PointB.y, color: { r: ColorB.r, g: ColorB.g, b: ColorB.b } }; //MID
    pointList[2] = { x: PointC.x, y: PointC.y, color: { r: ColorC.r, g: ColorC.g, b: ColorC.b } }; //BOT


    if (pointList[1].y < pointList[0].y) {
        tempPoint = pointList[0];
        pointList[0] = pointList[1];
        pointList[1] = tempPoint;

    }

    if (pointList[2].y < pointList[0].y) {
        tempPoint = pointList[0];
        pointList[0] = pointList[2];
        pointList[2] = tempPoint;

    }
   
    if (pointList[2].y < pointList[1].y) {
        tempPoint = pointList[1];
        pointList[1] = pointList[2];
        pointList[2] = tempPoint;

    }


    

    


    var TopY = pointList[0].y;
    var BottomY = pointList[2].y;

    var Edges = [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 1, b: 2 }];
    var Intercepts = new Array();
    var Slopes = new Array();
    var ShadeSlope = new Array();


    for (var i = 0; i < 3; i++) {

        
        if (Math.floor(pointList[Edges[i].a].x + .5) == Math.floor(pointList[Edges[i].b].x + .5)) {

            Slopes[i] = 9999;
            Intercepts[i] = pointList[Edges[i].a].x;

        }
        else {

            
            Slopes[i] = (pointList[Edges[i].b].y - pointList[Edges[i].a].y) / (pointList[Edges[i].b].x - pointList[Edges[i].a].x);
            Intercepts[i] = pointList[Edges[i].a].y - Slopes[i] * pointList[Edges[i].a].x;
        }

        
        

        var colorchange = { r: pointList[Edges[i].b].color.r - pointList[Edges[i].a].color.r, b: pointList[Edges[i].b].color.b - pointList[Edges[i].a].color.b, g: pointList[Edges[i].b].color.g - pointList[Edges[i].a].color.g };

        if (pointList[Edges[i].b].y - pointList[Edges[i].a].y < 1) {

            ShadeSlope[i] = new color(0, 0, 0, 255);

        }
        else {
            colorchange.r = colorchange.r / (pointList[Edges[i].b].y - pointList[Edges[i].a].y);
            colorchange.g = colorchange.g / (pointList[Edges[i].b].y - pointList[Edges[i].a].y);
            colorchange.b = colorchange.b / (pointList[Edges[i].b].y - pointList[Edges[i].a].y);

            ShadeSlope[i] = colorchange;
        }


    }

    context.lineWidth = 0;
    context.lineCap = "butt";
    context.lineJoin = "round";

    // For each horizontal line..

    

    for (var y = TopY; y <= BottomY; y=y+skipline) {
        // Find our min x and max x (default to out of bounds to begin with)
        var MinX = 2000;
        var MaxX = -1;
        var LeftShade = new color(0, 0, 0, 255);
        var RightShade = new color(0, 0, 0, 255);

        // For each edge
        for (var i = 0; i < 3; i++) {
            // Find the edge vertices (-1 because our arrays start at 0)
            var a = Edges[i].a;
            var b = Edges[i].b;

            // If we are in the range of this line, find the min/max
            if (y >= pointList[a].y && y <= pointList[b].y) {
                // Compute the horizontal intersection

                if (Slopes[i] == 9999) {

                    var x = Intercepts[i];

                }
                else {

                    var x = (y - Intercepts[i]) / Slopes[i];

                }
                // Save if new min or max values

                if (x < MinX) {
                    MinX = x;
                    /*
                    LeftShade.r = pointList[a].color.r - (pointList[a].color.r - pointList[b].color.r)*((pointList[a].y - y)/(pointList[a].y-pointList[b].y));
                    LeftShade.g = pointList[a].color.g - (pointList[a].color.g - pointList[b].color.g) * ((pointList[a].y - y) / (pointList[a].y - pointList[b].y));
                    LeftShade.b = pointList[a].color.b - (pointList[a].color.b - pointList[b].color.b) * ((pointList[a].y - y) / (pointList[a].y - pointList[b].y));


                    
                    la = l1 - (l1 - l2) * (y1 - ys) / (y1 - y2)
                    */
                    LeftShade.r = pointList[a].color.r + ShadeSlope[i].r * (y - pointList[a].y);
                    LeftShade.g = pointList[a].color.g + ShadeSlope[i].g * (y - pointList[a].y);
                    LeftShade.b = pointList[a].color.b + ShadeSlope[i].b * (y - pointList[a].y);
                    

                }
                if (x > MaxX) {
                    MaxX = x;

                    
                    RightShade.r = pointList[a].color.r + ShadeSlope[i].r * (y - pointList[a].y);
                    RightShade.g = pointList[a].color.g + ShadeSlope[i].g * (y - pointList[a].y);
                    RightShade.b = pointList[a].color.b + ShadeSlope[i].b * (y - pointList[a].y);
                    
                    /*
                    RightShade.r = pointList[a].color.r - (pointList[a].color.r - pointList[b].color.r) * ((pointList[a].y - y) / (pointList[a].y - pointList[b].y));
                    RightShade.g = pointList[a].color.g - (pointList[a].color.g - pointList[b].color.g) * ((pointList[a].y - y) / (pointList[a].y - pointList[b].y));
                    RightShade.b = pointList[a].color.b - (pointList[a].color.b - pointList[b].color.b) * ((pointList[a].y - y) / (pointList[a].y - pointList[b].y));
                    */

                }

                //MinX = Math.min(MinX, x);
                //MaxX = Math.max(MaxX, x);
            }
        }

        if (MaxX <= MinX) {

            //nothing
        }
        else {


 

            //MaxX = Math.floor(MaxX);
            //MinX = Math.floor(MinX);




            var ColorGrad = new color(0, 0, 0, 255);

            ColorGrad.r = (RightShade.r - LeftShade.r) / (MaxX - MinX);
            ColorGrad.g = (RightShade.g - LeftShade.g) / (MaxX - MinX);
            ColorGrad.b = (RightShade.b - LeftShade.b) / (MaxX - MinX);

            var frac = 0;

            var tempcolor = new color(0, 0, 0, 255);

            tempcolor.r = LeftShade.r;
            tempcolor.g = LeftShade.g;
            tempcolor.b = LeftShade.b;
            // Fill each pixel, using a line, for the given color





            context.lineWidth = skipline + 2;

            //outputdiv.innerHTML += wtf.r + '  ' + '<br>';


            /*
            var my_gradient = context.createLinearGradient(Math.floor(MinX-1), 0, Math.floor(MaxX+1), 0);
            my_gradient.addColorStop(0, 'rgb(' + Math.floor(LeftShade.r) + ',' + Math.floor(LeftShade.g) + ',' + Math.floor(LeftShade.b) + ' )');
            my_gradient.addColorStop(1, 'rgb(' + Math.floor(RightShade.r) + ',' + Math.floor(RightShade.g) + ',' + Math.floor(RightShade.b) + ' )');

            context.strokeStyle = my_gradient;
            
            //context.strokeStyle = 'rgb(' + Math.floor(LeftShade.r) + ',' + Math.floor(LeftShade.g) + ',' + Math.floor(LeftShade.b) + ' )';

            context.beginPath();
            context.moveTo(Math.floor(MinX-1), Math.floor(y+1.5));
            context.lineTo(Math.floor(MaxX+1), Math.floor(y+1.5 ));
            context.stroke();

            */




            //outputtext += 'MIN:  ' + MinX + '  ' + 'MAX:  ' + MaxX + '  colors:  ' + tempcolor.r + '  ' + tempcolor.g + '  ' + tempcolor.b + '<BR>  ';




            
            for (var fuckme = MinX; fuckme <= MaxX ; fuckme++) {
                
                //context.strokeStyle = 'rgb(' + Math.floor(LeftShade.r + ColorGrad.r * (xi - MinX)) + ',' + Math.floor(LeftShade.g + ColorGrad.g * (xi - MinX)) + ',' + Math.floor(LeftShade.b + ColorGrad.b * (xi - MinX)) + ' )';
                if (fuckme < 0) {
                    //MinX = 0;

                }
                else if (fuckme > CanvasWidth) {
                    //MaxX = CanvasWidth;

                }
                else {



                    setPixel(fuckme, y, tempcolor);
                }
                tempcolor.r += ColorGrad.r;
                tempcolor.g += ColorGrad.g;
                tempcolor.b += ColorGrad.b;


            }
            






        }
    }
    //context.restore();
   


    //debugdiv.innerHTML += outputtext;

}

function createCanvas(width, height) {
    var canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}

function color(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
}

function setPixel(x, y, c, intensity) {

    x = Math.floor(x);
    y = Math.floor(y);

    var index = (x + y * CanvasWidth) * 4;
    ctxdata[index + 0] = Math.floor(Math.min(c.r*intensity, 1.2*c.r));//color.r;
    ctxdata[index + 1] = Math.floor(Math.min(c.b*intensity, 1.2*c.g));//color.g;
    ctxdata[index + 2] = Math.floor(Math.min(c.g*intensity, 1.2*c.b));//color.b;
    //ctxdata[index + 3] = 255;//color.a;
}

function interpolateColors2(f, color1, color2) {
    var r = color1.r + ((color2.r - color1.r) * f);
    var g = color1.g + ((color2.g - color1.g) * f);
    var b = color1.b + ((color2.b - color1.b) * f);
    return new color(r, g, b, 255);
}


function DrawTri(x1, y1, x2, y2, x3, y3, tricolor) {
    // Shortext context handle
    //var tricolor = { r: 72, g: 72, b: 72 };

    solidtris++;


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

  

};








function ScanlineTri2(x1, y1, x2, y2, x3, y3, ColorA, ColorB, ColorC) { //scanlinetri2



    //var wtf = { r: ColorA.r, g: ColorA.g, b: ColorA.b };
    shadedtris++;


    var skipline = 1;


    var tempPoint = null;

    var pointList = new Array();
    /*
    pointList[0] = { x: PointA.x, y: PointA.y, color: { r: ColorA.r, g: ColorA.g, b: ColorA.b } }; //TOP
    pointList[1] = { x: PointB.x, y: PointB.y, color: { r: ColorB.r, g: ColorB.g, b: ColorB.b } }; //MID
    pointList[2] = { x: PointC.x, y: PointC.y, color: { r: ColorC.r, g: ColorC.g, b: ColorC.b } }; //BOT
    */

    pointList[0] = { x: Math.floor(x1), y: Math.floor(y1), color: { r: ColorA.r, g: ColorA.g, b: ColorA.b } }; //TOP
    pointList[1] = { x: Math.floor(x2), y: Math.floor(y2), color: { r: ColorB.r, g: ColorB.g, b: ColorB.b } }; //MID
    pointList[2] = { x: Math.floor(x3), y: Math.floor(y3), color: { r: ColorC.r, g: ColorC.g, b: ColorC.b } }; //BOT


    if (pointList[1].y < pointList[0].y) {
        tempPoint = pointList[0];
        pointList[0] = pointList[1];
        pointList[1] = tempPoint;

    }

    if (pointList[2].y < pointList[0].y) {
        tempPoint = pointList[0];
        pointList[0] = pointList[2];
        pointList[2] = tempPoint;

    }

    if (pointList[2].y < pointList[1].y) {
        tempPoint = pointList[1];
        pointList[1] = pointList[2];
        pointList[2] = tempPoint;

    }







    var TopY = pointList[0].y;
    var BottomY = pointList[2].y;

    var Edges = [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 1, b: 2 }];
    var Intercepts = new Array();
    var Slopes = new Array();
    var ShadeSlope = new Array();


    for (var i = 0; i < 3; i++) {


        if (pointList[Edges[i].a].x == pointList[Edges[i].b].x) {

            Slopes[i] = 9999;
            Intercepts[i] = pointList[Edges[i].a].x;

        }
        else {


            Slopes[i] = (pointList[Edges[i].b].y - pointList[Edges[i].a].y) / (pointList[Edges[i].b].x - pointList[Edges[i].a].x);
            Intercepts[i] = pointList[Edges[i].a].y - Slopes[i] * pointList[Edges[i].a].x;
        }




        var colorchange = { r: pointList[Edges[i].b].color.r - pointList[Edges[i].a].color.r, b: pointList[Edges[i].b].color.b - pointList[Edges[i].a].color.b, g: pointList[Edges[i].b].color.g - pointList[Edges[i].a].color.g };
        
        if (pointList[Edges[i].b].y - pointList[Edges[i].a].y < 1) {

            ShadeSlope[i] = new color(0, 0, 0, 255);

        }
        else {
            colorchange.r = colorchange.r / (pointList[Edges[i].b].y - pointList[Edges[i].a].y);
            colorchange.g = colorchange.g / (pointList[Edges[i].b].y - pointList[Edges[i].a].y);
            colorchange.b = colorchange.b / (pointList[Edges[i].b].y - pointList[Edges[i].a].y);

            ShadeSlope[i] = colorchange;
        }
        


    }

    if (BottomY > CanvasHeight) {
        BottomY = CanvasHeight;
    }
    if (TopY < 0) {
        TopY = 0;
    }
    

    for (var y = TopY; y < BottomY; y++) {
        
        var MinX = 2000;
        var MaxX = -1;
        var LeftShade = new color(0, 0, 0, 255);
        var RightShade = new color(0, 0, 0, 255);

        // For each edge
        for (var i = 0; i < 3; i++) {
            
            var a = Edges[i].a;
            var b = Edges[i].b;

            // If we are in the range of this line, find the min/max
            if (y > pointList[a].y && y < pointList[b].y) {
                

                if (Slopes[i] == 9999) {

                    var x = Intercepts[i];

                }
                else {

                    var x = (y - Intercepts[i]) / Slopes[i];

                }
                

                if (x < MinX) {
                    MinX = x;


                    
                    LeftShade.r = pointList[a].color.r + ShadeSlope[i].r * (y - pointList[a].y);
                    LeftShade.g = pointList[a].color.g + ShadeSlope[i].g * (y - pointList[a].y);
                    LeftShade.b = pointList[a].color.b + ShadeSlope[i].b * (y - pointList[a].y);
                    

                }
                if (x > MaxX) {
                    MaxX = x;

                    

                    RightShade.r = pointList[a].color.r + ShadeSlope[i].r * (y - pointList[a].y);
                    RightShade.g = pointList[a].color.g + ShadeSlope[i].g * (y - pointList[a].y);
                    RightShade.b = pointList[a].color.b + ShadeSlope[i].b * (y - pointList[a].y);
                    


                }

               
            }
        }

        if (MaxX < MinX) {

            //nothing
        }
        else {




       



            
            var ColorGrad = new color(0, 0, 0, 255);

            ColorGrad.r = (RightShade.r - LeftShade.r) / (MaxX - MinX);
            ColorGrad.g = (RightShade.g - LeftShade.g) / (MaxX - MinX);
            ColorGrad.b = (RightShade.b - LeftShade.b) / (MaxX - MinX);

            var frac = 0;

            var tempcolor = new color(0, 0, 0, 255);

            tempcolor.r = LeftShade.r;
            tempcolor.g = LeftShade.g;
            tempcolor.b = LeftShade.b;
            





            context.lineWidth = skipline + 2;
            


            //outputdiv.innerHTML += wtf.r + '  ' + '<br>';


            /*
            var my_gradient = context.createLinearGradient(Math.floor(MinX-1), 0, Math.floor(MaxX+1), 0);
            my_gradient.addColorStop(0, 'rgb(' + Math.floor(LeftShade.r) + ',' + Math.floor(LeftShade.g) + ',' + Math.floor(LeftShade.b) + ' )');
            my_gradient.addColorStop(1, 'rgb(' + Math.floor(RightShade.r) + ',' + Math.floor(RightShade.g) + ',' + Math.floor(RightShade.b) + ' )');

            context.strokeStyle = my_gradient;
            
            //context.strokeStyle = 'rgb(' + Math.floor(LeftShade.r) + ',' + Math.floor(LeftShade.g) + ',' + Math.floor(LeftShade.b) + ' )';

            context.beginPath();
            context.moveTo(Math.floor(MinX-1), Math.floor(y+1.5));
            context.lineTo(Math.floor(MaxX+1), Math.floor(y+1.5 ));
            context.stroke();

            */




            //outputtext += 'MIN:  ' + MinX + '  ' + 'MAX:  ' + MaxX + '  colors:  ' + tempcolor.r + '  ' + tempcolor.g + '  ' + tempcolor.b + '<BR>  ';





            for (var currentx = MinX; currentx < MaxX ; currentx++) {

                //context.strokeStyle = 'rgb(' + Math.floor(LeftShade.r + ColorGrad.r * (xi - MinX)) + ',' + Math.floor(LeftShade.g + ColorGrad.g * (xi - MinX)) + ',' + Math.floor(LeftShade.b + ColorGrad.b * (xi - MinX)) + ' )';
                if (currentx < 0) {
                    //MinX = 0;

                }
                else if (currentx > CanvasWidth) {
                    //MaxX = CanvasWidth;

                }
                else {



                    setPixel(currentx, y, tempcolor);
                }
                tempcolor.r += ColorGrad.r;
                tempcolor.g += ColorGrad.g;
                tempcolor.b += ColorGrad.b;


            }







        }
    }
    //context.restore();



    //debugdiv.innerHTML += outputtext;

}


function ScanlineTri3(PointA, PointB, PointC, ColorA, UVA, UVB, UVC) { //scanlinetri3



    
    shadedtris++;


    var skipline = 1;


    var tempPoint = null;

    var pointList = new Array();
    /*
        pointList[0] = { x: x1, y:y1 }; //TOP
    pointList[1] = { x: x2, y: y2 }; //MID
    pointList[2] = { x: x3, y: y3 }; //BOT
    */


    pointList[0] = { x: Math.floor(PointA.x), y: Math.floor(PointA.y), z: 1 / PointA.z, su: UVA.u / PointA.z, sv: UVA.v / PointA.z }; //TOP
    pointList[1] = { x: Math.floor(PointB.x), y: Math.floor(PointB.y), z: 1 / PointB.z, su: UVB.u / PointB.z, sv: UVB.v / PointB.z }; //MID
    pointList[2] = { x: Math.floor(PointC.x), y: Math.floor(PointC.y), z: 1 / PointC.z, su: UVC.u / PointC.z, sv: UVC.v / PointC.z }; //BOT

    if (pointList[1].y < pointList[0].y) {
        tempPoint = pointList[0];
        pointList[0] = pointList[1];
        pointList[1] = tempPoint;

    }

    if (pointList[2].y < pointList[0].y) {
        tempPoint = pointList[0];
        pointList[0] = pointList[2];
        pointList[2] = tempPoint;

    }

    if (pointList[2].y < pointList[1].y) {
        tempPoint = pointList[1];
        pointList[1] = pointList[2];
        pointList[2] = tempPoint;

    }







    var TopY = pointList[0].y;
    var BottomY = pointList[2].y;

    var Edges = [{ a: 0, b: 1 }, { a: 0, b: 2 }, { a: 1, b: 2 }];
    var Intercepts = new Array();
    var Slopes = new Array();
    var ShadeSlope = new Array();
    var TextureGrad = new Array();
    var TextureIntercept;

    for (var i = 0; i < 3; i++) {


        if (pointList[Edges[i].a].x == pointList[Edges[i].b].x) {

            Slopes[i] = 9999;
            Intercepts[i] = pointList[Edges[i].a].x;

        }
        else {

            Slopes[i] = (pointList[Edges[i].b].y - pointList[Edges[i].a].y) / (pointList[Edges[i].b].x - pointList[Edges[i].a].x);
            Intercepts[i] = pointList[Edges[i].a].y - Slopes[i] * pointList[Edges[i].a].x;
        }

        
        if (pointList[Edges[i].a].y == pointList[Edges[i].b].y) {
            TextureGrad[i] = {du:0,dv:0,dz:0};


        }
        else {

            TextureGrad[i] = { du: (pointList[Edges[i].b].su - pointList[Edges[i].a].su) / (pointList[Edges[i].b].y - pointList[Edges[i].a].y), dv: (pointList[Edges[i].b].sv - pointList[Edges[i].a].sv) / (pointList[Edges[i].b].y - pointList[Edges[i].a].y), dz: (pointList[Edges[i].b].z - pointList[Edges[i].a].z) / (pointList[Edges[i].b].y - pointList[Edges[i].a].y), };

        }
        


    }

    if (BottomY > CanvasHeight) {
        BottomY = CanvasHeight;
    }
    if (TopY < 0) {
        TopY = 0;
    }

    var LeftTexture = {u:0,v:0,z:0};
    var RightTexture = {u:0,v:0,z:0};


    for (var y = TopY; y <= BottomY; y++) {
        
        var MinX = 2000;
        var MaxX = -1;
  

        // For each edge
        for (var i = 0; i < 3; i++) {
            
            var a = Edges[i].a;
            var b = Edges[i].b;

            // If we are in the range of this line, find the min/max
            if (y >= pointList[a].y && y <= pointList[b].y) {
                

                if (Slopes[i] == 9999) {

                    var x = Intercepts[i];
                    
                }
                else {

                    var x = (y - Intercepts[i]) / Slopes[i];

                }
                

                if (x < MinX) {
                    MinX = x;

                    LeftTexture.u = pointList[a].su + TextureGrad[i].du * (y - pointList[a].y);
                    LeftTexture.v = pointList[a].sv + TextureGrad[i].dv * (y - pointList[a].y);
                    LeftTexture.z = pointList[a].z + TextureGrad[i].dz * (y - pointList[a].y);


                    



                }
                if (x > MaxX) {
                    MaxX = x;


                    RightTexture.u = pointList[a].su + TextureGrad[i].du * (y - pointList[a].y);
                    RightTexture.v = pointList[a].sv + TextureGrad[i].dv * (y - pointList[a].y);
                    RightTexture.z = pointList[a].z + TextureGrad[i].dz * (y - pointList[a].y);


                }

               
            }
        }

        if (MaxX < MinX) {

            //nothing
        }
        else {


            var TextureGrad2 = {du:0,dv:0,dz:0};

            TextureGrad2.du = (RightTexture.u - LeftTexture.u) / (MaxX - MinX);
            TextureGrad2.dv = (RightTexture.v - LeftTexture.v) / (MaxX - MinX);
            TextureGrad2.dz = (RightTexture.z - LeftTexture.z) / (MaxX - MinX);

            

            var temptex = {su:0,sv:0,sz:0};

            temptex.su = LeftTexture.u;
            temptex.sv = LeftTexture.v;
            temptex.sz = LeftTexture.z;


            var uindex;
            var vindex;

            for (var writex = MinX; writex < MaxX ; writex++) {

                //context.strokeStyle = 'rgb(' + Math.floor(LeftShade.r + ColorGrad.r * (xi - MinX)) + ',' + Math.floor(LeftShade.g + ColorGrad.g * (xi - MinX)) + ',' + Math.floor(LeftShade.b + ColorGrad.b * (xi - MinX)) + ' )';
                if (writex < 0) {
                    //MinX = 0;

                }
                else if (writex > CanvasWidth) {
                    //MaxX = CanvasWidth;

                }
                else {


                    uindex = temptex.su / temptex.sz;
                    vindex = temptex.sv / temptex.sz;




                    setPixel(writex, y, getPixel(uindex,vindex), ColorA);
                }
              
                temptex.su += TextureGrad2.du;
                temptex.sv += TextureGrad2.dv;
                temptex.sz += TextureGrad2.dz;

            }







        }
    }
    //context.restore();



    //debugdiv.innerHTML += outputtext;

}



function getPixel(u, v) {

    

    var x = Math.floor(u * brickwidth);
    var y = Math.floor(v * brickheight);

    //console.log("x :  " + x + "  y : " + y);

    var index = (y*brickwidth+x)*4;

    var color = { r: brickData[index], g: brickData[index + 1], b: brickData[index + 2], a: 255 };

    return color;



}