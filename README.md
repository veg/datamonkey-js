Datamonkey API
========================


Multiple Sequence Alignment
===========================

# Parameters

| Parameter | Description |
| --------- | ----------: |
| fn        |             |
| datatype  |             |
| gencode   |             |

# Results



Analyses
==============

## ASR

An implementation of the ancestral sequence reconstruction algorithms by 
[Pupko et al. 2000]("http://mbe.oxfordjournals.org/cgi/content/full/17/6/890?view=long&pmid=10833195"),
[Yang et al. 1995]("http://www.genetics.org/cgi/content/abstract/141/4/1641"), 
and 
[Nielsen 2002]("http://www.ncbi.nlm.nih.gov/pubmed/12396587").

### Phases 

#### Phase 1: Nucleotide model maximum likelihood (ML) fit

A nucleotide model  (any model from the time-reversible class can be chosen) is
fitted to the data and tree (either NJ or user supplied) using maximum
likelihood <b>to obtain branch lengths and substitution rates</b>. If the input
alignment contains multiple segments, base frequencies and substitution rates
are inferred <b>jointly</b> from the entire alignment, while branch lengths are
fitted to each segment separately.  The "best-fitting" model can be determined
automatically by a model selection procedure or chosen by the user. 

#### Phase 2: Null model M1 (no selection) fit

Holding branch lengths proportional to and subsitution rate parameters constant
at the values estimated in Phase 1, a codon model obtained by crossing MG94 and
the nucleotide model of Phase 1 is fitted to the data to obtain <b>independent
rate distributions</b> for &omega; (dN/dS) and dS. This methods allows for rate
heterogeneity both in synonymous and non-synonymous rates, by fitting a 3 bin
general discrete distribution to synonymous rates, and a 2 bin discrete
distribution to &omega; yielding 6 possible values for the ratio dN. The &omega;
distribution has the form: &omega;_1&lt;1 (weight P) and 1 (weight 1-P).

#### Phase 3: Alternative model M2 (selection) fit

Holding branch lengths proportional to and subsitution rate parameters constant
at the values estimated in Phase 1, a codon model obtained by crossing MG94 and
the nucleotide model of Phase 1 is fitted to the data to obtain <b>independent
rate distributions</b> for &omega; (dN/dS) and dS. This methods allows for rate
heterogeneity both in synonymous and non-synonymous rates, by fitting a 3 bin
general discrete distribution to synonymous rates, and a 3 bin discrete
distribution to &omega; yielding 3 possible values for the ratio dN. The &omega;
distribution has the form: &omega;_1&lt;1 (weight P_1), 1 (weight (1-P_1)P_2)
and &omega;_2&gt;1 (weight (1-P_1)(1-P_2)).

#### Phase 4: LRT 

