lizard-atlas
============

A basic browsable atlas.

All configuration goes in `config.json` such as the title, logo, layers etc.


Development
-----------

In the root of the project

```
$ npm start
```
Then open localhost:3000 in a webbrowser...




Building for production
-----------------------

In the root of the project

```
$ NODE_ENV=production webpack -p --config webpack.production.config.js
```




TODO
----

- Add slideshow feature using mapboxGL and the Raster servers TMS endpoint