const STORAGE_KEY = 'aulasis:institucionSlug';
const DEFAULT_SLUG = import.meta.env.VITE_TENANT_SLUG || 'general';

/**
 * Slug de la institución actual. No usamos subdominio (a diferencia de
 * KapiBook): se elige en un selector al registrarse/iniciar sesión (hoy solo
 * existe "general", pero esto ya funciona para N instituciones). Se guarda
 * en localStorage porque no es un dato sensible — a diferencia del token,
 * no importa que sea legible por scripts.
 */
export const getTenantSlug = () => localStorage.getItem(STORAGE_KEY) || DEFAULT_SLUG;

export const setTenantSlug = (slug) => localStorage.setItem(STORAGE_KEY, slug);
