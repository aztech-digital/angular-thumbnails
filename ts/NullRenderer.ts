class NullRenderer implements ElementRenderer {
    render(canvas:HTMLCanvasElement, deferred:ng.IDeferred<any>):ng.IPromise<any> {
        return deferred.promise;
    }
}
