/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

import Vector3 from "~/math/Vector3";
import Face3 from "~/math/Face3";

interface Geometry {
  // TODO: support general per-vertex & per-face attributes rather than specifying uvs
  prepare(): {
    vertices: Vector3[],
    faces: Face3[],
  };
  update(datas: {
    vertices: Vector3[],
    faces: Face3[],
    unculledVertices: number[],
    unculledFaces: number[],
  }): this;
}

export default Geometry;
