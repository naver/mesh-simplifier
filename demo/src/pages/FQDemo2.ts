import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import Renderable from "../types/Renderable";
import { FastQuadric, ThreeAdapter } from "../../../src/index";
import OnLoadContext from "../types/OnLoadContext";

// FastQuadric Test page
class FQDemo2 implements Renderable {
  public name = "Fast Quadric - textured";
  public description = "3D Model: <a href=\"https://polyhaven.com/a/marble_bust_01\">Marble Bust 01</a> by <a href=\"https://polyhaven.com\">Poly Haven</a>(CC0)"
  public scene: THREE.Scene;
  public camera: THREE.PerspectiveCamera;

  private _controls: OrbitControls;
  private _origScene: THREE.Group;
  private _simpScene: THREE.Group;

  public update(timeSec): void {
    // this._origMesh.rotateY(timeSec);
    // this._simpMesh.rotateY(timeSec);
  }

  public onLoad(context: OnLoadContext) {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color("#C3DFCB");

    this.camera = new THREE.PerspectiveCamera();
    this.camera.position.set(0, 0, 1);
    this.camera.lookAt(0, 0, 0);

    this._controls = new OrbitControls(this.camera, context.canvas);

    this._setupScene();
  }

  public destroy() {}

  private _setupScene() {
    this.scene.add(new THREE.AmbientLight(0xffffff, .5));

    const directional = new THREE.DirectionalLight(0xffffff, 2);
    directional.castShadow = true;
    directional.shadow.mapSize.set(4096, 4096);
    directional.shadow.bias = -0.0001;
    directional.shadow.camera.left = -10;
    directional.shadow.camera.right = 10;
    directional.shadow.camera.top = 10;
    directional.shadow.camera.left = -10;
    directional.position.set(0, 4, 3);
    this.scene.add(directional);

    const directional2 = new THREE.DirectionalLight(0x5555ff, 2);
    directional2.position.set(4, 5, -3);
    this.scene.add(directional2);

    new GLTFLoader().load("./assets/marble_bust/marble_bust_01_1k.gltf", gltf => {
      this._origScene = gltf.scene;

      const origMeshes: THREE.Mesh[] = [];

      gltf.scene.traverse(obj => {
        if ((obj as any).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.castShadow = true;
          mesh.receiveShadow = true;

          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];

          materials.forEach((mat: THREE.MeshStandardMaterial) => {
            if (mat.map) {
              mat.map.encoding = THREE.sRGBEncoding;
            }
            if (mat.metalnessMap) {
              mat.metalnessMap.encoding = THREE.sRGBEncoding;
            }
            if (mat.roughnessMap) {
              mat.roughnessMap.encoding = THREE.sRGBEncoding;
            }
          });
          origMeshes.push(mesh);
        }
      });

      const adaptedScene = new ThreeAdapter(this._origScene, true);
      this._simpScene = adaptedScene.object;

      const bbox = new THREE.Box3().setFromObject(gltf.scene);
      this._origScene.position.sub(bbox.getCenter(new THREE.Vector3()));
      this._simpScene.position.copy(this._origScene.position);

      const simplifier = new FastQuadric({ targetPercentage: 0.5 });

      this._origScene.position.sub(new THREE.Vector3(0.2, 0, 0));
      this._simpScene.position.add(new THREE.Vector3(0.2, 0, 0));

      simplifier.simplify(adaptedScene);

      this.scene.add(this._origScene);
      this.scene.add(this._simpScene);

      const cloned1 = this._origScene.clone(true);
      const cloned2 = this._simpScene.clone(true);

      cloned1.traverse(obj => {
        if ((obj as any).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.material = new THREE.MeshStandardMaterial({ wireframe: true });
        }
      });
      cloned2.traverse(obj => {
        if ((obj as any).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.material = new THREE.MeshStandardMaterial({ wireframe: true });
        }
      });

      this.scene.add(cloned1);
      this.scene.add(cloned2);
    });
  }
}

export default FQDemo2;
