import { drawScene } from "../main.js";
import { chaderUI, TransformationCallbacks } from "../ui.js";
import { matrixTransformer } from "../utils/chaderM3.js";
import { RGBA } from "../utils/color.js";
import { Geometry, GeometryOption, GeometryType } from "./geometry.js";

interface PolygonParams {
    x : number,
    y : number,
    sidesLength : number,
    sides : number,
    color? : RGBA
}

export const PolygonOption : GeometryOption = {
    getGeometryType() {
        return GeometryType.POLYGON;
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
    public color : RGBA;

    public regularPolygon: boolean = true;

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
        super(gl, program, posAttribLocation, colorAttribLocation, GeometryType.POLYGON);
        const {x, y, sidesLength, sides} = params;
        this.x = x;
        this.y = y;
        this.sidesLength = sidesLength;
        this.sides = sides;

        if (params.color) {
            for (let i = 0; i < sides+1; i++) {
                this.vertices.push(0, 0, params.color.r, params.color.g, params.color.b, params.color.a);
            }
            this.color = params.color;
        } else {
            for (let i = 0; i < sides+1; i++) {
                this.vertices.push(0, 0, 0.576, 0.847, 0.890, 1);
            }
            this.color = {r : 0.576, g : 0.847, b : 0.890, a : 1}
        }
    }

    setGeometry(gl : WebGL2RenderingContext) : void {
        if (this.regularPolygon) {
            this.calcVertexLocations();
        }

        const finalArray: number[] = [];

        for (let i = 0; i < this.sides + 1; i++) {
            finalArray.push(
                this.vertices[i*6], this.vertices[i*6+1], 
                this.vertices[i*6+2], this.vertices[i*6+3], this.vertices[i*6+4], this.vertices[i*6+5]
            );
        }

        const indices: number[] = [];

        for (let i = 0; i < this.sides; i++) {
            if (i == this.sides-1) {
                indices.push(0, i+1, 1);
            } else {
                indices.push(0, i+1, i+2);
            }
        }

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
        var count = this.sides*3;
        this.gl.drawElements(primitiveType, count, this.gl.UNSIGNED_SHORT, 0);
    }

    onObjectSelected(): void {
        const shapeControlGroup = document.createElement("div");
        shapeControlGroup.id = "shape-control-group";
        shapeControlGroup.className = "control-group";

        const controls = document.getElementById("controls");
        controls?.appendChild(shapeControlGroup);
        
        chaderUI.setHeader("Polygon Properties", "shape-control-group");
        chaderUI.setupSlider("ssl", "Number of Vertices", { min: 3, max: 50, step: 1, value: this.sides, slide : (value) => {
            this.sides = value;
            this.regularPolygon = true;
            this.calcVertexLocations()
            drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);
        }}, "shape-control-group");

        chaderUI.setupTrasformControls(this.callbacks);
    }

    onObjectDeselected(): void {
        const shapeControlGroup = document.getElementById("shape-control-group");
        shapeControlGroup?.remove();

        chaderUI.cleanTransformControls();
    }

    calcVertexLocations(): void {
        if (!this.regularPolygon) return;
        const angle = 360/this.sides;
        const vertices: [number, number][] = []
        
        for (let i = 0; i < this.sides; i++) {
            const tempX = this.sidesLength * Math.cos((i * angle * Math.PI) / 180);
            const tempY = this.sidesLength * Math.sin((i * angle * Math.PI) / 180);
            vertices.push([tempX, tempY]);
        }

        const centroid: [number, number] = vertices.reduce(([cx, cy], [xi, yi]) => [cx + xi, cy + yi], [0, 0]);
        const centroidX = centroid[0] / this.sides;
        const centroidY = centroid[1] / this.sides;

        const translationX = this.x - centroidX;
        const translationY = this.y - centroidY;
        const translatedVertices = vertices.map(([xi, yi]) => [xi + translationX, yi + translationY]);

        const finalArray: number[] = [];
        
        for (let i = 0; i < this.sides; i++) {
            finalArray.push(translatedVertices[i][0], translatedVertices[i][1])

            if (this.vertices[(i+1)*6 + 2] == undefined) {
                finalArray.push(this.color.r, this.color.g, this.color.b, this.color.a);
            } else {
                finalArray.push(this.vertices[(i+1)*6 + 2], this.vertices[(i+1)*6 + 3], this.vertices[(i+1)*6 + 4], this.vertices[(i+1)*6 + 5]);
            }
        }

        this.vertices = finalArray;
    }

    onVertexMoved(index: number, deltaX: number, deltaY: number): void {
        this.regularPolygon = false;

        this.vertices[index*6] += deltaX / 50;
        this.vertices[index*6+1] -= deltaY / 50;

        let tempVertices : number[] = this.vertices;
    
        this.vertices = this.convexHull(this.vertices, 6);

        drawScene(this.gl, this.program, this.posAttribLocation, this.colorAttribLocation);

        this.vertices = tempVertices;
    }

    orientation(px : number, py : number, qx : number, qy : number, rx : number, ry : number): number {
        // 0 = Collinear
        // 1 = Clockwise
        // 2 = counterclockwise
        const val = (qy - py) * (rx - qx) - (qx - px) * (ry - qy);
        if (val === 0) return 0;
        return (val > 0) ? 1 : 2;
    }

    convexHull(points: number[], size: number): number[] {
        const pointsLength = points.length;
        
        if (pointsLength < 6) {
            // convexHull can't be used for anything with less than 3 coordinates
            return [];
        } else {
            const hull: number[] = [];
            let leftmostIndex = 0;
        
            // find the index for the leftmost coordinate
            for (let i = size; i < pointsLength; i += size) { // traverse based on size
                if (points[i] < points[leftmostIndex]) {
                    leftmostIndex = i;
                }
            }
        
            let p = leftmostIndex;
            let q: number;
        
            do {
                for (let k = 0; k < size; k++) {
                    hull.push(points[p + k]);
                }
                q = ((p + size) % pointsLength) || 0;
        
                for (let i = 0; i < pointsLength; i += size) {
                    // If i is more counterclockwise than current q, then update q
                    if (this.orientation(
                        points[p], points[p + 1],
                        points[i], points[i + 1],
                        points[q], points[q + 1]
                    ) === 2) {
                        q = i;
                    }
                }
        
                p = q;
        
            } while (p !== leftmostIndex); // repeat until p is the leftmost coordinate

            return hull;   
        }
    }
}

