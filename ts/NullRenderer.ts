class NullRenderer implements ElementRenderer {
    render(scope: ThumbnailScope, canvas:HTMLCanvasElement, deferred:ng.IDeferred<any>):ng.IPromise<any> {
        return deferred.promise;
    }
}
