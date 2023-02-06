import { mat4 } from "gl-matrix";

export function initBuffer(gl, program, data, varName, count) {
    // Create a buffer.
    const buffer = gl.createBuffer();

    // Select the buffer as the one to apply buffer
    // operations to from here out.
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);

    // Now pass the data into WebGL. We do this by creating a Float32Array from the
    // JavaScript array, then use it to fill the current buffer.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

    const attrib = gl.getAttribLocation(program, varName);
    gl.vertexAttribPointer(attrib, count, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attrib);

    return buffer;
}

export function initElementBuffer(gl, data) {
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), gl.STATIC_DRAW);
}

export function drawScene(gl, program, rotation, zoom) {
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Clear to black, fully opaque
    gl.clearDepth(1.0); // Clear everything
    gl.enable(gl.DEPTH_TEST); // Enable depth testing
    gl.depthFunc(gl.LEQUAL); // Near things obscure far things

    // Clear the canvas before we start drawing on it.

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Create a perspective matrix, a special matrix that is
    // used to simulate the distortion of perspective in a camera.
    // Our field of view is 45 degrees, with a width/height
    // ratio that matches the display size of the canvas
    // and we only want to see objects between 0.1 units
    // and 100 units away from the camera.

    const fieldOfView = (45 * Math.PI) / 180; // in radians
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    const zNear = 0.1;
    const zFar = 100.0;
    const projectionMatrix = mat4.create();

    // note: glmatrix.js always has the first argument
    // as the destination to receive the result.
    mat4.perspective(projectionMatrix, fieldOfView, aspect, zNear, zFar);

    // Set the drawing position to the "identity" point, which is
    // the center of the scene.
    const modelViewMatrix = mat4.create();

    const zoomFac = (20 * zoom) / 100 + 4;

    // Now move the drawing position a bit to where we want to
    // start drawing the square.
    mat4.translate(
        modelViewMatrix, // destination matrix
        modelViewMatrix, // matrix to translate
        [-0.0, 0.0, -zoomFac]
    ); // amount to translate

    mat4.rotateZ(modelViewMatrix, modelViewMatrix, rotation);
    mat4.rotateY(modelViewMatrix, modelViewMatrix, rotation * 0.7);
    mat4.rotateX(modelViewMatrix, modelViewMatrix, rotation * 0.3);

    const normalMatrix = mat4.create();
    mat4.invert(normalMatrix, modelViewMatrix);
    mat4.transpose(normalMatrix, normalMatrix);

    // Tell WebGL to use our program when drawing
    gl.useProgram(program);

    const uProjectionMatrix = gl.getUniformLocation(program, "uProjectionMatrix");
    const uModelViewMatrix = gl.getUniformLocation(program, "uModelViewMatrix");
    const uNormalMatrix = gl.getUniformLocation(program, "uNormalMatrix");

    // Set the shader uniforms
    gl.uniformMatrix4fv(uProjectionMatrix, false, projectionMatrix);
    gl.uniformMatrix4fv(uModelViewMatrix, false, modelViewMatrix);
    gl.uniformMatrix4fv(uNormalMatrix, false, normalMatrix);

    // Draw square
    // gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    // Draw cube
    gl.drawElements(gl.TRIANGLES, 36, gl.UNSIGNED_SHORT, 0);
}
