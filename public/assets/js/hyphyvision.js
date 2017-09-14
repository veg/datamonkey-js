(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("react"), require("underscore"), require("react-dom"), require("d3"), require("phylotree"), require("d3-save-svg"), require("phylotree.css"), require("save-svg-as-png"), require("bootstrap"), require("chi-squared"), require("csvexport"), require("react-copy-to-clipboard"));
	else if(typeof define === 'function' && define.amd)
		define(["react", "underscore", "react-dom", "d3", "phylotree", "d3-save-svg", "phylotree.css", "save-svg-as-png", "bootstrap", "chi-squared", "csvexport", "react-copy-to-clipboard"], factory);
	else if(typeof exports === 'object')
		exports["hyphyVision"] = factory(require("react"), require("underscore"), require("react-dom"), require("d3"), require("phylotree"), require("d3-save-svg"), require("phylotree.css"), require("save-svg-as-png"), require("bootstrap"), require("chi-squared"), require("csvexport"), require("react-copy-to-clipboard"));
	else
		root["hyphyVision"] = factory(root["react"], root["underscore"], root["react-dom"], root["d3"], root["phylotree"], root["d3-save-svg"], root["phylotree.css"], root["save-svg-as-png"], root["bootstrap"], root["chi-squared"], root["csvexport"], root["react-copy-to-clipboard"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_0__, __WEBPACK_EXTERNAL_MODULE_1__, __WEBPACK_EXTERNAL_MODULE_3__, __WEBPACK_EXTERNAL_MODULE_7__, __WEBPACK_EXTERNAL_MODULE_11__, __WEBPACK_EXTERNAL_MODULE_15__, __WEBPACK_EXTERNAL_MODULE_16__, __WEBPACK_EXTERNAL_MODULE_17__, __WEBPACK_EXTERNAL_MODULE_38__, __WEBPACK_EXTERNAL_MODULE_39__, __WEBPACK_EXTERNAL_MODULE_40__, __WEBPACK_EXTERNAL_MODULE_41__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 42);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_0__;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_1__;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var root = undefined;
var datamonkey = function datamonkey() {};
//var $ = require("jquery");

if (true) {
  if (typeof module !== "undefined" && module.exports) {
    exports = module.exports = datamonkey;
  }
  exports.datamonkey = datamonkey;
} else {
  root.datamonkey = datamonkey;
}

datamonkey.errorModal = function (msg) {
  $("#modal-error-msg").text(msg);
  $("#errorModal").modal();
};

function b64toBlob(b64, onsuccess, onerror) {
  var img = new Image();

  img.onerror = onerror;

  img.onload = function onload() {
    var canvas = document.getElementById("hyphy-chart-canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(onsuccess);
  };

  img.src = b64;
}

datamonkey.export_csv_button = function (data) {
  data = d3.csv.format(data);
  if (data !== null) {
    var pom = document.createElement("a");
    pom.setAttribute("href", "data:text/csv;charset=utf-8," + encodeURIComponent(data));
    pom.setAttribute("download", "export.csv");
    pom.className = "btn btn-default btn-sm";
    pom.innerHTML = '<span class="glyphicon glyphicon-floppy-save"></span> Download CSV';
    $("body").append(pom);
    pom.click();
    pom.remove();
  }
};

datamonkey.save_image = function (type, container) {
  var prefix = {
    xmlns: "http://www.w3.org/2000/xmlns/",
    xlink: "http://www.w3.org/1999/xlink",
    svg: "http://www.w3.org/2000/svg"
  };

  function get_styles(doc) {
    function process_stylesheet(ss) {
      try {
        if (ss.cssRules) {
          for (var i = 0; i < ss.cssRules.length; i++) {
            var rule = ss.cssRules[i];
            if (rule.type === 3) {
              // Import Rule
              process_stylesheet(rule.styleSheet);
            } else {
              // hack for illustrator crashing on descendent selectors
              if (rule.selectorText) {
                if (rule.selectorText.indexOf(">") === -1) {
                  styles += "\n" + rule.cssText;
                }
              }
            }
          }
        }
      } catch (e) {
        //console.log("Could not process stylesheet : " + ss);
      }
    }

    var styles = "",
        styleSheets = doc.styleSheets;

    if (styleSheets) {
      for (var i = 0; i < styleSheets.length; i++) {
        process_stylesheet(styleSheets[i]);
      }
    }

    return styles;
  }

  var svg = $(container).find("svg")[0];
  if (!svg) {
    svg = $(container)[0];
  }

  var styles = get_styles(window.document);

  svg.setAttribute("version", "1.1");

  var defsEl = document.createElement("defs");
  svg.insertBefore(defsEl, svg.firstChild);

  var styleEl = document.createElement("style");
  defsEl.appendChild(styleEl);
  styleEl.setAttribute("type", "text/css");

  // removing attributes so they aren't doubled up
  svg.removeAttribute("xmlns");
  svg.removeAttribute("xlink");

  // These are needed for the svg
  if (!svg.hasAttributeNS(prefix.xmlns, "xmlns")) {
    svg.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
  }

  if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
    svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
  }

  var source = new XMLSerializer().serializeToString(svg).replace("</style>", "<![CDATA[" + styles + "]]></style>");
  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
  var to_download = [doctype + source];
  var image_string = "data:image/svg+xml;base66," + encodeURIComponent(to_download);

  if (type == "png") {
    b64toBlob(image_string, function (blob) {
      var url = window.URL.createObjectURL(blob);
      var pom = document.createElement("a");
      pom.setAttribute("download", "image.png");
      pom.setAttribute("href", url);
      $("body").append(pom);
      pom.click();
      pom.remove();
    }, function (error) {
      // handle error
    });
  } else {
    var pom = document.createElement("a");
    pom.setAttribute("download", "image.svg");
    pom.setAttribute("href", image_string);
    $("body").append(pom);
    pom.click();
    pom.remove();
  }
};

datamonkey.validate_date = function () {
  // Check that it is not empty
  if ($(this).val().length === 0) {
    $(this).next(".help-block").remove();
    $(this).parent().removeClass("has-success");
    $(this).parent().addClass("has-error");

    jQuery("<span/>", {
      class: "help-block",
      text: "Field is empty"
    }).insertAfter($(this));
  } else if (isNaN(Date.parse($(this).val()))) {
    $(this).next(".help-block").remove();
    $(this).parent().removeClass("has-success");
    $(this).parent().addClass("has-error");

    jQuery("<span/>", {
      class: "help-block",
      text: "Date format should be in the format YYYY-mm-dd"
    }).insertAfter($(this));
  } else {
    $(this).parent().removeClass("has-error");
    $(this).parent().addClass("has-success");
    $(this).next(".help-block").remove();
  }
};

$(document).ready(function () {
  $(function () {
    $('[data-toggle="tooltip"]').tooltip();
  });
  $("#datamonkey-header").collapse();

  var initial_padding = $("body").css("padding-top");

  $("#collapse_nav_bar").on("click", function (e) {
    $("#datamonkey-header").collapse("toggle");
    $(this).find("i").toggleClass("fa-times-circle fa-eye");
    var new_padding = $("body").css("padding-top") == initial_padding ? "5px" : initial_padding;
    d3.select("body").transition().style("padding-top", new_padding);
  });
});

/***/ }),
/* 3 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_3__;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var React = __webpack_require__(0);

var Hamburger = React.createClass({
  displayName: "Hamburger",

  render: function render() {
    return React.createElement(
      "button",
      {
        type: "button",
        className: "navbar-toggle",
        "data-toggle": "collapse",
        "data-target": "#navbar-collapse-1"
      },
      React.createElement(
        "span",
        { className: "sr-only" },
        "Toggle navigation"
      ),
      React.createElement("span", { className: "icon-bar" }),
      React.createElement("span", { className: "icon-bar" }),
      React.createElement("span", { className: "icon-bar" })
    );
  }
});

var Methods = React.createClass({
  displayName: "Methods",

  render: function render() {
    return React.createElement(
      "div",
      { className: "dropdown" },
      React.createElement(
        "button",
        {
          className: "btn btn-primary dropdown-toggle",
          type: "button",
          "data-toggle": "dropdown"
        },
        "Tools",
        React.createElement("span", { className: "caret" })
      ),
      React.createElement(
        "ul",
        { className: "dropdown-menu" },
        React.createElement(
          "li",
          null,
          React.createElement(
            "a",
            { href: "#" },
            "aBSREL"
          )
        ),
        React.createElement(
          "li",
          null,
          React.createElement(
            "a",
            { href: "../relax" },
            "RELAX"
          )
        ),
        React.createElement(
          "li",
          null,
          React.createElement(
            "a",
            { href: "../busted" },
            "BUSTED"
          )
        ),
        React.createElement(
          "li",
          null,
          React.createElement(
            "a",
            { href: "../fade" },
            "FADE"
          )
        ),
        React.createElement(
          "li",
          null,
          React.createElement(
            "a",
            { href: "../slac" },
            "SLAC"
          )
        )
      )
    );
  }
});

React.createElement(
  "div",
  { className: "dropdown" },
  React.createElement(
    "button",
    {
      className: "btn btn-primary dropdown-toggle",
      type: "button",
      "data-toggle": "dropdown"
    },
    "Dropdown Example",
    React.createElement("span", { className: "caret" })
  ),
  React.createElement(
    "ul",
    { className: "dropdown-menu" },
    React.createElement(
      "li",
      null,
      React.createElement(
        "a",
        { href: "#" },
        "HTML"
      )
    ),
    React.createElement(
      "li",
      null,
      React.createElement(
        "a",
        { href: "#" },
        "CSS"
      )
    ),
    React.createElement(
      "li",
      null,
      React.createElement(
        "a",
        { href: "#" },
        "JavaScript"
      )
    )
  )
);

var NavBar = React.createClass({
  displayName: "NavBar",

  componentDidMount: function componentDidMount() {
    // Corrects navbar offset when clicking anchor hash
    var shiftWindow = function shiftWindow() {
      scrollBy(0, -50);
    };
    if (location.hash) shiftWindow();
    window.addEventListener("hashchange", shiftWindow);
  },
  render: function render() {
    var self = this,
        input_style = {
      position: "absolute",
      top: 0,
      right: 0,
      minWidth: "100%",
      minHeight: "100%",
      fontSize: "100px",
      textAlign: "right",
      filter: "alpha(opacity=0)",
      opacity: 0,
      outline: "none",
      background: "white",
      cursor: "inherit",
      display: "block"
    };
    return React.createElement(
      "nav",
      { className: "navbar navbar-default navbar-fixed-top", role: "navigation" },
      React.createElement(
        "div",
        { className: "container" },
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "div",
            { className: "col-sm-12" },
            React.createElement(
              "a",
              { href: "#" },
              React.createElement("img", { id: "hyphy-logo", src: "../../images/hyphy-logo.svg" })
            ),
            React.createElement(
              "div",
              { className: "navbar-header" },
              React.createElement(Hamburger, null)
            ),
            React.createElement(
              "div",
              { className: "collapse navbar-collapse", id: "navbar-collapse-1" },
              React.createElement(
                "ul",
                { className: "nav navbar-nav" },
                React.createElement(
                  "a",
                  {
                    href: "#",
                    className: "nav-button",
                    role: "button",
                    style: { position: "relative", overflow: "hidden" }
                  },
                  React.createElement("input", {
                    type: "file",
                    style: input_style,
                    id: "dm-file",
                    onChange: self.props.onFileChange
                  }),
                  "Load"
                ),
                React.createElement(
                  "a",
                  {
                    href: "#",
                    className: "nav-button",
                    role: "button",
                    style: { display: "none" }
                  },
                  "Export"
                )
              ),
              React.createElement(Methods, null)
            )
          )
        )
      )
    );
  }
});

module.exports.NavBar = NavBar;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var React = __webpack_require__(0);

var ScrollSpy = React.createClass({
  displayName: "ScrollSpy",

  render: function render() {
    var list_items = this.props.info.map(function (item, index) {
      var is_active = index == 0 ? "active" : "",
          href = "#" + item.href;
      return React.createElement(
        "li",
        { className: is_active, key: item.label },
        React.createElement(
          "a",
          { href: href },
          item.label
        )
      );
    });
    return React.createElement(
      "nav",
      { className: "col-sm-2 bs-docs-sidebar" },
      React.createElement(
        "ul",
        { className: "nav nav-pills nav-stacked fixed" },
        list_items
      )
    );
  }
});

module.exports.ScrollSpy = ScrollSpy;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var React = __webpack_require__(0),
    _ = __webpack_require__(1),
    d3 = __webpack_require__(7),
    datamonkey = __webpack_require__(2);

__webpack_require__(40);

var DatamonkeyTableRow = React.createClass({
  displayName: "DatamonkeyTableRow",

  /**
      A single table row
       *rowData* is an array of cells
          each cell can be one of
              1. string: simply render the text as shown
              2. object: a polymorphic case; can be rendered directly (if the object is a valid react.js element)
                 or via a transformation of the value associated with the key 'value'
                  supported keys
                  2.1. 'value' : the value to use to generate cell context
                  2.2. 'format' : the function (returning something react.js can render directly) that will be called
                  to transform 'value' into the object to be rendered
                  2.3. 'span' : colSpan attribute
                  2.4. 'style': CSS style attributes (JSX specification, i.e. {margin-top: '1em'} and not a string)
                  2.5. 'classes': CSS classes to apply to the cell
                  2.6. 'abbr': wrap cell value in <abbr> tags
               3. array: directly render array elements in the cell (must be renderable to react.js; note that plain
              text elements will be wrapped in "span" which is not allowed to nest in <th/td>
        *header* is a bool indicating whether the header is a header row (th cells) or a regular row (td cells)
  */

  /*propTypes: {
   rowData: React.PropTypes.arrayOf (React.PropTypes.oneOfType ([React.PropTypes.string,React.PropTypes.number,React.PropTypes.object,React.PropTypes.array])).isRequired,
   header:  React.PropTypes.bool,
  },*/

  dm_compareTwoValues: function dm_compareTwoValues(a, b) {
    /* this should be made static */

    /**
        compare objects by iterating over keys
         return 0 : equal
               1 : a < b
               2 : a > b
               -1 : cannot be compared
               -2 : not compared, but could contain 'value' objects that could be compared
    */

    var myType = typeof a === "undefined" ? "undefined" : _typeof(a),
        self = this;

    if (myType == (typeof b === "undefined" ? "undefined" : _typeof(b))) {
      // Parse as float if possible
      var parsed_a = parseFloat(a);
      var parsed_b = parseFloat(b);

      a = _.isNaN(parsed_a) ? a : parsed_a;
      b = _.isNaN(parsed_b) ? b : parsed_b;

      // If it's a string or number, it can be sorted with a simple greater than
      if (myType == "string" || myType == "number") {
        return a == b ? 0 : a > b ? 2 : 1;
      }

      if (_.isArray(a) && _.isArray(b)) {
        if (a.length != b.length) {
          return a.length > b.length ? 2 : 1;
        }

        var comparison_result = 0;

        _.every(a, function (c, i) {
          var comp = self.dm_compareTwoValues(c, b[i]);
          if (comp != 0) {
            comparison_result = comp;
            return false;
          }
          return true;
        });

        return comparison_result;
      }

      return -2;
      // further check to see if 'this' has a "value" attribute
    }
    return -1;
  },

  dm_compareTwoValues_level2: function dm_compareTwoValues_level2(a, b) {
    var compare = this.dm_compareTwoValues(a, b);

    if (compare == -2) {
      if (_.has(a, "value") && _.has(b, "value")) {
        return this.dm_compareTwoValues(a.value, b.value);
      }
    }

    return compare;
  },

  dm_log100times: _.before(100, function (v) {
    return 0;
  }),

  getInitialState: function getInitialState() {
    return {
      header: []
    };
  },

  shouldComponentUpdate: function shouldComponentUpdate(nextProps) {

    var self = this;

    if (this.state.header !== nextProps.header) {
      return true;
    }

    if (this.props.sortOn != nextProps.sortOn) {
      return true;
    }

    var result = _.some(this.props.rowData, function (value, index) {

      // check for format and other field equality
      if (!_.isMatch(value, nextProps.rowData[index])) {
        return true;
      }

      if (value === nextProps.rowData[index]) {
        return false;
      }

      if (value === nextProps.rowData[index]) {
        return false;
      }

      var compare = self.dm_compareTwoValues_level2(value, nextProps.rowData[index]);
      if (compare >= 0) {
        if (compare == 0) {
          // values match, compare properties
          var existing_keys = _.keys(value),
              new_keys = _.keys(nextProps.rowData[index]),
              shared = _.intersection(existing_keys, new_keys);

          if (shared.length < new_keys.length || shared.length < existing_keys.length) {
            return true;
          }

          return false;
        } else {
          return true;
        }
      }

      return true;
    });

    return result;
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({
      header: nextProps.header
    });
  },

  render: function render() {
    var entity_regex = /(&*;)|(<*>)/;
    return React.createElement(
      "tr",
      null,
      this.props.rowData.map(_.bind(function (cell, index) {
        var value = _.has(cell, "value") ? cell.value : cell;

        if (_.isArray(value)) {
          if (!_.has(cell, "format")) {
            return value;
          }
        } else {
          if (_.isObject(value)) {
            if (!React.isValidElement(value)) {
              return null;
            }
          }
        }

        if (_.has(cell, "format")) {
          value = cell.format(value);
        }

        if (_.has(cell, "abbr")) {
          value = entity_regex.test(value) ? React.createElement("span", {
            "data-toggle": "tooltip",
            "data-placement": "top",
            "data-html": "true",
            title: cell.abbr,
            dangerouslySetInnerHTML: { __html: value }
          }) : React.createElement(
            "span",
            {
              "data-toggle": "tooltip",
              "data-placement": "top",
              "data-html": "true",
              title: cell.abbr
            },
            value
          );
        }

        var cellProps = { key: index };

        if (_.has(cell, "span")) {
          cellProps["colSpan"] = cell.span;
        }

        if (_.has(cell, "style")) {
          cellProps["style"] = cell.style;
        }

        if (_.has(cell, "tooltip")) {
          cellProps["title"] = cell.tooltip;
          //this.dm_log100times (cellProps);
        }

        if (_.has(cell, "classes")) {
          cellProps["className"] = cell.classes;
        }

        if (this.state.header && this.props.sorter) {
          if (_.has(cell, "sortable")) {
            cellProps["onClick"] = _.partial(this.props.sorter, index, this.dm_compareTwoValues_level2);

            var sortedness_state = "fa fa-sort";
            if (this.props.sortOn && this.props.sortOn[0] == index) {
              sortedness_state = this.props.sortOn[1] ? "fa fa-sort-amount-asc" : "fa fa-sort-amount-desc";
            }

            value = React.createElement(
              "div",
              null,
              value,
              React.createElement("i", {
                className: sortedness_state,
                "aria-hidden": "true",
                style: { marginLeft: "0.5em" }
              })
            );
          }
        }

        return React.createElement(this.state.header ? "th" : "td", cellProps, value);
      }, this))
    );
  }
});

/**
 * A table composed of rows
 * @param *headerData* -- an array of cells (see DatamonkeyTableRow) to render as the header
 * @param *bodyData* -- an array of arrays of cells (rows) to render
 * @param *classes* -- CSS classes to apply to the table element
 * @example
 * header = ["Model","AIC","Parameters"]
 * rows = [[{"value":"MG94","style":{"fontVariant":"small-caps"}},{"value":0},46],
 *         [{"value":"Full model","style":{"fontVariant":"small-caps"}},{"value":6954.016129926898},60]]
 */
var DatamonkeyTable = React.createClass({
  displayName: "DatamonkeyTable",

  getDefaultProps: function getDefaultProps() {
    return {
      classes: "dm-table table table-condensed table-hover",
      rowHash: null
    };
  },

  getInitialState: function getInitialState() {
    // either null or [index,
    // bool / to indicate if the sort is ascending (True) or descending (False)]

    var len = 0;

    if (this.props.bodyData) {
      len = this.props.bodyData.length;
    }

    return {
      rowOrder: _.range(0, len),
      headerData: this.props.headerData,
      sortOn: this.props.initialSort ? [this.props.initialSort, true] : null,
      current: 0
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({
      rowOrder: _.range(0, nextProps.bodyData.length),
      headerData: nextProps.headerData
    });
  },

  regress: function regress() {
    if (this.state.current >= this.props.paginate) {
      this.setState({
        current: this.state.current - this.props.paginate
      });
    } else {
      this.setState({
        current: 0
      });
    }
  },

  decrement: function decrement() {
    if (this.state.current > 0) {
      var new_current = this.state.current - 1;
      this.setState({
        current: new_current
      });
    }
  },

  increment: function increment() {
    if (this.state.current < this.state.rowOrder.length - this.props.paginate) {
      var new_current = this.state.current + 1;
      this.setState({
        current: new_current
      });
    }
  },

  advance: function advance() {
    if (this.state.current < this.state.rowOrder.length - 2 * this.props.paginate) {
      this.setState({
        current: this.state.current + this.props.paginate
      });
    } else {
      this.setState({
        current: this.state.rowOrder.length - this.props.paginate
      });
    }
  },

  dm_sortOnColumn: function dm_sortOnColumn(index, compare_function) {
    var self = this;
    var is_ascending = true;
    if (this.state.sortOn && this.state.sortOn[0] == index) {
      is_ascending = !this.state.sortOn[1];
    }

    var new_order = _.map(this.state.rowOrder, _.identity).sort(function (i, j) {
      var comp_value = compare_function(self.props.bodyData[i][index], self.props.bodyData[j][index]);
      if (comp_value > 0) {
        return is_ascending ? 2 * comp_value - 3 : 3 - 2 * comp_value;
      }
      return 0;
    });

    if (_.some(new_order, function (value, index) {
      return value != self.state.rowOrder[index];
    })) {
      this.setState({
        rowOrder: new_order
      });
    }
    this.setState({
      sortOn: [index, is_ascending]
    });
  },

  componentDidMount: function componentDidMount() {},

  componentDidUpdate: function componentDidUpdate() {
    $('[data-toggle="tooltip"]').tooltip();
  },

  render: function render() {
    var children = [];
    var self = this,
        paginatorControls,
        button,
        rowIndices,
        upperLimit = Math.min(this.state.current + this.props.paginate, this.state.rowOrder.length);

    if (this.props.paginate) {
      if (this.props.export_csv) {
        var exportCSV = function exportCSV() {
          function extract(d) {
            return _.isObject(d) ? d.value : d;
          }
          var headers = _.map(self.props.headerData, extract),
              munged = _.map(self.props.bodyData, function (row) {
            return _.map(row, extract);
          }).map(function (row) {
            return _.object(headers, row);
          }),
              exporter = Export.create();
          exporter.downloadCsv(munged);
        };
        button = React.createElement(
          "button",
          {
            id: "export-csv",
            type: "button",
            className: "btn btn-default btn-sm pull-right",
            onClick: exportCSV
          },
          React.createElement("span", { className: "glyphicon glyphicon-floppy-save" }),
          " Export Table to CSV"
        );
      }
      paginatorControls = React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "col-md-6" },
          React.createElement(
            "p",
            null,
            "Showing entries ",
            this.state.current + 1,
            " through ",
            upperLimit,
            " out of ",
            this.state.rowOrder.length,
            "."
          )
        ),
        React.createElement(
          "div",
          { className: "col-md-3" },
          button
        ),
        React.createElement(
          "div",
          { className: "col-md-3" },
          React.createElement(
            "div",
            {
              className: "btn-group btn-group-justified",
              role: "group",
              "aria-label": "..."
            },
            React.createElement(
              "div",
              { className: "btn-group", role: "group" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-default",
                  onClick: self.regress,
                  "data-toggle": "tooltip",
                  title: "Move backwards " + this.props.paginate + " rows."
                },
                React.createElement("span", {
                  className: "glyphicon glyphicon-backward",
                  "aria-hidden": "true"
                })
              )
            ),
            React.createElement(
              "div",
              { className: "btn-group", role: "group" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-default",
                  onClick: self.decrement,
                  "data-toggle": "tooltip",
                  title: "Move backwards one row."
                },
                React.createElement("span", {
                  className: "glyphicon glyphicon-chevron-left",
                  "aria-hidden": "true"
                })
              )
            ),
            React.createElement(
              "div",
              { className: "btn-group", role: "group" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-default",
                  onClick: self.increment,
                  "data-toggle": "tooltip",
                  title: "Move forwards one row."
                },
                React.createElement("span", {
                  className: "glyphicon glyphicon-chevron-right",
                  "aria-hidden": "true"
                })
              )
            ),
            React.createElement(
              "div",
              { className: "btn-group", role: "group" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-default",
                  onClick: self.advance,
                  "data-toggle": "tooltip",
                  title: "Move forwards " + this.props.paginate + " rows."
                },
                React.createElement("span", {
                  className: "glyphicon glyphicon-forward",
                  "aria-hidden": "true"
                })
              )
            )
          )
        )
      );
    } else {
      paginatorControls = "";
    }

    if (this.state.headerData) {
      // check if header will be multiple rows by checking if headerData is an array of arrays
      if (_.isArray(this.props.headerData[0])) {
        children.push(React.createElement(
          "thead",
          { key: 0 },
          _.map(this.state.headerData, function (row, index) {
            return React.createElement(DatamonkeyTableRow, {
              rowData: row,
              header: true,
              key: index,
              sorter: _.bind(self.dm_sortOnColumn, self),
              sortOn: self.state.sortOn
            });
          })
        ));
      } else {
        children.push(React.createElement(
          "thead",
          { key: 0 },
          React.createElement(DatamonkeyTableRow, {
            rowData: this.state.headerData,
            header: true,
            sorter: _.bind(self.dm_sortOnColumn, self),
            sortOn: self.state.sortOn
          })
        ));
      }
    }
    if (this.props.paginate) {
      rowIndices = this.state.rowOrder.slice(this.state.current, this.state.current + this.props.paginate);
    } else {
      rowIndices = this.state.rowOrder;
    }
    children.push(React.createElement("tbody", {
      key: 1
    }, _.map(rowIndices, _.bind(function (row_index) {
      var componentData = this.props.bodyData[row_index];

      return React.createElement(DatamonkeyTableRow, {
        rowData: componentData,
        key: this.props.rowHash ? this.props.rowHash(componentData) : row_index,
        header: false
      });
    }, this))));
    return React.createElement(
      "div",
      { className: "row" },
      paginatorControls,
      React.createElement(
        "div",
        { className: "col-md-12" },
        React.createElement(
          "table",
          { className: this.props.classes },
          children
        )
      )
    );
  }
});

var DatamonkeyRateDistributionTable = React.createClass({
  displayName: "DatamonkeyRateDistributionTable",

  /** render a rate distribution table from JSON formatted like this
  {
       "non-synonymous/synonymous rate ratio for *background*":[ // name of distribution
        [0.1701428265961598, 1] // distribution points (rate, weight)
        ],
       "non-synonymous/synonymous rate ratio for *test*":[
        [0.1452686330406915, 1]
        ]
  }
   */

  propTypes: {
    distribution: React.PropTypes.object.isRequired
  },

  dm_formatterRate: d3.format(".3r"),
  dm_formatterProp: d3.format(".3p"),

  dm_createDistributionTable: function dm_createDistributionTable(jsonRates) {
    var rowData = [];
    var self = this;
    _.each(jsonRates, function (value, key) {
      rowData.push([{
        value: key,
        span: 3,
        classes: "info"
      }]);
      _.each(value, function (rate, index) {
        rowData.push([{
          value: rate[1],
          format: self.dm_formatterProp
        }, "@", {
          value: rate[0],
          format: self.dm_formatterRate
        }]);
      });
    });
    return rowData;
  },

  render: function render() {
    return React.createElement(DatamonkeyTable, {
      bodyData: this.dm_createDistributionTable(this.props.distribution),
      classes: "table table-condensed"
    });
  }
});

var DatamonkeyPartitionTable = React.createClass({
  displayName: "DatamonkeyPartitionTable",

  dm_formatterFloat: d3.format(".3r"),
  dm_formatterProp: d3.format(".3p"),

  propTypes: {
    trees: React.PropTypes.object.isRequired,
    partitions: React.PropTypes.object.isRequired,
    branchAttributes: React.PropTypes.object.isRequired,
    siteResults: React.PropTypes.object.isRequired,
    accessorNegative: React.PropTypes.func.isRequired,
    accessorPositive: React.PropTypes.func.isRequired,
    pValue: React.PropTypes.number.isRequired
  },

  dm_computePartitionInformation: function dm_computePartitionInformation(trees, partitions, attributes, pValue) {
    var partitionKeys = _.sortBy(_.keys(partitions), function (v) {
      return v;
    }),
        matchingKey = null,
        self = this;

    var extractBranchLength = this.props.extractOn || _.find(attributes.attributes, function (value, key) {
      matchingKey = key;
      return value["attribute type"] == "branch length";
    });
    if (matchingKey) {
      extractBranchLength = matchingKey;
    }

    return _.map(partitionKeys, function (key, index) {
      var treeBranches = trees.tested[key],
          tested = {};

      _.each(treeBranches, function (value, key) {
        if (value == "test") tested[key] = 1;
      });

      var testedLength = extractBranchLength ? datamonkey.helpers.sum(attributes[key], function (v, k) {
        if (tested[k.toUpperCase()]) {
          return v[extractBranchLength];
        }
        return 0;
      }) : 0;
      var totalLength = extractBranchLength ? datamonkey.helpers.sum(attributes[key], function (v) {
        return v[extractBranchLength] || 0;
      }) : 0; // || 0 is to resolve root node missing length

      return _.map([index + 1, // 1-based partition index
      partitions[key].coverage[0].length, // number of sites in the partition
      _.size(tested), // tested branches
      _.keys(treeBranches).length, // total branches
      testedLength, testedLength / totalLength, totalLength, _.filter(self.props.accessorPositive(self.props.siteResults, key), function (p) {
        return p <= pValue;
      }).length, _.filter(self.props.accessorNegative(self.props.siteResults, key), function (p) {
        return p <= pValue;
      }).length], function (cell, index) {
        if (index > 1) {
          var attributedCell = {
            value: cell,
            style: {
              textAlign: "center"
            }
          };

          if (index == 4 || index == 6) {
            _.extend(attributedCell, {
              format: self.dm_formatterFloat
            });
          }
          if (index == 5) {
            _.extend(attributedCell, {
              format: self.dm_formatterProp
            });
          }

          return attributedCell;
        }
        return cell;
      });
    });
  },

  dm_makeHeaderRow: function dm_makeHeaderRow(pValue) {
    return [_.map(["Partition", "Sites", "Branches", "Branch Length", "Selected at p" + String.fromCharCode(parseInt("2264", 16)) + pValue], function (d, i) {
      return _.extend({
        value: d,
        style: {
          borderBottom: 0,
          textAlign: i > 1 ? "center" : "left"
        }
      }, i > 1 ? {
        span: i == 3 ? 3 : 2
      } : {});
    }), _.map(["", "", "Tested", "Total", "Tested", "% of total", "Total", "Positive", "Negative"], function (d, i) {
      return {
        value: d,
        style: {
          borderTop: 0,
          textAlign: i > 1 ? "center" : "left"
        }
      };
    })];
  },

  getInitialState: function getInitialState() {
    return {
      header: this.dm_makeHeaderRow(this.props.pValue),
      rows: this.dm_computePartitionInformation(this.props.trees, this.props.partitions, this.props.branchAttributes, this.props.pValue)
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({
      header: this.dm_makeHeaderRow(nextProps.pValue),
      rows: this.dm_computePartitionInformation(nextProps.trees, nextProps.partitions, nextProps.branchAttributes, nextProps.pValue)
    });
  },

  render: function render() {
    return React.createElement(
      "div",
      { className: "table-responsive" },
      React.createElement(DatamonkeyTable, {
        headerData: this.state.header,
        bodyData: this.state.rows
      })
    );
  }
});

var DatamonkeyModelTable = React.createClass({
  displayName: "DatamonkeyModelTable",

  // render a model fit table from a JSON object with entries like this
  //     "Global MG94xREV":{  model name
  //          "log likelihood":-5453.527975908821,
  //          "parameters":131,
  //          "AIC-c":11172.05569160427,
  //          "rate distributions":{
  //            "non-synonymous/synonymous rate ratio for *background*":[
  //             [0.1701428265961598, 1]
  //             ],
  //            "non-synonymous/synonymous rate ratio for *test*":[
  //             [0.1452686330406915, 1]
  //             ]
  //           },
  //          "display order":0
  //         }
  // dm_supportedColumns controls which keys from model specification will be consumed;
  //     * 'value' is the cell specification to be consumed by DatamonkeyTableRow
  //     * 'order' is the column order in the resulting table (relative; doesn't have to be sequential)
  //     * 'display_format' is a formatting function for cell entries
  //     * 'transform' is a data trasformation function for cell entries

  dm_numberFormatter: d3.format(".2f"),

  dm_supportedColumns: {
    "log-likelihood": {
      order: 2,
      value: {
        value: "log L",
        abbr: "Log likelihood of model fit"
      },
      display_format: d3.format(".2f")
    },
    parameters: {
      order: 3,
      value: {
        value: "Parameters",
        abbr: "Number of estimated parameters"
      }
    },
    "AIC-c": {
      order: 1,
      value: {
        value: React.createElement("span", null, ["AIC", React.createElement(
          "sub",
          { key: "0" },
          "C"
        )]),
        abbr: "Small-sample corrected Akaike Information Score"
      },
      display_format: d3.format(".2f")
    },
    "rate distributions": {
      order: 4,
      value: "Rate distributions",
      transform: function transform(value) {
        return React.createElement(DatamonkeyRateDistributionTable, {
          distribution: value
        });
      }
    }
  },

  propTypes: {
    fits: React.PropTypes.object.isRequired
  },

  getDefaultProps: function getDefaultProps() {
    return {
      orderOn: "display order"
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var self = this,
        tableInfo = self.dm_extractFitsTable(nextProps.fits);
    //console.log(self.dm_makeHeaderRow     (tableInfo.columns));
    this.setState({
      header: self.dm_makeHeaderRow(tableInfo.columns),
      rows: tableInfo.data
    });
  },

  dm_extractFitsTable: function dm_extractFitsTable(jsonTable) {
    var columnMap = null;
    var columnMapIterator = [];
    var valueFormat = {};
    var valueTransform = {};
    var rowData = [];
    var self = this;

    _.each(jsonTable, function (value, key) {
      if (!columnMap) {
        columnMap = {};
        _.each(value, function (cellValue, cellName) {
          if (self.dm_supportedColumns[cellName]) {
            columnMap[cellName] = self.dm_supportedColumns[cellName];
            columnMapIterator[columnMap[cellName].order] = cellName;
            valueFormat[cellName] = self.dm_supportedColumns[cellName]["display_format"];
            if (_.isFunction(self.dm_supportedColumns[cellName]["transform"])) {
              valueTransform[cellName] = self.dm_supportedColumns[cellName]["transform"];
            }
          }
        });
        columnMapIterator = _.filter(columnMapIterator, function (v) {
          return v;
        });
      }

      var thisRow = [{
        value: key
        //style: {
        //  fontVariant: "small-caps"
        //}
      }];

      _.each(columnMapIterator, function (tag) {
        var myValue = valueTransform[tag] ? valueTransform[tag](value[tag]) : value[tag];

        if (valueFormat[tag]) {
          thisRow.push({
            value: myValue,
            format: valueFormat[tag]
          });
        } else {
          thisRow.push(myValue);
        }
      });

      rowData.push([thisRow, _.isNumber(value[self.props.orderOn]) ? value[self.props.orderOn] : rowData.length]);
    });

    return {
      data: _.map(_.sortBy(rowData, function (value) {
        return value[1];
      }), function (r) {
        return r[0];
      }),
      columns: _.map(columnMapIterator, function (tag) {
        return columnMap[tag].value;
      })
    };
  },

  dm_makeHeaderRow: function dm_makeHeaderRow(columnMap) {
    var headerRow = ["Model"];
    _.each(columnMap, function (v) {
      headerRow.push(v);
    });
    return headerRow;
  },

  getInitialState: function getInitialState() {
    var tableInfo = this.dm_extractFitsTable(this.props.fits);

    return {
      header: this.dm_makeHeaderRow(tableInfo.columns),
      rows: tableInfo.data,
      caption: null
    };
  },

  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "h4",
        { className: "dm-table-header" },
        "Model fits",
        React.createElement("span", {
          className: "glyphicon glyphicon-info-sign",
          style: { verticalAlign: "middle", float: "right" },
          "aria-hidden": "true",
          "data-toggle": "popover",
          "data-trigger": "hover",
          title: "Actions",
          "data-html": "true",
          "data-content": "<ul><li>Hover over a column header for a description of its content.</li></ul>",
          "data-placement": "bottom"
        })
      ),
      React.createElement(DatamonkeyTable, {
        headerData: this.state.header,
        bodyData: this.state.rows
      })
    );
  }
});

