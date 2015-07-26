module AngularThumbnails.Images {
    export class ImageRenderer implements ElementRenderer {
        render(scope:ThumbnailScope, canvas:HTMLCanvasElement, deferred:ng.IDeferred<any>):ng.IPromise<any> {
            var image = new Image();

            image.addEventListener('load', function () {
                scope.$apply(() => {
                    var height:number = scope.maxHeight || image.height;
                    var width:number = scope.maxWidth || image.width;
                    var viewport:RenderingViewport = new RenderingViewport(height, width);
                    var context:CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');

                    viewport.adjustCanvas(canvas, image.height, image.width);

                    context.drawImage(image,
                        0, 0, image.width, image.height,
                        0, 0, canvas.width, canvas.height
                    );

                    deferred.resolve();
                });

            }, false);

            image.src = scope.source;

            return deferred.promise;
        }
    }
}
