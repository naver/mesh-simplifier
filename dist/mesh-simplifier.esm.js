/*
Copyright (c) 2020-present NAVER Corp.
name: mesh-simplifier
license: MIT
author: NAVER Corp.
repository: https://github.com/naver/mesh-simplifier
version: 1.0.1
*/
import * as THREE from 'three';

/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */
var Vector3 =
/*#__PURE__*/
function () {
  function Vector3(v0, v1, v2) {
    if (v0 === void 0) {
      v0 = 0;
    }

    if (v1 === void 0) {
      v1 = 0;
    }

    if (v2 === void 0) {
      v2 = 0;
    }

    this.x = v0;
    this.y = v1;
    this.z = v2;
  }

  var __proto = Vector3.prototype;

  Vector3.addVectors = function (v1, v2) {
    return new Vector3().copy(v1).add(v2);
  };

  Vector3.subVectors = function (v1, v2) {
    return new Vector3().copy(v1).sub(v2);
  };

  __proto.copy = function (other) {
    this.x = other.x;
    this.y = other.y;
    this.z = other.z;
    return this;
  };

  __proto.add = function (other) {
    this.x += other.x;
    this.y += other.y;
    this.z += other.z;
    return this;
  };

  __proto.sub = function (other) {
    this.x -= other.x;
    this.y -= other.y;
    this.z -= other.z;
    return this;
  };

  __proto.dot = function (other) {
    var _a = this,
        x1 = _a.x,
        y1 = _a.y,
        z1 = _a.z;

    var x2 = other.x,
        y2 = other.y,
        z2 = other.z;
    return x1 * x2 + y1 * y2 + z1 * z2;
  };

  __proto.cross = function (other) {
    var _a = this,
        x1 = _a.x,
        y1 = _a.y,
        z1 = _a.z;

    var x2 = other.x,
        y2 = other.y,
        z2 = other.z;
    this.x = y1 * z2 - z1 * y2;
    this.y = z1 * x2 - x1 * z2;
    this.z = x1 * y2 - y1 * x2;
    return this;
  };

  __proto.normalize = function () {
    var length = this.length();

    if (length > 0) {
      var invLength = 1 / length;
      this.x *= invLength;
      this.y *= invLength;
      this.z *= invLength;
    }

    return this;
  };

  __proto.length = function () {
    var _a = this,
        x = _a.x,
        y = _a.y,
        z = _a.z;

    return Math.sqrt(x * x + y * y + z * z);
  };

  __proto.scaleSclar = function (factor) {
    this.x *= factor;
    this.y *= factor;
    this.z *= factor;
    return this;
  };

  return Vector3;
}();

/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

var Triangle =
/*#__PURE__*/
function () {
  function Triangle(idx) {
    this.originalIndex = idx;
    this.v = [0, 0, 0];
    this.err = [0, 0, 0, 0];
    this.deleted = false;
    this.dirty = false;
    this.n = new Vector3();
  }

  return Triangle;
}();