var DatamonkeyTimersTable = React.createClass({
  displayName: "DatamonkeyTimersTable",

  dm_percentageFormatter: d3.format(".2%"),

  propTypes: {
    timers: React.PropTypes.object.isRequired
  },

  dm_formatSeconds: function dm_formatSeconds(seconds) {
    var fields = [~~(seconds / 3600), ~~(seconds % 3600 / 60), seconds % 60];

    return _.map(fields, function (d) {
      return d < 10 ? "0" + d : "" + d;
    }).join(":");
  },

  dm_extractTimerTable: function dm_extractTimerTable(jsonTable) {
    var totalTime = 0,
        formattedRows = _.map(jsonTable, _.bind(function (value, key) {
      if (this.props.totalTime) {
        if (key == this.props.totalTime) {
          totalTime = value["timer"];
        }
      } else {
        totalTime += value["timer"];
      }
      return [key, value["timer"], value["order"]];
    }, this));

    formattedRows = _.sortBy(formattedRows, function (row) {
      return row[2];
    });

    formattedRows = _.map(formattedRows, _.bind(function (row) {
      if (this.props.totalTime === null || this.props.totalTime != row[0]) {
        row[2] = {
          value: row[1] / totalTime,
          format: this.dm_percentageFormatter
        };
      } else {
        row[2] = "";
      }
      row[1] = this.dm_formatSeconds(row[1]);
      return row;
    }, this));

    return formattedRows;
  },

  dm_makeHeaderRow: function dm_makeHeaderRow() {
    return ["Task", "Time", "%"];
  },

  getInitialState: function getInitialState() {
    return {
      header: this.dm_makeHeaderRow(),
      rows: this.dm_extractTimerTable(this.props.timers),
      caption: null
    };
  },

  render: function render() {
    return React.createElement(DatamonkeyTable, {
      headerData: this.state.header,
      bodyData: this.state.rows
    });
  }
});

module.exports.DatamonkeyTable = DatamonkeyTable;
module.exports.DatamonkeyTableRow = DatamonkeyTableRow;
module.exports.DatamonkeyRateDistributionTable = DatamonkeyRateDistributionTable;
module.exports.DatamonkeyPartitionTable = DatamonkeyPartitionTable;
module.exports.DatamonkeyModelTable = DatamonkeyModelTable;
module.exports.DatamonkeyTimersTable = DatamonkeyTimersTable;

/***/ }),
/* 7 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_7__;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var React = __webpack_require__(0);

var InputInfo = React.createClass({
  displayName: "InputInfo",
  getInitialState: function getInitialState() {
    if (this.props.input_data) {
      return {
        input_data: this.props.input_data
      };
    }
    return {
      input_data: {}
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({
      input_data: nextProps.input_data
    });
  },
  render: function render() {
    return React.createElement(
      "div",
      { id: "input-info" },
      React.createElement(
        "span",
        { className: "hyphy-highlight" },
        "INPUT DATA"
      ),
      " ",
      React.createElement(
        "span",
        { className: "divider" },
        "|"
      ),
      React.createElement(
        "a",
        { href: "#" },
        this.state.input_data.filename
      ),
      " ",
      React.createElement(
        "span",
        { className: "divider" },
        "|"
      ),
      React.createElement(
        "span",
        { className: "hyphy-highlight" },
        this.state.input_data.sequences
      ),
      " sequences ",
      React.createElement(
        "span",
        { className: "divider" },
        "|"
      ),
      React.createElement(
        "span",
        { className: "hyphy-highlight" },
        this.state.input_data.sites
      ),
      " sites"
    );
  }
});

module.exports.InputInfo = InputInfo;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _saveSvgAsPng = __webpack_require__(17);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = __webpack_require__(0),
    d3 = __webpack_require__(7),
    _ = __webpack_require__(1),
    d3_save_svg = __webpack_require__(15),
    graphDefaultColorPallette = d3.scale.category10().domain(_.range(10));

/* 
 * Creates a dropdown menu to be used with any 
 * component that extends BaseGraph
 */
var GraphMenu = function (_React$Component) {
  _inherits(GraphMenu, _React$Component);

  function GraphMenu(props) {
    _classCallCheck(this, GraphMenu);

    var _this = _possibleConstructorReturn(this, (GraphMenu.__proto__ || Object.getPrototypeOf(GraphMenu)).call(this, props));

    _this.state = {
      xaxis: "Site",
      yaxis: !_.isEmpty(props.y_options) ? props.y_options[0] : "alpha"
    };

    return _this;
  }

  _createClass(GraphMenu, [{
    key: "handleSelection",
    value: function handleSelection(e) {

      var dimension = e.target.dataset.dimension;
      var axis = e.target.dataset.axis;

      var state_to_update = {};
      state_to_update[axis] = dimension;
      this.setState(state_to_update);
      this.props.axisSelectionEvent(e);
    }
  }, {
    key: "dimensionOptionElement",
    value: function dimensionOptionElement(axis, value) {

      return React.createElement(
        "li",
        { key: value },
        React.createElement("a", {
          href: "javascript:void(0);",
          tabIndex: "-1",
          "data-dimension": value,
          "data-axis": axis,
          onClick: this.handleSelection.bind(this),
          dangerouslySetInnerHTML: { __html: value }
        })
      );
    }
  }, {
    key: "AxisButton",
    value: function AxisButton(options, selected, axis, label) {
      var self = this;

      var DimensionOptions = [];

      DimensionOptions = _.map(options, function (value) {
        return self.dimensionOptionElement(axis, value);
      }, self);

      if (_.size(_.keys(options)) <= 1) {
        return React.createElement("div", null);
      } else {
        return React.createElement(
          "div",
          { className: "input-group" },
          React.createElement(
            "span",
            { className: "input-group-addon" },
            label,
            ":",
            " "
          ),
          React.createElement(
            "ul",
            { className: "dropdown-menu" },
            DimensionOptions
          ),
          React.createElement("button", {
            className: "btn btn-default btn-sm dropdown-toggle form-control",
            type: "button",
            "data-toggle": "dropdown",
            "aria-haspopup": "true",
            "aria-expanded": "false",
            dangerouslySetInnerHTML: { __html: selected + '<span className="caret" />' }
          })
        );
      }
    }
  }, {
    key: "render",
    value: function render() {
      var self = this;
      var XAxisButton = self.AxisButton(self.props.x_options, self.state.xaxis, "xaxis", "X-axis");
      var YAxisButton = self.AxisButton(self.props.y_options, self.state.yaxis, "yaxis", "Y-axis");

      var navStyle = { borderBottom: "none" };

      return React.createElement(
        "nav",
        { className: "navbar", style: navStyle },
        React.createElement(
          "form",
          { className: "navbar-form" },
          React.createElement(
            "div",
            { className: "form-group navbar-left" },
            React.createElement(
              "div",
              { className: "input-group" },
              XAxisButton,
              YAxisButton
            )
          )
        )
      );
    }
  }]);

  return GraphMenu;
}(React.Component);

var BaseGraph = function (_React$Component2) {
  _inherits(BaseGraph, _React$Component2);

  function BaseGraph(props) {
    _classCallCheck(this, BaseGraph);

    var _this2 = _possibleConstructorReturn(this, (BaseGraph.__proto__ || Object.getPrototypeOf(BaseGraph)).call(this, props));

    _this2.state = {
      x_label: "site",
      y_label: "alpha"
    };
    return _this2;
  }

  _createClass(BaseGraph, [{
    key: "setXAxis",
    value: function setXAxis(column) {
      this.setState({ xaxis: column });
    }
  }, {
    key: "setYAxis",
    value: function setYAxis(column) {
      this.setState({ yaxis: column });
    }
  }, {
    key: "computeRanges",
    value: function computeRanges() {
      var self = this;

      return {
        x_range: d3.extent(self.props.x),
        y_range: d3.extent(_.flatten(_.map(self.props.y, function (data_point) {
          return d3.extent(data_point);
        })))
      };
    }
  }, {
    key: "computeDimensions",
    value: function computeDimensions() {
      var self = this;

      var height = self.props.height - self.props.marginTop - self.props.marginBottom;
      var width = self.props.width - self.props.marginLeft - self.props.marginRight;

      return { height: height, width: width };
    }
  }, {
    key: "makeTitle",
    value: function makeTitle(point) {
      return "x = " + this.props.numberFormat(point[0]) + " y = " + this.props.numberFormat(point[1]);
    }
  }, {
    key: "setTracker",
    value: function setTracker(main_graph, point) {
      if (this.props.tracker) {
        var tracker = main_graph.selectAll(".graph-tracker").data([[""]]);
        tracker.enter().append("g");
        tracker.attr("transform", "translate (50,50)").classed("graph-tracker", true);

        if (point) {
          var text_element = tracker.selectAll("text").data(function (d) {
            return d;
          });
          text_element.enter().append("text");
          text_element.text(this.makeTitle(point)).attr("background-color", "red");
        } else {
          tracker.selectAll("text").remove();
        }
      }
    }
  }, {
    key: "doTransition",
    value: function doTransition(d3sel) {
      if (this.props.transitions) {
        return d3sel.transition();
      }
      return d3sel;
    }
  }, {
    key: "renderAxis",
    value: function renderAxis(scale, location, label, dom_element) {
      var self = this;
      var xAxis = d3.svg.axis().scale(scale).orient(location); // e.g. bottom
      self.doTransition(d3.select(dom_element)).call(xAxis);
    }
  }, {
    key: "xAxisLabel",
    value: function xAxisLabel() {
      var transform_x = this.props.width / 2;
      var transform_y = this.props.height - this.props.marginTop / 3;
      return React.createElement(
        "text",
        { textAnchor: "middle", transform: "translate(" + transform_x + "," + transform_y + ")" },
        this.props.x_label
      );
    }
  }, {
    key: "yAxisLabel",
    value: function yAxisLabel() {
      var transform_x = (this.props.marginLeft - 25) / 2;
      var transform_y = this.props.height / 2;
      return React.createElement("text", {
        textAnchor: "middle",
        transform: "translate(" + transform_x + "," + transform_y + ")rotate(-90)",
        dangerouslySetInnerHTML: { __html: this.props.y_label }
      });
    }

    //TODO : See if this can be removed

  }, {
    key: "makeClasses",
    value: function makeClasses(key) {
      var className = null,
          styleDict = null;

      if (key in this.props.renderStyle) {
        if ("class" in this.props.renderStyle[key]) {
          className = this.props.renderStyle[key]["class"];
        }
        if ("style" in this.props.renderStyle[key]) {
          styleDict = this.props.renderStyle[key]["style"];
        }
      }

      return { className: className, style: styleDict };
    }
  }, {
    key: "makeScale",
    value: function makeScale(type, domain, range) {
      var scale;
      if (_.isFunction(type)) {
        scale = type;
      } else {
        switch (type) {
          case "linear":
            scale = d3.scale.linear();
            break;
          case "log":
            scale = d3.scale.log();
            break;
          default:
            scale = d3.scale.linear();
        }
      }
      return scale.domain(domain).range(range);
    }
  }, {
    key: "render",
    value: function render() {
      var self = this;

      var main = self.computeDimensions(),
          _self$computeRanges = self.computeRanges(),
          x_range = _self$computeRanges.x_range,
          y_range = _self$computeRanges.y_range;


      var x_scale = self.makeScale(self.props.xScale, x_range, [0, main.width]),
          y_scale = self.makeScale(self.props.yScale, y_range, [main.height, 0]);

      var xAxisLabel = self.xAxisLabel();
      var yAxisLabel = self.yAxisLabel();

      return React.createElement(
        "div",
        null,
        React.createElement(
          "svg",
          { width: self.props.width, height: self.props.height, id: "dm-chart" },
          React.createElement("rect", { width: "100%", height: "100%", fill: "white" }),
          React.createElement("g", {
            transform: "translate(" + self.props.marginLeft + "," + self.props.marginTop + ")",
            ref: _.partial(self.renderGraph, x_scale, y_scale).bind(self)
          }),
          self.props.xAxis ? React.createElement("g", _extends({}, self.makeClasses("axis"), {
            transform: "translate(" + self.props.marginLeft + "," + (main.height + self.props.marginTop + self.props.marginXaxis) + ")",
            ref: _.partial(self.renderAxis, x_scale, "bottom", self.props.xaxis).bind(self)
          })) : null,
          self.props.yAxis ? React.createElement("g", _extends({}, self.makeClasses("axis"), {
            transform: "translate(" + (self.props.marginLeft - self.props.marginYaxis) + "," + self.props.marginTop + ")",
            ref: _.partial(self.renderAxis, y_scale, "left", self.props.yLabel).bind(self)
          })) : null,
          xAxisLabel,
          yAxisLabel
        )
      );
    }
  }]);

  return BaseGraph;
}(React.Component);

BaseGraph.defaultProps = {
  width: 800,
  height: 400,
  marginLeft: 35,
  marginRight: 10,
  marginTop: 10,
  marginBottom: 35,
  marginXaxis: 5,
  marginYaxis: 5,
  graphData: null,
  renderStyle: { axis: { class: "hyphy-axis" }, points: { class: "" } },
  xScale: "linear",
  yScale: "linear",
  xAxis: true,
  yAxis: true,
  transitions: false,
  numberFormat: d3.format(".4r"),
  tracker: true,
  xLabel: null,
  yLabel: null,
  x: [],
  y: []
};

var LineChart = function (_BaseGraph) {
  _inherits(LineChart, _BaseGraph);

  function LineChart() {
    _classCallCheck(this, LineChart);

    return _possibleConstructorReturn(this, (LineChart.__proto__ || Object.getPrototypeOf(LineChart)).apply(this, arguments));
  }

  _createClass(LineChart, [{
    key: "renderGraph",
    value: function renderGraph(x_scale, y_scale, dom_element) {

      var main_graph = d3.select(dom_element);

      var y = this.props.y[0];

      var line = d3.svg.line().x(function (d) {
        return x_scale(d[0]);
      }).y(function (d) {
        return y_scale(d[1]);
      });

      var g = main_graph.append("g").attr("transform", "translate(" + this.props.marginLeft + "," + this.props.marginTop + ")");

      g.append("path").datum(_.zip(this.props.x, y)).attr("fill", "none").attr("stroke", "steelblue").attr("stroke-linejoin", "round").attr("stroke-linecap", "round").attr("stroke-width", 1.5).attr("d", function (d) {
        return line(d);
      });
    }
  }]);

  return LineChart;
}(BaseGraph);

var ScatterPlot = function (_BaseGraph2) {
  _inherits(ScatterPlot, _BaseGraph2);

  function ScatterPlot() {
    _classCallCheck(this, ScatterPlot);

    return _possibleConstructorReturn(this, (ScatterPlot.__proto__ || Object.getPrototypeOf(ScatterPlot)).apply(this, arguments));
  }

  _createClass(ScatterPlot, [{
    key: "renderGraph",
    value: function renderGraph(x_scale, y_scale, dom_element) {

      var self = this,
          main_graph = d3.select(dom_element);

      _.each(this.props.y, _.bind(function (y, i) {

        var series_color = this.props.color_pallette(i);

        var data_points = main_graph.selectAll("circle.series_" + i).data(_.zip(this.props.x, y));

        data_points.enter().append("circle");
        data_points.exit().remove();

        data_points.on("mouseover", function (t) {
          self.setTracker(main_graph, t);
        }).on("mouseout", function (t) {
          self.setTracker(main_graph, null);
        });

        this.doTransition(data_points.classed("series_" + i, true)).attr("cx", function (d) {
          return x_scale(d[0]);
        }).attr("cy", function (d) {
          return y_scale(d[1]);
        }).attr("r", function (d) {
          return 3;
        }).attr("fill", series_color);
      }, this));
    }
  }]);

  return ScatterPlot;
}(BaseGraph);

ScatterPlot.defaultProps = {
  color_pallette: d3.scale.category10().domain(_.range(10)),
  width: 800,
  height: 400,
  marginLeft: 35,
  marginRight: 10,
  marginTop: 10,
  marginBottom: 35,
  marginXaxis: 5,
  marginYaxis: 5,
  graphData: null,
  renderStyle: { axis: { class: "hyphy-axis" }, points: { class: "" } },
  xScale: "linear",
  yScale: "linear",
  xAxis: true,
  yAxis: true,
  transitions: false,
  numberFormat: d3.format(".4r"),
  tracker: true,
  xLabel: null,
  yLabel: null,
  x: [],
  y: []

};

var Series = function (_BaseGraph3) {
  _inherits(Series, _BaseGraph3);

  function Series() {
    _classCallCheck(this, Series);

    return _possibleConstructorReturn(this, (Series.__proto__ || Object.getPrototypeOf(Series)).apply(this, arguments));
  }

  _createClass(Series, [{
    key: "renderGraph",
    value: function renderGraph(x_scale, y_scale, dom_element) {
      var self = this,
          main_graph = d3.select(dom_element);

      _.each(self.props.y, function (y, i) {
        var series_color = graphDefaultColorPallette(i);

        var series_line = d3.svg.area().interpolate("step").y1(function (d) {
          return y_scale(d[1]);
        }).x(function (d) {
          return x_scale(d[0]);
        });

        if (y_scale.domain()[0] < 0) {
          series_line.y0(function (d) {
            return y_scale(0);
          });
        } else {
          series_line.y0(y_scale(y_scale.domain()[0]));
        }

        var data_points = main_graph.selectAll("path.series_" + i).data([_.zip(self.props.x, y)]);
        data_points.enter().append("path");
        data_points.exit().remove();

        self.doTransition(data_points.classed("series_" + i, true)).attr("d", series_line).attr("fill", series_color).attr("fill-opacity", 0.25).attr("stroke", series_color).attr("stroke-width", "0.5px");

        if (self.props.doDots) {
          var data_points = main_graph.selectAll("circle.series_" + i).data(_.zip(self.props.x, y));
          data_points.enter().append("circle");
          data_points.exit().remove();

          data_points.on("mouseover", function (t) {
            self.setTracker(main_graph, t);
          }).on("mouseout", function (t) {
            self.setTracker(main_graph, null);
          });

          self.doTransition(data_points.classed("series_" + i, true)).attr("cx", function (d) {
            return x_scale(d[0]);
          }).attr("cy", function (d) {
            return y_scale(d[1]);
          }).attr("r", function (d) {
            return 2;
          }).attr("fill", series_color);
        }
      });
    }
  }]);

  return Series;
}(BaseGraph);

var MultiScatterPlot = function (_React$Component3) {
  _inherits(MultiScatterPlot, _React$Component3);

  function MultiScatterPlot(props) {
    _classCallCheck(this, MultiScatterPlot);

    var _this6 = _possibleConstructorReturn(this, (MultiScatterPlot.__proto__ || Object.getPrototypeOf(MultiScatterPlot)).call(this, props));

    var to_plot = _.object(_this6.props.y_labels, _.times(_this6.props.y_labels.length, function () {
      return true;
    }));

    _this6.state = {
      to_plot: to_plot
    };
    return _this6;
  }

  _createClass(MultiScatterPlot, [{
    key: "plotDataPoints",
    value: function plotDataPoints(dom_element) {

      var self = this;

      // prepend property info with x information
      var property_info = self.props.y;

      var site_count = _.max(self.props.x);

      var width = self.props.width - self.props.marginLeft - self.props.marginRight;
      var height = self.props.height - self.props.marginTop - self.props.marginBottom;

      var x = d3.scale.linear().range([0, width]);
      var y = d3.scale.linear().range([height, 0]);

      var xAxis = d3.svg.axis().scale(x).orient("bottom");
      var yAxis = d3.svg.axis().scale(y).orient("left");
      var yAxis2 = d3.svg.axis().scale(y).orient("right");

      function make_x_axis() {
        return d3.svg.axis().scale(x).orient("bottom").ticks(20);
      }

      function make_y_axis() {
        return d3.svg.axis().scale(y).orient("left").ticks(20);
      }

      d3.select(dom_element).selectAll("*").remove();

      var svg = d3.select(dom_element).append("g").attr("transform", "translate(" + self.props.marginLeft + "," + self.props.marginTop + ")");

      x.domain([1, site_count]);
      y.domain([-20, 20]);

      svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis).append("text").attr("class", "label").attr("x", width).attr("y", 40).style("text-anchor", "end").text("Codon index");

      svg.append("g").attr("class", "grid").call(make_y_axis().tickSize(-width, 0, 0).tickFormat(""));

      svg.append("g").attr("class", "grid").attr("transform", "translate(0," + height + ")").call(make_x_axis().tickSize(-height, 0, 0).tickFormat(""));

      svg.append("g").attr("class", "y axis").call(yAxis).append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("y", -45).attr("dy", ".71em").style("text-anchor", "end").text("Property weight");

      var y2 = svg.append("g").attr("class", "y axis").attr("transform", "translate(" + width + ",0)").call(yAxis2.tickFormat(""));

      y2.append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("y", 10).attr("dy", ".71em").style("text-anchor", "end").text("Property conserved");

      y2.append("text").attr("class", "label").attr("transform", "rotate(-90)").attr("y", 10).attr("x", -height).attr("dy", ".71em").style("text-anchor", "start").text("Property changing");

      //var legend = svg
      //  .selectAll(".legend")
      //  .data(self.props.color.domain())
      //  .enter()
      //  .append("g")
      //  .attr("class", "legend")
      //  .attr("transform", function(d, i) {
      //    return "translate(0," + i * 20 + ")";
      //  });

      _.each(property_info, function (d, series) {

        // check if we should plot
        if (!_.values(self.state.to_plot)[series]) {
          return;
        }

        svg.selectAll(".dot" + series).data(_.zip(self.props.x, property_info[series])).enter().append("circle").attr("class", "dot" + series).attr("r", function (d) {
          if (d[1] == 0) return 1;
          return 3.5;
        }).attr("cx", function (d) {
          return x(d[0]);
        }).attr("cy", function (d) {
          return y(d[1]);
        }).style("fill", function (d) {
          return self.props.color(series);
        }).append("title").text(function (d) {
          return "Codon " + d[0] + ", property " + series + " = " + d[1];
        });
        d3.select("#show_property" + series).style("color", function (d) {
          return self.props.color(series);
        });
      });
    }
  }, {
    key: "componentWillMount",
    value: function componentWillMount() {}
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {}
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {}
  }, {
    key: "toggleActive",
    value: function toggleActive(e) {
      // set plot according to which buttons are activated
      var to_plot = this.state.to_plot;
      var label = e.target.dataset["label"];
      to_plot[label] = !to_plot[label];
      this.setState({ to_plot: to_plot });
    }
  }, {
    key: "getCheckBox",
    value: function getCheckBox(label) {

      var self = this;

      return React.createElement(
        "label",
        {
          className: "btn btn-primary active focus",
          onClick: self.toggleActive.bind(self),
          "data-label": label
        },
        React.createElement("input", { type: "checkbox" }),
        " ",
        label
      );
    }
  }, {
    key: "getCheckBoxes",
    value: function getCheckBoxes() {
      var _this7 = this;

      return _.map(this.props.y_labels, function (value) {
        return _this7.getCheckBox(value);
      }, self);
    }
  }, {
    key: "render",
    value: function render() {

      return React.createElement(
        "div",
        { style: { marginTop: "20px" } },
        React.createElement(
          "div",
          {
            id: "hyphy-prime-toggle-buttons",
            className: "btn-group-justified col-lg-12",
            "data-toggle": "buttons"
          },
          this.getCheckBoxes()
        ),
        React.createElement(
          "svg",
          {
            width: this.props.width + this.props.marginLeft + this.props.marginRight,
            height: this.props.height + this.props.marginTop + this.props.marginBottom
          },
          React.createElement("g", {
            transform: "translate(" + this.props.marginLeft + "," + this.props.marginTop + ")",
            ref: _.partial(this.plotDataPoints).bind(this)
          }),
          this.props.x_label,
          this.props.y_label
        )
      );
    }
  }]);

  return MultiScatterPlot;
}(React.Component);

MultiScatterPlot.defaultProps = {
  color: d3.scale.category10(),
  width: 800,
  height: 400,
  marginLeft: 40,
  marginRight: 40,
  marginTop: 20,
  marginBottom: 30,
  marginXaxis: 5,
  marginYaxis: 5,
  graphData: null,
  renderStyle: { axis: { class: "hyphy-axis" }, points: { class: "" } },
  xScale: "linear",
  yScale: "linear",
  xAxis: true,
  yAxis: true,
  transitions: false,
  numberFormat: d3.format(".4r"),
  tracker: true,
  xLabel: null,
  yLabel: null,
  x: [],
  y: []
};

var SiteGraph = function (_React$Component4) {
  _inherits(SiteGraph, _React$Component4);

  function SiteGraph(props) {
    _classCallCheck(this, SiteGraph);

    var _this8 = _possibleConstructorReturn(this, (SiteGraph.__proto__ || Object.getPrototypeOf(SiteGraph)).call(this, props));

    _this8.updateAxisSelection = _this8.updateAxisSelection.bind(_this8);
    _this8.state = { active_column: props.columns[0] };
    return _this8;
  }

  _createClass(SiteGraph, [{
    key: "updateAxisSelection",
    value: function updateAxisSelection(e) {
      var dimension = e.target.dataset.dimension;

      this.setState({
        axis: dimension,
        active_column: dimension
      });
    }
  }, {
    key: "savePNG",
    value: function savePNG() {
      (0, _saveSvgAsPng.saveSvgAsPng)(document.getElementById("dm-chart"), "datamonkey-chart.png");
    }
  }, {
    key: "saveSVG",
    value: function saveSVG() {
      d3_save_svg.save(d3.select("#dm-chart").node(), { filename: "datamonkey-chart" });
    }
  }, {
    key: "render",
    value: function render() {
      var self = this,
          index = this.props.columns.indexOf(this.state.active_column),
          x = _.range(1, this.props.rows.length + 1),
          y = [this.props.rows.map(function (row) {
        return row[index];
      })];

      return React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "col-md-6" },
          React.createElement(GraphMenu, {
            x_options: "Site",
            y_options: this.props.columns,
            axisSelectionEvent: self.updateAxisSelection
          })
        ),
        React.createElement(
          "div",
          { className: "col-md-6" },
          React.createElement(
            "button",
            {
              id: "export-chart-svg",
              type: "button",
              className: "btn btn-default btn-sm pull-right btn-export",
              onClick: self.saveSVG
            },
            React.createElement("span", { className: "glyphicon glyphicon-floppy-save" }),
            " Export Chart to SVG"
          ),
          React.createElement(
            "button",
            {
              id: "export-chart-png",
              type: "button",
              className: "btn btn-default btn-sm pull-right btn-export",
              onClick: self.savePNG
            },
            React.createElement("span", { className: "glyphicon glyphicon-floppy-save" }),
            " Export Chart to PNG"
          )
        ),
        React.createElement(
          "div",
          { className: "col-md-12" },
          React.createElement(Series, {
            x: x,
            y: y,
            x_label: "Site",
            y_label: self.state.active_column,
            marginLeft: 80,
            width: 900,
            transitions: true,
            doDots: true
          })
        )
      );
    }
  }]);

  return SiteGraph;
}(React.Component);

module.exports.DatamonkeyGraphMenu = GraphMenu;
module.exports.DatamonkeyLine = LineChart;
module.exports.DatamonkeyMultiScatterplot = MultiScatterPlot;
module.exports.DatamonkeyScatterplot = ScatterPlot;
module.exports.DatamonkeySeries = Series;
module.exports.DatamonkeySiteGraph = SiteGraph;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var React = __webpack_require__(0);
var datamonkey = __webpack_require__(2);
__webpack_require__(11);

