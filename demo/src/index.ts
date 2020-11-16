import Renderer from "./components/Renderer";
import PAGES from "./pages";
import FQDemo1 from "./pages/FQDemo1";
import Renderable from "./types/Renderable";

class App {
  private _renderer: Renderer;
  private _pages: Map<string, Renderable>;

  constructor() {
    this._renderer = new Renderer("#app");
    this._pages = new Map();

    this.displayPages();
    this.resize();

    window.addEventListener("resize", this.resize);
    window.addEventListener("hashchange", this._hashchange);

    this._loadPageByHash(window.location.hash);
  }

  public load(page: Renderable) {
    const renderer = this._renderer;
    page.onLoad({
      canvas: renderer.canvas,
      renderer,
    });
    renderer.stopRender();
    renderer.render(page);
  }

  public resize = () => {
    this._renderer.resize();
  }

  public displayPages() {
    const pageSelector = document.querySelector("#page-selector")!;

    Object.keys(PAGES).forEach(pageHash => {
      const page = new PAGES[pageHash]() as Renderable;
      const pageEl = document.createElement("div");

      this._pages.set(pageHash, page);

      pageEl.classList.add("page");
      pageEl.innerHTML = `<a href="#${pageHash}">${page.name}</a>`

      pageSelector.appendChild(pageEl);
    });
  }

  private _hashchange = (e: HashChangeEvent) => {
    const currentHash = window.location.hash;

    this._loadPageByHash(currentHash);
  }

  private _loadPageByHash(hash: string) {
    const pages = this._pages;

    // remove starting #
    hash = hash.substr(1);

    const page = pages.has(hash)
      ? pages.get(hash)!
      : new FQDemo1(); // Default page

    this.load(page);
  }
}

export default App;

