import { drawScene } from "../main.js";
import { chaderUI, TransformationCallbacks } from "../ui.js";
import { matrixTransformer } from "../utils/chaderM3.js";
import { RGBA } from "../utils/color.js";
import { Geometry, GeometryOption, GeometryType } from "./geometry.js";

interface RectangleParams {
    x : number, 
    y : number,
    width : number, 
    height : number,
    color? : RGBA
}

export const RectangleOption : GeometryOption = {
    getGeometryType() {
        return GeometryType.RECTANGLE;
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

    constructor(gl : WebGL2RenderingContext, program : WebGLProgram, posAttribLocation : number, colorAttribLocation : number, params : RectangleParams) {
        super(gl, program, posAttribLocation, colorAttribLocation, GeometryType.RECTANGLE);
        const {x, y, width, height} = params;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        if (params.color) {
            for (let i = 0; i < 4; i++) {
                this.vertices.push(0, 0, params.color.r, params.color.g, params.color.b, params.color.a);
            }
        } else {
            for (let i = 0; i < 4; i++) {
                this.vertices.push(0, 0, 0.576, 0.847, 0.890, 1.0);
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
        var stride = 6 * Float32Array.BYTES_PER_ELEMENT;
        var offset = 0;
        this.gl.vertexAttribPointer(this.posAttribLocation, size, type, normalize, stride, offset);

        // Tell the attribute how to get data out of the buffer
        this.gl.enableVertexAttribArray(this.colorAttribLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);

        size = 4;
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
        var count = 6;
        this.gl.drawElements(primitiveType, count, this.gl.UNSIGNED_SHORT, 0);
    }

    onObjectSelected(): void {
        const shapeControlGroup = document.createElement("div");
        shapeControlGroup.id = "shape-control-group";
        shapeControlGroup.className = "control-group";

        const controls = document.getElementById("controls");
        controls?.appendChild(shapeControlGroup);

        chaderUI.setHeader("Rectangle Properties", "shape-control-group");
        chaderUI.setupSlider("rw", "Width", { min: 0, max: 30, step: 0.01, value: this.width, slide : (value) => {
            this.width = value;
            drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
        }}, "shape-control-group");

        chaderUI.setupSlider("rh", "Height", { min: 0, max: 30, step: 0.01, value: this.height, slide : (value) => {
            this.height = value;
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
        const halfWidth = this.width / 2;
        const halfHeight = this.height / 2;

        const x1 = this.x - halfWidth;
        const x2 = this.x + halfWidth;
        const y1 = this.y - halfHeight;
        const y2 = this.y + halfHeight;

        this.vertices = [
            x1, y1, this.vertices[2], this.vertices[3], this.vertices[4], this.vertices[5],
            x1, y2, this.vertices[8], this.vertices[9], this.vertices[10], this.vertices[11],
            x2, y1, this.vertices[14], this.vertices[15], this.vertices[16], this.vertices[17],
            x2, y2, this.vertices[20], this.vertices[21], this.vertices[22], this.vertices[23]
        ];
    }

    onVertexMoved(index: number, deltaX: number, deltaY: number): void {
        const dx = deltaX / 50;
        const dy = deltaY / 50;

        switch (index) {
            case 0:
                this.x += dx;
                this.y -= dy;
                this.width -= dx * 2;
                this.height += dy * 2;
                break;
            case 1:
                this.x += dx;
                this.y -= dy;
                this.width -= dx * 2;
                this.height -= dy * 2;
                break;
            case 2:
                this.x += dx;
                this.y -= dy;
                this.width += dx * 2;
                this.height += dy * 2;
                break;
            case 3:
                this.x += dx;
                this.y -= dy;
                this.width += dx * 2;
                this.height -= dy * 2;
                break;
        }

        this.width = Math.max(0.01, this.width);
        this.width = Math.min(30, this.width);

        const widthSlider = document.getElementById("rw") as HTMLInputElement;
        widthSlider.value = this.width.toString();
        
        const widthValueSpan = document.getElementById("rw-value") as HTMLSpanElement;
        widthValueSpan.innerText = this.width.toFixed(2);

        this.height = Math.max(0.01, this.height);
        this.height = Math.min(30, this.height);

        const heightSlider = document.getElementById("rh") as HTMLInputElement;
        heightSlider.value = this.height.toString();
        
        const heightValueSpan = document.getElementById("rh-value") as HTMLSpanElement;
        heightValueSpan.innerText = this.height.toFixed(2);

        drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
    }
}