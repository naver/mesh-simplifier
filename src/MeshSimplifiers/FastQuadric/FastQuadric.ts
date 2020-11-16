/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 * Original code: https://github.com/sp4cerat/Fast-Quadric-Mesh-Simplification
 * License: MIT
 */

import MeshSimplifier from "../MeshSimplifier";
import Triangle from "./structs/Triangle";
import Vertex from "./structs/Vertex";
import Ref from "./structs/Ref";
import Vector3 from "~/math/Vector3";
import Face3 from "~/math/Face3";
import SymmetricMatrix from "~/math/SymmetricMatrix";
import Adapter from "~/Adapters/Adapter";
import Geometry from "~/Geometries/Geometry";
import Timer from "~/util/Timer";

class FastQuadric implements MeshSimplifier {
  /* Options */
  public targetPercentage: number;
  public aggressiveness: number;

  private _triangles: Triangle[];
  private _vertices: Vertex[];
  private _refs: Ref[];
  private _timer: Timer;

  public get timeConsumed() { return this._timer.diff; }

  constructor({
    targetPercentage = 0.5,
    aggressiveness = 7
  } = {}) {
    this._triangles = [];
    this._vertices = [];
    this._refs = [];
    this.targetPercentage = targetPercentage;
    this.aggressiveness = aggressiveness;
    this._timer = new Timer();
  }

  public simplify(target: Adapter | Geometry): this {
    const timer = this._timer;
    timer.start();

    if ((target as Adapter).geometries) {
      (target as Adapter).geometries.forEach(geometry => {
        this._process(geometry);
      });
    } else {
      this._process(target as Geometry);
    }

    timer.end();

    return this;
  }

  private _process(geometry: Geometry) {
    this._getData(geometry);

    const triangles = this._triangles;
    const vertices = this._vertices;
    const refs = this._refs;
    const targetPercentage = this.targetPercentage;
    const aggressiveness = this.aggressiveness;

    const targetCount = this._triangles.length * targetPercentage;

    triangles.forEach(triangle => triangle.deleted = false);

    let deletedTriangles: number = 0;
    const deleted0: boolean[] = [];
    const deleted1: boolean[] = [];
    const triangleCount = triangles.length;

    for (let iteration = 0; iteration < 100; iteration++) {
      // Break when target number of triangles reached
      if (triangleCount - deletedTriangles <= targetCount) break;

      // Update mesh once in a while
			if (iteration % 5 === 0) {
				this._updateMesh(iteration);
      }

      // Clear dirty flag
      triangles.forEach(triangle => triangle.dirty = false);

      //
			// All triangles with edges below the threshold will be removed
			//
			// The following numbers works well for most models.
			// If it does not, try to adjust the 3 parameters
      //
      const threshold = 0.000000001 * Math.pow(iteration + 3, aggressiveness);

      for (let i = triangles.length - 1; i >= 0; i--) {
        const t = triangles[i];
        if (t.err[3] > threshold || t.deleted || t.dirty) continue;

        for (let j = 0; j < 3; j++) {
          if (t.err[j] < threshold) {
            const i0 = t.v[j];
            const i1 = t.v[(j + 1) % 3];

            const v0 = vertices[i0];
            const v1 = vertices[i1];

            // Border check
            if (v0.border || v1.border) continue;

            // Compute vertex to collapse to
            const p = new Vector3();
            this._calculateError(i0, i1, p);

            deleted0.splice(0); // normals temporarily
            deleted1.splice(0); // normals temporarily

            // Don't remove if flipped
            if (this._flipped(p, i1, v0, deleted0)) continue;
            if (this._flipped(p, i0, v1, deleted1)) continue;

            // Not flipped, so remove edge
            v0.p = p;
            v0.q.add(v1.q);

            const tstart = refs.length;

            deletedTriangles += this._updateTriangles(i0, v0, deleted0);
            deletedTriangles += this._updateTriangles(i0, v1, deleted1);

            const tcount = refs.length - tstart;

            v0.tstart = tstart;
            v0.tcount = tcount;
            break;
          }
        }

        // Done?
        if (triangleCount - deletedTriangles <= targetCount) break;
      }
    }

    this._compactMesh();

    this._setData(geometry);
  }

