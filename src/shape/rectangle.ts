import { drawScene, resizeCanvasToDisplaySize } from "../main.js";
import { chaderUI, TransformationCallbacks } from "../ui.js";
import { matrixTransformer } from "../utils/chaderM3.js";
import { Geometry, GeometryOption, GeometryType } from "./geometry.js";

interface RectangleParams {
    x : number, 
    y : number,
    width : number, 
    height : number
}

export const RectangleOption : GeometryOption = {
    getGeometryType() {
        return GeometryType.RECTANGLE;
    },

    getShapeName() {
        return "Rectangle";
    },

    onPrepareObject() {
        
    },

    onUnprepareObject() {

    },
}

export class Rectangle extends Geometry<RectangleParams> {
    public x : number;
    public y : number;
    public width : number;
    public height : number;

    public callbacks : TransformationCallbacks = {
        onTranslateX: (value) => {
            this.translation[0] = value;
            drawScene(this.gl, this.program, this.posAttribLocation);
        },
        onTranslateY: (value) => {
            this.translation[1] = value;
            drawScene(this.gl, this.program, this.posAttribLocation);
        },
        onScaleX: (value) => {
            this.scale[0] = value;
            drawScene(this.gl, this.program, this.posAttribLocation);
        },
        onScaleY: (value) => {
            this.scale[1] = value;
            drawScene(this.gl, this.program, this.posAttribLocation);
        },
        onRotate: (value) => {
            const radians = value * Math.PI / 180;
            this.angleInRadians = radians;
            drawScene(this.gl, this.program, this.posAttribLocation);
        }
    }

    constructor(gl : WebGL2RenderingContext, program : WebGLProgram, posAttribLocation : number, params : RectangleParams) {
        super(gl, program, posAttribLocation);
        const {x, y, width, height} = params;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    setGeometry(gl : WebGL2RenderingContext) : void {
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        const x1 = this.x - halfWidth;
        const x2 = this.x + halfWidth;
        const y1 = this.y - halfHeight;
        const y2 = this.y + halfHeight;

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y1,
            x2, y1,
            x1, y2,
            x1, y2,
            x2, y1,
            x2, y2,
        ]), gl.STATIC_DRAW);
    }

    drawGeometry() : void {
        // Use the this.program
        this.gl.useProgram(this.program);

        // Tell the attribute how to get data out of the buffer
        this.gl.enableVertexAttribArray(this.posAttribLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);

        var size = 2;             // 2 components per iteration
        var type = this.gl.FLOAT;      // the data is 32bit floats
        var normalize = false;    // don't normalize the data
        var stride = 0;           // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;           // start at the beginning of the buffer
        this.gl.vertexAttribPointer(this.posAttribLocation, size, type, normalize, stride, offset);

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

        const colorUniformLocation = this.gl.getUniformLocation(this.program, 'u_Color');
        this.gl.uniform4f(colorUniformLocation, 0.576, 0.847, 0.890, 1);

        this.setGeometry(this.gl);

        // Draw the rectanthis.gle
        var primitiveType = this.gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        this.gl.drawArrays(primitiveType, offset, count);
    }

    onObjectSelected(): void {
        chaderUI.setupTrasformControls(this.callbacks);
    }

    onObjectDeselected(): void {
        
    }
}