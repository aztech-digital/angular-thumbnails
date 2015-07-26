class VideoRenderer implements ElementRenderer {

    constructor(private scope:any, private container:any) {
    }

    render(canvas:HTMLCanvasElement, deferred:ng.IDeferred<any>):ng.IPromise<any> {
        var video:HTMLVideoElement = <HTMLVideoElement>document.createElement('video');
        var that = this;

        video.setAttribute('style', 'display: none');
        video.addEventListener('canplay', () => {
            var height:number = this.scope.maxHeight || video.videoHeight;
            var width:number = this.scope.maxWidth || video.videoWidth;
            var viewport:RenderingViewport = new RenderingViewport(height, width);
            var context:CanvasRenderingContext2D = <CanvasRenderingContext2D> canvas.getContext('2d');

            viewport.adjustCanvas(canvas, video.height, video.width);

            this.scope.$apply(() => {
                context.drawImage(video,
                    0, 0, video.videoWidth, video.videoHeight,
                    0, 0, canvas.width, canvas.height
                );

                deferred.resolve();
            });

        });

        this.container.append(video);

        video.src = this.scope.source;

        return deferred.promise;
    }
}
