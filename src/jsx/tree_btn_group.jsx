var React = require("react");
var d3 = require("d3");

function TreeBtnGroup(props) {
  function sortNodes(asc) {
    props.tree.traverse_and_compute(function(n) {
      var d = 1;
      if (n.children && n.children.length) {
        d += d3.max(n.children, function(d) {
          return d["count_depth"];
        });
      }
      n["count_depth"] = d;
    });

    props.tree.resort_children(function(a, b) {
      return (a["count_depth"] - b["count_depth"]) * (asc ? 1 : -1);
    });
  }

  return (
    <div className="phylo-nav" style={{ padding: "0px" }}>
      <div className="btn-group">
        <button
          title="Expand spacing"
          id="expand_spacing"
          className="btn btn-light btn-sm"
          type="button"
          onClick={() => {
            props.tree.spacing_x(props.tree.spacing_x() + 1).update(true);
          }}
        >
          <i className="fa fa-expand" />
        </button>
        <button
          title="Compress spacing"
          id="compress_spacing"
          className="btn btn-light btn-sm"
          type="button"
          onClick={() => {
            props.tree.spacing_x(props.tree.spacing_x() - 1).update(true);
          }}
        >
          <i className="fa fa-compress" />
        </button>
        <button
          title="Sort deepest clades to the bototm"
          id="sort_ascending"
          className="btn btn-light btn-sm"
          type="button"
          onClick={() => sortNodes(true)}
        >
          <i className="fa fa-sort-amount-asc" />
        </button>
        <button
          title="Sort deepsest clades to the top"
          id="sort_descending"
          className="btn btn-light btn-sm"
          type="button"
          onClick={() => sortNodes(false)}
        >
          <i className="fa fa-sort-amount-desc" />
        </button>
        <button
          title="Restore original order"
          id="sort_original"
          className="btn btn-light btn-sm"
          type="button"
          onClick={e => {
            props.tree.resort_children(function(a, b) {
              return a["original_child_order"] - b["original_child_order"];
            });
          }}
        >
          <i className="fa fa-sort" />
        </button>
        <button
          data-toggle="dropdown"
          className="btn btn-light btn-sm dropdown-toggle"
          type="button"
        >
          Selection <span className="caret" />
        </button>
        <ul className="dropdown-menu">
          <li>
            <a
              id="select_all"
              href="#"
              onClick={() => {
                props.tree.modify_selection(function(d) {
                  return true;
                });
              }}
            >
              Select all
            </a>
          </li>
          <li>
            <a
              id="select_all_internal"
              href="#"
              onClick={() => {
                props.tree.modify_selection(function(d) {
                  return !d3.layout.phylotree.is_leafnode(d.target);
                });
              }}
            >
              Select only internal nodes
            </a>
          </li>
          <li>
            <a
              id="select_all_leaves"
              href="#"
              onClick={() => {
                props.tree.modify_selection(function(d) {
                  return d3.layout.phylotree.is_leafnode(d.target);
                });
              }}
            >
              Select only leaf nodes
            </a>
          </li>
          <li>
            <a
              id="select_none"
              href="#"
              onClick={() => {
                props.tree.modify_selection(function(d) {
                  return false;
                });
              }}
            >
              Clear selection
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

module.exports = TreeBtnGroup;
