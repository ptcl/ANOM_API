import { Request, Response } from 'express';
import { getSettings } from '../models/settings.model';
import { Agent } from '../models/agent.model';

export const getAllThemes = async (req: Request, res: Response) => {
    try {
        const settings = await getSettings();

        let activeThemeId = 'protocol';
        if (req.user?.agentId) {
            const agent = await Agent.findById(req.user.agentId).select('protocol.settings.activeTheme').lean();
            activeThemeId = (agent?.protocol?.settings as any)?.activeTheme || 'protocol';
        }

        const themes = settings.themes.map(theme => ({
            themeId: theme.themeId,
            name: theme.name,
            description: theme.description,
            primary: theme.primary,
            secondary: theme.secondary,
            accent: theme.accent,
            isDefault: theme.isDefault,
            isActive: theme.themeId === activeThemeId
        }));

        return res.json({
            success: true,
            data: themes,
            count: themes.length
        });
    } catch (error: any) {
        return res.status(500).json({
            success: false,
            error: 'Failed to fetch themes'
        });
    }
};
