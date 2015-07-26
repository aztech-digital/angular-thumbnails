var ImageRenderer = function() {
    function ImageRenderer(scope) {
        this.scope = scope;
    }
    ImageRenderer.prototype.render = function(canvas, deferred) {
        var image = new Image();
        image.addEventListener("load", function() {
            var _this = this;
            this.scope.$apply(function() {
                var height = _this.scope.maxHeight || image.height;
                var width = _this.scope.maxWidth || image.width;
                var viewport = new RenderingViewport(height, width);
                var context = canvas.getContext("2d");
                viewport.adjustCanvas(canvas, image.height, image.width);
                context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
                deferred.resolve();
            });
        }, false);
        image.src = this.scope.source;
        return deferred.promise;
    };
    return ImageRenderer;
}();

var NullRenderer = function() {
    function NullRenderer() {}
    NullRenderer.prototype.render = function(canvas, deferred) {
        return deferred.promise;
    };
    return NullRenderer;
}();

var PaginationStatus = function() {
    function PaginationStatus(totalPages, currentPage) {
        if (currentPage === void 0) {
            currentPage = 1;
        }
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        if (currentPage > totalPages) {
            throw new Error();
        }
        if (currentPage < 0) {
            throw new Error();
        }
    }
    PaginationStatus.prototype.getCurrentPage = function() {
        return this.currentPage;
    };
    PaginationStatus.prototype.getPageCount = function() {
        return this.totalPages;
    };
    PaginationStatus.prototype.isLastPage = function() {
        return this.getCurrentPage() == this.getPageCount();
    };
    PaginationStatus.prototype.isFirstPage = function() {
        return this.getCurrentPage() == 1;
    };
    PaginationStatus.prototype.moveToNextPage = function() {
        if (this.getCurrentPage() < this.getPageCount()) {
            this.currentPage += 1;
        }
        return this.getCurrentPage();
    };
    PaginationStatus.prototype.moveToPreviousPage = function() {
        if (this.getCurrentPage() > 1) {
            this.currentPage -= 1;
        }
        return this.getCurrentPage();
    };
    return PaginationStatus;
}();

var PdfRenderParams = function() {
    function PdfRenderParams(canvasContext, viewport) {
        this.canvasContext = canvasContext;
        this.viewport = viewport;
    }
    return PdfRenderParams;
}();

var PdfRenderer = function() {
    function PdfRenderer(scope) {
        this.scope = scope;
    }
    PdfRenderer.prototype.render = function(canvas, deferred) {
        var _this = this;
        PDFJS.getDocument(this.scope.source, null, null, this.scope.onProgress).then(function(document) {
            _this.scope.$apply(function() {
                var paginationStatus = new PaginationStatus(_this.scope.pageNum || 1, document.numPages);
                _this.onDocumentReady(canvas, document, paginationStatus, deferred);
            });
        }, function(error) {
            deferred.reject(error);
        });
        return deferred.promise;
    };
    PdfRenderer.prototype.onDocumentReady = function(canvas, document, paginationStatus, deferred) {
        var _this = this;
        document.getPage(paginationStatus.getCurrentPage()).then(function(page) {
            _this.onPageReady(canvas, page, deferred);
        });
    };
    PdfRenderer.prototype.onPageReady = function(canvas, page, deferred) {
        var pdfViewport = page.getViewport(this.scope.scale || 1, 0);
        var height = this.scope.maxHeight || pdfViewport.height;
        var width = this.scope.maxWidth || pdfViewport.width;
        var viewport = new RenderingViewport(height, width);
        viewport.adjustCanvas(canvas, height, width);
        pdfViewport = page.getViewport(canvas.height / pdfViewport.height, viewport.getRotation());
        var params = new PdfRenderParams(canvas.getContext("2d"), pdfViewport);
        page.render(params).then(function() {
            deferred.resolve();
        }, function() {
            deferred.reject();
        });
    };
    return PdfRenderer;
}();

var RendererFactory = function() {
    function RendererFactory() {}
    RendererFactory.prototype.getRenderer = function(scope, type) {
        switch (type) {
          case "pdf":
            return new PdfRenderer(scope);

          case "image":
            return new ImageRenderer(scope);

          case "video":
            return new VideoRenderer(scope, $(window.document.body));
        }
        return new NullRenderer();
    };
    return RendererFactory;
}();

var RenderingViewport = function() {
    function RenderingViewport(height, width, scale, rotation) {
        if (scale === void 0) {
            scale = 1;
        }
        if (rotation === void 0) {
            rotation = 1;
        }
        this.height = height;
        this.width = width;
        this.scale = scale;
        this.rotation = rotation;
    }
    RenderingViewport.prototype.getHeight = function() {
        return this.height;
    };
    RenderingViewport.prototype.getWidth = function() {
        return this.width;
    };
    RenderingViewport.prototype.getRotation = function() {
        return this.rotation;
    };
    RenderingViewport.prototype.adjustCanvas = function(canvas, height, width) {
        var ratio;
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
    };
    return RenderingViewport;
}();

var AngularThumbnail;

(function(AngularThumbnail) {
    var Directives;
    (function(Directives) {
        var Thumbnail = function() {
            function Thumbnail($q) {
                var _this = this;
                this.restrict = "E";
                this.scope = {
                    source: "=",
                    scale: "=",
                    fileType: "@",
                    maxHeight: "@",
                    maxWidth: "@",
                    onRender: "&",
                    onError: "&"
                };
                this.link = function(scope, element, attrs, ctrl) {
                    var canvas = document.createElement("canvas");
                    var renderFunc = function() {
                        scope.error = false;
                        _this.renderer.render(canvas, _this.qService.defer()).then(scope.onRender, scope.onError);
                    };
                    element.append(canvas);
                    _this.renderer = _this.rendererFactory.getRenderer(scope, scope.fileType);
                    scope.thumbnail = element;
                    scope.$watch("source + fileType + scale + maxHeight + maxWidth", renderFunc);
                };
                this.rendererFactory = new RendererFactory();
                this.qService = $q;
            }
            Thumbnail.factory = function() {
                var directive = function($q) {
                    return new Thumbnail($q);
                };
                directive.$inject = [ "$q" ];
                return directive;
            };
            return Thumbnail;
        }();
        angular.module("angular-thumbnails", []).directive("thumbnail", Thumbnail.factory());
    })(Directives = AngularThumbnail.Directives || (AngularThumbnail.Directives = {}));
})(AngularThumbnail || (AngularThumbnail = {}));

var VideoRenderer = function() {
    function VideoRenderer(scope, container) {
        this.scope = scope;
        this.container = container;
    }
    VideoRenderer.prototype.render = function(canvas, deferred) {
        var _this = this;
        var video = document.createElement("video");
        var that = this;
        video.setAttribute("style", "display: none");
        video.addEventListener("canplay", function() {
            var height = _this.scope.maxHeight || video.videoHeight;
            var width = _this.scope.maxWidth || video.videoWidth;
            var viewport = new RenderingViewport(height, width);
            var context = canvas.getContext("2d");
            viewport.adjustCanvas(canvas, video.height, video.width);
            _this.scope.$apply(function() {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight, 0, 0, canvas.width, canvas.height);
                deferred.resolve();
            });
        });
        this.container.append(video);
        video.src = this.scope.source;
        return deferred.promise;
    };
    return VideoRenderer;
}();