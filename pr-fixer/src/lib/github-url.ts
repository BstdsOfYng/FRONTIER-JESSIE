export interface ParsedGitHubRepo {
  owner: string;
  name: string;
}

export interface ParsedGitHubPR extends ParsedGitHubRepo {
  prNumber: number;
}

export type ParsedGitHubLink = ParsedGitHubRepo | ParsedGitHubPR;

/**
 * Parse a GitHub URL or shorthand into owner/name and optionally PR number.
 *
 * Supports:
 *   https://github.com/owner/repo
 *   https://github.com/owner/repo/pull/123
 *   github.com/owner/repo
 *   github.com/owner/repo/pull/123
 *   owner/repo
 *   owner/repo/pull/123
 *   https://github.com/owner/repo/pull/123/files
 *   https://github.com/owner/repo/pull/123/checks
 *   http://github.com/owner/repo
 */
export function parseGitHubLink(input: string): ParsedGitHubLink | null {
  const trimmed = input.trim().replace(/\/$/, "");

  const prPatterns = [
    /^https?:\/\/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/pull\/(\d+)(?:\/.*)?$/i,
    /^github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/pull\/(\d+)$/i,
    /^([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)\/pull\/(\d+)$/,
  ];

  for (const re of prPatterns) {
    const m = trimmed.match(re);
    if (m) {
      return {
        owner: m[1],
        name: m[2].replace(/\.git$/, ""),
        prNumber: parseInt(m[3], 10),
      };
    }
  }

  const repoPatterns = [
    /^https?:\/\/github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+?)(?:\/.*)?$/i,
    /^github\.com\/([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+?)$/i,
    /^([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/,
  ];

  for (const re of repoPatterns) {
    const m = trimmed.match(re);
    if (m) {
      return {
        owner: m[1],
        name: m[2].replace(/\.git$/, ""),
      };
    }
  }

  return null;
}

export function hasPRNumber(parsed: ParsedGitHubLink): parsed is ParsedGitHubPR {
  return "prNumber" in parsed;
}

export function toRepoConfig(parsed: ParsedGitHubLink): { owner: string; name: string } {
  return { owner: parsed.owner, name: parsed.name };
}
