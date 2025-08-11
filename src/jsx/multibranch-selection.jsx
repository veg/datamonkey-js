var React = require("react");
var ReactDOM = require("react-dom");
var d3 = require("d3");
var $ = require("jquery");
var _ = require("underscore");

var TreeBtnGroup = require("./tree_btn_group.jsx");

class MultiBranchSelection extends React.Component {
  constructor(props) {
    super(props);

    // TODO : check if multiple partitions available
    // TODO : hide user button if not available
    // TODO : if multiple partitions, we will not be able to select partitions

    // set up the phylotree object.
    var tree_container = "#tree-body";

    var phylotreeObject = d3.layout
      .phylotree(tree_container)
      .size([this.props.height, this.props.width])
      .separation(function (a, b) {
        return 0;
      });

    phylotreeObject.style_edges((element, data) => {
      this.edgeColorizer(element, data);

      var m = this.state.tree.branch_name()(data.target).split(" ");
      if (m.length > 1) {
        element.style("stroke", color_scale(m[0]));
      }
    });

    this.state = {
      selectedTree:
        this.props.userSuppliedNwkTree || this.props.neighborJoiningNwkTree,
      tree: phylotreeObject,
      selectionType: "Foreground",
      multipleTrees: false,
      selectionSet: ["Foreground"],
      currentSelectionIndex: 0,
    };
  }

  componentDidMount() {
    this.createTree(this.state.selectedTree);
    if (this.props.neighborJoiningNwkTree && this.props.userSuppliedNwkTree) {
      this.setState({ multipleTrees: false });
    }
  }

