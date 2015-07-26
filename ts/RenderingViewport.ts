module AngularThumbnails {
    export class RenderingViewport {

        constructor(private height:number, private width:number, private scale:number = 1, private rotation:number = 1) {
        }

        public getHeight():number {
            return this.height;
        }

        public getWidth():number {
            return this.width;
        }

        public getRotation():number {
            return this.rotation;
        }

        public adjustCanvas(canvas:HTMLCanvasElement, height:number, width:number) {
            var ratio:number;

            ratio = width / height;

            if (height > this.height) {
                height = this.height;
                width = height * ratio;
            }

            if (width > this.width) {
                width = this.width;
                height = width / ratio;
            }

            canvas.height = height;
            canvas.width = width;
        }
    }
}
