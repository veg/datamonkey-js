var React = require("react");
var ReactDOM = require("react-dom");

var dmCard = {};
var dmCardHeader = {};
var dmCardBody = {};
var dmCardTitle = {};

var h2Style = {
  fontFamily: "montserrat",
  fontSize: "18px",
  fontWeight: "700",
  color: "#009BA1",
  marginTop: "0px",
  marginBottom: "10px",
  textAlign: "center"
};

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
          <div className="dm-card card">
            <div className="dm-card-header card-header">Datamonkey</div>
            <div className="dm-card-body card-body">
              <div>
                Steven Weaver, Stephen D. Shank, Stephanie J. Spielman, Michael
                Li, Spencer V. Muse, Sergei L. Kosakovsky Pond
              </div>
              <div>
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
                <p>Mol. Biol. Evol. 35(3):773–777</p>
              </div>

              <hr />

              <div>
                Wayne Delport, Art F. Poon, Simon D. W. Frost and Sergei L.
                Kosakovsky Pond
              </div>
              <div>
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
                <p>Bioinformatics 26(19): 2455-2457</p>
              </div>

              <hr />

              <div>Sergei L. Kosakovsky Pond and Simon D. W. Frost (2005)</div>
              <div>
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
                <p>Bioinformatics 21(10): 2531-2533</p>
              </div>
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
            <div className="dm-card card">
              <div className="dm-card-header card-header">Hyphy</div>
              <div className="dm-card-body card-body">
                <div>
                  Sergei L. Kosakovsky Pond, Simon D. W. Frost and Spencer V.
                  Muse (2005)
                </div>
                <div>
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
                  <p>Bioinformatics 21(5): 676-679</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <h2>Method Citations</h2>
            <div className="dm-card card">
              <div className="dm-card-header card-header">aBSREL</div>
              <div className="dm-card-body card-body">
                <div>
                  M. D. Smith, J. O. Wertheim, S. Weaver, B. Murrell, K.
                  Scheffler and S. L. Kosakovsky Pond
                </div>
                <div>
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
                  <p>Molecular Biology and Evolution 32: 1342-1353</p>
                </div>

                <hr />

                <div>
                  Sergei L. Kosakovsky Pond, Ben Murrell, Mathieu Fourment,
                  Simon D. W. Frost, Wayne Delport and Konrad Scheffler (2011)
                </div>
                <div>
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
                  <p>Molecular Biology and Evolution 28(11): 3033-3043</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="dm-card card">
              <div className="dm-card-header card-header">BUSTED</div>
              <div className="dm-card-body card-body">
                <div>
                  B. Murrell, S. Weaver, M. D. Smith, J. O. Wertheim, S.
                  Murrell, A. Aylward and K. Eren, T. Pollner, D. P. Martin, D.
                  M. Smith, K. Scheffler and S. L. Kosakovsky Pond
                </div>
                <div>
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
                  <p>Molecular Biology and Evolution 32(5) 1365-1371</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="dm-card card">
              <div className="dm-card-header card-header">FEL</div>
              <div className="dm-card-body card-body">
                <div>
                  Sergei L. Kosakovsky Pond and Simon D. W. Frost (2005)
                </div>
                <div>
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
                  <p>Molecular Biology and Evolution 22(5): 1208-1222</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="dm-card card">
              <div className="dm-card-header card-header">FUBAR</div>
              <div className="dm-card-body card-body">
                <div>
                  B. Murrell, S. Moola, A. Mabona, T. Weighill, D. Sheward, S.
                  L. Kosakovsky Pond and K. Scheffler
                </div>
                <div>
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
                  <p>Molecular Biology and Evolution 30(5) : 1196-1205</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="dm-card card">
              <div className="dm-card-header card-header">GARD</div>
              <div className="dm-card-body card-body">
                <div>
                  Sergei L Kosakovsky Pond, David Posada, Michael B Gravenor,
                  Christopher H Woelk and Simon DW Frost
                </div>
                <div>
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
                  <p>Molecular Biology and Evolution 23(10): 1891-1901</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="dm-card card">
              <div className="dm-card-header card-header">MEME</div>
              <div className="dm-card-body card-body">
                <div>
                  Ben Murrell, Joel O. Wertheim, Sasha Moola, Thomas Weighill,
                  Konrad Scheffler and Sergei L. Kosakovsky Pond (2012)
                </div>
                <div>
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
                  <p>PLoS Genetics 8(7): e1002764</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="dm-card card">
              <div className="dm-card-header card-header">RELAX</div>
              <div className="dm-card-body card-body">
                <div>
                  J. O. Wertheim, B. Murrell, M. D. Smith, S. L. Kosakovsky Pond
                  and K. Scheffler
                </div>
                <div>
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
                  <p>Molecular Biology and Evolution 32(3): 820-832</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div className="dm-card card">
              <div className="dm-card-header card-header">SLAC</div>
              <div className="dm-card-body card-body">
                <div>
                  Sergei L. Kosakovsky Pond and Simon D. W. Frost (2005)
                </div>
                <div>
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
                  <p>Molecular Biology and Evolution 22(5): 1208-1222</p>
                </div>
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
