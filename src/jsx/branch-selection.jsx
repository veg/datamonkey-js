var React = require("react");
var ReactDOM = require("react-dom");
var d3 = require("d3");
var $ = require("jquery");
var _ = require("underscore");

var TreeBtnGroup = require("./tree_btn_group.jsx");

class BranchSelection extends React.Component {
  constructor(props) {
    super(props);

    // TODO : check if multiple partitions available
    // TODO : hide user button if not available
    // TODO : if multiple partitions, we will not be able to select partitions

    var current_selection_name = "";

    // set up the phylotree object.
    var tree_container = "#tree-body";
    var phylotreeObject = d3.layout
      .phylotree(tree_container)
      .size([this.props.height, this.props.width])
      .separation(function(a, b) {
        return 0;
      })
      .count_handler(function(count) {
        $("#selected_branch_counter").text(function(d) {
          // TODO: current_selection_name should be a state
          return count[current_selection_name];
        });
        $("#selected_filtered_counter").text(count.tag);
      });

    this.state = {
      selectedTree:
        this.props.userSuppliedNwkTree || this.props.neighborJoiningNwkTree,
      tree: phylotreeObject,
      selectionType: "test",
      multipleTrees: false
    };
  }

  componentDidMount() {
    this.createTree(this.state.selectedTree);
    if (this.props.neighborJoiningNwkTree && this.props.userSuppliedNwkTree) {
      this.setState({ multipleTrees: true });
    }
  }

  componentDidUpdate() {
    this.createTree(this.state.selectedTree);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.selectionType != nextState.selectionType) {
      return false;
    } else {
      return true;
    }
  }

  createTree(nwk) {
    var self = this;
    function style_element(element, data, stylingType) {
      var reference_style = "red";
      var test_style = "rgb(31, 119, 180)";
      if (data["reference"]) {
        element.style("stroke", reference_style, "important");
      } else if (data["test"]) {
        element.style("stroke", test_style, "important");
      } else {
        element.style("stroke", "");
      }
    }

    var default_tree_settings = function(tree) {
      tree.branch_length(null);
      tree.branch_name(null);
      tree.node_span("equal");
      tree.options({ "draw-size-bubbles": false }, false);
      tree.options({ "left-right-spacing": "fit-to-size" });
      tree.options({ "binary-selectable": false });
      if (self.props.testAndReference) {
        tree.style_edges((element, data) => {
          var reference_style = "red";
          var test_style = "rgb(31, 119, 180)";
          if (data["reference"]) {
            element.style("stroke", reference_style, "important");
          } else if (data["test"]) {
            element.style("stroke", test_style, "important");
          } else {
            element.style("stroke", "");
          }
        });
        tree.style_nodes((element, data) => {
          var reference_style = "red";
          var test_style = "rgb(31, 119, 180)";

          if (data["reference"]) {
            element.style("fill", reference_style, "important");
          } else if (data["test"]) {
            element.style("fill", test_style, "important");
          } else {
            element.style("fill", "");
          }
        });
      }
    };

    var container_id = "#tree_container";

    // clear all svgs under container_id first
    d3.select(container_id)
      .select("svg")
      .remove();

    var svg = d3
      .select(container_id)
      .append("svg")
      .attr("width", this.props.width)
      .attr("height", this.props.height);

    default_tree_settings(this.state.tree);
    this.state
      .tree(this.state.selectedTree)
      .svg(svg)
      .layout();

    _.delay(this.state.tree.placenodes().update, 100);

    if (this.props.testAndReference) {
      this.state.tree.selection_label(this.state.selectionType);
    }
  }

  toggleSelectedTree = treeType => {
    if (this.props[treeType] != this.state.selectedTree) {
      this.setState({ selectedTree: this.props[treeType] });
    }
  };

  toggleSelectionType = selectionType => {
    this.state.tree.selection_label(selectionType);
    this.setState({ selectionType: selectionType });
  };

  submit(tree, callback) {
    function exportNewick(tree) {
      return tree.get_newick(function(node) {
        var tags = [];
        // Add the tags.
        if (node.selected) {
          tags.push("FG");
        }
        if (node.test) {
          tags.push("TEST");
        }
        if (node.reference) {
          tags.push("REFERENCE");
        }
        if (tags.length) {
          return "{" + tags.join(",") + "}";
        }
        return "";
      });
    }

    function validate_selection(tree, callback) {
      var nwkToReturn = exportNewick(tree);
      if (tree.nodes.get_selection().length) {
        callback(nwkToReturn);
      } else {
        alert(
          "No branch selections were made, please select one. Alternatively, you can choose to select all via the menu."
        );
      }
    }

    validate_selection(tree, callback);
  }

  render() {
    return (
      <div>
        <div className="row">
          <TreeBtnGroup tree={this.state.tree} />
          {this.state.multipleTrees ? (
            <TreeSelectBtnGroup toggleSelectedTree={this.toggleSelectedTree} />
          ) : null}
          {this.props.testAndReference ? (
            <BranchSelectionTypeBtnGroup
              toggleSelectionType={this.toggleSelectionType}
            />
          ) : null}
        </div>

        <div id="tree-body">
          <div id="tree_container" className="tree-widget" />
        </div>

        <button
          onClick={() =>
            this.submit(this.state.tree, this.props.returnAnnotatedTreeCallback)
          }
        >
          Save Branch Selection
        </button>
      </div>
    );
  }
}

