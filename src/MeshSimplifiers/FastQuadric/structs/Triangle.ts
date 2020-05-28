/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

import Vector3 from "~/math/Vector3";

class Triangle {
  public originalIndex: number;
  public v: [number, number, number];
  public err: [number, number, number, number];
  public deleted: boolean;
  public dirty: boolean;
  public n: Vector3;

  constructor(idx: number) {
    this.originalIndex = idx;
    this.v = [0, 0, 0];
    this.err = [0, 0, 0, 0];
    this.deleted = false;
    this.dirty = false;
    this.n = new Vector3();
  }
}

export default Triangle;
