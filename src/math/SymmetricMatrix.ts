/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

// Original code from
// https://github.com/sp4cerat/Fast-Quadric-Mesh-Simplification/blob/master/src.gl/Simplify.h

class SymmetricMatrix {
  static makePlane(a: number, b: number, c: number, d: number): SymmetricMatrix {
    return new SymmetricMatrix(
      a * a, a * b, a * c, a * d,
             b * b, b * c, b * d,
                    c * c, c * d,
                           d * d,
    );
  }

  public m: number[];

  constructor(
    m11: number = 0, m12: number = 0, m13: number = 0, m14: number = 0,
                     m22: number = 0, m23: number = 0, m24: number = 0,
                                      m33: number = 0, m34: number = 0,
                                                       m44: number = 0,
  ) {
    this.m = new Array(10);
    this.set(m11, m12, m13, m14, m22, m23, m24, m33, m34, m44);
  }

  public copy(other: SymmetricMatrix): this {
    const m = other.m;
    this.m = m.concat();
    return this;
  }

  public set(
    m11: number, m12: number, m13: number, m14: number,
                 m22: number, m23: number, m24: number,
                              m33: number, m34: number,
                                           m44: number,
  ) {
    const m = this.m;
    m[0] = m11; m[1] = m12; m[2] = m13; m[3] = m14;
                m[4] = m22; m[5] = m23; m[6] = m24;
                            m[7] = m33; m[8] = m34;
                                        m[9] = m44;
  }

  public det(
    a11: number, a12: number, a13: number,
    a21: number, a22: number, a23: number,
    a31: number, a32: number, a33: number,
  ): number {
    const m = this.m;
    const det = m[a11] * m[a22] * m[a33]
      + m[a13] * m[a21] * m[a32]
      + m[a12] * m[a23] * m[a31]
      - m[a13] * m[a22] * m[a31]
      - m[a11] * m[a23] * m[a32]
      - m[a12] * m[a21] * m[a33];
    return det;
  }

  public add(other: SymmetricMatrix): this {
    const m = this.m;
    const n = other.m;
    this.set(
      m[0] + n[0], m[1] + n[1], m[2] + n[2], m[3] + n[3],
                   m[4] + n[4], m[5] + n[5], m[6] + n[6],
                                m[7] + n[7], m[8] + n[8],
                                             m[9] + n[9],
    );

    return this;
  }
}

export default SymmetricMatrix;
