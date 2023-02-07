import { useEffect } from "react";
import { drawScene, initBuffer, initElementBuffer, initShaderProgram } from "./gl";
import { icosphere } from "./geometry/icosphere";

function Sphere() {

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

        const sphere = icosphere(1);

        const program = initShaderProgram(gl, vSource, fSource);

        // Now create an array of positions for the square.
        initBuffer(gl, program, sphere.vertices, "aVertexPosition", 3);

        // Index buffer
        initElementBuffer(gl, sphere.triangles);

        // Normal buffer
        initBuffer(gl, program, sphere.vertices, "aVertexNormal", 3);

        drawScene(gl, program, 0, 10, sphere.triangles.length);
    }, [])

    return (
        <>
            <canvas id="glcanvas" width="640" height="480"></canvas>
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
