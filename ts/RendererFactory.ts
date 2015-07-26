module AngularThumbnails {
    export class RendererFactory {
        public getRenderer(container: ng.IAugmentedJQuery, scope:ng.IScope, type:string):ElementRenderer {
            switch (type) {
                case 'pdf':
                    return new PDF.PdfRenderer();
                case 'image':
                    return new Images.ImageRenderer();
                case 'video':
                    return new Video.VideoRenderer(container);
            }

            return new NullRenderer();
        }
    }
}
