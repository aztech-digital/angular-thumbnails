class PdfRenderParams implements PDFRenderParams {
    constructor(public canvasContext:CanvasRenderingContext2D, public viewport:PDFPageViewport) {
    }
}

class PdfRenderer implements ElementRenderer {

    constructor(private scope:any) {
    }

    renderPage(canvas:HTMLCanvasElement, document:PDFDocumentProxy, paginationStatus:PaginationStatus, deferred:JQueryDeferred<void>):void {
        document.getPage(paginationStatus.getCurrentPage()).then(function (page:PDFPageProxy) {
            var pdfViewport:PDFPageViewport = page.getViewport(this.scope.scale || 1, 0);
            var height:number = this.scope.maxHeight || pdfViewport.height;
            var width:number = this.scope.maxWidth || pdfViewport.width;
            var viewport:RenderingViewport = new RenderingViewport(height, width);

            viewport.adjustCanvas(canvas, height, width);

            pdfViewport = page.getViewport(
                canvas.height / pdfViewport.height,
                viewport.getRotation()
            );

            var params:PDFRenderParams = new PdfRenderParams(<CanvasRenderingContext2D>canvas.getContext('2d'), pdfViewport);

            page.render(params).then(function () {
                deferred.resolve();
            }, function () {
                deferred.reject();
            })
        })
    }

    render(canvas:HTMLCanvasElement, deferred:JQueryDeferred<void>):JQueryPromiseCallback<void> {
        PDFJS.getDocument(this.scope.source, null, null, this.scope.onProgress).then(function (document:PDFDocumentProxy) {
            this.scope.$apply(function () {
                var paginationStatus = new PaginationStatus(this.scope.pageNum || 1, document.numPages);

                this.renderPage(canvas, document, paginationStatus, deferred);
            });
        }, function (error:any) {
            deferred.reject(error);
        });

        return deferred.promise;
    }
}
