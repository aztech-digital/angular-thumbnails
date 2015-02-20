(function () {

  'use strict';

  function PaginationStatus(currentPage, totalPages) {
    var currentPage = parseInt(currentPage, 10),
      totalPages = parseInt(totalPages, 10);

    this.currentPage = function () {
      return currentPage;
    }

    this.nextPage = function () {
      if (currentPage >= totalPages) {
        return;
      }

      currentPage++;
    }

    this.previousPage = function () {
      if (currentPage == 1) {
        return;
      }

      currentPage--;
    }

    return this;
  };

  function RenderViewport(height, width, scale, rotation) {
    var _height = height,
      _width = width,
      _scale = scale || 1,
      _rotation = rotation || 0;

    this.adjustCanvasDimensions = function (height, width, canvas) {
      var ratio = width / height;

      if (height > _height) {
        height = _height;
        width = height * ratio;
      }

      if (width > _width) {
        width = _width;
        height = width / ratio;
      }

      canvas.height = height;
      canvas.width = width;
    }

    this.rotateClockwise = function () {
      _rotation += 90;
    }

    this.rotateCounterClockwise = function () {
      _rotation -= 90;
    }

    this.getRotation = function () {
      return _rotation;
    }

    return this;
  };

  function PdfRenderer(scope, canvas) {
    var pdfDoc = null;

    var renderPage = function (pagination) {
      pdfDoc.getPage(pagination.currentPage()).then(function (page) {
        var viewport = page.getViewport(parseInt(scope.scale, 10) || 1, 0),
          renderContext = {},
          targetViewport = new RenderViewport(
            scope.maxHeight || viewport.height,
            scope.maxWidth || viewport.width
          );

        targetViewport.adjustCanvasDimensions(viewport.height, viewport.width, canvas);

        page.render({
          canvasContext: canvas.getContext('2d'),
          viewport: page.getViewport(
            canvas.height / viewport.height,
            targetViewport.getRotation()
          )
        });
      });
    };

    this.render = function () {
      if (! scope.source) {
        return;
      }

      PDFJS.disableWorker = true;
      PDFJS.getDocument(scope.source, null, null, scope.onProgress).then(function (_pdfDoc) {
        pdfDoc = _pdfDoc;
        
        scope.$apply(function () {
          renderPage(new PaginationStatus(scope.pageNum || 1, pdfDoc.numPages));
        });
      }, function (error) {
        console.log(error);
      });
    };

    return this;
  };

  angular.module('angular-thumbnails', []).directive('thumbnail', function ($window) {
    return {
      restrict: 'E',
      scope: {
        'source': '=',
        'scale': '=',
        'fileType': '@',
        'maxHeight': '@',
        'maxWidth': '@'
      },
      link: function (scope, element, attrs) {
        var canvas = document.createElement('canvas'),
          renderer = null;

        element.append(canvas);

        if (scope.fileType == 'pdf') {
          renderer = new PdfRenderer(scope, canvas);
        }
        
        renderer.render();
      }

    };
  });

})();