/**
 * Application configuration and API endpoint resolution.
 *
 * Reads VITE_BACKEND_URL (or VITE_API_URL) passed during the Vite build.
 * If provided (e.g. on Vercel deployment), normalizes it to ensure the `/api` prefix is present.
 * If not provided (e.g. local dev), defaults to `/api` which is forwarded to the FastAPI backend by Vite's proxy.
 */

const rawBackendUrl = (
  (import.meta.env.VITE_BACKEND_URL as string | undefined) ||
  (import.meta.env.VITE_API_URL as string | undefined) ||
  ''
).trim().replace(/\/+$/, '');

export const API_BASE_URL: string = rawBackendUrl
  ? (rawBackendUrl.endsWith('/api') ? rawBackendUrl : `${rawBackendUrl}/api`)
  : '/api';

