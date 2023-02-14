import { useEffect, useRef, useState } from "react";
import { drawArrayScene, initBuffer, initShaderProgram } from "./gl";
import { uvsphere } from "./geometry/uvsphere";

function Sphere() {

    const [zoom, setZoom] = useState(0);
    const [doRotate, setDoRotate] = useState(false);
    const [rotateX, setRotateX] = useState(Math.PI);
    const [rotateY, setRotateY] = useState(0);
    const [prevMouseX, setPrevMouseX] = useState(0);
    const [prevMouseY, setPrevMouseY] = useState(0);

    const initialized = useRef(false);
    const glRef = useRef();
    const programRef = useRef();
    const indexCount = useRef(0);
    const imageRef = useRef(undefined);

    useEffect(() => {
        const image = new Image();
        image.src = "./2k_earth_daymap.jpeg";
        image.onload = function () {
            imageRef.current = image;
            setZoom(prev => prev + 1);
        }
    }, []);

    useEffect(() => {

        if (imageRef.current === undefined) {
            return;
        }

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

            //const sphere = icosphere(3, true);
            const sphere2 = uvsphere(64, 32);

            const program = initShaderProgram(gl, vSource, fSource);

            // Now create an array of positions for the square.
            initBuffer(gl, program, sphere2.vertices, "aVertexPosition", 3);

            // UVs
            initBuffer(gl, program, sphere2.uv, "aTexCoord", 2);

            // Index buffer
            //initElementBuffer(gl, sphere.triangles);

            // Normal buffer
            initBuffer(gl, program, sphere2.vertices, "aVertexNormal", 3);

            // Create a texture.
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Set the parameters so we can render any size image.
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            // // Upload the image into the texture.
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imageRef.current);

            initialized.current = true;

            glRef.current = gl;
            programRef.current = program;
            //indexCount.current = sphere.triangles.length;
            indexCount.current = sphere2.vertices.length / 3;
        }

        //drawScene(glRef.current, programRef.current, rotateX, rotateY, 0, zoom, indexCount.current);
        drawArrayScene(glRef.current, programRef.current, rotateX, rotateY, 0, zoom, indexCount.current);
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
            <canvas id="glcanvas" width="800" height="600"
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
    attribute vec2 aTexCoord;

    uniform mat4 uModelViewMatrix;
    uniform mat4 uProjectionMatrix;
    uniform mat4 uNormalMatrix;

    varying highp vec3 vLighting;
    varying highp vec2 vTexCoord;

    void main() {
        gl_Position = uProjectionMatrix * uModelViewMatrix * aVertexPosition;

        highp vec3 ambientLight = vec3(0.1, 0.1, 0.1);
        highp vec3 directionalLightColor = vec3(1, 1, 1);
        highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

        highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

        highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
        vLighting = ambientLight + (directionalLightColor * directional);

        vTexCoord = aTexCoord;
    }
`;

const fSource = `
    uniform sampler2D u_image;

    varying highp vec3 vLighting;
    varying highp vec2 vTexCoord;

    void main() {
        gl_FragColor = vec4(texture2D(u_image, vTexCoord).rgb * vLighting, 1);
    }
`;
