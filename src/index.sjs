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

/**
 * Simple library for safely building URIs.
 *
 * @module uri
 */

// -- Dependencies -----------------------------------------------------
var url      = require('url')
var path     = require('path')
var flaw     = require('flaw')
var ops      = require('core.operators')
var versione = require('versione')


// -- Exceptions -------------------------------------------------------
var InvalidStructure = flaw('InvalidStructure')


// -- Helpers ----------------------------------------------------------

/**
 * Checks the type of something
 *
 * @summary Function, Object → Void     :: throws
 */
function assertType(type, value) {
  if (!(value instanceof type))
    throw InvalidStructure('Expected ' + type.name + '.', { actual: value })
}


// -- Implementation ---------------------------------------------------

/**
 * Represents a segment of a Path.
 *
 * @class
 * @summary new(String) → PathSegment
 */
exports.PathSegment = PathSegment
function PathSegment(segment) {
  this._segment = segment === ''?  '.' : segment
}

/**
 * Returns a textual representation of the segment.
 *
 * @summary Void → String
 */
PathSegment.prototype.toString = function() {
  return encodeURIComponent(this._segment)
}

/**
 * True if this segment is equivalent to another segment.
 *
 * @summary PathSegment → Boolean
 */
PathSegment.prototype.isEqual = function(segment) {
  return segment instanceof PathSegment
  &&     this._segment === segment._segment
}


// ---------------------------------------------------------------------
/**
 * Represents a sequence of path segments.
 *
 * @class
 * @summary new([PathSegment], isRoot) → Path
 */
exports.Path = Path
function Path(segments, isRoot) {
  this._segments = segments
  this.isRoot    = isRoot
}

/**
 * Returns a path from a String representation.
 *
 * @summary String → Path
 */
