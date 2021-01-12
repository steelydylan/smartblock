"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var prosemirror_state_1 = require("prosemirror-state");
var react_dom_1 = require("react-dom");
var tooltip_react_1 = require("./tooltip-react");
var utils_1 = require("../../utils");
var useRef = React.useRef;
var ARROWOFFSET = 50;
var ARROWTOPOFFSET = 30;
var calculateStyle = function (view) {
    var selection = view.state.selection;
    var app = view.dom;
    var $anchor = view.state.selection.$anchor;
    var nodeAfter = $anchor.nodeAfter;
    var link = null;
    if (nodeAfter) {
        link = nodeAfter.marks.find(function (mark) {
            if (mark.type.name === 'link') {
                return true;
            }
        });
    }
    if (!selection || selection.empty || !app || !link) {
        return {
            left: -1000,
            top: 0
        };
    }
    var coords = view.coordsAtPos(selection.$head.pos);
    var top = coords.top + utils_1.getScrollTop() + ARROWTOPOFFSET;
    var left = coords.left - ARROWOFFSET;
    var width = 320; // container.current.offsetWidth
    if (left + width > window.innerWidth) {
        return {
            top: top,
            left: window.innerWidth - width
        };
    }
    return {
        left: left,
        top: top
    };
};
var calculatePos = function (view) {
    var selection = view.state.selection;
    var app = view.dom;
    var $anchor = view.state.selection.$anchor;
    var nodeAfter = $anchor.nodeAfter;
    var link = null;
    if (nodeAfter) {
        link = nodeAfter.marks.find(function (mark) {
            if (mark.type.name === 'link') {
                return true;
            }
            return false;
        });
    }
    if (!selection || selection.empty || !app || !link) {
        return 20;
    }
    var coords = view.coordsAtPos(selection.$head.pos);
    var left = coords.left - ARROWOFFSET;
    var width = 320; // container.current.offsetWidth
    if (left + width > window.innerWidth) {
        return left - window.innerWidth + width;
    }
    return 20;
};
var TooltipComponent = function (props) {
    var view = props.view;
    var container = useRef(null);
    var style = calculateStyle(view);
    var selection = view.state.selection;
    var $anchor = selection.$anchor;
    var nodeBefore = $anchor.nodeBefore, nodeAfter = $anchor.nodeAfter, pos = $anchor.pos;
    var link = null;
    var editing = false;
    if (nodeAfter) {
        link = nodeAfter.marks.find(function (mark) {
            if (mark.type.name === 'link') {
                return true;
            }
        });
    }
    var url = '';
    if (link) {
        url = link.attrs.href;
    }
    if (link) {
        editing = link.attrs.editing;
    }
    var beforePos = selection.from;
    var afterPos = selection.to;
    if (beforePos === afterPos && nodeBefore && nodeAfter) {
        beforePos = pos - nodeBefore.nodeSize;
        afterPos = pos + nodeAfter.nodeSize;
    }
    var arrowPos = calculatePos(view);
    return (React.createElement("div", { className: "smartblock-tooltip-wrap", ref: container, style: style },
        React.createElement("div", { className: "smartblock-tooltip-arrow", style: { left: arrowPos + "px" } }),
        React.createElement(tooltip_react_1.default, { url: url, editing: editing, onClick: function (href) {
                var tr = view.state.tr;
                tr.removeMark(beforePos, afterPos, view.state.schema.marks.link);
                if (!href) {
                    view.dispatch(tr);
                    return;
                }
                tr.addMark(beforePos, afterPos, view.state.schema.marks.link.create({ href: href, editing: false }));
                view.dispatch(tr);
            } })));
};
var Tooltip = /** @class */ (function () {
    function Tooltip(view) {
        this.tooltip = document.createElement('div');
        document.body.appendChild(this.tooltip);
        this.update(view);
    }
    Tooltip.prototype.render = function (view) {
        react_dom_1.render(React.createElement(TooltipComponent, { view: view }), this.tooltip);
    };
    Tooltip.prototype.update = function (view) {
        this.render(view);
    };
    Tooltip.prototype.destroy = function () {
        react_dom_1.unmountComponentAtNode(this.tooltip);
        document.body.removeChild(this.tooltip);
    };
    return Tooltip;
}());
exports.default = (function () {
    return new prosemirror_state_1.Plugin({
        view: function (view) {
            return new Tooltip(view);
        }
    });
});
//# sourceMappingURL=tooltip.js.map