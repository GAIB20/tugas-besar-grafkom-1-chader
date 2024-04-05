import { drawScene } from "../main.js";
import { chaderUI, TransformationCallbacks } from "../ui.js";
import { matrixTransformer } from "../utils/chaderM3.js";
import { Geometry, GeometryOption, GeometryType } from "./geometry.js";

interface SquareParams {
    x : number, 
    y : number,
    sideLength : number, 
}

export const SquareOption : GeometryOption = {
    getGeometryType() {
        return GeometryType.SQUARE;
    },

    getShapeName() {
        return "Square";
    },

    onPrepareObject() {
        
    },

    onUnprepareObject() {

    },
}

export class Square extends Geometry<SquareParams> {
    public x : number;
    public y : number;
    public sideLength : number;

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

    constructor(gl : WebGL2RenderingContext, program : WebGLProgram, posAttribLocation : number, colorAttribLocation : number, params : SquareParams) {
        super(gl, program, posAttribLocation, colorAttribLocation);
        const { x, y, sideLength } = params;
        this.x = x;
        this.y = y;
        this.sideLength = sideLength;
    }

    setGeometry(gl : WebGL2RenderingContext) : void {
        const halfSideLength = this.sideLength / 2;

        const x1 = this.x - halfSideLength;
        const x2 = this.x + halfSideLength;
        const y1 = this.y - halfSideLength;
        const y2 = this.y + halfSideLength;

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1, 0.576, 0.847, 0.890,
            x2, y1, 0.576, 0.847, 0.890,
            x1, y2, 0.576, 0.847, 0.890,
            x1, y2, 0.576, 0.847, 0.890,
            x2, y1, 0.576, 0.847, 0.890,
            x2, y2, 0.576, 0.847, 0.890,
        ]), gl.STATIC_DRAW);
    }

    drawGeometry() : void {
        // Use the this.program
        this.gl.useProgram(this.program);

        // Tell the attribute how to get data out of the buffer
        this.gl.enableVertexAttribArray(this.posAttribLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);

        var size = 2;
        var type = this.gl.FLOAT;
        var normalize = false;
        var stride = 5 * Float32Array.BYTES_PER_ELEMENT;
        var offset = 0;
        this.gl.vertexAttribPointer(this.posAttribLocation, size, type, normalize, stride, offset);

        // Tell the attribute how to get data out of the buffer
        this.gl.enableVertexAttribArray(this.colorAttribLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);

        size = 3;
        offset = 2 * Float32Array.BYTES_PER_ELEMENT;
        this.gl.vertexAttribPointer(this.colorAttribLocation, size, type, normalize, stride, offset);

        // Compute matrix
        var matrix = matrixTransformer.identity();

        matrix = matrixTransformer.translate(matrix, this.translation[0], this.translation[1]);
        matrix = matrixTransformer.rotate(matrix, this.angleInRadians);
        matrix = matrixTransformer.scale(matrix, this.scale[0], this.scale[1]);

        // Uniforms
        const resolutionUniformLocation = this.gl.getUniformLocation(this.program, 'u_Resolution');
        this.gl.uniform2f(resolutionUniformLocation, this.gl.canvas.width, this.gl.canvas.height);

        const matrixUniformLocation = this.gl.getUniformLocation(this.program, 'u_Matrix');
        this.gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);

        this.setGeometry(this.gl);

        // Draw the rectanthis.gle
        var primitiveType = this.gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        this.gl.drawArrays(primitiveType, offset, count);
    }

    onObjectSelected(): void {
        const shapeControlGroup = document.createElement("div");
        shapeControlGroup.id = "shape-control-group";
        shapeControlGroup.className = "control-group";

        const controls = document.getElementById("controls");
        controls?.appendChild(shapeControlGroup);

        chaderUI.setHeader("Square Properties", "shape-control-group");
        chaderUI.setupSlider("ssl", "Side Length", { min: 0, max: 30, step: 0.01, value: this.sideLength, slide : (value) => {
            this.sideLength = value;
            drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
        }}, "shape-control-group");

        chaderUI.setupTrasformControls(this.callbacks);
    }

    onObjectDeselected(): void {
        const shapeControlGroup = document.getElementById("shape-control-group");
        shapeControlGroup?.remove();

        chaderUI.cleanTransformControls();
    }
}