var Tree = React.createClass({
  displayName: "Tree",

  getDefaultProps: function getDefaultProps() {
    return {
      color_gradient: ["#5e4fa2", "#3288bd", "#e6f598", "#f46d43", "#9e0142"],
      grayscale_gradient: ["#DDDDDD", "#AAAAAA", "#888888", "#444444", "#000000"],
      fill_color: true,
      scaling_exponent: 0.33,
      bar_width: 70,
      bar_height: 300,
      margins: {
        bottom: 30,
        top: 15,
        left: 40,
        right: 2
      }
    };
  },

  toggleLegend: function toggleLegend(e) {
    var show_legend = !e.target.checked;

    this.setState({
      show_legend: show_legend
    });
  },

  changeColorScale: function changeColorScale(e) {
    var self = this;
    var fill_color = !e.target.checked;

    var omega_color = d3.scale.pow().exponent(self.props.scaling_exponent).domain([0, 0.25, 1, 5, 10]).range(fill_color ? self.props.color_gradient : self.props.grayscale_gradient).clamp(true);

    var omega_scale = d3.scale.pow().exponent(self.props.scaling_exponent).domain(d3.extent(omega_color.domain())).range([0, 1]);

    this.setState({
      omega_color: omega_color,
      omega_scale: omega_scale,
      fill_color: false
    });
  },

  getInitialState: function getInitialState() {
    var self = this;

    var omega_color = d3.scale.pow().exponent(self.props.scaling_exponent).domain([0, 0.25, 1, 5, 10]).range(self.props.fill_color ? self.props.color_gradient : self.props.grayscale_gradient).clamp(true);

    var omega_scale = d3.scale.pow().exponent(self.props.scaling_exponent).domain(d3.extent(omega_color.domain())).range([0, 1]),
        axis_scale = d3.scale.pow().exponent(self.props.scaling_exponent).domain(d3.extent(omega_color.domain())).range([0, self.props.bar_height - self.props.margins["top"] - self.props.margins["bottom"]]);

    var selected_model = _.first(_.keys(self.props.models));

    return {
      json: this.props.json,
      settings: this.props.settings,
      fill_color: this.props.fill_color,
      omega_color: omega_color,
      omega_scale: omega_scale,
      show_legend: true,
      axis_scale: axis_scale,
      selected_model: selected_model
    };
  },

  sortNodes: function sortNodes(asc) {
    var self = this;

    self.tree.traverse_and_compute(function (n) {
      var d = 1;
      if (n.children && n.children.length) {
        d += d3.max(n.children, function (d) {
          return d["count_depth"];
        });
      }
      n["count_depth"] = d;
    });

    self.tree.resort_children(function (a, b) {
      return (a["count_depth"] - b["count_depth"]) * (asc ? 1 : -1);
    });
  },

  getBranchLengths: function getBranchLengths() {
    var self = this;

    if (!this.state.json) {
      return [];
    }

    var branch_lengths = self.settings["tree-options"]["hyphy-tree-branch-lengths"][0] ? self.props.models[self.state.selected_model]["branch-lengths"] : null;

    if (!branch_lengths) {
      var nodes = _.filter(self.tree.get_nodes(), function (d) {
        return d.parent;
      });

      branch_lengths = _.object(_.map(nodes, function (d) {
        return d.name;
      }), _.map(nodes, function (d) {
        return parseFloat(d.attribute);
      }));
    }

    return branch_lengths;
  },

  assignBranchAnnotations: function assignBranchAnnotations() {
    if (this.state.json && this.props.models[this.state.selected_model]) {
      this.tree.assign_attributes(this.props.models[this.state.selected_model]["branch-annotations"]);
    }
  },

  renderDiscreteLegendColorScheme: function renderDiscreteLegendColorScheme(svg_container) {
    var self = this,
        svg = self.svg;

    if (!self.state.omega_color || !self.state.omega_scale) {
      return;
    }

    var color_fill = self.state.omega_color(0);

    var margins = {
      bottom: 30,
      top: 15,
      left: 0,
      right: 0
    };

    d3.selectAll("#color-legend").remove();

    var dc_legend = svg.append("g").attr("id", "color-legend").attr("class", "dc-legend").attr("transform", "translate(" + margins["left"] + "," + margins["top"] + ")");

    var fg_item = dc_legend.append("g").attr("class", "dc-legend-item").attr("transform", "translate(0,0)");

    fg_item.append("rect").attr("width", "13").attr("height", "13").attr("fill", color_fill);

    fg_item.append("text").attr("x", "15").attr("y", "11").text("Foreground");

    var bg_item = dc_legend.append("g").attr("class", "dc-legend-item").attr("transform", "translate(0,18)");

    bg_item.append("rect").attr("width", "13").attr("height", "13").attr("fill", "gray");

    bg_item.append("text").attr("x", "15").attr("y", "11").text("Background");
  },

  renderLegendColorScheme: function renderLegendColorScheme(svg_container, attr_name, do_not_render) {
    var self = this;
    var branch_annotations = self.props.models[self.state.selected_model]["branch-annotations"];
    var svg = self.svg;

    if (!self.state.omega_color || !self.state.omega_scale) {
      return;
    }

    // clear existing linearGradients
    d3.selectAll(".legend-definitions").selectAll("linearGradient").remove();
    d3.selectAll("#color-legend").remove();

    if (branch_annotations && !do_not_render) {
      var this_grad = svg.append("defs").attr("class", "legend-definitions").append("linearGradient").attr("id", "_omega_bar").attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");

      self.state.omega_color.domain().forEach(function (d) {
        this_grad.append("stop").attr("offset", "" + self.state.omega_scale(d) * 100 + "%").style("stop-color", self.state.omega_color(d));
      });

      var g_container = svg.append("g").attr("id", "color-legend").attr("transform", "translate(" + self.props.margins["left"] + "," + self.props.margins["top"] + ")");

      g_container.append("rect").attr("x", 0).attr("width", self.props.bar_width - self.props.margins["left"] - self.props.margins["right"]).attr("y", 0).attr("height", self.props.bar_height - self.props.margins["top"] - self.props.margins["bottom"]).style("fill", "url(#_omega_bar)");

      var draw_omega_bar = d3.svg.axis().scale(self.state.axis_scale).orient("left").tickFormat(d3.format(".1r")).tickValues([0, 0.01, 0.1, 0.5, 1, 2, 5, 10]);

      var scale_bar = g_container.append("g");

      scale_bar.style("font-size", "14").attr("class", "hyphy-omega-bar").call(draw_omega_bar);

      scale_bar.selectAll("text").style("text-anchor", "right");

      var x_label = scale_bar.append("g").attr("class", "hyphy-omega-bar");

      x_label = x_label.selectAll("text").data([attr_name]);
      x_label.enter().append("text");
      x_label.text(function (d) {
        return $("<textarea />").html(d).text();
      }).attr("transform", "translate(" + (self.props.bar_width - self.props.margins["left"] - self.props.margins["right"]) * 0.5 + "," + (self.props.bar_height - self.props.margins["bottom"]) + ")").style("text-anchor", "middle").style("font-size", "18").attr("dx", "0.0em").attr("dy", "0.1em");
    }
  },

  setHandlers: function setHandlers() {
    var self = this;

    $("#hyphy-error-hide").on("click", function (e) {
      d3.select("#hyphy-error").style("display", "none");
      e.preventDefault();
    });

    $(".hyphy-tree-trigger").on("click", function (e) {});

    $(".tree-tab-btn").on("click", function (e) {
      self.tree.placenodes().update();
    });

    $("#export-phylo-svg").on("click", function (e) {
      datamonkey.save_image("svg", "#tree_container");
    });

    $("#export-phylo-png").on("click", function (e) {
      datamonkey.save_image("png", "#tree_container");
    });

    $("#export-phylo-nwk").on("click", function (e) {
      var nwk = self.tree.get_newick(function () {});
      var pom = document.createElement("a");
      pom.setAttribute("href", "data:text/octet-stream;charset=utf-8," + encodeURIComponent(nwk));
      pom.setAttribute("download", "nwk.txt");
      $("body").append(pom);
      pom.click();
      pom.remove();
    });
  },

  setTreeHandlers: function setTreeHandlers() {
    var self = this;
    var tree_object = self.tree;

    $("[data-direction]").on("click", function (e) {
      var which_function = $(this).data("direction") == "vertical" ? tree_object.spacing_x : tree_object.spacing_y;
      which_function(which_function() + +$(this).data("amount")).update();
    });

    $(".phylotree-layout-mode").on("change", function (e) {
      if ($(this).is(":checked")) {
        if (tree_object.radial() != ($(this).data("mode") == "radial")) {
          tree_object.radial(!tree_object.radial()).placenodes().update();
        }
      }
    });

    $(".phylotree-align-toggler").on("change", function (e) {
      if ($(this).is(":checked")) {
        tree_object.align_tips($(this).data("align") == "right");
        tree_object.placenodes().update();
      }
    });

    $("#sort_original").on("click", function (e) {
      tree_object.resort_children(function (a, b) {
        return a["original_child_order"] - b["original_child_order"];
      });

      e.preventDefault();
    });

    $("#sort_ascending").on("click", function (e) {
      self.sortNodes(true);
      e.preventDefault();
    });

    $("#sort_descending").on("click", function (e) {
      self.sortNodes(false);
      e.preventDefault();
    });
  },

  setPartitionList: function setPartitionList() {
    var self = this;

    // Check if partition list exists
    if (!self.props.json["partition"]) {
      d3.select("#hyphy-tree-highlight-div").style("display", "none");
      d3.select("#hyphy-tree-highlight").style("display", "none");
      return;
    }

    // set tree partitions
    self.tree.set_partitions(self.props.json["partition"]);

    var partition_list = d3.select("#hyphy-tree-highlight-branches").selectAll("li").data([["None"]].concat(d3.keys(self.props.json["partition"]).map(function (d) {
      return [d];
    }).sort()));

    partition_list.enter().append("li");
    partition_list.exit().remove();
    partition_list = partition_list.selectAll("a").data(function (d) {
      return d;
    });

    partition_list.enter().append("a");
    partition_list.attr("href", "#").on("click", function (d, i) {
      d3.select("#hyphy-tree-highlight").attr("value", d);
    });

    // set default to passed setting
    partition_list.text(function (d) {
      if (d == "RELAX.test") {
        this.click();
      }
      return d;
    });
  },

  changeModelSelection: function changeModelSelection(e) {
    var selected_model = e.target.dataset.type;

    this.setState({
      selected_model: selected_model
    });
  },


  getModelList: function getModelList() {
    var self = this;

    var createListElement = function createListElement(model_type) {
      return React.createElement(
        "li",
        null,
        React.createElement(
          "a",
          {
            href: "#",
            "data-type": model_type,
            onClick: self.changeModelSelection
          },
          model_type
        )
      );
    };

    return _.map(this.props.models, function (d, key) {
      return createListElement(key);
    });
  },

  initialize: function initialize() {
    this.settings = this.state.settings;

    if (!this.settings) {
      return null;
    }

    if (!this.state.json) {
      return null;
    }

    $("#hyphy-tree-branch-lengths").click();

    this.scaling_exponent = 0.33;
    this.omega_format = d3.format(".3r");
    this.prop_format = d3.format(".2p");
    this.fit_format = d3.format(".2f");
    this.p_value_format = d3.format(".4f");

    this.width = 800;
    this.height = 600;

    this.legend_type = this.settings["hyphy-tree-legend-type"];

    this.setHandlers();
    this.initializeTree();
    this.setPartitionList();
  },

  initializeTree: function initializeTree() {
    var self = this;

    var analysis_data = self.state.json;

    var width = this.width,
        height = this.height;

    if (!this.tree) {
      this.tree = d3.layout.phylotree("body").size([height, width]).separation(function (a, b) {
        return 0;
      });
    }

    this.setTreeHandlers();

    // clear any existing svg
    d3.select("#tree_container").html("");

    this.svg = d3.select("#tree_container").append("svg").attr("width", width).attr("height", height);

    this.tree.branch_name(null);
    this.tree.node_span("equal");
    this.tree.options({
      "draw-size-bubbles": false,
      selectable: false,
      "left-right-spacing": "fit-to-size",
      "left-offset": 100,
      "color-fill": this.settings["tree-options"]["hyphy-tree-fill-color"][0]
    }, false);

    this.assignBranchAnnotations();

    if (_.indexOf(_.keys(analysis_data), "tree") > -1) {
      self.tree(analysis_data["tree"]).svg(self.svg);
    } else {
      self.tree(self.props.models[self.state.selected_model]["tree string"]).svg(self.svg);
    }

    self.branch_lengths = this.getBranchLengths();
    self.tree.font_size(18);
    self.tree.scale_bar_font_size(14);
    self.tree.node_circle_size(0);

    self.tree.branch_length(function (n) {
      if (self.branch_lengths) {
        return self.branch_lengths[n.name] || 0;
      }
      return undefined;
    });

    this.assignBranchAnnotations();

    if (self.state.show_legend) {
      if (self.legend_type == "discrete") {
        self.renderDiscreteLegendColorScheme("tree_container");
      } else {
        self.renderLegendColorScheme("tree_container", self.props.models[self.state.selected_model]["annotation-tag"]);
      }
    }

    if (this.settings.edgeColorizer) {
      this.edgeColorizer = _.partial(this.settings.edgeColorizer, _, _, self.state.omega_color);
    }

    this.tree.style_edges(this.edgeColorizer);
    this.tree.style_nodes(this.nodeColorizer);

    this.tree.spacing_x(30, true);
    this.tree.layout();
    this.tree.placenodes().update();
    this.tree.layout();
  },

  componentDidMount: function componentDidMount() {
    this.initialize();
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var selected_model = _.first(_.keys(nextProps.models));

    this.setState({
      json: nextProps.json,
      settings: nextProps.settings,
      selected_model: selected_model
    });
  },

  componentDidUpdate: function componentDidUpdate() {
    this.initialize();
  },

  render: function render() {
    var dropdownListStyle = {
      paddingLeft: "20px",
      paddingRight: "20px",
      paddingTop: "10px",
      paddingBottom: "10px"
    };

    return React.createElement(
      "div",
      null,
      React.createElement(
        "h4",
        { className: "dm-table-header" },
        "Fitted tree",
        React.createElement("span", {
          className: "glyphicon glyphicon-info-sign",
          style: { verticalAlign: "middle", float: "right" },
          "aria-hidden": "true",
          "data-toggle": "popover",
          "data-trigger": "hover",
          title: "Actions",
          "data-html": "true",
          "data-content": "<ul><li>Hover over a branch to see its inferred rates and significance for selection.</li><ul>",
          "data-placement": "bottom"
        })
      ),
      React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "col-md-12" },
          React.createElement(
            "div",
            { className: "" },
            React.createElement(
              "div",
              { className: "input-group-btn" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-default dropdown-toggle",
                  "data-toggle": "dropdown"
                },
                "Model",
                " ",
                React.createElement("span", { className: "caret" })
              ),
              React.createElement(
                "ul",
                { className: "dropdown-menu", id: "hyphy-tree-model-list" },
                this.getModelList()
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-default btn-sm",
                  "data-direction": "vertical",
                  "data-amount": "1",
                  title: "Expand vertical spacing"
                },
                React.createElement("i", { className: "fa fa-arrows-v" })
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-default btn-sm",
                  "data-direction": "vertical",
                  "data-amount": "-1",
                  title: "Compress vertical spacing"
                },
                React.createElement("i", { className: "fa  fa-compress fa-rotate-135" })
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-default btn-sm",
                  id: "sort_ascending",
                  title: "Sort deepest clades to the bototm"
                },
                React.createElement("i", { className: "fa fa-sort-amount-asc" })
              ),
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-default btn-sm",
                  id: "sort_descending",
                  title: "Sort deepsest clades to the top"
                },
                React.createElement("i", { className: "fa fa-sort-amount-desc" })
              )
            ),
            React.createElement(
              "div",
              { className: "input-group-btn", "data-toggle": "buttons" },
              React.createElement(
                "button",
                { className: "btn btn-default active" },
                React.createElement("input", {
                  type: "radio",
                  name: "options",
                  className: "phylotree-layout-mode",
                  "data-mode": "linear",
                  autoComplete: "off",
                  checked: "",
                  title: "Layout left-to-right"
                }),
                "Linear"
              ),
              React.createElement(
                "button",
                { className: "btn btn-default" },
                React.createElement("input", {
                  type: "radio",
                  name: "options",
                  className: "phylotree-layout-mode",
                  "data-mode": "radial",
                  autoComplete: "off",
                  title: "Layout radially"
                }),
                " ",
                "Radial"
              )
            ),
            React.createElement(
              "div",
              { className: "input-group-btn", "data-toggle": "buttons" },
              React.createElement(
                "button",
                { className: "btn btn-default active" },
                React.createElement("input", {
                  type: "radio",
                  className: "phylotree-align-toggler",
                  "data-align": "left",
                  name: "options-align",
                  autoComplete: "off",
                  checked: "",
                  title: "Align tips labels to branches"
                }),
                React.createElement("i", { className: "fa fa-align-left" })
              ),
              React.createElement(
                "button",
                { className: "btn btn-default btn-sm" },
                React.createElement("input", {
                  type: "radio",
                  className: "phylotree-align-toggler",
                  "data-align": "right",
                  name: "options-align",
                  autoComplete: "off",
                  title: "Align tips labels to the edge of the plot"
                }),
                React.createElement("i", { className: "fa fa-align-right" })
              )
            ),
            React.createElement(
              "div",
              { className: "input-group-btn" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-default dropdown-toggle",
                  "data-toggle": "dropdown"
                },
                "Export ",
                React.createElement("span", { className: "caret" })
              ),
              React.createElement(
                "ul",
                { className: "dropdown-menu" },
                React.createElement(
                  "li",
                  { id: "export-phylo-png" },
                  React.createElement(
                    "a",
                    { href: "#" },
                    React.createElement("i", { className: "fa fa-image" }),
                    " Image"
                  )
                ),
                React.createElement(
                  "li",
                  { id: "export-phylo-nwk" },
                  React.createElement(
                    "a",
                    { href: "#" },
                    React.createElement("i", { className: "fa fa-file-o" }),
                    " Newick File"
                  )
                )
              )
            ),
            React.createElement(
              "div",
              { className: "input-group-btn" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-default btn-sm dropdown-toggle",
                  "data-toggle": "dropdown",
                  style: { paddingLeft: "30px" }
                },
                React.createElement("span", { className: "glyphicon glyphicon-cog" }),
                " ",
                React.createElement("span", { className: "caret" })
              ),
              React.createElement(
                "ul",
                { className: "dropdown-menu" },
                React.createElement(
                  "li",
                  { style: dropdownListStyle },
                  React.createElement("input", {
                    type: "checkbox",
                    id: "hyphy-tree-hide-legend",
                    className: "hyphy-tree-trigger",
                    defaultChecked: false,
                    onChange: this.toggleLegend
                  }),
                  " ",
                  "Hide Legend"
                ),
                React.createElement(
                  "li",
                  { style: dropdownListStyle },
                  React.createElement("input", {
                    type: "checkbox",
                    id: "hyphy-tree-fill-color",
                    className: "hyphy-tree-trigger",
                    defaultChecked: !this.props.fill_color,
                    onChange: this.changeColorScale
                  }),
                  " ",
                  "GrayScale"
                )
              )
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "col-md-12" },
          React.createElement(
            "div",
            { className: "row" },
            React.createElement("div", { id: "tree_container", className: "tree-widget" })
          )
        )
      )
    );
  }
});

function render_tree(json, element, settings) {
  return React.render(React.createElement(Tree, { json: json, settings: settings }), $(element)[0]);
}

function rerender_tree(json, element, settings) {
  $(element).empty();
  return render_tree(json, settings);
}

module.exports.Tree = Tree;
module.exports.render_tree = render_tree;
module.exports.rerender_tree = rerender_tree;

/***/ }),
/* 11 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_11__;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _tables = __webpack_require__(6);

var _tree_summary = __webpack_require__(26);

var _tree = __webpack_require__(10);

var _branch_table = __webpack_require__(22);

var _navbar = __webpack_require__(4);

var _scrollspy = __webpack_require__(5);

var _input_info = __webpack_require__(8);

var React = __webpack_require__(0),
    ReactDOM = __webpack_require__(3);

var _ = __webpack_require__(1);

__webpack_require__(11);
__webpack_require__(16);

var BSRELSummary = React.createClass({
  displayName: "BSRELSummary",

  float_format: d3.format(".2f"),

  countBranchesTested: function countBranchesTested(branches_tested) {
    if (branches_tested) {
      return branches_tested.split(";").length;
    } else {
      return 0;
    }
  },

  getBranchesWithEvidence: function getBranchesWithEvidence(test_results) {
    return _.filter(test_results, function (d) {
      return d.p <= 0.05;
    }).length;
  },

  getTestBranches: function getTestBranches(test_results) {
    return _.filter(test_results, function (d) {
      return d.tested > 0;
    }).length;
  },

  getTotalBranches: function getTotalBranches(test_results) {
    return _.keys(test_results).length;
  },

  getInitialState: function getInitialState() {
    var self = this;

    return {
      branches_with_evidence: this.getBranchesWithEvidence(self.props.test_results),
      test_branches: this.getTestBranches(self.props.test_results),
      total_branches: this.getTotalBranches(self.props.test_results)
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({
      branches_with_evidence: this.getBranchesWithEvidence(nextProps.test_results),
      test_branches: this.getTestBranches(nextProps.test_results),
      total_branches: this.getTotalBranches(nextProps.test_results)
    });
  },

  render: function render() {
    var self = this,
        user_message,
        was_evidence = self.state.branches_with_evidence > 0;

    if (was_evidence) {
      user_message = React.createElement(
        "p",
        { className: "list-group-item-text label_and_input" },
        "aBSREL ",
        React.createElement(
          "strong",
          { className: "hyphy-highlight" },
          "found evidence"
        ),
        " of episodic diversifying selection on",
        " ",
        React.createElement(
          "span",
          { className: "hyphy-highlight" },
          React.createElement(
            "strong",
            null,
            self.state.branches_with_evidence
          )
        ),
        " ",
        "out of",
        " ",
        React.createElement(
          "span",
          { className: "hyphy-highlight" },
          React.createElement(
            "strong",
            null,
            self.state.total_branches
          )
        ),
        " ",
        "branches in your phylogeny."
      );
    } else {
      user_message = React.createElement(
        "p",
        { className: "list-group-item-text label_and_input" },
        "aBSREL ",
        React.createElement(
          "strong",
          null,
          "found no evidence"
        ),
        " of episodic diversifying selection in your phylogeny."
      );
    }

    return React.createElement(
      "div",
      { className: "row", id: "summary-div" },
      React.createElement(
        "div",
        { className: "col-md-12" },
        React.createElement(
          "h3",
          { className: "list-group-item-heading" },
          React.createElement(
            "span",
            { className: "summary-method-name" },
            "adaptive Branch Site REL"
          ),
          React.createElement("br", null),
          React.createElement(
            "span",
            { className: "results-summary" },
            "results summary"
          )
        )
      ),
      React.createElement(
        "div",
        { className: "col-md-12" },
        React.createElement(_input_info.InputInfo, { input_data: this.props.input_data })
      ),
      React.createElement(
        "div",
        { className: "col-md-12" },
        React.createElement(
          "div",
          { className: "main-result" },
          user_message,
          React.createElement(
            "p",
            null,
            "A total of",
            " ",
            React.createElement(
              "strong",
              { className: "hyphy-highlight" },
              self.state.test_branches
            ),
            " ",
            "branches were formally tested for diversifying selection. Significance was assessed using the Likelihood Ratio Test at a threshold of p \u2264 0.05, after correcting for multiple testing. Significance and number of rate categories inferred at each branch are provided in the ",
            React.createElement(
              "a",
              { href: "#table-tab" },
              "detailed results"
            ),
            " ",
            "table."
          ),
          React.createElement("hr", null),
          React.createElement(
            "p",
            null,
            React.createElement(
              "small",
              null,
              "See",
              " ",
              React.createElement(
                "a",
                { href: "http://hyphy.org/methods/selection-methods/#absrel" },
                "here"
              ),
              " ",
              "for more information about the aBSREL method.",
              React.createElement("br", null),
              "Please cite",
              " ",
              React.createElement(
                "a",
                {
                  href: "http://www.ncbi.nlm.nih.gov/pubmed/25697341",
                  id: "summary-pmid",
                  target: "_blank"
                },
                "PMID 25697341"
              ),
              " ",
              "if you use this result in a publication, presentation, or other scientific work."
            )
          )
        )
      )
    );
  }
});

var BSREL = React.createClass({
  displayName: "BSREL",

  float_format: d3.format(".2f"),

  loadFromServer: function loadFromServer() {

    var self = this;

    d3.json(this.props.url, function (data) {
      data["fits"]["MG94"]["branch-annotations"] = self.formatBranchAnnotations(data, "MG94");
      data["fits"]["Full model"]["branch-annotations"] = self.formatBranchAnnotations(data, "Full model");

      // GH-#18 Add omega annotation tag
      data["fits"]["MG94"]["annotation-tag"] = "ω";
      data["fits"]["Full model"]["annotation-tag"] = "ω";

      self.setState({
        annotations: data["fits"]["Full model"]["branch-annotations"],
        json: data,
        pmid: data["PMID"],
        fits: data["fits"],
        full_model: data["fits"]["Full model"],
        test_results: data["test results"],
        input_data: data["input_data"],
        tree: d3.layout.phylotree()(data["fits"]["Full model"]["tree string"])
      });
    });
  },

  omegaColorGradient: ["#5e4fa2", "#3288bd", "#e6f598", "#f46d43", "#9e0142"],
  omegaGrayScaleGradient: ["#DDDDDD", "#AAAAAA", "#888888", "#444444", "#000000"],

  getDefaultProps: function getDefaultProps() {},

  getInitialState: function getInitialState() {
    var edgeColorizer = function edgeColorizer(element, data, omega_color) {
      var svg = d3.select("#tree_container svg"),
          svg_defs = d3.select(".phylotree-definitions");

      if (svg_defs.empty()) {
        svg_defs = svg.append("defs").attr("class", "phylotree-definitions");
      }

      // clear existing linearGradients
      var omega_format = d3.format(".3r"),
          prop_format = d3.format(".2p");

      var createBranchGradient = function createBranchGradient(node) {
        function generateGradient(svg_defs, grad_id, annotations, already_cumulative) {
          var current_weight = 0;
          var this_grad = svg_defs.append("linearGradient").attr("id", grad_id);

          annotations.forEach(function (d, i) {
            if (d.prop) {
              var new_weight = current_weight + d.prop;
              this_grad.append("stop").attr("offset", "" + current_weight * 100 + "%").style("stop-color", omega_color(d.omega));
              this_grad.append("stop").attr("offset", "" + new_weight * 100 + "%").style("stop-color", omega_color(d.omega));
              current_weight = new_weight;
            }
          });
        }

        // Create svg definitions
        if (self.gradient_count == undefined) {
          self.gradient_count = 0;
        }

        if (node.annotations) {
          if (node.annotations.length == 1) {
            node["color"] = omega_color(node.annotations[0]["omega"]);
          } else {
            self.gradient_count++;
            var grad_id = "branch_gradient_" + self.gradient_count;
            generateGradient(svg_defs, grad_id, node.annotations.omegas);
            node["grad"] = grad_id;
          }
        }
      };

      var annotations = data.target.annotations,
          alpha_level = 0.05,
          tooltip = "<b>" + data.target.name + "</b>";
      //reference_omega_weight = prop_format(0),
      //distro = "";

      if (annotations) {
        //reference_omega_weight = annotations.omegas[0].prop;

        annotations.omegas.forEach(function (d, i) {
          var omega_value = d.omega > 1e20 ? "&infin;" : omega_format(d.omega),
              omega_weight = prop_format(d.prop);

          tooltip += "<br/>&omega;<sub>" + (i + 1) + "</sub> = " + omega_value + " (" + omega_weight + ")";

          //if (i) {
          //  distro += "<br/>";
          //}

          //distro +=
          //  "&omega;<sub>" +
          //  (i + 1) +
          //  "</sub> = " +
          //  omega_value +
          //  " (" +
          //omega_weight +
          //")";
        });

        tooltip += "<br/><i>p = " + omega_format(annotations["p"]) + "</i>";

        $(element[0][0]).tooltip({
          title: tooltip,
          html: true,
          trigger: "hover",
          container: "body",
          placement: "auto"
        });

        createBranchGradient(data.target);

        if (data.target.grad) {
          element.style("stroke", "url(#" + data.target.grad + ")");
        } else {
          element.style("stroke", data.target.color);
        }

        element.style("stroke-width", annotations["p"] <= alpha_level ? "12" : "5").style("stroke-linejoin", "round").style("stroke-linecap", "round");
      }
    };

    var tree_settings = {
      omegaPlot: {},
      "tree-options": {
        /* value arrays have the following meaning
                [0] - the value of the attribute
                [1] - does the change in attribute value trigger tree re-layout?
            */
        "hyphy-tree-model": ["Full model", true],
        "hyphy-tree-highlight": [null, false],
        "hyphy-tree-branch-lengths": [true, true],
        "hyphy-tree-hide-legend": [false, true],
        "hyphy-tree-fill-color": [true, true]
      },
      "suppress-tree-render": false,
      "chart-append-html": true,
      edgeColorizer: edgeColorizer
    };

    return {
      annotations: null,
      json: null,
      pmid: null,
      model_fits: {},
      settings: tree_settings,
      test_results: null,
      input_data: null,
      tree: null
    };
  },

  componentWillMount: function componentWillMount() {
    this.loadFromServer();
  },

  componentDidMount: function componentDidMount() {
    this.setEvents();
  },

  setEvents: function setEvents() {
    var self = this;

    $("#dm-file").on("change", function (e) {
      var files = e.target.files; // FileList object

      if (files.length == 1) {
        var f = files[0];
        var reader = new FileReader();

        reader.onload = function (theFile) {
          return function (e) {
            var data = JSON.parse(this.result);
            data["fits"]["MG94"]["branch-annotations"] = self.formatBranchAnnotations(data, "MG94");
            data["fits"]["Full model"]["branch-annotations"] = self.formatBranchAnnotations(data, "Full model");

            var annotations = data["fits"]["Full model"]["branch-annotations"],
                json = data,
                pmid = data["PMID"],
                full_model = json["fits"]["Full model"],
                test_results = data["test results"],
                input_data = data["input_data"],
                fits = data["fits"];

            self.setState({
              annotations: annotations,
              json: json,
              pmid: pmid,
              full_model: full_model,
              test_results: test_results,
              input_data: input_data,
              fits: fits,
              tree: d3.layout.phylotree()(data["fits"]["Full model"]["tree string"])
            });
          };
        }(f);
        reader.readAsText(f);
      }
      e.preventDefault();
    });
  },

  formatBranchAnnotations: function formatBranchAnnotations(json, key) {
    var initial_branch_annotations = json["fits"][key]["branch-annotations"];

    if (!initial_branch_annotations) {
      initial_branch_annotations = json["fits"][key]["rate distributions"];
    }

    // Iterate over objects
    var branch_annotations = _.mapObject(initial_branch_annotations, function (val, key) {
      var vals = [];
      try {
        vals = JSON.parse(val);
      } catch (e) {
        vals = val;
      }

      var omegas = {
        omegas: _.map(vals, function (d) {
          return _.object(["omega", "prop"], d);
        })
      };
      var test_results = _.clone(json["test results"][key]);
      _.extend(test_results, omegas);
      return test_results;
    });

    return branch_annotations;
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    $("body").scrollspy({
      target: ".bs-docs-sidebar",
      offset: 50
    });
    $('[data-toggle="popover"]').popover();
  },


  render: function render() {
    var self = this;

    var scrollspy_info = [{ label: "summary", href: "summary-tab" }, { label: "tree", href: "hyphy-tree-summary" }, { label: "table", href: "table-tab" }];

    var models = {};
    if (!_.isNull(self.state.json)) {
      models = self.state.json.fits;
    }

    return React.createElement(
      "div",
      null,
      React.createElement(_navbar.NavBar, null),
      React.createElement(
        "div",
        { className: "container" },
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(_scrollspy.ScrollSpy, { info: scrollspy_info }),
          React.createElement(
            "div",
            { className: "col-sm-10" },
            React.createElement(
              "div",
              {
                id: "datamonkey-absrel-error",
                className: "alert alert-danger alert-dismissible",
                role: "alert",
                style: { display: "none" }
              },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "close",
                  id: "datamonkey-absrel-error-hide"
                },
                React.createElement(
                  "span",
                  { "aria-hidden": "true" },
                  "\xD7"
                ),
                React.createElement(
                  "span",
                  { className: "sr-only" },
                  "Close"
                )
              ),
              React.createElement(
                "strong",
                null,
                "Error!"
              ),
              " ",
              React.createElement("span", { id: "datamonkey-absrel-error-text" })
            ),
            React.createElement(
              "div",
              { id: "results" },
              React.createElement(
                "div",
                { id: "summary-tab" },
                React.createElement(BSRELSummary, {
                  test_results: self.state.test_results,
                  pmid: self.state.pmid,
                  input_data: self.state.input_data
                }),
                React.createElement(
                  "div",
                  { className: "row" },
                  React.createElement(
                    "div",
                    { id: "hyphy-tree-summary", className: "col-md-12" },
                    React.createElement(_tree_summary.TreeSummary, {
                      model: self.state.full_model,
                      test_results: self.state.test_results
                    })
                  )
                )
              ),
              React.createElement(
                "div",
                { className: "row" },
                React.createElement(
                  "div",
                  { id: "tree-tab", className: "col-md-12" },
                  React.createElement(_tree.Tree, {
                    json: self.state.json,
                    settings: self.state.settings,
                    models: models,
                    color_gradient: self.omegaColorGradient,
                    grayscale_gradient: self.omegaGrayscaleGradient
                  })
                )
              ),
              React.createElement(
                "div",
                { className: "row" },
                React.createElement(
                  "div",
                  { id: "table-tab", className: "col-md-12" },
                  React.createElement(_branch_table.BranchTable, {
                    tree: self.state.tree,
                    test_results: self.state.test_results,
                    annotations: self.state.annotations
                  })
                ),
                React.createElement(
                  "div",
                  { id: "hyphy-model-fits", className: "col-md-12" },
                  React.createElement(_tables.DatamonkeyModelTable, { fits: self.state.fits }),
                  React.createElement(
                    "p",
                    { className: "description" },
                    "This table reports a statistical summary of the models fit to the data. Here, ",
                    React.createElement(
                      "strong",
                      null,
                      "MG94"
                    ),
                    " refers to the MG94xREV baseline model that infers a single \u03C9 rate category per branch. ",
                    React.createElement(
                      "strong",
                      null,
                      "Full Model"
                    ),
                    " refers to the adaptive aBSREL model that infers an optimized number of \u03C9 rate categories per branch."
                  )
                )
              )
            )
          )
        )
      )
    );
  }
});

// Will need to make a call to this
// omega distributions
function render_absrel(url, element) {
  ReactDOM.render(React.createElement(BSREL, { url: url }), document.getElementById(element));
}

module.exports = render_absrel;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var React = __webpack_require__(0);

var ModelFits = React.createClass({
  displayName: "ModelFits",

  getInitialState: function getInitialState() {
    var table_row_data = this.getModelRows(this.props.json),
        table_columns = this.getModelColumns(table_row_data);

    return {
      table_row_data: table_row_data,
      table_columns: table_columns
    };
  },

  formatRuntime: function formatRuntime(seconds) {
    var duration_string = "",
        seconds = parseFloat(seconds);

    var split_array = [Math.floor(seconds / (24 * 3600)), Math.floor(seconds / 3600) % 24, Math.floor(seconds / 60) % 60, seconds % 60],
        quals = ["d.", "hrs.", "min.", "sec."];

    split_array.forEach(function (d, i) {
      if (d) {
        duration_string += " " + d + " " + quals[i];
      }
    });

    return duration_string;
  },

  getLogLikelihood: function getLogLikelihood(this_model) {
    return d3.format(".2f")(this_model["log-likelihood"]);
  },

  getAIC: function getAIC(this_model) {
    return d3.format(".2f")(this_model["AIC-c"]);
  },

  getNumParameters: function getNumParameters(this_model) {
    return this_model["parameters"];
  },

  getBranchLengths: function getBranchLengths(this_model) {
    if (this_model["tree length"]) {
      return d3.format(".2f")(this_model["tree length"]);
    } else {
      return d3.format(".2f")(d3.values(this_model["branch-lengths"]).reduce(function (p, c) {
        return p + c;
      }, 0));
    }
  },

  getRuntime: function getRuntime(this_model) {
    //return this.formatRuntime(this_model['runtime']);
    return this.formatRuntime(this_model["runtime"]);
  },

  getDistributions: function getDistributions(m, this_model) {
    var omega_distributions = {};
    omega_distributions[m] = {};

    var omega_format = d3.format(".3r"),
        prop_format = d3.format(".2p");

    var distributions = [];

    for (var d in this_model["rate-distributions"]) {
      var this_distro = this_model["rate-distributions"][d];
      var this_distro_entry = [d, "", "", ""];

      omega_distributions[m][d] = this_distro.map(function (d) {
        return {
          omega: d[0],
          weight: d[1]
        };
      });

      for (var k = 0; k < this_distro.length; k++) {
        this_distro_entry[k + 1] = omega_format(this_distro[k][0]) + " (" + prop_format(this_distro[k][1]) + ")";
      }

      distributions.push(this_distro_entry);
    }

    distributions.sort(function (a, b) {
      return a[0] < b[0] ? -1 : a[0] == b[0] ? 0 : 1;
    });

    return distributions;
  },

  getModelRows: function getModelRows(json) {
    if (!json) {
      return [];
    }

    var table_row_data = [];

    for (var m in json["fits"]) {
      var this_model_row = [],
          this_model = json["fits"][m];

      this_model_row = [this_model["display-order"], "", m, this.getLogLikelihood(this_model), this.getNumParameters(this_model), this.getAIC(this_model), this.getRuntime(this_model), this.getBranchLengths(this_model)];

      var distributions = this.getDistributions(m, this_model);

      if (distributions.length) {
        this_model_row = this_model_row.concat(distributions[0]);
        this_model_row[1] = distributions[0][0];

        table_row_data.push(this_model_row);

        for (var d = 1; d < distributions.length; d++) {
          var this_distro_entry = this_model_row.map(function (d, i) {
            if (i) return "";
            return d;
          });

          this_distro_entry[1] = distributions[d][0];

          for (var k = this_distro_entry.length - 4; k < this_distro_entry.length; k++) {
            this_distro_entry[k] = distributions[d][k - this_distro_entry.length + 4];
          }

          table_row_data.push(this_distro_entry);
        }
      } else {
        table_row_data.push(this_model_row);
      }
    }

    table_row_data.sort(function (a, b) {
      if (a[0] == b[0]) {
        return a[1] < b[1] ? -1 : a[1] == b[1] ? 0 : 1;
      }
      return a[0] - b[0];
    });

    table_row_data = table_row_data.map(function (r) {
      return r.slice(2);
    });

    return table_row_data;
  },

  getModelColumns: function getModelColumns(table_row_data) {
    var model_header = "<th>Model</th>",
        logl_header = "<th><em> log </em>L</th>",
        num_params_header = "<th># par.</th>",
        aic_header = "<th>AIC<sub>c</sub></abbr></th>",
        runtime_header = "<th>Time to fit</th>",
        branch_lengths_header = "<th>L<sub>tree</sub></abbr></th>",
        branch_set_header = "<th>Branch set</th>",
        omega_1_header = "<th>&omega;<sub>1</sub></th>",
        omega_2_header = "<th>&omega;<sub>2</sub></th>",
        omega_3_header = "<th>&omega;<sub>3</sub></th>";

    // inspect table_row_data and return header
    var all_columns = [model_header, logl_header, num_params_header, aic_header, runtime_header, branch_lengths_header, branch_set_header, omega_1_header, omega_2_header, omega_3_header];

    // validate each table row with its associated header
    if (table_row_data.length == 0) {
      return [];
    }

    // trim columns to length of table_row_data
    var column_headers = _.take(all_columns, table_row_data[0].length);

    return column_headers;
  },

  componentDidUpdate: function componentDidUpdate() {
    var model_columns = d3.select("#summary-model-header1");
    model_columns = model_columns.selectAll("th").data(this.state.table_columns);
    model_columns.enter().append("th");
    model_columns.html(function (d) {
      return d;
    });

    var model_rows = d3.select("#summary-model-table").selectAll("tr").data(this.state.table_row_data);
    model_rows.enter().append("tr");
    model_rows.exit().remove();
    model_rows = model_rows.selectAll("td").data(function (d) {
      return d;
    });
    model_rows.enter().append("td");
    model_rows.html(function (d) {
      return d;
    });
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var table_row_data = this.getModelRows(nextProps.json),
        table_columns = this.getModelColumns(table_row_data);

    this.setState({
      table_row_data: table_row_data,
      table_columns: table_columns
    });
  },

  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "h4",
        { className: "dm-table-header" },
        "Model fits",
        React.createElement("span", {
          className: "glyphicon glyphicon-info-sign",
          style: { verticalAlign: "middle", float: "right" },
          "aria-hidden": "true",
          "data-toggle": "popover",
          "data-trigger": "hover",
          title: "Actions",
          "data-html": "true",
          "data-content": "<ul><li>Hover over a column header for a description of its content.</li></ul>",
          "data-placement": "bottom"
        })
      ),
      React.createElement(
        "table",
        {
          className: "dm-table table table-hover table-condensed list-group-item-text",
          style: { marginTop: "0.5em" }
        },
        React.createElement("thead", { id: "summary-model-header1" }),
        React.createElement("tbody", { id: "summary-model-table" })
      )
    );
  }
});

