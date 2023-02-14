function getVertex(longitude, longitudeSpacing, latitude, latitudeSpacing) {

    const uv1 = longitude * longitudeSpacing;
    const uv2 = latitude * latitudeSpacing;

    const phi = uv1 * 2.0 * Math.PI;
    const theta = uv2 * Math.PI;

    const x = Math.cos(phi) * Math.sin(theta);
    const z = Math.sin(phi) * Math.sin(theta);
    const y = Math.cos(theta);

    return [x, y, z];
}

export function uvsphere(segments = 32, rings = 16) {

    const numVertices = ((segments * 6) + ((rings - 2) * segments * 6)) * 3;

    const vertices = new Float32Array(numVertices);
    const uv = new Float32Array(vertices.length / 3 * 2);

    // Poles
    //uv.set(Float32Array.of(0, 1, 0, 0));

    // +1.0f because there's a gap between the poles and the first parallel.
    const latitudeSpacing = 1.0 / (rings + 0.0);
    const longitudeSpacing = 1.0 / segments;

    let latitude = 1;
    let posIdx = 0;
    let uvIdx = 0;

    // south pole
    for (let longitude = 0; longitude < segments; longitude++) {
        const [x1, y1, z1] = getVertex(longitude, longitudeSpacing, latitude, latitudeSpacing);
        const [x2, y2, z2] = getVertex(longitude + 1, longitudeSpacing, latitude, latitudeSpacing);

        vertices[posIdx++] = 0; vertices[posIdx++] = 1; vertices[posIdx++] = 0;
        vertices[posIdx++] = x1; vertices[posIdx++] = y1; vertices[posIdx++] = z1;
        vertices[posIdx++] = x2; vertices[posIdx++] = y2; vertices[posIdx++] = z2;

        const u2 = Math.atan2(z1, x1) / (2 * Math.PI) + 0.5;
        const u3 = Math.atan2(z2, x2) / (2 * Math.PI) + 0.5;
        const u1 = (u2 + u3) / 2;

        uv[uvIdx++] = u1;
        uv[uvIdx++] = 1;

        uv[uvIdx++] = u2;
        uv[uvIdx++] = Math.asin(y1) / Math.PI + 0.5;

        uv[uvIdx++] = u3;
        uv[uvIdx++] = Math.asin(y2) / Math.PI + 0.5;
    }

    // center
    for (let latitude = 1; latitude < rings - 1; latitude++) {
        for (let longitude = 0; longitude < segments; longitude++) {
            const [x1, y1, z1] = getVertex(longitude, longitudeSpacing, latitude, latitudeSpacing);
            const [x2, y2, z2] = getVertex(longitude + 1, longitudeSpacing, latitude, latitudeSpacing);

            const [x3, y3, z3] = getVertex(longitude, longitudeSpacing, latitude + 1, latitudeSpacing);
            const [x4, y4, z4] = getVertex(longitude + 1, longitudeSpacing, latitude + 1, latitudeSpacing);

            vertices[posIdx++] = x1; vertices[posIdx++] = y1; vertices[posIdx++] = z1;
            vertices[posIdx++] = x2; vertices[posIdx++] = y2; vertices[posIdx++] = z2;
            vertices[posIdx++] = x3; vertices[posIdx++] = y3; vertices[posIdx++] = z3;

            vertices[posIdx++] = x2; vertices[posIdx++] = y2; vertices[posIdx++] = z2;
            vertices[posIdx++] = x4; vertices[posIdx++] = y4; vertices[posIdx++] = z4;
            vertices[posIdx++] = x3; vertices[posIdx++] = y3; vertices[posIdx++] = z3;

            let offset = 0;
            if (longitude === segments / 2) {
                offset = 1;
            }

            uv[uvIdx++] = Math.atan2(z1, x1) / (2 * Math.PI) + 0.5;
            uv[uvIdx++] = Math.asin(y1) / Math.PI + 0.5;

            uv[uvIdx++] = Math.atan2(z2, x2) / (2 * Math.PI) + 0.5 + offset;
            uv[uvIdx++] = Math.asin(y2) / Math.PI + 0.5;

            uv[uvIdx++] = Math.atan2(z3, x3) / (2 * Math.PI) + 0.5;
            uv[uvIdx++] = Math.asin(y3) / Math.PI + 0.5;

            uv[uvIdx++] = Math.atan2(z2, x2) / (2 * Math.PI) + 0.5 + offset;
            uv[uvIdx++] = Math.asin(y2) / Math.PI + 0.5;

            uv[uvIdx++] = Math.atan2(z4, x4) / (2 * Math.PI) + 0.5 + offset;
            uv[uvIdx++] = Math.asin(y4) / Math.PI + 0.5;

            uv[uvIdx++] = Math.atan2(z3, x3) / (2 * Math.PI) + 0.5;
            uv[uvIdx++] = Math.asin(y3) / Math.PI + 0.5;
        }
    }

    // north pole
    latitude = rings - 1;
    for (let longitude = 0; longitude < segments; longitude++) {
        const [x1, y1, z1] = getVertex(longitude, longitudeSpacing, latitude, latitudeSpacing);
        const [x2, y2, z2] = getVertex(longitude + 1, longitudeSpacing, latitude, latitudeSpacing);

        vertices[posIdx++] = 0; vertices[posIdx++] = -1; vertices[posIdx++] = 0;
        vertices[posIdx++] = x1; vertices[posIdx++] = y1; vertices[posIdx++] = z1;
        vertices[posIdx++] = x2; vertices[posIdx++] = y2; vertices[posIdx++] = z2;

        let offset = 0;
        if (longitude === segments / 2) {
            offset = 1;
        }

        const u2 = Math.atan2(z1, x1) / (2 * Math.PI) + 0.5;
        const u3 = Math.atan2(z2, x2) / (2 * Math.PI) + 0.5 + offset;
        const u1 = (u2 + u3) / 2;

        uv[uvIdx++] = u1;
        uv[uvIdx++] = 0;

        uv[uvIdx++] = u2;
        uv[uvIdx++] = Math.asin(y1) / Math.PI + 0.5;

        uv[uvIdx++] = u3;
        uv[uvIdx++] = Math.asin(y2) / Math.PI + 0.5;
    }

    return { vertices, uv };
}
