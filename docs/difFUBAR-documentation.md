# difFUBAR Documentation

## Table of Contents
1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Input Requirements](#input-requirements)
4. [Analysis Parameters](#analysis-parameters)
5. [Understanding Results](#understanding-results)
6. [File Format Specifications](#file-format-specifications)
7. [Troubleshooting](#troubleshooting)
8. [Frequently Asked Questions](#frequently-asked-questions)

---

## Overview

### What is difFUBAR?

**difFUBAR** (Differential Fast, Unconstrained Bayesian AppRoximation) is a method for detecting sites under differential positive selection between tagged branch groups in a phylogeny. It extends the FUBAR method to identify sites where the selective pressure differs significantly between predefined groups of branches.

### When to Use difFUBAR

Use difFUBAR when you want to:
- Compare selective pressures between different groups of species/lineages
- Identify sites under differential selection between experimental conditions
- Analyze host-pathogen evolution across different environments
- Study adaptation differences between geographic populations
- Investigate functional divergence between gene duplicates

### Key Features

- **Bayesian approach**: Uses Markov Chain Monte Carlo (MCMC) sampling for robust statistical inference
- **Multiple comparisons**: Compares selective pressures across user-defined branch groups
- **Interactive visualizations**: Provides publication-ready plots and interactive charts
- **Comprehensive output**: Detailed posterior probabilities for each codon site
- **Beta status**: Currently in beta testing with ongoing improvements

---

## Getting Started

### Quick Start Guide

1. **Prepare your data**:
   - Multiple sequence alignment in FASTA format
   - Phylogenetic tree with tagged branch groups
   - Combine into NEXUS format with embedded tree

2. **Submit analysis**:
   - Visit [datamonkey.org/difFubar](https://datamonkey.org/difFubar)
   - Upload your NEXUS file
   - Configure parameters (optional)
   - Submit job

3. **Tag branches**:
   - Select branch groups for comparison
   - Assign meaningful labels (e.g., "Host1", "Host2")
   - Confirm branch tagging

4. **View results**:
   - Download detailed JSON results
   - Explore interactive visualizations
   - Interpret posterior probabilities

### Example Workflow

```
1. Align sequences → 2. Build phylogeny → 3. Tag branches → 
4. Create NEXUS → 5. Run difFUBAR → 6. Analyze results
```

---

## Input Requirements

### Required Files

**NEXUS Format File** containing:
- Multiple sequence alignment (codon-based)
- Phylogenetic tree with branch lengths
- At least **2 tagged branch groups** for comparison

### Sequence Requirements

- **Format**: NEXUS with embedded tree
- **Data type**: Codon sequences (nucleotide sequences with length divisible by 3)
- **Alignment**: Sequences must be properly aligned with no gaps in codon positions
- **Minimum sequences**: At least 4 sequences (2 per group)
- **Maximum sequences**: 2000 sequences
- **Maximum sites**: System-defined limit for computational feasibility

### Tree Requirements

- **Format**: Newick format embedded in NEXUS file
- **Branch lengths**: Must include branch lengths (estimated divergence)
- **Branch groups**: At least 2 groups with meaningful biological interpretation
- **Tagging**: Branches tagged with group identifiers (e.g., {Foreground}, {Background})

### Branch Group Guidelines

- **Minimum group size**: At least 2 sequences per group
- **Maximum groups**: Up to 10 groups (optimal: 2-4 groups)
- **Biological relevance**: Groups should represent meaningful biological categories
- **Balance**: Roughly balanced group sizes provide better statistical power

---

## Analysis Parameters

### Basic Parameters

**Genetic Code**
- Default: Universal genetic code
- Options: 16 alternative genetic codes available
- Use case: Choose appropriate code for your organism

**Email Notification** (Optional)
- Receive notification when analysis completes
- Useful for long-running analyses

### Advanced Parameters

**Concentration of Dirichlet Prior**
- Range: 0.001 - 1.0
- Default: 0.5
- Lower values: More conservative (fewer detections)
- Higher values: More liberal (more detections)

**MCMC Iterations**
- Range: 100 - 10,000
- Default: 2,500
- More iterations: Better convergence, longer runtime
- Fewer iterations: Faster analysis, potential convergence issues

**Burnin Samples**
- Range: 50 - 5,000
- Default: 500
- Purpose: Discard initial samples before convergence
- Rule of thumb: 10-20% of total MCMC iterations

**Positive Selection Threshold**
- Range: 0.5 - 0.99
- Default: 0.95
- Higher values: More stringent detection (fewer false positives)
- Lower values: More sensitive detection (more sites detected)

**Grid Points**
- Fixed at: 20 points
- Purpose: Discretization of parameter space
- Note: Not user-controllable (optimized default)

### Parameter Selection Guidelines

**For exploratory analysis:**
- Use default parameters
- Consider higher iterations (5,000+) for final analysis

**For conservative results:**
- Lower Dirichlet concentration (0.1-0.3)
- Higher threshold (0.98+)
- More iterations (5,000+)

**For sensitive detection:**
- Higher Dirichlet concentration (0.7-1.0)
- Lower threshold (0.9)
- Adequate iterations (2,500+)

---

## Understanding Results

### Output Files

**JSON Results File**
- Detailed posterior probabilities for each site
- Statistical summaries and confidence intervals
- Raw MCMC samples for advanced analysis

**Interactive Visualizations**
- Overview plot: Differential selection across all sites
- Posterior distributions: Parameter estimates by group
- Detection summary: Sites with significant differential selection

**Analysis Log**
- Job progress and status messages
- Parameter settings and convergence diagnostics
- Error messages and warnings

### Interpretation Guide

#### Overview Plot
- **X-axis**: Codon site position
- **Y-axis**: Evidence for differential selection
- **Color coding**: Significance levels
- **Interpretation**: Peaks indicate sites with strong evidence for differential selection

#### Posterior Distributions
- **Parameters**: α (synonymous rate) and ω (nonsynonymous/synonymous ratio)
- **Groups**: Separate distributions for each tagged branch group
- **Interpretation**: Non-overlapping distributions suggest differential selection

#### Detection Summary
- **Listed sites**: Positions exceeding the threshold probability
- **Posterior probability**: Strength of evidence (0-1 scale)
- **Group comparisons**: Which groups show differential patterns

### Statistical Interpretation

**Posterior Probability > 0.95**:
- Strong evidence for differential selection
- Low false positive rate
- Suitable for follow-up functional studies

**Posterior Probability 0.80-0.95**:
- Moderate evidence for differential selection
- Consider biological context
- May warrant additional validation

**Posterior Probability < 0.80**:
- Weak evidence for differential selection
- High uncertainty
- Likely not biologically significant

### Biological Interpretation

**Functional Categories**:
- **Active sites**: Check if detected sites are functionally important
- **Structural domains**: Consider protein structure context
- **Regulatory regions**: Look for regulatory sequence motifs

**Evolutionary Context**:
- **Phylogenetic distribution**: Which lineages show differential selection
- **Temporal patterns**: When in evolutionary time differential selection occurred
- **Environmental correlates**: Link to ecological or environmental factors

---

## File Format Specifications

### NEXUS Format Requirements

```nexus
#NEXUS

BEGIN DATA;
DIMENSIONS NTAX=4 NCHAR=150;
FORMAT DATATYPE=DNA MISSING=? GAP=-;
MATRIX
Sequence1    ATGAAACGT...
Sequence2    ATGAAACGT...
Sequence3    ATGAAACGT...
Sequence4    ATGAAACGT...
;
END;

BEGIN TREES;
TREE tree1 = ((Sequence1{Group1}:0.1,Sequence2{Group1}:0.1):0.05,(Sequence3{Group2}:0.1,Sequence4{Group2}:0.1):0.05);
END;
```

### Branch Tagging Syntax

**Basic tagging**:
```
Species1{Foreground}:0.1
Species2{Background}:0.2
```

**Multiple groups**:
```
Species1{Host1}:0.1
Species2{Host2}:0.1
Species3{Vector}:0.1
```

**Nested groups** (for complex analyses):
```
(Species1{Group1}:0.05,Species2{Group1}:0.05){Parent}:0.1
```

### Common Format Issues

**Invalid codon sequences**:
- Sequence length not divisible by 3
- Stop codons in the middle of sequences
- Ambiguous nucleotides in critical positions

**Tree format problems**:
- Missing branch lengths
- Unmatched parentheses
- Species names don't match sequence names

**Branch tagging errors**:
- Missing group tags
- Only one group defined
- Inconsistent tag formatting

---

## Troubleshooting

### Common Error Messages

**"Site limit exceeded"**:
- **Problem**: Alignment too long for computational resources
- **Solution**: Reduce alignment length or use representative sequences
- **Prevention**: Check sequence length before submission

**"Sequence limit exceeded"**:
- **Problem**: Too many sequences (>2000)
- **Solution**: Use representative sampling or phylogenetic clustering
- **Prevention**: Filter sequences to most informative subset

**"Invalid tree format"**:
- **Problem**: Malformed Newick tree in NEXUS file
- **Solution**: Validate tree format using phylogenetic software
- **Prevention**: Use standard tree building software

**"Insufficient branch groups"**:
- **Problem**: Less than 2 tagged branch groups
- **Solution**: Add group tags to tree using {GroupName} syntax
- **Prevention**: Plan branch grouping strategy before analysis

**"Analysis failed during execution"**:
- **Problem**: Convergence issues or computational errors
- **Solution**: Try different parameters or simpler analysis
- **Prevention**: Use recommended parameter ranges

### Performance Considerations

**Large datasets** (>500 sequences):
- Consider representative sampling
- Use separate tree upload feature (when available)
- Allow longer computation time
- Monitor job status regularly

**Long sequences** (>1000 codons):
- Check for alignment quality
- Consider sliding window analysis
- Verify biological relevance of full sequence

**Complex phylogenies**:
- Ensure adequate branch length estimation
- Validate tree topology
- Consider simpler group definitions

### Getting Help

**Before contacting support**:
1. Check this documentation
2. Verify file formats
3. Try default parameters
4. Review error messages

**When contacting support**:
- Include job ID
- Describe the problem clearly
- Attach input files (if possible)
- Mention browser and system information

**Community resources**:
- Datamonkey Google Group
- HyPhy GitHub repository
- Scientific literature citations

---

## Frequently Asked Questions

### General Questions

**Q: How does difFUBAR differ from FUBAR?**
A: FUBAR detects positive selection across all branches, while difFUBAR specifically identifies sites where selection differs between predefined branch groups.

**Q: What's the difference between difFUBAR and RELAX?**
A: RELAX tests for relaxation/intensification of selection, while difFUBAR compares selection patterns between specific groups without assumptions about direction.

**Q: Can I analyze amino acid sequences?**
A: No, difFUBAR requires nucleotide sequences to estimate synonymous and nonsynonymous substitution rates.

**Q: How long does analysis take?**
A: Depends on dataset size and parameters. Typical analyses: 10 minutes to 2 hours. Large datasets may take longer.

### Technical Questions

**Q: What does the posterior probability represent?**
A: The probability that a site experiences differential selection between the defined branch groups, given the data and model.

**Q: How many MCMC iterations should I use?**
A: Default (2,500) is usually sufficient. For final analyses or large datasets, consider 5,000-10,000 iterations.

**Q: Why are my branch groups not detected automatically?**
A: You must manually tag branches using {GroupName} syntax in the phylogenetic tree.

**Q: Can I compare more than 2 groups?**
A: Yes, difFUBAR supports multiple group comparisons, though interpretation becomes more complex.

### Data Preparation Questions

**Q: How should I choose branch groups?**
A: Groups should represent meaningful biological categories (hosts, environments, functions) with adequate sampling per group.

**Q: What if my sequences have gaps?**
A: Ensure gaps don't disrupt codon structure. Consider removing highly gapped regions or sequences.

**Q: How do I create a NEXUS file?**
A: Use phylogenetic software like FigTree, Mesquite, or custom scripts to combine alignment and tree data.

**Q: What tree building method should I use?**
A: Any method producing reliable branch lengths (ML, Bayesian). Ensure the tree reflects true evolutionary relationships.

### Results Interpretation Questions

**Q: What constitutes a significant result?**
A: Posterior probability >0.95 is considered strong evidence. Consider biological context for interpretation.

**Q: No sites were detected. What does this mean?**
A: Either there's no differential selection, sample sizes are too small, or parameters are too conservative.

**Q: How do I validate significant sites?**
A: Consider functional studies, structural analysis, or independent datasets for validation.

**Q: Can I use results for publication?**
A: Yes, difFUBAR is suitable for publication. Include appropriate citations and methodology details.

---

## Citations and References

### Primary Citation
When using difFUBAR, please cite:
> [difFUBAR manuscript - to be updated when published]

### Related Methods
- **FUBAR**: Murrell et al. (2013) Mol Biol Evol
- **HyPhy**: Kosakovsky Pond et al. (2020) Bioinformatics
- **Datamonkey**: Weaver et al. (2018) Mol Biol Evol

### Additional Resources
- **Datamonkey website**: https://datamonkey.org
- **HyPhy software**: https://hyphy.org
- **Documentation**: https://help.datamonkey.org
- **Support forum**: [Google Groups link]

---

*This documentation is for difFUBAR beta version. Features and interfaces may change in future releases.*