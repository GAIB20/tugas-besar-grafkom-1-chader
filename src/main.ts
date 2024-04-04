import { Geometry, GeometryOption, GeometryType } from "./shape/geometry.js";
import { Rectangle, RectangleOption } from "./shape/rectangle.js";
import { chaderUI } from "./ui.js";
import { matrixTransformer } from "./utils/chaderM3.js";
import { createProgram, createShader } from "./utils/shaderUtils.js";

// var translation = [0, 0];
// var angleInRadians = 0;
// var scale = [1, 1];

const TypeToCreateOptions = {
    RectangleLifecycle: RectangleOption
}
var SelectedTypeToCreate : GeometryOption
var InitialShapeSetup : any;

var ObjectsInScene : Geometry<any>[] = []
var ActiveObject : Geometry<any>

function createObject(gl : WebGL2RenderingContext) {
    switch (SelectedTypeToCreate.getGeometryType()) {
        case (GeometryType.RECTANGLE) : {
            const instance = new Rectangle(gl, InitialShapeSetup);
            ObjectsInScene.push(instance);
            ActiveObject = instance;
            break;
        }
    }
}

export function resizeCanvasToDisplaySize() {
    const canvas = document.querySelector('#webgl-canvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error('Failed to find canvas element');
        return;
    }

    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
    }
}

// function basicTransformationUI(gl : WebGL2RenderingContext, program : WebGLProgram, positionAttributeLocation : number, positionBuffer : WebGLBuffer | null) {
//     chaderUI.setHeader('Shape Properties');
//     chaderUI.setupSlider('w', 'Panjang', { value: 0, min: -15, max: 15, slide: (value) => { 
//         drawScene(gl, program, positionAttributeLocation, positionBuffer);
//     }, step: 0.01});
//     chaderUI.setHeader('Basic Transformation');
//     chaderUI.setupSlider('tx', 'Position-x', { value: 0, min: -15, max: 15, slide: (value) => { 
//         translation[0] = value;
//         drawScene(gl, program, positionAttributeLocation, positionBuffer);
//     }, step: 0.01});
//     chaderUI.setupSlider('ty', 'Position-y', { value: 0, min: -15, max: 15, slide: (value) => { 
//         translation[1] = value;
//         drawScene(gl, program, positionAttributeLocation, positionBuffer);
//     }, step: 0.01});
//     chaderUI.setupSlider('sx', 'Scale-x', { value: 1, min: -10, max: 10, slide: (value) => { 
//         scale[0] = value;
//         drawScene(gl, program, positionAttributeLocation, positionBuffer);
//     }, step: 0.01});
//     chaderUI.setupSlider('sy', 'Scale-y', { value: 1, min: -10, max: 10, slide: (value) => { 
//         scale[1] = value;
//         drawScene(gl, program, positionAttributeLocation, positionBuffer);
//     }, step: 0.01});
//     chaderUI.setupSlider('angle', 'Angle', { value: 0, min: 0, max: 360, slide: (value) => {
//         angleInRadians = value * Math.PI / 180;
//         drawScene(gl, program, positionAttributeLocation, positionBuffer);
//     }});
// }

function main() {
    // Get the canvas element
    const canvas = document.querySelector('#webgl-canvas') as HTMLCanvasElement;
    if (!canvas) {
        console.error('Failed to find canvas element');
        return;
    }

    // Get the WebGL2 context
    const gl = canvas.getContext('webgl2');
    if (!gl) {
        console.error('Failed to get WebGL2 context');
        return;
    }

    // Parse the shader source from the HTML
    const vsSource = document.querySelector('#vertex-shader-2d')?.textContent;
    const fsSource = document.querySelector('#fragment-shader-2d')?.textContent;
    if (!vsSource || !fsSource) {
        console.error('Failed to get shader source from HTML');
        return;
    }

    // Create the shaders
    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vsSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
    if (!vertexShader || !fragmentShader) {
        console.error('Failed to create shaders');
        return;
    }

    // Link the shaders into a program
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
        console.error('Failed to create program');
        return;
    }

    // Setup Position Buffer
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_Position');
    // const positionBuffer = gl.createBuffer();

    // basicTransformationUI(gl, program, positionAttributeLocation, positionBuffer);

    SelectedTypeToCreate = RectangleOption;
    InitialShapeSetup = {
        x : 0, y : 0, width : 10, height: 10
    }
    createObject(gl);

    ActiveObject.drawGeometry(gl, program, positionAttributeLocation);

    // window.addEventListener('resize', () => {
    //     console.log('resize');
    //     drawScene(gl, program, positionAttributeLocation, positionBuffer);
    // });

    // drawScene(gl, program, positionAttributeLocation, positionBuffer);
}

// function drawScene(gl : WebGL2RenderingContext, program : WebGLProgram, positionAttributeLocation : number, positionBuffer : WebGLBuffer | null) {
//     resizeCanvasToDisplaySize();

//     // Set the viewport
//     gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

//     // Clear the canvas
//     gl.clearColor(0.118, 0.125, 0.188, 1.0); // dark blue background
//     gl.clear(gl.COLOR_BUFFER_BIT);

//     // Use the program
//     gl.useProgram(program);

//     // Tell the attribute how to get data out of the buffer
//     gl.enableVertexAttribArray(positionAttributeLocation);
//     gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

//     var size = 2;             // 2 components per iteration
//     var type = gl.FLOAT;      // the data is 32bit floats
//     var normalize = false;    // don't normalize the data
//     var stride = 0;           // 0 = move forward size * sizeof(type) each iteration to get the next position
//     var offset = 0;           // start at the beginning of the buffer
//     gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

//     // Compute matrix
//     var matrix = matrixTransformer.identity();

//     matrix = matrixTransformer.translate(matrix, translation[0], translation[1]);
//     matrix = matrixTransformer.rotate(matrix, angleInRadians);
//     matrix = matrixTransformer.scale(matrix, scale[0], scale[1]);

//     // Uniforms
//     const resolutionUniformLocation = gl.getUniformLocation(program, 'u_Resolution');
//     gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

//     const matrixUniformLocation = gl.getUniformLocation(program, 'u_Matrix');
//     gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);

//     const colorUniformLocation = gl.getUniformLocation(program, 'u_Color');
//     gl.uniform4f(colorUniformLocation, 0.576, 0.847, 0.890, 1);

//     setRectangle(gl, 0, 0, 10, 10);

//     // Draw the rectangle
//     var primitiveType = gl.TRIANGLES;
//     var offset = 0;
//     var count = 6;
//     gl.drawArrays(primitiveType, offset, count);
// }


main();