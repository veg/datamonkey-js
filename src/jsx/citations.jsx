var React = require("react");
var ReactDOM = require("react-dom");

var dmCard = {
  boxShadow: "none",
  border: "none",
  marginBottom: "20px"
};

var dmCardHeader = {
  backgroundColor: "#484d56",
  color: "#f7f7f7",
  padding: "10px 15px 5px 15px",
  borderBottom: "8px solid #00a99d",
  textAlign: "left",
  fontSize: "1.714em",
  fontWeight: "600"
};

var dmCardBody = {};

var dmCardTitle = {
  fontSize: "1.286em"
};

var dmFa = {
  color: "#dd4631",
  fontFamily: "Font Awesome 5 Free",
  fontSize: "0.90em",
  fontStyle: "normal",
  fontWeight: "900",
  marginRight: "5px",
  verticalAlign: "text-top"
};

var dmLink = {
  color: "#484d56"
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
          <div style={dmCard} className="dm-card card">
            <div style={dmCardHeader} className="dm-card-header card-header">
              Datamonkey
            </div>
            <div style={dmCardBody} className="dm-card-body card-body">
              <div style={dmCardTitle} className="dm-card-title card-title">
                Steven Weaver, Stephen D. Shank, Stephanie J. Spielman, Michael
                Li, Spencer V. Muse, Sergei L. Kosakovsky Pond
              </div>
              <div>
                <a
                  style={dmLink}
                  target="_blank"
                  href="https://academic.oup.com/mbe/article/35/3/773/4782511"
                >
                  <i
                    style={dmFa}
                    className="dm-fa fa-external-link-alt"
                    aria-hidden="true"
                  />
                  Datamonkey 2.0: a modern web application for characterizing
                  selective and other evolutionary processes
                </a>
                <p>Mol. Biol. Evol. 35(3):773–777</p>
              </div>

              <hr />

              <div style={dmCardTitle} className="dm-card-title card-title">
                Wayne Delport, Art F. Poon, Simon D. W. Frost and Sergei L.
                Kosakovsky Pond
              </div>
              <div>
                <a
                  style={dmLink}
                  target="_blank"
                  href="https://academic.oup.com/bioinformatics/article-lookup/doi/10.1093/bioinformatics/btq429"
                >
                  <i
                    style={dmFa}
                    className="dm-fa fa-external-link-alt"
                    aria-hidden="true"
                  />
                  Datamonkey 2010: a suite of phylogenetic analysis tools for
                  evolutionary biology
                </a>
                <p>Bioinformatics 26(19): 2455-2457</p>
              </div>

              <hr />

              <div style={dmCardTitle} className="dm-card-title card-title">
                Sergei L. Kosakovsky Pond and Simon D. W. Frost (2005)
              </div>
              <div>
                <a
                  style={dmLink}
                  target="_blank"
                  href="http://bioinformatics.oxfordjournals.org/cgi/content/abstract/21/10/2531?ijkey=a5yRfKOnDZ1Kb6J&keytype=ref"
                >
                  <i
                    style={dmFa}
                    className="dm-fa fa-external-link-alt"
                    aria-hidden="true"
                  />
                  Datamonkey: rapid detection of selective pressure on
                  individual sites of codon alignments
                </a>
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
            <div style={dmCard} className="dm-card card">
              <div style={dmCardHeader} className="dm-card-header card-header">
                HyPhy
              </div>
              <div style={dmCardBody} className="dm-card-body card-body">
                <div style={dmCardTitle} className="dm-card-title card-title">
                  Sergei L Kosakovsky Pond, Art FY Poon, Ryan Velazquez, Steven
                  Weaver, N Lance Hepler, Ben Murrell, Stephen D Shank, Brittany
                  Rife Magalis, Dave Bouvier, Anton Nekrutenko, Sadie Wisotsky,
                  Stephanie J Spielman, Simon DW Frost, Spencer V Muse (2020)
                </div>
                <div>
                  <a
                    style={dmLink}
                    target="_blank"
                    href="https://academic.oup.com/mbe/article-abstract/37/1/295/5555420"
                  >
                    <i
                      style={dmFa}
                      className="dm-fa fa-external-link-alt"
                      aria-hidden="true"
                    />
                    HyPhy 2.5—A Customizable Platform for Evolutionary
                    Hypothesis Testing Using Phylogenies.
                  </a>
                  <p>Molecular Biology and Evolution 37.1 (2020): 295-299.</p>
                </div>
              </div>
              <hr />

              <div style={dmCardBody} className="dm-card-body card-body">
                <div style={dmCardTitle} className="dm-card-title card-title">
                  Sergei L. Kosakovsky Pond, Simon D. W. Frost and Spencer V.
                  Muse (2005)
                </div>
                <div>
                  <a
                    style={dmLink}
                    target="_blank"
                    href="http://bioinformatics.oxfordjournals.org/cgi/content/short/21/5/676"
                  >
                    <i
                      style={dmFa}
                      className="dm-fa fa-external-link-alt"
                      aria-hidden="true"
                    />
                    HyPhy: hypothesis testing using phylogenies
                  </a>
                  <p>Bioinformatics 21(5): 676-679</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div style={dmCard} className="dm-card card">
              <div style={dmCardHeader} className="dm-card-header card-header">
                HIV-TRACE
              </div>
              <div style={dmCardBody} className="dm-card-body card-body">
                <div style={dmCardTitle} className="dm-card-title card-title">
                  Sergei L Kosakovsky Pond, Steven Weaver, Andrew J Leigh Brown,
                  Joel O Wertheim (2018)
                </div>
                <div>
                  <a
                    style={dmLink}
                    target="_blank"
                    href="https://doi.org/10.1093/molbev/msy016"
                  >
                    <i
                      style={dmFa}
                      className="dm-fa fa-external-link-alt"
                      aria-hidden="true"
                    />
                    HIV-TRACE (TRAnsmission Cluster Engine): a Tool for Large
                    Scale Molecular Epidemiology of HIV-1 and Other Rapidly
                    Evolving Pathogens
                  </a>
                  <p>
                    Molecular Biology and Evolution, Volume 35, Issue 7, July
                    2018, Pages 1812–1819
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <h3>Method Citations</h3>
            <div style={dmCard} className="dm-card card">
              <div style={dmCardHeader} className="dm-card-header card-header">
                aBSREL
              </div>
              <div style={dmCardBody} className="dm-card-body card-body">
                <div style={dmCardTitle} className="dm-card-title card-title">
                  M. D. Smith, J. O. Wertheim, S. Weaver, B. Murrell, K.
                  Scheffler and S. L. Kosakovsky Pond
                </div>
                <div>
                  <a
                    style={dmLink}
                    target="_blank"
                    href="http://dx.doi.org/10.1093/molbev/msv022"
                  >
                    <i
                      style={dmFa}
                      className="dm-fa fa-external-link-alt"
                      aria-hidden="true"
                    />
                    Less Is More: An Adaptive Branch-Site Random Effects Model
                    for Efficient Detection of Episodic Diversifying Selection
                  </a>
                  <p>Molecular Biology and Evolution 32: 1342-1353</p>
                </div>

                <hr />

                <div style={dmCardTitle} className="dm-card-title card-title">
                  Sergei L. Kosakovsky Pond, Ben Murrell, Mathieu Fourment,
                  Simon D. W. Frost, Wayne Delport and Konrad Scheffler (2011)
                </div>
                <div>
                  <a
                    style={dmLink}
                    target="_blank"
                    href="http://mbe.oxfordjournals.org/content/early/2011/06/11/molbev.msr125.abstract"
                  >
                    <i
                      style={dmFa}
                      className="dm-fa fa-external-link-alt"
                      aria-hidden="true"
                    />
                    A random effects branch-site model for detecting episodic
                    diversifying selection
                  </a>
                  <p>Molecular Biology and Evolution 28(11): 3033-3043</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div style={dmCard} className="dm-card card">
              <div style={dmCardHeader} className="dm-card-header card-header">
                BUSTED
              </div>
              <div style={dmCardBody} className="dm-card-body card-body">
                <div style={dmCardTitle} className="dm-card-title card-title">
                  B. Murrell, S. Weaver, M. D. Smith, J. O. Wertheim, S.
                  Murrell, A. Aylward and K. Eren, T. Pollner, D. P. Martin, D.
                  M. Smith, K. Scheffler and S. L. Kosakovsky Pond
                </div>
                <div>
                  <a
                    style={dmLink}
                    target="_blank"
                    href="https://academic.oup.com/mbe/article-lookup/doi/10.1093/molbev/msv035"
                  >
                    <i
                      style={dmFa}
                      className="dm-fa fa-external-link-alt"
                      aria-hidden="true"
                    />
                    Gene-Wide Identification of Episodic Selection
                  </a>
                  <p>Molecular Biology and Evolution 32(5) 1365-1371</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div style={dmCard} className="dm-card card">
              <div style={dmCardHeader} className="dm-card-header card-header">
                FEL
              </div>
              <div style={dmCardBody} className="dm-card-body card-body">
                <div style={dmCardTitle} className="dm-card-title card-title">
                  Sergei L. Kosakovsky Pond and Simon D. W. Frost (2005)
                </div>
                <div>
                  <a
                    style={dmLink}
                    target="_blank"
                    href="http://mbe.oxfordjournals.org/cgi/content/short/22/5/1208"
                  >
                    <i
                      style={dmFa}
                      className="dm-fa fa-external-link-alt"
                      aria-hidden="true"
                    />
                    Not So Different After All: A Comparison of Methods for
                    Detecting Amino Acid Sites Under Selection
                  </a>
                  <p>Molecular Biology and Evolution 22(5): 1208-1222</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div style={dmCard} className="dm-card card">
              <div style={dmCardHeader} className="dm-card-header card-header">
                FUBAR
              </div>
              <div style={dmCardBody} className="dm-card-body card-body">
                <div style={dmCardTitle} className="dm-card-title card-title">
                  B. Murrell, S. Moola, A. Mabona, T. Weighill, D. Sheward, S.
                  L. Kosakovsky Pond and K. Scheffler
                </div>
                <div>
                  <a
                    style={dmLink}
                    target="_blank"
                    href="https://academic.oup.com/mbe/article/30/5/1196/998247/FUBAR-A-Fast-Unconstrained-Bayesian-AppRoximation"
                  >
                    <i
                      style={dmFa}
                      className="dm-fa fa-external-link-alt"
                      aria-hidden="true"
                    />
                    FUBAR: a fast, unconstrained bayesian approximation for
                    inferring selection
                  </a>
                  <p>Molecular Biology and Evolution 30(5) : 1196-1205</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div style={dmCard} className="dm-card card">
              <div style={dmCardHeader} className="dm-card-header card-header">
                GARD
              </div>
              <div style={dmCardBody} className="dm-card-body card-body">
                <div style={dmCardTitle} className="dm-card-title card-title">
                  Sergei L Kosakovsky Pond, David Posada, Michael B Gravenor,
                  Christopher H Woelk and Simon DW Frost
                </div>
                <div>
                  <a
                    style={dmLink}
                    target="_blank"
                    href="http://mbe.oxfordjournals.org/cgi/content/full/23/10/1891"
                  >
                    <i
                      style={dmFa}
                      className="dm-fa fa-external-link-alt"
                      aria-hidden="true"
                    />
                    Automated Phylogenetic Detection of Recombination Using a
                    Genetic Algorithm
                  </a>
                  <p>Molecular Biology and Evolution 23(10): 1891-1901</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div style={dmCard} className="dm-card card">
              <div style={dmCardHeader} className="dm-card-header card-header">
                MEME
              </div>
              <div style={dmCardBody} className="dm-card-body card-body">
                <div style={dmCardTitle} className="dm-card-title card-title">
                  Ben Murrell, Joel O. Wertheim, Sasha Moola, Thomas Weighill,
                  Konrad Scheffler and Sergei L. Kosakovsky Pond (2012)
                </div>
                <div>
                  <a
                    style={dmLink}
                    target="_blank"
                    href="http://www.plosgenetics.org/article/info%3Adoi%2F10.1371%2Fjournal.pgen.1002764"
                  >
                    <i
                      style={dmFa}
                      className="dm-fa fa-external-link-alt"
                      aria-hidden="true"
                    />
                    Detecting Individual Sites Subject to Episodic Diversifying
                    Selection
                  </a>
                  <p>PLoS Genetics 8(7): e1002764</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div style={dmCard} className="dm-card card">
              <div style={dmCardHeader} className="dm-card-header card-header">
                RELAX
              </div>
              <div style={dmCardBody} className="dm-card-body card-body">
                <div style={dmCardTitle} className="dm-card-title card-title">
                  J. O. Wertheim, B. Murrell, M. D. Smith, S. L. Kosakovsky Pond
                  and K. Scheffler
                </div>
                <div>
                  <a
                    style={dmLink}
                    target="_blank"
                    href="https://academic.oup.com/mbe/article-lookup/doi/10.1093/molbev/msu400"
                  >
                    <i
                      style={dmFa}
                      className="dm-fa fa-external-link-alt"
                      aria-hidden="true"
                    />
                    RELAX: detecting relaxed selection in a phylogenetic
                  </a>
                  <p>Molecular Biology and Evolution 32(3): 820-832</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col">
            <div style={dmCard} className="dm-card card">
              <div style={dmCardHeader} className="dm-card-header card-header">
                SLAC
              </div>
              <div style={dmCardBody} className="dm-card-body card-body">
                <div style={dmCardTitle} className="dm-card-title card-title">
                  Sergei L. Kosakovsky Pond and Simon D. W. Frost (2005)
                </div>
                <div>
                  <a
                    style={dmLink}
                    target="_blank"
                    href="http://mbe.oxfordjournals.org/cgi/content/short/22/5/1208"
                  >
                    <i
                      style={dmFa}
                      className="dm-fa fa-external-link-alt"
                      aria-hidden="true"
                    />
                    Not So Different After All: A Comparison of Methods for
                    Detecting Amino Acid Sites Under Selection
                  </a>
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
