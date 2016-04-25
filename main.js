'use strict';

var div = document.createElement('div');

module.exports = Main;

function Main(start) {
    this.instruction = {type: 'goto', label: 'start'};
    this.label = 'start';
    this.options = [];
    this.blocks = [[]];
    this.keywords = {};
}

Main.prototype.hookup = function hookup(id, component, scope) {
    if (id === 'this') {
        this.hookupThis(scope.components, scope);
    } else if (id === 'options:iteration') {
        this.hookupOption(component, scope.components, scope);
    }
};

Main.prototype.hookupThis = function hookupThis(components, scope) {
    this.contentElement = components.content;
    this.optionsElement = components.options;
};

Main.prototype.hookupOption = function hookupOption(component, components) {
    components.label.value = component.value.label;
    components.button.addEventListener('click', this);
    components.button.setAttribute("href", "#!" + component.value.branch);
    components.button.to = component.value.branch;
    component.destroy = destroyOption;
};

function destroyOption() {
    this.scope.components.button.removeEventListener('click', this);
}

Main.prototype.continue = function _continue() {
    var _continue;
    do {
        console.log('exec', this.instruction.type, this.instruction.label);
        if (!this['$' + this.instruction.type]) {
            throw new Error('Unexpected instruction type: ' + this.instruction.type);
        }
        _continue = this['$' + this.instruction.type](this.instruction);
    } while (_continue);
};

Main.prototype.next = function next() {
    this.goto(this.instruction.next);
};

Main.prototype.goto = function _goto(label) {
    var next = this.story[label];
    if (!next) {
        throw new Error('Story missing knot for label: ' + label);
    }
    this.instruction = next;
    this.label = label;
};

Main.prototype.flush = function flush() {
    if (this.options.clear) {
        this.options.clear();
    }
    this.keywords = {};
    this.blocks = [[]];
};

Main.prototype.$end = function end() {
    this.display();
    return false;
};

Main.prototype.$text = function text() {
    this.blocks[this.blocks.length - 1].push(this.instruction.text);
    this.next();
    return true;
};

Main.prototype.$break = function $break() {
    this.blocks.push([]);
    this.next();
    return true;
};

Main.prototype.$goto = function $goto() {
    this.goto(this.instruction.label);
    return true;
};

Main.prototype.$option = function option() {
    this.options.push(this.instruction);
    for (var i = 0; i < this.instruction.keywords.length; i++) {
        var keyword = this.instruction.keywords[i];
        this.keywords[keyword] = this.instruction.branch;
    }
    this.next();
    return true;
};

Main.prototype.$prompt = function prompt() {
    this.display();
    return false;
};

Main.prototype.display = function display() {
    var blocks = this.blocks.filter(getLength);
    this.contentElement.value = blocks.map(paragraph).join('');
    this.optionsElement.value = this.options;
};

Main.prototype.handleEvent = function handleEvent(event) {
    console.log('handle event', event.target.to);
    this.flush();
    this.history.push(event.target.to);
    this.goto(event.target.to);
    this.continue();
};

Main.prototype.setPath = function setPath(path) {
    console.log('set path', path);
    this.flush();
    this.goto(path);
    this.continue();
};

function paragraph(sentences) {
    return '<p>' + sentences.map(escapeHtml).join(' ') + '</p>';
}

function getLength(array) {
    return array.length;
}

function escapeHtml(html) {
    div.innerHTML = '';
    div.appendChild(document.createTextNode(html));
    return div.innerHTML;
}

