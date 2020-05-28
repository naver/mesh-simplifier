/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

import Geometry from "~/Geometries/Geometry";

interface MeshSimplifier {
  simplify(geometry: Geometry): this;
}

export default MeshSimplifier;
