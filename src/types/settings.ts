import { Document } from 'mongoose';

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

export interface IThemeWithActive extends ITheme {
    isActive: boolean;
}

export interface ISettings extends Document {
    roleOrder: string[];
    roleAssignments: IRoleAssignment[];
    themes: ITheme[];
    createdAt: Date;
    updatedAt: Date;
}
