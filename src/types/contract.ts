import { Types, Document } from 'mongoose';

export interface IEmblem {
    emblemId: string;
    name: string;
    code: string;
    status: 'AVAILABLE' | 'REDEEMED' | 'REVOKED' | 'REJECTED';
    redeemedBy?: Types.ObjectId | string;
    redeemedDate?: Date;
    rejectedAt?: Date;
    deletedAt?: Date;
}

export interface IRevocationRequest {
    requestDate: Date;
    effectiveDate?: Date;
    emblemCodes: string[];
    isPartial: boolean;
    status: 'PENDING' | 'PROCESSED' | 'CANCELLED';
}

export interface IContractMedia {
    url: string;
    legend?: string;
}

export interface IContributor {
    bungieId: string;
    displayName: string;
    isAnonymous: boolean;
}

export interface IContract {
    _id?: Types.ObjectId | string;
    contractId: string;
    contractDate: Date;
    status: 'PENDING' | 'VALIDATED' | 'CANCELLED' | 'REVOKED' | 'PARTIAL';
    validationDeadline?: Date;
    validationPeriod?: 7 | 14;
    isExpired: boolean;
    contributors: IContributor[];
    emblems: IEmblem[];
    totalCodes: number;
    availableCodes: number;
    revocationRequests: IRevocationRequest[];
    media: IContractMedia[];
    signedDocumentPath?: string;
    isSigned: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

export interface IContractDocument extends Omit<IContract, '_id'>, Document { }