function TreeSelectBtnGroup(props) {
  return (
    <div
      className="btn-group btn-group-toggle"
      data-toggle="buttons"
      style={{ paddingLeft: "2rem" }}
    >
      <label
        title="User Defined Tree"
        id="dm-usertree-highlighter"
        className="btn btn-sm btn-light active"
        onClick={() => props.toggleSelectedTree("userSuppliedNwkTree")}
      >
        <input
          type="radio"
          name="options"
          id="dm-ut-select"
          autoComplete="off"
        />
        User Defined Tree
      </label>
      <label
        title="Neighbor Joining Tree"
        id="dm-nj-highlighter"
        className="btn btn-sm btn-light"
        onClick={() => props.toggleSelectedTree("neighborJoiningNwkTree")}
      >
        <input
          type="radio"
          name="options"
          id="dm-nj-select"
          autoComplete="off"
        />
        Neighbor Joining Tree
      </label>
    </div>
  );
}

function BranchSelectionTypeBtnGroup(props) {
  return (
    <div
      className="btn-group btn-group-toggle ml-auto"
      data-toggle="buttons"
      style={{
        paddingTop: "1rem",
        paddingRight: "2rem",
        paddingBottom: "1rem",
        float: "right"
      }}
    >
      <label
        title="Highlight Test Branches"
        className="btn btn-sm btn-light active"
        style={{ color: "rgb(31, 119, 180)" }}
        onClick={() => props.toggleSelectionType("test")}
      >
        <input type="radio" name="options" id="relax-tbh" autoComplete="off" />
        Test Branches
      </label>
      <label
        title="Highlight Reference Branches"
        className="btn btn-sm btn-light"
        style={{ color: "red" }}
        onClick={() => props.toggleSelectionType("reference")}
      >
        <input type="radio" name="options" id="relax-rbh" autoComplete="off" />
        Reference Branches
      </label>
    </div>
  );
}

function render_branch_selection_old(trees, post_to, element_id) {
  ReactDOM.render(
    <BranchSelection
      trees={trees}
      post_to={post_to}
      height={800}
      width={600}
    />,
    document.getElementById(element_id)
  );
}

function render_branch_selection(
  element,
  userSuppliedNwkTree,
  neighborJoiningNwkTree,
  returnAnnotatedTreeCallback,
  height,
  width,
  testAndReference
) {
  ReactDOM.render(
    <BranchSelection
      userSuppliedNwkTree={userSuppliedNwkTree}
      neighborJoiningNwkTree={neighborJoiningNwkTree}
      returnAnnotatedTreeCallback={returnAnnotatedTreeCallback}
      height={height}
      width={width}
      testAndReference={testAndReference}
    />,
    document.getElementById(element)
  );
}

module.exports = render_branch_selection;
module.exports.BranchSelection = BranchSelection;
