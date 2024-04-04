import { chaderUI } from "../ui.js";

function basicTransformationUI(gl : WebGL2RenderingContext, program : WebGLProgram, positionAttributeLocation : number, positionBuffer : WebGLBuffer | null) {
    chaderUI.setHeader('Basic Transformation', 'controls');

    chaderUI.setupSlider('tx', 'Position-x', { value: 0, min: -15, max: 15, slide: (value) => { 
        // TODO: Implement
    }, step: 0.01}, 'controls');
    chaderUI.setupSlider('ty', 'Position-y', { value: 0, min: -15, max: 15, slide: (value) => { 
        // TODO: Implement
    }, step: 0.01}, 'controls');
    chaderUI.setupSlider('sx', 'Scale-x', { value: 1, min: -10, max: 10, slide: (value) => { 
        // TODO: Implement
    }, step: 0.01}, 'controls');
    chaderUI.setupSlider('sy', 'Scale-y', { value: 1, min: -10, max: 10, slide: (value) => { 
        // TODO: Implement
    }, step: 0.01}, 'controls');
    chaderUI.setupSlider('angle', 'Angle', { value: 0, min: 0, max: 360, slide: (value) => {
        // TODO: Implement
    }}, 'controls');
}

function lineTransformation() {}

function squareTransformation() {}

function rectangleTranformation() {}

function polygonTranformation() {}