Path.fromString = function(p) {
  p = path.normalize(url.parse(p).pathname || '/')

  return Path.fromArray( p.split('/').map(decodeURIComponent)
                       , /^\//.test(p))
}

/**
 * Returns a path from an array of segments
 *
 * @summary [String] → Path
 */
Path.fromArray = function(p, isRoot) {
  return new Path(p.map(ops.create(PathSegment)), isRoot)
}

/**
 * Returns a textual representation of the segment.
 *
 * @summary Void → String
 */
Path.prototype.toString = function() {
  var beginning = this.isRoot?  '/' : ''
  return path.join(beginning, path.normalize(this._segments.join('/')))
}

/**
 * True if the path is equal to another path.
 *
 * @summary Path → Boolean
 */
Path.prototype.isEqual = function(path) {
  return path instanceof Path
  &&     this.toString() === path.toString()
}

/**
 * Adds a segment to this path.
 *
 * @summary PathSegment → Path
 */
Path.prototype.add = function(segment) {
  assertType(PathSegment, segment)

  return new Path(this._segments.concat([segment]))
}

/**
 * Joins another path to this path.
 *
 * @summary Path → Path
 */
Path.prototype.join = function(p) {
  assertType(Path, p)

  return p.isRoot?        p
  :      /* otherwise */  Path.fromString(path.join(this.toString(), p.toString()))
}

/**
 * Returns the parent of this path.
 *
 * @summary Void → Path
 */
Path.prototype.parent = function() {
  return this.join(new Path([new PathSegment('..')]))
}


// ---------------------------------------------------------------------
/**
 * Represents the user information part of a URI
 *
 * @class
 * @summary new(String, String) → UserInfo
 */
exports.UserInfo = UserInfo
function UserInfo(username, password) {
  this.username = username
  this.password = password
}

/**
 * Constructs a new user info from a string.
 *
 * @summary String → UserInfo
 */
UserInfo.fromString = function(text) {
  var data = text.split(':')
  return data.length === 2? new UserInfo(data[0], data[1])
  :                         new EmptyUserInfo()
}

/**
 * Returns a textual representation of an user information.
 *
 * @summary Void → String
 */
UserInfo.prototype.toString = function() {
  return encodeURIComponent(this.username) + ':' + encodeURIComponent(this.password)
}

/**
 * True if this UserInfo equals another.
 *
 * @summary UserInfo → Boolean
 */
UserInfo.prototype.isEqual = function(a) {
  return a instanceof UserInfo
  &&     a.username === this.username
  &&     a.password === this.password
}

/**
 * Represents the abscence of user auth
 *
 * @summary new() → EmptyUserAuth
 */
exports.EmptyUserInfo = EmptyUserInfo
function EmptyUserInfo() { }

EmptyUserInfo.prototype.toString = function() {
  return ''
}

EmptyUserInfo.prototype.isEqual = function(a) {
  return a instanceof EmptyUserInfo
}


// ---------------------------------------------------------------------
/**
 * Represents a query string.
 *
 * @class
 * @summary new({ String → String }) → QueryString
 */
exports.QueryString = QueryString
function QueryString(data) {
  this._data = data
}

/**
 * Constructs a query string from a text representation.
 *
 * @summary String → QueryString
 */
QueryString.fromString = function(text) {
  return new QueryString(url.parse(text, true))
}

/**
 * Changes (merges) parameters in the query string.
 *
 * @summary { String → String } → QueryString
 */
QueryString.prototype.set = function(newData) {
  return new QueryString(versione(this._data, newData || {}))
}

/**
 * Removes parameters from the query string.
 *
 * @summary String → QueryString
 */
QueryString.prototype.remove = function(name) {
  var data = {}
  data[name] = null
  return this.set(data)
}

/**
 * Returns a textual representation of this query string.
 *
 * @summary String → QueryString
 */
QueryString.prototype.toString = function() {
  return '?' + url.format(this.toObject())
}

/**
 * Returns an object representing the stuff in this query.
 *
 * @summary Void → Object
 */
QueryString.prototype.toObject = function() {
  var r = {}
  for (var p in this._data)  r[p] = this._data[p]
  return r
}

/**
 * Merges two QueryStrings together.
 *
 * @summary QueryString → QueryString
 */
QueryString.prototype.merge = function(query) {
  assertType(QueryString, query)

  return this.set(query._data)
}


// ---------------------------------------------------------------------

/**
 * A consistent interface representing an URI.
 *
 * @summary new(Spec) → URI
 */
exports.URI = URI
function URI(spec) {
  return this.update(spec || {})
}

/**
 * Constructs a URI from a textual representation.
 *
 * @summary String → URI
 */
URI.fromString = function(text) {
  var data = url.parse(text, true)
  return new URI(versione(data, { pathname: Path.fromString(data.pathname)
                                , auth:     UserInfo.fromString(data.auth)
                                , query:    new QueryString(data.query) }))
}

/**
 * Returns a textual representation of a URI
 *
 * @summary Void → String
 */
URI.prototype.toString = function() {
  return url.format({ protocol : this.protocol
                    , hostname : this.hostname
                    , port     : this.port
                    , hash     : this.hash
                    , pathname : this._path.toString()
                    , auth     : this._auth.toString()
                    , query    : this._query.toObject() })
}

/**
 * Updates the fields in this URI.
 *
 * @summary Spec → URI
 */
URI.prototype.update = function(spec) {
  if (spec.pathname) assertType(Path, spec.pathname)
  if (spec.auth)     assertType(UserInfo, spec.auth)
  if (spec.query)    assertType(QueryString, spec.query)

  return versione(this, { protocol : spec.protocol || this.protocol
                        , hostname : spec.hostname || this.hostname
                        , port     : spec.port     || this.port
                        , hash     : spec.hash     || this.hash
                        , _path    : spec.pathname || this._path  || new Path([])
                        , _auth    : spec.auth     || this._auth  || new EmptyUserInfo()
                        , _query   : spec.query    || this._query || new QueryString({})
                        })
}

/**
 * Changes the parameters in the query string.
 *
 * @summary { String → String } → URI
 */
URI.prototype.set = function(data) {
  return this.update({ query: this._query.set(data) })
}

/**
 * Removes properties from the query string.
 *
 * @summary String → URI
 */
URI.prototype.remove = function(name) {
  return this.update({ query: this._query.remove(name) })
}

/**
 * Adds a path segment to the uri.
 *
 * @summary String → URI
 */
URI.prototype.to = function(segment) {
  return this.update({ pathname: this._path.add(new PathSegment(segment)) })
}

/**
 * Removes the last path segment from the URI.
 *
 * @summary Void → URI
 */
URI.prototype.up = function(segment) {
  return this.update({ pathname: this._path.parent() })
}

/**
 * Joins two paths.
 *
 * @summary Void → URI
 */
URI.prototype.join = function(p) {
  return this.update({ pathname: this._path.join(p) })
}
