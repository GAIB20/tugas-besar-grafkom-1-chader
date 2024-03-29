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

    // Setup Position Buffer
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_Position');
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
        10, 20,
        400, 20,
        10, 30,
        10, 30,
        400, 20,
        400, 30,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

    resizeCanvasToDisplaySize();

    // Set the viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Use the program
    gl.useProgram(program);

    // Turn on the attribute
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_Resolution');
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind the position buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of the buffer
    const size = 2;             // 2 components per iteration
    const type = gl.FLOAT;      // the data is 32bit floats
    const normalize = false;    // don't normalize the data
    const stride = 0;           // 0 = move forward size * sizeof(type) each iteration to get the next position
    const offset = 0;           // start at the beginning of the buffer
    gl.vertexAttribPointer(positionAttributeLocation, size, type, normalize, stride, offset);

    // Draw
    const primitiveType = gl.TRIANGLES;
    const count = 6;
    gl.drawArrays(primitiveType, offset, count);
}

main();