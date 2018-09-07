var React = require("react"),
  ReactDOM = require("react-dom");

var selected_style = { backgroundColor: "#00A99D", color: "white" };

var h2Style = {
  fontFamily: "montserrat",
  fontSize: "1.286em",
  fontWeight: "700",
  color: "#009BA1",
  marginTop: "0px",
  marginBottom: "10px",
  textAlign: "center"
};

var borderStyle = {
  padding: "5px",
  border: "2px #AEDBDA solid",
  marginBottom: "40px"
};

var analysisBorder = {
  padding: "30px 10% 30px 10%",
  border: "2px #AEDBDA solid",
  marginBottom: "40px"
};

var analysisName = {
  fontFamily: "montserrat",
  fontStyle: "italic",
  fontWeight: "700",
  color: "#00a99d",
  textAlign: "center",
  backgroundColor: "#F5F5F5",
  padding: "15px 0"
};

var analysisText = {
  fontFamily: "montserrat",
  fontWeight: "500",
  color: "#484D56"
};

// Decision Tree
class DecisionBranch extends React.Component {
  constructor(props) {
    super(props);
    this.state = { choice: null };
  }
  render() {
    var self = this;
    var question = (
      <div className="row">
        <div className="col">
          <h2 style={h2Style}>{this.props.text}</h2>

          <div
            className="analysis-tree dm-group dm-btn-group-justified btn-group btn-group-justified"
            role="group"
            aria-label="..."
            style={borderStyle}
          >
            {this.props.choices.map(choice => {
              return (
                <a
                  role="button"
                  className="dm-btn btn"
                  style={self.state.choice == choice.name ? selected_style : {}}
                  onClick={() => {
                    self.setState({ choice: choice.name });
                  }}
                  key={choice.name}
                >
                  {choice.displayName}
                </a>
              );
            })}
          </div>
        </div>
      </div>
    );
    if (self.state.choice) {
      var index = self.props.choices
        .map(choice => choice.name)
        .indexOf(self.state.choice);
      return (
        <div>
          {question}
          {self.props.choices[index].child}
        </div>
      );
      //return question;
    }
    return question;
  }
}

function DecisionTreeRoot(props) {
  var choices = [
    {
      displayName: "Selection",
      name: "selection",
      child: (
        <SelectionBranch
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      )
    },
    {
      displayName: "Recombination",
      name: "recombination",
      child: (
        <GARD
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      )
    }
  ];
  return (
    <div>
      <div className="analysis-tree dm-jumbotron">
        {props.datamonkey ? <h1>Datamonkey</h1> : <h1>HyPhy Desktop</h1>}
        <hr />
        <p>
          A Collection of State of the Art Statistical Models and Bioinformatics
          Tools
        </p>
      </div>
      <div className="container">
        <DecisionBranch
          text="What evolutionary process would you like to detect?"
          choices={choices}
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      </div>
    </div>
  );
}

function SelectionBranch(props) {
  var choices = [
    {
      displayName: "Branches",
      name: "branches",
      child: (
        <BranchesBranch
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      )
    },
    {
      displayName: "Sites",
      name: "sites",
      child: (
        <SitesBranch
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      )
    },
    {
      displayName: "Gene",
      name: "gene",
      child: (
        <BUSTED
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      )
    }
  ];
  return (
    <DecisionBranch
      text="Would you like to detect selection across branches, individual sites, or an entire gene?"
      choices={choices}
      datamonkey={props.datamonkey}
      changeAppState={props.changeAppState}
    />
  );
}

function BranchesBranch(props) {
  var choices = [
    {
      displayName: "Episodic",
      name: "branches",
      child: (
        <ABSREL
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      )
    },
    {
      displayName: "Relaxed",
      name: "sites",
      child: (
        <RELAX
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      )
    }
  ];
  return (
    <DecisionBranch
      text="Do you want to detect episodic or relaxed selection?"
      choices={choices}
      datamonkey={props.datamonkey}
      changeAppState={props.changeAppState}
    />
  );
}

function SitesBranch(props) {
  var choices = [
    {
      displayName: "Episodic",
      name: "episodic",
      child: (
        <MEME
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      )
    },
    {
      displayName: "Pervasive",
      name: "Pervasive",
      child: (
        <PervasiveSitesBranch
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      )
    }
  ];
  return (
    <DecisionBranch
      text="Do you want to detect episodic or pervasive selection?"
      choices={choices}
      datamonkey={props.datamonkey}
      changeAppState={props.changeAppState}
    />
  );
}

