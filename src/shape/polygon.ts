import { chaderUI } from "../ui.js";

export function setPolygonUI() {
    chaderUI.setHeader('Transformation');
    chaderUI.setupSlider('x', 'Position-x', { value: 0, min: -50, max: 50, slide: (value) => { 
        console.log(value);
    }});
    chaderUI.setupSlider('y', 'Position-y', { value: 0, min: -50, max: 50, slide: (value) => { 
        console.log(value);
    }});

}

export function setPolygon(gl : WebGL2RenderingContext, x : number, y : number, sidesLength : number, sides : number) {
    const angle = 360/sides;

    const vertices: [number, number][] = []
    for (let i = 0; i < sides; i++) {
        const tempX = sidesLength * Math.cos((i * angle * Math.PI) / 180);
        const tempY = sidesLength * Math.sin((i * angle * Math.PI) / 180);
        vertices.push([tempX, tempY]);
    }

    const centroid: [number, number] = vertices.reduce(([cx, cy], [xi, yi]) => [cx + xi, cy + yi], [0, 0]);
    const centroidX = centroid[0] / sides;
    const centroidY = centroid[1] / sides;

    const translationX = x - centroidX;
    const translationY = y - centroidY;
    const translatedVertices = vertices.map(([xi, yi]) => [xi + translationX, yi + translationY]);

    const finalArray: number[] = [];
    for (let i = 0; i < sides; i++) {
        finalArray.push(translatedVertices[i][0], translatedVertices[i][1]);
    }

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(finalArray), gl.STATIC_DRAW);
}