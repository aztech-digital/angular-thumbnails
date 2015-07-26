interface ElementRenderer {
  render(canvas: HTMLCanvasElement, deferred: ng.IDeferred<any>): ng.IPromise<any>;
}
