/**
 * TypeScript type definitions for jupyterlab-code-loader.
 */

export interface IRegistry {
  version: string;
  generated_at: string;
  repo_url: string;
  domains: IDomainSummary[];
}

export interface IDomainSummary {
  id: string;
  name: string;
  description: string;
  tags: string[];
  locales: string[];
  notebook_count: number;
  script_count: number;
  snippet_count: number;
  last_updated: string;
}

export interface ICodeItem {
  file: string;
  title: string;
  description: string;
  type: 'notebook' | 'script';
  code_lang: 'python' | 'r' | 'julia';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  estimated_time?: string;
  tags: string[];
  kernel?: string;
  i18n?: Record<string, { title?: string; description?: string }>;
  // Server-injected i18n metadata
  _content_lang: string;
  _is_translated: boolean;
  _resolved_locale: string;
  _file_translated: boolean;
  _tags_display: {
    content_lang: string;
    code_lang: string;
  };
}

export interface ISnippet {
  id: string;
  title: string;
  description?: string;
  code_lang: 'python' | 'r' | 'julia';
  lang: string;
  tags: string[];
  code: string;
  imports: string[];
}

export interface ISnippetFile {
  id: string;
  title: string;
  lang: string;
  snippets: ISnippet[];
  _resolved_locale: string;
  _is_translated: boolean;
  _display_title: string;
}

export interface ICodeListResponse {
  domain_id: string;
  locale: string;
  available_locales: string[];
  items: ICodeItem[];
}

export interface ISnippetListResponse {
  domain_id: string;
  locale: string;
  available_locales: string[];
  items: ISnippetFile[];
}

export interface IStatusResponse {
  last_sync: string | null;
  last_commit: string | null;
  cache_dir: string;
  repo_url: string;
  branch: string;
  cache_exists: boolean;
}

export interface IConfig {
  repo_url: string;
  branch: string;
  cache_dir: string;
  refresh_interval: number;
  workspace_dir: string;
  default_locale: string;
  has_token: boolean;
  is_configured: boolean;
}

export interface ISyncResult {
  action: string;
  commit?: string;
  synced_at?: string;
  error?: string;
}
