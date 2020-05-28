/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

import Vector3 from "~/math/Vector3";
import SymmetricMatrix from "~/math/SymmetricMatrix";

class Vertex {
  public originalIndex: number;
  public p: Vector3;
  public tstart: number;
  public tcount: number;
  public q: SymmetricMatrix;
  public border: boolean;

  constructor(idx: number) {
    this.originalIndex = idx;
    this.p = new Vector3();
    this.tstart = 0;
    this.tcount = 0;
    this.q = new SymmetricMatrix();
    this.border = false;
  }
}

export default Vertex;
