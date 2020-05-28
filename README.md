# Mesh-simplifier
Collection of mesh simplification methods written in Typescript

## Quick Start (three.js)
```js
import * as THREE from "three";
/*
 * If you're using our umd distribution ("mesh-simplifier.js" not "mesh-simplifier.esm.js"),
 * Everything is under global variable named "MeshSimplifier"
 * So you can use it like "MeshSimplifier.FastQuadric"
 */
import { FastQuadric, ThreeGeometry } from "mesh-simplifier";

const geometry = new THREE.TorusKnotGeometry(10);
const adaptedGeometry = new ThreeGeometry(geometry);
const simplifier = new FastQuadric();

simplifier.simplify(adaptedGeometry);

// Now do whatever you want with simplified geometry
const material = new THREE.MeshBasicMaterial();
const mesh = new THREE.Mesh(adaptedGeometry.simplified, material);
```

# Algorithms
## FastQuadric
- Original code: https://github.com/sp4cerat/Fast-Quadric-Mesh-Simplification
- License: MIT

# License

```
Copyright (c) 2020-present NAVER Corp.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
