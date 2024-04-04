export const matrixTransformer = {
    project, translate, rotate, scale
}

function project(width : number, height : number) : Float32List {
    const matrix = new Float32Array(9);

    matrix[0] = 2 / width;
    matrix[4] = -2 / height;
    matrix[8] = 1;

    return matrix;
}

function translate(matrix : Float32List, translateX : number, translateY : number) : Float32List {
    return []
}

function rotate(matrix : Float32List, rotateRadians : number) : Float32List {
    return []
}

function scale(matrix : Float32List, scaleX : number, scaleY : number) : Float32List {
    return []
}