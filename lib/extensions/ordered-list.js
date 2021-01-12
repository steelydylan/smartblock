"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = require("react");
var prosemirror_schema_list_1 = require("prosemirror-schema-list");
var ordered_list_1 = require("../components/icons/ordered-list");
var indent_1 = require("../components/icons/indent");
var undent_1 = require("../components/icons/undent");
var utils_1 = require("../utils");
var types_1 = require("../types");
var button_1 = require("../components/button");
var OrderedList = /** @class */ (function (_super) {
    __extends(OrderedList, _super);
    function OrderedList(props) {
        return _super.call(this, props) || this;
    }
    Object.defineProperty(OrderedList.prototype, "name", {
        get: function () {
            return 'ordered_list';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrderedList.prototype, "group", {
        get: function () {
            return 'block';
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrderedList.prototype, "showMenu", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrderedList.prototype, "schema", {
        get: function () {
            if (this.customSchema) {
                return this.customSchema;
            }
            return {
                content: 'list_item+',
                group: 'block',
                parseDOM: [
                    {
                        tag: 'ol',
                        getAttrs: function (dom) {
                            return {
                                id: dom.getAttribute('id')
                            };
                        }
                    }
                ],
                attrs: {
                    id: { default: '' }
                },
                toDOM: function (node) {
                    return [
                        'ol',
                        {
                            class: this.className
                        },
                        0
                    ];
                }
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrderedList.prototype, "icon", {
        get: function () {
            return React.createElement(ordered_list_1.default, { style: { width: '24px', height: '24px' } });
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(OrderedList.prototype, "hideBlockMenuOnFocus", {
        get: function () {
            return true;
        },
        enumerable: true,
        configurable: true
    });
    OrderedList.prototype.active = function (state) {
        return utils_1.blockActive(state.schema.nodes.ordered_list)(state);
    };
    OrderedList.prototype.enable = function (state) {
        var node = utils_1.getParentNodeFromState(state);
        if (node.type.name !== 'paragraph') {
            return false;
        }
        return prosemirror_schema_list_1.wrapInList(state.schema.nodes.ordered_list)(state);
    };
    OrderedList.prototype.onClick = function (state, dispatch) {
        var node = utils_1.getParentNodeFromState(state);
        if (node.type.name !== 'paragraph') {
            return false;
        }
        prosemirror_schema_list_1.wrapInList(state.schema.nodes.ordered_list)(state, dispatch);
    };
    OrderedList.prototype.customMenu = function (_a) {
        var state = _a.state, dispatch = _a.dispatch;
        return (React.createElement(React.Fragment, null,
            React.createElement(button_1.default, { type: "button", onClick: function () {
                    utils_1.liftListItem(state.schema.nodes.list_item)(state, dispatch);
                } },
                React.createElement(undent_1.default, { style: { width: '24px', height: '24px' } })),
            React.createElement(button_1.default, { type: "button", onClick: function () {
                    prosemirror_schema_list_1.sinkListItem(state.schema.nodes.list_item)(state, dispatch);
                } },
                React.createElement(indent_1.default, { style: { width: '24px', height: '24px' } }))));
    };
    return OrderedList;
}(types_1.Extension));
exports.default = OrderedList;
//# sourceMappingURL=ordered-list.js.map