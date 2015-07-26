class RendererFactory {
    public getRenderer(scope: ng.IScope, type: string): ElementRenderer {
        switch (type) {
            case 'pdf':
                return new PdfRenderer();
            case 'image':
                return new ImageRenderer();
            case 'video':
                return new VideoRenderer($(window.document.body));
        }

        return new NullRenderer();
    }
}
