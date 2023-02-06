import { useEffect, useState } from 'react';
import './App.css';
import { cubeColors, cubeIndexes, cubeNormals, cubePoints } from './geometry/cube';
import { drawScene, initBuffer, initElementBuffer } from './gl';
import { initShaderProgram } from './shaders';

function App() {

  const [zoom, setZoom] = useState(6);

  useEffect(() => {
    setup();
  }, []);

  function setup() {
    const canvas = document.querySelector("#glcanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl");

    let rotation = 0;
    let delta = 0;

    // Only continue if WebGL is available and working
    if (gl === null) {
      alert(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
      return;
    }

    const program = initShaderProgram(gl);

    // Now create an array of positions for the square.
    const positions = cubePoints();
    initBuffer(gl, program, positions, "aVertexPosition", 3);

    // Index buffer
    const indexes = cubeIndexes();
    initElementBuffer(gl, indexes);

    // Color buffer
    const colors = cubeColors();
    initBuffer(gl, program, colors, "aVertexColor", 4);

    // Normal buffer
    const normals = cubeNormals();
    initBuffer(gl, program, normals, "aVertexNormal", 3)

    // no animation
    // drawScene(gl, program, rotation);
    let then = 0;

    // Draw the scene repeatedly
    function render(now) {
      now *= 0.001; // convert to seconds
      delta = now - then;
      then = now;

      drawScene(gl, program, rotation, 6);
      rotation += delta;

      requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
  }

  const updateZoom = (evt) => {
    setZoom(evt.target.value);
  }

  return (
    <div className="App">
      <canvas id="glcanvas" width="640" height="480"></canvas>
      <div className="control">
        <label>Zoom: </label>
        <input type="range" id="slider" min="1" max="10" value={zoom} onChange={updateZoom} />
        <div>{zoom}</div>
      </div>
    </div>
  );
}

export default App;
