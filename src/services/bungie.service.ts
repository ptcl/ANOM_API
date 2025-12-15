import axios, { AxiosInstance } from 'axios';
import { bungieConfig } from '../config/bungie';
import { BungieTokenResponse, BungieAPIResponse } from '../types/bungie';
import { IAgent } from '../types/agent';
import { logger } from '../utils';

class BungieService {
    private apiClient: AxiosInstance;

    constructor() {
        this.apiClient = axios.create({
            baseURL: bungieConfig.baseUrl,
            timeout: 15000,
            headers: {
                'X-API-Key': bungieConfig.apiKey,
                'Content-Type': 'application/json'
            }
        });

        this.apiClient.interceptors.request.use((config) => {
            logger.info(`Bungie API: ${config.method?.toUpperCase()} ${config.url}`);
            return config;
        });

        this.apiClient.interceptors.response.use(
            (response) => {
                logger.info(`Bungie API: ${response.status} - ${response.config.url}`);
                return response;
            },
            (error) => {
                logger.error(`Bungie API Error: ${error.response?.status} - ${error.config?.url}`);
                return Promise.reject(error);
            }
        );
    }

    generateAuthUrl(state: string): string {
        const params = new URLSearchParams({
            client_id: bungieConfig.clientId,
            response_type: 'code',
            state: state,
            redirect_uri: bungieConfig.redirectUri
        });

        const authUrl = `${bungieConfig.authUrl}?${params.toString()}`;
        logger.info('Generated Bungie auth URL:', authUrl);

        return authUrl;
    }

    async exchangeCodeForTokens(code: string): Promise<BungieTokenResponse> {
        try {
            logger.info('Exchanging authorization code for tokens...');

            const response = await axios.post(bungieConfig.tokenUrl,
                new URLSearchParams({
                    grant_type: 'authorization_code',
                    code: code,
                    client_id: bungieConfig.clientId,
                    client_secret: bungieConfig.clientSecret,
                    redirect_uri: bungieConfig.redirectUri
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-API-Key': bungieConfig.apiKey
                    }
                }
            );

            logger.info('Successfully obtained Bungie tokens');
            return response.data;
        } catch (error: any) {
            logger.error('Token exchange failed:', error.response?.data || error.message);
            throw new Error(`Failed to exchange code for tokens: ${error.response?.data?.error_description || error.message}`);
        }
    }

    async getCurrentUser(accessToken: string): Promise<IAgent> {
        try {
            logger.info('Fetching current user profile...');

            const response = await this.apiClient.get<BungieAPIResponse<any>>(
                '/User/GetCurrentBungieAccount/',
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (response.data.ErrorCode !== 1) {
                throw new Error(`Bungie API Error: ${response.data.ErrorStatus} - ${response.data.Message}`);
            }



            const rawData = response.data.Response;
            const bungieNetUser = rawData.bungieNetUser;
            const destinyMemberships = rawData.destinyMemberships || [];
            const agent: IAgent = {
                bungieId: bungieNetUser.membershipId,
                destinyMemberships: destinyMemberships,
                bungieUser: {
                    membershipId: parseInt(bungieNetUser.membershipId),
                    uniqueName: bungieNetUser.uniqueName || bungieNetUser.displayName,
                    displayName: bungieNetUser.displayName,
                    profilePicture: typeof bungieNetUser.profilePicture === 'number' ? bungieNetUser.profilePicture : 0,
                    about: bungieNetUser.about || '',
                    firstAccess: bungieNetUser.firstAccess || '',
                    lastAccess: bungieNetUser.lastAccess || '',
                    psnDisplayName: bungieNetUser.psnDisplayName || '',
                    showActivity: bungieNetUser.showActivity || false,
                    locale: bungieNetUser.locale || '',
                    localeInheritDefault: bungieNetUser.localeInheritDefault || false,
                    profilePicturePath: bungieNetUser.profilePicturePath || '',
                    profileThemeName: bungieNetUser.profileThemeName || '',
                    steamDisplayName: bungieNetUser.steamDisplayName || '',
                    twitchDisplayName: bungieNetUser.twitchDisplayName || '',
                    cachedBungieGlobalDisplayName: bungieNetUser.cachedBungieGlobalDisplayName || '',
                    cachedBungieGlobalDisplayNameCode: bungieNetUser.cachedBungieGlobalDisplayNameCode || 0
                },
                protocol: {
                    agentName: bungieNetUser.displayName,
                    species: 'HUMAN',
                    roles: ['AGENT'],
                    badges: [],
                    clearanceLevel: 1,
                    division: 'PROTOCOL',
                    history: [],
                    stats: {
                        completedTimelines: 0,
                        fragmentsCollected: 0,
                        lastFragmentUnlockedAt: undefined,
                        lastSyncAt: undefined
                    },
                    hasSeenRecruitment: false,
                    settings: {
                        notifications: true,
                        publicProfile: true
                    }
                },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            logger.info('Processed Agent Profile:');
            logger.info({ bungieId: agent.bungieId, agentName: agent.protocol.agentName, roles: agent.protocol.roles });

            logger.info(`Retrieved profile for: ${agent.protocol.agentName}`);
            return agent;
        } catch (error: any) {
            logger.error('Failed to get user profile:', error.response?.data || error.message);
            throw new Error(`Failed to get user profile: ${error.message}`);
        }
    }

    async refreshAccessToken(refreshToken: string): Promise<BungieTokenResponse> {
        try {
            logger.info('Refreshing access token...');

            const response = await axios.post(bungieConfig.tokenUrl,
                new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken,
                    client_id: bungieConfig.clientId,
                    client_secret: bungieConfig.clientSecret
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-API-Key': bungieConfig.apiKey
                    }
                }
            );

            logger.info('Successfully refreshed access token');
            return response.data;
        } catch (error: any) {
            logger.error('Token refresh failed:', error.response?.data || error.message);
            throw new Error(`Failed to refresh token: ${error.response?.data?.error_description || error.message}`);
        }
    }

    async validateToken(accessToken: string): Promise<boolean> {
        try {
            await this.getCurrentUser(accessToken);
            return true;
        } catch (error) {
            logger.error('Token validation failed');
            return false;
        }
    }

    async getDestinyProfile(accessToken: string, membershipType: string, membershipId: string, components?: string): Promise<any> {
        try {
            logger.info(`Fetching Destiny2 profile for membershipType: ${membershipType}, membershipId: ${membershipId}`);

            let url = `/Destiny2/${membershipType}/Profile/${membershipId}/`;
            if (components) {
                url += `?components=${components}`;
            }

            const response = await this.apiClient.get<BungieAPIResponse<any>>(
                url,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (response.data.ErrorCode !== 1) {
                throw new Error(`Bungie API Error: ${response.data.ErrorStatus} - ${response.data.Message}`);
            }

            logger.info(`Retrieved Destiny2 profile data for membershipId: ${membershipId}`);
            return response.data.Response;
        } catch (error: any) {
            logger.error('Failed to get Destiny profile:', error.response?.data || error.message);
            throw new Error(`Failed to get Destiny profile: ${error.message}`);
        }
    }
}

export const bungieService = new BungieService();