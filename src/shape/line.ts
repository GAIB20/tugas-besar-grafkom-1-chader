import { drawScene } from "../main.js";
import { chaderUI, TransformationCallbacks } from "../ui.js";
import { matrixTransformer } from "../utils/chaderM3.js";
import { Geometry, GeometryOption, GeometryType } from "./geometry.js";


interface LineParams {
    x1 : number,
    y1 : number,
    x2 : number,
    y2 : number
}

export const LineOption : GeometryOption = {
    getGeometryType() {
        return GeometryType.LINE;
    },

    onPrepareObject() {
        
    },

    onUnprepareObject() {

    },
}

export class Line extends Geometry<LineParams> {
    public x1 : number;
    public y1 : number;
    public x2 : number;
    public y2 : number;

    public callbacks : TransformationCallbacks = {
        onTranslateX: (value) => {
            this.translation[0] = value;
            drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
        },
        onTranslateY: (value) => {
            this.translation[1] = value;
            drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
        },
        onScaleX: (value) => {
            this.scale[0] = value;
            drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
        },
        onScaleY: (value) => {
            this.scale[1] = value;
            drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
        },
        onRotate: (value) => {
            const radians = value * Math.PI / 180;
            this.angleInRadians = radians;
            drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
        }
    }

    constructor(gl : WebGL2RenderingContext, program : WebGLProgram, posAttribLocation : number, colorAttribLocation : number, params : LineParams) {
        super(gl, program, posAttribLocation, colorAttribLocation, GeometryType.LINE);
        this.x1 = params.x1;
        this.y1 = params.y1;
        this.x2 = params.x2;
        this.y2 = params.y2;
    }

    setGeometry(gl : WebGL2RenderingContext) : void {
        console.log(this.x1, this.y1, this.x2, this.y2);

        // gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        //     this.x1, this.y1, 0.576, 0.858, 0.439,
        //     this.x2, this.y2, 0.576, 0.858, 0.439
        // ]), gl.STATIC_DRAW);

        const vertices = [
            this.x1, this.y1, 0.576, 0.858, 0.439,
            this.x2, this.y2, 0.576, 0.858, 0.439
        ]

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        const indices = [
         0,1
        ]

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);

    }

    drawGeometry() : void {
        this.gl.useProgram(this.program);

        this.gl.enableVertexAttribArray(this.posAttribLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);

        var size = 2;          
        var type = this.gl.FLOAT;
        var normalize = false;
        var stride = 5 * Float32Array.BYTES_PER_ELEMENT;
        var offset = 0;
        this.gl.vertexAttribPointer(this.posAttribLocation, size, type, normalize, stride, offset);
        console.log("Attribute")
        console.log(this.posAttribLocation);
        console.log(this.colorAttribLocation)
        this.gl.enableVertexAttribArray(this.colorAttribLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);

        size = 3;
        offset = 2 * Float32Array.BYTES_PER_ELEMENT;
        this.gl.vertexAttribPointer(this.colorAttribLocation, size, type, normalize, stride, offset);

        var matrix = matrixTransformer.identity();

        matrix = matrixTransformer.translate(matrix, this.translation[0], this.translation[1]);
        matrix = matrixTransformer.rotate(matrix, this.angleInRadians);
        matrix = matrixTransformer.scale(matrix, this.scale[0], this.scale[1]);

        const resolutionUniformLocation = this.gl.getUniformLocation(this.program, "u_Resolution");
        this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);

        const matrixUniformLocation = this.gl.getUniformLocation(this.program, "u_Matrix");
        this.gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);

        this.setGeometry(this.gl);

        var primitiveType = this.gl.LINES;
        var offset = 0;
        var count = 2;  
        this.gl.drawElements(primitiveType, count, this.gl.UNSIGNED_SHORT, 0);
    }

    onObjectSelected(): void {
        const shapeControlGroup = document.createElement("div");
        shapeControlGroup.id = "shape-control-group";
        shapeControlGroup.className = "shape-control-group";

        const controls = document.getElementById('controls');
        controls?.appendChild(shapeControlGroup);

        chaderUI.setHeader('Line Properties', 'shape-control-group');
        // chaderUI.setupSlider('point1_length', 'Point 1 Length', {
        //     min: -30,
        //     max: 30,
        //     value: 0,
        //     step: 1,
        //     slide: (value) => {
        //         this.x1 = this.x1 + value;
        //         this.y1 = this.y1 + value;
        //         drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
        //         console.log(this.x1, this.y1);
        //     }
        // }, 'shape-control-group');

        // chaderUI.setupSlider('point2_length', 'Point 2 Length', {
        //     min: -30,
        //     max: 30,
        //     value: 0,
        //     step: 1,
        //     slide: (value) => {
        //         this.x2 = this.x2 + value;
        //         this.y2 = this.y2 + value;
        //         drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
        //         console.log(this.x2, this.y2);
        //     }}, 'shape-control-group');

        chaderUI.setupTrasformControls(this.callbacks);
    }

    onObjectDeselected(): void {
        const shapeControlGroup = document.getElementById('shape-control-group');
        shapeControlGroup?.remove();
        
        chaderUI.cleanTransformControls();
    }

    calcVertexLocations(): void {
        // TODO: Implement this
    }

    onVertexMoved(index: number, deltaX: number, deltaY: number): void {
        // TODO : Implement this        
    }
}
 