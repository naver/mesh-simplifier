/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

class Vector3 {
  static addVectors(v1: Vector3, v2: Vector3) {
    return new Vector3().copy(v1).add(v2);
  }

  static subVectors(v1: Vector3, v2: Vector3) {
    return new Vector3().copy(v1).sub(v2);
  }

  public x: number;
  public y: number;
  public z: number;

  constructor(v0: number = 0, v1: number = 0, v2: number = 0) {
    this.x = v0;
    this.y = v1;
    this.z = v2;
  }

  public copy(other: Vector3) {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
    return this;
  }

  public add(other: Vector3) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
    return this;
  }

  public sub(other: Vector3) {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
    return this;
  }

  public dot(other: Vector3): number {
    const { x: x1, y: y1, z: z1 } = this;
    const { x: x2, y: y2, z: z2 } = other;

    return x1 * x2 + y1 * y2 + z1 * z2;
  }

  public cross(other: Vector3): this {
    const { x: x1, y: y1, z: z1 } = this;
    const { x: x2, y: y2, z: z2 } = other;

    this.x = y1 * z2 - z1 * y2;
    this.y = z1 * x2 - x1 * z2;
    this.z = x1 * y2 - y1 * x2;
    return this;
  }

  public normalize(): this {
    const length = this.length();

    if (length > 0) {
      const invLength = 1 / length;
      this.x *= invLength;
      this.y *= invLength;
      this.z *= invLength;
    }

    return this;
  }

  public length(): number {
    const { x, y, z } = this;
    return Math.sqrt(x * x + y * y + z * z);
  }

  public scaleSclar(factor: number): this {
    this.x *= factor;
    this.y *= factor;
    this.z *= factor;

    return this;
  }
}

export default Vector3;
