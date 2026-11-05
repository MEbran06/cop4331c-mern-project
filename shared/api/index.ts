export interface ApiResult<T> {
    ok: boolean;
    status: number;
    data: T | null;
    error?: string;
}

export interface ApiOptions {
    method?: string;
    body?: unknown;
}

export function createApi(config: {
    baseUrl: string,
    getToken: () => string | null | undefined,
    onUnauthorized: () => void,
}) {
    return async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<ApiResult<T>> {
        
        const session = config.getToken();
        
        const headers: Record<string, string> = {};
        if (options.body !== undefined) headers["Content-Type"] = "application/json";
        if (session) headers["Authorization"] = `Bearer ${session}`;

        try {    
            const response = await fetch(`${config.baseUrl}/${path}`, {
                method: options.method ?? "GET",
                headers,
                body: options.body === undefined ? undefined : JSON.stringify(options.body),
            });

            // 204 No Content (for example, after a delete) has no body to parse
            const text = await response.text();
            const data = text ? JSON.parse(text) : null;

            if (response.status === 401 && session) {
                // The saved token expired or was rejected: start over at the login page
                config.onUnauthorized();
            }

            return {
                ok: response.ok,
                status: response.status,
                data,
                error: response.ok ? undefined : data?.error ?? `Request failed (${response.status})`,
            };
        } catch {
            return {
                ok: false,
                status: 0,
                data: null,
                error: "Request failed: could not reach destination",
            };
        }
    };
}
export type ApiRequest = ReturnType<typeof createApi>;
