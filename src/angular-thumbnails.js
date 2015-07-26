(function () {

  'use strict';

  function PaginationStatus(currentPage, totalPages) {
    var _currentPage = parseInt(currentPage, 10),
      _totalPages = parseInt(totalPages, 10);

    this.currentPage = function () {
      return _currentPage;
    };

    this.nextPage = function () {
      if (_currentPage >= _totalPages) {
        return;
      }

      _currentPage += 1;
    };

    this.previousPage = function () {
      if (_currentPage === 1) {
        return;
      }

      _currentPage -= 1;
    };

    return this;
  }

  function PdfRenderer(scope, canvas) {
    var pdfDoc = null,
      renderPage = function (pagination) {
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

    this.render = function (deferred) {
      if (!scope.source) {
        return deferred.promise;
      }

      try {
        PDFJS.getDocument(scope.source, null, null, scope.onProgress).then(function (_pdfDoc) {
          pdfDoc = _pdfDoc;

          scope.$apply(function () {
            renderPage(new PaginationStatus(scope.pageNum || 1, pdfDoc.numPages));
            deferred.resolve();
          });

        }, function (error) {
          deferred.reject({error: error, element: scope.thumbnail });
        }).then(null, function (error) { deferred.reject(error); });
      } catch (exception) {
        deferred.reject(exception);
      }

      return deferred.promise;
    };

    return this;
  }

  function VideoRenderer(scope, container, canvas) {
    this.render = function (deferred) {
      var video = document.createElement('video');

      video.setAttribute('style', 'display: none');
      video.addEventListener('canplay', function () {
        (new RenderViewport(
          scope.maxHeight || video.videoHeight,
          scope.maxWidth || video.videoWidth
        )).adjustCanvasDimensions(video.videoHeight, video.videoWidth, canvas);

        scope.$apply(function () {
          canvas.getContext('2d')
            .drawImage(video,
              0, 0, video.videoWidth, video.videoHeight,
              0, 0, canvas.width, canvas.height
            );
        });

        deferred.resolve();
      });

      container.append(video);

      video.src = scope.source;

      return deferred.promise;
    }

    return this;
  }

  function ImageRenderer(scope, canvas) {
    this.render = function (deferred) {
      var img = new Image();

      img.addEventListener('load', function () {
        scope.$apply(function () {
          (new RenderViewport(
            scope.maxHeight || img.height,
            scope.maxWidth || img.width
          )).adjustCanvasDimensions(img.height, img.width, canvas);

          canvas.getContext('2d')
            .drawImage(img,
              0, 0, img.width, img.height,
              0, 0, canvas.width, canvas.height
            );
        });

        deferred.resolve();
      }, false);

      img.src = scope.source;

      return deferred.promise;
    };

    return this;
  }

  var module = angular.module('angular-thumbnails', []);
  
  module.directive('thumbnail', function ($window, $parse, $q) {
    return {
      restrict: 'E',
      scope: {
        'source': '=',
        'scale': '=',
        'fileType': '@',
        'maxHeight': '@',
        'maxWidth': '@',
        'onRender': '&',
        'onError': '&'
      },
      link: function (scope, element, attrs) {
        var canvas = document.createElement('canvas'),
            renderer = null,
            renderFunc = function () {
              if (renderer) {
                scope.error = false;
                
                renderer.render($q.defer()).then(scope.onRender, scope.onError);
              }
            };

        element.append(canvas);

        if (scope.fileType === 'pdf') {
          renderer = new PdfRenderer(scope, canvas);
        } else if (scope.fileType === 'image') {
          renderer = new ImageRenderer(scope, canvas);
        } else if (scope.fileType === 'video') {
          renderer = new VideoRenderer(scope, element, canvas); 
        }

        scope.thumbnail = element;
        scope.$watch('source + fileType + scale + maxHeight + maxWidth', renderFunc);
      }
    };
  });
}());
