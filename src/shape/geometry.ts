import { drawScene } from "../main.js";
import { RGBA } from "../utils/color.js";

export enum GeometryType {
    LINE, SQUARE, RECTANGLE, POLYGON
}

export interface GeometryOption {
    getGeometryType : () => GeometryType;
    onPrepareObject? : () => void,                           // Prepare UI to set initial object
    onUnprepareObject? : () => void,                         // Clean UI 
}

export abstract class Geometry<T> {
    public static numOfObjects : number = 0;
    public id : number;
    public type : GeometryType;

    public translation = [0, 0];
    public angleInRadians = 0;
    public scale = [1, 1];

    public vertices : number[] = [];

    protected gl : WebGL2RenderingContext;
    protected program : WebGLProgram;
    protected posAttribLocation : number;
    protected colorAttribLocation : number;

    protected vBuffer : WebGLBuffer | null;
    protected iBuffer : WebGLBuffer | null;

    constructor(gl : WebGL2RenderingContext, program : WebGLProgram, 
        posAttribLocation : number, colorAttribLocation : number, 
        type : GeometryType, ignoreId? : boolean
    ) {
        if (!ignoreId) Geometry.numOfObjects += 1;

        this.id = Geometry.numOfObjects;
        this.gl = gl;
        this.program = program;
        this.posAttribLocation = posAttribLocation;
        this.colorAttribLocation = colorAttribLocation;
        this.type = type;

        this.vBuffer = gl.createBuffer();
        this.iBuffer = gl.createBuffer();
    }

    abstract setGeometry   // Fill the buffer data
        (gl : WebGL2RenderingContext, params: T) : void;

    abstract drawGeometry  // Draw geometry to the scene
        (gl : WebGL2RenderingContext, program : WebGLProgram, positionAttributeLocation : number) : void;

    abstract onObjectSelected() : void;     // Show up controls UI
    abstract onObjectDeselected() : void;   // Clean up controls UI

    abstract calcVertexLocations() : void;  // Calculate vertex locations
    abstract onVertexMoved(index : number, deltaX : number, deltaY : number) : void; // Update vertex location
    getClosestVertex(x : number, y : number) : number { // Get the closer vertex to the mouse within threshold (return the index)
        this.calcVertexLocations();

        let minDist = Number.MAX_VALUE;
        let minIndex = -1;
        for (let i = 0; i < this.vertices.length; i += 6) {
            const dist = (this.vertices[i] - x) ** 2 + (this.vertices[i + 1] - y) ** 2;
            if (dist < minDist) {
                minDist = dist;
                minIndex = i / 6;
            }
        }

        return minIndex;
    }
    changeVertexColor(color : RGBA, vertexIdx : number) : void {
        this.vertices[vertexIdx * 6 + 2] = color.r;
        this.vertices[vertexIdx * 6 + 3] = color.g;
        this.vertices[vertexIdx * 6 + 4] = color.b;
        this.vertices[vertexIdx * 6 + 5] = color.a;

        drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
    }

    getVertexColor(vertexIdx : number) : RGBA {
        return {
            r: this.vertices[vertexIdx * 6 + 2],
            g: this.vertices[vertexIdx * 6 + 3],
            b: this.vertices[vertexIdx * 6 + 4],
            a: this.vertices[vertexIdx * 6 + 5]
        };
    }

    fadeIn() {
        let alpha = 0.0;
        const interval = setInterval(() => {
            alpha += 0.05;

            this.vertices.forEach((_, idx) => {
                if (idx % 6 === 0) {
                    this.vertices[idx + 5] = alpha;
                }
            });

            drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);

            if (alpha >= 1.0) {
                clearInterval(interval);
            }
        }, 10);
    }
}