// Will need to make a call to this
// omega distributions
function render_model_fits(json, element) {
  React.render(React.createElement(ModelFits, { json: json }), $(element)[0]);
}

// Will need to make a call to this
// omega distributions
function rerender_model_fits(json, element) {
  $(element).empty();
  render_model_fits(json, element);
}

module.exports.ModelFits = ModelFits;
module.exports.render_model_fits = render_model_fits;
module.exports.rerender_model_fits = rerender_model_fits;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var React = __webpack_require__(0);
var datamonkey = __webpack_require__(2);

var PropChart = React.createClass({
  displayName: "PropChart",

  getDefaultProps: function getDefaultProps() {
    return {
      svg_id: null,
      dimensions: {
        width: 600,
        height: 400
      },
      margins: {
        left: 50,
        right: 15,
        bottom: 25,
        top: 35
      },
      has_zeros: false,
      legend_id: null,
      do_log_plot: true,
      k_p: null,
      plot: null
    };
  },

  getInitialState: function getInitialState() {
    return {
      model_name: this.props.name,
      omegas: this.props.omegas,
      settings: this.props.settings
    };
  },

  setEvents: function setEvents() {
    var self = this;

    d3.select("#" + this.save_svg_id).on("click", function (e) {
      datamonkey.save_image("svg", "#" + self.svg_id);
    });

    d3.select("#" + this.save_png_id).on("click", function (e) {
      datamonkey.save_image("png", "#" + self.svg_id);
    });
  },

  initialize: function initialize() {
    // clear svg
    d3.select("#prop-chart").html("");
    this.data_to_plot = this.state.omegas;
    if (this.state.omegas) {
      this.data_to_plot.forEach(function (data) {
        if (data.omega < 1e-5) data.omega = 1e-5;
        if (data.omega > 1e4) data.omega = 1e4;
      });
    }

    // Set props from settings
    this.svg_id = this.props.settings.svg_id;
    this.dimensions = this.props.settings.dimensions || this.props.dimensions;
    this.margins = this.props.settings.margins || this.props.margins;
    this.legend_id = this.props.settings.legend || this.props.legend_id;
    this.do_log_plot = this.props.settings.log || this.props.do_log_plot;
    this.k_p = this.props.settings.k || this.props.k_p;

    var dimensions = this.props.dimensions;
    var margins = this.props.margins;

    if (this.props.do_log_plot) {
      this.has_zeros = this.data_to_plot.some(function (d) {
        return d.omega <= 0;
      });
    }

    this.plot_width = dimensions["width"] - margins["left"] - margins["right"], this.plot_height = dimensions["height"] - margins["top"] - margins["bottom"];

    var domain = this.state.settings["domain"];

    this.omega_scale = (this.do_log_plot ? d3.scale.log() : d3.scale.linear()).range([0, this.plot_width]).domain(domain).nice();

    this.proportion_scale = d3.scale.linear().range([this.plot_height, 0]).domain([-0.05, 1]).clamp(true);

    // compute margins -- circle AREA is proportional to the relative weight
    // maximum diameter is (height - text margin)
    this.svg = d3.select("#" + this.svg_id).attr("width", "100%").attr("preserveAspectRatio", "xMinYMin meet").attr("viewBox", "0 0 " + this.dimensions.width + " " + this.dimensions.height).attr("height", dimensions.height + margins["top"] + margins["bottom"]);

    this.plot = this.svg.selectAll(".container");

    this.svg.selectAll("defs").remove();

    this.svg.append("defs").append("marker").attr("id", "arrowhead").attr("refX", 10) /*must be smarter way to calculate shift*/
    .attr("refY", 4).attr("markerWidth", 10).attr("markerHeight", 8).attr("orient", "auto").attr("stroke", "#000").attr("fill", "#000").append("path").attr("d", "M 0,0 V8 L10,4 Z");

    if (this.plot.empty()) {
      this.plot = this.svg.append("g").attr("class", "container");
    }

    this.plot.attr("transform", "translate(" + this.margins["left"] + " , " + this.margins["top"] + ")");
    this.reference_omega_lines = this.plot.selectAll(".hyphy-omega-line-reference"), this.displacement_lines = this.plot.selectAll(".hyphy-displacement-line");

    this.createNeutralLine();
    this.createXAxis();
    this.createYAxis();
    this.setEvents();
    this.createOmegaLine(this.state.omegas);
  },

  createOmegaLine: function createOmegaLine(omegas) {
    var self = this;

    // generate color wheel from omegas
    self.colores_g = _.shuffle(["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]);

    var color_scale = d3.scale.linear().domain([0.01, 1, 10]).range([d3.rgb("#000000"), d3.rgb("#DDDDDD"), d3.rgb("#00A99D")]);

    // ** Omega Line (Red) ** //
    var omega_lines = this.plot.selectAll(".hyphy-omega-line").data(omegas);
    omega_lines.enter().append("line");
    omega_lines.exit().remove();

    omega_lines.transition().attr("x1", function (d) {
      return self.omega_scale(d.omega);
    }).attr("x2", function (d) {
      return self.omega_scale(d.omega);
    }).attr("y1", function (d) {
      return self.proportion_scale(-0.05) + 20;
    }).attr("y2", function (d) {
      return self.proportion_scale(d.prop) + 20;
    }).style("stroke", function (d) {
      return color_scale(Math.min(10, d.omega));
    }).attr("class", "hyphy-omega-line");
  },

  createNeutralLine: function createNeutralLine() {
    var self = this;

    // ** Neutral Line (Blue) ** //
    var neutral_line = this.plot.selectAll(".hyphy-neutral-line").data([1]);
    neutral_line.enter().append("line").attr("class", "hyphy-neutral-line");
    neutral_line.exit().remove();
    neutral_line.transition().attr("x1", function (d) {
      return self.omega_scale(d);
    }).attr("x2", function (d) {
      return self.omega_scale(d);
    }).attr("y1", 20).attr("y2", this.plot_height + 20);

    // Legend
    this.svg.append("g").attr("transform", "translate(" + 0.9 * this.plot_width + ", 25)").append("text").attr("font-size", 14).text("Neutrality (ω=1)");

    this.svg.append("g").attr("transform", "translate(" + 0.825 * this.plot_width + ", 20)").append("line").attr("class", "hyphy-neutral-line").attr("x1", 0).attr("x2", 0.05 * this.plot_width).attr("y1", 0).attr("y2", 0);
  },
  createXAxis: function createXAxis() {
    // *** X-AXIS *** //
    var xAxis = d3.svg.axis().scale(this.omega_scale).orient("bottom");

    if (this.do_log_plot) {
      xAxis.ticks(10, this.has_zeros ? ".2r" : ".1r");
    }

    var x_axis = this.svg.selectAll(".x.axis");
    var x_label;

    if (x_axis.empty()) {
      x_axis = this.svg.append("g").attr("class", "x hyphy-axis");

      x_label = x_axis.append("g").attr("class", "hyphy-axis-label x-label");
    } else {
      x_label = x_axis.select(".axis-label.x-label");
    }

    x_axis.attr("transform", "translate(" + this.margins["left"] + "," + (this.plot_height + this.margins["top"] + 20) + ")").call(xAxis);
    x_label = x_label.attr("transform", "translate(" + this.plot_width + "," + (this.margins["bottom"] - 30) + ")").selectAll("text").data(["\u03C9"]);
    x_label.enter().append("text");
    x_label.text(function (d) {
      return d;
    }).style({
      "text-anchor": "end",
      "font-size": 18
    }).attr("dy", "0.0em");
  },
  createYAxis: function createYAxis() {
    // *** Y-AXIS *** //
    var yAxis = d3.svg.axis().scale(this.proportion_scale).orient("left").ticks(10, ".1p");

    var y_axis = this.svg.selectAll(".y.hyphy-axis");
    var y_label;

    if (y_axis.empty()) {
      y_axis = this.svg.append("g").attr("class", "y hyphy-axis");
      y_label = y_axis.append("g").attr("class", "hyphy-axis-label y-label");
    } else {
      y_label = y_axis.select(".hyphy-axis-label.y-label");
    }
    y_axis.attr("transform", "translate(" + this.margins["left"] + "," + (this.margins["top"] + 20) + ")").call(yAxis);
    y_label = y_label.attr("transform", "translate(" + (-this.margins["left"] + 10) + "," + 0 + ")").selectAll("text").data(["Proportion of sites"]);
    y_label.enter().append("text");
    y_label.text(function (d) {
      return d;
    }).style({
      "text-anchor": "start",
      "font-size": 18
    }).attr("dy", "-1em");
  },

  componentDidMount: function componentDidMount() {
    try {
      this.initialize();
    } catch (e) {}
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({
      model_name: nextProps.name,
      omegas: nextProps.omegas
    });
  },

  componentDidUpdate: function componentDidUpdate() {
    try {
      this.initialize();
    } catch (e) {}
  },

  render: function render() {
    this.save_svg_id = "export-" + this.svg_id + "-svg";
    this.save_png_id = "export-" + this.svg_id + "-png";

    return React.createElement(
      "div",
      { className: "panel panel-default", id: this.state.model_name },
      React.createElement(
        "div",
        { className: "panel-heading" },
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(
            "div",
            { className: "col-md-8 v-align" },
            React.createElement(
              "h1",
              { className: "panel-title" },
              React.createElement(
                "strong",
                null,
                this.state.model_name
              )
            )
          ),
          React.createElement(
            "div",
            { className: "col-md-4 v-align" },
            React.createElement(
              "div",
              { className: "btn-group pull-right" },
              React.createElement(
                "button",
                {
                  id: this.save_svg_id,
                  type: "button",
                  className: "btn btn-default btn-sm"
                },
                React.createElement("span", { className: "glyphicon glyphicon-floppy-save" }),
                " SVG"
              ),
              React.createElement(
                "button",
                {
                  id: this.save_png_id,
                  type: "button",
                  className: "btn btn-default btn-sm"
                },
                React.createElement("span", { className: "glyphicon glyphicon-floppy-save" }),
                " PNG"
              )
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "panel-body col-md-12", style: { textAlign: "center" } },
          React.createElement("svg", { id: this.svg_id })
        )
      )
    );
  }
});

function render_prop_chart(model_name, omegas, settings) {
  return React.render(React.createElement(PropChart, { name: model_name, omegas: omegas, settings: settings }), document.getElementById("primary-omega-tag"));
}

function rerender_prop_chart(model_name, omeags, settings) {
  $("#primary-omega-tag").empty();
  return render_prop_chart(model_name, omeags, settings);
}

module.exports.render_prop_chart = render_prop_chart;
module.exports.rerender_prop_chart = rerender_prop_chart;
module.exports.PropChart = PropChart;

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_15__;

/***/ }),
/* 16 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_16__;

/***/ }),
/* 17 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_17__;

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});

var _absrel = __webpack_require__(12);

Object.defineProperty(exports, 'absrel', {
    enumerable: true,
    get: function get() {
        return _interopRequireDefault(_absrel).default;
    }
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

__webpack_require__(34);
__webpack_require__(37);
__webpack_require__(36);
__webpack_require__(35);

__webpack_require__(38);
__webpack_require__(2);

var absrel = __webpack_require__(12),
    busted = __webpack_require__(21),
    fade = __webpack_require__(20),
    fade_summary = __webpack_require__(27),
    fel = __webpack_require__(28),
    prime = __webpack_require__(30),
    relax = __webpack_require__(31),
    slac = __webpack_require__(32),
    meme = __webpack_require__(29),
    template = __webpack_require__(33);

// Create new hyphy-vision export
//module.exports.absrel = absrel;
//module.exports.busted = busted;
//module.exports.fade = fade;
//module.exports.fade_summary = fade_summary;
//module.exports.fel = fel;
//module.exports.prime = prime;
//module.exports.meme = meme;
//module.exports.relax = relax;
//module.exports.slac = slac;
//module.exports.template = template;

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var datamonkey = __webpack_require__(2);

function datamonkey_get_styles(doc) {
  var styles = "",
      styleSheets = doc.styleSheets;

  if (styleSheets) {
    for (var i = 0; i < styleSheets.length; i++) {
      processStyleSheet(styleSheets[i]);
    }
  }

  function processStyleSheet(ss) {
    if (ss.cssRules) {
      for (var i = 0; i < ss.cssRules.length; i++) {
        var rule = ss.cssRules[i];
        if (rule.type === 3) {
          // Import Rule
          processStyleSheet(rule.styleSheet);
        } else {
          // hack for illustrator crashing on descendent selectors
          if (rule.selectorText) {
            if (rule.selectorText.indexOf(">") === -1) {
              styles += "\n" + rule.cssText;
            }
          }
        }
      }
    }
  }
  return styles;
}

function datamonkey_save_newick_to_file() {
  var top_modal_container = "#neighbor-tree-modal";
  var nwk = $(top_modal_container).data("tree");
  var pom = document.createElement("a");
  pom.setAttribute("href", "data:text/octet-stream;charset=utf-8," + encodeURIComponent(nwk));
  pom.setAttribute("download", "nwk.txt");
  $("body").append(pom);
  pom.click();
  pom.remove();
}

function datamonkey_convert_svg_to_png(image_string) {
  var image = document.getElementById("image");
  image.src = image_string;

  image.onload = function () {
    var canvas = document.getElementById("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    var context = canvas.getContext("2d");
    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, image.width, image.height);
    context.drawImage(image, 0, 0);
    var pom = document.createElement("a");
    pom.setAttribute("download", "phylotree.png");
    pom.href = canvas.toDataURL("image/png");
    $("body").append(pom);
    pom.click();
    pom.remove();
  };
}

function datamonkey_save_newick_tree(type) {
  var prefix = {
    xmlns: "http://www.w3.org/2000/xmlns/",
    xlink: "http://www.w3.org/1999/xlink",
    svg: "http://www.w3.org/2000/svg"
  };

  var svg = $("#tree_container").find("svg")[0];
  var styles = datamonkey_get_styles(window.document);

  svg.setAttribute("version", "1.1");

  var defsEl = document.createElement("defs");
  svg.insertBefore(defsEl, svg.firstChild);

  var styleEl = document.createElement("style");
  defsEl.appendChild(styleEl);
  styleEl.setAttribute("type", "text/css");

  // removing attributes so they aren't doubled up
  svg.removeAttribute("xmlns");
  svg.removeAttribute("xlink");

  // These are needed for the svg
  if (!svg.hasAttributeNS(prefix.xmlns, "xmlns")) {
    svg.setAttributeNS(prefix.xmlns, "xmlns", prefix.svg);
  }

  if (!svg.hasAttributeNS(prefix.xmlns, "xmlns:xlink")) {
    svg.setAttributeNS(prefix.xmlns, "xmlns:xlink", prefix.xlink);
  }

  var source = new XMLSerializer().serializeToString(svg).replace("</style>", "<![CDATA[" + styles + "]]></style>");
  var doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';
  var to_download = [doctype + source];
  var image_string = "data:image/svg+xml;base66," + encodeURIComponent(to_download);

  if (type == "png") {
    datamonkey_convert_svg_to_png(image_string);
  } else {
    var pom = document.createElement("a");
    pom.setAttribute("download", "phylotree.svg");
    pom.setAttribute("href", image_string);
    $("body").append(pom);
    pom.click();
    pom.remove();
  }
}

function datamonkey_validate_email(email) {
  if ($(this).find("input[name='receive_mail']")[0].checked) {
    var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if (regex.test($(this).find("input[name='mail']").val())) {
      // Give them green. They like that.
      $(this).removeClass("has-error");
      $(this).addClass("has-success");
      $(this).next(".help-block").remove();
    } else {
      $(this).next(".help-block").remove();
      $(this).removeClass("has-error");
      $(this).removeClass("has-success");
      $(this).addClass("has-error");
      jQuery("<span/>", {
        class: "help-block col-lg-9 pull-right",
        text: "Invalid Email"
      }).insertAfter($(this));
    }
  } else {
    $(this).removeClass("has-error");
    $(this).removeClass("has-success");
    $(this).next(".help-block").remove();
  }
}

function datamonkey_describe_vector(vector, as_list) {
  vector.sort(d3.ascending);

  var d = {
    min: d3.min(vector),
    max: d3.max(vector),
    median: d3.median(vector),
    Q1: d3.quantile(vector, 0.25),
    Q3: d3.quantile(vector, 0.75),
    mean: d3.mean(vector)
  };

  if (as_list) {
    d = "<pre>Range  :" + d["min"] + "-" + d["max"] + "\n" + "IQR    :" + d["Q1"] + "-" + d["Q3"] + "\n" + "Mean   :" + d["mean"] + "\n" + "Median :" + d["median"] + "\n" + "</pre>";

    /*d =
        "<dl class = 'dl-horizontal'>" +
        "<dt>Range</dt><dd>" + d['min'] + "-" + d['max'] + "</dd>" +
        "<dt>IQR</dt><dd>" + d['Q1'] + "-" + d['Q3'] +  "</dd>" +
        "<dt>Mean</dt><dd>" + d['mean'] +  "</dd>" +
        "<dt>Median</dt><dd>" + d['median'] + "</dd></dl>";*/
  }

  return d;
}

function datamonkey_export_handler(data, filename, mimeType) {
  function msieversion() {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
      return true;
    }
    return false;
  }

  if (msieversion()) {
    var IEwindow = window.open();
    IEwindow.document.write(data);
    IEwindow.document.close();
    IEwindow.document.execCommand("SaveAs", true, filename + ".csv");
    IEwindow.close();
  } else {
    var pom = document.createElement("a");
    pom.setAttribute("href", "data:" + (mimeType || "text/plain") + ";charset=utf-8," + encodeURIComponent(data));
    pom.setAttribute("download", filename || "download.tsv");
    pom.click();
    pom.remove();
  }
}

function datamonkey_table_to_text(table_id, sep) {
  sep = sep || "\t";
  var header_row = [];
  d3.select(table_id + " thead").selectAll("th").each(function () {
    header_row.push(d3.select(this).text());
  });
  var data_rows = [];
  d3.select(table_id + " tbody").selectAll("tr").each(function (d, i) {
    data_rows.push([]);
    d3.select(this).selectAll("td").each(function () {
      data_rows[i].push(d3.select(this).text());
    });
  });

  return header_row.join(sep) + "\n" + data_rows.map(function (d) {
    return d.join(sep);
  }).join("\n");
}

function datamonkey_capitalize(s) {
  if (s.length > 0) {
    return s[0].toUpperCase() + s.slice(1);
  } else {
    return s;
  }
}

function datamonkey_count_partitions(json) {
  try {
    return _.keys(json).length;
  } catch (e) {
    // ignore errors
  }
  return 0;
}

function datamonkey_sum(object, accessor) {
  accessor = accessor || function (value) {
    return value;
  };
  return _.reduce(object, function (sum, value, index) {
    return sum + accessor(value, index);
  }, 0);
}

function datamonkey_count_sites_from_partitions(json) {
  try {
    return datamonkey_sum(json["partitions"], function (value) {
      return value["coverage"][0].length;
    });
  } catch (e) {
    // ignore errors
  }
  return 0;
}

function datamonkey_filter_list(list, predicate, context) {
  var result = {};
  predicate = _.bind(predicate, context);
  _.each(list, _.bind(function (value, key) {
    if (predicate(value, key)) {
      result[key] = value;
    }
  }, context));
  return result;
}

function datamonkey_map_list(list, transform, context) {
  var result = {};
  transform = _.bind(transform, context);
  _.each(list, _.bind(function (value, key) {
    result[key] = transform(value, key);
  }, context));
  return result;
}

datamonkey.helpers = new Object();
datamonkey.helpers.save_newick_to_file = datamonkey_save_newick_to_file;
datamonkey.helpers.convert_svg_to_png = datamonkey_convert_svg_to_png;
datamonkey.helpers.save_newick_tree = datamonkey_save_newick_tree;
datamonkey.helpers.validate_email = datamonkey_validate_email;
datamonkey.helpers.describe_vector = datamonkey_describe_vector;
datamonkey.helpers.table_to_text = datamonkey_table_to_text;
datamonkey.helpers.export_handler = datamonkey_export_handler;
datamonkey.helpers.capitalize = datamonkey_capitalize;
datamonkey.helpers.countPartitionsJSON = datamonkey_count_partitions;
datamonkey.helpers.countSitesFromPartitionsJSON = datamonkey_count_sites_from_partitions;
datamonkey.helpers.sum = datamonkey_sum;
datamonkey.helpers.filter = datamonkey_filter_list;
datamonkey.helpers.map = datamonkey_map_list;

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var datamonkey_fade = function datamonkey_fade(json) {
  var _use_BF = false;

  var fade_results = json["results"]["FADE"];

  var dict_to_array = function dict_to_array(dict) {
    ar = [];
    for (var k in dict) {
      ar.push(dict[k]);
    }
    return ar;
  };

  var keys_in_dict = function keys_in_dict(dict) {
    ar = [];
    for (var k in dict) {
      ar.push(k);
    }
    return ar;
  };

  //For displaying table with Posteriors
  var display_column_map = function display_column_map(row) {
    var result = [parseInt(row[0])];

    for (var k = 4; k < row.length; k += 5) {
      result.push(row[k]);
    }
    return result;
  };

  //For displaying table with BFs
  var display_column_map_bf = function display_column_map_bf(row) {
    //result = [parseInt(row[0]),row[3]];
    var result = [parseInt(row[0])];

    for (var k = 5; k < row.length; k += 5) {
      result.push(row[k]);
    }
    return result;
  };

  var row_display_filter = function row_display_filter(d) {
    //Any row, with at least one val > thres must get displayed. Any elements greater must be in red.
    // if (d.slice(2).reduce (function (a,b) {return a+b;}) == 0.0) {return false;}
    //console.log (d, this);
    for (var k = 1; k < 21; k++) {
      if (d[k] > this) return true;
    }
    return false;
  };

  var initial_display = function initial_display() {
    $("#filter_on_pvalue").trigger("submit");
    plot_property_graphs("property_plot_svg", fade_results); //Using a matrix from html
  };

  var set_handlers = function set_handlers(file_id) {
    var fade_headers = [["Site", "A", "C", "D", "E", "F", "G", "H", "I", "K", "L", "M", "N", "P", "Q", "R", "S", "T", "V", "W", "Y"], ["Site", "Alanine", "Cysteine", "Aspartic acid", "Glutamic acid", "Phenylalanine", "Glycine", "Histidine", "Isoleucine", "Lysine", "Leucine", "Methionine", "Asparagine", "Proline", "Glutamine", "Arginine", "Serine", "Threonine", "Valine", "Tryptophan", "Tyrosin"]];

    var found = "";

    $("body").attr("data-job-id", file_id);
    $("#filter_on_pvalue").submit(function (e) {
      cutoff = parseFloat($("#pvalue")[0].value);
      if (_use_BF) {
        found = load_analysis_results("prime_table", fade_headers, fade_results, display_column_map_bf, row_display_filter);
      } else {
        found = load_analysis_results("prime_table", fade_headers, fade_results, display_column_map, row_display_filter);
      }
      d3.select("#total_sites_found").selectAll("span").data(found).html(function (d) {
        return d;
      });
      return false;
    });

    $("#site_rate_display").on("show", function (e) {
      //alert ("Show");
      //console.log (this);
      return true;
    });

    $("body").on("click", '[data-toggle="modal"]', function (event) {
      display_site_properties($(this).attr("data-codon-id"));
    });

    $("#set-p-value").click(function (event) {
      d3.select("#pq_selector").html("Posterior <span class='caret'></span>");
      _use_BF = false;
      event.preventDefault();
    });

    $("#set-q-value").click(function (event) {
      d3.select("#pq_selector").html("BF <span class='caret'></span>");
      _use_BF = true;
      event.preventDefault();
    });

    $("body").on("click", "#property_selector .btn", function (event) {
      event.stopPropagation(); // prevent default bootstrap behavior
      if ($(this).attr("data-toggle") != "button") {
        // don't toggle if data-toggle="button"
        $(this).toggleClass("active");
      }
      toggle_view("property_plot_svg", parseInt($(this).attr("data-property-id")), $(this).hasClass("active")); // button state AFTER the click
    });
  };

  var property_plot_done = false;

  var display_site_properties = function display_site_properties(site_id) {
    job_id = $("body").attr("data-job-id");
    url = "/cgi-bin/datamonkey/wrapHyPhyBF.pl?file=fade_site&mode=1&arguments=" + job_id + "-" + site_id;
    d3.json(url, function (json) {
      site_info(json, site_id);
    });
  };

  var toggle_view = function toggle_view(property_plot, group, show_hide) {
    if (show_hide) {
      prop = "visible";
    } else {
      prop = "hidden";
    }
    d3.select("#" + property_plot).selectAll(".dot" + group).style("visibility", prop);
  };

  var site_info = function site_info(values, site_id) {
    d3.select("#site_rate_display_header").html("Detailed information about site " + site_id);
    elements = dict_to_array(values);
    headers = keys_in_dict(elements[0]).sort();
    var header_element = d3.select("#site_info_table").select("thead");
    header_element.selectAll("th").remove();
    header_element.selectAll("th").data(headers).enter().append("th").html(function (d, i //Get header of table
    ) {
      return d;
    });
  };

  var plot_property_graphs = function plot_property_graphs(property_plot, property_info) {
    if (!property_plot_done) {
      property_info = property_info.map(display_column_map);
      property_plot_done = true;
      var site_count = property_info.length;

      //console.log (d3.extent (property_info.map(function (d){return d[0];})));

      var margin = { top: 20, right: 40, bottom: 30, left: 40 },
          width = 800 - margin.left - margin.right,
          height = 500 - margin.top - margin.bottom;

      var x = d3.scale.linear().range([0, width]);

      var y = d3.scale.linear().range([height, 0]);

      var color = d3.scale.category10();

      var xAxis = d3.svg.axis().scale(x).orient("bottom");

      var yAxis = d3.svg.axis().scale(y).orient("left");

      var yAxis2 = d3.svg.axis().scale(y).orient("right");

      var make_x_axis = function make_x_axis() {
        return d3.svg.axis().scale(x).orient("bottom").ticks(20);
      };

      var make_y_axis = function make_y_axis() {
        return d3.svg.axis().scale(y).orient("left").ticks(20);
      };

      var svg = d3.select("#" + property_plot).attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom).append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain([1, site_count]);
      y.domain([0, 1]);

      svg.append("g").attr("class", "x hyphy-axis").attr("transform", "translate(0," + height + ")").call(xAxis).append("text")
      //.attr("class", "label")
      .attr("x", width).attr("y", 30).style("text-anchor", "end").text("Site index");

      svg.append("g").attr("class", "grid").call(make_y_axis().tickSize(-width, 0, 0).tickFormat(""));

      svg.append("g").attr("class", "grid").attr("transform", "translate(0," + height + ")").call(make_x_axis().tickSize(-height, 0, 0).tickFormat(""));

      svg.append("g").attr("class", "y hyphy-axis").call(yAxis).append("text")
      //.attr("class", "label")
      .attr("transform", "rotate(-90)").attr("y", -37).attr("dy", ".71em").style("text-anchor", "end").text("P(Bias>1)");

      var y2 = svg.append("g").attr("class", "y hyphy-axis").attr("transform", "translate(" + width + ",0)").call(yAxis2.tickFormat(""));

      y2.append("text")
      //.attr("class", "label")
      .attr("transform", "rotate(-90)").attr("y", 10).attr("dy", ".71em").style("text-anchor", "end").text("High Posteriors");

      y2.append("text")
      //.attr("class", "label")
      .attr("transform", "rotate(-90)").attr("y", 10).attr("x", -height).attr("dy", ".71em").style("text-anchor", "start").text("Low Posteriors");

      svg.selectAll(".legend").data(color.domain()).enter().append("g").attr("class", "legend").attr("transform", function (d, i) {
        return "translate(0," + i * 20 + ")";
      });

      var h = {}; //Hash of numbers -> AA names for labels
      h[1] = "Alanine";
      h[2] = "Cysteine";
      h[3] = "Aspartic acid";
      h[4] = "Glutamic acid";
      h[5] = "Phenylalanine";
      h[6] = "Glycine";
      h[7] = "Histidine";
      h[8] = "Isoleucine";
      h[9] = "Lysine";
      h[10] = "Leucine";
      h[11] = "Methionine";
      h[12] = "Asparagine";
      h[13] = "Proline";
      h[14] = "Glutamine";
      h[15] = "Arginine";
      h[16] = "Serine";
      h[17] = "Threonine";
      h[18] = "Valine";
      h[19] = "Tryptophan";
      h[20] = "Tyrosine";

      var vis = "visible";
      for (var series = 1; series <= 20; series++) {
        if (series > 1) {
          vis = "hidden";
        }
        svg.selectAll(".dot" + series).data(property_info).enter().append("circle").attr("class", "dot" + series).attr("r", function (d) {
          if (d[series] == 0) return 1;
          return 3.5;
        }).attr("cx", function (d) {
          return x(d[0]);
        }).attr("cy", function (d) {
          return y(d[series]);
        }).style("fill", function (d) {
          return color(series);
        }).style("opacity", 0.5).style("visibility", vis).append("title").text(function (d) {
          return "Site " + d[0] + ", " + h[series] + " P(Beta>1) =" + d[series];
        });
        d3.select("#show_property" + series).style("color", function (d) {
          return color(series);
        }); //Colour buttons on HTML
      }
    }
  };

  var load_analysis_results = function load_analysis_results(id, headers, matrix, column_selector, condition) {
    var header_element = d3.select("#" + id).select("thead");
    header_element.selectAll("th").remove();
    header_element.selectAll("th").data(headers[0]).enter().append("th").html(function (d, i //Get header of table
    ) {
      return "<a href='#' data-toggle='tooltip' data-placement = 'right' data-html = true title data-original-title='" + headers[1][i] + "'>" + d + "</a>";
    });

    var parent_element = d3.select("#" + id).select("tbody");
    parent_element.selectAll("tr").remove();
    var filtered_matrix = matrix.map(column_selector).filter(condition, cutoff); //Get the columns to display in table
    var rows = parent_element.selectAll("tr").data(function (d) {
      return filtered_matrix;
    });
    var conserved = 0;
    rows.enter().append("tr").selectAll("td").data(function (d) {
      return d;
    }).enter().append("td").html(function (d, i) {
      d = parseFloat(d);
      if (i) {
        if (_use_BF == false) {
          if (d > 0.99) return "1.00";
          return d.toFixed(2);
        } else {
          if (d > 100) return "100+";
          return d.toFixed(1);
        }
      }
      return "<b>" + d + "</b> <a href='#site_rate_display' data-toggle='modal' data-codon-id = '" + d + "' data-placement = 'bottom'><i class='icon-list'></i></a>";
    }).classed("btn-danger", function (d, i, j) {
      if (d >= cutoff && i >= 1) {
        conserved++;
        return true;
      }
      return false;
    });

    d3.select("#" + id).classed("table-striped table-hover", true);
    $("a").tooltip();
    return [filtered_matrix.length, conserved];
  };

  set_handlers("test");
  initial_display();
};

module.exports = datamonkey_fade;

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _tree = __webpack_require__(10);

var _model_fits = __webpack_require__(13);

var _prop_chart = __webpack_require__(14);

var _navbar = __webpack_require__(4);

var _scrollspy = __webpack_require__(5);

var _tables = __webpack_require__(6);

var _saveSvgAsPng = __webpack_require__(17);

var _input_info = __webpack_require__(8);

__webpack_require__(11);
__webpack_require__(16);

var React = __webpack_require__(0),
    ReactDOM = __webpack_require__(3),
    d3 = __webpack_require__(7),
    d3_save_svg = __webpack_require__(15);

var datamonkey = __webpack_require__(2);
var _ = __webpack_require__(1);

var BUSTEDSummary = React.createClass({
  displayName: "BUSTEDSummary",

  render: function render() {
    var significant = this.props.test_result.p < 0.05,
        message;
    if (significant) {
      message = React.createElement(
        "p",
        null,
        "BUSTED ",
        React.createElement(
          "strong",
          { className: "hyphy-highlight" },
          "found evidence"
        ),
        " ",
        "(LRT, p-value \u2264 .05) of gene-wide episodic diversifying selection in the selected foreground of your phylogeny. Therefore, there is evidence that at least one site on at least one foreground branch has experienced diversifying selection.",
        " "
      );
    } else {
      message = React.createElement(
        "p",
        null,
        "BUSTED ",
        React.createElement(
          "strong",
          { className: "hyphy-highlight" },
          "found no evidence"
        ),
        " ",
        "(LRT, p-value \u2264 .05) of gene-wide episodic diversifying selection in the selected foreground of your phylogeny. Therefore, there is no evidence that any sites have experienced diversifying selection along the foreground branch(es).",
        " "
      );
    }
    return React.createElement(
      "div",
      { className: "row", id: "summary-div" },
      React.createElement(
        "div",
        { className: "col-md-12" },
        React.createElement(
          "h3",
          { className: "list-group-item-heading" },
          React.createElement(
            "span",
            { className: "summary-method-name" },
            "Branch-Site Unrestricted Statistical Test for Episodic Diversification"
          ),
          React.createElement("br", null),
          React.createElement(
            "span",
            { className: "results-summary" },
            "results summary"
          )
        )
      ),
      React.createElement(
        "div",
        { className: "col-md-12" },
        React.createElement(_input_info.InputInfo, { input_data: this.props.input_data })
      ),
      React.createElement(
        "div",
        { className: "col-md-12" },
        React.createElement(
          "div",
          { className: "main-result" },
          message,
          React.createElement("hr", null),
          React.createElement(
            "p",
            null,
            React.createElement(
              "small",
              null,
              "See",
              " ",
              React.createElement(
                "a",
                { href: "http://hyphy.org/methods/selection-methods/#busted" },
                "here"
              ),
              " ",
              "for more information about the BUSTED method.",
              React.createElement("br", null),
              "Please cite",
              " ",
              React.createElement(
                "a",
                {
                  href: "http://www.ncbi.nlm.nih.gov/pubmed/25701167",
                  id: "summary-pmid",
                  target: "_blank"
                },
                "PMID 25701167"
              ),
              " ",
              "if you use this result in a publication, presentation, or other scientific work."
            )
          )
        )
      )
    );
  }
});

