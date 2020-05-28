/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

import * as Simplifiers from "./MeshSimplifiers";
import * as math from "./math";
import * as Geometries from "./Geometries";
import * as Adapters from "./Adapters";

export default {
  ...Simplifiers,
  ...math,
  ...Geometries,
  ...Adapters,
}
