import { useEffect, useRef, useState } from 'react';
import { cubeColors, cubeIndexes, cubeNormals, cubePoints } from "./geometry/cube";
import { drawScene, initBuffer, initElementBuffer, initShaderProgram } from './gl';

function Cube() {

    const [zoom, setZoom] = useState(85);

    const requestRef = useRef();
    const previousTimeRef = useRef();
    const glRef = useRef();
    const programRef = useRef();
    const rotateRef = useRef(0);
    const zoomRef = useRef(85);
    const indexCountRef = useRef(0);

    const animate = time => {
        if (previousTimeRef.current !== undefined) {
            time *= 0.001; // convert to seconds
            const delta = time - previousTimeRef.current;

            drawScene(glRef.current, programRef.current, rotateRef.current, 100 - zoomRef.current, indexCountRef.current);
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

        //const sphere = icosphere(0);
        // const positions = sphere.vertices;
        // const indexes = sphere.triangles;

        const program = initShaderProgram(gl, vCubeSource, fCubeSource);

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
        indexCountRef.current = indexes.length;

        requestRef.current = requestAnimationFrame(animate);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const updateZoom = (evt) => {
        setZoom(evt.target.value);
        zoomRef.current = evt.target.value;
    }

    return (
        <>
        <canvas id="glcanvas" width="640" height="480"></canvas>
        <div className="control">
            <label>Zoom: </label>
            <input type="range" id="slider" min="1" max="100" value={zoom} onChange={updateZoom} />
            <div>{zoom}</div>
        </div>
        </>
    )
}

export default Cube;

// Vertex shader program
const vCubeSource = `
    attribute vec4 aVertexPosition;
    attribute vec4 aVertexColor;
    attribute vec3 aVertexNormal;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;

    varying lowp vec4 vColor;
    varying highp vec3 vLighting;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;
        vColor = aVertexColor;

        highp vec3 ambientLight = vec3(0.1, 0.1, 0.1);
        highp vec3 directionalLightColor = vec3(1, 1, 1);
        highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

        highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

        highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
        vLighting = ambientLight + (directionalLightColor * directional);
    }
`;

const fCubeSource = `
    varying lowp vec4 vColor;
    varying highp vec3 vLighting;

    void main() {
        gl_FragColor = vec4(vColor.xyz * vLighting, 1);
    }
`;
