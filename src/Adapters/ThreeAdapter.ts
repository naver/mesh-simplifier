/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

import * as THREE from "three";
import Adapter from "./Adapter";
import ThreeGeometry from "~/Geometries/ThreeGeometry";
import { THREE_STANDARD_MAPS } from "~/consts";

class ThreeAdapter<OBJ extends THREE.Object3D> implements Adapter {
  public object: OBJ;

  constructor(original: OBJ, clone: boolean = false) {
    this.object = clone
      ? original.clone()
      : original;

    if (clone) {
      this._cloneMeshes(original);
    }
  }

  public get geometries() {
    const geometries: ThreeGeometry[] = [];
    this.object.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        const threeGeometry = new ThreeGeometry(mesh.geometry);

        geometries.push(threeGeometry);
      }
    });

    return geometries;
  }

  private _cloneMeshes(original: OBJ) {
    const origMeshes: THREE.Mesh[] = [];
    const clonedMeshes: THREE.Mesh[] = [];

    original.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) origMeshes.push(obj as THREE.Mesh);
    });
    this.object.traverse(obj => {
      if ((obj as THREE.Mesh).isMesh) clonedMeshes.push(obj as THREE.Mesh);
    });

    clonedMeshes.forEach((mesh, meshIdx) => {
      const origMesh = origMeshes[meshIdx];

      mesh.geometry = mesh.geometry.clone();
      mesh.material = Array.isArray(mesh.material)
        ? mesh.material.map(mat => this._cloneMaterial(mat))
        : this._cloneMaterial(mesh.material);

      if ((mesh as THREE.SkinnedMesh).isSkinnedMesh) {
        this._skinnedMeshToMesh(
          mesh as THREE.SkinnedMesh,
          (origMesh as THREE.SkinnedMesh).skeleton
        );
      }
    });
  }

  private _cloneMaterial(mat: THREE.Material) {
    const clonedMat = mat.clone();

    if (mat.type === "MeshStandardMaterial") {
      const standardMat = mat as THREE.MeshStandardMaterial;
      THREE_STANDARD_MAPS.forEach(mapName => {
        if (standardMat[mapName] == null) return;

        const prevMat = standardMat[mapName];
        standardMat[mapName] = standardMat[mapName].clone();
        standardMat[mapName].needsUpdate = true;

        if (mapName === "metalnessMap" && prevMat === standardMat.roughnessMap) {
          standardMat.roughnessMap = standardMat.metalnessMap;
        }
      });
    } else {
      for (const property in clonedMat) {
        if (clonedMat[property] && clonedMat[property].isTexture) {
          clonedMat[property] = clonedMat[property].clone();
          clonedMat[property].needsUpdate = true;
        }
      }
    }

    clonedMat.needsUpdate = true;
    return clonedMat;
  }

  private _skinnedMeshToMesh(skinnedMesh: THREE.SkinnedMesh, skeleton: THREE.Skeleton) {
    const geometry = skinnedMesh.geometry as THREE.BufferGeometry;
    const positions = geometry.attributes.position;
    const skinIndicies = geometry.attributes.skinIndex;
    const skinWeights = geometry.attributes.skinWeight;

    skinnedMesh.updateMatrixWorld();
    skeleton.update();

    const boneMatricies = skeleton.boneMatrices;
    const finalMatrix = new THREE.Matrix4();
    for (let posIdx = 0; posIdx < positions.count; posIdx++) {
      finalMatrix.identity();

      const skinned = new THREE.Vector4();
      skinned.set(0, 0, 0, 0);
      const skinVertex = new THREE.Vector4();
      skinVertex.set(
        positions.getX(posIdx),
        positions.getY(posIdx),
        positions.getZ(posIdx),
        1,
      ).applyMatrix4(skinnedMesh.bindMatrix);

      const weights = [
        skinWeights.getX(posIdx),
        skinWeights.getY(posIdx),
        skinWeights.getZ(posIdx),
        skinWeights.getW(posIdx),
      ];

      const indicies = [
        skinIndicies.getX(posIdx),
        skinIndicies.getY(posIdx),
        skinIndicies.getZ(posIdx),
        skinIndicies.getW(posIdx),
      ];

      weights.forEach((weight, index) => {
        const boneMatrix = new THREE.Matrix4().fromArray(boneMatricies, indicies[index] * 16).multiplyScalar(weight);
        skinned.add(skinVertex.clone().applyMatrix4(boneMatrix));
      });

      const transformed = skinned.applyMatrix4(skinnedMesh.bindMatrixInverse);

      positions.setXYZ(posIdx, transformed.x, transformed.y, transformed.z);
    }

    const parent = skinnedMesh.parent!;
    const mesh = new THREE.Mesh(skinnedMesh.geometry, skinnedMesh.material).copy(skinnedMesh);

    (mesh.geometry as THREE.BufferGeometry).deleteAttribute("skinIndex");
    (mesh.geometry as THREE.BufferGeometry).deleteAttribute("skinWeight");

    parent.remove(skinnedMesh);
    parent.add(mesh);
  }
}

export default ThreeAdapter;