  private _getData(geometry: Geometry) {
    const data = geometry.prepare();

    this._vertices = data.vertices.map((v, idx) => {
      const vertex = new Vertex(idx);
      vertex.p.copy(v);
      return vertex;
    });

    this._triangles = data.faces.map((f, idx) => {
      const triangle = new Triangle(idx);
      triangle.v = [f.a, f.b, f.c];
      return triangle;
    });

    this._refs = [];
  }

  private _setData(geometry: Geometry) {
    const triangles = this._triangles;

    const vertices = this._vertices.map(vertex => vertex.p);
    const faces = triangles.map(triangle => {
      const v = triangle.v;
      return new Face3(v[0], v[1], v[2]);
    });

    const unculledVertices = this._vertices.map(v => v.originalIndex);
    const unculledFaces = this._triangles.map(f => f.originalIndex);

    geometry.update({
      vertices,
      faces,
      unculledVertices,
      unculledFaces,
    });
  }

  private _flipped(p: Vector3, i: number, v: Vertex, deleted: boolean[]): boolean {
    const triangles = this._triangles;
    const vertices = this._vertices;
    const refs = this._refs;

    for (let k = 0; k < v.tcount; k++) {
      const ref = refs[v.tstart + k];
      const t = triangles[ref.tid];
      if (t.deleted) continue;

      const s = ref.tvertex;
      const id1 = t.v[(s + 1) % 3];
      const id2 = t.v[(s + 2) % 3];

      if (id1 === i || id2 === i) {
        deleted[k] = true;
        continue;
      }

      const d1 = Vector3.subVectors(vertices[id1].p, p);
      const d2 = Vector3.subVectors(vertices[id2].p, p);
      d1.normalize();
      d2.normalize();

      if (Math.abs(d1.dot(d2)) > 0.999) return true;

      const n = new Vector3().copy(d1).cross(d2);
      n.normalize();
      deleted[k] = false;
      if (n.dot(t.n) < 0.2) return true;
    }
    return false;
  }

  private _updateTriangles(i: number, v: Vertex, deleted: boolean[]): number {
    const triangles = this._triangles;
    const refs = this._refs;
    const p = new Vector3();

    let deletedCount = 0;
    for (let k = 0; k < v.tcount; k++) {
      const r = refs[v.tstart + k];
      const t = triangles[r.tid];

      if (t.deleted) continue;
      if (deleted[k]) {
        t.deleted = true;
        deletedCount++;
        continue;
      }

      t.v[r.tvertex] = i;
      t.dirty = true;
      t.err[0] = this._calculateError(t.v[0], t.v[1], p);
      t.err[1] = this._calculateError(t.v[1], t.v[2], p);
      t.err[2] = this._calculateError(t.v[2], t.v[0], p);
      t.err[3] = Math.min(t.err[0], t.err[1], t.err[2]);
      refs.push(r);
    }

    return deletedCount;
  }

  private _updateMesh(iteration: number) {
    const vertices = this._vertices;
    const refs = this._refs;

		if (iteration > 0) {
      // compact triangles
      this._triangles = this._triangles.filter(triangle => !triangle.deleted);
		} else {
      //
      // Init Quadrics by Plane & Edge Errors
      //
      // required at the beginning ( iteration == 0 )
      // recomputing during the simplification is not required,
      // but mostly improves the result for closed meshes
      //
      vertices.forEach(vertex => vertex.q = new SymmetricMatrix());

      this._triangles.forEach(t => {
        const p = t.v.map(v => vertices[v].p);
        const n = Vector3.subVectors(p[1], p[0])
          .cross(Vector3.subVectors(p[2], p[0]))
          .normalize();

        t.n = n;
        const tmp = SymmetricMatrix.makePlane(n.x, n.y, n.z, -n.dot(p[0]));

        t.v.forEach(v => vertices[v].q.add(tmp));
      });

      this._triangles.forEach(t => {
        const p = new Vector3();
        t.v.forEach((v, i) => {
          t.err[i] = this._calculateError(v, t.v[(i + 1) % 3], p);
        });
      });
    }

    // Init Reference ID list
    vertices.forEach(vertex => {
      vertex.tstart = 0;
      vertex.tcount = 0;
    });

    const triangles = this._triangles;
    triangles.forEach(triangle => {
      triangle.v.forEach(v => vertices[v].tcount++);
    });

    let tstart = 0;
    vertices.forEach(v => {
      v.tstart = tstart;
      tstart += v.tcount;
      v.tcount = 0;
    });

    // Write References
    for (let i = refs.length; i < triangles.length * 3; i++) {
			refs[i] = new Ref();
		}

    triangles.forEach((t, i) => {
      for (let j = 0; j < 3; j++) {
        const v = vertices[t.v[j]];
        refs[v.tstart + v.tcount].tid = i;
        refs[v.tstart + v.tcount].tvertex = j;
        v.tcount++;
      };
    });

		// Identify boundary : vertices[].border=0,1
		if (iteration === 0) {
      vertices.forEach(vertex => vertex.border = false);
      vertices.forEach(v => {
        // clear
        const vcount: number[] = [];
        const vids: number[] = [];

        for (let i = 0; i < v.tcount; i++) {
          const k = refs[v.tstart + i].tid;
          const t = triangles[k];

          for (let j = 0; j < 3; j++) {
            const id = t.v[j];
            let ofs = 0;

            while (ofs < vcount.length) {
              if (vids[ofs] === id) break;
              ofs++;
            }

            if (ofs === vcount.length) {
              vcount.push(1);
              vids.push(id);
            } else {
              vcount[ofs]++;
            }
          };
        }

        for (let j = 0; j < vcount.length; j++) {
          if (vcount[j] === 1) {
            vertices[vids[j]].border = true;
          }
        };
      });
		}
  }

