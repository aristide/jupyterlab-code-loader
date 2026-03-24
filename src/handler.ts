import { URLExt } from '@jupyterlab/coreutils';
import { ServerConnection } from '@jupyterlab/services';

let _currentLocale = 'en';

/**
 * Set the locale used for all API requests.
 */
export function setLocale(locale: string): void {
  _currentLocale = locale;
}

/**
 * Call the jupyterlab-code-loader REST API.
 *
 * @param endPoint - API endpoint (e.g., "registry", "domains/geo/code")
 * @param init - Fetch request init options
 * @param locale - Optional locale override
 * @returns The response body interpreted as JSON
 */
export async function requestAPI<T>(
  endPoint = '',
  init: RequestInit = {},
  locale?: string
): Promise<T> {
  const settings = ServerConnection.makeSettings();
  const effectiveLocale = locale || _currentLocale;

  // Append locale query parameter
  const sep = endPoint.includes('?') ? '&' : '?';
  const requestUrl = URLExt.join(
    settings.baseUrl,
    'api/examples',
    `${endPoint}${sep}locale=${effectiveLocale}`
  );

  let response: Response;
  try {
    response = await ServerConnection.makeRequest(requestUrl, init, settings);
  } catch (error) {
    throw new ServerConnection.NetworkError(error as TypeError);
  }

  let data: any = await response.text();

  if (data.length > 0) {
    try {
      data = JSON.parse(data);
    } catch (error) {
      console.log('Not a JSON response body.', response);
    }
  }

  if (!response.ok) {
    throw new ServerConnection.ResponseError(response, data.message || data);
  }

  return data;
}
