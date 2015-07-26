module AngularThumbnails {
    export interface ThumbnailScope extends ng.IScope {
        error?: any;
        onRender?: any;
        onProgress?: any;
        onError?: any;
        fileType:string;
        thumbnail?:any;
        maxHeight:number;
        maxWidth:number;
        source:string;
        scale?:number;
        pageNum?:number;
    }

    module Directives {

        class Thumbnail implements ng.IDirective {
            public restrict = 'E';
            public scope = {
                'source': '=',
                'scale': '=',
                'fileType': '@',
                'maxHeight': '@',
                'maxWidth': '@',
                'onRender': '&',
                'onError': '&'
            };

            private rendererFactory:RendererFactory;

            private qService:ng.IQService;

            constructor($q:ng.IQService) {
                this.rendererFactory = new RendererFactory();
                this.qService = $q;
            }

            link = (scope:ThumbnailScope, element:ng.IAugmentedJQuery, attrs:ng.IAttributes, ctrl:any) => {
                var canvas = document.createElement('canvas');
                var renderer:ElementRenderer;
                var renderFunc = () => {
                    scope.error = false;

                    renderer.render(scope, canvas, this.qService.defer()).then(scope.onRender, scope.onError);
                };

                element.append(canvas);

                renderer = this.rendererFactory.getRenderer(element, scope, scope.fileType);

                scope.thumbnail = element;
                scope.$watch('source + fileType + scale + maxHeight + maxWidth', renderFunc);
            }

            static factory():ng.IDirectiveFactory {
                const directive = ($q:ng.IQService) => new Thumbnail($q);

                directive.$inject = ['$q'];

                return directive;
            }
        }


        angular.module('angular-thumbnails', []).directive('thumbnail', Thumbnail.factory());
    }
}
