import { setPolygon } from "./shape/polygon.js";
import { setRectangle } from "./shape/rectangle.js";
import { chaderUI } from "./ui.js";
import { matrixTransformer } from "./utils/chaderM3.js";
import { createProgram, createShader } from "./utils/shaderUtils.js";

var translation = [0, 0];
var angleInRadians = 0;
var scale = [1, 1];

function resizeCanvasToDisplaySize() {
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

function basicTransformationUI(gl : WebGL2RenderingContext, program : WebGLProgram, positionAttributeLocation : number, positionBuffer : WebGLBuffer | null, colorsLocation : number) {
    chaderUI.setHeader('Basic Transformation');
    chaderUI.setupSlider('tx', 'Position-x', { value: 0, min: -15, max: 15, slide: (value) => { 
        translation[0] = value;
        drawScene(gl, program, positionAttributeLocation, positionBuffer, colorsLocation);
    }, step: 0.01});
    chaderUI.setupSlider('ty', 'Position-y', { value: 0, min: -15, max: 15, slide: (value) => { 
        translation[1] = value;
        drawScene(gl, program, positionAttributeLocation, positionBuffer, colorsLocation);
    }, step: 0.01});
    chaderUI.setupSlider('sx', 'Scale-x', { value: 1, min: -10, max: 10, slide: (value) => { 
        scale[0] = value;
        drawScene(gl, program, positionAttributeLocation, positionBuffer, colorsLocation);
    }, step: 0.01});
    chaderUI.setupSlider('sy', 'Scale-y', { value: 1, min: -10, max: 10, slide: (value) => { 
        scale[1] = value;
        drawScene(gl, program, positionAttributeLocation, positionBuffer, colorsLocation);
    }, step: 0.01});
    chaderUI.setupSlider('angle', 'Angle', { value: 0, min: 0, max: 360, slide: (value) => {
        angleInRadians = value * Math.PI / 180;
        drawScene(gl, program, positionAttributeLocation, positionBuffer, colorsLocation);
    }});
}

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
    const positionBuffer = gl.createBuffer();
    const colorsLocation = gl.getAttribLocation(program, "a_Color");
    
    basicTransformationUI(gl, program, positionAttributeLocation, positionBuffer, colorsLocation);

    window.addEventListener('resize', () => {
        console.log('resize');
        drawScene(gl, program, positionAttributeLocation, positionBuffer, colorsLocation);
    });

    drawScene(gl, program, positionAttributeLocation, positionBuffer, colorsLocation);
}

function drawScene(gl : WebGL2RenderingContext, program : WebGLProgram, positionAttributeLocation : number, positionBuffer : WebGLBuffer | null, colorsLocation : number) {
    resizeCanvasToDisplaySize();

    // Set the viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0.118, 0.125, 0.188, 1.0); // dark blue background
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use the program
    gl.useProgram(program);

    // Tell the attribute how to get data out of the buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.enableVertexAttribArray(positionAttributeLocation);
    console.log("tes: ", positionAttributeLocation);

    var size = 2;             // 2 components per iteration
    var type = gl.FLOAT;      // the data is 32bit floats
    var normalize = false;    // don't normalize the data
    var stride = 5 * Float32Array.BYTES_PER_ELEMENT;           // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;           // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);
    
    // Color buffer
    gl.enableVertexAttribArray(colorsLocation);
    console.log("tes: ", colorsLocation);

    var size = 3;             // 2 components per iteration
    var offset = 2 * Float32Array.BYTES_PER_ELEMENT;           // start at the beginning of the buffer
    gl.vertexAttribPointer(colorsLocation, size, type, normalize, stride, offset);

    // Compute matrix
    var matrix = matrixTransformer.identity();

    matrix = matrixTransformer.translate(matrix, translation[0], translation[1]);
    matrix = matrixTransformer.rotate(matrix, angleInRadians);
    matrix = matrixTransformer.scale(matrix, scale[0], scale[1]);

    // Uniforms
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_Resolution');
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    const matrixUniformLocation = gl.getUniformLocation(program, 'u_Matrix');
    gl.uniformMatrix3fv(matrixUniformLocation, false, matrix);

    const colorUniformLocation = gl.getUniformLocation(program, 'u_Color');
    gl.uniform4f(colorUniformLocation, 0.576, 0.847, 0.890, 1);

    // setRectangle(gl, 0, 0, 10, 10);

    // // Draw the rectangle
    // var primitiveType = gl.TRIANGLES;
    // var offset = 0;
    // var count = 6;

    setPolygon(gl, 0, 0, 5, 5);
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 30;
    gl.drawArrays(primitiveType, offset, count);
}


main();