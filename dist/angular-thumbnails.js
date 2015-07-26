var AngularThumbnails;

(function(AngularThumbnails) {
    var Images;
    (function(Images) {
        var ImageRenderer = function() {
            function ImageRenderer() {}
            ImageRenderer.prototype.render = function(scope, canvas, deferred) {
                var image = new Image();
                image.addEventListener("load", function() {
                    scope.$apply(function() {
                        var height = scope.maxHeight || image.height;
                        var width = scope.maxWidth || image.width;
                        var viewport = new AngularThumbnails.RenderingViewport(height, width);
                        var context = canvas.getContext("2d");
                        viewport.adjustCanvas(canvas, image.height, image.width);
                        context.drawImage(image, 0, 0, image.width, image.height, 0, 0, canvas.width, canvas.height);
                        deferred.resolve();
                    });
                }, false);
                image.src = scope.source;
                return deferred.promise;
            };
            return ImageRenderer;
        }();
        Images.ImageRenderer = ImageRenderer;
    })(Images = AngularThumbnails.Images || (AngularThumbnails.Images = {}));
})(AngularThumbnails || (AngularThumbnails = {}));

var AngularThumbnails;

(function(AngularThumbnails) {
    var NullRenderer = function() {
        function NullRenderer() {}
        NullRenderer.prototype.render = function(scope, canvas, deferred) {
            return deferred.promise;
        };
        return NullRenderer;
    }();
    AngularThumbnails.NullRenderer = NullRenderer;
})(AngularThumbnails || (AngularThumbnails = {}));

var AngularThumbnails;

(function(AngularThumbnails) {
    var PDF;
    (function(PDF) {
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
        PDF.PaginationStatus = PaginationStatus;
    })(PDF = AngularThumbnails.PDF || (AngularThumbnails.PDF = {}));
})(AngularThumbnails || (AngularThumbnails = {}));

var AngularThumbnails;

(function(AngularThumbnails) {
    var PDF;
    (function(PDF) {
        var PdfRenderParams = function() {
            function PdfRenderParams(canvasContext, viewport) {
                this.canvasContext = canvasContext;
                this.viewport = viewport;
            }
            return PdfRenderParams;
        }();
        var PdfRenderer = function() {
            function PdfRenderer() {}
            PdfRenderer.prototype.render = function(scope, canvas, deferred) {
                var _this = this;
                try {
                    PDFJS.getDocument(scope.source, null, null, scope.onProgress).then(function(document) {
                        scope.$apply(function() {
                            var paginationStatus = new PDF.PaginationStatus(scope.pageNum || 1, document.numPages);
                            _this.onDocumentReady(scope, canvas, document, paginationStatus, deferred);
                        });
                    }, function(error) {
                        deferred.reject(error);
                    });
                } catch (error) {
                    deferred.reject(error);
                }
                return deferred.promise;
            };
            PdfRenderer.prototype.onDocumentReady = function(scope, canvas, document, paginationStatus, deferred) {
                var _this = this;
                document.getPage(paginationStatus.getCurrentPage()).then(function(page) {
                    _this.onPageReady(scope, canvas, page, deferred);
                });
            };
            PdfRenderer.prototype.onPageReady = function(scope, canvas, page, deferred) {
                var pdfViewport = page.getViewport(scope.scale || 1, 0);
                var height = scope.maxHeight || pdfViewport.height;
                var width = scope.maxWidth || pdfViewport.width;
                var viewport = new AngularThumbnails.RenderingViewport(height, width);
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
        PDF.PdfRenderer = PdfRenderer;
    })(PDF = AngularThumbnails.PDF || (AngularThumbnails.PDF = {}));
})(AngularThumbnails || (AngularThumbnails = {}));

var AngularThumbnails;

(function(AngularThumbnails) {
    var RendererFactory = function() {
        function RendererFactory() {}
        RendererFactory.prototype.getRenderer = function(container, scope, type) {
            switch (type) {
              case "pdf":
                return new AngularThumbnails.PDF.PdfRenderer();

              case "image":
                return new AngularThumbnails.Images.ImageRenderer();

              case "video":
                return new AngularThumbnails.Video.VideoRenderer(container);
            }
            return new AngularThumbnails.NullRenderer();
        };
        return RendererFactory;
    }();
    AngularThumbnails.RendererFactory = RendererFactory;
})(AngularThumbnails || (AngularThumbnails = {}));

var AngularThumbnails;

(function(AngularThumbnails) {
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
    AngularThumbnails.RenderingViewport = RenderingViewport;
})(AngularThumbnails || (AngularThumbnails = {}));

var AngularThumbnails;

(function(AngularThumbnails) {
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
                    var renderer;
                    var renderFunc = function() {
                        scope.error = false;
                        renderer.render(scope, canvas, _this.qService.defer()).then(scope.onRender, scope.onError);
                    };
                    element.append(canvas);
                    renderer = _this.rendererFactory.getRenderer(element, scope, scope.fileType);
                    scope.thumbnail = element;
                    scope.$watch("source + fileType + scale + maxHeight + maxWidth", renderFunc);
                };
                this.rendererFactory = new AngularThumbnails.RendererFactory();
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
    })(Directives || (Directives = {}));
})(AngularThumbnails || (AngularThumbnails = {}));

var AngularThumbnails;

(function(AngularThumbnails) {
    var Video;
    (function(Video) {
        var VideoRenderer = function() {
            function VideoRenderer(container) {
                this.container = container;
                this.videoElement = document.createElement("video");
                this.container.append(this.videoElement);
            }
            VideoRenderer.prototype.render = function(scope, canvas, deferred) {
                var _this = this;
                this.videoElement.setAttribute("style", "display: none");
                this.videoElement.addEventListener("canplay", function() {
                    var height = scope.maxHeight || _this.videoElement.videoHeight;
                    var width = scope.maxWidth || _this.videoElement.videoWidth;
                    var viewport = new AngularThumbnails.RenderingViewport(height, width);
                    var context = canvas.getContext("2d");
                    viewport.adjustCanvas(canvas, _this.videoElement.videoHeight, _this.videoElement.videoWidth);
                    scope.$apply(function() {
                        context.drawImage(_this.videoElement, 0, 0, _this.videoElement.videoWidth, _this.videoElement.videoHeight, 0, 0, canvas.width, canvas.height);
                        deferred.resolve();
                    });
                });
                this.videoElement.src = scope.source;
                return deferred.promise;
            };
            return VideoRenderer;
        }();
        Video.VideoRenderer = VideoRenderer;
    })(Video = AngularThumbnails.Video || (AngularThumbnails.Video = {}));
})(AngularThumbnails || (AngularThumbnails = {}));