  componentDidUpdate() {
    //this.createTree(this.state.selectedTree);
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.state.selectionType != nextState.selectionType) {
      return false;
    } else {
      return true;
    }
  }

  //updateBranchNames(oldName, newName) {
  //  // get branch names with old name
  //  let names = _.map(this.state.tree.get_nodes(), d => d.name);

  //  // rename to new current name or remove
  //  let fnames = _.filter(names, name =>
  //      this.state.tree
  //        .branch_name()(name)
  //        .split(" ") > 1
  //  );

  //  let branches = _.map(names, this.state.tree.branch_name());

  //  console.log(fnames);
  //  console.log(branches);

  //}

  edgeColorizer(element, data) {
    try {
      var count_class = 0;
      this.state.selectionSet.forEach((d, i) => {
        if (data[d]) {
          count_class++;
          element.style(
            "stroke",
            this.props.colorScheme(i),
            i == this.state.currentSelectionIndex ? "important" : null
          );
        }
      });

      if (count_class > 1) {
        element.classed("branch-multiple", true);
      } else if (count_class == 0) {
        element.style("stroke", null).classed("branch-multiple", false);
      }
    } catch (e) {}
  }

  makeSelection(e) {
    this.setState({
      currentSelectionIndex: parseInt(e.target.dataset.id),
    });

    this.state.tree.selection_label(
      this.state.selectionSet[parseInt(e.target.dataset.id)]
    );
  }

  selectNew(e) {
    // add item and set state
    let selectionSet = this.state.selectionSet;

    let id = selectionSet.length;
    let newName = "New Partition " + String(selectionSet.length);
    selectionSet.push(newName);

    this.state.tree.selection_label(selectionSet[id]);

    this.setState({
      selectionSet: selectionSet,
      currentSelectionIndex: id,
    });
  }

  selectRename(e) {
    // rename current id and set state
    let newName = e.target.value;
    let newSet = this.state.selectionSet;
    newSet[this.state.currentSelectionIndex] = newName;

    this.state.tree.selection_label(
      this.state.selectionSet[this.state.currentSelectionIndex]
    );

    // get all selections with old name and use current name
    this.state.tree.update_key_name(
      this.state.selectionSet[this.state.currentSelectionIndex],
      newName
    );

    this.setState({
      selectionSet: newSet,
    });
  }

  selectDelete(e) {
    if (this.state.selectionSet.length <= 1) {
      console.log("not allowed to delete only member");
    }

    let newSet = this.state.selectionSet;
    newSet.splice(this.state.currentSelectionIndex, 1);

    this.state.tree.selection_label(this.state.selectionSet[0]);

    // delete current id and set state
    this.setState({
      selectionSet: newSet,
      currentSelectionIndex: 0,
    });
  }

  tagDropDownMenu() {
    let sSetItems = _.map(this.state.selectionSet, (d, i) => {
      return (
        <li className="selection_set">
          <a
            href="#"
            data-id={i}
            onClick={this.makeSelection.bind(this)}
            style={{ color: this.props.colorScheme(i) }}
          >
            {d}
          </a>
        </li>
      );
    });

    return (
      <div>
        <div className="input-group">
          <span className="input-group-btn">
            <button
              type="button"
              className="btn btn-primary dropdown-toggle"
              data-toggle="dropdown"
            >
              Tag <span className="caret" />
            </button>
            <ul className="dropdown-menu" id="selection_name_dropdown">
              <li id="selection_new">
                <a href="#" onClick={this.selectNew.bind(this)}>
                  New selection set
                </a>
              </li>
              <li id="selection_delete" className="disabled">
                <a href="#" onClick={this.selectDelete.bind(this)}>
                  Delete selection set
                </a>
              </li>
              <li className="divider" />
              {sSetItems}
            </ul>
          </span>
          <input
            type="text"
            className="form-control"
            style={{
              color: this.props.colorScheme(this.state.currentSelectionIndex),
            }}
            value={this.state.selectionSet[this.state.currentSelectionIndex]}
            onChange={this.selectRename.bind(this)}
            id="selection_name_box"
          />
        </div>
      </div>
    );
  }

  createTree(nwk) {
    var default_tree_settings = function (tree) {
      tree.branch_length(null);
      tree.branch_name(null);
      tree.node_span("equal");
      tree.options({ "draw-size-bubbles": false }, false);
      tree.options({ "left-right-spacing": "fit-to-size" });
      tree.options({ "binary-selectable": false });
    };

    var container_id = "#tree_container";

    // clear all svgs under container_id first
    d3.select(container_id).select("svg").remove();

    var svg = d3
      .select(container_id)
      .append("svg")
      .attr("width", this.props.width)
      .attr("height", this.props.height);

    default_tree_settings(this.state.tree);
    this.state.tree(this.state.selectedTree).svg(svg).layout();

    _.delay(this.state.tree.placenodes().update, 100);

    this.state.tree.selection_label(this.state.selectionType);
  }

  submit(tree, callback) {
    var self = this;

    function exportNewick(tree) {
      return tree.get_newick((node) => {
        let tags = _.compact(
          _.map(node, (v, k) => {
            if (v === true && _.contains(self.state.selectionSet, k)) {
              return k;
            }
          })
        );

        if (!tags.length) {
          return "";
        }

        let tag = tags[0];
        return "{" + tag + "}";
      });
    }

    function validate_selection(tree, callback) {
      var nwkToReturn = exportNewick(tree);
      if (tree.nodes.get_selection().length) {
        console.log(nwkToReturn);
        callback(nwkToReturn, self.state.selectionSet);
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
          <MultiBranchSelectionTypeBtnGroup
            toggleSelectionType={this.toggleSelectionType}
          />
          {this.tagDropDownMenu()}
        </div>

        <div id="tree-body">
          <div id="tree_container" className="tree-widget" />
        </div>

        <button
          id="branch-selection-submit-button"
          onClick={() =>
            this.submit.bind(this)(
              this.state.tree,
              this.props.returnAnnotatedTreeCallback
            )
          }
        >
          Save Branch Selection
        </button>
      </div>
    );
  }
}

MultiBranchSelection.defaultProps = {
  colorScheme: d3.scale.category10(),
};

function MultiBranchSelectionTypeBtnGroup(props) {
  return (
    <div
      className="btn-group btn-group-toggle ml-auto"
      data-toggle="buttons"
      style={{
        paddingTop: "1rem",
        paddingRight: "2rem",
        paddingBottom: "1rem",
        float: "right",
      }}
    />
  );
}

function render_multibranch_selection(
  element,
  userSuppliedNwkTree,
  neighborJoiningNwkTree,
  returnAnnotatedTreeCallback,
  height,
  width,
  testAndReference
) {
  ReactDOM.render(
    <MultiBranchSelection
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

module.exports = render_multibranch_selection;
module.exports.MultiBranchSelection = MultiBranchSelection;
