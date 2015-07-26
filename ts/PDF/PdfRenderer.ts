class PdfRenderParams implements PDFRenderParams {
    constructor(public canvasContext:CanvasRenderingContext2D, public viewport:PDFPageViewport) {
    }
}

class PdfRenderer implements ElementRenderer {

    constructor(private scope:any) {
    }

    render(canvas:HTMLCanvasElement, deferred:ng.IDeferred<any>):ng.IPromise<any> {
        PDFJS.getDocument(this.scope.source, null, null, this.scope.onProgress).then((document:PDFDocumentProxy) => {
            this.scope.$apply(() => {
                var paginationStatus = new PaginationStatus(this.scope.pageNum || 1, document.numPages);

                this.onDocumentReady(canvas, document, paginationStatus, deferred);
            });
        }, (error:any) => {
            deferred.reject(error);
        });

        return deferred.promise;
    }

    private onDocumentReady(canvas:HTMLCanvasElement, document:PDFDocumentProxy, paginationStatus:PaginationStatus, deferred:ng.IDeferred<any>):void {
        document.getPage(paginationStatus.getCurrentPage()).then((page:PDFPageProxy) => {
            this.onPageReady(canvas, page, deferred);
        })
    }

    private onPageReady(canvas: HTMLCanvasElement, page: PDFPageProxy, deferred: ng.IDeferred<any>) {
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

        page.render(params).then(() => {
            deferred.resolve();
        }, () => {
            deferred.reject();
        })
    }
}
