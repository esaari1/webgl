export function icosphere(order = 0) {
    // set up a 20-triangle icosahedron
    const f = (1 + 5 ** 0.5) / 2;
    const T = 4 ** order;

    const vertices = new Float32Array((10 * T + 2) * 3);
    vertices.set(Float32Array.of(
        -1, f, 0, 1, f, 0, -1, -f, 0, 1, -f, 0,
        0, -1, f, 0, 1, f, 0, -1, -f, 0, 1, -f,
        f, 0, -1, f, 0, 1, -f, 0, -1, -f, 0, 1));
    let triangles = Uint16Array.of(
        0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11,
        11, 10, 2, 5, 11, 4, 1, 5, 9, 7, 1, 8, 10, 7, 6,
        3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9,
        9, 8, 1, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7);

    let v = 12;
    const midCache = order ? new Map() : null; // midpoint vertices cache to avoid duplicating shared vertices

    function addMidPoint(a, b) {
        const key = Math.floor((a + b) * (a + b + 1) / 2) + Math.min(a, b); // Cantor's pairing function
        let i = midCache.get(key);
        if (i !== undefined) { midCache.delete(key); return i; }
        midCache.set(key, v);
        for (let k = 0; k < 3; k++) vertices[3 * v + k] = (vertices[3 * a + k] + vertices[3 * b + k]) / 2;
        i = v++;
        return i;
    }

    let trianglesPrev = triangles;
    for (let i = 0; i < order; i++) {
        // subdivide each triangle into 4 triangles
        triangles = new Uint32Array(trianglesPrev.length * 4);
        for (let k = 0; k < trianglesPrev.length; k += 3) {
            const v1 = trianglesPrev[k + 0];
            const v2 = trianglesPrev[k + 1];
            const v3 = trianglesPrev[k + 2];
            const a = addMidPoint(v1, v2);
            const b = addMidPoint(v2, v3);
            const c = addMidPoint(v3, v1);
            let t = k * 4;
            triangles[t++] = v1; triangles[t++] = a; triangles[t++] = c;
            triangles[t++] = v2; triangles[t++] = b; triangles[t++] = a;
            triangles[t++] = v3; triangles[t++] = c; triangles[t++] = b;
            triangles[t++] = a; triangles[t++] = b; triangles[t++] = c;
        }
        trianglesPrev = triangles;
    }
    // normalize vertices
    for (let i = 0; i < vertices.length; i += 3) {
        const m = 1 / Math.hypot(vertices[i + 0], vertices[i + 1], vertices[i + 2]);
        vertices[i + 0] *= m;
        vertices[i + 1] *= m;
        vertices[i + 2] *= m;
    }
    return { vertices, triangles };
}
