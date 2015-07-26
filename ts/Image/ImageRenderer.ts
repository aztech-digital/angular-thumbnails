class ImageRenderer implements ElementRenderer {

    constructor(private scope:any) {
    }

    render(canvas:HTMLCanvasElement, deferred:ng.IDeferred<any>):ng.IPromise<any> {
        var image = new Image();

        image.addEventListener('load', function () {
            this.scope.$apply(() => {
                var height:number = this.scope.maxHeight || image.height;
                var width:number = this.scope.maxWidth || image.width;
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

        image.src = this.scope.source;

        return deferred.promise;
    }
}
