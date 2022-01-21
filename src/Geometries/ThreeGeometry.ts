/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

import * as THREE from "three";
import Geometry from "./Geometry";
import Vector3 from "~/math/Vector3";
import Face3 from "~/math/Face3";
import { getUintArrayByVertexLength } from "~/utils";

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
  public originalGeometry: THREE.BufferGeometry;

  constructor(geometry: THREE.BufferGeometry) {
    this.originalGeometry = geometry;
  }

  public prepare() {
    const geometry = this.originalGeometry;
    const position = geometry.attributes.position;
    const face = geometry.index;

    const vertexCount = position?.count ?? 0;
    const faceCount = (face?.count ?? 0) / 3;

    const vertices = new Array(vertexCount);
    const faces = new Array(faceCount);

    for (let idx = 0; idx < vertexCount; idx++) {
      const startIdx = position.itemSize * idx;
      const arr = position.array;

      vertices[idx] = new Vector3(
        arr[startIdx + 0],
        arr[startIdx + 1],
        arr[startIdx + 2]
      );
    }

    for (let idx = 0; idx < faceCount; idx++) {
      const startIdx = 3 * idx;
      const arr = face!.array;

      faces[idx] = new Face3(
        arr[startIdx + 0],
        arr[startIdx + 1],
        arr[startIdx + 2]
      );
    }

    return {
      vertices,
      faces
    }
  }

  public update(datas: {
    vertices: Vector3[],
    faces: Face3[],
    unculledVertices: number[],
    unculledFaces: number[],
  }): this {
    const { vertices, faces, unculledVertices } = datas

    const geometry = this.originalGeometry;
    const hasUV = geometry.hasAttribute("uv");

    if (hasUV) {
      const uvArray = new Float32Array(2 * vertices.length);
      const origUV = geometry.attributes.uv;

      unculledVertices.forEach((vertexIdx, idx) => {
        const offset = idx * 2;
        uvArray[offset + 0] = origUV.getX(vertexIdx);
        uvArray[offset + 1] = origUV.getY(vertexIdx);
      });

      geometry.setAttribute("uv", new THREE.BufferAttribute(uvArray, 2));
    }

    const IndexTypedArray = getUintArrayByVertexLength(vertices.length);

    const vertexArray = new Float32Array(3 * vertices.length);
    const faceArray = new IndexTypedArray(3 * faces.length);

    vertices.forEach((vertex, idx) => {
      const offset = idx * 3;
      vertexArray[offset + 0] = vertex.x;
      vertexArray[offset + 1] = vertex.y;
      vertexArray[offset + 2] = vertex.z;
    });

    faces.forEach((face, idx) => {
      const offset = idx * 3;
      faceArray[offset + 0] = face.a;
      faceArray[offset + 1] = face.b;
      faceArray[offset + 2] = face.c;
    });

    const vertexBuffer = new THREE.BufferAttribute(vertexArray, 3);
    const faceBuffer = new THREE.BufferAttribute(faceArray, 1);

    geometry.setAttribute("position", vertexBuffer);
    geometry.setIndex(faceBuffer);

    geometry.computeVertexNormals();

    return this;
  }
}

export default ThreeGeometry;
