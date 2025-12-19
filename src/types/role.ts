import { Document } from "mongoose";

export interface IRole {
    roleId: string;
    name: string;
    description?: string;
    color?: string;
    permissions: string[];
    isSystem: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IRoleDocument extends IRole, Document { }