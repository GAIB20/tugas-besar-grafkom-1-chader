import { drawScene } from "../main.js";
import { chaderUI, TransformationCallbacks } from "../ui.js";
import { matrixTransformer } from "../utils/chaderM3.js";
import { RGBA } from "../utils/color.js";
import { Geometry, GeometryOption, GeometryType } from "./geometry.js";

interface SquareParams {
    x : number, 
    y : number,
    sideLength : number, 
    color? : RGBA
}

export const SquareOption : GeometryOption = {
    getGeometryType() {
        return GeometryType.SQUARE;
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

    constructor(gl : WebGL2RenderingContext, program : WebGLProgram, 
        posAttribLocation : number, colorAttribLocation : number, params : SquareParams,
        ignoreId? : boolean    
    ) {
        super(gl, program, posAttribLocation, colorAttribLocation, GeometryType.SQUARE, ignoreId);
        const { x, y, sideLength } = params;
        this.x = x;
        this.y = y;
        this.sideLength = sideLength;

        if (params.color) {
            for (let i = 0; i < 4; i++) {
                this.vertices.push(0, 0, params.color.r, params.color.g, params.color.b);
            }
        } else {
            for (let i = 0; i < 4; i++) {
                this.vertices.push(0, 0, 0.576, 0.847, 0.890);
            }
        }
    }

    setGeometry(gl : WebGL2RenderingContext) : void {
        this.calcVertexLocations();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        const indices = [
            0, 1, 2,
            2, 1, 3
        ]

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices), gl.STATIC_DRAW);
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
        this.gl.drawElements(primitiveType, count, this.gl.UNSIGNED_SHORT, offset);
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

    calcVertexLocations() {
        const halfSideLength = this.sideLength / 2;

        const x1 = this.x - halfSideLength;
        const y1 = this.y - halfSideLength;
        const x2 = this.x + halfSideLength;
        const y2 = this.y + halfSideLength;

        this.vertices = [
            x1, y1, this.vertices[2], this.vertices[3], this.vertices[4],
            x1, y2, this.vertices[7], this.vertices[8], this.vertices[9],
            x2, y1, this.vertices[12], this.vertices[13], this.vertices[14],
            x2, y2, this.vertices[17], this.vertices[18], this.vertices[19]
        ];
    }

    onVertexMoved(index: number, deltaX: number, deltaY: number): void {
        const delta = Math.min(Math.abs(deltaX), Math.abs(deltaY)) / 50;
        const sign = Math.sign(deltaX);

        switch (index) {
            case 0:
                this.x += delta * sign;
                this.y += delta * sign;
                this.sideLength -= delta * 2 * sign;
                break;
            case 1:
                this.x += delta * sign;
                this.y -= delta * sign;
                this.sideLength -= delta * 2 * sign;
                break;
            case 2:
                this.x += delta * sign;
                this.y -= delta * sign;
                this.sideLength += delta * 2 * sign;
                break;
            case 3:
                this.x += delta * sign;
                this.y += delta * sign;
                this.sideLength += delta * 2 * sign;
                break;
        }

        this.sideLength = Math.max(0.01, this.sideLength);
        this.sideLength = Math.min(30, this.sideLength);

        const sideLengthSlider = document.getElementById("ssl") as HTMLInputElement;
        sideLengthSlider.value = this.sideLength.toString();
        
        const sideLengthValueSpan = document.getElementById("ssl-value") as HTMLSpanElement;
        sideLengthValueSpan.innerText = this.sideLength.toFixed(2);

        drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
    }
}