import { getBungieConfig } from '../utils/environment';

const config = getBungieConfig();

export const bungieConfig = {
    ...config,

    // URLs Bungie (constantes)
    baseUrl: 'https://www.bungie.net/Platform',
    authUrl: 'https://www.bungie.net/en/OAuth/Authorize',
    tokenUrl: 'https://www.bungie.net/Platform/App/OAuth/Token/',

    // Scopes requis
    scope: 'ReadBasicUserProfile'
};