  // Error for one edge
  private _calculateError(idV1: number, idV2: number, result: Vector3) {
    // Compute interpolated vertex
    const vertices = this._vertices;
    const v1 = vertices[idV1];
    const v2 = vertices[idV2];
    const q = new SymmetricMatrix().copy(v1.q).add(v2.q);
    const border = v1.border && v2.border;
    const det = q.det(0, 1, 2, 1, 4, 5, 2, 5, 7);

    let error: number = 0;

    if (det !== 0 && !border) {
      // q_delta is invertible
      result.x = -1 / det * (q.det(1, 2, 3, 4, 5, 6, 5, 7, 8)); // vx = A41/det(q_delta)
      result.y =  1 / det * (q.det(0, 2, 3, 1, 5, 6, 2, 7, 8)); // vy = A42/det(q_delta)
      result.z = -1 / det * (q.det(0, 1, 3, 1, 4, 6, 2, 5, 8)); // vz = A43/det(q_delta)
      error = this._vertexError(q, result);
    } else {
      const p1 = v1.p;
      const p2 = v2.p;
      const p3 = new Vector3(
        (p1.x + p2.x) * 0.5,
        (p1.y + p2.y) * 0.5,
        (p1.z + p2.z) * 0.5,
      );

      const error1 = this._vertexError(q, p1);
      const error2 = this._vertexError(q, p2);
      const error3 = this._vertexError(q, p3);
      error = Math.min(error1, error2, error3);

      if (error1 === error) result.copy(p1);
      if (error2 === error) result.copy(p2);
      if (error3 === error) result.copy(p3);
    }

    return error;
  }

  private _vertexError(q: SymmetricMatrix, v: Vector3): number {
    const {x, y, z} = v;
    const m = q.m;

    const err = m[0] * x * x
      + 2 * m[1] * x * y
      + 2 * m[2] * x * z
      + 2 * m[3] * x
      +     m[4] * y * y
      + 2 * m[5] * y * z
      + 2 * m[6] * y
      +     m[7] * z * z
      + 2 * m[8] * z
      +     m[9];

    return err;
  }

  private _compactMesh() {
    this._triangles = this._triangles.filter(t => !t.deleted);

    const triangles = this._triangles;
    const vertices = this._vertices;

    vertices.forEach(vertex => vertex.tcount = 0);
    triangles.forEach(triangle => {
      triangle.v.forEach(v => {
        vertices[v].tcount = 1;
      });
    });

    let dst = 0;
    vertices.forEach(vertex => {
      if (vertex.tcount > 0) {
        vertex.tstart = dst;
        vertices[dst].originalIndex = vertex.originalIndex;
        vertices[dst].p = vertex.p;
        dst++;
      }
    });

    triangles.forEach(t => {
      t.v.forEach((v, i) => {
        t.v[i] = vertices[v].tstart;
      });
    });

    vertices.splice(dst); // resize
  }
}

export default FastQuadric;
