# angular-thumbnails

AngularJS directive to render thumbnails of images, videos, and PDF files in canvas elements.

## Installation

This library is available via Bower:

`bower install angular-thumbnails --save`

## Usage

### Including the directive

Add the script to your index.html:

```html
<script src="./bower_components/angular-thumbnails/dist/angular-thumbnails.min.js"></script>
```

Add the module to your angular application:

```
var myApp = angular.module('myApp', [ 'angular-thumbnails' ];
```

The `thumbnail` element becomes available:

```html
<body ng-app="myApp">
  <thumbnail file-type="image" source="'image.jpg'" max-height="150" max-width="300"></thumbnail>
</body>
```

Within a controller's scope, you can bind the thumbnail settings to your scope variables:

```html
<body ng-app="myApp">
  <div ng-controller="myController">
    <thumbnail file-type="{{ thumbnailType }}" source="thumbnailSource" max-height="{{ thumbnailHeight }}" max-width="{{ thumbnailWidth }}"></thumbnail>
  </div>
</body>
```

## Directive attributes

- `file-type`: Specifies the type of the source media. Accepted values are `image`, `video`, `pdf`.
- `source`: URI (can be a data encoded URI) to the media to render.
- `max-height`: Maximum height of the thumbnail in pixels.
- `max-width`: Maximum width of the thumbnail in pixels.

There currently is no way to set the actual height/width of the thumbnail. The values will calculated based on the
dimensions of the rendered element, respecting the height/width ratio of the element.