Because model M1 is nested in M2 (set P_2 = 1 or &omega;_2 = 1), they can be
tested against each other using a likelihood ratio test with 2 degrees of
freedom (this is actually a conservative test because P_2 and &omega;_2 are not
separately identifible if on the boundary (i.e. when P_2 = 0 or 1 or when
&omega;_2 = 1).


### Parameters

| Parameter   | Description                    |
| ---------   | ----------:                    |
| ratematrix  | Mixed   //For protein data     |
| frequencies | Number  //For protein data     |
| modelstring | String  //For non-protein data |
| rateoption  | Number  //Required             |
| rateclasses | Number  //Required             |
| treemode    | Number                         |
| root        | Number                         |

### Results

## BGM

### Parameters

| Parameter | Description |
| --------- | ----------: |
| roptions  | Number      |
| pvalue    | Number      |
| dnds      | Number      |
| ambchoice | Number      |

### Results
TODO

## FEL

Complete details can be found in our
[MBE]('http://www.hyphy.org/sergei/pubs/2005-3.pdf') MBE paper (FEL) and
[PLoS Comp Bio paper]('http://compbiol.plosjournals.org/perlserv/?request=get-document&doi=10.1371/journal.pcbi.0020062')(IFEL).

### Phases 

#### Phase 1: Nucleotide model maximum likelihood (ML) fit=

A nucleotide model  (any model from the time-reversible class can be chosen) is
fitted to the data and tree (either NJ or user supplied) using maximum
likelihood <b>to obtain branch lengths and substitution rates</b>. If the input
alignment contains multiple segments, base frequencies and substitution rates
are inferred <b>jointly</b> from the entire alignment, while branch lengths are
fitted to each segment separately.  The "best-fitting" model can be determined
automatically by a model selection procedure or chosen by the user. 

#### Phase 2: Codon model ML fit

Holding branch lengths proportional to and subsitution rate parameters constant
at the values estimated in Phase 1, a codon model obtained by crossing MG94 and
the nucleotide model of Phase 1 is fitted to the data to obtain codon branch
lengths for scaling dN and dS estimated subsequently from each site.

#### Phase 3: Site by site likelihood ratio test

For every site, utilizing parameter estimates from Phases 1 and 2, an <i>MG94
based codon</i> model from Phase 2, now with two parameters - &alpha;
(instantaneous synonymous site rate) and &beta; (instantaneous non-synonymous
site rate) rate are first fitted independently, and then under the constraint
&alpha;=&beta;. Next, a one degree of freedom likelihood ratio test is performed
to infer whether &alpha; is different from &beta;, and a p-value is derived. If
the p-value is significant, the site is classified based on whether
&alpha;&gt;&beta; (negative selection) or &alpha;&lt;&beta; (positive
selection).

### Parameters

| Parameter   | Description |
| ---------   | ----------: |
| modelstring | String      |
| treemode    | Number      |
| pvalue      | Number      |

### Results

## Fubar
TODO

### Parameters

| Parameter | Description |
| --------- | ----------: |
| treemode  | Number      |
| pvalue    | Number      |

### Results

## GABranch
Complete method details can be found in this [MBE paper]('http://mbe.oupjournals.org/cgi/content/full/msi031?ijkey=58b5TG2Kv933M&keytype=ref') 

### Phases

#### Phase 1: Nucleotide model maximum likelihood (ML) fit

A nucleotide model  (any model from the time-reversible class can be chosen) is
fitted to the data and tree (either NJ or user supplied) using maximum
likelihood <b>to obtain branch lengths and substitution rates</b>. If the input
alignment contains multiple segments, base frequencies and substitution rates
are inferred <b>jointly</b> from the entire alignment, while branch lengths are
fitted to each segment separately.  The "best-fitting" model can be determined
automatically by a model selection procedure or chosen by the user. 

#### Phase 2: ML Codon model fitting

Holding branch lengths proportional to and subsitution rate parameters constant
at the values estimated in Phase 1, a codon model obtained by crossing MG94 and
the nucleotide model of Phase 1 is fitted to the data to obtain a tree-wide
estimate of &omega;.

#### Phase 3: Genetic algorithm search for branch allocation

Given B branch types (B=2 initially, and is incremented after each GA iteration,
until no further improvement can be obtained), a genetic algorithm (CHC) is used
to search for good fitting model among all those which allocate each tree branch
to one of B rate classes (with a separate &omega; for every class).  The fitness
of each model is determined by its small sample AIC score (c-AIC), and branch
lengths are re-estimated with after the last model for which the branch lengths
have been estimated is 50 c-AIC points worse than the current best model. 

#### Phase 4: Multimodel inference

A 95% confidence intervals is determined using their Akaike weights, and various
quantities (e.g. &omega; for every branch, the probability that &omega;&gt; 1)
are computed using model averaging.

### Parameters

| Parameter   | Description |
| ---------   | ----------: |
| modelstring | String      |
| treemode    | Number      |

### Results

### Note

Unlike <a href = 'http://mbe.oxfordjournals.org/cgi/content/abstract/22/12/2472'
class = 'REFERENCE'>branch site methods</a>, GA branch does not need the user to
select branches of interest to test, or test one branch at a time (which can
lead to statisitcal instability or acceptance of poorly supported models, see <a
href='http://www.hyphy.org/pubs/hyphybook2007.pdf' class = 'REFERENCE'>Section
1.5.</a> for discussion), but rather mines the data for good-fitting models. In
addition, inference based on multiple models (as opposed to a null-alternative
pair) is more robust to model misspecification.  On the other hand, the current
version of GA branch does not easily accomodate site-to-site &omega; variation
(except uniformly along branches).


## GARD 

### Parameters

| Parameter   | Description           |
| ---------   | ----------:           |
| ratematrix  | Mixed   //Protein     |
| frequencies | Number  //Protein     |
| rateoption  | Number                |
| rateclasses | Number                |
| modelstring | String  //Non-protein |

### Results

## MEME

Mixed Effects Model of Evolution (MEME) is a generalization of FEL, with the
first two phases of the analyses being identical.  Whereas FEL assumes that the
same dN/dS (&omega;) ratio applies to all branches (or in the case of IFEL - to
interior branches), MEME instead models variable &omega; across lineages at an
individual site (i.e. each site is treated is a FIXED effects component of the
model) using a two-bin random distribution with &omega;<sup>-</sup>&le;1
(proportion p) and &omega;<sup>+</sup> (unrestriced, proportion 1-p).

This can be interpreted as having a proportion (p) of branches at a site
evolve neutrally or under negative selection, while the remained (1-p) can also
evolve under diversifying selection. To test for evidence of episodic selection,
we construct the likelihood ratio test between the above model (alternative) and
the nested null, where &omega;<sup>+</sup> is forced to be in [0,1].

Simulations (manuscript in preparation) show that MEME is nearly always
preferable to FEL because it matches the performance of FEL when there is no
lineage-to-lineage variation in dN/dS, and significantly improves upon it when
such variation is present. For instance, if one clade in a large tree is
evolving with dN/dS = 5, while the rest of the tree (say 90% of branches) evolve
with dN/dS = 0.1, FEL is likely to call such site NEGATIVELY selected, whilst
MEME will detect that a small proportion of branches is evolving subject to
positive selection.

The method is described in complete detail in this 
[PLoS Genetics]('http://www.plosgenetics.org/article/info%3Adoi%2F10.1371%2Fjournal.pgen.1002764')
paper


### Parameters

| Parameter   | Description |
| ---------   | ----------: |
| modelstring | String      |
| treemode    | Number      |
| pvalue      | Number      |

### Results

## Model Selection

### Parameters

| Parameter   | Description |
| ---------   | ----------: |
| modelstring | String      |
| treemode    | Number      |

### Results

## PARRIS

Complete method details can be found in this 
[Bioinformatics page]('http://bioinformatics.oxfordjournals.org/cgi/content/short/22/20/2493')

### Phases 

#### Phase 1: Nucleotide model maximum likelihood (ML) fit

A nucleotide model  (any model from the time-reversible class can be chosen) is
fitted to the data and tree (either NJ or user supplied) using maximum
likelihood <b>to obtain branch lengths and substitution rates</b>. If the input
alignment contains multiple segments, base frequencies and substitution rates
are inferred <b>jointly</b> from the entire alignment, while branch lengths are
fitted to each segment separately.  The "best-fitting" model can be determined
automatically by a model selection procedure or chosen by the user. 

#### Phase 2: Null model M1 (no selection) fit

Holding branch lengths proportional to and subsitution rate parameters constant
at the values estimated in Phase 1, a codon model obtained by crossing MG94 and
the nucleotide model of Phase 1 is fitted to the data to obtain <b>independent
rate distributions</b> for &omega; (dN/dS) and dS. This methods allows for rate
heterogeneity both in synonymous and non-synonymous rates, by fitting a 3 bin
general discrete distribution to synonymous rates, and a 2 bin discrete
distribution to &omega; yielding 6 possible values for the ratio dN. The &omega;
distribution has the form: &omega;_1&lt;1 (weight P) and 1 (weight 1-P).

#### Phase 3: Alternative model M2 (selection) fit

Holding branch lengths proportional to and subsitution rate parameters constant
at the values estimated in Phase 1, a codon model obtained by crossing MG94 and
the nucleotide model of Phase 1 is fitted to the data to obtain <b>independent
rate distributions</b> for &omega; (dN/dS) and dS. This methods allows for rate
heterogeneity both in synonymous and non-synonymous rates, by fitting a 3 bin
general discrete distribution to synonymous rates, and a 3 bin discrete
distribution to &omega; yielding 3 possible values for the ratio dN. The &omega;
distribution has the form: &omega;_1&lt;1 (weight P_1), 1 (weight (1-P_1)P_2)
and &omega;_2&gt;1 (weight (1-P_1)(1-P_2)).

#### Phase 4: LRT

Because model M1 is nested in M2 (set P_2 = 1 or &omega;_2 = 1), they can be
tested against each other using a likelihood ratio test with 2 degrees of
freedom (this is actually a conservative test because P_2 and &omega;_2 are not
separately identifible if on the boundary (i.e. when P_2 = 0 or 1 or when
&omega;_2 = 1).


### Parameters

| Parameter   | Description |
| ---------   | ----------: |
| modelstring | String      |
| treemode    | Number      |
| pvalue      | Number      |

### Results


## REL

Complete method details can be found in our 
[MBE paper]('http://www.hyphy.org/sergei/pubs/2005-3.pdf')

#### Phase 1: Nucleotide model maximum likelihood (ML) fit

A nucleotide model  (any model from the time-reversible class can be chosen) is
fitted to the data and tree (either NJ or user supplied) using maximum
likelihood <b>to obtain branch lengths and substitution rates</b>. If the input
alignment contains multiple segments, base frequencies and substitution rates
are inferred <b>jointly</b> from the entire alignment, while branch lengths are
fitted to each segment separately.  The "best-fitting" model can be determined
automatically by a model selection procedure or chosen by the user. 

#### Phase 2: Codon model ML fit

Holding branch lengths proportional to and subsitution rate parameters constant
at the values estimated in Phase 1, a codon model obtained by crossing MG94 and
the nucleotide model of Phase 1 is fitted to the data to obtain <b>independent
rate distributions</b> for dN and dS. This methods allows for rate heterogeneity
both in synonymous and non-synonymous rates, by fitting a 3 bin general discrete
distribution to synonymous rates, and another 3 bin general discrete
distribution to dN, yielding 9 possible values for the ratio dN/dS.

#### Phase 3: Empirical Bayes analysis

For every site, utilizing parameter estimates from Phases 1 and 2 we compute two
Bayes Factors, one for the event that {dN&lt;dS} at that site (negative
selection), and another for the event that {dN&gt;dS} (positive selection). When
these Bayes Factors are sufficiently large (say 50 or more), we call such a site
selected.  Note, that Bayes Factors can not be in general easily related to
statistical significance, although our simulation studies showed respectable
power even for small datasets and reasonable false positive rates. As a rule of
thumb, 1/Bayes Factor is analogous to the p-value of the other two tests in this
setting.  This method tends to be less conservative and slower than SLAC and
FEL.

### Parameters

| Parameter   | Description |
| ---------   | ----------: |
| modelstring | String      |
| treemode    | Number      |
| pvalue      | Number      |

### Results

### Note

This method is a generalization of site-by-site positive selection analyses
implemented in Ziheng Yang's PAML. The main differences are 

* More general nucleotide bias models
* Modeling of synonymous rate variation as well as non-synonymous rate variation
* Use of Bayes factors for empirical Bayes result processing (although the Bayes
Empricial Bayes procedure in recent versions of PAML is more suited from smaller
and 'noisier' datasets).

Refer to this 
[paper]('http://mbe.oxfordjournals.org/cgi/content/short/22/12/2375')
for a detailed discussion.


## Branch-site REL

Branch-site REL is a statistically sound approach to find lineages at which a
proportion of sites evolve with dN/dS &gt; 1, without making any assumptions
about which lineages those are, and what happens to the rest of the lineages.
Such assumptions have been made by previously published branch-site methods
(e.g. Nielsen and Yang), but as we have recently shown -- they can lead to
uncontrollable rates of false positives and loss of power.

Branch-site REL will perform a series of LRT tests to identify all lineages in a
phylogeny where a proportion of sites evolves with dN/dS &gt; 1, i.e.  instances
of episodic (dN/dS varies across the tree) diversifying selection at a
proportion of sites (dN/dS varies across sites). As such, this model is a
generalization of existing branch-site methods.

The details of the algorithm to efficiently compute the phylogenetic likelihood
function in this context and further model background can be found in this 
[Molecular Biology and Evolution]('http://mbe.oxfordjournals.org/content/early/2011/06/11/molbev.msr125.abstract') 
paper

### Parameters

| Parameter   | Description |
| ---------   | ----------: |
| modelstring | String      |
| treemode    | Number      |
| pvalue      | Number      |

### Results


## SBP
TODO

### Parameters

| Parameter   | Description           |
| ---------   | ----------:           |
| ratematrix  | Mixed   //Protein     |
| frequencies | Number  //Protein     |
| rateoption  | Number                |
| rateclasses | Number                |
| modelstring | String  //Non-protein |

### Results

## SCUEAL

Complete method details can be found in this [PLoS Comp Biol]('http://www.ploscompbiol.org/article/info%3Adoi%2F10.1371%2Fjournal.pcbi.1000581') paper

### Parameters

| Parameter | Description |
| --------- | ----------: |
| reference | String      |

### Results

## SLAC

Complete method details can be found in our 
[MBE paper]('http://www.hyphy.org/sergei/pubs/2005-3.pdf')

#### Phase 1: Nucleotide model maximum likelihood (ML) fit

A nucleotide model  (any model from the time-reversible class can be chosen) is
fitted to the data and tree (either NJ or user supplied) using maximum
likelihood <b>to obtain branch lengths and substitution rates</b>. If the input
alignment contains multiple segments, base frequencies and substitution rates
are inferred <b>jointly</b> from the entire alignment, while branch lengths are
fitted to each segment separately.  The "best-fitting" model can be determined
automatically by a model selection procedure or chosen by the user. 


#### Phase 2: Codon model ML fit

Holding branch lengths and subsitution rate parameters constant at the values
estimated in Phase 1, a codon model obtained by crossing MG94 and the nucleotide
model of Phase 1 is fitted to the data to obtain <b>a global &omega;=dN/dS
ratio</b>. Optionally, a confidence interval on dN/dS can be obtained using
profile likelihood. 

#### Phase 3: ML ancestral sequence reconstuction

Utilizing parameter estimates from Phases 1 and 2, <b><i>codon</i> ancestral
sequences are reconstructed</b> site by site using maximum likelihood, in such a
way as to maximize the likelihood of the data at the site over all possible
ancestral character states. Inferred ancestral sequences are treated as known
for Phase 4. In HyPhy, it is also possible to weight over all possible ancestral
sequences, or to draw a sample from possible ancestral sequences in proportion
to their relative likelihood.

#### Phase 4: Inference of selection at each site

For every variable site, four quantities are computed: <b>normalized expected
(ES and EN) and observed numbers (NS and NN) of synonymous and non-synonymous
substitutions</b>.  SLAC estimates dN = NN/EN and dS = NS/ES, and if dN &lt; (or
&gt;) dS a codon is called negatively (or positively) selected. As p-value
derived from a two-tailed extended binomial distribution is used to assess
significance. The test assumes that under neutrality, a random substitution will
be synonymous with probability <tt>P = ES/(ES+EN)</tt>, and computes how likely
it is that given that <tt>P</tt>, NS out of NN+NS substitutuons are synonymous. 


### Parameters

| Parameter   | Description |
| ---------   | ----------: |
| roptions    | Number      |
| pvalue      | Number      |
| dnds        | Number      |
| ambchoice   | Number      |
| modelstring | String      |
| treeMode    | Number      |

### Results

## UDS

Manuscript currently in preparation

### Phases

#### Phase 0: Quality Filtering
Alignments are filtered by removing sequences of low quality (as determined by
their PHRED scores). The current defaults are set to only include reads of
minimum length 100 bp and PHRED scores > 20. A PHRED score of 10 is
approximately equivalent to 95% confidence, whereas 20 is approximately 99%. The
HIV-1 454 analysis pipeline is also available for <a
href='http://www.datam0nk3y.org/hyphywiki/index.php/HIV454'
target="_BLANK">download</a>.


#### Phase 1: Amino acid and nucleotide alignment

The alignment phase first performs amino acid alignment between a chosen
reference sequence and each of the reads. Only alignments that exceed an
alignment score threshold are retained, where the threshold is 5 x the the
alignment score expected from a read of equal length and identical base
composition. The next alignment step tries to include reads which failed the
amino acid alignment by performing pairwise nucleotide alignments to the
consensus of the reads which passed the amino acid alignment. Sequences are
included in this second step if the pairwise per nucleotide alignment score
exceeds the median of that from all reads included in the amino acid alignment
step. 

#### Phase 2: Estimation of summary statistics

This phase reports summary statistics on read length, depth and frequencies of
minority variants.

#### Phase 3: Diversity Analysis

The sliding window analysis phase estimates nucleotide diversity in sliding
windows which meet the minimum coverage criteria. Phylogenies are also estimated
within sliding windows, and bootstrap resampling is applied to the sliding
window with at least 4 variants and maximum nucleotide diversity. The latter is
useful for the estimation of dual/multi infection, although the power to recover
well-supported trees is reduced since reads are typically short (<200bp).

#### Phase 4: Mutation rate estimation

The number of mutation rate classes is estimated using a binomial mixture model.
Briefly, we fit a model with a single rate class and estimate the mutation rate
from a binomial distribution with the number of successes equal to the number of
observed mutations at a site, and the number of trials equal to the observed
coverage at a site. Additional rate classes are added using a mixture of
binomial models until model fit (evaluated using AIC) is no longer improved. The
parameters of the binomial mixture model (i.e. rates and their respective
proportions) are estimated using maximum likelihood.

#### Phase 5: Selection analysis

Selection at sites is evaluated using all pairwise comparisons between reads. We
estimate the ratio of observed non-synonymous to synonymous substitutions
(weighted by the number of pairwise comparisons) and compare this to that
expected given the observed codon frequencies and the genetic code.

#### Phase 6: Drug resistant mutation analysis

For each drug resistant site we estimate the mutation rank (i.e. the rank of the
mutation rate with respect to all other sites) and calculate the median mutation
rank of all drug resistant sites. The probability (P) that the median mutation
rank at drug resistant sites is greater than an equivalent-sized sample of
non-drug resistant sites is evaluated with permutations (n=1000). These data can
be used to determine if mutation properties at drug resistant sites are unique.
Furthermore, we classify drug resistant sites into mutation rate classes using
the same methods described in the mutation rate class estimation procedure. Here
we evaluate the posterior probability that a drug resistant site falls within a
particular mutation rate class. 

#### Phase 7: Identification of drug resistant compensatory mutations

This analysis phase screens reads for the occurrence of both drug resistant and
compensatory mutation sites. A Fisher's exact test is performed to determine
whether drug resistant mutations and compensatory mutations occur more
frequently than expected by chance.


### Parameters

| Parameter           | Description |
| ---------           | ----------: |
| minread             | Number      |
| scorem              | Number      |
| mincoverage         | Number      |
| windowsize          | Number      |
| windowstride        | Number      |
| mincopycount        | Number      |
| nucdivthreshold     | Number      |
| dodr                | Number      |
| mindrugscore        | Number      |
| mindrugcoverage     | Number      |
| lovemelongtime      | String      |
| lovemelikeyouwantto | String      |

### Results

All results are presented online. Result databases are also available for each
gene processed for subsequent analysis and processing. We are in the process of
writing dedicated HyPhy scripts for these purposes which will be made available
[here]('http://www.datam0nk3y.org/hyphywiki/index.php/HIV454').

