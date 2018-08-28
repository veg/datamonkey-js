var React = require("react");
var ReactDOM = require("react-dom");

class Citations extends React.Component {
  constructor(props) {
    super(props);
  }

  datamonkeyCitations() {
    return (
      <div className="row">
        <div className="col">
          <h1>Citations</h1>
          <p>
            If you publish the results based on datamonkey.org we suggest the
            following citations. Please cite the Datamonkey and HyPhy
            application notes.
          </p>
          <br />
          <div className="panel panel-default">
            <div className="panel-heading">
              <h3 className="panel-title">Datamonkey</h3>
            </div>
            <div className="panel-body">
              <h4>
                Steven Weaver, Stephen D. Shank, Stephanie J. Spielman, Michael
                Li, Spencer V. Muse, Sergei L. Kosakovsky Pond
              </h4>
              <h5>
                <a
                  target="_blank"
                  href="https://academic.oup.com/mbe/article/35/3/773/4782511"
                  className="REFERENCE"
                >
                  <i className="fas fa-external-link-alt" aria-hidden="true" />
                </a>
                <strong>
                  Datamonkey 2.0: a modern web application for characterizing
                  selective and other evolutionary processes
                </strong>
              </h5>
              <p>Mol. Biol. Evol. 35(3):773–777</p>
              <hr />

              <h4>
                Wayne Delport, Art F. Poon, Simon D. W. Frost and Sergei L.
                Kosakovsky Pond
              </h4>
              <h5>
                <a
                  target="_blank"
                  href="https://academic.oup.com/bioinformatics/article-lookup/doi/10.1093/bioinformatics/btq429"
                  className="REFERENCE"
                >
                  <i className="fas fa-external-link-alt" aria-hidden="true" />
                </a>
                <strong>
                  Datamonkey 2010: a suite of phylogenetic analysis tools for
                  evolutionary biology
                </strong>
              </h5>
              <p>Bioinformatics 26(19): 2455-2457</p>
              <hr />
              <h4>Sergei L. Kosakovsky Pond and Simon D. W. Frost (2005)</h4>
              <h5>
                <a
                  target="_blank"
                  href="http://bioinformatics.oxfordjournals.org/cgi/content/abstract/21/10/2531?ijkey=a5yRfKOnDZ1Kb6J&keytype=ref"
                  className="REFERENCE"
                >
                  <i className="fas fa-external-link-alt" aria-hidden="true" />
                </a>
                <strong>
                  Datamonkey: rapid detection of selective pressure on
                  individual sites of codon alignments
                </strong>
              </h5>
              <p>Bioinformatics 21(10): 2531-2533</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  GUICitations() {
    return (
      <div className="row">
        <div className="col">
          <h1>Citations</h1>
          <p>
            If you publish the results based on the HyPhy GUI we suggest the
            following citations. Please cite the HyPhy application note as well
            as the method specific publication.
          </p>
          <br />
        </div>
      </div>
    );
  }

  render() {
    return (
      <div className="container">
        {this.props.datamonkey
          ? this.datamonkeyCitations()
          : this.GUICitations()}

        <div className="row">
          <div className="col">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">HyPhy</h3>
              </div>
              <div className="panel-body">
                <h4>
                  Sergei L. Kosakovsky Pond, Simon D. W. Frost and Spencer V.
                  Muse (2005)
                </h4>
                <h5>
                  <a
                    target="_blank"
                    href="http://bioinformatics.oxfordjournals.org/cgi/content/short/21/5/676"
                    className="REFERENCE"
                  >
                    <i
                      className="fas fa-external-link-alt"
                      aria-hidden="true"
                    />
                  </a>
                  <strong>HyPhy: hypothesis testing using phylogenies</strong>
                </h5>
                <p>Bioinformatics 21(5): 676-679</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <h2>Method Citations</h2>
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">aBSREL</h3>
              </div>
              <div className="panel-body">
                <h4>
                  M. D. Smith, J. O. Wertheim, S. Weaver, B. Murrell, K.
                  Scheffler and S. L. Kosakovsky Pond
                </h4>
                <h5>
                  <a
                    target="_blank"
                    href="http://dx.doi.org/10.1093/molbev/msv022"
                  >
                    <i
                      className="fas fa-external-link-alt"
                      aria-hidden="true"
                    />
                  </a>
                  <strong>
                    Less Is More: An Adaptive Branch-Site Random Effects Model
                    for Efficient Detection of Episodic Diversifying Selection
                  </strong>
                </h5>
                <p>Molecular Biology and Evolution 32: 1342-1353</p>
                <hr />
                <h4>
                  Sergei L. Kosakovsky Pond, Ben Murrell, Mathieu Fourment,
                  Simon D. W. Frost, Wayne Delport and Konrad Scheffler (2011)
                </h4>
                <h5>
                  <a
                    target="_blank"
                    href="http://mbe.oxfordjournals.org/content/early/2011/06/11/molbev.msr125.abstract"
                    className="REFERENCE"
                  >
                    <i
                      className="fas fa-external-link-alt"
                      aria-hidden="true"
                    />
                  </a>
                  <strong>
                    A random effects branch-site model for detecting episodic
                    diversifying selection
                  </strong>
                </h5>
                <p>Molecular Biology and Evolution 28(11): 3033-3043</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">BUSTED</h3>
              </div>
              <div className="panel-body">
                <h4>
                  B. Murrell, S. Weaver, M. D. Smith, J. O. Wertheim, S.
                  Murrell, A. Aylward and K. Eren, T. Pollner, D. P. Martin, D.
                  M. Smith, K. Scheffler and S. L. Kosakovsky Pond
                </h4>
                <h5>
                  <a
                    target="_blank"
                    href="https://academic.oup.com/mbe/article-lookup/doi/10.1093/molbev/msv035"
                  >
                    <i
                      className="fas fa-external-link-alt"
                      aria-hidden="true"
                    />
                  </a>
                  <strong>
                    Gene-Wide Identification of Episodic Selection
                  </strong>
                </h5>
                <p>Molecular Biology and Evolution 32(5) 1365-1371</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">FEL</h3>
              </div>
              <div className="panel-body">
                <h4>Sergei L. Kosakovsky Pond and Simon D. W. Frost (2005)</h4>
                <h5>
                  <a
                    target="_blank"
                    href="http://mbe.oxfordjournals.org/cgi/content/short/22/5/1208"
                  >
                    <i
                      className="fas fa-external-link-alt"
                      aria-hidden="true"
                    />
                  </a>
                  <strong>
                    Not So Different After All: A Comparison of Methods for
                    Detecting Amino Acid Sites Under Selection
                  </strong>
                </h5>
                <p>Molecular Biology and Evolution 22(5): 1208-1222</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">FUBAR</h3>
              </div>
              <div className="panel-body">
                <h4>
                  B. Murrell, S. Moola, A. Mabona, T. Weighill, D. Sheward, S.
                  L. Kosakovsky Pond and K. Scheffler
                </h4>
                <h5>
                  <a
                    target="_blank"
                    href="https://academic.oup.com/mbe/article/30/5/1196/998247/FUBAR-A-Fast-Unconstrained-Bayesian-AppRoximation"
                  >
                    <i
                      className="fas fa-external-link-alt"
                      aria-hidden="true"
                    />
                  </a>
                  <strong>
                    FUBAR: a fast, unconstrained bayesian approximation for
                    inferring selection
                  </strong>
                </h5>
                <p>Molecular Biology and Evolution 30(5) : 1196-1205</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">GARD</h3>
              </div>
              <div className="panel-body">
                <h4>
                  Sergei L Kosakovsky Pond, David Posada, Michael B Gravenor,
                  Christopher H Woelk and Simon DW Frost
                </h4>
                <h5>
                  <a
                    target="_blank"
                    href="http://mbe.oxfordjournals.org/cgi/content/full/23/10/1891"
                  >
                    <i
                      className="fas fa-external-link-alt"
                      aria-hidden="true"
                    />
                  </a>
                  <strong>
                    Automated Phylogenetic Detection of Recombination Using a
                    Genetic Algorithm
                  </strong>
                </h5>
                <p>Molecular Biology and Evolution 23(10): 1891-1901</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">MEME</h3>
              </div>
              <div className="panel-body">
                <h4>
                  Ben Murrell, Joel O. Wertheim, Sasha Moola, Thomas Weighill,
                  Konrad Scheffler and Sergei L. Kosakovsky Pond (2012)
                </h4>
                <h5>
                  <a
                    target="_blank"
                    href="http://www.plosgenetics.org/article/info%3Adoi%2F10.1371%2Fjournal.pgen.1002764"
                  >
                    <i
                      className="fas fa-external-link-alt"
                      aria-hidden="true"
                    />
                  </a>
                  <strong>
                    Detecting Individual Sites Subject to Episodic Diversifying
                    Selection
                  </strong>
                </h5>
                <p>PLoS Genetics 8(7): e1002764</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">RELAX</h3>
              </div>
              <div className="panel-body">
                <h4>
                  J. O. Wertheim, B. Murrell, M. D. Smith, S. L. Kosakovsky Pond
                  and K. Scheffler
                </h4>
                <h5>
                  <a
                    target="_blank"
                    href="https://academic.oup.com/mbe/article-lookup/doi/10.1093/molbev/msu400"
                  >
                    <i
                      className="fas fa-external-link-alt"
                      aria-hidden="true"
                    />
                  </a>
                  <strong>
                    RELAX: detecting relaxed selection in a phylogenetic
                    framework
                  </strong>
                </h5>
                <p>Molecular Biology and Evolution 32(3): 820-832</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="panel panel-default">
              <div className="panel-heading">
                <h3 className="panel-title">SLAC</h3>
              </div>
              <div className="panel-body">
                <h4>Sergei L. Kosakovsky Pond and Simon D. W. Frost (2005)</h4>
                <h5>
                  <a
                    target="_blank"
                    href="http://mbe.oxfordjournals.org/cgi/content/short/22/5/1208"
                  >
                    <i
                      className="fas fa-external-link-alt"
                      aria-hidden="true"
                    />
                  </a>
                  <strong>
                    Not So Different After All: A Comparison of Methods for
                    Detecting Amino Acid Sites Under Selection
                  </strong>
                </h5>
                <p>Molecular Biology and Evolution 22(5): 1208-1222</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

function render_citations(element, datamonkey) {
  ReactDOM.render(
    <Citations datamonkey={datamonkey} />,
    document.getElementById(element)
  );
}

module.exports.Citations = Citations;
module.exports = render_citations;