var BUSTEDSiteChartAndTable = React.createClass({
  displayName: "BUSTEDSiteChartAndTable",

  getInitialState: function getInitialState() {
    return {
      lower_site_range: 0,
      upper_site_range: null,
      constrained_evidence_ratio_threshold: "-Infinity",
      optimized_null_evidence_ratio_threshold: "-Infinity",
      brushend_event: false
    };
  },
  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({
      upper_site_range: nextProps.data.length + 1,
      brushend_event: false
    });
  },
  componentDidUpdate: function componentDidUpdate() {
    if (!this.state.brushend_event) {
      d3.select("#chart-id").html("");
      this.drawChart();
    }
  },
  componentDidMount: function componentDidMount() {
    d3.select("#export-chart-png").on("click", function (e) {
      (0, _saveSvgAsPng.saveSvgAsPng)(document.getElementById("chart"), "busted-chart.png");
    });
    d3.select("#export-chart-svg").on("click", function (e) {
      d3_save_svg.save(d3.select("#chart").node(), { filename: "busted" });
    });
  },
  drawChart: function drawChart() {
    var self = this,
        number_of_sites = this.props.data.length,
        margin = { top: 20, right: 20, bottom: 40, left: 50 },
        width = $("#chart-id").width() - margin.left - margin.right,
        height = 270 - margin.top - margin.bottom,
        ymin = d3.min(self.props.data.map(function (d) {
      return Math.min(d.constrained_evidence_ratio, d.optimized_null_evidence_ratio);
    })),
        ymax = d3.max(self.props.data.map(function (d) {
      return Math.max(d.constrained_evidence_ratio, d.optimized_null_evidence_ratio);
    })),
        x = d3.scale.linear().domain([0, number_of_sites]).range([0, width]),
        y = d3.scale.linear().domain([ymin, ymax]).range([height, 0]),
        yAxisTicks = d3.range(5 * Math.ceil(ymin / 5), 5 * Math.floor(ymax / 5) + 1, 5),
        xAxis = d3.svg.axis().scale(x).orient("bottom").tickValues(d3.range(5, number_of_sites, 5)),
        yAxis = d3.svg.axis().scale(y).orient("left").tickValues(yAxisTicks),
        cer_line = d3.svg.line().x(function (d, i) {
      return x(d.site_index);
    }).y(function (d, i) {
      return y(d.constrained_evidence_ratio);
    }),
        oner_line = d3.svg.line().x(function (d, i) {
      return x(d.site_index);
    }).y(function (d, i) {
      return y(d.optimized_null_evidence_ratio);
    }),
        svg = d3.select("#chart-id").append("svg").attr("id", "chart").attr("width", width + margin.left + margin.right).attr("height", height + margin.top + margin.bottom);

    svg.append("rect").attr("width", "100%").attr("height", "100%").attr("fill", "white");

    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    g.selectAll(".axis-line").data(yAxisTicks).enter().append("line").attr("x1", 0).attr("x2", width).attr("y1", function (d) {
      return y(d);
    }).attr("y2", function (d) {
      return y(d);
    }).style("stroke", "#eee").style("stroke-width", 1);
    g.append("path").attr("class", "line").attr("d", oner_line(self.props.data)).style("fill", "none").style("stroke-width", 2).style("stroke", "#000");
    g.append("path").attr("class", "line").attr("d", cer_line(self.props.data)).style("fill", "none").style("stroke-width", 2).style("stroke", "#00a99d");
    g.append("g").attr("class", "x axis").attr("transform", "translate(0," + height + ")").call(xAxis);
    g.append("text").attr("x", width / 2).attr("y", height + margin.bottom).style("text-anchor", "middle").text("Site index");
    g.append("g").attr("class", "y axis").call(yAxis);
    g.append("text").attr("transform", "rotate(-90)").attr("x", -height / 2).attr("y", -margin.left).attr("dy", "1em").style("text-anchor", "middle").text("2*Logarithm of evidence ratio");
    var c_legend = svg.append("g").attr("class", "legend").attr("transform", "translate( " + 0.8 * width + "," + 0.05 * height + ")").attr("text-anchor", "end");
    c_legend.append("text").text("Constrained").attr("x", 115).attr("y", 7.5).attr("dy", ".32em");
    c_legend.append("rect").attr("width", 15).attr("height", 15).attr("fill", "#00a99d");
    var on_legend = svg.append("g").attr("class", "legend").attr("transform", "translate( " + 0.8 * width + "," + 0.15 * height + ")").attr("text-anchor", "end");
    on_legend.append("text").text("Optimized Null").attr("x", 135).attr("y", 7.5).attr("dy", ".32em");
    on_legend.append("rect").attr("width", 15).attr("height", 15).attr("fill", "#000");

    function brushend() {
      var extent = brush.extent();
      if (extent[0] != extent[1]) {
        self.setState({
          lower_site_range: extent[0],
          upper_site_range: extent[1],
          brushend_event: true
        });
      } else {
        self.setState({
          lower_site_range: 0,
          upper_site_range: self.props.data.length + 1,
          brushend_event: true
        });
      }
    }

    var brush = d3.svg.brush().x(x).on("brushend", brushend);

    g.append("g").attr("class", "brush").call(brush).selectAll("rect").attr("height", height);
  },
  handleONERChange: function handleONERChange(event) {
    if (/^-?[0-9]*(\.[0-9]*)?$/.test(event.target.value)) {
      this.setState({
        optimized_null_evidence_ratio_threshold: event.target.value
      });
    } else if (event.target.value == "-I") {
      this.setState({
        optimized_null_evidence_ratio_threshold: "-Infinity"
      });
    } else if (event.target.value == "-Infinit") {
      this.setState({
        optimized_null_evidence_ratio_threshold: ""
      });
    }
  },
  handleONERFocus: function handleONERFocus(event) {
    this.setState({
      optimized_null_evidence_ratio_threshold: ""
    });
  },
  handleONERBlur: function handleONERBlur(event) {
    if (!event.target.value) {
      this.setState({
        optimized_null_evidence_ratio_threshold: "-Infinity"
      });
    }
  },
  handleCERChange: function handleCERChange(event) {
    if (/^-?[0-9]*(\.[0-9]*)?$/.test(event.target.value)) {
      this.setState({
        constrained_evidence_ratio_threshold: event.target.value
      });
    } else if (event.target.value == "-I") {
      this.setState({
        constrained_evidence_ratio_threshold: "-Infinity"
      });
    } else if (event.target.value == "-Infinit") {
      this.setState({
        constrained_evidence_ratio_threshold: ""
      });
    }
  },
  handleCERFocus: function handleCERFocus(event) {
    this.setState({
      constrained_evidence_ratio_threshold: ""
    });
  },
  handleCERBlur: function handleCERBlur(event) {
    if (!event.target.value) {
      this.setState({
        constrained_evidence_ratio_threshold: "-Infinity"
      });
    }
  },
  headerData: [{
    abbr: "Position of site in multiple sequence alignment.",
    sortable: true,
    value: "Site index"
  }, {
    abbr: "Likelihood of unconstrained model.",
    sortable: true,
    value: "Unconstrained likelihood"
  }, {
    abbr: "Likelihood of constrained model.",
    sortable: true,
    value: "Constrained likelihood"
  },, "Optimized Null Likelihood", "Constrained Statistic", "Optimized Null Statistic"],
  render: function render() {
    var self = this,
        float_format = d3.format(".2f"),
        bodyData = _.filter(this.props.data, function (element, index) {
      var valid_optimized_null_evidence_ratio = _.contains(["-Infinity", "", "-"], self.state.optimized_null_evidence_ratio_threshold) || element.optimized_null_evidence_ratio > +self.state.optimized_null_evidence_ratio_threshold,
          valid_constrained_evidence_ratio = _.contains(["-Infinity", "", "-"], self.state.constrained_evidence_ratio_threshold) || element.constrained_evidence_ratio > +self.state.constrained_evidence_ratio_threshold,
          valid_ers = valid_constrained_evidence_ratio && valid_optimized_null_evidence_ratio,
          valid_site = element.site_index > self.state.lower_site_range && element.site_index < self.state.upper_site_range;
      return valid_ers && valid_site;
    }).map(function (row) {
      return _.values(row).map(function (d, i) {
        return i != 0 ? +float_format(d) : +d;
      });
    });
    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "row hyphy-busted-site-table" },
        React.createElement(
          "div",
          { className: "col-md-12" },
          React.createElement(
            "h4",
            { className: "dm-table-header" },
            "Model Test Statistics Per Site",
            React.createElement("span", {
              className: "glyphicon glyphicon-info-sign",
              style: { verticalAlign: "middle", float: "right" },
              "aria-hidden": "true",
              "data-toggle": "popover",
              "data-trigger": "hover",
              title: "Actions",
              "data-html": "true",
              "data-content": "<ul><li>Hover over a column header for a description of its content.</li></ul>",
              "data-placement": "bottom"
            })
          )
        ),
        React.createElement(
          "div",
          { className: "col-lg-12" },
          React.createElement(
            "button",
            {
              id: "export-chart-svg",
              type: "button",
              className: "btn btn-default btn-sm pull-right btn-export"
            },
            React.createElement("span", { className: "glyphicon glyphicon-floppy-save" }),
            " Export Chart to SVG"
          ),
          React.createElement(
            "button",
            {
              id: "export-chart-png",
              type: "button",
              className: "btn btn-default btn-sm pull-right btn-export"
            },
            React.createElement("span", { className: "glyphicon glyphicon-floppy-save" }),
            " Export Chart to PNG"
          )
        ),
        React.createElement("div", { id: "chart-id", className: "col-lg-12" })
      ),
      React.createElement(
        "div",
        { className: "row site-table" },
        React.createElement(
          "div",
          { className: "col-lg-6" },
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement(
              "label",
              { "for": "er-constrained-threshold" },
              "Constrained Test Statistic"
            ),
            React.createElement("input", {
              type: "text",
              className: "form-control",
              id: "er-constrained-threshold",
              value: this.state.constrained_evidence_ratio_threshold,
              onChange: this.handleCERChange,
              onFocus: this.handleCERFocus,
              onBlur: this.handleCERBlur
            })
          )
        ),
        React.createElement(
          "div",
          { className: "col-lg-6" },
          React.createElement(
            "div",
            { className: "form-group" },
            React.createElement(
              "label",
              { "for": "er-optimized-null-threshold" },
              "Optimized Null Test Statistic"
            ),
            React.createElement("input", {
              type: "text",
              className: "form-control",
              id: "er-optimized-null-threshold",
              value: this.state.optimized_null_evidence_ratio_threshold,
              onChange: this.handleONERChange,
              onFocus: this.handleONERFocus,
              onBlur: this.handleONERBlur
            })
          )
        ),
        React.createElement(
          "div",
          { className: "col-lg-12" },
          React.createElement(_tables.DatamonkeyTable, {
            headerData: this.headerData,
            bodyData: bodyData,
            paginate: Math.min(20, bodyData.length),
            initialSort: 0,
            classes: "table table-condensed table-striped",
            export_csv: true
          })
        )
      )
    );
  }

});

var BUSTED = React.createClass({
  displayName: "BUSTED",

  float_format: d3.format(".2f"),
  p_value_format: d3.format(".4f"),
  fit_format: d3.format(".2f"),

  loadFromServer: function loadFromServer() {
    var self = this;

    d3.json(this.props.url, function (data) {
      data["fits"]["Unconstrained model"]["branch-annotations"] = self.formatBranchAnnotations(data, "Unconstrained model");
      data["fits"]["Constrained model"]["branch-annotations"] = self.formatBranchAnnotations(data, "Constrained model");

      // rename rate distributions
      data["fits"]["Unconstrained model"]["rate-distributions"] = data["fits"]["Unconstrained model"]["rate distributions"];
      data["fits"]["Constrained model"]["rate-distributions"] = data["fits"]["Constrained model"]["rate distributions"];

      // set display order
      data["fits"]["Unconstrained model"]["display-order"] = 0;
      data["fits"]["Constrained model"]["display-order"] = 1;

      var json = data,
          pmid = "25701167",
          pmid_text = "PubMed ID " + pmid,
          pmid_href = "http://www.ncbi.nlm.nih.gov/pubmed/" + pmid,
          p = json["test results"]["p"],
          statement = p <= 0.05 ? "evidence" : "no evidence";

      var fg_rate = json["fits"]["Unconstrained model"]["rate distributions"]["FG"];
      var mapped_omegas = {
        omegas: _.map(fg_rate, function (d) {
          return _.object(["omega", "prop"], d);
        })
      };

      self.setState({
        p: p,
        test_result: {
          statement: statement,
          p: p
        },
        json: json,
        omegas: mapped_omegas["omegas"],
        pmid: {
          text: pmid_text,
          href: pmid_href
        },
        input_data: data["input_data"],
        evidence_ratio_data: _.map(_.range(data.input_data["sites"]), function (i) {
          return {
            site_index: i + 1,
            unconstrained_likelihood: data["profiles"]["unconstrained"][0][i],
            constained_likelihood: data["profiles"]["constrained"][0][i],
            optimized_null_likelihood: data["profiles"]["optimized null"][0][i],
            constrained_evidence_ratio: 2 * Math.log(data["evidence ratios"]["constrained"][0][i]),
            optimized_null_evidence_ratio: 2 * Math.log(data["evidence ratios"]["optimized null"][0][i])
          };
        })
      });
    });
  },

  colorGradient: ["red", "green"],
  grayScaleGradient: ["#444444", "#000000"],

  getDefaultProps: function getDefaultProps() {

    var edgeColorizer = function edgeColorizer(element, data, foreground_color) {

      var is_foreground = data.target.annotations.is_foreground,
          color_fill = foreground_color(0);

      element.style("stroke", is_foreground ? color_fill : "gray").style("stroke-linejoin", "round").style("stroke-linejoin", "round").style("stroke-linecap", "round");
    };

    var tree_settings = {
      omegaPlot: {},
      "tree-options": {
        /* value arrays have the following meaning
                [0] - the value of the attribute
                [1] - does the change in attribute value trigger tree re-layout?
            */
        "hyphy-tree-model": ["Unconstrained model", true],
        "hyphy-tree-highlight": ["RELAX.test", false],
        "hyphy-tree-branch-lengths": [true, true],
        "hyphy-tree-hide-legend": [true, false],
        "hyphy-tree-fill-color": [true, false]
      },
      "hyphy-tree-legend-type": "discrete",
      "suppress-tree-render": false,
      "chart-append-html": true,
      edgeColorizer: edgeColorizer
    };

    var distro_settings = {
      dimensions: { width: 600, height: 400 },
      margins: { left: 50, right: 15, bottom: 35, top: 35 },
      legend: false,
      domain: [0.00001, 100],
      do_log_plot: true,
      k_p: null,
      plot: null,
      svg_id: "prop-chart"
    };

    return {
      distro_settings: distro_settings,
      tree_settings: tree_settings,
      constrained_threshold: "Infinity",
      null_threshold: "-Infinity",
      model_name: "FG"
    };
  },

  getInitialState: function getInitialState() {
    return {
      p: null,
      test_result: {
        statement: null,
        p: null
      },
      json: null,
      omegas: null,
      pmid: {
        href: null,
        text: null
      },
      input_data: null,
      table_rows: []
    };
  },

  setEvents: function setEvents() {
    var self = this;

    $("#json-file").on("change", function (e) {
      var files = e.target.files; // FileList object
      if (files.length == 1) {
        var f = files[0];
        var reader = new FileReader();
        reader.onload = function (theFile) {
          return function (e) {
            var data = JSON.parse(this.result);
            data["fits"]["Unconstrained model"]["branch-annotations"] = self.formatBranchAnnotations(data, "Unconstrained model");
            data["fits"]["Constrained model"]["branch-annotations"] = self.formatBranchAnnotations(data, "Constrained model");

            // rename rate distributions
            data["fits"]["Unconstrained model"]["rate-distributions"] = data["fits"]["Unconstrained model"]["rate distributions"];
            data["fits"]["Constrained model"]["rate-distributions"] = data["fits"]["Constrained model"]["rate distributions"];

            var json = data,
                pmid = "25701167",
                pmid_text = "PubMed ID " + pmid,
                pmid_href = "http://www.ncbi.nlm.nih.gov/pubmed/" + pmid,
                p = json["test results"]["p"],
                statement = p <= 0.05 ? "evidence" : "no evidence";

            var fg_rate = json["fits"]["Unconstrained model"]["rate distributions"]["FG"];
            var mapped_omegas = {
              omegas: _.map(fg_rate, function (d) {
                return _.object(["omega", "prop"], d);
              })
            };

            self.setState({
              p: p,
              test_result: {
                statement: statement,
                p: p
              },
              json: json,
              omegas: mapped_omegas["omegas"],
              pmid: {
                text: pmid_text,
                href: pmid_href
              },
              input_data: data["input_data"]
            });
          };
        }(f);
        reader.readAsText(f);
      }
      $("#json-file").dropdown("toggle");
      e.preventDefault();
    });
  },

  formatBranchAnnotations: function formatBranchAnnotations(json, key) {
    // attach is_foreground to branch annotations
    var foreground = json["test set"].split(",");

    var tree = d3.layout.phylotree(),
        nodes = tree(json["fits"][key]["tree string"]).get_nodes(),
        node_names = _.map(nodes, function (d) {
      return d.name;
    });

    // Iterate over objects
    var branch_annotations = _.object(node_names, _.map(node_names, function (d) {
      return { is_foreground: _.indexOf(foreground, d) > -1 };
    }));

    return branch_annotations;
  },

  initialize: function initialize() {
    var json = this.state.json;

    if (!json) {
      return;
    }

    // delete existing tree
    d3.select("#tree_container").select("svg").remove();

    $("#export-dist-svg").on("click", function (e) {
      datamonkey.save_image("svg", "#primary-omega-dist");
    });

    $("#export-dist-png").on("click", function (e) {
      datamonkey.save_image("png", "#primary-omega-dist");
    });
  },

  componentWillMount: function componentWillMount() {
    this.loadFromServer();
    this.setEvents();
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    $("body").scrollspy({
      target: ".bs-docs-sidebar",
      offset: 50
    });
    $('[data-toggle="popover"]').popover();
  },


  render: function render() {

    var self = this;
    self.initialize();
    var scrollspy_info = [{ label: "summary", href: "summary-div" }, { label: "model statistics", href: "hyphy-model-fits" }, { label: "input tree", href: "phylogenetic-tree" }, { label: "ω distribution", href: "primary-omega-dist" }];

    var models = {};
    if (!_.isNull(self.state.json)) {
      models = self.state.json.fits;
    }

    return React.createElement(
      "div",
      null,
      React.createElement(_navbar.NavBar, null),
      React.createElement(
        "div",
        { className: "container" },
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(_scrollspy.ScrollSpy, { info: scrollspy_info }),
          React.createElement(
            "div",
            { className: "col-lg-10" },
            React.createElement(
              "div",
              { id: "results" },
              React.createElement(
                "div",
                { id: "summary-tab" },
                React.createElement(BUSTEDSummary, {
                  test_result: this.state.test_result,
                  pmid: this.state.pmid,
                  input_data: self.state.input_data
                })
              )
            ),
            React.createElement(
              "div",
              { className: "row" },
              React.createElement(
                "div",
                { id: "hyphy-model-fits", className: "col-lg-12" },
                React.createElement(_model_fits.ModelFits, { json: self.state.json }),
                React.createElement(
                  "p",
                  { className: "description" },
                  "This table reports a statistical summary of the models fit to the data. Here, ",
                  React.createElement(
                    "strong",
                    null,
                    "Unconstrained model"
                  ),
                  " ",
                  "refers to the BUSTED alternative model for selection, and",
                  " ",
                  React.createElement(
                    "strong",
                    null,
                    "Constrained model"
                  ),
                  " refers to the BUSTED null model for selection."
                )
              )
            ),
            React.createElement(BUSTEDSiteChartAndTable, { data: this.state.evidence_ratio_data }),
            React.createElement(
              "div",
              { className: "row" },
              React.createElement(
                "div",
                { className: "col-md-12", id: "phylogenetic-tree" },
                React.createElement(_tree.Tree, {
                  json: self.state.json,
                  settings: self.props.tree_settings,
                  models: models,
                  color_gradient: self.colorGradient,
                  grayscale_gradient: self.grayscaleGradient
                })
              ),
              React.createElement(
                "div",
                { className: "col-md-12" },
                React.createElement(
                  "h4",
                  { className: "dm-table-header" },
                  "\u03C9 distribution"
                ),
                React.createElement(
                  "div",
                  { id: "primary-omega-dist", className: "panel-body" },
                  React.createElement(_prop_chart.PropChart, {
                    name: self.props.model_name,
                    omegas: self.state.omegas,
                    settings: self.props.distro_settings
                  })
                )
              )
            )
          ),
          React.createElement("div", { className: "col-lg-1" })
        )
      )
    );
  }
});

// Will need to make a call to this
// omega distributions
var render_busted = function render_busted(url, element) {
  ReactDOM.render(React.createElement(BUSTED, { url: url }), document.getElementById(element));
};

module.exports = render_busted;

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _prop_chart = __webpack_require__(14);

var React = __webpack_require__(0);


var BranchTable = React.createClass({
  displayName: "BranchTable",

  getInitialState: function getInitialState() {
    // add the following
    var table_row_data = this.getBranchRows(this.props.tree, this.props.test_results, this.props.annotations),
        initial_model_name = _.take(_.keys(this.props.annotations)),
        initial_omegas = this.props.annotations ? this.props.annotations[initial_model_name]["omegas"] : null;

    var distro_settings = {
      dimensions: {
        width: 600,
        height: 400
      },
      margins: {
        left: 50,
        right: 15,
        bottom: 15,
        top: 35
      },
      legend: false,
      domain: [0.00001, 10000],
      do_log_plot: true,
      k_p: null,
      plot: null,
      svg_id: "prop-chart"
    };

    return {
      tree: this.props.tree,
      test_results: this.props.test_results,
      annotations: this.props.annotations,
      table_row_data: table_row_data,
      current_model_name: initial_model_name,
      current_omegas: initial_omegas,
      distro_settings: distro_settings
    };
  },

  getBranchLength: function getBranchLength(m, tree) {
    if (tree.get_node_by_name(m)) return d3.format(".4f")(tree.get_node_by_name(m).attribute);
    return "";
  },

  getLRT: function getLRT(branch) {
    var formatted = d3.format(".4f")(branch["LRT"]);
    if (formatted == "NaN") {
      return branch["LRT"];
    } else {
      return formatted;
    }
  },

  getPVal: function getPVal(branch) {
    return d3.format(".4f")(branch["p"]);
  },

  getUncorrectedPVal: function getUncorrectedPVal(branch) {
    return d3.format(".4f")(branch["uncorrected p"]);
  },

  getOmegaDistribution: function getOmegaDistribution(m, annotations) {
    if (!annotations) {
      return "";
    }

    var omega_string = "";

    for (var i in annotations[m]["omegas"]) {
      var omega = parseFloat(annotations[m]["omegas"][i]["omega"]);
      var formatted_omega = "∞";
      if (omega < 1e20) {
        formatted_omega = d3.format(".3r")(omega);
      }
      omega_string += "&omega;<sub>" + (parseInt(i) + 1) + "</sub> = " + formatted_omega + " (" + d3.format(".2p")(annotations[m]["omegas"][i]["prop"]) + ")<br/>";
    }

    return omega_string;
  },

  getBranchRows: function getBranchRows(tree, test_results, annotations) {
    var table_row_data = [];

    for (var m in test_results) {
      var branch_row = [];
      var branch = test_results[m];

      branch_row = [m, this.getBranchLength(m, tree), this.getLRT(branch), this.getPVal(branch), this.getUncorrectedPVal(branch), this.getOmegaDistribution(m, annotations)];

      table_row_data.push(branch_row);
    }

    table_row_data.sort(function (a, b) {
      if (a[2] == "test not run" && b[2] != "test not run") return 1;
      if (a[2] != "test not run" && b[2] == "test not run") return -1;

      if (a[0] == b[0]) {
        return a[1] < b[1] ? -1 : a[1] == b[1] ? 0 : 1;
      }

      return a[3] - b[3];
    });

    return table_row_data;
  },

  setEvents: function setEvents() {
    var self = this;

    if (self.state.annotations) {
      var branch_table = d3.select("#table-branch-table").selectAll("tr");

      branch_table.on("click", function (d) {
        var label = d[0];
        self.setState({
          current_model_name: label,
          current_omegas: self.state.annotations[label]["omegas"]
        });
        $("#myModal").modal("show");
      });
    }
  },

  createDistroChart: function createDistroChart() {
    this.settings = {
      dimensions: {
        width: 600,
        height: 400
      },
      margins: {
        left: 50,
        right: 15,
        bottom: 15,
        top: 15
      },
      has_zeros: true,
      legend_id: null,
      do_log_plot: true,
      k_p: null,
      plot: null,
      svg_id: "prop-chart"
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var table_row_data = this.getBranchRows(nextProps.tree, nextProps.test_results, nextProps.annotations),
        initial_model_name = _.take(_.keys(nextProps.annotations)),
        initial_omegas = nextProps.annotations ? nextProps.annotations[initial_model_name]["omegas"] : null;

    var distro_settings = {
      dimensions: {
        width: 600,
        height: 400
      },
      margins: {
        left: 50,
        right: 15,
        bottom: 15,
        top: 15
      },
      legend: false,
      domain: [0.00001, 10000],
      do_log_plot: true,
      k_p: null,
      plot: null,
      svg_id: "prop-chart"
    };

    if (nextProps.test_results && nextProps.annotations) {
      this.setState({
        tree: nextProps.tree,
        test_results: nextProps.test_results,
        annotations: nextProps.annotations,
        table_row_data: table_row_data,
        current_model_name: initial_model_name,
        current_omegas: initial_omegas,
        distro_settings: distro_settings
      });
    }
  },

  componentDidUpdate: function componentDidUpdate() {
    var branch_rows = d3.select("#table-branch-table").selectAll("tr").data(this.state.table_row_data);

    branch_rows.enter().append("tr");
    branch_rows.exit().remove();
    branch_rows.style("font-weight", function (d) {
      return d[3] <= 0.05 ? "bold" : "normal";
    });

    branch_rows = branch_rows.selectAll("td").data(function (d) {
      return d;
    });

    branch_rows.enter().append("td");
    branch_rows.html(function (d) {
      return d;
    });

    this.createDistroChart();
    this.setEvents();
  },

  render: function render() {
    var self = this;

    return React.createElement(
      "div",
      { className: "row" },
      React.createElement(
        "div",
        { id: "hyphy-branch-table", className: "col-md-12" },
        React.createElement(
          "h4",
          { className: "dm-table-header" },
          "Detailed results",
          React.createElement("span", {
            className: "glyphicon glyphicon-info-sign",
            style: { verticalAlign: "middle", float: "right" },
            "aria-hidden": "true",
            "data-toggle": "popover",
            "data-trigger": "hover",
            title: "Detailed results",
            "data-html": "true",
            "data-content": "<ul><li><strong>Bolded rows</strong> correspond to positively-selected branches at P \u2264 0.05.</li><li>Click on a row to see a visualization of its inferred rate distribution.</li><li>Hover over a column header for a description of its content.</li></ul>",
            "data-placement": "bottom"
          })
        ),
        React.createElement(
          "table",
          { className: "table table-hover table-condensed dm-table" },
          React.createElement(
            "thead",
            { id: "table-branch-header" },
            React.createElement(
              "tr",
              null,
              React.createElement(
                "th",
                null,
                React.createElement(
                  "span",
                  {
                    "data-toggle": "tooltip",
                    title: "Branch of interest",
                    "data-placement": "top"
                  },
                  "Name"
                )
              ),
              React.createElement(
                "th",
                null,
                React.createElement(
                  "span",
                  { "data-toggle": "tooltip", title: "Optimized branch length" },
                  "B",
                  " "
                )
              ),
              React.createElement(
                "th",
                null,
                React.createElement(
                  "span",
                  {
                    "data-toggle": "tooltip",
                    title: "Likelihood ratio test statistic for selection"
                  },
                  "LRT"
                )
              ),
              React.createElement(
                "th",
                null,
                React.createElement(
                  "span",
                  {
                    "data-toggle": "tooltip",
                    title: "P-value corrected for multiple testing"
                  },
                  "Test p-value"
                )
              ),
              React.createElement(
                "th",
                null,
                React.createElement(
                  "span",
                  {
                    "data-toggle": "tooltip",
                    title: "Raw P-value without correction for multiple testing"
                  },
                  "Uncorrected p-value"
                )
              ),
              React.createElement(
                "th",
                null,
                React.createElement(
                  "span",
                  {
                    "data-toggle": "tooltip",
                    title: "Inferred \u03C9 estimates and respective proportion of sites"
                  },
                  "\u03C9 distribution over sites"
                )
              )
            )
          ),
          React.createElement("tbody", { id: "table-branch-table" })
        )
      ),
      React.createElement(
        "div",
        {
          className: "modal fade",
          id: "myModal",
          tabIndex: "-1",
          role: "dialog",
          "aria-labelledby": "myModalLabel"
        },
        React.createElement(
          "div",
          { className: "modal-dialog", role: "document" },
          React.createElement(
            "div",
            { className: "modal-content" },
            React.createElement(
              "div",
              { className: "modal-header" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "close",
                  "data-dismiss": "modal",
                  "aria-label": "Close"
                },
                React.createElement(
                  "span",
                  { "aria-hidden": "true" },
                  "\xD7"
                )
              ),
              React.createElement(
                "h4",
                { className: "modal-title", id: "myModalLabel" },
                "aBSREL Site Proportion Chart"
              )
            ),
            React.createElement(
              "div",
              { className: "modal-body", id: "modal-body" },
              React.createElement(
                "h4",
                { className: "dm-table-header" },
                "\u03C9 distribution"
              ),
              React.createElement(_prop_chart.PropChart, {
                name: self.state.current_model_name,
                omegas: self.state.current_omegas,
                settings: self.state.distro_settings
              })
            ),
            React.createElement(
              "div",
              { className: "modal-footer" },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "btn btn-default",
                  "data-dismiss": "modal"
                },
                "Close"
              )
            )
          )
        )
      ),
      React.createElement(
        "div",
        { className: "col-md-12" },
        React.createElement("p", { className: "description" })
      )
    );
  }
});

// Will need to make a call to this
// omega distributions
function render_branch_table(tree, test_results, annotations, element) {
  React.render(React.createElement(BranchTable, {
    tree: tree,
    test_results: test_results,
    annotations: annotations
  }), $(element)[0]);
}

// Will need to make a call to this
// omega distributions
function rerender_branch_table(tree, test_results, annotations, element) {
  $(element).empty();
  render_branch_table(tree, test_results, annotations, element);
}

module.exports.BranchTable = BranchTable;
module.exports.render_branch_table = render_branch_table;
module.exports.rerender_branch_table = rerender_branch_table;

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = __webpack_require__(0);

var ErrorMessage = function (_React$Component) {
  _inherits(ErrorMessage, _React$Component);

  function ErrorMessage() {
    _classCallCheck(this, ErrorMessage);

    return _possibleConstructorReturn(this, (ErrorMessage.__proto__ || Object.getPrototypeOf(ErrorMessage)).apply(this, arguments));
  }

  _createClass(ErrorMessage, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "div",
        {
          id: "datamonkey-absrel-error",
          className: "alert alert-danger alert-dismissible",
          role: "alert",
          style: { display: "none" }
        },
        React.createElement(
          "button",
          {
            type: "button",
            className: "close",
            id: "datamonkey-absrel-error-hide"
          },
          React.createElement(
            "span",
            { "aria-hidden": "true" },
            "\xD7"
          ),
          React.createElement(
            "span",
            { className: "sr-only" },
            "Close"
          )
        ),
        React.createElement(
          "strong",
          null,
          "Error!"
        ),
        " ",
        React.createElement("span", { id: "datamonkey-absrel-error-text" })
      );
    }
  }]);

  return ErrorMessage;
}(React.Component);

module.exports.ErrorMessage = ErrorMessage;

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = __webpack_require__(0);

var Header = function (_React$Component) {
  _inherits(Header, _React$Component);

  function Header() {
    _classCallCheck(this, Header);

    return _possibleConstructorReturn(this, (Header.__proto__ || Object.getPrototypeOf(Header)).apply(this, arguments));
  }

  _createClass(Header, [{
    key: "render",
    value: function render() {
      return React.createElement(
        "h4",
        { className: "dm-table-header" },
        this.props.title,
        React.createElement("span", {
          className: "glyphicon glyphicon-info-sign",
          style: { verticalAlign: "middle", float: "right" },
          "aria-hidden": "true",
          "data-toggle": "popover",
          "data-trigger": "hover",
          title: "Actions",
          "data-html": "true",
          "data-content": this.props.popover,
          "data-placement": "bottom"
        })
      );
    }
  }]);

  return Header;
}(React.Component);

module.exports.Header = Header;

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var React = __webpack_require__(0);
var datamonkey = __webpack_require__(2);
var _ = __webpack_require__(1);

