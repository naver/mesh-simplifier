import * as THREE from "three";
import Renderable from "../types/Renderable";
import { FastQuadric, ThreeGeometry } from "../../../src/index";

// FastQuadric Test page
class FQDemo1 implements Renderable {
  public name = "Fast Quadric";
  public description = "";
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  private _origMesh: THREE.Mesh;
  private _simpMesh: THREE.Mesh;

  public update(timeSec): void {
    // this._origMesh.rotateY(timeSec);
    // this._simpMesh.rotateY(timeSec);
  }

  public onLoad() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera();

    this.camera.near = 1;
    this.camera.far = 100;
    this.camera.position.set(0, 0, 100);

    this._setupScene();
  }

  public destroy() {
    this._origMesh.geometry.dispose();
    this._simpMesh.geometry.dispose();
  }

  private _setupScene() {
    const scene = this.scene;
    const originalMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true });
    const simplifiedMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true });

    const originalGeometry = new THREE.TorusKnotGeometry(10, 3, 250, 20, 1, 20);
    const simplifiedGeometry = originalGeometry.clone();
    const adaptedGeometry = new ThreeGeometry(simplifiedGeometry);
    const simplifier = new FastQuadric();

    simplifier.simplify(adaptedGeometry);

    const originalMesh = new THREE.Mesh(originalGeometry, originalMaterial);
    originalMesh.position.set(-20, 0, 0);

    const simplifiedMesh = new THREE.Mesh(simplifiedGeometry, simplifiedMaterial);
    simplifiedMesh.position.set(20, 0, 0);

    scene.add(originalMesh);
    scene.add(simplifiedMesh);

    this._origMesh = originalMesh;
    this._simpMesh = simplifiedMesh;
  }
}

export default FQDemo1;
