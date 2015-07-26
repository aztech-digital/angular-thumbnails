module AngularThumbnails {
    export interface ElementRenderer {
        render(scope:ThumbnailScope, canvas:HTMLCanvasElement, deferred:ng.IDeferred<any>): ng.IPromise<any>;
    }
}
