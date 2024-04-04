export const matrixTransformer = {
    identity, translate, rotate, scale
}

function identity() : Float32Array {
    return new Float32Array([
        1, 0, 0,
        0, 1, 0,
        0, 0, 1
    ]);
}

function translate(matrix : Float32List, translateX : number, translateY : number) : Float32Array {
    const result = new Float32Array(9);
    result.set(matrix);

    result[6] = matrix[0] * translateX + matrix[3] * translateY + matrix[6];
    result[7] = matrix[1] * translateX + matrix[4] * translateY + matrix[7];
    result[8] = matrix[2] * translateX + matrix[5] * translateY + matrix[8];

    return result;
}

function rotate(matrix : Float32List, rotateRadians : number) : Float32Array {
    const result = new Float32Array(9);
    result.set(matrix);

    const cos = Math.cos(rotateRadians);
    const sin = Math.sin(rotateRadians);

    result[0] = matrix[0] * cos + matrix[3] * -sin;
    result[1] = matrix[1] * cos + matrix[4] * -sin;
    result[2] = matrix[2] * cos + matrix[5] * -sin;

    result[3] = matrix[0] * sin + matrix[3] * cos;
    result[4] = matrix[1] * sin + matrix[4] * cos;
    result[5] = matrix[2] * sin + matrix[5] * cos;

    return result;
}

function scale(matrix : Float32List, scaleX : number, scaleY : number) : Float32Array {
    const result = new Float32Array(9);
    result.set(matrix);

    result[0] = matrix[0] * scaleX;
    result[1] = matrix[1] * scaleX;
    result[2] = matrix[2] * scaleX;

    result[3] = matrix[3] * scaleY;
    result[4] = matrix[4] * scaleY;
    result[5] = matrix[5] * scaleY;

    return result;
}
