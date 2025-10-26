export interface IEmblem {
    emblemId: string;
    name: string;
    description?: string;
    image?: string;
    code?: string;
    status: "AVAILABLE" | "UNAVAILABLE";
    createdAt?: Date;
    updatedAt?: Date;
}