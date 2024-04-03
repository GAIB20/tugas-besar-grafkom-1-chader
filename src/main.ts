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

    setHeader('Transformation');
    setupSlider('x', 'Position-x', { value: 0, min: 0, max: 300, slide: (value) => { 
        console.log(value);
    }});
    setupSlider('y', 'Position-y', { value: 0, min: 0, max: 300, slide: (value) => { 
        console.log(value);
    }});

    // Setup Position Buffer
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_Position');
    const positionBuffer = gl.createBuffer();

    resizeCanvasToDisplaySize();

    // Set the viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0.118, 0.125, 0.188, 1.0); // dark blue background
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use the program
    gl.useProgram(program);

    // Tell the attribute how to get data out of the buffer
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    var size = 2;             // 2 components per iteration
    var type = gl.FLOAT;      // the data is 32bit floats
    var normalize = false;    // don't normalize the data
    var stride = 0;           // 0 = move forward size * sizeof(type) each iteration to get the next position
    var offset = 0;           // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    // Uniforms
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_Resolution');
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    const pixelPerUnit = 32;
    const pixelPerUnitUniformLocation = gl.getUniformLocation(program, 'u_PixelPerUnit');
    gl.uniform1f(pixelPerUnitUniformLocation, pixelPerUnit);

    const colorUniformLocation = gl.getUniformLocation(program, 'u_Color');

    setRectangle(gl, 0, 0, 10, 10);

    gl.uniform4f(colorUniformLocation, 0.576, 0.847, 0.890, 1);

    // Draw the rectangle
    var primitiveType = gl.TRIANGLES;
    var offset = 0;
    var count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

function randomInt(range : number) {
    return Math.floor(Math.random() * range);
}

function setRectangle(gl : WebGL2RenderingContext, x : number, y : number, width : number, height : number) {
    const halfWidth = width / 2;
    const halfHeight = height / 2;

    const x1 = x - halfWidth;
    const x2 = x + halfWidth;
    const y1 = y - halfHeight;
    const y2 = y + halfHeight;

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        x1, y1,
        x2, y1,
        x1, y2,
        x1, y2,
        x2, y1,
        x2, y2,
    ]), gl.STATIC_DRAW);
}

main();