var OmegaPlot = React.createClass({
  displayName: "OmegaPlot",

  getDefaultProps: function getDefaultProps() {
    return {
      svg_id: null,
      dimensions: { width: 600, height: 400 },
      margins: { left: 50, right: 15, bottom: 35, top: 35 },
      has_zeros: false,
      legend_id: null,
      do_log_plot: true,
      k_p: null,
      plot: null
    };
  },

  setEvents: function setEvents() {
    var self = this;

    d3.select("#" + this.save_svg_id).on("click", function (e) {
      datamonkey.save_image("svg", "#" + self.svg_id);
    });

    d3.select("#" + this.save_png_id).on("click", function (e) {
      datamonkey.save_image("png", "#" + self.svg_id);
    });
  },

  initialize: function initialize() {
    if (!this.state.omegas || !this.state.omegas["Reference"]) {
      return;
    }

    var data_to_plot = this.state.omegas["Reference"];
    var secondary_data = this.state.omegas["Test"];

    // Set props from settings
    this.svg_id = this.props.settings.svg_id;
    this.dimensions = this.props.settings.dimensions || this.props.dimensions;
    this.legend_id = this.props.settings.legend || this.props.legend_id;
    this.do_log_plot = this.props.settings.log || this.props.do_log_plot;
    this.k_p = this.props.settings.k || this.props.k_p;

    var dimensions = this.props.dimensions;
    var margins = this.props.margins;

    this.margins = margins;

    if (this.do_log_plot) {
      this.has_zeros = data_to_plot.some(function (d) {
        return d.omega <= 0;
      });
      if (secondary_data) {
        this.has_zeros = this.has_zeros || data_to_plot.some(function (d) {
          return d.omega <= 0;
        });
      }
    }

    this.plot_width = dimensions["width"] - margins["left"] - margins["right"], this.plot_height = dimensions["height"] - margins["top"] - margins["bottom"];

    var domain = this.state.settings["domain"] || d3.extent(secondary_data ? secondary_data.map(function (d) {
      return d.omega;
    }).concat(data_to_plot.map(function (d) {
      return d.omega;
    })) : data_to_plot.map(function (d) {
      return d.omega;
    }));

    domain[0] *= 0.5;

    this.omega_scale = (this.do_log_plot ? this.has_zeros ? d3.scale.pow().exponent(0.2) : d3.scale.log() : d3.scale.linear()).range([0, this.plot_width]).domain(domain).nice();

    this.proportion_scale = d3.scale.linear().range([this.plot_height, 0]).domain([-0.05, 1]).clamp(true);

    // compute margins -- circle AREA is proportional to the relative weight
    // maximum diameter is (height - text margin)
    this.svg = d3.select("#" + this.svg_id).attr("width", dimensions.width).attr("height", dimensions.height);
    this.plot = this.svg.selectAll(".container");

    this.svg.selectAll("defs").remove();
    this.svg.append("defs").append("marker").attr("id", "arrowhead").attr("refX", 10) /*must be smarter way to calculate shift*/
    .attr("refY", 4).attr("markerWidth", 10).attr("markerHeight", 8).attr("orient", "auto").attr("stroke", "#000").attr("fill", "#000").append("path").attr("d", "M 0,0 V8 L10,4 Z");

    if (this.plot.empty()) {
      this.plot = this.svg.append("g").attr("class", "container");
    }

    this.plot.attr("transform", "translate(" + this.margins["left"] + " , " + this.margins["top"] + ")");
    this.reference_omega_lines = this.plot.selectAll(".hyphy-omega-line-reference"), this.displacement_lines = this.plot.selectAll(".hyphy-displacement-line");

    this.createDisplacementLine();
    this.createNeutralLine();
    this.createOmegaLine();
    this.createReferenceLine();
    this.createXAxis();
    this.createYAxis();
    this.setEvents();
  },
  makeSpring: function makeSpring(x1, x2, y1, y2, step, displacement) {
    if (x1 == x2) {
      y1 = Math.min(y1, y2);
      return "M" + x1 + "," + (y1 - 40) + "v20";
    }

    var spring_data = [],
        point = [x1, y1],
        angle = Math.atan2(y2 - y1, x2 - x1);

    var step = [step * Math.cos(angle), step * Math.sin(angle)];
    var k = 0;

    if (Math.abs(x1 - x2) < 15) {
      spring_data.push(point);
    } else {
      while (x1 < x2 && point[0] < x2 - 15 || x1 > x2 && point[0] > x2 + 15) {
        point = point.map(function (d, i) {
          return d + step[i];
        });
        if (k % 2) {
          spring_data.push([point[0], point[1] + displacement]);
        } else {
          spring_data.push([point[0], point[1] - displacement]);
        }
        k++;
        if (k > 100) {
          break;
        }
      }
    }

    if (spring_data.length > 1) {
      spring_data.pop();
    }

    spring_data.push([x2, y2]);
    var line = d3.svg.line().interpolate("monotone");
    return line(spring_data);
  },
  createDisplacementLine: function createDisplacementLine() {
    var self = this;
    var data_to_plot = this.state.omegas["Reference"];
    var secondary_data = this.state.omegas["Test"];

    if (secondary_data) {
      var diffs = data_to_plot.map(function (d, i) {
        return {
          x1: d.omega,
          x2: secondary_data[i].omega,
          y1: d.weight * 0.98,
          y2: secondary_data[i].weight * 0.98
        };
      });

      this.displacement_lines = this.displacement_lines.data(diffs);
      this.displacement_lines.enter().append("path");
      this.displacement_lines.exit().remove();
      this.displacement_lines.transition().attr("d", function (d) {
        return self.makeSpring(self.omega_scale(d.x1), self.omega_scale(d.x2), self.proportion_scale(d.y1 * 0.5), self.proportion_scale(d.y2 * 0.5), 5, 5);
      }).attr("marker-end", "url(#arrowhead)").attr("class", "hyphy-displacement-line");
    }
  },
  createReferenceLine: function createReferenceLine() {
    var data_to_plot = this.state.omegas["Reference"];
    var secondary_data = this.state.omegas["Test"];
    var self = this;

    if (secondary_data) {
      this.reference_omega_lines = this.reference_omega_lines.data(data_to_plot);
      this.reference_omega_lines.enter().append("line");
      this.reference_omega_lines.exit().remove();

      this.reference_omega_lines.transition().attr("x1", function (d) {
        return self.omega_scale(d.omega);
      }).attr("x2", function (d) {
        return self.omega_scale(d.omega);
      }).attr("y1", function (d) {
        return self.proportion_scale(-0.05);
      }).attr("y2", function (d) {
        return self.proportion_scale(d.weight);
      }).style("stroke", function (d) {
        return "#d62728";
      }).attr("class", "hyphy-omega-line-reference");
    } else {
      this.reference_omega_lines.remove();
      this.displacement_lines.remove();
    }
  },
  createOmegaLine: function createOmegaLine() {
    var data_to_plot = this.state.omegas["Reference"];
    var secondary_data = this.state.omegas["Test"];
    var self = this;

    // ** Omega Line (Red) ** //
    var omega_lines = this.plot.selectAll(".hyphy-omega-line").data(secondary_data ? secondary_data : data_to_plot);
    omega_lines.enter().append("line");
    omega_lines.exit().remove();
    omega_lines.transition().attr("x1", function (d) {
      return self.omega_scale(d.omega);
    }).attr("x2", function (d) {
      return self.omega_scale(d.omega);
    }).attr("y1", function (d) {
      return self.proportion_scale(-0.05);
    }).attr("y2", function (d) {
      return self.proportion_scale(d.weight);
    }).style("stroke", function (d) {
      return "#1f77b4";
    }).attr("class", "hyphy-omega-line");
  },
  createNeutralLine: function createNeutralLine() {
    var self = this;

    // ** Neutral Line (Blue) ** //
    var neutral_line = this.plot.selectAll(".hyphy-neutral-line").data([1]);
    neutral_line.enter().append("line").attr("class", "hyphy-neutral-line");
    neutral_line.exit().remove();
    neutral_line.transition().attr("x1", function (d) {
      return self.omega_scale(d);
    }).attr("x2", function (d) {
      return self.omega_scale(d);
    }).attr("y1", 0).attr("y2", this.plot_height);
  },
  createXAxis: function createXAxis() {
    // *** X-AXIS *** //
    var xAxis = d3.svg.axis().scale(this.omega_scale).orient("bottom");

    if (this.do_log_plot) {
      xAxis.ticks(10, this.has_zeros ? ".2r" : ".1r");
    }

    var x_axis = this.svg.selectAll(".x.axis");
    var x_label;

    if (x_axis.empty()) {
      x_axis = this.svg.append("g").attr("class", "x hyphy-axis");

      x_label = x_axis.append("g").attr("class", "hyphy-axis-label x-label");
    } else {
      x_label = x_axis.select(".axis-label.x-label");
    }

    x_axis.attr("transform", "translate(" + this.margins["left"] + "," + (this.plot_height + this.margins["top"]) + ")").call(xAxis);
    x_label = x_label.attr("transform", "translate(" + this.plot_width + "," + this.margins["bottom"] + ")").selectAll("text").data(["\u03C9"]);
    x_label.enter().append("text");
    x_label.text(function (d) {
      return d;
    }).style("text-anchor", "end").attr("dy", "0.0em");
  },
  createYAxis: function createYAxis() {
    // *** Y-AXIS *** //
    var yAxis = d3.svg.axis().scale(this.proportion_scale).orient("left").ticks(10, ".1p");

    var y_axis = this.svg.selectAll(".y.hyphy-axis");
    var y_label;

    if (y_axis.empty()) {
      y_axis = this.svg.append("g").attr("class", "y hyphy-axis");
      y_label = y_axis.append("g").attr("class", "hyphy-axis-label y-label");
    } else {
      y_label = y_axis.select(".hyphy-axis-label.y-label");
    }
    y_axis.attr("transform", "translate(" + this.margins["left"] + "," + this.margins["top"] + ")").call(yAxis);
    y_label = y_label.attr("transform", "translate(" + -this.margins["left"] + "," + 0 + ")").selectAll("text").data(["Proportion of sites"]);
    y_label.enter().append("text");
    y_label.text(function (d) {
      return d;
    }).style("text-anchor", "start").attr("dy", "-1em");
  },

  getInitialState: function getInitialState() {
    return {
      omegas: this.props.omegas,
      settings: this.props.settings
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({
      omegas: nextProps.omegas
    });
  },

  componentDidUpdate: function componentDidUpdate() {
    this.initialize();
  },

  componentDidMount: function componentDidMount() {
    this.initialize();
  },

  render: function render() {
    var key = this.props.omegas.key,
        label = this.props.omegas.label;

    this.svg_id = key + "-svg";
    this.save_svg_id = "export-" + key + "-svg";
    this.save_png_id = "export-" + key + "-png";

    return React.createElement(
      "div",
      { className: "col-lg-6" },
      React.createElement(
        "div",
        { className: "panel panel-default", id: key },
        React.createElement(
          "div",
          { className: "panel-heading" },
          React.createElement(
            "h3",
            { className: "panel-title" },
            "\u03C9 distributions under the ",
            React.createElement(
              "strong",
              null,
              label
            ),
            " model"
          ),
          React.createElement(
            "p",
            null,
            React.createElement(
              "small",
              null,
              "Test branches are shown in",
              " ",
              React.createElement(
                "span",
                { className: "hyphy-blue" },
                "blue"
              ),
              " and reference branches are shown in ",
              React.createElement(
                "span",
                { className: "hyphy-red" },
                "red"
              )
            )
          ),
          React.createElement(
            "div",
            { className: "btn-group" },
            React.createElement(
              "button",
              {
                id: this.save_svg_id,
                type: "button",
                className: "btn btn-default btn-sm"
              },
              React.createElement("span", { className: "glyphicon glyphicon-floppy-save" }),
              " SVG"
            ),
            React.createElement(
              "button",
              {
                id: this.save_png_id,
                type: "button",
                className: "btn btn-default btn-sm"
              },
              React.createElement("span", { className: "glyphicon glyphicon-floppy-save" }),
              " PNG"
            )
          )
        ),
        React.createElement(
          "div",
          { className: "panel-body" },
          React.createElement("svg", { id: this.svg_id })
        )
      )
    );
  }
});

var OmegaPlotGrid = React.createClass({
  displayName: "OmegaPlotGrid",

  getInitialState: function getInitialState() {
    return { omega_distributions: this.getDistributions(this.props.json) };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({
      omega_distributions: this.getDistributions(nextProps.json)
    });
  },

  getDistributions: function getDistributions(json) {
    var omega_distributions = {};

    if (!json) {
      return [];
    }

    for (var m in json["fits"]) {
      var this_model = json["fits"][m];
      omega_distributions[m] = {};
      for (var d in this_model["rate-distributions"]) {
        var this_distro = this_model["rate-distributions"][d];
        omega_distributions[m][d] = this_distro.map(function (d) {
          return {
            omega: d[0],
            weight: d[1]
          };
        });
      }
    }

    _.each(omega_distributions, function (item, key) {
      item.key = key.toLowerCase().replace(/ /g, "-");
      item.label = key;
    });

    var omega_distributions = _.filter(omega_distributions, function (item) {
      return _.isObject(item["Reference"]);
    });

    return omega_distributions;
  },

  render: function render() {
    var OmegaPlots = _.map(this.state.omega_distributions, function (item, key) {
      var model_name = key;
      var omegas = item;

      var settings = {
        svg_id: omegas.key + "-svg",
        dimensions: { width: 600, height: 400 },
        margins: { left: 50, right: 15, bottom: 35, top: 35 },
        has_zeros: false,
        legend_id: null,
        do_log_plot: true,
        k_p: null,
        plot: null
      };

      return React.createElement(OmegaPlot, { name: model_name, omegas: omegas, settings: settings });
    });

    return React.createElement(
      "div",
      null,
      OmegaPlots
    );
  }
});

module.exports.OmegaPlot = OmegaPlot;
module.exports.OmegaPlotGrid = OmegaPlotGrid;

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _tables = __webpack_require__(6);

var React = __webpack_require__(0),
    _ = __webpack_require__(1);

/**
 * Generates a table that contains tree summary information
 * @param model -- the model to obtain information from
 * @param test results -- the general test result information
 */
var TreeSummary = React.createClass({
  displayName: "TreeSummary",
  getDefaultProps: function getDefaultProps() {
    return {
      model: {},
      test_results: {}
    };
  },


  getInitialState: function getInitialState() {
    var table_row_data = this.getSummaryRows(this.props.model, this.props.test_results),
        table_columns = this.getTreeSummaryColumns(table_row_data);

    return {
      table_row_data: table_row_data,
      table_columns: table_columns
    };
  },

  getRateClasses: function getRateClasses(branch_annotations) {
    // Get count of all rate classes
    var all_branches = _.values(branch_annotations);

    return _.countBy(all_branches, function (branch) {
      return branch.omegas.length;
    });
  },

  getBranchProportion: function getBranchProportion(rate_classes) {
    var sum = _.reduce(_.values(rate_classes), function (memo, num) {
      return memo + num;
    });
    return _.mapObject(rate_classes, function (val, key) {
      return d3.format(".2p")(val / sum);
    });
  },

  getBranchLengthProportion: function getBranchLengthProportion(model, rate_classes, branch_annotations, total_branch_length) {
    // get branch lengths of each rate distribution
    //return prop_format(d[2] / total_tree_length
    if (_.has(model, "tree string")) {
      var tree = d3.layout.phylotree("body")(model["tree string"]);
    } else {
      return null;
    }

    // Get count of all rate classes
    var branch_lengths = _.mapObject(rate_classes, function (d) {
      return 0;
    });

    for (var key in branch_annotations) {
      var node = tree.get_node_by_name(key);
      branch_lengths[branch_annotations[key].omegas.length] += tree.branch_length()(node);
    }

    return _.mapObject(branch_lengths, function (val, key) {
      return d3.format(".2p")(val / total_branch_length);
    });
  },

  getNumUnderSelection: function getNumUnderSelection(rate_classes, branch_annotations, test_results) {
    var num_under_selection = _.mapObject(rate_classes, function (d) {
      return 0;
    });

    for (var key in branch_annotations) {
      num_under_selection[branch_annotations[key].omegas.length] += test_results[key]["p"] <= 0.05;
    }

    return num_under_selection;
  },

  getSummaryRows: function getSummaryRows(model, test_results) {
    if (!model || !test_results) {
      return [];
    }

    // Create an array of phylotrees from fits

    var tree_length = model["tree length"];
    var branch_annotations = model["branch-annotations"];

    var rate_classes = this.getRateClasses(branch_annotations),
        proportions = this.getBranchProportion(rate_classes),
        length_proportions = this.getBranchLengthProportion(model, rate_classes, branch_annotations, tree_length),
        num_under_selection = this.getNumUnderSelection(rate_classes, branch_annotations, test_results);

    // zip objects into matrix
    var keys = _.keys(rate_classes);

    var summary_rows = _.zip(keys, _.values(rate_classes), _.values(proportions), _.values(length_proportions), _.values(num_under_selection));

    summary_rows.sort(function (a, b) {
      if (a[0] == b[0]) {
        return a[1] < b[1] ? -1 : a[1] == b[1] ? 0 : 1;
      }
      return a[0] - b[0];
    });

    return summary_rows;
  },

  getTreeSummaryColumns: function getTreeSummaryColumns(table_row_data) {
    var omega_header = "ω rate classes",
        branch_num_header = "# of branches",
        branch_prop_header = "% of branches",
        branch_prop_length_header = "% of tree length",
        under_selection_header = "# under selection";

    // inspect table_row_data and return header
    var all_columns = [{
      value: omega_header,
      abbr: "Number of ω rate classes inferred"
    }, {
      value: branch_num_header,
      abbr: "Number of branches with this many rate classes"
    }, {
      value: branch_prop_header,
      abbr: "Percentage of branches with this many rate classes"
    }, {
      value: branch_prop_length_header,
      abbr: "Percentage of tree length with this many rate classes"
    }, {
      value: under_selection_header,
      abbr: "Number of selected branches with this many rate classes"
    }];

    // validate each table row with its associated header
    if (table_row_data.length == 0) {
      return [];
    }

    // trim columns to length of table_row_data
    var column_headers = _.take(all_columns, table_row_data[0].length);
    return column_headers;
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var table_row_data = this.getSummaryRows(nextProps.model, nextProps.test_results),
        table_columns = this.getTreeSummaryColumns(table_row_data);

    this.setState({
      table_row_data: table_row_data,
      table_columns: table_columns
    });
  },

  render: function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(
        "h4",
        { className: "dm-table-header" },
        "Tree summary",
        React.createElement("span", {
          className: "glyphicon glyphicon-info-sign",
          style: { verticalAlign: "middle", float: "right" },
          "aria-hidden": "true",
          "data-toggle": "popover",
          "data-trigger": "hover",
          title: "Actions",
          "data-html": "true",
          "data-content": "<ul><li>Hover over a column header for a description of its content.</li></ul>",
          "data-placement": "bottom"
        })
      ),
      React.createElement(_tables.DatamonkeyTable, {
        headerData: this.state.table_columns,
        bodyData: this.state.table_row_data
      }),
      React.createElement(
        "p",
        { className: "description" },
        "This table contains a summary of the inferred aBSREL model complexity. Each row provides information about the branches that were best described by the given number of \u03C9 rate categories."
      )
    );
  }
});

// Will need to make a call to this
// omega distributions
function render_tree_summary(json, element) {
  React.render(React.createElement(TreeSummary, { model: model, test_results: test_results }), $(element)[0]);
}

// Will need to make a call to this
// omega distributions
function rerender_tree_summary(tree, element) {
  $(element).empty();
  render_tree_summary(tree, element);
}

module.exports.TreeSummary = TreeSummary;
module.exports.render_tree_summary = render_tree_summary;
module.exports.rerender_tree_summary = rerender_tree_summary;

/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var React = __webpack_require__(0),
    d3 = __webpack_require__(7);

var FadeSummary = React.createClass({
  displayName: "FadeSummary",

  float_format: d3.format(".2f"),

  countBranchesTested: function countBranchesTested(branches_tested) {
    if (branches_tested) {
      return branches_tested.split(";").length;
    } else {
      return 0;
    }
  },

  getDefaultProps: function getDefaultProps() {
    return {
      subs: []
    };
  },

  componentDidMount: function componentDidMount() {
    this.setProps({
      alpha_level: 0.05,
      sequences: this.props.msa.sequences,
      subs: this.props.fade_results["TREE_LENGTHS"][0],
      sites: this.props.msa.sites,
      model: this.props.fade_results["MODEL_INFO"],
      grid_desc: this.props.fade_results["GRID_DESCRIPTION"],
      branches_tested: this.props.fade_results["BRANCHES_TESTED"]
    });
  },

  render: function render() {
    var self = this;

    return React.createElement(
      "dl",
      { className: "dl-horizontal" },
      React.createElement(
        "dt",
        null,
        "Data summary"
      ),
      React.createElement(
        "dd",
        null,
        this.props.sequences,
        " sequences with ",
        this.props.partitions,
        " ",
        "partitions."
      ),
      React.createElement(
        "dd",
        null,
        React.createElement(
          "div",
          { className: "alert" },
          "These sequences have not been screened for recombination. Selection analyses of alignments with recombinants in them using a single tree may generate ",
          React.createElement(
            "u",
            null,
            "misleading"
          ),
          " results."
        )
      ),
      this.props.msa.partition_info.map(function (partition, index) {
        return React.createElement(
          "div",
          null,
          React.createElement(
            "dt",
            null,
            "Partition ",
            partition["partition"]
          ),
          React.createElement(
            "dd",
            null,
            " ",
            self.float_format(self.props.subs[index]),
            " subs/ aminoacid site"
          ),
          React.createElement(
            "dd",
            null,
            partition["endcodon"] - partition["startcodon"],
            " aminoacids"
          )
        );
      }),
      React.createElement(
        "dt",
        null,
        "Settings"
      ),
      React.createElement(
        "dd",
        null,
        this.props.model
      ),
      React.createElement(
        "dd",
        null,
        this.props.grid_desc
      ),
      React.createElement(
        "dd",
        null,
        "Directional model applied to",
        " ",
        self.countBranchesTested(this.props.branches_tested),
        " branches"
      )
    );
  }
});

// Will need to make a call to this
// omega distributions
function render_fade_summary(json, msa) {
  React.render(React.createElement(FadeSummary, { fade_results: json, msa: msa }), document.getElementById("summary-div"));
}

module.exports = render_fade_summary;

/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _tables = __webpack_require__(6);

var _graphs = __webpack_require__(9);

var _navbar = __webpack_require__(4);

var _scrollspy = __webpack_require__(5);

var _reactCopyToClipboard = __webpack_require__(41);

var _reactCopyToClipboard2 = _interopRequireDefault(_reactCopyToClipboard);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var React = __webpack_require__(0),
    ReactDOM = __webpack_require__(3),
    _ = __webpack_require__(1);

var FEL = React.createClass({
  displayName: "FEL",

  definePlotData: function definePlotData(x_label, y_label) {

    var x = _.map(this.state.mle_results, function (d) {
      return d[x_label];
    });

    var y = _.map(this.state.mle_results, function (d) {
      return d[y_label];
    });

    return { x: x, y: [y] };
  },

  float_format: d3.format(".3f"),

  formatHeadersForTable: function formatHeadersForTable(mle) {
    return _.map(mle, function (d) {
      return _.object(["value", "abbr"], d);
    });
  },

  updateAxisSelection: function updateAxisSelection(e) {
    var state_to_update = {},
        dimension = e.target.dataset.dimension,
        axis = e.target.dataset.axis;

    state_to_update[axis] = dimension;
    this.setState(state_to_update);
  },

  updatePvalThreshold: function updatePvalThreshold(e) {

    // Get number of positively and negatively selected sites by p-value threshold
    var pvalue_threshold = parseFloat(e.target.value);

    // Get number of positively and negatively selected sites by p-value threshold
    var mle_results = _.map(this.state.mle_results, function (d) {
      d["is_positive"] = parseFloat(d["beta"]) / parseFloat(d["alpha"]) > 1 && parseFloat(d["p-value"]) <= pvalue_threshold;
      d["is_negative"] = parseFloat(d["beta"]) / parseFloat(d["alpha"]) < 1 && parseFloat(d["p-value"]) <= pvalue_threshold;
      return d;
    });

    var positively_selected = _.filter(this.state.mle_results, function (d) {
      return d["is_positive"];
    });
    var negatively_selected = _.filter(this.state.mle_results, function (d) {
      return d["is_negative"];
    });

    // highlight mle_content with whether they are significant or not
    var mle_content = _.map(this.state.mle_results, function (d, key) {
      var classes = "";
      if (mle_results[key].is_positive) {
        classes = "success";
      } else if (mle_results[key].is_negative) {
        classes = "warning";
      }
      return _.map(_.values(d), function (g) {
        return { value: g, classes: classes };
      });
    });

    this.setState({
      positively_selected: positively_selected,
      negatively_selected: negatively_selected,
      pvalue_threshold: pvalue_threshold,
      mle_results: mle_results,
      mle_content: mle_content
    });
  },

  getDefaultProps: function getDefaultProps() {
    return {};
  },

  getInitialState: function getInitialState() {
    return {
      mle_headers: [],
      mle_content: [],
      xaxis: "Site",
      yaxis: "alpha",
      copy_transition: false,
      pvalue_threshold: 0.1,
      positively_selected: [],
      negatively_selected: []
    };
  },

  loadFromServer: function loadFromServer() {
    var _this = this;

    d3.json(this.props.url, function (data) {
      var mle = data["MLE"];

      // These variables are to be used for DatamonkeyTable
      var mle_headers = mle.headers || [];
      var mle_content = mle.content[0] || [];

      mle_headers = _this.formatHeadersForTable(mle_headers);

      _.each(mle_headers, function (d) {
        return d["sortable"] = true;
      });

      // format content
      mle_content = _.map(mle_content, function (d) {
        return _.map(d, function (g) {
          return _this.float_format(g);
        });
      });

      // add a site count to both headers and content
      mle_headers = [{ value: "Site", sortable: true, abbr: "Site Position" }].concat(mle_headers);

      mle_content = _.map(mle_content, function (d, key) {
        var k = key + 1;
        return [k].concat(d);
      });

      // Create datatype that is a bit more manageable for use with DatamonkeySeries
      var mle_header_values = _.map(mle_headers, function (d) {
        return d.value;
      });

      var mle_results = _.map(mle_content, function (c) {
        return _.object(mle_header_values, c);
      });

      // Get number of positively and negatively selected sites by p-value threshold
      var mle_results = _.map(mle_results, function (d) {
        d["is_positive"] = parseFloat(d["beta"]) / parseFloat(d["alpha"]) > 1 && parseFloat(d["p-value"]) <= _this.state.pvalue_threshold;
        d["is_negative"] = parseFloat(d["beta"]) / parseFloat(d["alpha"]) < 1 && parseFloat(d["p-value"]) <= _this.state.pvalue_threshold;
        return d;
      });

      var positively_selected = _.filter(mle_results, function (d) {
        return d["is_positive"];
      });
      var negatively_selected = _.filter(mle_results, function (d) {
        return d["is_negative"];
      });

      // highlight mle_content with whether they are significant or not
      var mle_content = _.map(mle_results, function (d, key) {
        var classes = "";
        if (mle_results[key].is_positive) {
          classes = "success";
        } else if (mle_results[key].is_negative) {
          classes = "warning";
        }
        return _.map(_.values(d), function (g) {
          return { value: g, classes: classes };
        });
      });

      _this.setState({
        mle_headers: mle_headers,
        mle_content: mle_content,
        mle_results: mle_results,
        positively_selected: positively_selected,
        negatively_selected: negatively_selected
      });
    });
  },

  getClipboard: function getClipboard() {
    if (this.state.copy_transition) {
      return React.createElement(
        "i",
        null,
        "Copied!"
      );
    } else {
      return React.createElement(
        "a",
        { href: "#" },
        React.createElement("i", { className: "fa fa-clipboard", "aria-hidden": "true" })
      );
    }
  },
  onCopy: function onCopy() {
    var _this2 = this;

    this.setState({ copy_transition: true });
    setTimeout(function () {
      _this2.setState({ copy_transition: false });
    }, 1000);
  },
  getSummary: function getSummary() {

    return React.createElement(
      "div",
      null,
      React.createElement(
        "div",
        { className: "main-result" },
        React.createElement(
          "p",
          null,
          React.createElement(
            _reactCopyToClipboard2.default,
            { text: this.getSummaryText(), onCopy: this.onCopy },
            React.createElement(
              "span",
              { id: "copy-it", className: "pull-right" },
              this.getClipboard()
            )
          ),
          React.createElement(
            "p",
            null,
            "FEL ",
            React.createElement(
              "strong",
              { className: "hyphy-highlight" },
              " ",
              "found evidence"
            ),
            " ",
            "of"
          ),
          React.createElement(
            "p",
            null,
            React.createElement(
              "i",
              { className: "fa fa-plus-circle", "aria-hidden": "true" },
              " "
            ),
            " ",
            "Pervasive Positive/Diversifying selection at",
            React.createElement(
              "span",
              { className: "hyphy-highlight" },
              " ",
              this.state.positively_selected.length,
              " "
            ),
            "sites"
          ),
          React.createElement(
            "p",
            null,
            React.createElement(
              "i",
              { className: "fa fa-minus-circle", "aria-hidden": "true" },
              " "
            ),
            " ",
            "Pervasive Negative/Purifying selection at",
            React.createElement(
              "span",
              { className: "hyphy-highlight" },
              " ",
              this.state.negatively_selected.length,
              " "
            ),
            "sites"
          ),
          React.createElement(
            "div",
            { className: "row", style: { marginTop: "20px" } },
            React.createElement(
              "div",
              { className: "col-md-3" },
              "With p-value threshold of"
            ),
            React.createElement(
              "div",
              { className: "col-md-2", style: { top: "-5px" } },
              React.createElement("input", {
                className: "form-control",
                type: "number",
                defaultValue: "0.1",
                step: "0.01",
                min: "0",
                max: "1",
                onChange: this.updatePvalThreshold
              })
            )
          )
        ),
        React.createElement("hr", null),
        React.createElement(
          "p",
          null,
          React.createElement(
            "small",
            null,
            "See ",
            React.createElement(
              "a",
              { href: "//hyphy.org/methods/selection-methods/#fel" },
              "here"
            ),
            " ",
            "for more information about the FEL method",
            React.createElement("br", null),
            "Please cite PMID",
            " ",
            React.createElement(
              "a",
              { href: "//www.ncbi.nlm.nih.gov/pubmed/15703242" },
              "15703242"
            ),
            " if you use this result in a publication, presentation, or other scientific work"
          )
        )
      )
    );
  },
  getSummaryText: function getSummaryText() {

    var no_selected = this.state.mle_content.length - this.state.positively_selected.length - this.state.negatively_selected.length;

    var summary_text = "FEL found evidence of pervasive positive/diversifying selection at " + this.state.positively_selected.length + " sites/at any sites in your alignment. In addition, FEL found evidence with p-value " + this.state.pvalue_threshold + " of pervasive negative/purifying selection at " + this.state.negatively_selected.length + " sites/at any sites in your alignment. FEL did not find evidence for either positive or negative selection in the remaining " + no_selected + " sites in your alignment.";

    return summary_text;
  },


  componentWillMount: function componentWillMount() {
    this.loadFromServer();
  },

  componentDidUpdate: function componentDidUpdate(prevProps) {
    $("body").scrollspy({
      target: ".bs-docs-sidebar",
      offset: 50
    });
  },


  render: function render() {

    var scrollspy_info = [{ label: "summary", href: "summary-tab" }, { label: "plots", href: "plot-tab" }, { label: "table", href: "table-tab" }];

    var _definePlotData = this.definePlotData(this.state.xaxis, this.state.yaxis),
        x = _definePlotData.x,
        y = _definePlotData.y;

    var x_options = "Site";
    var y_options = _.filter(_.map(this.state.mle_headers, function (d) {
      return d.value;
    }), function (d) {
      return d != "Site";
    });

    var Summary = this.getSummary();

    return React.createElement(
      "div",
      null,
      React.createElement(_navbar.NavBar, null),
      React.createElement(
        "div",
        { className: "container" },
        React.createElement(
          "div",
          { className: "row" },
          React.createElement(_scrollspy.ScrollSpy, { info: scrollspy_info }),
          React.createElement(
            "div",
            { className: "col-sm-10" },
            React.createElement(
              "div",
              {
                id: "datamonkey-fel-error",
                className: "alert alert-danger alert-dismissible",
                role: "alert",
                style: { display: "none" }
              },
              React.createElement(
                "button",
                {
                  type: "button",
                  className: "close",
                  id: "datamonkey-fel-error-hide"
                },
                React.createElement(
                  "span",
                  { "aria-hidden": "true" },
                  "\xD7"
                ),
                React.createElement(
                  "span",
                  { className: "sr-only" },
                  "Close"
                )
              ),
              React.createElement(
                "strong",
                null,
                "Error!"
              ),
              " ",
              React.createElement("span", { id: "datamonkey-fel-error-text" })
            ),
            React.createElement(
              "div",
              { id: "results" },
              React.createElement(
                "h3",
                { className: "list-group-item-heading" },
                React.createElement(
                  "span",
                  { id: "summary-method-name" },
                  "FEL - Fixed Effects Likelihood"
                ),
                React.createElement("br", null),
                React.createElement(
                  "span",
                  { className: "results-summary" },
                  "results summary"
                )
              ),
              Summary,
              React.createElement(
                "div",
                { id: "plot-tab", className: "row hyphy-row" },
                React.createElement(
                  "h3",
                  { className: "dm-table-header" },
                  "Plot Summary"
                ),
                React.createElement(_graphs.DatamonkeyGraphMenu, {
                  x_options: x_options,
                  y_options: y_options,
                  axisSelectionEvent: this.updateAxisSelection
                }),
                React.createElement(_graphs.DatamonkeySeries, {
                  x: x,
                  y: y,
                  x_label: this.state.xaxis,
                  y_label: this.state.yaxis,
                  marginLeft: 50,
                  width: $("#results").width(),
                  transitions: true,
                  doDots: true
                })
              ),
              React.createElement(
                "div",
                { id: "table-tab", className: "row hyphy-row" },
                React.createElement(
                  "div",
                  { id: "hyphy-mle-fits", className: "col-md-12" },
                  React.createElement(
                    "h3",
                    { className: "dm-table-header" },
                    "Table Summary"
                  ),
                  React.createElement(
                    "div",
                    { className: "col-md-6 alert alert-success", role: "alert" },
                    "Positively selected sites with evidence are highlighted in green."
                  ),
                  React.createElement(
                    "div",
                    { className: "col-md-6 alert alert-warning", role: "alert" },
                    "Negatively selected sites with evidence are highlighted in yellow."
                  ),
                  React.createElement(_tables.DatamonkeyTable, {
                    headerData: this.state.mle_headers,
                    bodyData: this.state.mle_content,
                    classes: "table table-condensed table-striped",
                    paginate: 20,
                    export_csv: true
                  })
                )
              )
            )
          )
        )
      )
    );
  }

});

// Will need to make a call to this
// omega distributions
function render_fel(url, element) {
  ReactDOM.render(React.createElement(FEL, { url: url }), document.getElementById(element));
}

module.exports = render_fel;

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _input_info = __webpack_require__(8);

var _tables = __webpack_require__(6);

var _graphs = __webpack_require__(9);

var _navbar = __webpack_require__(4);

var _scrollspy = __webpack_require__(5);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = __webpack_require__(0),
    ReactDOM = __webpack_require__(3),
    d3 = __webpack_require__(7),
    _ = __webpack_require__(1);

var MEMESummary = function (_React$Component) {
  _inherits(MEMESummary, _React$Component);

  function MEMESummary() {
    _classCallCheck(this, MEMESummary);

    return _possibleConstructorReturn(this, (MEMESummary.__proto__ || Object.getPrototypeOf(MEMESummary)).apply(this, arguments));
  }

  _createClass(MEMESummary, [{
    key: "render",
    value: function render() {
      var user_message,
          was_evidence = true;
      if (was_evidence) {
        user_message = React.createElement(
          "p",
          { className: "list-group-item-text label_and_input" },
          "MEME ",
          React.createElement(
            "strong",
            { className: "hyphy-highlight" },
            "found evidence"
          ),
          " of positive selection in your phylogeny."
        );
      } else {
        user_message = React.createElement(
          "p",
          { className: "list-group-item-text label_and_input" },
          "MEME ",
          React.createElement(
            "strong",
            null,
            "found no evidence"
          ),
          " of positive selection in your phylogeny."
        );
      }

      return React.createElement(
        "div",
        { className: "row", id: "summary-tab" },
        React.createElement(
          "div",
          { className: "col-md-12" },
          React.createElement(
            "h3",
            { className: "list-group-item-heading" },
            React.createElement(
              "span",
              { className: "summary-method-name" },
              "Mixed Effects Model of Evolution"
            ),
            React.createElement("br", null),
            React.createElement(
              "span",
              { className: "results-summary" },
              "results summary"
            )
          )
        ),
        React.createElement(
          "div",
          { className: "col-md-12" },
          React.createElement(_input_info.InputInfo, { input_data: this.props.input_data })
        ),
        React.createElement(
          "div",
          { className: "col-md-12" },
          React.createElement(
            "div",
            { className: "main-result" },
            user_message,
            React.createElement("hr", null),
            React.createElement(
              "p",
              null,
              React.createElement(
                "small",
                null,
                "See",
                " ",
                React.createElement(
                  "a",
                  { href: "http://www.hyphy.org/methods/selection-methods/#meme" },
                  "here"
                ),
                " ",
                "for more information about the MEME method.",
                React.createElement("br", null),
                "Please cite",
                " ",
                React.createElement(
                  "a",
                  {
                    href: "http://www.ncbi.nlm.nih.gov/pubmed/22807683",
                    id: "summary-pmid",
                    target: "_blank"
                  },
                  "PMID 22807683"
                ),
                " ",
                "if you use this result in a publication, presentation, or other scientific work."
              )
            )
          )
        )
      );
    }
  }]);

  return MEMESummary;
}(React.Component);

