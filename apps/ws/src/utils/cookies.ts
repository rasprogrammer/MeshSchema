export function getCookies(cookieHeader: string | undefined): Record<string, string> {
  if (!cookieHeader) return {};
  return cookieHeader.split(';').reduce((acc: Record<string, string>, cookie) => {
    const [key, ...valueParts] = cookie.trim().split('=');
    if (key) acc[key] = valueParts.join('=');
    return acc;
  }, {});
}

export function getAccessToken(headers: any): string | undefined {
  return getCookies(headers.cookie)['access_token'];
}
