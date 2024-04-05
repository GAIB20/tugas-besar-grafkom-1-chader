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

    public vertexLocations : number[] = [];

    protected gl : WebGL2RenderingContext;
    protected program : WebGLProgram;
    protected posAttribLocation : number;
    protected colorAttribLocation : number;

    protected vBuffer : WebGLBuffer | null;
    protected iBuffer : WebGLBuffer | null;

    constructor(gl : WebGL2RenderingContext, program : WebGLProgram, posAttribLocation : number, colorAttribLocation : number, type : GeometryType) {
        Geometry.numOfObjects += 1;

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
        for (let i = 0; i < this.vertexLocations.length; i += 2) {
            const dist = (this.vertexLocations[i] - x) ** 2 + (this.vertexLocations[i + 1] - y) ** 2;
            if (dist < minDist) {
                minDist = dist;
                minIndex = i / 2;
            }
        }

        return minIndex;
    }
}
