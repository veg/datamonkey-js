var React = require("react");

class AnalyzingData extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        <div className="dm-card card-default">
          <div className="dm-card-header card-header" id="#analyzing-data">
            Analyzing Data
          </div>
        </div>

        <h3 id="nucleotide-selection">Selecting a nucleotide model</h3>

        <div className="bs-callout bs-callout-info">
          <p>
            Complete model selection procedure details can be found in this{" "}
            <a href="http://mbe.oxfordjournals.org/cgi/content/short/22/5/1208">
              MBE paper
            </a>
          </p>
        </div>

        <h3>General Advice</h3>

        <p>
          We recommend that you run a model selection procedure, which sifts all
          203 possible time-reversible models through a hierarchical testing
          procedure combining nested LRT tests with AIC selection to pick a
          single "best-fitting" rate matrix. Model selection is processed on a
          remote cluster, and should take no more than a few minutes to
          complete.
        </p>

        <p>
          To allow the most general model of nucleotide substituion, select the
          General Reversible Model (REV), since it does not add much to the
          overall processing time. However, if your data set is small, it may
          not be possible to accurately estimate nucleotide substitution bias
          rates, and HKY85 might not be a bad choice. You can also try several
          different models and see if the location of inferred sites changes
          depending on the nucleotide model (it rarely does, unless the model is
          very wrong).
        </p>

        <br />

        <div className="dm-card card-default">
          <div className="dm-card-header card-header">Handling Ambiguities</div>
        </div>

        <div className="bs-callout bs-callout-info">
          <p>
            For more details see{" "}
            <a href="http://mbe.oxfordjournals.org/cgi/content/short/22/5/1208">
              MBE paper
            </a>
          </p>
        </div>

        <div className="bs-callout bs-callout-info">
          <h4>Averaged (default)</h4>
          <p>
            All possible resolutions of an ambiguous character contribute, in a
            weighted fashion, to the computation of EN, ES, NN and NS (see{" "}
            <a href="../paper.pdf">methods paper</a>
            ). Characters without any information (all gaps or all missing) are
            NOT counted though, to avoid artifically high dN and dS estimates.
          </p>
        </div>

        <div className="bs-callout bs-callout-info">
          <h4>Resolved</h4>
          <p>
            The most likely resolution <i> for the given site </i> is used in
            the computation of EN, ES, NN and NS. Ties are broken randomly.
          </p>
        </div>

        <div className="bs-callout bs-callout-info">
          <h4>Skip</h4>
        </div>

        <div className="bs-callout bs-callout-info">
          <h4>GapMM</h4>
        </div>

        <h3>Example</h3>
        <p> Consider the site:</p>
        <pre>ACA ACG ACG ACR</pre>

        <p>
          For the resolved option, only most frequent resolution{" "}
          <i>based on the data in the site only</i>, will be considered. In this
          case, the resolution is 'ACG'
        </p>

        <p>
          For the averaged option, all four possible resolutions ('ACA' and
          'ACG') will be considered. The weight factor for each resolved is
          determined by the relative frequency of that codon to all possible
          resolutions. If f(xyz) denotes the frequency of codon xyz in the
          entire data file, then the contribution of ACA will be
          f(ACA)/(f(ACA)+f(ACG)) and of 'ACG' : f(ACG)/(f(ACA)+f(ACG)).
        </p>

        <br />

        <div className="dm-card card-default">
          <div className="dm-card-header card-header">
            Choosing significance levels
          </div>
        </div>

        <div className="bs-callout bs-callout-info">
          <p>
            For more details see{" "}
            <a href="http://mbe.oxfordjournals.org/cgi/content/short/22/5/1208">
              MBE paper
            </a>
          </p>
        </div>
      </div>
    );
  }
}

module.exports = AnalyzingData;
