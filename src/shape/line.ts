import { chaderUI } from "../ui.js";

export function setLineUI() {

}

export function setLine(gl : WebGL2RenderingContext, x1 : number, y1 : number, x2 : number, y2 : number) {
    
    const vertices = new Float32Array([x1, y1, x2, y2]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    var primitiveType = gl.LINES;
    var offset = 0;
    var count = 2;
    gl.drawArrays(primitiveType, offset, count);
}