module AngularThumbnails.Video {
    export class VideoRenderer implements ElementRenderer {

        private videoElement:HTMLVideoElement;

        constructor(private container:any) {
            this.videoElement = <HTMLVideoElement>document.createElement('video');
            this.container.append(this.videoElement);
        }

        render(scope:ThumbnailScope, canvas:HTMLCanvasElement, deferred:ng.IDeferred<any>):ng.IPromise<any> {
            this.videoElement.setAttribute('style', 'display: none');
            this.videoElement.addEventListener('canplay', () => {
                var height:number = scope.maxHeight || this.videoElement.videoHeight;
                var width:number = scope.maxWidth || this.videoElement.videoWidth;
                var viewport:RenderingViewport = new RenderingViewport(height, width);
                var context:CanvasRenderingContext2D = <CanvasRenderingContext2D> canvas.getContext('2d');

                viewport.adjustCanvas(canvas, this.videoElement.videoHeight, this.videoElement.videoWidth);

                scope.$apply(() => {
                    context.drawImage(this.videoElement,
                        0, 0, this.videoElement.videoWidth, this.videoElement.videoHeight,
                        0, 0, canvas.width, canvas.height
                    );

                    deferred.resolve();
                });

            });

            this.videoElement.src = scope.source;

            return deferred.promise;
        }
    }
}
