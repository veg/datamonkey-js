var React = require("react"),
  ReactDOM = require("react-dom");

class DecisionTree extends React.Component {
  render() {
    return <h2>Help choosing an analysis</h2>;
  }
}

function render_decision_tree() {
  ReactDOM.render(
    <DecisionTree />,
    document.getElementById('main')
  );
}

module.exports = render_decision_tree;

