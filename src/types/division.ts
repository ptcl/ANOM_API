export interface IDivision {
    divisionId: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    leaderId?: string;
    isSystem: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export type DivisionRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface IDivisionRequest {
    requestId: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    requestedBy: string;
    requestedByName?: string;
    status: DivisionRequestStatus;
    reviewedBy?: string;
    reviewedAt?: Date;
    rejectionReason?: string;
    createdDivisionId?: string;
    createdAt?: Date;
    updatedAt?: Date;
}
