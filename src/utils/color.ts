export interface RGBA {
    r : number,
    g : number,
    b : number,
    a : number
}

export function hexToRgb(hex : string) : RGBA | null {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16) / 255,
    g: parseInt(result[2], 16) / 255,
    b: parseInt(result[3], 16) / 255,
    a: 1
  } : null;
}

export function rgbToHex(color : RGBA) : string {
    const red = Math.round(color.r * 255);
    const green = Math.round(color.g * 255);
    const blue = Math.round(color.b * 255);
    
    // Convert each component to hexadecimal string and concatenate them
    const hex = '#' + ((1 << 24) + (red << 16) + (green << 8) + blue).toString(16).slice(1);
    
    return hex.toUpperCase(); // Convert to uppercase for consistency
}
