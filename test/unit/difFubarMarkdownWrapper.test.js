const assert = require('assert');
const { wrapWithMarkdown, wrapDifFubarStatus } = require('../../lib/difFubarMarkdownWrapper');

describe('difFUBAR Markdown Wrapper', () => {
  describe('wrapWithMarkdown', () => {
    it('should handle progress indicators', () => {
      const input = 'Progress: 50%';
      const expected = '**Progress:** 50%';
      assert.strictEqual(wrapWithMarkdown(input), expected);
    });

    it('should handle section headers', () => {
      const input = 'MCMC Sampling:';
      const expected = '## MCMC Sampling';
      assert.strictEqual(wrapWithMarkdown(input), expected);
    });

    it('should handle step indicators', () => {
      const input = 'Step 1: Initialize parameters';
      const expected = '### Step 1\nInitialize parameters';
      assert.strictEqual(wrapWithMarkdown(input), expected);
    });

    it('should emphasize error messages', () => {
      const input = 'Analysis failed with ERROR';
      const expected = '**Analysis failed with ERROR**';
      assert.strictEqual(wrapWithMarkdown(input), expected);
    });

    it('should emphasize completion messages', () => {
      const input = 'Analysis COMPLETE';
      const expected = '**Analysis COMPLETE**';
      assert.strictEqual(wrapWithMarkdown(input), expected);
    });

    it('should format numerical results', () => {
      const input = 'Sites analyzed: 500';
      const expected = '- **Sites analyzed:** `500`';
      assert.strictEqual(wrapWithMarkdown(input), expected);
    });

    it('should format time estimates', () => {
      const input = 'ETA: 5 minutes';
      const expected = '**ETA:** 5 minutes';
      assert.strictEqual(wrapWithMarkdown(input), expected);
    });

    it('should format parameter summaries', () => {
      const input = 'Grid points: 20';
      const expected = '- **Grid points:** `20`';
      assert.strictEqual(wrapWithMarkdown(input), expected);
    });

    it('should handle empty input', () => {
      assert.strictEqual(wrapWithMarkdown(''), '');
      assert.strictEqual(wrapWithMarkdown(null), '');
      assert.strictEqual(wrapWithMarkdown(undefined), '');
    });
  });

  describe('wrapDifFubarStatus', () => {
    it('should handle simple status messages', () => {
      const input = 'Progress: 25%';
      const expected = '**Progress:** 25%';
      assert.strictEqual(wrapDifFubarStatus(input), expected);
    });

    it('should handle multi-line complex messages', () => {
      const input = 'Initializing\nProgress: 10%\nStep 1: Loading data';
      const result = wrapDifFubarStatus(input);
      assert(result.includes('## Initializing'));
      assert(result.includes('**Progress:**'));
      assert(result.includes('### Step 1'));
    });

    it('should handle empty or null input gracefully', () => {
      assert.strictEqual(wrapDifFubarStatus(''), '');
      assert.strictEqual(wrapDifFubarStatus(null), '');
    });
  });
});