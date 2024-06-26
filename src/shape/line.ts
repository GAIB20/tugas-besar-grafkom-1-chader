import { drawScene } from "../main.js";
import { chaderUI, TransformationCallbacks } from "../ui.js";
import { matrixTransformer } from "../utils/chaderM3.js";
import { RGBA } from "../utils/color.js";
import { Geometry, GeometryOption, GeometryType } from "./geometry.js";


interface LineParams {
    x : number,
    y : number,
    length : number,
    color? : RGBA
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
    public x : number;
    public y : number;
    public length : number;
    public internalAngle : number = 0;

    private regularLine: boolean = true;

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
        this.x = params.x;
        this.y = params.y;
        this.length = params.length;
    
        if (params.color) {
            for (let i = 0; i < 2; i++) {
                this.vertices.push(0, 0, params.color.r, params.color.g, params.color.b, params.color.a);
            }
        } else {
            for (let i = 0; i < 2; i++) {
                this.vertices.push(0, 0, 0.576, 0.847, 0.890, 1.0);
            }
        }
    }

    setGeometry(gl : WebGL2RenderingContext) : void {
        this.calcVertexLocations();

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vertices), gl.STATIC_DRAW);

        const indices = [ 0,1 ]

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
        var stride = 6 * Float32Array.BYTES_PER_ELEMENT;
        var offset = 0;
        this.gl.vertexAttribPointer(this.posAttribLocation, size, type, normalize, stride, offset);
        this.gl.enableVertexAttribArray(this.colorAttribLocation);
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBuffer);

        size = 4;
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
        chaderUI.setupSlider("llen", "Side Length", { min: 0, max: 30, step: 0.01, value: this.length, slide : (value) => {
            this.length = value;
            drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
        }}, "shape-control-group");

        chaderUI.setupTrasformControls(this.callbacks);
    }

    onObjectDeselected(): void {
        const shapeControlGroup = document.getElementById('shape-control-group');
        shapeControlGroup?.remove();
        
        chaderUI.cleanTransformControls();
    }

    calcVertexLocations(): void {
        if (!this.regularLine) return;
        const halfLength = this.length / 2;
        
        const dx = halfLength * Math.cos(this.internalAngle);
        const dy = halfLength * Math.sin(this.internalAngle);

        this.vertices[0] = this.x - dx;
        this.vertices[1] = this.y - dy;

        this.vertices[6] = this.x + dx;
        this.vertices[7] = this.y + dy;
    }

    onVertexMoved(index: number, deltaX: number, deltaY: number): void {
        const dx = deltaX / 50;
        const dy = deltaY / 50;

        this.vertices[index * 6] += dx;
        this.vertices[index * 6 + 1] -= dy;

        this.x = (this.vertices[0] + this.vertices[6]) / 2;
        this.y = (this.vertices[1] + this.vertices[7]) / 2;

        this.length = Math.sqrt((this.vertices[6] - this.vertices[0]) ** 2 + (this.vertices[7] - this.vertices[1]) ** 2);

        this.length = Math.min(this.length, 30);
        this.length = Math.max(this.length, 0.01);

        this.internalAngle = Math.atan2(this.vertices[7] - this.vertices[1], this.vertices[6] - this.vertices[0]);

        const lenSlider = document.getElementById("llen") as HTMLInputElement;
        lenSlider.value = this.length.toFixed(2).toString();

        const lenSliderValue = document.getElementById("llen-value") as HTMLSpanElement;
        lenSliderValue.innerText = this.length.toFixed(2).toString();

        drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
    }
}
 