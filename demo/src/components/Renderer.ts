import * as THREE from "three";
import Renderable from "../types/Renderable";

class Renderer {
  private _threeRenderer: THREE.WebGLRenderer;
  private _renderingPage: Renderable | null;
  private _clock: THREE.Clock;

  public get canvas() { return this._threeRenderer.domElement; }

  constructor(selector: string) {
    const canvas = document.querySelector(selector);

    this._threeRenderer = new THREE.WebGLRenderer({
      canvas: canvas as HTMLCanvasElement,
    });

    const renderer = this._threeRenderer;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;

    this._clock = new THREE.Clock(true);
    this._renderingPage = null;
  }

  public resize() {
    const renderer = this._threeRenderer;
    const canvas = renderer.domElement;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    renderer.setSize(width, height, false);
    renderer.setPixelRatio(window.devicePixelRatio);
  }

  public render(target: Renderable) {
    const renderer = this._threeRenderer;
    const description = document.querySelector("#page-description");

    this._renderingPage = target;
    description!.innerHTML = target.description;

    renderer.setAnimationLoop(() => {
      const timeSec = this._clock.getDelta();

      target.update(timeSec);
      renderer.render(target.scene, target.camera);
    });
  }

  public stopRender() {
    this._renderingPage?.destroy();
    this._threeRenderer.setAnimationLoop(null);
  }
}

export default Renderer;
