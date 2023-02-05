import { useEffect } from 'react';
import './App.css';
import { drawScene, initBuffer } from './gl';
import { initShaderProgram } from './shaders';

function App() {

  useEffect(() => {
    setup();
  }, []);

  function setup() {
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

    const programInfo = {
      program: program,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(program, "aVertexPosition"),
      },
      uniformLocations: {
        projectionMatrix: gl.getUniformLocation(program, "uProjectionMatrix"),
        modelViewMatrix: gl.getUniformLocation(program, "uModelViewMatrix"),
      },
    };

    // Now create an array of positions for the square.
    const positions = [1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, -1.0];

    const buffer = initBuffer(gl, positions);
    drawScene(gl, programInfo, buffer);
  }

  return (
    <div className="App">
      <canvas id="glcanvas" width="640" height="480"></canvas>
    </div>
  );
}

export default App;
