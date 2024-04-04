import { chaderUI } from "../ui.js";

export function setRectangleUI() {
    chaderUI.setHeader('Transformation');
    chaderUI.setupSlider('x', 'Position-x', { value: 0, min: -50, max: 50, slide: (value) => { 
        console.log(value);
    }});
    chaderUI.setupSlider('y', 'Position-y', { value: 0, min: -50, max: 50, slide: (value) => { 
        console.log(value);
    }});
}

export function setRectangle(gl : WebGL2RenderingContext, x : number, y : number, width : number, height : number) {
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