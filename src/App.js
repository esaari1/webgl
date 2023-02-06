import { useEffect, useRef, useState } from 'react';
import './App.css';
import { cubeColors, cubeIndexes, cubeNormals, cubePoints } from './geometry/cube';
import { drawScene, initBuffer, initElementBuffer } from './gl';
import { initShaderProgram } from './shaders';

function App() {

  const [zoom, setZoom] = useState(85);
  //const [rotation, setRotation] = useState(0);

  const requestRef = useRef();
  const previousTimeRef = useRef();
  const glRef = useRef();
  const programRef = useRef();
  const rotateRef = useRef(0);
  const zoomRef = useRef(85);

  const animate = time => {
    if (previousTimeRef.current !== undefined) {
      time *= 0.001; // convert to seconds
      const delta = time - previousTimeRef.current;

      drawScene(glRef.current, programRef.current, rotateRef.current, 100 - zoomRef.current);
      rotateRef.current += delta;
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }

  useEffect(() => {
    const canvas = document.querySelector("#glcanvas");
    // Initialize the GL context
    const gl = canvas.getContext("webgl");

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
    initBuffer(gl, program, normals, "aVertexNormal", 3);

    glRef.current = gl;
    programRef.current = program;

    requestRef.current = requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateZoom = (evt) => {
    setZoom(evt.target.value);
    zoomRef.current = evt.target.value;
  }

  return (
    <div className="App">
      <canvas id="glcanvas" width="640" height="480"></canvas>
      <div className="control">
        <label>Zoom: </label>
        <input type="range" id="slider" min="1" max="100" value={zoom} onChange={updateZoom} />
        <div>{zoom}</div>
      </div>
    </div>
  );
}

export default App;
