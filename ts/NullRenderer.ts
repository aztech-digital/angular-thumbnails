class NullRenderer implements ElementRenderer {
    render(canvas:HTMLCanvasElement, deferred:JQueryDeferred<void>):JQueryPromiseCallback<void> {
        return deferred.promise;
    }
}
