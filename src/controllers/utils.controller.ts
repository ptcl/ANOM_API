import { Request, Response } from "express";
import { Agent } from "../models/agent.model";
import { formatForUser } from "../utils";

function getDefaultObjectFromSchema(schema: any): Record<string, any> {
    const defaults: Record<string, any> = {};

    for (const [key, path] of Object.entries(schema.paths)) {
        if (key.includes(".")) continue;
        if (["_id", "__v"].includes(key)) continue;

        const schemaType: any = (path as any).instance || "";
        const options = (path as any).options || {};

        if (options.default !== undefined) {
            defaults[key] =
                typeof options.default === "function"
                    ? options.default()
                    : options.default;
        } else if (schemaType === "Array" && options.type?.[0]?.schema) {
            defaults[key] = [
                getDefaultObjectFromSchema(options.type[0].schema),
            ];
        } else if (options.type?.schema) {
            defaults[key] = getDefaultObjectFromSchema(options.type.schema);
        } else if (schemaType === "Array") {
            defaults[key] = [];
        } else if (schemaType === "Object") {
            defaults[key] = {};
        } else {
            defaults[key] = null;
        }
    }

    return defaults;
}


function deepMergeMissing(target: any, source: any) {
    for (const key of Object.keys(source)) {
        if (target[key] === undefined || target[key] === null) {
            target[key] = source[key];
        } else if (
            typeof source[key] === "object" &&
            !Array.isArray(source[key]) &&
            source[key] !== null
        ) {
            deepMergeMissing(target[key], source[key]);
        }
    }
    return target;
}

export const syncAgentsDynamic = async (req: Request, res: Response) => {
    try {
        const roles = req.user?.protocol?.roles || [];
        if (!roles.includes("FOUNDER")) {
            return res.status(403).json({
                success: false,
                message: "Accès interdit - réservé aux Founders.",
            });
        }

        console.log("🧩 Génération dynamique du modèle Agent...");
        const defaultStructure = getDefaultObjectFromSchema(Agent.schema);
        console.log("✅ Structure générée automatiquement.");

        const agents = await Agent.find().lean();
        let updatedCount = 0;

        for (const agent of agents) {
            const merged = deepMergeMissing(agent, defaultStructure);

            if (JSON.stringify(agent) !== JSON.stringify(merged)) {
                await Agent.updateOne({ _id: agent._id }, { $set: merged });
                updatedCount++;
            }
        }

        console.log("🧩 Synchronisation dynamique terminée :", {
            updatedCount,
            timestamp: formatForUser(),
        });

        return res.status(200).json({
            success: true,
            message: `Synchronisation terminée - ${updatedCount} agents réparés.`,
            data: { updatedCount },
        });
    } catch (error: any) {
        console.error("❌ Erreur lors de la synchronisation dynamique:", error);
        return res.status(500).json({
            success: false,
            message: "Erreur serveur pendant la synchronisation",
            error: process.env.NODE_ENV === "development" ? error.message : undefined,
        });
    }
};