function PervasiveSitesBranch(props) {
  var choices = [
    {
      displayName: "Small",
      name: "small",
      child: (
        <FEL
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      )
    },
    {
      displayName: "Large",
      name: "large",
      child: (
        <LargeBranch
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      )
    }
  ];
  return (
    <DecisionBranch
      text="Is your dataset small (less than this many sequences/sizes) or large?"
      choices={choices}
      datamonkey={props.datamonkey}
      changeAppState={props.changeAppState}
    />
  );
}

function LargeBranch(props) {
  var choices = [
    {
      displayName: "Bayesian",
      name: "bayesian",
      child: (
        <FUBAR
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      )
    },
    {
      displayName: "Counting",
      name: "counting",
      child: (
        <SLAC
          datamonkey={props.datamonkey}
          changeAppState={props.changeAppState}
        />
      )
    }
  ];
  return (
    <DecisionBranch
      text="Do you want to use a Bayesian (recommended) or counting based approach?"
      choices={choices}
      datamonkey={props.datamonkey}
      changeAppState={props.changeAppState}
    />
  );
}

// Method descriptions
class Method extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hover: false };
  }

  goToMethod(method) {
    this.props.changeAppState("method", method);
    this.props.changeAppState("page", "jobSubmittal");
  }

  render() {
    return (
      <div className="row">
        <div className="col">
          <div className="dm-card card" style={analysisBorder}>
            <h2 style={h2Style}>
              {this.props.datamonkey ? "Datamonkey " : "HyPhy "}
              recommends that you use...
            </h2>
            <a
              href={this.props.datamonkey ? this.props.href : null}
              onClick={
                this.props.datamonkey
                  ? null
                  : () => this.goToMethod(this.props.href)
              }
              onMouseEnter={() => this.setState({ hover: true })}
              onMouseLeave={() => this.setState({ hover: false })}
            >
              <div className="card-header">
                <center>
                  <h1 style={analysisName}>{this.props.title}</h1>
                </center>
              </div>
            </a>
            <div className="card-body" style={analysisText}>
              {this.props.children}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function ABSREL(props) {
  return (
    <Method
      title="aBSREL"
      href="absrel"
      datamonkey={props.datamonkey}
      changeAppState={props.changeAppState}
    >
      <p>
        aBSREL (<strong>a</strong>
        daptive
        <strong>B</strong>
        ranch-
        <strong>S</strong>
        ite <strong>R</strong>
        andom
        <strong>E</strong>
        ffects <strong>L</strong>
        ikelihood) is an improved version of the commonly-used "branch-site"
        models, which are used to test if positive selection has occurred on a
        proportion of branches.
      </p>

      <p>
        For more information, please see the{" "}
        <a
          className="hyphy-anchor"
          href="http://hyphy.org/methods/selection-methods/#absrel"
        >
          summary on hyphy.org
        </a>{" "}
        or see{" "}
        <a
          className="hyphy-anchor"
          href="https://doi.org/10.1093/molbev/msv022"
        >
          Smith, MD et al. "Less is more: an adaptive branch-site random effects
          model for efficient detection of episodic diversifying selection."
          Mol. Biol. Evol. 32, 1342–1353 (2015).
        </a>
      </p>
    </Method>
  );
}

function BUSTED(props) {
  return (
    <Method
      title="BUSTED"
      href="busted"
      datamonkey={props.datamonkey}
      changeAppState={props.changeAppState}
    >
      <p>
        BUSTED (<strong>B</strong>
        ranch-site <strong>U</strong>
        nrestricted <strong>S</strong>
        tatistical <strong>T</strong>
        est for <strong>E</strong>
        pisodic <strong>D</strong>
        iversification) provides a gene-wide (<em>not site-specific</em>) test
        for positive selection by asking whether a gene has experienced positive
        selection at at least one site on at least one branch.
      </p>

      <p>
        For more information, please see the{" "}
        <a
          className="hyphy-anchor"
          href="http://hyphy.org/methods/selection-methods/#busted"
        >
          summary on hyphy.org
        </a>{" "}
        or see{" "}
        <a
          className="hyphy-anchor"
          href="https://doi.org/10.1093/molbev/msv035"
        >
          Murrell, B et al. "Gene-wide identification of episodic selection."
          Mol. Biol. Evol. 32, 1365–1371 (2015).
        </a>
      </p>
    </Method>
  );
}

function RELAX(props) {
  return (
    <Method
      title="RELAX"
      href="relax"
      datamonkey={props.datamonkey}
      changeAppState={props.changeAppState}
    >
      <p>
        RELAX is a hypothesis testing framework that asks whether the strength
        of natural selection has been relaxed or intensified along a specified
        set of test branches. RELAX is therefore <em>not</em> a suitable method
        for explicitly testing for positive selection. Instead, RELAX is most
        useful for identifying trends and/or shifts in the stringency of natural
        selection on a given gene.
      </p>

      <p>
        For more information, please see the{" "}
        <a
          className="hyphy-anchor"
          href="http://hyphy.org/methods/selection-methods/#relax"
        >
          summary on hyphy.org
        </a>{" "}
        or see{" "}
        <a
          className="hyphy-anchor"
          href="https://doi.org/10.1093/molbev/msu400"
        >
          Wertheim, JO et al. "RELAX: detecting relaxed selection in a
          phylogenetic framework." Mol. Biol. Evol. 32, 820–832 (2015).
        </a>
      </p>
    </Method>
  );
}

function MEME(props) {
  return (
    <Method
      title="MEME"
      href="meme"
      datamonkey={props.datamonkey}
      changeAppState={props.changeAppState}
    >
      <p>
        MEME (<strong>M</strong>
        ixed <strong>E</strong>
        ffects
        <strong>M</strong>
        odel of <strong>E</strong>
        volution) employs a mixed-effects maximum likelihood approach to test
        the hypothesis that individual sites have been subject to episodic
        positive or diversifying selection. In other words, MEME aims to detect
        sites evolving under positive selection under a proportion of branches.
      </p>

      <p>
        For more information, please see the{" "}
        <a
          className="hyphy-anchor"
          href="http://hyphy.org/methods/selection-methods/#meme"
        >
          summary on hyphy.org
        </a>{" "}
        or see{" "}
        <a
          className="hyphy-anchor"
          href="http://dx.doi.org/10.1371/journal.pgen.1002764"
        >
          Murrell, B et al. "Detecting individual sites subject to episodic
          diversifying selection." PLoS Genetics 8, e1002764 (2012).
        </a>
      </p>
    </Method>
  );
}

function FEL(props) {
  return (
    <Method
      title="FEL"
      href="fel"
      datamonkey={props.datamonkey}
      changeAppState={props.changeAppState}
    >
      <p>
        FEL (<strong>F</strong>
        ixed <strong>E</strong>
        ffects
        <strong>L</strong>
        ikelihood) uses a maximum-likelihood (ML) approach to infer nonsynoymous
        (dN) and synonymous (dS) substitution rates on a per-site basis for a
        given coding alignment and corresponding phylogeny. This method assumes
        that the selection pressure for each site is constant along the entire
        phylogeny.
      </p>
      <p>
        For more information, please see the{" "}
        <a
          className="hyphy-anchor"
          href="http://hyphy.org/methods/selection-methods/#fel"
        >
          summary on hyphy.org
        </a>{" "}
        or see{" "}
        <a
          className="hyphy-anchor"
          href="https://doi.org/10.1093/molbev/msi105"
        >
          Kosakovsky Pond, SL and Frost, SDW. "Not So Different After All: A
          Comparison of Methods for Detecting Amino Acid Sites Under Selection."
          Mol. Biol. Evol. 22, 1208--1222 (2005).
        </a>
      </p>
    </Method>
  );
}

function FUBAR(props) {
  return (
    <Method
      title="FUBAR"
      href="fubar"
      datamonkey={props.datamonkey}
      changeAppState={() =>
        alert(
          "FUBAR is still in the process of being ported over to the desktop application... Stay tuned"
        )
      }
    >
      <p>
        FUBAR (<strong>Fast</strong>, <strong>U</strong>
        nconstrained
        <strong>Bayesian</strong> <strong>A</strong>
        pp
        <strong>R</strong>
        oximation) uses a Bayesian approach to infer nonsynoymous (dN) and
        synonymous (dS) substitution rates on a per-site basis for a given
        coding alignment and corresponding phylogeny. This method assumes that
        the selection pressure for each site is constant along the entire
        phylogeny.
      </p>

      <p>
        For more information, please see the{" "}
        <a
          className="hyphy-anchor"
          href="http://hyphy.org/methods/selection-methods/#fubar"
        >
          summary on hyphy.org
        </a>{" "}
        or see{" "}
        <a
          className="hyphy-anchor"
          href="https://academic.oup.com/mbe/article-lookup/doi/10.1093/molbev/mst030"
        >
          Murrell, B et al. "FUBAR: A Fast, Unconstrained Bayesian AppRoximation
          for inferring selection." Mol. Biol. Evol. 30, 1196–1205 (2013).
        </a>
      </p>
    </Method>
  );
}

function GARD(props) {
  return (
    <Method
      title="GARD"
      href="gard"
      datamonkey={props.datamonkey}
      changeAppState={() =>
        alert(
          "GARD is not implemented in the desktop version of HyPhy. Please use the command line version of HyPhy or datamonkey.org"
        )
      }
    >
      {props.datamonkey ? null : (
        <h4>
          <strong>NOTE: </strong>
          GARD requires the message passing interface (MPI) version of HyPhy
          which is not included in the desktop HyPhy application. GARD is
          available at datamonkey.org or the command line implementation of
          HyPhy
        </h4>
      )}
      <p>
        GARD (<strong>Genetic</strong> <strong>Algorithm</strong> for{" "}
        <strong>Recombination</strong> <strong>Detection</strong>) is a method
        to screen a multiple sequence analysis for the presence of recombination
        and is extremely useful as a pre-processing step for selection
        inference. Because recombinant sequences cannot be adequately described
        with a single phylogenetic history, selection inference on recombinant
        data often leads to a significant increase in false positives. GARD
        alleviates this concern by comprehensively screening an alignment for
        recombination breakpoints and inferring a unique phylogenetic history
        for each detected recombination block.
      </p>

      <p>
        For more information, please see the{" "}
        <a
          className="hyphy-anchor"
          href="http://hyphy.org/methods/selection-methods/#gard"
        >
          summary on hyphy.org
        </a>{" "}
        or see{" "}
        <a
          className="hyphy-anchor"
          href="https://academic.oup.com/mbe/article-lookup/doi/10.1093/molbev/msl051"
        >
          Kosakovsky Pond, SL et al. "Automated Phylogenetic Detection of
          Recombination Using a Genetic Algorithm." Mol. Biol. Evol. 23,
          1891–1901 (2006).
        </a>
      </p>
    </Method>
  );
}

function SLAC(props) {
  return (
    <Method
      title="SLAC"
      href="slac"
      datamonkey={props.datamonkey}
      changeAppState={props.changeAppState}
    >
      <p>
        SLAC (<strong>S</strong>
        ingle-
        <strong>L</strong>
        ikelihood <strong>A</strong>
        ncestor <strong>C</strong>
        ounting) uses a combination of maximum-likelihood (ML) and counting
        approaches to infer nonsynonymous (dN) and synonymous (dS) substitution
        rates on a per-site basis for a given coding alignment and corresponding
        phylogeny. Like FEL, this method assumes that the selection pressure for
        each site is constant along the entire phylogeny.{" "}
      </p>

      <p>
        For more information, please see the{" "}
        <a
          className="hyphy-anchor"
          href="http://hyphy.org/methods/selection-methods/#slac"
        >
          summary on hyphy.org
        </a>{" "}
        or see{" "}
        <a
          className="hyphy-anchor"
          href="https://doi.org/10.1093/molbev/msi105"
        >
          Kosakovsky Pond, SL and Frost, SDW. "Not So Different After All: A
          Comparison of Methods for Detecting Amino Acid Sites Under Selection."
          Mol. Biol. Evol. 22, 1208--1222 (2005).
        </a>
      </p>
    </Method>
  );
}

function render_decision_tree(element, datamonkey) {
  ReactDOM.render(
    <DecisionTreeRoot datamonkey={datamonkey} />,
    document.getElementById(element)
  );
}

module.exports.DecisionTreeRoot = DecisionTreeRoot;
module.exports = render_decision_tree;
