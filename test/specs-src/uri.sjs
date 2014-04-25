// Copyright (c) 2014 Quildreen Motta
//
// Permission is hereby granted, free of charge, to any person
// obtaining a copy of this software and associated documentation files
// (the "Software"), to deal in the Software without restriction,
// including without limitation the rights to use, copy, modify, merge,
// publish, distribute, sublicense, and/or sell copies of the Software,
// and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var spec     = require('hifive')()
var claire   = require('claire')
var alright  = require('../alright')
var uri      = require('../../lib/')
var ops      = require('core.operators')
var curry    = require('core.lambda').curry
var spread   = require('core.lambda').spread
var versione = require('versione')

// Aliases
var _         = alright
var forAll    = claire.forAll
var t         = claire.data
var URI       = uri.URI
var fmap      = claire.transform
var label     = claire.label
var repeat    = claire.repeat
var sequence  = claire.sequence
var frequency = claire.frequency
var choice    = claire.choice
var join      = fmap(joinArray)

// Helpers
var makePath = curry(2, function (a, b) { return new uri.Path(b, a) })
function joinArray(xs){ return xs.join('') }
function resize(n, g){ return claire.sized(function(){ return n }, g) }
var isnt = curry(2, function(a, b){ return a !== b })


// Data types
var TReserved    = choice.apply(null, ':/?#[]@!$&\'()*+,;='.split(''))
var TUnreserved  = choice.apply(null, '-._~'.split(''))
var TComponent   = label( 'Component'
                        , resize(10, join(repeat(frequency([100, t.AlphaNumChar]
                                                          ,[4, TUnreserved]
                                                          ,[2, TReserved]
                                                          ,[1, t.Char]
                                                          )))))
var TPathSegment = label( 'PathSegment'
                        , fmap(ops.create(uri.PathSegment), TComponent))

var TPath        = label( 'Path'
                        , fmap( spread(makePath)
                              , sequence(t.Bool, repeat(TPathSegment))))

var TRootPath    = label( 'RootPath'
                        , fmap(makePath(true), repeat(TPathSegment)))

var TRelPath     = label( 'RelativePath'
                        , fmap(makePath(false), repeat(TPathSegment)))

var TPositiveInt = fmap(Math.floor, t.Positive)


module.exports = spec('Net.URI', function(it, spec) {

  spec('PathSegment', function(it) {
    
    it( '#toString() should encode the segment as an URI component.'
      , forAll(t.Str).given(isnt('')).satisfy(function(a) {
          var segment = new uri.PathSegment(a)
          return segment.toString() => encodeURIComponent(a)
        }).asTest())

    it( 'PathSegment("") should be treated as PathSegment(".")'
      , function() {
          (new uri.PathSegment('')).toString() => (new uri.PathSegment('.')).toString()
      })

    it( '#isEqual(a) should succeed if both path segments are equivalent.'
      , forAll(TPathSegment, TPathSegment).satisfy(function(a, b) {
          var c = { _segment: a._segment }
          return (
            a.isEqual(a) => true,
            b.isEqual(b) => true,
            a.isEqual(c) => false
          )
        }).asTest())

  })

  spec('Path', function(it) {
    it( 'fromString(s).toString() <=> s'
      , forAll(TPath).satisfy(function(p) {
          return uri.Path.fromString(p.toString()).toString() => p.toString()
        }).asTest())
      
    it( 'Root paths should start with /'
      , forAll(TPath).satisfy(function(p) {
          p.isRoot = true
          return p.toString() should _.match(/^\//)
        }).asTest())

    it( 'Non-root paths shouldn\'t start with /'
      , forAll(TPath).satisfy(function(p) {
          p.isRoot = false
          return p.toString() should not _.match(/\^\//)
        }).asTest())

    it( 'add("..") and parent() goes up one level', function() {
      var up = new uri.PathSegment('..')
      var p  = uri.Path.fromArray(['a', 'b/c', 'd'])
      p.add(up).toString().toLowerCase() => 'a/b%2fc'
      p.add(up).toString().toLowerCase() => p.parent().toString().toLowerCase()
    })

    it( 'join(p) should equal p if p.isRoot'
      , forAll(TPath, TRootPath).satisfy(function(p, q) {
          return p.join(q).toString() => q.toString()
        }).asTest())

    it( 'isEqual(a) should equal if they resolve to the same path.'
      , forAll(TRootPath).satisfy(function(p) {
          var a = { toString: function(){ return p.toString() }}
          var q = versione(p, { isRoot: false })
          return (
            p.isEqual(p) => true,
            q.isEqual(q) => true,
            p.isEqual(q) => false,
            q.isEqual(p) => false,
            p.isEqual(a) => false
          )
        }).asTest())
  })

  spec('UserInfo', function(it) {
    it( 'fromString("a:b") should construct a UserInfo("a", "b")'
      , forAll(t.Str, t.Str).satisfy(function(a, b) {
          a = a.replace(/:/g, '')
          b = b.replace(/:/g, '')
          var c = uri.UserInfo.fromString(a + ':' + b)
          return (
            c.username => a,
            c.password => b
          )
        }).asTest())

    it( 'fromString(a) without a single : separator should construct an EmptyUserInfo'
      , forAll(t.Str, TPositiveInt).given(function(_, b){ return b !== 2 && b > 0 }).satisfy(function(a, b) {
          a = a.replace(/:/g, '')
          var as = Array.apply(null, Array(b)).map(function(){ return a }).join(':')
          return uri.UserInfo.fromString(as).toString() => ''
        }).asTest())

  })

})
