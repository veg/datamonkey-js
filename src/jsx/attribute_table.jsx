var React = require("react"),
  ReactDOM = require("react-dom");

/* 

  Displays a modal on the HIV-TRACE results page when the user clicks "View" under the Attributes column
  The modal displays a table of attributes associated with the node

  In order to update the modal, a custom event, "view-attributes", needs to be triggered on the shiv-attribute-modal div.
  The object associated with it will be a dictionary with keys and its respective values.

*/
var AttributeModal = React.createClass({
  getInitialState: function() {
    return { attr: {} };
  },

  displayModal: function(attributes) {
    this.setState({ attr: attributes });
    $("#shiv-attribute-modal").modal();
  },

  componentDidMount: function() {
    var self = this;

    // append to passed container
    $("#shiv-attribute-modal").on("view-attributes", function(
      event,
      attributes
    ) {
      self.displayModal(attributes);
    });
  },

  attributeRow: function(val) {
    return (
      <tr>
        <td>{val[0]}</td>
        <td>{val[1]}</td>
      </tr>
    );
  },

  attributeTable: function() {
    var self = this;

    // filter out _id from attributes
    var attr = _.omit(self.state.attr, "_id");

    // transform to tuples and sort by key
    var attr_tuple = _.sortBy(
      _.map(attr, function(v, k) {
        return [k, v];
      }),
      function(d) {
        return d[0];
      }
    );

    var attributeRows = _.map(attr_tuple, self.attributeRow);

    return (
      <table className="table table-hover table-condensed">
        <thead>
          <th>Name</th>
          <th>Value</th>
        </thead>
        {attributeRows}
      </table>
    );
  },

  render: function() {
    var self = this;
    var attributeTable = self.attributeTable();

    return (
      <div role="dialog" id="shiv-attribute-modal" className="modal ng-scope">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header dialog-header-attribute">
              <button data-dismiss="modal" className="close" type="button">
                ×
              </button>
              <h4 className="modal-title">Patient Attributes</h4>
            </div>

            <div id="modal-attribute-msg" className="modal-body">
              {attributeTable}
            </div>

            <div className="modal-footer">
              <button
                data-dismiss="modal"
                className="btn btn-warning"
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

function render_attribute_modal() {
  ReactDOM.render(
    <AttributeModal />,
    document.getElementById("shiv-node-tab-attribute-modal")
  );
}

module.exports = render_attribute_modal;
