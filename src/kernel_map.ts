/**
 * Map kernel names (as reported by Jupyter) to normalized code_lang values.
 * Returns null if the kernel doesn't map to a known language (show all).
 */

const KERNEL_PATTERNS: Array<[RegExp, string]> = [
  // Python kernels
  [/^python\d?$/i, 'python'],
  [/^conda.*python/i, 'python'],
  [/^ipykernel/i, 'python'],
  [/^xpython/i, 'python'],
  [/^pypy/i, 'python'],

  // R kernels
  [/^ir$/i, 'r'],
  [/^r$/i, 'r'],
  [/^r\d/i, 'r'],

  // Julia kernels
  [/^julia/i, 'julia']
];

export function kernelToCodeLang(kernelName: string | null): string | null {
  if (!kernelName) {
    return null;
  }
  for (const [pattern, lang] of KERNEL_PATTERNS) {
    if (pattern.test(kernelName)) {
      return lang;
    }
  }
  return null; // Unknown kernel -> show all
}

/**
 * Get a display label for a code language.
 */
export function codeLangLabel(codeLang: string | null): string {
  switch (codeLang) {
    case 'python':
      return 'Python';
    case 'r':
      return 'R';
    case 'julia':
      return 'Julia';
    default:
      return 'All';
  }
}

/**
 * Get a CSS class suffix for a code language.
 */
export function codeLangClass(codeLang: string | null): string {
  switch (codeLang) {
    case 'python':
      return 'python';
    case 'r':
      return 'r';
    case 'julia':
      return 'julia';
    default:
      return 'all';
  }
}