/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */
// Original code from
// https://github.com/sp4cerat/Fast-Quadric-Mesh-Simplification/blob/master/src.gl/Simplify.h
var SymmetricMatrix =
/*#__PURE__*/
function () {
  function SymmetricMatrix(m11, m12, m13, m14, m22, m23, m24, m33, m34, m44) {
    if (m11 === void 0) {
      m11 = 0;
    }

    if (m12 === void 0) {
      m12 = 0;
    }

    if (m13 === void 0) {
      m13 = 0;
    }

    if (m14 === void 0) {
      m14 = 0;
    }

    if (m22 === void 0) {
      m22 = 0;
    }

    if (m23 === void 0) {
      m23 = 0;
    }

    if (m24 === void 0) {
      m24 = 0;
    }

    if (m33 === void 0) {
      m33 = 0;
    }

    if (m34 === void 0) {
      m34 = 0;
    }

    if (m44 === void 0) {
      m44 = 0;
    }

    this.m = new Array(10);
    this.set(m11, m12, m13, m14, m22, m23, m24, m33, m34, m44);
  }

  var __proto = SymmetricMatrix.prototype;

  SymmetricMatrix.makePlane = function (a, b, c, d) {
    return new SymmetricMatrix(a * a, a * b, a * c, a * d, b * b, b * c, b * d, c * c, c * d, d * d);
  };

  __proto.copy = function (other) {
    var m = other.m;
    this.m = m.concat();
    return this;
  };

  __proto.set = function (m11, m12, m13, m14, m22, m23, m24, m33, m34, m44) {
    var m = this.m;
    m[0] = m11;
    m[1] = m12;
    m[2] = m13;
    m[3] = m14;
    m[4] = m22;
    m[5] = m23;
    m[6] = m24;
    m[7] = m33;
    m[8] = m34;
    m[9] = m44;
  };

  __proto.det = function (a11, a12, a13, a21, a22, a23, a31, a32, a33) {
    var m = this.m;
    var det = m[a11] * m[a22] * m[a33] + m[a13] * m[a21] * m[a32] + m[a12] * m[a23] * m[a31] - m[a13] * m[a22] * m[a31] - m[a11] * m[a23] * m[a32] - m[a12] * m[a21] * m[a33];
    return det;
  };

  __proto.add = function (other) {
    var m = this.m;
    var n = other.m;
    this.set(m[0] + n[0], m[1] + n[1], m[2] + n[2], m[3] + n[3], m[4] + n[4], m[5] + n[5], m[6] + n[6], m[7] + n[7], m[8] + n[8], m[9] + n[9]);
    return this;
  };

  return SymmetricMatrix;
}();

/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

var Vertex =
/*#__PURE__*/
function () {
  function Vertex(idx) {
    this.originalIndex = idx;
    this.p = new Vector3();
    this.tstart = 0;
    this.tcount = 0;
    this.q = new SymmetricMatrix();
    this.border = false;
  }

  return Vertex;
}();

/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */
var Ref =
/*#__PURE__*/
function () {
  function Ref() {
    this.tid = 0;
    this.tvertex = 0;
  }

  return Ref;
}();

/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */
var Face3 =
/*#__PURE__*/
function () {
  function Face3(a, b, c) {
    this.a = a;
    this.b = b;
    this.c = c;
  }

  return Face3;
}();

/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */
var Timer =
/*#__PURE__*/
function () {
  function Timer() {
    this._diff = 0;
    this._startTime = null;
  }

  var __proto = Timer.prototype;
  Object.defineProperty(__proto, "diff", {
    /**
     * Time diff in miliseconds
     */
    get: function () {
      return this._diff;
    },
    enumerable: false,
    configurable: true
  });

  __proto.start = function () {
    if (typeof process !== "undefined" && process.hrtime) {
      // Use high resolution timer in Node
      this._startTime = process.hrtime();
    } else {
      this._startTime = Date.now();
    }
  };

  __proto.end = function () {
    // Not started
    if (this._startTime == null) return;

    if (typeof process !== "undefined" && process.hrtime) {
      // Use high resolution timer in Node
      var diff = process.hrtime(this._startTime);
      var diffInMiliSeconds = 1000 * (diff[0] + diff[1] * 1e-9); // diff[1] is in nanoseconds

      this._diff = diffInMiliSeconds;
    } else {
      this._diff = Date.now() - this._startTime;
    }

    this._startTime = null;
  };

  return Timer;
}();

/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 * Original code: https://github.com/sp4cerat/Fast-Quadric-Mesh-Simplification
 * License: MIT
 */

