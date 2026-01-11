import { Schema, model, Document } from "mongoose";

const RoleAssignmentSchema = new Schema({
    bungieId: { type: String, required: true },
    roleId: { type: String, required: true },
    note: { type: String }
}, { _id: false });

const ThemeSchema = new Schema({
    themeId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    primary: { type: String, required: true },
    secondary: { type: String, required: true },
    accent: { type: String, required: true },
    isDefault: { type: Boolean, default: false },
    isSystem: { type: Boolean, default: true }
}, { _id: false });

export interface IRoleAssignment {
    bungieId: string;
    roleId: string;
    note?: string;
}

export interface ITheme {
    themeId: string;
    name: string;
    description?: string;
    primary: string;
    secondary: string;
    accent: string;
    isDefault?: boolean;
    isSystem?: boolean;
}

export interface ISettings extends Document {
    roleOrder: string[];
    roleAssignments: IRoleAssignment[];
    themes: ITheme[];
    createdAt: Date;
    updatedAt: Date;
}

const SettingsSchema = new Schema({
    roleOrder: { type: [String], default: ["FOUNDER", "ORACLE", "ECHO", "SPECTRE", "AGENT"], set: (v: string[]) => v.map(role => role.toUpperCase()) },
    roleAssignments: { type: [RoleAssignmentSchema], default: [] },
    themes: { type: [ThemeSchema], default: [] }
}, { timestamps: true });

export const Settings = model<ISettings>("Settings", SettingsSchema);

export async function getSettings(): Promise<ISettings> {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({});
    }
    return settings;
}

export async function getThemeById(themeId: string): Promise<ITheme | undefined> {
    const settings = await getSettings();
    return settings.themes.find(t => t.themeId === themeId.toUpperCase());
}

const SYSTEM_THEMES: ITheme[] = [
    { themeId: 'PROTOCOL', name: 'theme.protocol.name', description: 'theme.protocol.description', primary: '#F0F1FB', secondary: '#172064', accent: '#3A4BD1', isDefault: true, isSystem: true },
    { themeId: 'CLOVIS_BRAY', name: 'theme.clovisBray.name', description: 'theme.clovisBray.description', primary: '#FAE0DD', secondary: '#40100A', accent: '#BC2F1E', isDefault: false, isSystem: true },
    { themeId: 'VANGUARD', name: 'theme.vanguard.name', description: 'theme.vanguard.description', primary: '#FCF5F0', secondary: '#4F2D10', accent: '#C77028', isDefault: false, isSystem: true },
    { themeId: 'BLACK_ARMORY', name: 'theme.blackArmory.name', description: 'theme.blackArmory.description', primary: '#EA7E80', secondary: '#000000', accent: '#5C0F11', isDefault: false, isSystem: true },
    { themeId: 'OPULENCE', name: 'theme.opulence.name', description: 'theme.opulence.description', primary: '#F4F0FB', secondary: '#351764', accent: '#743AD1', isDefault: false, isSystem: true },
];

export async function seedSystemThemes(): Promise<void> {
    try {
        const settings = await getSettings();
        let created = 0;
        let updated = 0;

        for (const themeData of SYSTEM_THEMES) {
            const existingIndex = settings.themes.findIndex(t => t.themeId === themeData.themeId);

            if (existingIndex === -1) {
                settings.themes.push(themeData);
                created++;
            } else {
                const existing = settings.themes[existingIndex];
                const needsUpdate =
                    existing.name !== themeData.name ||
                    existing.description !== themeData.description ||
                    existing.primary !== themeData.primary ||
                    existing.secondary !== themeData.secondary ||
                    existing.accent !== themeData.accent;

                if (needsUpdate) {
                    settings.themes[existingIndex] = themeData;
                    updated++;
                }
            }
        }

        if (created > 0 || updated > 0) {
            await settings.save();
            console.log(`🎨 System themes: ${created} created, ${updated} updated`);
        } else {
            console.log('System themes already up to date');
        }
    } catch (error: any) {
        console.error('Error seeding system themes:', error.message);
        throw error;
    }
}
