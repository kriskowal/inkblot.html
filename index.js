'use strict';
var Animator = require('blick');
var Document = require('gutentag/document');
var Scope = require('gutentag/scope');
var History = require('./history');
var Main = require('./main.html');
var document = new Document(window.document.body);
var scope = new Scope();
scope.animator = new Animator();
scope.main = new Main(document.documentElement, scope);
scope.main.story = require('./aelfwyrd.json');

scope.history = new History(window);
scope.history.handler = scope.main;
scope.main.history = scope.history;
if (!scope.history.update()) {
    scope.main.continue();
}