var FastQuadric =
/*#__PURE__*/
function () {
  function FastQuadric(_a) {
    var _b = _a === void 0 ? {} : _a,
        _c = _b.targetPercentage,
        targetPercentage = _c === void 0 ? 0.5 : _c,
        _d = _b.aggressiveness,
        aggressiveness = _d === void 0 ? 7 : _d;

    this._triangles = [];
    this._vertices = [];
    this._refs = [];
    this.targetPercentage = targetPercentage;
    this.aggressiveness = aggressiveness;
    this._timer = new Timer();
  }

  var __proto = FastQuadric.prototype;
  Object.defineProperty(__proto, "timeConsumed", {
    get: function () {
      return this._timer.diff;
    },
    enumerable: false,
    configurable: true
  });

  __proto.simplify = function (target) {
    var _this = this;

    var timer = this._timer;
    timer.start();

    if (target.geometries) {
      target.geometries.forEach(function (geometry) {
        _this._process(geometry);
      });
    } else {
      this._process(target);
    }

    timer.end();
    return this;
  };

  __proto._process = function (geometry) {
    this._getData(geometry);

    var triangles = this._triangles;
    var vertices = this._vertices;
    var refs = this._refs;
    var targetPercentage = this.targetPercentage;
    var aggressiveness = this.aggressiveness;
    var targetCount = this._triangles.length * targetPercentage;
    triangles.forEach(function (triangle) {
      return triangle.deleted = false;
    });
    var deletedTriangles = 0;
    var deleted0 = [];
    var deleted1 = [];
    var triangleCount = triangles.length;

    for (var iteration = 0; iteration < 100; iteration++) {
      // Break when target number of triangles reached
      if (triangleCount - deletedTriangles <= targetCount) break; // Update mesh once in a while

      if (iteration % 5 === 0) {
        this._updateMesh(iteration);
      } // Clear dirty flag


      triangles.forEach(function (triangle) {
        return triangle.dirty = false;
      }); //
      // All triangles with edges below the threshold will be removed
      //
      // The following numbers works well for most models.
      // If it does not, try to adjust the 3 parameters
      //

      var threshold = 0.000000001 * Math.pow(iteration + 3, aggressiveness);

      for (var i = triangles.length - 1; i >= 0; i--) {
        var t = triangles[i];
        if (t.err[3] > threshold || t.deleted || t.dirty) continue;

        for (var j = 0; j < 3; j++) {
          if (t.err[j] < threshold) {
            var i0 = t.v[j];
            var i1 = t.v[(j + 1) % 3];
            var v0 = vertices[i0];
            var v1 = vertices[i1]; // Border check

            if (v0.border || v1.border) continue; // Compute vertex to collapse to

            var p = new Vector3();

            this._calculateError(i0, i1, p);

            deleted0.splice(0); // normals temporarily

            deleted1.splice(0); // normals temporarily
            // Don't remove if flipped

            if (this._flipped(p, i1, v0, deleted0)) continue;
            if (this._flipped(p, i0, v1, deleted1)) continue; // Not flipped, so remove edge

            v0.p = p;
            v0.q.add(v1.q);
            var tstart = refs.length;
            deletedTriangles += this._updateTriangles(i0, v0, deleted0);
            deletedTriangles += this._updateTriangles(i0, v1, deleted1);
            var tcount = refs.length - tstart;
            v0.tstart = tstart;
            v0.tcount = tcount;
            break;
          }
        } // Done?


        if (triangleCount - deletedTriangles <= targetCount) break;
      }
    }

    this._compactMesh();

    this._setData(geometry);
  };

  __proto._getData = function (geometry) {
    var data = geometry.prepare();
    this._vertices = data.vertices.map(function (v, idx) {
      var vertex = new Vertex(idx);
      vertex.p.copy(v);
      return vertex;
    });
    this._triangles = data.faces.map(function (f, idx) {
      var triangle = new Triangle(idx);
      triangle.v = [f.a, f.b, f.c];
      return triangle;
    });
    this._refs = [];
  };

  __proto._setData = function (geometry) {
    var triangles = this._triangles;

    var vertices = this._vertices.map(function (vertex) {
      return vertex.p;
    });

    var faces = triangles.map(function (triangle) {
      var v = triangle.v;
      return new Face3(v[0], v[1], v[2]);
    });

    var unculledVertices = this._vertices.map(function (v) {
      return v.originalIndex;
    });

    var unculledFaces = this._triangles.map(function (f) {
      return f.originalIndex;
    });

    geometry.update({
      vertices: vertices,
      faces: faces,
      unculledVertices: unculledVertices,
      unculledFaces: unculledFaces
    });
  };

  __proto._flipped = function (p, i, v, deleted) {
    var triangles = this._triangles;
    var vertices = this._vertices;
    var refs = this._refs;

    for (var k = 0; k < v.tcount; k++) {
      var ref = refs[v.tstart + k];
      var t = triangles[ref.tid];
      if (t.deleted) continue;
      var s = ref.tvertex;
      var id1 = t.v[(s + 1) % 3];
      var id2 = t.v[(s + 2) % 3];

      if (id1 === i || id2 === i) {
        deleted[k] = true;
        continue;
      }

      var d1 = Vector3.subVectors(vertices[id1].p, p);
      var d2 = Vector3.subVectors(vertices[id2].p, p);
      d1.normalize();
      d2.normalize();
      if (Math.abs(d1.dot(d2)) > 0.999) return true;
      var n = new Vector3().copy(d1).cross(d2);
      n.normalize();
      deleted[k] = false;
      if (n.dot(t.n) < 0.2) return true;
    }

    return false;
  };

  __proto._updateTriangles = function (i, v, deleted) {
    var triangles = this._triangles;
    var refs = this._refs;
    var p = new Vector3();
    var deletedCount = 0;

    for (var k = 0; k < v.tcount; k++) {
      var r = refs[v.tstart + k];
      var t = triangles[r.tid];
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
  };

  __proto._updateMesh = function (iteration) {
    var _this = this;

    var vertices = this._vertices;
    var refs = this._refs;

    if (iteration > 0) {
      // compact triangles
      this._triangles = this._triangles.filter(function (triangle) {
        return !triangle.deleted;
      });
    } else {
      //
      // Init Quadrics by Plane & Edge Errors
      //
      // required at the beginning ( iteration == 0 )
      // recomputing during the simplification is not required,
      // but mostly improves the result for closed meshes
      //
      vertices.forEach(function (vertex) {
        return vertex.q = new SymmetricMatrix();
      });

      this._triangles.forEach(function (t) {
        var p = t.v.map(function (v) {
          return vertices[v].p;
        });
        var n = Vector3.subVectors(p[1], p[0]).cross(Vector3.subVectors(p[2], p[0])).normalize();
        t.n = n;
        var tmp = SymmetricMatrix.makePlane(n.x, n.y, n.z, -n.dot(p[0]));
        t.v.forEach(function (v) {
          return vertices[v].q.add(tmp);
        });
      });

      this._triangles.forEach(function (t) {
        var p = new Vector3();
        t.v.forEach(function (v, i) {
          t.err[i] = _this._calculateError(v, t.v[(i + 1) % 3], p);
        });
      });
    } // Init Reference ID list


    vertices.forEach(function (vertex) {
      vertex.tstart = 0;
      vertex.tcount = 0;
    });
    var triangles = this._triangles;
    triangles.forEach(function (triangle) {
      triangle.v.forEach(function (v) {
        return vertices[v].tcount++;
      });
    });
    var tstart = 0;
    vertices.forEach(function (v) {
      v.tstart = tstart;
      tstart += v.tcount;
      v.tcount = 0;
    }); // Write References

    for (var i = refs.length; i < triangles.length * 3; i++) {
      refs[i] = new Ref();
    }

    triangles.forEach(function (t, i) {
      for (var j = 0; j < 3; j++) {
        var v = vertices[t.v[j]];
        refs[v.tstart + v.tcount].tid = i;
        refs[v.tstart + v.tcount].tvertex = j;
        v.tcount++;
      }
    }); // Identify boundary : vertices[].border=0,1

    if (iteration === 0) {
      vertices.forEach(function (vertex) {
        return vertex.border = false;
      });
      vertices.forEach(function (v) {
        // clear
        var vcount = [];
        var vids = [];

        for (var i = 0; i < v.tcount; i++) {
          var k = refs[v.tstart + i].tid;
          var t = triangles[k];

          for (var j = 0; j < 3; j++) {
            var id = t.v[j];
            var ofs = 0;

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
          }
        }

        for (var j = 0; j < vcount.length; j++) {
          if (vcount[j] === 1) {
            vertices[vids[j]].border = true;
          }
        }
      });
    }
  }; // Error for one edge


  __proto._calculateError = function (idV1, idV2, result) {
    // Compute interpolated vertex
    var vertices = this._vertices;
    var v1 = vertices[idV1];
    var v2 = vertices[idV2];
    var q = new SymmetricMatrix().copy(v1.q).add(v2.q);
    var border = v1.border && v2.border;
    var det = q.det(0, 1, 2, 1, 4, 5, 2, 5, 7);
    var error = 0;

    if (det !== 0 && !border) {
      // q_delta is invertible
      result.x = -1 / det * q.det(1, 2, 3, 4, 5, 6, 5, 7, 8); // vx = A41/det(q_delta)

      result.y = 1 / det * q.det(0, 2, 3, 1, 5, 6, 2, 7, 8); // vy = A42/det(q_delta)

      result.z = -1 / det * q.det(0, 1, 3, 1, 4, 6, 2, 5, 8); // vz = A43/det(q_delta)

      error = this._vertexError(q, result);
    } else {
      var p1 = v1.p;
      var p2 = v2.p;
      var p3 = new Vector3((p1.x + p2.x) * 0.5, (p1.y + p2.y) * 0.5, (p1.z + p2.z) * 0.5);

      var error1 = this._vertexError(q, p1);

      var error2 = this._vertexError(q, p2);

      var error3 = this._vertexError(q, p3);

      error = Math.min(error1, error2, error3);
      if (error1 === error) result.copy(p1);
      if (error2 === error) result.copy(p2);
      if (error3 === error) result.copy(p3);
    }

    return error;
  };

  __proto._vertexError = function (q, v) {
    var x = v.x,
        y = v.y,
        z = v.z;
    var m = q.m;
    var err = m[0] * x * x + 2 * m[1] * x * y + 2 * m[2] * x * z + 2 * m[3] * x + m[4] * y * y + 2 * m[5] * y * z + 2 * m[6] * y + m[7] * z * z + 2 * m[8] * z + m[9];
    return err;
  };

  __proto._compactMesh = function () {
    this._triangles = this._triangles.filter(function (t) {
      return !t.deleted;
    });
    var triangles = this._triangles;
    var vertices = this._vertices;
    vertices.forEach(function (vertex) {
      return vertex.tcount = 0;
    });
    triangles.forEach(function (triangle) {
      triangle.v.forEach(function (v) {
        vertices[v].tcount = 1;
      });
    });
    var dst = 0;
    vertices.forEach(function (vertex) {
      if (vertex.tcount > 0) {
        vertex.tstart = dst;
        vertices[dst].originalIndex = vertex.originalIndex;
        vertices[dst].p = vertex.p;
        dst++;
      }
    });
    triangles.forEach(function (t) {
      t.v.forEach(function (v, i) {
        t.v[i] = vertices[v].tstart;
      });
    });
    vertices.splice(dst); // resize
  };

  return FastQuadric;
}();

var getUintArrayByVertexLength = function (length) {
  if (length < 256) {
    return Uint8Array;
  } else if (length < 65536) {
    return Uint16Array;
  } else {
    return Uint32Array;
  }
};

/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

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

var ThreeGeometry =
/*#__PURE__*/
function () {
  function ThreeGeometry(geometry) {
    this.originalGeometry = geometry;
  }

  var __proto = ThreeGeometry.prototype;

  __proto.prepare = function () {
    var _a, _b;

    var geometry = this.originalGeometry;
    var position = geometry.attributes.position;
    var face = geometry.index;
    var vertexCount = (_a = position === null || position === void 0 ? void 0 : position.count) !== null && _a !== void 0 ? _a : 0;
    var faceCount = ((_b = face === null || face === void 0 ? void 0 : face.count) !== null && _b !== void 0 ? _b : 0) / 3;
    var vertices = new Array(vertexCount);
    var faces = new Array(faceCount);

    for (var idx = 0; idx < vertexCount; idx++) {
      var startIdx = position.itemSize * idx;
      var arr = position.array;
      vertices[idx] = new Vector3(arr[startIdx + 0], arr[startIdx + 1], arr[startIdx + 2]);
    }

    for (var idx = 0; idx < faceCount; idx++) {
      var startIdx = 3 * idx;
      var arr = face.array;
      faces[idx] = new Face3(arr[startIdx + 0], arr[startIdx + 1], arr[startIdx + 2]);
    }

    return {
      vertices: vertices,
      faces: faces
    };
  };

  __proto.update = function (datas) {
    var vertices = datas.vertices,
        faces = datas.faces,
        unculledVertices = datas.unculledVertices;
    var geometry = this.originalGeometry;
    var hasUV = geometry.hasAttribute("uv");

    if (hasUV) {
      var uvArray_1 = new Float32Array(2 * vertices.length);
      var origUV_1 = geometry.attributes.uv;
      unculledVertices.forEach(function (vertexIdx, idx) {
        var offset = idx * 2;
        uvArray_1[offset + 0] = origUV_1.getX(vertexIdx);
        uvArray_1[offset + 1] = origUV_1.getY(vertexIdx);
      });
      geometry.setAttribute("uv", new THREE.BufferAttribute(uvArray_1, 2));
    }

    var IndexTypedArray = getUintArrayByVertexLength(vertices.length);
    var vertexArray = new Float32Array(3 * vertices.length);
    var faceArray = new IndexTypedArray(3 * faces.length);
    vertices.forEach(function (vertex, idx) {
      var offset = idx * 3;
      vertexArray[offset + 0] = vertex.x;
      vertexArray[offset + 1] = vertex.y;
      vertexArray[offset + 2] = vertex.z;
    });
    faces.forEach(function (face, idx) {
      var offset = idx * 3;
      faceArray[offset + 0] = face.a;
      faceArray[offset + 1] = face.b;
      faceArray[offset + 2] = face.c;
    });
    var vertexBuffer = new THREE.BufferAttribute(vertexArray, 3);
    var faceBuffer = new THREE.BufferAttribute(faceArray, 1);
    geometry.setAttribute("position", vertexBuffer);
    geometry.setIndex(faceBuffer);
    geometry.computeVertexNormals();
    return this;
  };

  return ThreeGeometry;
}();

var THREE_STANDARD_MAPS = ["alphaMap", "aoMap", "bumpMap", "displacementMap", "emissiveMap", "envMap", "lightMap", "map", "metalnessMap", "normalMap"];

/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

var ThreeAdapter =
/*#__PURE__*/
function () {
  function ThreeAdapter(original, clone) {
    if (clone === void 0) {
      clone = false;
    }

    this.object = clone ? original.clone() : original;

    if (clone) {
      this._cloneMeshes(original);
    }
  }

  var __proto = ThreeAdapter.prototype;
  Object.defineProperty(__proto, "geometries", {
    get: function () {
      var geometries = [];
      this.object.traverse(function (obj) {
        if (obj.isMesh) {
          var mesh = obj;
          var threeGeometry = new ThreeGeometry(mesh.geometry);
          geometries.push(threeGeometry);
        }
      });
      return geometries;
    },
    enumerable: false,
    configurable: true
  });

  __proto._cloneMeshes = function (original) {
    var _this = this;

    var origMeshes = [];
    var clonedMeshes = [];
    original.traverse(function (obj) {
      if (obj.isMesh) origMeshes.push(obj);
    });
    this.object.traverse(function (obj) {
      if (obj.isMesh) clonedMeshes.push(obj);
    });
    clonedMeshes.forEach(function (mesh, meshIdx) {
      var origMesh = origMeshes[meshIdx];
      mesh.geometry = mesh.geometry.clone();
      mesh.material = Array.isArray(mesh.material) ? mesh.material.map(function (mat) {
        return _this._cloneMaterial(mat);
      }) : _this._cloneMaterial(mesh.material);

      if (mesh.isSkinnedMesh) {
        _this._skinnedMeshToMesh(mesh, origMesh.skeleton);
      }
    });
  };

  __proto._cloneMaterial = function (mat) {
    var clonedMat = mat.clone();

    if (mat.type === "MeshStandardMaterial") {
      var standardMat_1 = mat;
      THREE_STANDARD_MAPS.forEach(function (mapName) {
        if (standardMat_1[mapName] == null) return;
        var prevMat = standardMat_1[mapName];
        standardMat_1[mapName] = standardMat_1[mapName].clone();
        standardMat_1[mapName].needsUpdate = true;

        if (mapName === "metalnessMap" && prevMat === standardMat_1.roughnessMap) {
          standardMat_1.roughnessMap = standardMat_1.metalnessMap;
        }
      });
    } else {
      for (var property in clonedMat) {
        if (clonedMat[property] && clonedMat[property].isTexture) {
          clonedMat[property] = clonedMat[property].clone();
          clonedMat[property].needsUpdate = true;
        }
      }
    }

    clonedMat.needsUpdate = true;
    return clonedMat;
  };

  __proto._skinnedMeshToMesh = function (skinnedMesh, skeleton) {
    var geometry = skinnedMesh.geometry;
    var positions = geometry.attributes.position;
    var skinIndicies = geometry.attributes.skinIndex;
    var skinWeights = geometry.attributes.skinWeight;
    skinnedMesh.updateMatrixWorld();
    skeleton.update();
    var boneMatricies = skeleton.boneMatrices;
    var finalMatrix = new THREE.Matrix4();

    var _loop_1 = function (posIdx) {
      finalMatrix.identity();
      var skinned = new THREE.Vector4();
      skinned.set(0, 0, 0, 0);
      var skinVertex = new THREE.Vector4();
      skinVertex.set(positions.getX(posIdx), positions.getY(posIdx), positions.getZ(posIdx), 1).applyMatrix4(skinnedMesh.bindMatrix);
      var weights = [skinWeights.getX(posIdx), skinWeights.getY(posIdx), skinWeights.getZ(posIdx), skinWeights.getW(posIdx)];
      var indicies = [skinIndicies.getX(posIdx), skinIndicies.getY(posIdx), skinIndicies.getZ(posIdx), skinIndicies.getW(posIdx)];
      weights.forEach(function (weight, index) {
        var boneMatrix = new THREE.Matrix4().fromArray(boneMatricies, indicies[index] * 16).multiplyScalar(weight);
        skinned.add(skinVertex.clone().applyMatrix4(boneMatrix));
      });
      var transformed = skinned.applyMatrix4(skinnedMesh.bindMatrixInverse);
      positions.setXYZ(posIdx, transformed.x, transformed.y, transformed.z);
    };

    for (var posIdx = 0; posIdx < positions.count; posIdx++) {
      _loop_1(posIdx);
    }

    var parent = skinnedMesh.parent;
    var mesh = new THREE.Mesh(skinnedMesh.geometry, skinnedMesh.material).copy(skinnedMesh);
    mesh.geometry.deleteAttribute("skinIndex");
    mesh.geometry.deleteAttribute("skinWeight");
    parent.remove(skinnedMesh);
    parent.add(mesh);
  };

  return ThreeAdapter;
}();

export { Face3, FastQuadric, SymmetricMatrix, ThreeAdapter, ThreeGeometry, Vector3 };
//# sourceMappingURL=mesh-simplifier.esm.js.map
