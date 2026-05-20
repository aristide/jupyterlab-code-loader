/**
 * Inline SVG strings used by the Data4Now code-loader UI.
 *
 * These are returned as innerHTML so DOM elements can adopt them without
 * pulling in a heavier icon library. Each icon assumes a 24x24 viewbox.
 */

export const Svg = {
  codeDownload:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M8.25 7 L5 12 L8.25 17"/><path d="M15.75 7 L19 12 L15.75 17"/><path d="M12 9 L12 13"/><path d="M10 12 L12 14 L14 12"/></svg>',
  link: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L11.7 5.78"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.77-1.77"/></svg>',
  branch:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="5" r="2"/><circle cx="6" cy="19" r="2"/><circle cx="18" cy="9" r="2"/><path d="M6 7v10"/><path d="M18 11a6 6 0 0 1-6 6h-1"/></svg>',
  key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="15" r="4"/><path d="M11 12l9-9"/><path d="M16 7l3 3"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>',
  eyeOff:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.7 10.7 0 0 1 12 19c-7 0-11-7-11-7a18.2 18.2 0 0 1 5.06-5.94"/><path d="M9.9 4.24A10.6 10.6 0 0 1 12 4c7 0 11 7 11 7a18.4 18.4 0 0 1-3.17 4.19"/><path d="M14.12 14.12a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
  check:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  alert:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 7v6"/><circle cx="12" cy="16.5" r="0.9" fill="currentColor" stroke="none"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></svg>',
  globe:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>',
  arrow:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  bolt: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 4 14 11 14 9 22 20 10 13 10 13 2"/></svg>',
  github:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 0 0-3.16 19.49c.5.1.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.46-1.17-1.12-1.48-1.12-1.48-.92-.63.07-.62.07-.62 1.02.07 1.55 1.05 1.55 1.05.9 1.55 2.37 1.1 2.95.84.09-.66.35-1.1.64-1.36-2.22-.25-4.56-1.11-4.56-4.95 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.55 9.55 0 0 1 5 0c1.9-1.29 2.74-1.02 2.74-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.69 0 3.85-2.34 4.7-4.57 4.95.36.31.68.92.68 1.85v2.75c0 .27.18.59.69.49A10 10 0 0 0 12 2z"/></svg>',
  gitlab:
    '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 21.4 8.4 10.3H3.7L2.2 14.6a.9.9 0 0 0 .33 1L12 21.4l9.47-5.8a.9.9 0 0 0 .33-1l-1.5-4.3h-4.7L12 21.4zM15.6 10.3 14.1 5.6a.5.5 0 0 0-.95 0L11.6 10.3h-3l-1.55-4.7a.5.5 0 0 0-.95 0L4.55 10.3H8.4l3.6 11.1 3.6-11.1h3.85L17.95 5.6a.5.5 0 0 0-.95 0l-1.55 4.7h.15z"/></svg>',
  refresh:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 4v5h-5"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.5"/><path d="M19 12a7 7 0 0 0-.13-1.4l2-1.55-2-3.46-2.36.95a7 7 0 0 0-2.42-1.4L13.7 2.5h-3.4l-.4 2.64a7 7 0 0 0-2.42 1.4l-2.36-.95-2 3.46 2 1.55A7 7 0 0 0 5 12a7 7 0 0 0 .13 1.4l-2 1.55 2 3.46 2.36-.95a7 7 0 0 0 2.42 1.4l.4 2.64h3.4l.4-2.64a7 7 0 0 0 2.42-1.4l2.36.95 2-3.46-2-1.55c.08-.46.13-.92.13-1.4z"/></svg>',
  paste:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/></svg>',
  notebook:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h11a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6z"/><path d="M9 7h6M9 11h6M9 15h4"/><path d="M6 3v18"/></svg>',
  script:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="2"/><path d="M3 20h18"/><path d="M7 9l3 3-3 3M12 15h5"/></svg>',
  terminal:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M5 8l4 4-4 4"/><path d="M12 18h7"/></svg>',
  document:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/></svg>',
  chevron:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 6 15 12 9 18"/></svg>',
  caret:
    '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="6 9 18 9 12 16"/></svg>',
  search:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.5-4.5"/></svg>',
  alertBox:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M12 8v5"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/></svg>',
  trash:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
  insert:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>'
};

/**
 * Detect a git host from a URL and return the matching key.
 */
export function providerForUrl(url: string): 'github' | 'gitlab' | 'git' {
  const u = (url || '').toLowerCase();
  if (/github\.com/.test(u)) {
    return 'github';
  }
  if (/gitlab/.test(u)) {
    return 'gitlab';
  }
  return 'git';
}

export function providerLabel(p: 'github' | 'gitlab' | 'git'): string {
  if (p === 'github') {
    return 'GitHub';
  }
  if (p === 'gitlab') {
    return 'GitLab';
  }
  return 'Git';
}

export function providerIcon(p: 'github' | 'gitlab' | 'git'): string {
  if (p === 'github') {
    return Svg.github;
  }
  if (p === 'gitlab') {
    return Svg.gitlab;
  }
  return Svg.link;
}

/**
 * Best-effort parse of an HTTPS or SSH git clone URL. Returns null if the
 * shape isn't recognizable so the form can surface an invalid hint.
 */
export interface IParsedRepo {
  provider: 'github' | 'gitlab' | 'git';
  owner: string;
  repo: string;
  scheme: 'https' | 'ssh';
}

export function parseRepoUrl(url: string): IParsedRepo | null {
  if (!url || !url.trim()) {
    return null;
  }
  const u = url.trim();

  let m = u.match(
    /^git@(github\.com|gitlab\.com|bitbucket\.org)[:/]([\w.-]+)\/([\w.-]+?)(\.git)?$/i
  );
  if (m) {
    return {
      provider: providerForUrl(m[1]),
      owner: m[2],
      repo: m[3].replace(/\.git$/, ''),
      scheme: 'ssh'
    };
  }

  m = u.match(/^https?:\/\/([^/]+)\/([\w.-]+)\/([\w.-]+?)(\.git)?(\/.*)?$/i);
  if (m) {
    return {
      provider: providerForUrl(m[1]),
      owner: m[2],
      repo: m[3].replace(/\.git$/, ''),
      scheme: 'https'
    };
  }
  return null;
}
