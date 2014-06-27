function extend(child, parent) {
    var F = function () { };
    F.prototype = parent.prototype;

    child.prototype = new F();
    child.prototype.constructor = child;
    child.superclass = parent.prototype;
};

if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str){
        return this.slice(0, str.length) == str;
    };
}

// No more javascript:void(0)
$(document).on('click', 'a', function (e) {
    if (this.href && '#' === this.href.substr(-1)) {
        e.preventDefault();
    }
});
