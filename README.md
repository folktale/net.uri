Net.URI
=======

[![Build Status](https://secure.travis-ci.org/folktale/net.uri.png?branch=master)](https://travis-ci.org/folktale/net.uri)
[![NPM version](https://badge.fury.io/js/net.uri.png)](http://badge.fury.io/js/net.uri)
[![Dependencies Status](https://david-dm.org/folktale/net.uri.png)](https://david-dm.org/folktale/net.uri)
[![experimental](http://hughsk.github.io/stability-badges/dist/experimental.svg)](http://github.com/hughsk/stability-badges)


Simple library for safely building URIs.


## Example

With Sweet.js macros:

```js
var URI = require('net.uri').URI

var url1 = $uri(URI => "http://www.example.com" ~ "foo/bar" ~ "baz" ? { qux: 'x' }
url1.toString() // => "http://www.example.com/foo%2fbar/baz?qux=x"
```

With vanilla JS:

```js
var URI = require('net.uri').URI

var url1 = URI.fromString("http://www.example.com").to("foo/bar")
                                                   .to("baz")
                                                   .set({ qux: 'x' })
url1.toStrign() // => "http://www.example.com/foo%2fbar/baz?qux=x"
```


## Installing

The easiest way is to grab it from NPM. If you're running in a Browser
environment, you can use [Browserify][]

    $ npm install net.uri


### Using with CommonJS

If you're not using NPM, [Download the latest release][release], and require
the `net.uri.umd.js` file:

```js
var uri = require('net.uri')
```


### Using with AMD

[Download the latest release][release], and require the `net.uri.umd.js`
file:

```js
require(['net.uri'], function(uri) {
  ( ... )
})
```


### Using without modules

[Download the latest release][release], and load the `net.uri.umd.js`
file. The properties are exposed in the global `folktale.net.uri` object:

```html
<script src="/path/to/net.uri.umd.js"></script>
```


### Compiling from source

If you want to compile this library from the source, you'll need [Git][],
[Make][], [Node.js][], and run the following commands:

    $ git clone git://github.com/folktale/net.uri.git
    $ cd net.uri
    $ npm install
    $ make bundle
    
This will generate the `dist/net.uri.umd.js` file, which you can load in
any JavaScript environment.

    
## Documentation

You can [read the documentation online][docs] or build it yourself:

    $ git clone git://github.com/folktale/net.uri.git
    $ cd net.uri
    $ npm install
    $ make documentation

Then open the file `docs/index.html` in your browser.


## Platform support

This library assumes an ES5 environment, but can be easily supported in ES3
platforms by the use of shims. Just include [es5-shim][] :)


## Licence

Copyright (c) 2014 Quildreen Motta.

Released under the [MIT licence](https://github.com/folktale/net.uri/blob/master/LICENCE).

<!-- links -->
[Fantasy Land]: https://github.com/fantasyland/fantasy-land
[Browserify]: http://browserify.org/
[Git]: http://git-scm.com/
[Make]: http://www.gnu.org/software/make/
[Node.js]: http://nodejs.org/
[es5-shim]: https://github.com/kriskowal/es5-shim
[docs]: http://folktale.github.io/net.uri
<!-- [release: https://github.com/folktale/net.uri/releases/download/v$VERSION/net.uri-$VERSION.tar.gz] -->
[release]: https://github.com/folktale/net.uri/releases/download/v0.1.1/net.uri-0.1.1.tar.gz
<!-- [/release] -->
