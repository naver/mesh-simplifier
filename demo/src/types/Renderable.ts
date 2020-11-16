import * as THREE from "three";
import OnLoadContext from "./OnLoadContext";

interface Renderable {
  name: string;
  description: string;
  scene: THREE.Scene;
  camera: THREE.Camera;
  update(timeSec: number): any;
  onLoad(context: OnLoadContext): any;
  destroy(): any;
}

export default Renderable;
