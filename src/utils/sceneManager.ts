import { Geometry, GeometryType } from "../shape/geometry.js";
import { Polygon } from "../shape/polygon.js";
import { Rectangle } from "../shape/rectangle.js";
import { Square } from "../shape/square.js";

function serializeSceneObjects(sceneObjects : Geometry<any>[]) : string {
    return JSON.stringify(sceneObjects, (key, value) => {
        if (key === 'gl' || key === 'program' || key === 'vBuffer' || key === 'iBuffer'
            || key === 'posAttribLocation' || key === 'colorAttribLocation' || key === 'callbacks') {
            return undefined;
        }
        return value;
    }, 2);
}

export function downloadScene(sceneObjects : Geometry<any>[]) {
    const sceneData = serializeSceneObjects(sceneObjects);
    const blob = new Blob([sceneData], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'scene.json';
    a.click();
    URL.revokeObjectURL(url);
}

export function loadScene(
    jsonString : string,
    gl : WebGL2RenderingContext,
    program : WebGLProgram,
    posAttribLocation : number,
    colorAttribLocation : number
) : Geometry<any>[] {
    const sceneData = JSON.parse(jsonString);
    console.log(sceneData);
    const result : Geometry<any>[] = sceneData.map((obj : any) => {
        var params;
        var geometry : Geometry<any>;
        const { translation, angleInRadians, scale  } = obj;
        switch (obj.type) {
            case GeometryType.LINE:
                break;
            case GeometryType.SQUARE:
                params = { x: obj.x, y: obj.y, sideLength: obj.sideLength };
                geometry = new Square(gl, program, posAttribLocation, colorAttribLocation, params);

                geometry.translation = translation;
                geometry.angleInRadians = angleInRadians;
                geometry.scale = scale;

                return geometry;
            case GeometryType.RECTANGLE:
                params = { x: obj.x, y: obj.y, width: obj.width, height: obj.height };
                geometry = new Rectangle(gl, program, posAttribLocation, colorAttribLocation, params);
                geometry.translation = translation;
                geometry.angleInRadians = angleInRadians;
                geometry.scale = scale;

                return geometry;
            case GeometryType.POLYGON:
                params = { x: obj.x, y: obj.y, sidesLength: obj.sidesLength, sides: obj.sides };
                geometry = new Polygon(gl, program, posAttribLocation, colorAttribLocation, params);

                geometry.translation = translation;
                geometry.angleInRadians = angleInRadians;
                geometry.scale = scale;

                return geometry;
        }


    });

    return result;
}