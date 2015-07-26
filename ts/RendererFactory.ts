class RendererFactory {
    public getRenderer(scope: ng.IScope, type: string): ElementRenderer {
        switch (type) {
            case 'pdf':
                return new PdfRenderer(scope);
            case 'image':
                return new ImageRenderer(scope);
            case 'video':
                return new VideoRenderer(scope, $(window.document.body));
        }

        return new NullRenderer();
    }
}
