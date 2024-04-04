import { resizeCanvasToDisplaySize } from "../main.js";
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

    constructor(gl : WebGL2RenderingContext, params : RectangleParams) {
        super(gl);
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

    drawGeometry(gl: WebGL2RenderingContext, program: WebGLProgram, positionAttributeLocation: number) : void {
        resizeCanvasToDisplaySize();

        // Set the viewport
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // Clear the canvas
        gl.clearColor(0.118, 0.125, 0.188, 1.0); // dark blue background
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Use the program
        gl.useProgram(program);

        // Tell the attribute how to get data out of the buffer
        gl.enableVertexAttribArray(positionAttributeLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vBuffer);

        var size = 2;             // 2 components per iteration
        var type = gl.FLOAT;      // the data is 32bit floats
        var normalize = false;    // don't normalize the data
        var stride = 0;           // 0 = move forward size * sizeof(type) each iteration to get the next position
        var offset = 0;           // start at the beginning of the buffer
        gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

        // Compute matrix
        var matrix = matrixTransformer.identity();

        matrix = matrixTransformer.translate(matrix, this.translation[0], this.translation[1]);
        matrix = matrixTransformer.rotate(matrix, this.angleInRadians);
        matrix = matrixTransformer.scale(matrix, this.scale[0], this.scale[1]);

        // Uniforms
        const resolutionUniformLocation = gl.getUniformLocation(program, 'u_Resolution');
        gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

        const matrixUniformLocation = gl.getUniformLocation(program, 'u_Matrix');
        gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);

        const colorUniformLocation = gl.getUniformLocation(program, 'u_Color');
        gl.uniform4f(colorUniformLocation, 0.576, 0.847, 0.890, 1);

        this.setGeometry(gl);

        // Draw the rectangle
        var primitiveType = gl.TRIANGLES;
        var offset = 0;
        var count = 6;
        gl.drawArrays(primitiveType, offset, count);
    }

    onObjectSelected(): void {
        
    }

    onObjectDeselected(): void {
        
    }
}

// export function setRectangle(gl : WebGL2RenderingContext, x : number, y : number, width : number, height : number) {
//     const halfWidth = width / 2;
//     const halfHeight = height / 2;

//     console.log("halfWidth", halfWidth);
//     console.log("halfHeight", halfHeight);

//     const x1 = x - halfWidth;
//     const x2 = x + halfWidth;
//     const y1 = y - halfHeight;
//     const y2 = y + halfHeight;

//     console.log(x1, y1, x2, y2);

//     gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
//         x1, y1,
//         x2, y1,
//         x1, y2,
//         x1, y2,
//         x2, y1,
//         x2, y2,
//     ]), gl.STATIC_DRAW);
// }