var React = require("react"),
  ReactDOM = require("react-dom");


var selected_style = {backgroundColor: "#00A99D", color:"white"};

class DecisionTree extends React.Component {
  constructor(props){
    super(props);
    this.state = {choice: [null]};
  }
  selectionBranch(){
    var self=this;
    return (<div className="row">
      <div className="col-md-12">
        <p>Would you like to detect selection across branches, individual sites, or an entire gene?</p>
        <div className="btn-group btn-group-justified" role="group" aria-label="...">
          <a
            role="button"
            className="btn btn-default"
            style={self.state.choice[1] == "branches" ? selected_style : {}}
            onClick={()=>{self.setState({choice:["selection", "branches"]});}}
          >
            Branches
          </a>
          <a
            role="button"
            className="btn btn-default"
            style={self.state.choice[1] == "sites" ? selected_style : {}}
            onClick={()=>{self.setState({choice:["selection", "sites"]});}}
          >
            Sites
         </a>
         <a
            role="button"
            className="btn btn-default"
            style={self.state.choice[1] == "gene" ? selected_style : {}}
            onClick={()=>{self.setState({choice:["selection", "gene"]});}}
          >
            Gene
          </a>
        </div>
      </div>
    </div>);
  }
  recombinationBranch(){
    return (<div className="col-md-12">
      <p><strong>Recommended method:</strong> GARD. Need a GARD blurb/implementation!</p>
    </div>);
  }
  branchesBranch(){
    var self=this;
    return(<div className="row">
      <div className="col-md-12">
        <p>Do you want to detect episodic or relaxed selection?</p>
        <div className="btn-group btn-group-justified" role="group" aria-label="...">
          <a
            role="button"
            className="btn btn-default"
            style={self.state.choice[2] == "episodic" ? selected_style : {}}
            onClick={()=>{self.setState({choice:["selection", "branches", "episodic"]});}}
          >
            Episodic
          </a>
          <a
            role="button"
            className="btn btn-default"
            style={self.state.choice[2] == "relaxed" ? selected_style : {}}
            onClick={()=>{self.setState({choice:["selection", "branches", "relaxed"]});}}
          >
            Relaxed
         </a>
        </div>
      </div>
    </div>);
  }
  sitesBranch(){
    return(<div className="row">
      <div className="col-md-12">
        <p>Site question.</p>
      </div>
    </div>);
  }
  geneBranch(){
    return(<div className="row">
      <div className="col-md-12">
        <p>Datamonkey suggests that you use:</p>
        <div className="panel panel-default panel-datamonkey">
          <a href="busted">
            <div className="panel-heading">
              <h3 className="panel-title">BUSTED</h3>
              <span className="pull-right glyphicon glyphicon-chevron-right hide"></span>
            </div>
          </a>
          <div className="panel-body">

            <p>BUSTED (<strong>B</strong>ranch-site
            <strong>U</strong>nrestricted <strong>S</strong>tatistical
            <strong>T</strong>est for <strong>E</strong>pisodic
            <strong>D</strong>iversification) provides a gene-wide (<em>not
            site-specific</em>) test for positive selection by asking whether a gene
            has experienced positive selection at at least one site on at least one
            branch.</p>

            <p>For more information, please see the <a
            href="http://hyphy.org/methods/selection-methods/#busted">summary on hyphy.org</a> or see 
            <a href="https://doi.org/10.1093/molbev/msv035">Murrell, B et al.
            "Gene-wide identification of episodic selection." Mol. Biol. Evol. 32, 1365–1371
            (2015).</a>
            </p>

          </div>
        </div>

      </div>
    </div>);
  }
  render() {
    var self = this;
    return (<div className="container">
      <div className="row"> 
        <div className="datamonkey-sm-header">
          <h1>Datamonkey</h1>
          <p>A Collection of State of the Art Statistical Models and Bioinformatics Tools</p>
        </div>
      </div>
      <div className="row">
        <div className="col-md-12"> 
          <h3>Help choosing an analysis</h3>

          <p>What evolutionary force would you like to detect?</p>
          <div className="btn-group btn-group-justified" role="group" aria-label="...">
            <a
              role="button"
              className="btn btn-default"
              style={self.state.choice[0] == "selection" ? selected_style : {}}
              onClick={()=>{self.setState({choice:["selection"]});}}
            >
              Selection
            </a>
            <a
              role="button"
              className="btn btn-default"
              style={self.state.choice[0] == "recombination" ? selected_style : {}}
              onClick={()=>{self.setState({choice:["recombination"]});}}
            >
              Recombination
            </a>
          </div>
        </div>
      </div>
      {self.state.choice[0] == "selection" ? self.selectionBranch() : ""}
      {self.state.choice[0] == "recombination" ? self.recombinationBranch() : ""}

      {self.state.choice[1] == "branches" ? self.branchesBranch() : ""}
      {self.state.choice[1] == "sites" ? self.sitesBranch() : ""}
      {self.state.choice[1] == "gene" ? self.geneBranch() : ""}

    </div>);
  }
}

function render_decision_tree() {
  ReactDOM.render(
    <DecisionTree />,
    document.getElementById('main')
  );
}

module.exports = render_decision_tree;

