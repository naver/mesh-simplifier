/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

import Vector3 from "./Vector3";

class Face3 {
  public index: number;
  public normal: Vector3;

  constructor(
    public a: number,
    public b: number,
    public c: number
  ) {}
}

export default Face3;
