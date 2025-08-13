export interface IEmblem {
    emblemId: string;
    name: string;
    description?: string;
    image?: string;
    code?: string;
    status: "available" | "unavailable";
    createdAt?: Date;
    updatedAt?: Date;
}