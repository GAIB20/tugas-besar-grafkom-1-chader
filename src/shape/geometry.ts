export enum GeometryType {
    LINE, SQUARE, RECTANGLE, POLYGON
}

export interface GeometryOption {
    getGeometryType : () => GeometryType;
    getShapeName : () => string,
    onPrepareObject : () => void,                           // Prepare UI to set initial object
    onUnprepareObject : () => void,                         // Clean UI 
}

export abstract class Geometry<T> {
    public static numOfObjects : number = 0;
    public id : number;

    public translation = [0, 0];
    public angleInRadians = 0;
    public scale = [1, 1];

    protected gl : WebGL2RenderingContext;
    protected program : WebGLProgram;
    protected posAttribLocation : number;
    protected colorAttribLocation : number;
    protected vBuffer : WebGLBuffer | null;

    constructor(gl : WebGL2RenderingContext, program : WebGLProgram, posAttribLocation : number, colorAttribLocation : number) {
        Geometry.numOfObjects += 1;

        this.id = Geometry.numOfObjects;
        this.gl = gl;
        this.program = program;
        this.posAttribLocation = posAttribLocation;
        this.colorAttribLocation = colorAttribLocation;

        this.vBuffer = gl.createBuffer();

    }

    abstract setGeometry   // Fill the buffer data
        (gl : WebGL2RenderingContext, params: T) : void;

    abstract drawGeometry  // Draw geometry to the scene
        (gl : WebGL2RenderingContext, program : WebGLProgram, positionAttributeLocation : number) : void;

    abstract onObjectSelected() : void;     // Show up controls UI
    abstract onObjectDeselected() : void;   // Clean up controls UI
}
