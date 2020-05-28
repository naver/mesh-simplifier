/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

import * as THREE from "three";
import Geometry from "./Geometry";
import Vector3 from "~/math/Vector3";
import Face3 from "~/math/Face3";

// TODO: Support line geometry

/**
 * Adapter class for three.js geometry
 * @example
 * import * as THREE from "three";
 * import { FastQuadric, ThreeGeometry } from "mesh-simplifier";
 *
 * const geometry = new THREE.TorusKnotGeometry(10);
 * const adaptedGeometry = new ThreeGeometry(geometry);
 *
 * const simplifier = new FastQuadric();
 * simplifier.simplify(adaptedGeometry);
 *
 * // Now do whatever you want with simplified geometry
 * const material = new THREE.MeshBasicMaterial();
 * const mesh = new THREE.Mesh(adaptedGeometry.simplified, material);
 */
class ThreeGeometry implements Geometry {
  public originalGeometry: THREE.Geometry | THREE.BufferGeometry;
  private _processingGeometry: THREE.Geometry;
  private _isBufferGeometry: boolean;

  constructor(geometry: THREE.Geometry | THREE.BufferGeometry) {
    this._isBufferGeometry = (geometry as THREE.BufferGeometry).isBufferGeometry;
    this.originalGeometry = geometry;

    if (this._isBufferGeometry) {
      this._processingGeometry = new THREE.Geometry().fromBufferGeometry(geometry as THREE.BufferGeometry);
    } else {
      this._processingGeometry = this.originalGeometry as THREE.Geometry;
    }
  }

  public prepare() {
    const geometry = this._processingGeometry;
    geometry.mergeVertices();

    return {
      vertices: geometry.vertices.map(vec => new Vector3(vec.x, vec.y, vec.z)),
      faces: geometry.faces.map(face => new Face3(face.a, face.b, face.c)),
    }
  }

  public update(datas: {
    vertices: Vector3[],
    faces: Face3[],
    unculledVertices: number[],
    unculledFaces: number[],
  }): this {
    const { vertices, faces, unculledVertices, unculledFaces } = datas

    const geometry = this._processingGeometry;
    const faceVertexUVs = geometry.faceVertexUvs;
    const hasUV = faceVertexUVs[0] && faceVertexUVs[0].length > 0;
    const hasUV2 = faceVertexUVs[1] && faceVertexUVs[1].length > 0;

    geometry.vertices = vertices.map(vertex => new THREE.Vector3(vertex.x, vertex.y, vertex.z));
    geometry.faces = faces.map(face => new THREE.Face3(face.a, face.b, face.c));

    if (hasUV) {
      geometry.faceVertexUvs[0] = unculledFaces.map(faceIdx => {
        return geometry.faceVertexUvs[0][faceIdx];
      });
    }
    if (hasUV2) {
      geometry.faceVertexUvs[1] = unculledFaces.map(faceIdx => {
        return geometry.faceVertexUvs[1][faceIdx];
      });
    }

    geometry.computeFaceNormals();

    if (this._isBufferGeometry) {
      const origGeo = this.originalGeometry as THREE.BufferGeometry;

      const bufferGeo = new THREE.BufferGeometry().fromGeometry(geometry);
      const hasColor = origGeo.attributes.color && origGeo.attributes.color.count > 0;
      const hasTangent = origGeo.attributes.tangent && origGeo.attributes.tangent.count > 0;

      if (!hasColor) bufferGeo.deleteAttribute("color");
      if (hasTangent && hasUV) {
        const tangents = new Float32Array(faces.length * 12);

        faces.forEach((face, faceIdx) => {
          const faceVertices = [face.a, face.b, face.c].map(idx => geometry.vertices[idx]);
          const faceUVs = faceVertexUVs[0][faceIdx];

          const dPos0 = new THREE.Vector3().subVectors(faceVertices[1], faceVertices[0]);
          const dPos1 = new THREE.Vector3().subVectors(faceVertices[2], faceVertices[0]);

          const dUV0 = new THREE.Vector2().subVectors(faceUVs[1], faceUVs[0]);
          const dUV1 = new THREE.Vector2().subVectors(faceUVs[2], faceUVs[0]);

          const r = 1 / (dUV0.x * dUV1.y - dUV0.y * dUV1.x);
          const tangent = dPos0.multiplyScalar(dUV1.y).sub(dPos1.multiplyScalar(dUV0.y)).multiplyScalar(r).normalize();

          const faceOffset = faceIdx * 12;

          [0, 1, 2].forEach(vIdx => {
            const vertexOffset = faceOffset + vIdx * 4;
            tangents[vertexOffset + 0] = tangent.x;
            tangents[vertexOffset + 1] = tangent.y;
            tangents[vertexOffset + 2] = tangent.z;
            tangents[vertexOffset + 3] = 1;
          });
        });

        bufferGeo.setAttribute("tangent", new THREE.BufferAttribute(tangents, 4));
      }

      origGeo.copy(bufferGeo);
    } else {
      geometry.verticesNeedUpdate = true;
      geometry.elementsNeedUpdate = true;
      geometry.uvsNeedUpdate = true;
    }

    return this;
  }
}

export default ThreeGeometry;
