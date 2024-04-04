import { Geometry, GeometryOption, GeometryType } from "./shape/geometry.js";
import { Rectangle, RectangleOption } from "./shape/rectangle.js";
import { createProgram, createShader } from "./utils/shaderUtils.js";
import { chaderUI } from "./ui.js";

const TypeToCreateOptions = {
    RectangleOption
}
var SelectedTypeToCreate : GeometryOption
var GeometryParams : any;

var ObjectsInScene : Geometry<any>[] = []
var ActiveObject : Geometry<any>

function setActiveObject(obj : Geometry<any>) {
    ActiveObject?.onObjectDeselected();
    ActiveObject = obj;
    ActiveObject.onObjectSelected();
}

function createObject(gl : WebGL2RenderingContext, program : WebGLProgram, posAttribLocation : number) {
    switch (SelectedTypeToCreate.getGeometryType()) {
        case (GeometryType.RECTANGLE) : {
            const instance = new Rectangle(gl, program, posAttribLocation, GeometryParams);
            ObjectsInScene.push(instance);
            setActiveObject(instance);
            break;
        }
    }

    drawScene(gl, program, posAttribLocation);
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

function main() {
    // UI STUFF
    chaderUI.setHeader('Choose Shape Instance', 'controls');
    chaderUI.setDropdown('shape-dropdown', 'Instance: ', [], 'controls', (value) => {
        console.log('Selected: ' + value);
    });


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

    document.getElementById('button_generate')?.addEventListener('click', () => {
        var selected = document.getElementById('dropdown_generate') as HTMLSelectElement;
        var selectedValue = selected.value;
        console.log("Value: " + selectedValue);

        switch(selectedValue) {
            case 'rectangle': {
                SelectedTypeToCreate = RectangleOption;
                GeometryParams = {
                    x : 0, y : 0, width : 10, height: 10
                }
                break;
            }
        }

        createObject(gl, program, positionAttributeLocation);
        
    });

    resizeCanvasToDisplaySize();

    // Set the viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0.118, 0.125, 0.188, 1.0); // dark blue background
    gl.clear(gl.COLOR_BUFFER_BIT);

    // SelectedTypeToCreate = RectangleOption;
    // GeometryParams = {
    //     x : 0, y : 0, width : 10, height: 10
    // }
    // createObject(gl, program, positionAttributeLocation);

    // ActiveObject.drawGeometry(gl, program, positionAttributeLocation);



    // window.addEventListener('resize', () => {
    //     console.log('resize');
    //     drawScene(gl, program, positionAttributeLocation, positionBuffer);
    // });

    // drawScene(gl, program, positionAttributeLocation, positionBuffer);
}



export function drawScene(gl : WebGL2RenderingContext, program : WebGLProgram, positionAttributeLocation : number) {
    resizeCanvasToDisplaySize();

    // Set the viewport
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    // Clear the canvas
    gl.clearColor(0.118, 0.125, 0.188, 1.0); // dark blue background
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw the objects
    for (const obj of ObjectsInScene) {
        obj.drawGeometry(gl, program, positionAttributeLocation);
    }
}


main();