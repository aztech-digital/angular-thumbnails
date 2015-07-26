(function () {

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
