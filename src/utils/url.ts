/**
 * Returns true, if the url is an absolute or relative url with an extension
 */
function isUrlWithExtension(url: string) {
  const pathname = url.includes('http') ? new URL(url).pathname : url;
  return !!pathname.match(/\.\w{3,4}$/);
}

/**
 * Add trailing slash when url is not an extension or contains a query string
 *
 * @example:
 * ```ts
 * addTrailingSlash('https://example.com') // => 'https://example.com/'
 * ```
 */
function addTrailingSlash(url: string) {
  const hasExtension = isUrlWithExtension(url);
  return hasExtension || !!url.match(/([?]+)|(\/$)/) ? url : `${url}/`;
}

/**
 * Format image url with base url
 */
function formatImageUrl(baseUrl: string, imageUrl: string) {
  const _url = addTrailingSlash(baseUrl);
  return imageUrl.startsWith(_url) ? imageUrl : `${_url}${imageUrl}`;
}

/**
 * Convert multiple segments of a path into a single path
 *
 * @example:
 * ```ts
 * const segments = ['a/', 'b', 'c'];
 * const path = segmentsToPath(segments) => 'a/b/c'
 * ```
 */
function segmentsToPath(segments: string[]): string {
  return segments.map((str) => str.replace(/^\/+|\/+$/g, '')).join('/');
}

/**
 * Convert an object into a query string
 * Filter out falsy values
 *
 * @example:
 * ```ts
 * const obj = {
 *   a: 1,
 *   b: 2,
 *   c: false,
 *   d: null,
 *   e: undefined,
 *   f: 0,
 *   g: ''
 * };
 *
 * objectToQueryString(obj) // => 'a=1&b=2&f=0'
 * ```
 */
function objectToQueryString(
  obj: Record<string, string | number | undefined | boolean>,
): string {
  const params = new URLSearchParams();
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (!(value || value === 0)) continue;
    params.set(key, value.toString());
  }
  return params.toString();
}

/**
 * Construct url with optional query string
 *
 * @example:
 * ```ts
 * const url = urlWithQueryString('https://example.com,' { a: 1, b: 2 }) // => 'https://example.com?a=1&b=2'
 * ```
 */
function urlWithQueryString(
  basePath: string,
  query: Record<string, string | number | undefined | boolean>,
) {
  const url = new URL(basePath);
  url.search = objectToQueryString(query);
  return url.href;
}

export const url = {
  isUrlWithExtension,
  addTrailingSlash,
  formatImageUrl,
  segmentsToPath,
  objectToQueryString,
  urlWithQueryString,
};