var MEMETable = function (_React$Component2) {
  _inherits(MEMETable, _React$Component2);

  function MEMETable(props) {
    _classCallCheck(this, MEMETable);

    var _this2 = _possibleConstructorReturn(this, (MEMETable.__proto__ || Object.getPrototypeOf(MEMETable)).call(this, props));

    _this2.handleChange = _this2.handleChange.bind(_this2);
    _this2.handleMouseUp = _this2.handleMouseUp.bind(_this2);
    _this2.state = {
      bodyData: null,
      value: 10,
      filter: 0.1
    };
    return _this2;
  }

  _createClass(MEMETable, [{
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      var formatter = d3.format(".2f"),
          new_rows = nextProps.rows.map(function (row) {
        return row.map(function (entry) {
          return formatter(entry);
        });
      });
      this.setState({
        bodyData: new_rows
      });
    }
  }, {
    key: "handleChange",
    value: function handleChange(event) {
      this.setState({ value: event.target.value });
    }
  }, {
    key: "handleMouseUp",
    value: function handleMouseUp(event) {
      this.setState({ filter: event.target.value / 100 });
    }
  }, {
    key: "render",
    value: function render() {
      var _this3 = this;

      if (this.props.header) {
        var headerData = this.props.header.map(function (pair) {
          return { value: pair[0], abbr: pair[1] };
        }),
            bodyData = this.state.bodyData.filter(function (row) {
          return row[6] < _this3.state.filter;
        });
      }
      var self = this;
      return React.createElement(
        "div",
        { className: "row" },
        React.createElement(
          "div",
          { className: "col-md-12", id: "table-tab" },
          React.createElement(
            "h4",
            { className: "dm-table-header" },
            "MEME data",
            React.createElement("span", {
              className: "glyphicon glyphicon-info-sign",
              style: { verticalAlign: "middle", float: "right" },
              "aria-hidden": "true",
              "data-toggle": "popover",
              "data-trigger": "hover",
              title: "Actions",
              "data-html": "true",
              "data-content": "<ul><li>Hover over a column header for a description of its content.</li></ul>",
              "data-placement": "bottom"
            })
          ),
          React.createElement(
            "div",
            { style: { width: "500px" } },
            React.createElement(
              "span",
              {
                style: {
                  width: "35%",
                  display: "inline-block",
                  verticalAlign: "middle"
                }
              },
              "p-value threshold: ",
              self.state.value / 100
            ),
            React.createElement("input", {
              type: "range",
              id: "myRange",
              value: self.state.value,
              style: {
                width: "65%",
                display: "inline-block",
                verticalAlign: "middle"
              },
              onChange: this.handleChange,
              onMouseUp: this.handleMouseUp
            })
          ),
          React.createElement(_tables.DatamonkeyTable, {
            headerData: headerData,
            bodyData: bodyData,
            paginate: 20,
            classes: "table table-condensed table-striped",
            export_csv: true
          })
        )
      );
    }
  }]);

  return MEMETable;
}(React.Component);

var MEME = function (_React$Component3) {
  _inherits(MEME, _React$Component3);

  function MEME(props) {
    _classCallCheck(this, MEME);

    var _this4 = _possibleConstructorReturn(this, (MEME.__proto__ || Object.getPrototypeOf(MEME)).call(this, props));

    _this4.updateAxisSelection = _this4.updateAxisSelection.bind(_this4);
    _this4.state = {
      input_data: null,
      data: null,
      fits: null,
      header: null,
      rows: null,
      xaxis: "Site",
      yaxis: "&alpha;"
    };
    return _this4;
  }

  _createClass(MEME, [{
    key: "updateAxisSelection",
    value: function updateAxisSelection(e) {
      var state_to_update = {},
          dimension = e.target.dataset.dimension,
          axis = e.target.dataset.axis;

      state_to_update[axis] = dimension;
      this.setState(state_to_update);
    }
  }, {
    key: "loadFromServer",
    value: function loadFromServer() {
      var self = this;
      d3.json(this.props.url, function (data) {
        self.setState({
          input_data: data["input_data"],
          data: data,
          fits: data["fits"],
          header: data["MLE"]["headers"],
          rows: data["MLE"]["content"]["0"]
        });
      });
    }
  }, {
    key: "componentWillMount",
    value: function componentWillMount() {
      this.loadFromServer();
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      $("body").scrollspy({
        target: ".bs-docs-sidebar",
        offset: 50
      });
    }
  }, {
    key: "render",
    value: function render() {
      var self = this,
          site_graph,
          scrollspy_info = [{ label: "summary", href: "summary-tab" }, { label: "table", href: "table-tab" }, { label: "fits", href: "fit-tab" }, { label: "plot", href: "plot-tab" }];

      if (this.state.data) {
        site_graph = React.createElement(_graphs.DatamonkeySiteGraph, {
          columns: _.pluck(self.state.header, 0),
          rows: self.state.rows
        });
      }
      return React.createElement(
        "div",
        null,
        React.createElement(_navbar.NavBar, null),
        React.createElement(
          "div",
          { className: "container" },
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(_scrollspy.ScrollSpy, { info: scrollspy_info }),
            React.createElement(
              "div",
              { className: "col-sm-10", id: "results" },
              React.createElement(MEMESummary, { input_data: self.state.input_data }),
              React.createElement(MEMETable, { header: self.state.header, rows: self.state.rows }),
              React.createElement(
                "div",
                { className: "row" },
                React.createElement(
                  "div",
                  { className: "col-md-12", id: "fit-tab" },
                  React.createElement(_tables.DatamonkeyModelTable, { fits: self.state.fits }),
                  React.createElement(
                    "p",
                    { className: "description" },
                    "This table reports a statistical summary of the models fit to the data. Here, ",
                    React.createElement(
                      "strong",
                      null,
                      "MG94"
                    ),
                    " refers to the MG94xREV baseline model that infers a single \u03C9 rate category per branch."
                  )
                )
              ),
              React.createElement(
                "div",
                { id: "plot-tab", className: "row hyphy-row" },
                React.createElement(
                  "div",
                  { className: "col-md-12" },
                  React.createElement(
                    "h4",
                    { className: "dm-table-header" },
                    "Plot Summary"
                  ),
                  site_graph
                )
              )
            )
          )
        )
      );
    }
  }]);

  return MEME;
}(React.Component);

function render_meme(url, element) {
  ReactDOM.render(React.createElement(MEME, { url: url }), document.getElementById(element));
}

module.exports = render_meme;

/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _tables = __webpack_require__(6);

var _graphs = __webpack_require__(9);

var _navbar = __webpack_require__(4);

var _scrollspy = __webpack_require__(5);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = __webpack_require__(0),
    ReactDOM = __webpack_require__(3),
    _ = __webpack_require__(1),
    chi = __webpack_require__(39);

var PRIME = function (_React$Component) {
  _inherits(PRIME, _React$Component);

  function PRIME(props) {
    _classCallCheck(this, PRIME);

    var _this = _possibleConstructorReturn(this, (PRIME.__proto__ || Object.getPrototypeOf(PRIME)).call(this, props));

    _this.float_format = d3.format(".3f");
    _this.initial_pvalue_threshold = 0.1;

    var results = _.map(_this.props.prime_results, function (d, k) {
      d["codon"] = k;
      return d;
    });

    results = _.filter(results, function (d) {
      return _.has(d, "Full model");
    });

    // filter out sites that are constant
    results = _.filter(results, function (d) {
      return d.CONSTANT != 1;
    });

    // calculate p-values
    results = _.map(results, function (d) {
      return _.extend(d, { pvalues: _this.calculatePvalues(d) });
    });

    var codons = _.map(results, function (d) {
      return parseInt(d.codon);
    });

    var property_headers = _.keys(_.omit(results[0]["Full model"]["MLES"], "_felScaler"));

    // format property_values for table
    var property_values = _.unzip(_.map(results, function (d) {
      return _.map(_.values(_.omit(d["Full model"]["MLES"], "_felScaler")), function (d) {
        return _this.float_format(d);
      });
    }));

    // add pvalue to header
    var table_property_headers = _.map(_.flatten(_.zip(property_headers, property_headers)), function (d, k) {
      if (k % 2) {
        return d + "_pval";
      } else return d;
    });

    // prepend with codon
    table_property_headers = ["codon"].concat(table_property_headers);
    var table_property_values = _this.formatValuesForTable(codons, results, _this.initial_pvalue_threshold);

    // format data into variables usable by components
    var all_mle_props = _.flatten(_.map(results, function (d) {
      return _.zip(_.values(_.omit(d["Full model"]["MLES"], "_felScaler")), _.values(d["pvalues"]));
    }), true);

    var changing_properties = _.filter(all_mle_props, function (d) {
      return d[0] < 0 && d[1] < _this.initial_pvalue_threshold;
    });

    var conserved_properties = _.filter(all_mle_props, function (d) {
      return d[0] > 0 && d[1] < _this.initial_pvalue_threshold;
    });

    // Get plot width according to bootstrap conventions
    var plot_width = 960;

    switch (true) {
      case window.innerWidth >= 992:
        plot_width = 960;
        break;
      case window.innerWidth >= 768:
        plot_width = 460;
        break;
      case window.innerWidth <= 576:
        plot_width = 460;
        break;
      default:
        plot_width = 0;
    }

    _this.state = {
      results: results,
      all_mle_props: all_mle_props,
      codons: codons,
      property_plot_done: false,
      property_headers: property_headers,
      property_values: property_values,
      table_property_headers: table_property_headers,
      table_property_values: table_property_values,
      changing_properties: changing_properties,
      conserved_properties: conserved_properties,
      pvalue_threshold: _this.initial_pvalue_threshold,
      total_sites_found: results.length,
      plot_width: plot_width
    };
    return _this;
  }

  _createClass(PRIME, [{
    key: "formatValuesForTable",
    value: function formatValuesForTable(codons, results, pvalue) {
      var _this2 = this;

      // update property values to state whether they are conserved or changing
      var table_property_values = _.unzip(_.map(results, function (rows) {
        return _.map(_.omit(rows["Full model"]["MLES"], "_felScaler"), function (d, k) {
          var classes = "";
          if (rows["pvalues"][k] < pvalue) {
            if (d < 0) {
              classes = "success";
            } else {
              classes = "danger";
            }
          }
          return { value: d, classes: classes };
        }, _this2);
      }));

      var p_values = _.unzip(_.map(results, function (d) {
        return _.map(_.values(d["pvalues"]), function (d) {
          return { value: _this2.float_format(d) };
        });
      }));

      table_property_values = _.flatten(_.zip(table_property_values, p_values), true);

      // prepend with codon sites
      table_property_values = [codons].concat(table_property_values);

      return table_property_values;
    }
  }, {
    key: "calculatePvalues",
    value: function calculatePvalues(values) {
      var property_keys = ["alpha_0", "alpha_1", "alpha_2", "alpha_3", "alpha_4"];
      var full_model_logl = values["Full model"]["LogL"];
      var full_model_df = values["Full model"]["DF"];

      // Must get log-likelihood of each test property
      var pvals = _.map(this.props.properties, function (d) {
        var logl = values[d]["LogL"];
        var n = 2 * (full_model_logl - logl);
        var df = full_model_df - values[d]["DF"];
        return 1 - chi.cdf(n, df);
      });

      return _.object(property_keys, pvals);
    }
  }, {
    key: "updatePvalThreshold",
    value: function updatePvalThreshold(e) {

      var pvalue_threshold = parseFloat(e.target.value);

      var table_property_values = this.formatValuesForTable(this.state.codons, this.state.results, pvalue_threshold);

      // update conserved and changing properties count
      var changing_properties = _.filter(this.state.all_mle_props, function (d) {
        return d[0] < 0 && d[1] < pvalue_threshold;
      });

      var conserved_properties = _.filter(this.state.all_mle_props, function (d) {
        return d[0] > 0 && d[1] < pvalue_threshold;
      });

      this.setState({
        table_property_headers: this.state.table_property_headers,
        pvalue_threshold: pvalue_threshold,
        table_property_values: table_property_values,
        conserved_properties: conserved_properties,
        changing_properties: changing_properties
      });
    }
  }, {
    key: "getSummary",
    value: function getSummary() {
      var self = this;

      return React.createElement(
        "div",
        null,
        React.createElement(
          "div",
          { className: "main-result" },
          React.createElement(
            "p",
            null,
            React.createElement(
              "p",
              null,
              "PRIME ",
              " ",
              React.createElement(
                "strong",
                { className: "hyphy-highlight" },
                " found evidence "
              ),
              " of",
              " "
            ),
            React.createElement(
              "p",
              null,
              React.createElement(
                "span",
                { className: "hyphy-highlight" },
                " ",
                " ",
                self.state.conserved_properties.length,
                " ",
                " "
              ),
              "conserved properties found.",
              " "
            ),
            React.createElement(
              "p",
              null,
              React.createElement(
                "span",
                { className: "hyphy-highlight" },
                " ",
                " ",
                self.state.changing_properties.length,
                " ",
                " "
              ),
              "changing properties found.",
              " "
            ),
            React.createElement(
              "div",
              {
                className: "row",
                style: {
                  marginTop: "20px"
                }
              },
              React.createElement(
                "div",
                { className: "col-md-3" },
                "With p-value threshold of"
              ),
              React.createElement(
                "div",
                {
                  className: "col-md-2",
                  style: {
                    top: "-5px"
                  }
                },
                React.createElement("input", {
                  className: "form-control",
                  type: "number",
                  defaultValue: "0.1",
                  step: "0.01",
                  min: "0",
                  max: "1",
                  onChange: self.updatePvalThreshold.bind(this)
                })
              )
            )
          ),
          React.createElement("hr", null),
          React.createElement(
            "p",
            null,
            React.createElement(
              "small",
              null,
              "See ",
              " ",
              React.createElement(
                "a",
                { href: "//hyphy.org/methods/selection-methods/#prime" },
                "here",
                " "
              ),
              " ",
              "for more information about the PRIME method ",
              React.createElement("br", null),
              "Please cite PMID ",
              React.createElement(
                "a",
                { href: "" },
                " TBA "
              ),
              " if you use this result in a publication, presentation, or other scientific work"
            )
          )
        )
      );
    }
  }, {
    key: "componentWillMount",
    value: function componentWillMount() {}
  }, {
    key: "componentDidMount",
    value: function componentDidMount() {}
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      $("body").scrollspy({
        target: ".bs-docs-sidebar",
        offset: 50
      });
    }
  }, {
    key: "render",
    value: function render() {
      var scrollspy_info = [{
        label: "summary",
        href: "summary-tab"
      }, {
        label: "plots",
        href: "plot-tab"
      }, {
        label: "table",
        href: "table-tab"
      }];

      var order_table_rows = _.unzip(this.state.table_property_values);

      return React.createElement(
        "div",
        null,
        React.createElement(_navbar.NavBar, null),
        React.createElement(
          "div",
          { className: "container" },
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(_scrollspy.ScrollSpy, { info: scrollspy_info }),
            React.createElement(
              "div",
              { className: "col-sm-10" },
              React.createElement(
                "div",
                { id: "results" },
                React.createElement(
                  "h3",
                  { className: "list-group-item-heading" },
                  React.createElement(
                    "span",
                    { id: "summary-method-name" },
                    "PRIME - PRoperty Informed Models of Evolution",
                    " "
                  ),
                  React.createElement("br", null),
                  React.createElement(
                    "span",
                    { className: "results-summary" },
                    " results summary "
                  )
                ),
                this.getSummary()
              ),
              React.createElement(
                "div",
                { id: "plot-tab", className: "row hyphy-row" },
                React.createElement(
                  "h3",
                  { className: "dm-table-header" },
                  "Property Importance Plot"
                ),
                React.createElement(_graphs.DatamonkeyMultiScatterplot, {
                  x: this.state.codons,
                  y: this.state.property_values,
                  width: this.state.plot_width,
                  x_label: "test",
                  y_labels: this.state.property_headers,
                  transitions: true
                })
              ),
              React.createElement(
                "div",
                { id: "table-tab", className: "row hyphy-row" },
                React.createElement(
                  "div",
                  { id: "hyphy-mle-fits", className: "col-md-12" },
                  React.createElement(
                    "h3",
                    { className: "dm-table-header" },
                    "Table Summary"
                  ),
                  React.createElement(
                    "div",
                    { className: "col-md-6 alert alert-danger", role: "alert" },
                    "Conserved properties with evidence are highlighted in red."
                  ),
                  React.createElement(
                    "div",
                    { className: "col-md-6 alert alert-success", role: "alert" },
                    "Changing properties with evidence are highlighted in green."
                  ),
                  React.createElement(_tables.DatamonkeyTable, {
                    headerData: this.state.table_property_headers,
                    bodyData: order_table_rows,
                    classes: "table table-condensed table-striped",
                    paginate: 20,
                    export_csv: true
                  })
                )
              )
            )
          )
        )
      );
    }
  }]);

  return PRIME;
}(React.Component);

PRIME.defaultProps = {
  _use_q_values: false,
  properties: ["Test property 1", "Test property 2", "Test property 3", "Test property 4", "Test property 5"]
};

// Will need to make a call to this
// omega distributions
function prime(prime_results, element) {
  ReactDOM.render(React.createElement(PRIME, { prime_results: prime_results }), document.getElementById(element));
}

module.exports = prime;

/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _model_fits = __webpack_require__(13);

var _tree = __webpack_require__(10);

var _omega_plots = __webpack_require__(25);

var React = __webpack_require__(0),
    ReactDOM = __webpack_require__(3),
    _ = __webpack_require__(1);

var RELAX = React.createClass({
  displayName: "RELAX",

  float_format: d3.format(".2f"),
  p_value_format: d3.format(".4f"),
  fit_format: d3.format(".2f"),

  loadFromServer: function loadFromServer() {
    var self = this;

    d3.json(this.props.url, function (data) {
      data["fits"]["Partitioned MG94xREV"]["branch-annotations"] = self.formatBranchAnnotations(data, "Partitioned MG94xREV");
      data["fits"]["General Descriptive"]["branch-annotations"] = self.formatBranchAnnotations(data, "General Descriptive");
      data["fits"]["Null"]["branch-annotations"] = self.formatBranchAnnotations(data, "Null");
      data["fits"]["Alternative"]["branch-annotations"] = self.formatBranchAnnotations(data, "Alternative");
      data["fits"]["Partitioned Exploratory"]["branch-annotations"] = self.formatBranchAnnotations(data, "Partitioned Exploratory");

      var annotations = data["fits"]["Partitioned MG94xREV"]["branch-annotations"],
          json = data,
          pmid = data["PMID"],
          test_results = data["relaxation_test"];

      var p = data["relaxation-test"]["p"],
          direction = data["fits"]["Alternative"]["K"] > 1 ? "intensification" : "relaxation",
          evidence = p <= self.props.alpha_level ? "significant" : "not significant",
          pvalue = self.p_value_format(p),
          lrt = self.fit_format(data["relaxation-test"]["LR"]),
          summary_k = self.fit_format(data["fits"]["Alternative"]["K"]),
          pmid_text = "PubMed ID " + pmid,
          pmid_href = "http://www.ncbi.nlm.nih.gov/pubmed/" + pmid;

      self.setState({
        annotations: annotations,
        json: json,
        pmid: pmid,
        test_results: test_results,
        p: p,
        direction: direction,
        evidence: evidence,
        pvalue: pvalue,
        lrt: lrt,
        summary_k: summary_k,
        pmid_text: pmid_text,
        pmid_href: pmid_href
      });
    });
  },

  getDefaultProps: function getDefaultProps() {
    var edgeColorizer = function edgeColorizer(element, data) {
      var self = this,
          scaling_exponent = 0.33,
          omega_format = d3.format(".3r");

      var omega_color = d3.scale.pow().exponent(scaling_exponent).domain([0, 0.25, 1, 5, 10]).range(self.options()["color-fill"] ? ["#DDDDDD", "#AAAAAA", "#888888", "#444444", "#000000"] : ["#6e4fa2", "#3288bd", "#e6f598", "#f46d43", "#9e0142"]).clamp(true);

      if (data.target.annotations) {
        element.style("stroke", omega_color(data.target.annotations.length) || null);
        $(element[0][0]).tooltip("destroy");
        $(element[0][0]).tooltip({
          title: omega_format(data.target.annotations.length),
          html: true,
          trigger: "hover",
          container: "body",
          placement: "auto"
        });
      } else {
        element.style("stroke", null);
        $(element[0][0]).tooltip("destroy");
      }

      var selected_partition = $("#hyphy-tree-highlight").attr("value");

      if (selected_partition && this.get_partitions()) {
        var partitions = this.get_partitions()[selected_partition];

        element.style("stroke-width", partitions && partitions[data.target.name] ? "8" : "4").style("stroke-linejoin", "round").style("stroke-linecap", "round");
      }
    };

    return {
      edgeColorizer: edgeColorizer,
      alpha_level: 0.05
    };
  },

  getInitialState: function getInitialState() {
    var tree_settings = {
      omegaPlot: {},
      "tree-options": {
        /* value arrays have the following meaning
                [0] - the value of the attribute
                [1] - does the change in attribute value trigger tree re-layout?
            */
        "hyphy-tree-model": ["Partitioned MG94xREV", true],
        "hyphy-tree-highlight": ["RELAX.test", false],
        "hyphy-tree-branch-lengths": [true, true],
        "hyphy-tree-hide-legend": [true, false],
        "hyphy-tree-fill-color": [true, false]
      },
      "suppress-tree-render": false,
      "chart-append-html": true,
      edgeColorizer: this.props.edgeColorizer
    };

    return {
      annotations: null,
      json: null,
      pmid: null,
      settings: tree_settings,
      test_results: null,
      tree: null,
      p: null,
      direction: "unknown",
      evidence: "unknown",
      pvalue: null,
      lrt: null,
      summary_k: "unknown",
      pmid_text: "PubMed ID : Unknown",
      pmid_href: "#",
      relaxation_K: "unknown"
    };
  },

  componentWillMount: function componentWillMount() {
    this.loadFromServer();
    this.setEvents();
  },

  setEvents: function setEvents() {
    var self = this;

    $("#datamonkey-relax-load-json").on("change", function (e) {
      var files = e.target.files; // FileList object

      if (files.length == 1) {
        var f = files[0];
        var reader = new FileReader();

        reader.onload = function (theFile) {
          return function (e) {
            var data = JSON.parse(this.result);
            data["fits"]["Partitioned MG94xREV"]["branch-annotations"] = self.formatBranchAnnotations(data, "Partitioned MG94xREV");
            data["fits"]["General Descriptive"]["branch-annotations"] = self.formatBranchAnnotations(data, "General Descriptive");
            data["fits"]["Null"]["branch-annotations"] = self.formatBranchAnnotations(data, "Null");
            data["fits"]["Alternative"]["branch-annotations"] = self.formatBranchAnnotations(data, "Alternative");
            data["fits"]["Partitioned Exploratory"]["branch-annotations"] = self.formatBranchAnnotations(data, "Partitioned Exploratory");

            var annotations = data["fits"]["Partitioned MG94xREV"]["branch-annotations"],
                json = data,
                pmid = data["PMID"],
                test_results = data["relaxation_test"];

            var p = data["relaxation-test"]["p"],
                direction = data["fits"]["Alternative"]["K"] > 1 ? "intensification" : "relaxation",
                evidence = p <= self.props.alpha_level ? "significant" : "not significant",
                pvalue = self.p_value_format(p),
                lrt = self.fit_format(data["relaxation-test"]["LR"]),
                summary_k = self.fit_format(data["fits"]["Alternative"]["K"]),
                pmid_text = "PubMed ID " + pmid,
                pmid_href = "http://www.ncbi.nlm.nih.gov/pubmed/" + pmid;

            self.setState({
              annotations: annotations,
              json: json,
              pmid: pmid,
              test_results: test_results,
              p: p,
              direction: direction,
              evidence: evidence,
              pvalue: pvalue,
              lrt: lrt,
              summary_k: summary_k,
              pmid_text: pmid_text,
              pmid_href: pmid_href
            });
          };
        }(f);
        reader.readAsText(f);
      }

      $("#datamonkey-absrel-toggle-here").dropdown("toggle");
      e.preventDefault();
    });
  },

  formatBranchAnnotations: function formatBranchAnnotations(json, key) {
    var initial_branch_annotations = json["fits"][key]["branch-annotations"];

    if (!initial_branch_annotations) {
      initial_branch_annotations = json["fits"][key]["rate distributions"];
    }

    // Iterate over objects
    var branch_annotations = _.mapObject(initial_branch_annotations, function (val, key) {
      return { length: val };
    });

    return branch_annotations;
  },

  initialize: function initialize() {},

  render: function render() {
    var self = this;

    return React.createElement(
      "div",
      { className: "tab-content" },
      React.createElement(
        "div",
        { className: "tab-pane active", id: "datamonkey-relax-summary-tab" },
        React.createElement(
          "div",
          { id: "hyphy-relax-summary", className: "row" },
          React.createElement(
            "div",
            { className: "col-md-12" },
            React.createElement(
              "ul",
              { className: "list-group" },
              React.createElement(
                "li",
                { className: "list-group-item list-group-item-info" },
                React.createElement(
                  "h3",
                  { className: "list-group-item-heading" },
                  React.createElement("i", { className: "fa fa-list", style: { marginRight: "10px" } }),
                  React.createElement(
                    "span",
                    { id: "summary-method-name" },
                    "RELAX(ed selection test)"
                  ),
                  " ",
                  "summary"
                ),
                React.createElement(
                  "p",
                  {
                    className: "list-group-item-text lead",
                    style: { marginTop: "0.5em" }
                  },
                  "Test for selection",
                  " ",
                  React.createElement(
                    "strong",
                    { id: "summary-direction" },
                    this.state.direction
                  ),
                  " ",
                  "(",
                  React.createElement(
                    "abbr",
                    { title: "Relaxation coefficient" },
                    "K"
                  ),
                  " =",
                  " ",
                  React.createElement(
                    "strong",
                    { id: "summary-K" },
                    this.state.summary_k
                  ),
                  ") was",
                  " ",
                  React.createElement(
                    "strong",
                    { id: "summary-evidence" },
                    this.state.evidence
                  ),
                  " ",
                  "(p = ",
                  React.createElement(
                    "strong",
                    { id: "summary-pvalue" },
                    this.state.p
                  ),
                  ",",
                  " ",
                  React.createElement(
                    "abbr",
                    { title: "Likelihood ratio statistic" },
                    "LR"
                  ),
                  " =",
                  " ",
                  React.createElement(
                    "strong",
                    { id: "summary-LRT" },
                    this.state.lrt
                  ),
                  ")"
                ),
                React.createElement(
                  "p",
                  null,
                  React.createElement(
                    "small",
                    null,
                    "Please cite",
                    " ",
                    React.createElement(
                      "a",
                      { href: this.state.pmid_href, id: "summary-pmid" },
                      this.state.pmid_text
                    ),
                    " ",
                    "if you use this result in a publication, presentation, or other scientific work."
                  )
                )
              )
            )
          )
        ),
        React.createElement(
          "div",
          { id: "hyphy-model-fits", className: "row" },
          React.createElement(_model_fits.ModelFits, { json: self.state.json })
        ),
        React.createElement(
          "div",
          { id: "hyphy-omega-plots", className: "row" },
          React.createElement(_omega_plots.OmegaPlotGrid, { json: self.state.json })
        )
      ),
      React.createElement(
        "div",
        { className: "tab-pane", id: "tree-tab" },
        React.createElement(_tree.Tree, { json: self.state.json, settings: self.state.settings })
      )
    );
  }
});

// Will need to make a call to this
// omega distributions
function render_relax(url, element) {
  ReactDOM.render(React.createElement(RELAX, { url: url }), document.getElementById(element));
}

module.exports = render_relax;

/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _tables = __webpack_require__(6);

var _navbar = __webpack_require__(4);

var _scrollspy = __webpack_require__(5);

var _graphs = __webpack_require__(9);

var _input_info = __webpack_require__(8);

var React = __webpack_require__(0),
    ReactDOM = __webpack_require__(3),
    _ = __webpack_require__(1),
    datamonkey = __webpack_require__(2);

__webpack_require__(19);

