interface ElementRenderer {
  render(canvas: HTMLCanvasElement, deferred: JQueryDeferred<void>): JQueryPromiseCallback<void>;
}
