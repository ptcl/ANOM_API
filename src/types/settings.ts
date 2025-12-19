export interface IRoleAssignment {
    bungieId: string;
    roleId: string;
    note?: string;
}

export interface ISettings {
    roleOrder: string[];
    roleAssignments: IRoleAssignment[];
    createdAt?: Date;
    updatedAt?: Date;
}
