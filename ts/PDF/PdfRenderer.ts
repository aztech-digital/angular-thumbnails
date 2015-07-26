class PdfRenderParams implements PDFRenderParams {
    constructor(public canvasContext:CanvasRenderingContext2D, public viewport:PDFPageViewport) {
    }
}

class PdfRenderer implements ElementRenderer {

    render(scope: ThumbnailScope, canvas:HTMLCanvasElement, deferred:ng.IDeferred<any>):ng.IPromise<any> {
        try {
            PDFJS.getDocument(scope.source, null, null, scope.onProgress).then((document:PDFDocumentProxy) => {
                scope.$apply(() => {
                    var paginationStatus = new PaginationStatus(scope.pageNum || 1, document.numPages);

                    this.onDocumentReady(scope, canvas, document, paginationStatus, deferred);
                });
            }, (error:any) => {
                deferred.reject(error);
            });
        }
        catch (error) {
            deferred.reject(error);
        }

        return deferred.promise;
    }

    private onDocumentReady(scope: ThumbnailScope, canvas:HTMLCanvasElement, document:PDFDocumentProxy, paginationStatus:PaginationStatus, deferred:ng.IDeferred<any>):void {
        document.getPage(paginationStatus.getCurrentPage()).then((page:PDFPageProxy) => {
            this.onPageReady(scope, canvas, page, deferred);
        })
    }

    private onPageReady(scope: ThumbnailScope, canvas: HTMLCanvasElement, page: PDFPageProxy, deferred: ng.IDeferred<any>) {
        var pdfViewport:PDFPageViewport = page.getViewport(scope.scale || 1, 0);
        var height:number = scope.maxHeight || pdfViewport.height;
        var width:number = scope.maxWidth || pdfViewport.width;
        var viewport:RenderingViewport = new RenderingViewport(height, width);

        viewport.adjustCanvas(canvas, height, width);

        pdfViewport = page.getViewport(
            canvas.height / pdfViewport.height,
            viewport.getRotation()
        );

        var params:PDFRenderParams = new PdfRenderParams(<CanvasRenderingContext2D>canvas.getContext('2d'), pdfViewport);

        page.render(params).then(() => {
            deferred.resolve();
        }, () => {
            deferred.reject();
        })
    }
}
