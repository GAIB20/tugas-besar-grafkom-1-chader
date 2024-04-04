import { drawScene } from "../main.js";
import { chaderUI, TransformationCallbacks } from "../ui.js";
import { matrixTransformer } from "../utils/chaderM3.js";
import { Geometry, GeometryOption, GeometryType } from "./geometry.js";

interface PolygonParams {
    x : number,
    y : number,
    sidesLength : number,
    sides : number
}

export const PolygonOption : GeometryOption = {
    getGeometryType() {
        return GeometryType.POLYGON;
    },

    getShapeName() {
        return "Polygon";
    },

    onPrepareObject() {
        
    },

    onUnprepareObject() {

    },
}

export class Polygon extends Geometry<PolygonParams> {
    public x : number;
    public y : number;
    public sidesLength : number;
    public sides : number;


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

    constructor(gl : WebGL2RenderingContext, program : WebGLProgram, posAttribLocation : number, colorAttribLocation : number, params : PolygonParams) {
        super(gl, program, posAttribLocation, colorAttribLocation);
        const {x, y, sidesLength, sides} = params;
        this.x = x;
        this.y = y;
        this.sidesLength = sidesLength;
        this.sides = sides;
    }

    setGeometry(gl : WebGL2RenderingContext) : void {
        const angle = 360/this.sides;
        console.log("angle", angle);
        
        console.log("sideslength", this.sidesLength);

        const vertices: [number, number][] = []
        
        for (let i = 0; i < this.sides; i++) {
            const tempX = this.sidesLength * Math.cos((i * angle * Math.PI) / 180);
            const tempY = this.sidesLength * Math.sin((i * angle * Math.PI) / 180);
            vertices.push([tempX, tempY]);
        }
        console.log("vertices", vertices);

        const centroid: [number, number] = vertices.reduce(([cx, cy], [xi, yi]) => [cx + xi, cy + yi], [0, 0]);
        const centroidX = centroid[0] / this.sides;
        const centroidY = centroid[1] / this.sides;
        console.log("centroid", centroid);

        const translationX = this.x - centroidX;
        const translationY = this.y - centroidY;
        const translatedVertices = vertices.map(([xi, yi]) => [xi + translationX, yi + translationY]);

        console.log("translated", translatedVertices);

        const finalArray: number[] = [];
        const indices: number[] = [];
        
        finalArray.push(this.x, this.y)
        finalArray.push(0.576, 0.847, 0.890);
        for (let i = 0; i < this.sides; i++) {
            finalArray.push(translatedVertices[i][0], translatedVertices[i][1]);
            finalArray.push(0.576, 0.847, 0.890);
        }

        for (let i = 0; i < this.sides; i++) {
            if (i == this.sides-1) {
                indices.push(0, i+1, 1);
            } else {
                indices.push(0, i+1, i+2);
            }
        }

        console.log("final array", finalArray);
        console.log("indices", indices);

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(finalArray), gl.STATIC_DRAW);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW)
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
        var count = this.sides*3;
        this.gl.drawElements(primitiveType, count, this.gl.UNSIGNED_SHORT, 0);
    }

    onObjectSelected(): void {
        chaderUI.setupTrasformControls(this.callbacks);
    }

    onObjectDeselected(): void {
        chaderUI.cleanTransformControls();
    }
}

