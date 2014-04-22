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

var spec    = require('hifive')()
var claire  = require('claire')
var alright = require('../alright')
var uri     = require('../../lib/')
var ops     = require('core.operators')

// Aliases
var forAll = claire.forAll
var t      = claire.data
var URI    = uri.URI
var fmap   = claire.transform
var label  = claire.label

// Data types
var TPathSegment = label('PathSegment', fmap(ops.create(uri.PathSegment), t.Str))

module.exports = spec('Net.URI', function(it, spec) {

  spec('PathSegment', function(it) {
    
    it( '#toString() should encode the segment as an URI component.'
      , forAll(t.Str).satisfy(function(a) {
          var segment = new uri.PathSegment(a)
          return segment.toString() => encodeURIComponent(a)
        }).asTest())

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
    spec('.fromString(s)', function(it) {
      
    })
  })

})