var SLACSites = React.createClass({
  displayName: "SLACSites",

  propTypes: {
    headers: React.PropTypes.arrayOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    mle: React.PropTypes.object.isRequired,
    sample25: React.PropTypes.object,
    sampleMedian: React.PropTypes.object,
    sample975: React.PropTypes.object,
    initialAmbigHandling: React.PropTypes.string.isRequired,
    partitionSites: React.PropTypes.object.isRequired
  },

  getInitialState: function getInitialState() {
    var canDoCI = this.props.sample25 && this.props.sampleMedian && this.props.sample975;

    return {
      ambigOptions: this.dm_AmbigOptions(this.props),
      ambigHandling: this.props.initialAmbigHandling,
      filters: new Object(null),
      showIntervals: false,
      showCellColoring: canDoCI,
      hasCI: canDoCI,
      filterField: ["Site", -1],
      filterOp: "AND",
      canAddFilter: false,
      lowerFilterBound: -Infinity,
      upperFilterBound: Infinity
    };
  },

  getDefaultProps: function getDefaultProps() {
    return {
      sample25: null,
      sampleMedian: null,
      sample975: null,
      initialAmbigHandling: "RESOLVED"
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({
      ambigOptions: this.dm_AmbigOptions(nextProps),
      ambigHandling: nextProps.initialAmbigHandling
    });
  },

  dm_formatNumber: d3.format(".3r"),
  dm_formatNumberShort: d3.format(".2r"),
  dm_rangeColorizer: d3.scale.linear().range([d3.rgb("blue"), d3.rgb("white"), d3.rgb("red")]).clamp(true).domain([-1, 0, 1]),
  dm_rangeTextColorizer: d3.scale.linear().range([d3.rgb("white"), d3.rgb("black"), d3.rgb("black")]).clamp(true).domain([-1, -0.25, 1]),

  dm_log10times: _.before(10, function (v) {
    //console.log(v);
    return 0;
  }),

  dm_formatInterval: function dm_formatInterval(values) {
    //this.dm_log10times (values);

    return this.dm_formatNumber(values[0]) + " / " + this.dm_formatNumber(values[2]) + " [" + this.dm_formatNumber(values[1]) + " : " + this.dm_formatNumber(values[3]) + "]";
  },

  dm_AmbigOptions: function dm_AmbigOptions(theseProps) {
    return _.keys(theseProps.mle[0]);
  },

  dm_setAmbigOption: function dm_setAmbigOption(value) {
    this.setState({
      ambigHandling: value
    });
  },

  dm_toggleIntervals: function dm_toggleIntervals(event) {
    this.setState({
      showIntervals: !this.state.showIntervals,
      showCellColoring: this.state.showIntervals ? this.state.showCellColoring : false
    });
  },

  dm_toggleCellColoring: function dm_toggleCellColoring(event) {
    this.setState({
      showCellColoring: !this.state.showCellColoring
    });
  },

  dm_toggleVariableFilter: function dm_toggleVariableFilter(event) {
    var filterState = new Object(null);
    _.extend(filterState, this.state.filters);
    if (!("variable" in this.state.filters)) {
      filterState["variable"] = true;
    } else {
      delete filterState["variable"];
    }
    this.setState({ filters: filterState });
  },

  dm_makeFilterFunction: function dm_makeFilterFunction() {
    var filterFunction = null;

    _.each(this.state.filters, function (value, key) {
      var composeFunction = null;

      switch (key) {
        case "variable":
          {
            if (filterFunction) {
              composeFunction = function composeFunction(f, partitionIndex, index, site, siteData) {
                return f(partitionIndex, index, site, siteData) && siteData[2] + siteData[3] > 0;
              };
            } else {
              filterFunction = function filterFunction(partitionIndex, index, site, siteData) {
                return siteData[2] + siteData[3] > 0;
              };
            }
            break;
          }
        default:
          {
            if (_.isArray(value)) {
              var new_condition = null,
                  filter_index = value[0][1];
              switch (filter_index) {
                case -2:
                  new_condition = function new_condition(partitionIndex, index, site, siteData) {
                    return partitionIndex >= value[1] && partitionIndex <= value[2];
                  };
                  break;
                case -1:
                  new_condition = function new_condition(partitionIndex, index, site, siteData) {
                    return site >= value[1] && site <= value[2];
                  };
                  break;
                default:
                  new_condition = function new_condition(partitionIndex, index, site, siteData) {
                    return siteData[filter_index] >= value[1] && siteData[filter_index] <= value[2];
                  };
              }

              if (new_condition) {
                if (value[3] == "AND") {
                  composeFunction = function composeFunction(f, partitionIndex, index, site, siteData) {
                    return (!f || f(partitionIndex, index, site, siteData)) && new_condition(partitionIndex, index, site, siteData);
                  };
                } else {
                  if (filterFunction) {
                    composeFunction = function composeFunction(f, partitionIndex, index, site, siteData) {
                      return f(partitionIndex, index, site, siteData) || new_condition(partitionIndex, index, site, siteData);
                    };
                  } else {
                    filterFunction = function filterFunction(partitionIndex, index, site, siteData) {
                      return new_condition(partitionIndex, index, site, siteData);
                    };
                  }
                }
              }
            }
          }
      }

      if (composeFunction) {
        filterFunction = _.wrap(filterFunction, composeFunction);
      }
    });

    return filterFunction;
  },

  dm_makeHeaderRow: function dm_makeHeaderRow() {
    var headers = [{ value: "Partition", sortable: true }, { value: "Site", sortable: true }],
        doCI = this.state.showIntervals,
        filterable = [["Partition", -2], ["Site", -1]];

    if (doCI) {
      var secondRow = ["", ""];

      _.each(this.props.headers, function (value, index) {
        headers.push({
          value: value[0],
          abbr: value[1],
          span: 4,
          style: { textAlign: "center" }
        });
        filterable.push([value[0], index]);
        _.each(["MLE", "Med", "2.5%", "97.5%"], function (v) {
          secondRow.push({ value: v, sortable: true });
        });
      });
      return { headers: [headers, secondRow], filterable: filterable };
    } else {
      _.each(this.props.headers, function (value, index) {
        headers.push({ value: value[0], abbr: value[1], sortable: true });
        filterable.push([value[0], index]);
      });
    }
    return { headers: headers, filterable: filterable };
  },

  dm_makeDataRows: function dm_makeDataRows(filter) {
    var rows = [],
        partitionCount = datamonkey.helpers.countPartitionsJSON(this.props.partitionSites),
        partitionIndex = 0,
        self = this,
        doCI = this.state.showIntervals,
        siteCount = 0;

    while (partitionIndex < partitionCount) {
      _.each(self.props.partitionSites[partitionIndex].coverage[0], function (site, index) {
        var siteData = self.props.mle[partitionIndex][self.state.ambigHandling][index];
        if (!filter || filter(partitionIndex + 1, index + 1, site + 1, siteData)) {
          var thisRow = [partitionIndex + 1, site + 1];
          //secondRow = doCI ? ['',''] : null;
          siteCount++;

          _.each(siteData, function (estimate, colIndex) {
            var sampled_range = null,
                scaled_median_mle_dev = 0;

            if (self.state.hasCI) {
              sampled_range = [self.props.sampleMedian[partitionIndex][self.state.ambigHandling][index][colIndex], self.props.sample25[partitionIndex][self.state.ambigHandling][index][colIndex], self.props.sample975[partitionIndex][self.state.ambigHandling][index][colIndex]];

              var range = sampled_range[2] - sampled_range[1];
              if (range > 0) {
                scaled_median_mle_dev = (estimate - sampled_range[0]) / range;
              }
            }

            if (doCI) {
              thisRow.push({ value: estimate, format: self.dm_formatNumber });
              thisRow.push({
                value: sampled_range[0],
                format: self.dm_formatNumberShort
              });
              thisRow.push({
                value: sampled_range[1],
                format: self.dm_formatNumberShort
              });
              thisRow.push({
                value: sampled_range[2],
                format: self.dm_formatNumberShort
              });
            } else {
              var this_cell = { value: estimate, format: self.dm_formatNumber };
              if (self.state.hasCI) {
                if (self.state.showCellColoring) {
                  this_cell.style = {
                    backgroundColor: self.dm_rangeColorizer(scaled_median_mle_dev),
                    color: self.dm_rangeTextColorizer(scaled_median_mle_dev)
                  };
                }
                this_cell.tooltip = self.dm_formatNumberShort(sampled_range[0]) + " [" + self.dm_formatNumberShort(sampled_range[1]) + " - " + self.dm_formatNumberShort(sampled_range[2]) + "]";
              }
              thisRow.push(this_cell);
            }
          });
          rows.push(thisRow);
          //if (secondRow) {
          //    rows.push (secondRow);
          //}
        }
      });

      partitionIndex++;
    }

    return { rows: rows, count: siteCount };
  },

  dm_handleLB: function dm_handleLB(e) {
    var new_value = parseFloat(e.target.value);
    this.setState({
      lowerFilterBound: _.isFinite(new_value) ? new_value : -Infinity
    });
  },

  dm_handleUB: function dm_handleUB(e) {
    var new_value = parseFloat(e.target.value);
    this.setState({
      upperFilterBound: _.isFinite(new_value) ? new_value : Infinity
    });
  },

  dm_handleFilterField: function dm_handleFilterField(value) {
    this.setState({ filterField: value });
  },

  dm_checkFilterValidity: function dm_checkFilterValidity() {
    if (_.isFinite(this.state.lowerFilterBound)) {
      if (_.isFinite(this.state.upperFilterBound)) {
        return this.state.lowerFilterBound <= this.state.upperFilterBound;
      }
      return true;
    }
    return _.isFinite(this.state.upperFilterBound);
  },

  dm_unique_filter_ID: 0,

  dm_handleAddCondition: function dm_handleAddCondition(e) {
    e.preventDefault();
    var filterState = new Object(null);
    _.extend(filterState, this.state.filters);
    filterState[this.dm_unique_filter_ID++] = [this.state.filterField, this.state.lowerFilterBound, this.state.upperFilterBound, this.state.filterOp];

    this.setState({ filters: filterState });
  },

  dm_handleRemoveCondition: function dm_handleRemoveCondition(key, e) {
    e.preventDefault();

    _.extend(filterState, this.state.filters);
    delete filterState[key];
    //console.log (key, this.state.filters,filterState);

    this.setState({ filters: filterState });
  },

  render: function render() {
    var self = this;

    var _dm_makeDataRows = this.dm_makeDataRows(this.dm_makeFilterFunction()),
        rows = _dm_makeDataRows.rows,
        count = _dm_makeDataRows.count;

    var _dm_makeHeaderRow = this.dm_makeHeaderRow(),
        headers = _dm_makeHeaderRow.headers,
        filterable = _dm_makeHeaderRow.filterable;

    var show_ci_menu = function show_ci_menu() {
      if (self.state.hasCI) {
        var ci_menu = [React.createElement("li", { key: "ci_divider", className: "divider" }), React.createElement(
          "li",
          { key: "intervals" },
          React.createElement(
            "a",
            {
              href: "#",
              "data-value": "showIntervals",
              tabIndex: "-1",
              onClick: self.dm_toggleIntervals
            },
            React.createElement("input", {
              type: "checkbox",
              checked: self.state.showIntervals,
              defaultChecked: self.state.showIntervals,
              onChange: self.dm_toggleIntervals
            }),
            "\xA0Show sampling confidence intervals"
          )
        )];

        if (!self.state.showIntervals) {
          ci_menu.push(React.createElement(
            "li",
            { key: "coloring" },
            React.createElement(
              "a",
              {
                href: "#",
                "data-value": "showIntervals",
                tabIndex: "-1",
                onClick: self.dm_toggleCellColoring
              },
              React.createElement("input", {
                type: "checkbox",
                checked: self.state.showCellColoring,
                defaultChecked: self.state.showCellColoring,
                onChange: self.dm_toggleCellColoring
              }),
              "\xA0Color cells based on MLE-median"
            )
          ));
        }
        return ci_menu;
      }
      return null;
    };

    var result = React.createElement(
      "div",
      { className: "table-responsive" },
      React.createElement(
        "nav",
        { className: "navbar" },
        React.createElement(
          "form",
          { className: "navbar-form " },
          React.createElement(
            "div",
            { className: "form-group navbar-left" },
            React.createElement(
              "div",
              { className: "input-group" },
              React.createElement(
                "span",
                { className: "input-group-addon" },
                "Display Options "
              ),
              React.createElement(
                "ul",
                { className: "dropdown-menu" },
                React.createElement(
                  "li",
                  { key: "variable" },
                  React.createElement(
                    "a",
                    {
                      href: "#",
                      "data-value": "variable",
                      tabIndex: "-1",
                      onClick: self.dm_toggleVariableFilter
                    },
                    React.createElement("input", {
                      type: "checkbox",
                      checked: "variable" in self.state.filters,
                      defaultChecked: "variable" in self.state.filters,
                      onChange: self.dm_toggleVariableFilter
                    }),
                    "\xA0Variable sites only"
                  )
                ),
                show_ci_menu()
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-default btn-sm dropdown-toggle form-control",
                  type: "button",
                  "data-toggle": "dropdown",
                  "aria-haspopup": "true",
                  "aria-expanded": "false"
                },
                React.createElement("span", { className: "caret" })
              )
            ),
            React.createElement(
              "div",
              { className: "input-group" },
              React.createElement(
                "span",
                { className: "input-group-addon" },
                "Ambiguities "
              ),
              React.createElement(
                "ul",
                { className: "dropdown-menu" },
                _.map(this.state.ambigOptions, function (value, index) {
                  return React.createElement(
                    "li",
                    { key: index },
                    React.createElement(
                      "a",
                      {
                        href: "#",
                        tabIndex: "-1",
                        onClick: _.partial(self.dm_setAmbigOption, value)
                      },
                      value
                    )
                  );
                })
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-default btn-sm dropdown-toggle form-control",
                  type: "button",
                  "data-toggle": "dropdown",
                  "aria-haspopup": "true",
                  "aria-expanded": "false"
                },
                self.state.ambigHandling,
                " ",
                React.createElement("span", { className: "caret" })
              )
            )
          ),
          React.createElement(
            "div",
            { className: "form-group navbar-right" },
            React.createElement(
              "div",
              { className: "input-group" },
              React.createElement(
                "ul",
                { className: "dropdown-menu" },
                _.map(filterable, function (d, index) {
                  return React.createElement(
                    "li",
                    { key: index },
                    React.createElement(
                      "a",
                      {
                        href: "#",
                        tabIndex: "-1",
                        onClick: _.partial(self.dm_handleFilterField, d)
                      },
                      d[0]
                    )
                  );
                })
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-default btn-sm dropdown-toggle form-control",
                  type: "button",
                  "data-toggle": "dropdown",
                  "aria-haspopup": "true",
                  "aria-expanded": "false"
                },
                self.state.filterField[0],
                " ",
                React.createElement("span", { className: "caret" })
              )
            ),
            React.createElement(
              "div",
              { className: "input-group" },
              React.createElement(
                "span",
                { className: "input-group-addon" },
                " ",
                "is in [",
                " "
              ),
              React.createElement("input", {
                type: "text",
                className: "form-control",
                placeholder: "-\u221E",
                defaultValue: "-" + String.fromCharCode(8734),
                onChange: self.dm_handleLB
              })
            ),
            React.createElement(
              "div",
              { className: "input-group" },
              React.createElement(
                "span",
                { className: "input-group-addon" },
                ","
              ),
              React.createElement("input", {
                type: "text",
                className: "form-control",
                placeholder: "\u221E",
                defaultValue: String.fromCharCode(8734),
                onChange: self.dm_handleUB
              }),
              React.createElement(
                "span",
                { className: "input-group-addon" },
                "]"
              )
            ),
            React.createElement(
              "div",
              { className: "input-group" },
              React.createElement(
                "button",
                {
                  className: "btn btn-default " + (self.dm_checkFilterValidity() ? "" : "disabled"),
                  onClick: self.dm_handleAddCondition
                },
                " ",
                "Add condition as",
                " "
              )
            ),
            React.createElement(
              "div",
              { className: "input-group" },
              React.createElement(
                "ul",
                { className: "dropdown-menu" },
                _.map(["AND", "OR"], function (d, index) {
                  return React.createElement(
                    "li",
                    { key: index },
                    React.createElement(
                      "a",
                      {
                        href: "#",
                        tabIndex: "-1",
                        onClick: function onClick() {
                          self.setState({ filterOp: d });
                        }
                      },
                      d
                    )
                  );
                })
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-default btn-sm dropdown-toggle form-control",
                  type: "button",
                  "data-toggle": "dropdown",
                  "aria-haspopup": "true",
                  "aria-expanded": "false"
                },
                self.state.filterOp,
                " ",
                React.createElement("span", { className: "caret" })
              )
            ),
            React.createElement(
              "span",
              { className: "badge", style: { marginLeft: "0.5em" } },
              count
            ),
            " ",
            "sites shown"
          )
        )
      ),
      self.state.hasCI ? React.createElement(
        "div",
        { className: "alert alert-info alert-dismissable" },
        React.createElement(
          "button",
          {
            type: "button",
            className: "close pull-right",
            "data-dismiss": "alert",
            "aria-hidden": "true"
          },
          " ",
          "\xD7",
          " "
        ),
        "Default table shading is used to indicate the magnitude of difference between the estimate of a specific quantity using the MLE ancestral state reconstruction, and the median of the estimate using a sample from the distribution of ancestral state reconstructions.",
        React.createElement("br", null),
        React.createElement(
          "strong",
          null,
          "Color legend:"
        ),
        " MLE is \xA0",
        React.createElement(
          "span",
          {
            className: "badge",
            style: { backgroundColor: self.dm_rangeColorizer(-1) }
          },
          "is much less"
        ),
        "\xA0",
        React.createElement(
          "span",
          {
            className: "badge",
            style: {
              backgroundColor: self.dm_rangeColorizer(0),
              color: "black"
            }
          },
          "is the same as"
        ),
        "\xA0",
        React.createElement(
          "span",
          {
            className: "badge",
            style: { backgroundColor: self.dm_rangeColorizer(1) }
          },
          "is much greater"
        ),
        "\xA0 than the sampled median. You can mouse over the cells to see individual sampling intervals."
      ) : null,
      _.keys(self.state.filters).length > 0 ? React.createElement(
        "div",
        { className: "well well-sm" },
        _.map(self.state.filters, function (value, key) {
          if (key == "variable") {
            return React.createElement(
              "div",
              {
                className: "input-group",
                style: { display: "inline" },
                key: key
              },
              React.createElement(
                "span",
                { className: "badge badge-info" },
                "(AND) variable sites",
                React.createElement("i", {
                  className: "fa fa-times-circle",
                  style: { marginLeft: "0.25em" },
                  onClick: self.dm_toggleVariableFilter
                })
              )
            );
          } else {
            var label = (value[3] == "AND" ? " (AND) " : " (OR) ") + value[0][0];

            if (_.isFinite(value[1])) {
              if (_.isFinite(value[2])) {
                label += String.fromCharCode(8712) + "[" + value[1] + "," + value[2] + "]";
              } else {
                label += String.fromCharCode(8805) + value[1];
              }
            } else {
              label += String.fromCharCode(8804) + value[2];
            }

            return React.createElement(
              "div",
              {
                className: "input-group",
                style: { display: "inline" },
                key: key
              },
              React.createElement(
                "span",
                { className: "badge badge-info" },
                label,
                React.createElement("i", {
                  className: "fa fa-times-circle",
                  style: { marginLeft: "0.25em" },
                  onClick: _.bind(_.partial(self.dm_handleRemoveCondition, key), self)
                })
              )
            );
          }
        })
      ) : null,
      React.createElement(_tables.DatamonkeyTable, {
        headerData: headers,
        bodyData: rows,
        initialSort: 1,
        paginate: 20,
        export_csv: true
      })
    );

    return result;
  }
});

var SLACBanner = React.createClass({
  displayName: "SLACBanner",

  dm_countSites: function dm_countSites(json, cutoff) {
    var result = {
      all: 0,
      positive: 0,
      negative: 0
    };

    result.all = datamonkey.helpers.countSitesFromPartitionsJSON(json);

    result.positive = datamonkey.helpers.sum(json["MLE"]["content"], function (partition) {
      return _.reduce(partition["by-site"]["RESOLVED"], function (sum, row) {
        return sum + (row[8] <= cutoff ? 1 : 0);
      }, 0);
    });

    result.negative = datamonkey.helpers.sum(json["MLE"]["content"], function (partition) {
      return _.reduce(partition["by-site"]["RESOLVED"], function (sum, row) {
        return sum + (row[9] <= cutoff ? 1 : 0);
      }, 0);
    });

    return result;
  },

  dm_computeState: function dm_computeState(state, pvalue) {
    return {
      sites: this.dm_countSites(state, pvalue)
    };
  },

  dm_formatP: d3.format(".3f"),

  getInitialState: function getInitialState() {
    return this.dm_computeState(this.props.analysis_results, this.props.pValue);
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState(this.dm_computeState(nextProps.analysis_results, nextProps.pValue));
  },

  render: function render() {
    return React.createElement(
      "div",
      { className: "row", id: "slac-summary" },
      React.createElement(
        "div",
        { className: "col-md-12" },
        React.createElement(
          "h3",
          { className: "list-group-item-heading" },
          React.createElement(
            "span",
            { className: "summary-method-name" },
            "Single-Likelihood Ancestor Counting"
          ),
          React.createElement("br", null),
          React.createElement(
            "span",
            { className: "results-summary" },
            "results summary"
          )
        )
      ),
      React.createElement(
        "div",
        { className: "col-md-12" },
        React.createElement(_input_info.InputInfo, { input_data: this.props.input_data })
      ),
      React.createElement(
        "div",
        { className: "col-md-12" },
        React.createElement(
          "div",
          { className: "main-result" },
          React.createElement(
            "p",
            null,
            "Evidence",
            React.createElement(
              "sup",
              null,
              "\u2020"
            ),
            " of pervasive",
            " ",
            React.createElement(
              "span",
              { className: "hyphy-highlight" },
              "diversifying"
            ),
            "/",
            React.createElement(
              "span",
              { className: "hyphy-highlight" },
              "purifying"
            ),
            " ",
            "selection was found at",
            React.createElement(
              "strong",
              { className: "hyphy-highlight" },
              " ",
              this.state.sites.positive
            ),
            " ",
            "/",
            " ",
            React.createElement(
              "strong",
              { className: "hyphy-navy" },
              this.state.sites.negative
            ),
            " ",
            "sites among ",
            this.state.sites.all,
            " tested sites."
          ),
          React.createElement(
            "div",
            { style: { marginBottom: "0em" } },
            React.createElement(
              "small",
              null,
              React.createElement(
                "sup",
                null,
                "\u2020"
              ),
              "Extended binomial test, p \u2264",
              " ",
              this.dm_formatP(this.props.pValue),
              React.createElement(
                "div",
                {
                  className: "dropdown hidden-print",
                  style: { display: "inline", marginLeft: "0.25em" }
                },
                React.createElement(
                  "button",
                  {
                    id: "dm.pvalue.slider",
                    type: "button",
                    className: "btn btn-primary btn-xs dropdown-toggle",
                    "data-toggle": "dropdown",
                    "aria-haspopup": "true",
                    "aria-expanded": "false"
                  },
                  React.createElement("span", { className: "caret" })
                ),
                React.createElement(
                  "ul",
                  {
                    className: "dropdown-menu",
                    "aria-labelledby": "dm.pvalue.slider"
                  },
                  React.createElement(
                    "li",
                    null,
                    React.createElement(
                      "a",
                      { href: "#" },
                      React.createElement("input", {
                        type: "range",
                        min: "0",
                        max: "1",
                        value: this.props.pValue,
                        step: "0.01",
                        onChange: this.props.pAdjuster
                      })
                    )
                  )
                )
              ),
              React.createElement(
                "emph",
                null,
                " not"
              ),
              " corrected for multiple testing; ambiguous characters resolved to minimize substitution counts.",
              React.createElement("br", null),
              React.createElement("i", { className: "fa fa-exclamation-circle" }),
              " Please cite",
              " ",
              React.createElement(
                "a",
                {
                  href: "http://www.ncbi.nlm.nih.gov/pubmed/15703242",
                  target: "_blank"
                },
                "PMID 15703242"
              ),
              " ",
              "if you use this result in a publication, presentation, or other scientific work."
            )
          )
        )
      )
    );
  }
});

var SLACGraphs = React.createClass({
  displayName: "SLACGraphs",

  getInitialState: function getInitialState() {
    return {
      ambigHandling: this.props.initialAmbigHandling,
      ambigOptions: this.dm_AmbigOptions(this.props),
      xLabel: "Site",
      yLabel: "dN-dS"
    };
  },

  getDefaultProps: function getDefaultProps() {
    return {
      mle: null,
      partitionSites: null,
      initialAmbigHandling: "RESOLVED"
    };
  },

  dm_AmbigOptions: function dm_AmbigOptions(theseProps) {
    return _.keys(theseProps.mle[0]);
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    this.setState({
      ambigOptions: this.dm_AmbigOptions(nextProps),
      ambigHandling: nextProps.initialAmbigHandling
    });
  },

  dm_makePlotData: function dm_makePlotData(xlabel, ylabels) {
    var self = this;

    var x = [];
    var y = [[]];

    var partitionCount = datamonkey.helpers.countPartitionsJSON(this.props.partitionSites),
        partitionIndex = 0,
        siteCount = 0,
        col_index = [],
        x_index = -1;

    _.each(self.props.headers, function (d, i) {
      if (_.find(ylabels, function (l) {
        return l == d[0];
      })) {
        col_index.push(i);
      }
    });

    x_index = _.pluck(self.props.headers, 0).indexOf(xlabel);

    y = _.map(col_index, function () {
      return [];
    });

    while (partitionIndex < partitionCount) {
      _.each(self.props.partitionSites[partitionIndex].coverage[0], function (site, index) {
        var siteData = self.props.mle[partitionIndex][self.state.ambigHandling][index];
        siteCount++;
        if (x_index < 0) {
          x.push(siteCount);
        } else {
          x.push(siteData[x_index]);
        }
        _.each(col_index, function (ci, i) {
          y[i].push(siteData[ci]);
        });
      });

      partitionIndex++;
    }

    return { x: x, y: y };
  },

  dm_xAxis: function dm_xAxis(column) {
    this.setState({ xLabel: column });
  },

  dm_yAxis: function dm_yAxis(column) {
    this.setState({ yLabel: column });
  },

  dm_setAmbigOption: function dm_setAmbigOption(value) {
    this.setState({
      ambigHandling: value
    });
  },

  dm_doScatter: function dm_doScatter() {
    return this.state.xLabel != "Site";
  },

  render: function render() {
    var self = this;

    var _dm_makePlotData = this.dm_makePlotData(this.state.xLabel, [this.state.yLabel]),
        x = _dm_makePlotData.x,
        y = _dm_makePlotData.y;

    return React.createElement(
      "div",
      { className: "row" },
      React.createElement(
        "nav",
        { className: "navbar" },
        React.createElement(
          "form",
          { className: "navbar-form " },
          React.createElement(
            "div",
            { className: "form-group navbar-left" },
            React.createElement(
              "div",
              { className: "input-group" },
              React.createElement(
                "span",
                { className: "input-group-addon" },
                "X-axis:"
              ),
              React.createElement(
                "ul",
                { className: "dropdown-menu" },
                _.map(["Site"].concat(_.pluck(self.props.headers, 0)), function (value) {
                  return React.createElement(
                    "li",
                    { key: value },
                    React.createElement(
                      "a",
                      {
                        href: "#",
                        tabIndex: "-1",
                        onClick: _.partial(self.dm_xAxis, value)
                      },
                      value
                    )
                  );
                })
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-default btn-sm dropdown-toggle form-control",
                  type: "button",
                  "data-toggle": "dropdown",
                  "aria-haspopup": "true",
                  "aria-expanded": "false"
                },
                self.state.xLabel,
                React.createElement("span", { className: "caret" })
              )
            ),
            React.createElement(
              "div",
              { className: "input-group" },
              React.createElement(
                "span",
                { className: "input-group-addon" },
                "Y-axis:"
              ),
              React.createElement(
                "ul",
                { className: "dropdown-menu" },
                _.map(_.pluck(self.props.headers, 0), function (value) {
                  return React.createElement(
                    "li",
                    { key: value },
                    React.createElement(
                      "a",
                      {
                        href: "#",
                        tabIndex: "-1",
                        onClick: _.partial(self.dm_yAxis, value)
                      },
                      value
                    )
                  );
                })
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-default btn-sm dropdown-toggle form-control",
                  type: "button",
                  "data-toggle": "dropdown",
                  "aria-haspopup": "true",
                  "aria-expanded": "false"
                },
                self.state.yLabel,
                React.createElement("span", { className: "caret" })
              )
            ),
            React.createElement(
              "div",
              { className: "input-group" },
              React.createElement(
                "span",
                { className: "input-group-addon" },
                "Ambiguities "
              ),
              React.createElement(
                "ul",
                { className: "dropdown-menu" },
                _.map(this.state.ambigOptions, function (value, index) {
                  return React.createElement(
                    "li",
                    { key: index },
                    React.createElement(
                      "a",
                      {
                        href: "#",
                        tabIndex: "-1",
                        onClick: _.partial(self.dm_setAmbigOption, value)
                      },
                      value
                    )
                  );
                })
              ),
              React.createElement(
                "button",
                {
                  className: "btn btn-default btn-sm dropdown-toggle form-control",
                  type: "button",
                  "data-toggle": "dropdown",
                  "aria-haspopup": "true",
                  "aria-expanded": "false"
                },
                self.state.ambigHandling,
                " ",
                React.createElement("span", { className: "caret" })
              )
            )
          )
        )
      ),
      self.dm_doScatter() ? React.createElement(_graphs.DatamonkeyScatterplot, {
        x: x,
        y: y,
        marginLeft: 50,
        transitions: true
      }) : React.createElement(_graphs.DatamonkeySeries, {
        x: x,
        y: y,
        marginLeft: 50,
        transitions: true,
        doDots: true
      })
    );
  }
});

var SLAC = React.createClass({
  displayName: "SLAC",

  float_format: d3.format(".2f"),

  dm_loadFromServer: function dm_loadFromServer() {
    /* 20160721 SLKP: prefixing all custom (i.e. not defined by REACT) with dm_
     to make it easier to recognize scoping immediately */

    var self = this;

    d3.json(self.props.url, function (request_error, data) {
      if (!data) {
        var error_message_text = request_error.status == 404 ? self.props.url + " could not be loaded" : request_error.statusText;
        self.setState({ error_message: error_message_text });
      } else {
        self.dm_initializeFromJSON(data);
      }
    });
  },

  dm_initializeFromJSON: function dm_initializeFromJSON(data) {
    this.setState({
      analysis_results: data,
      input_data: data.input_data
    });
  },

  getDefaultProps: function getDefaultProps() {
    /* default properties for the component */

    return {
      url: "#"
    };
  },

  getInitialState: function getInitialState() {
    return {
      analysis_results: null,
      error_message: null,
      pValue: 0.1,
      input_data: null
    };
  },

  componentWillMount: function componentWillMount() {
    this.dm_loadFromServer();
    this.dm_setEvents();
  },

  dm_setEvents: function dm_setEvents() {
    var self = this;

    $("#datamonkey-json-file").on("change", function (e) {
      var files = e.target.files; // FileList object

      if (files.length == 1) {
        var f = files[0];
        var reader = new FileReader();

        reader.onload = function (theFile) {
          return function (e) {
            try {
              self.dm_initializeFromJSON(JSON.parse(this.result));
            } catch (error) {
              self.setState({ error_message: error.toString() });
            }
          };
        }(f);

        reader.readAsText(f);
      }

      $("#datamonkey-json-file-toggle").dropdown("toggle");
    });
  },

  dm_adjustPvalue: function dm_adjustPvalue(event) {
    this.setState({ pValue: parseFloat(event.target.value) });
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    $("body").scrollspy({
      target: ".bs-docs-sidebar",
      offset: 50
    });
    $('[data-toggle="popover"]').popover();
  },


  render: function render() {
    var self = this;

    if (self.state.error_message) {
      return React.createElement(
        "div",
        {
          id: "datamonkey-error",
          className: "alert alert-danger alert-dismissible",
          role: "alert"
        },
        React.createElement(
          "button",
          {
            type: "button",
            className: "close",
            "data-dismiss": "alert",
            "aria-label": "Close"
          },
          React.createElement(
            "span",
            { "aria-hidden": "true" },
            "\xD7"
          )
        ),
        React.createElement(
          "strong",
          null,
          self.state.error_message
        ),
        " ",
        React.createElement("span", { id: "datamonkey-error-text" })
      );
    }

    if (self.state.analysis_results) {
      var scrollspy_info = [{ label: "summary", href: "slac-summary" }, { label: "information", href: "datamonkey-slac-tree-summary" }, { label: "table", href: "slac-table" }, { label: "graph", href: "slac-graph" }];
      return React.createElement(
        "div",
        null,
        React.createElement(_navbar.NavBar, null),
        React.createElement(
          "div",
          { className: "container" },
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(_scrollspy.ScrollSpy, { info: scrollspy_info }),
            React.createElement(
              "div",
              { className: "col-md-10" },
              React.createElement(
                "div",
                { id: "results" },
                React.createElement(SLACBanner, {
                  analysis_results: self.state.analysis_results,
                  pValue: self.state.pValue,
                  pAdjuster: _.bind(self.dm_adjustPvalue, self),
                  input_data: self.state.input_data
                }),
                React.createElement(
                  "div",
                  { className: "row hidden-print" },
                  React.createElement(
                    "div",
                    {
                      id: "datamonkey-slac-tree-summary",
                      className: "col-lg-4 col-md-6 col-sm-12"
                    },
                    React.createElement(
                      "h4",
                      { className: "dm-table-header" },
                      "Partition information"
                    ),
                    React.createElement(
                      "small",
                      null,
                      React.createElement(_tables.DatamonkeyPartitionTable, {
                        pValue: self.state.pValue,
                        trees: self.state.analysis_results.trees,
                        partitions: self.state.analysis_results.partitions,
                        branchAttributes: self.state.analysis_results["branch attributes"],
                        siteResults: self.state.analysis_results.MLE,
                        accessorPositive: function accessorPositive(json, partition) {
                          return _.map(json["content"][partition]["by-site"]["AVERAGED"], function (v) {
                            return v[8];
                          });
                        },
                        accessorNegative: function accessorNegative(json, partition) {
                          return _.map(json["content"][partition]["by-site"]["AVERAGED"], function (v) {
                            return v[9];
                          });
                        }
                      })
                    )
                  ),
                  React.createElement(
                    "div",
                    {
                      id: "datamonkey-slac-model-fits",
                      className: "col-lg-5 col-md-6 col-sm-12"
                    },
                    React.createElement(
                      "small",
                      null,
                      React.createElement(_tables.DatamonkeyModelTable, {
                        fits: self.state.analysis_results.fits
                      })
                    )
                  ),
                  React.createElement(
                    "div",
                    {
                      id: "datamonkey-slac-timers",
                      className: "col-lg-3 col-md-3 col-sm-12"
                    },
                    React.createElement(
                      "h4",
                      { className: "dm-table-header" },
                      "Execution time"
                    ),
                    React.createElement(
                      "small",
                      null,
                      React.createElement(_tables.DatamonkeyTimersTable, {
                        timers: self.state.analysis_results.timers,
                        totalTime: "Total time"
                      })
                    )
                  )
                ),
                React.createElement(
                  "div",
                  { className: "row" },
                  React.createElement(
                    "div",
                    { className: "col-md-12", id: "slac-table" },
                    React.createElement(
                      "h4",
                      { className: "dm-table-header" },
                      "Site table"
                    ),
                    React.createElement(SLACSites, {
                      headers: self.state.analysis_results.MLE.headers,
                      mle: datamonkey.helpers.map(datamonkey.helpers.filter(self.state.analysis_results.MLE.content, function (value, key) {
                        return _.has(value, "by-site");
                      }), function (value, key) {
                        return value["by-site"];
                      }),
                      sample25: self.state.analysis_results["sample-2.5"],
                      sampleMedian: self.state.analysis_results["sample-median"],
                      sample975: self.state.analysis_results["sample-97.5"],
                      partitionSites: self.state.analysis_results.partitions
                    })
                  )
                ),
                React.createElement(
                  "div",
                  { className: "row" },
                  React.createElement(
                    "div",
                    { className: "col-md-12", i: true, id: "slac-graph" },
                    React.createElement(
                      "h4",
                      { className: "dm-table-header" },
                      "Site graph"
                    ),
                    React.createElement(SLACGraphs, {
                      mle: datamonkey.helpers.map(datamonkey.helpers.filter(self.state.analysis_results.MLE.content, function (value, key) {
                        return _.has(value, "by-site");
                      }), function (value, key) {
                        return value["by-site"];
                      }),
                      partitionSites: self.state.analysis_results.partitions,
                      headers: self.state.analysis_results.MLE.headers
                    })
                  )
                )
              )
            ),
            React.createElement("div", { className: "col-md-1" })
          )
        )
      );
    }
    return null;
  }
});

// Will need to make a call to this
// omega distributions
function render_slac(url, element) {
  ReactDOM.render(React.createElement(SLAC, { url: url }), document.getElementById(element));
}

module.exports = render_slac;

/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _navbar = __webpack_require__(4);

var _scrollspy = __webpack_require__(5);

var _input_info = __webpack_require__(8);

var _error_message = __webpack_require__(23);

var _header = __webpack_require__(24);

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var React = __webpack_require__(0),
    ReactDOM = __webpack_require__(3),
    d3 = __webpack_require__(7);

var TemplateResults = function (_React$Component) {
  _inherits(TemplateResults, _React$Component);

  function TemplateResults() {
    _classCallCheck(this, TemplateResults);

    return _possibleConstructorReturn(this, (TemplateResults.__proto__ || Object.getPrototypeOf(TemplateResults)).apply(this, arguments));
  }

  _createClass(TemplateResults, [{
    key: "render",
    value: function render() {
      if (!this.props.data) return React.createElement("div", null);
      return React.createElement(
        "div",
        { className: "row", id: "summary-tab" },
        React.createElement(
          "div",
          { className: "col-md-12" },
          React.createElement(
            "h3",
            { className: "list-group-item-heading" },
            React.createElement(
              "span",
              { className: "summary-method-name" },
              "HyPhy Vision Template"
            ),
            React.createElement("br", null),
            React.createElement(
              "span",
              { className: "results-summary" },
              "results summary"
            )
          )
        ),
        React.createElement(
          "div",
          { className: "col-md-12" },
          React.createElement(_input_info.InputInfo, { input_data: this.props.data })
        ),
        React.createElement(
          "div",
          { className: "col-md-12" },
          React.createElement(
            "div",
            { className: "main-result" },
            React.createElement(
              "p",
              null,
              "This will serve as a template for Hyphy-Vision/Datamonkey results visualizations, as well as notes on useful design patterns and best practices to allow rapid prototyping of new analyses."
            ),
            React.createElement("hr", null),
            React.createElement(
              "p",
              null,
              React.createElement(
                "small",
                null,
                "See",
                " ",
                React.createElement(
                  "a",
                  { href: "http://hyphy.org/methods/selection-methods/#absrel" },
                  "here"
                ),
                " ",
                "for more information about this method.",
                React.createElement("br", null),
                "Please cite",
                " ",
                React.createElement(
                  "a",
                  {
                    href: "http://www.ncbi.nlm.nih.gov/pubmed/25697341",
                    id: "summary-pmid",
                    target: "_blank"
                  },
                  "PMID 123456789"
                ),
                " ",
                "if you use this result in a publication, presentation, or other scientific work."
              )
            )
          )
        )
      );
    }
  }]);

  return TemplateResults;
}(React.Component);

var ReactConventions = function (_React$Component2) {
  _inherits(ReactConventions, _React$Component2);

  function ReactConventions() {
    _classCallCheck(this, ReactConventions);

    return _possibleConstructorReturn(this, (ReactConventions.__proto__ || Object.getPrototypeOf(ReactConventions)).apply(this, arguments));
  }

  _createClass(ReactConventions, [{
    key: "render",
    value: function render() {
      var popover = "<ul>\n      <li>\n        This is an example of a popover, which will describe the contents of the section that\n        correspond to this header.\n      </li>\n    </ul>";

      return React.createElement(
        "div",
        { className: "row", id: "react-tab" },
        React.createElement(
          "div",
          { className: "col-md-12" },
          React.createElement(_header.Header, { title: "React Conventions", popover: popover }),
          React.createElement(
            "p",
            { className: "description" },
            "Components initially render with no data present, which must be accounted for. An API call is made in the componentDidMount method of the Results component. All data will be stored in the state of this component, and relevant pieces will be passed down to child components as props. The state can be changed upon loading a file."
          )
        )
      );
    }
  }]);

  return ReactConventions;
}(React.Component);

var Template = function (_React$Component3) {
  _inherits(Template, _React$Component3);

  function Template(props) {
    _classCallCheck(this, Template);

    var _this3 = _possibleConstructorReturn(this, (Template.__proto__ || Object.getPrototypeOf(Template)).call(this, props));

    _this3.state = { data: null };
    _this3.onFileChange = _this3.onFileChange.bind(_this3);
    return _this3;
  }

  _createClass(Template, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var self = this;
      d3.json(this.props.url, function (data) {
        self.setState({
          data: data
        });
      });
    }
  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps, prevState) {
      $("body").scrollspy({
        target: ".bs-docs-sidebar",
        offset: 50
      });
      $('[data-toggle="popover"]').popover();
    }
  }, {
    key: "onFileChange",
    value: function onFileChange(e) {
      var self = this,
          files = e.target.files; // FileList object

      if (files.length == 1) {
        var f = files[0],
            reader = new FileReader();

        reader.onload = function (theFile) {
          return function (e) {
            var data = JSON.parse(this.result);
            self.setState({ data: data });
          };
        }(f);
        reader.readAsText(f);
      }
      e.preventDefault();
    }
  }, {
    key: "render",
    value: function render() {
      var self = this,
          scrollspy_info = [{ label: "summary", href: "summary-tab" }, { label: "react", href: "react-tab" }];
      return React.createElement(
        "div",
        null,
        React.createElement(_navbar.NavBar, { onFileChange: this.onFileChange }),
        React.createElement(
          "div",
          { className: "container" },
          React.createElement(
            "div",
            { className: "row" },
            React.createElement(_scrollspy.ScrollSpy, { info: scrollspy_info }),
            React.createElement(
              "div",
              { className: "col-sm-10", id: "results" },
              React.createElement(_error_message.ErrorMessage, null),
              React.createElement(TemplateResults, { data: self.state.data ? self.state.data.input_data : null }),
              React.createElement(ReactConventions, null)
            )
          )
        )
      );
    }
  }]);

  return Template;
}(React.Component);

function render_template(url, element) {
  ReactDOM.render(React.createElement(Template, { url: url }), document.getElementById(element));
}

module.exports = render_template;

/***/ }),
/* 34 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 35 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 36 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 37 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 38 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_38__;

/***/ }),
/* 39 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_39__;

/***/ }),
/* 40 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_40__;

/***/ }),
/* 41 */
/***/ (function(module, exports) {

module.exports = __WEBPACK_EXTERNAL_MODULE_41__;

/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(18);


/***/ })
/******/ ]);
});
//# sourceMappingURL=hyphyvision.js.map