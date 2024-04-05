# Chader : WebGL Project IF3260
## Description
This project is a web program that mimic the photoshop draw shape and line feature. With WebGL platform, the shape and sizes is drawed, edited, and visualize in a web application containing multiple option to transform, add, and save the shape model. The shape that implemented is line, square, rectangle, and polygon each with its transformation option that relevant to the shape.

## Feature
1. Draw basic shape (Line, Square, Rectangle, and Polygon)
2. Geometry Transformation: translation, dilatation, shear, and rotation
3. Modify the shape with moving corner point with slider and drag and drop
4. Change corner point color
5. Save and load shape model
6. Extra Feature: Convex Hull
7. Extra Feature: Fade in Animation
8. Extra Feature: Advanced UX

## How to Run 🚀
1. Clone this repo to your local directory.
```console
user@hello:~$ git clone https://github.com/GAIB20/tugas-besar-grafkom-1-chader.git
```
2. Navigate to the cloned directory. e.g. with `cd ${DIR_NAME}`.
3. Install all the dependencies `npm install`.
3. Run the dev script => `npm run dev`. <br>

## Important Function, Class, and Object
1. **Abstract Class Geometry**: this is a parent class that contain abstract function for each shape type (setGeometry, drawGeometry, etc.)
2. **setGeometry()**: Fill the webGl buffer with vertices data
3. **drawGeometry()**: Load the attribute pointers, initialize transformation matrix, uniforms and draw the geometry to the scene using drawElements()
4. **Main()**: main program that run with several functionalities, link vertex shader and fragment shader, create a WebGL program, viewport setup, canvas setup, and draw scene using drawScene()
5. **drawScene()**: viewport setup again, clear canvas before draw shape, and draw geometry of each shape that present in the scene with each shape drawGeometry() function.
