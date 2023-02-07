import { useEffect, useRef, useState } from "react";
import { drawScene, initBuffer, initElementBuffer, initShaderProgram } from "./gl";
import { icosphere } from "./geometry/icosphere";

function Sphere() {

    const [zoom, setZoom] = useState(10);
    const [doRotate, setDoRotate] = useState(false);
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [prevMouseX, setPrevMouseX] = useState(0);
    const [prevMouseY, setPrevMouseY] = useState(0);

    const initialized = useRef(false);
    const glRef = useRef();
    const programRef = useRef();
    const indexCount = useRef(0);

    useEffect(() => {

        if (!initialized.current) {
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

            const sphere = icosphere(1);

            const program = initShaderProgram(gl, vSource, fSource);

            // Now create an array of positions for the square.
            initBuffer(gl, program, sphere.vertices, "aVertexPosition", 3);

            // Index buffer
            initElementBuffer(gl, sphere.triangles);

            // Normal buffer
            initBuffer(gl, program, sphere.vertices, "aVertexNormal", 3);

            initialized.current = true;

            glRef.current = gl;
            programRef.current = program;
            indexCount.current = sphere.triangles.length;
        }

        drawScene(glRef.current, programRef.current, rotateX, rotateY, 0, zoom, indexCount.current);
    }, [zoom, rotateX, rotateY])

    const handleZoom = (evt) => {
        setZoom(previousZoom => previousZoom + evt.deltaY * 0.05);
    }

    const handleStartRotate = (evt) => {
        setPrevMouseX(evt.clientX);
        setPrevMouseY(evt.clientY);
        setDoRotate(true);
    }

    const handleStopRotate = () => {
        setDoRotate(false);
    }

    const handleRotate = (evt) => {
        if (doRotate) {
            const deltaX = evt.clientX - prevMouseX;
            setRotateY(prevRotateX => prevRotateX + deltaX * 0.01);
            setPrevMouseX(evt.clientX);

            const deltaY = evt.clientY - prevMouseY;
            setRotateX(prevRotateX => prevRotateX + deltaY * 0.01);
            setPrevMouseY(evt.clientY);
        }
    }

    return (
        <>
            <canvas id="glcanvas" width="640" height="480"
                onWheel={handleZoom}
                onMouseDown={handleStartRotate}
                onMouseUp={handleStopRotate}
                onMouseMove={handleRotate}></canvas>
        </>
    )
}

export default Sphere;

const vSource = `
    attribute vec4 aVertexPosition;
    attribute vec3 aVertexNormal;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;

    varying highp vec3 vLighting;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

        highp vec3 ambientLight = vec3(0.1, 0.1, 0.1);
        highp vec3 directionalLightColor = vec3(1, 1, 1);
        highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

        highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

        highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
        vLighting = ambientLight + (directionalLightColor * directional);
    }
`;

const fSource = `
    varying highp vec3 vLighting;

    void main() {
        gl_FragColor = vec4(vLighting, 1);
    }
`;
