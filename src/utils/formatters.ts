import {IAgentDocument } from "../types/agent";

export const formatAgentResponse = (agent: IAgentDocument, includeDestiny = false) => {
    const response: any = {
        _id: agent._id,
        protocol: {
            agentName: agent.protocol.agentName,
            customName: agent.protocol.customName || undefined,
            species: agent.protocol.species,
            roles: agent.protocol.roles,
            clearanceLevel: agent.protocol.clearanceLevel || 1,
            hasSeenRecruitment: agent.protocol.hasSeenRecruitment || false,
            protocolJoinedAt: agent.protocol.protocolJoinedAt,
            group: agent.protocol.group,
            settings: agent.protocol.settings
        },
        createdAt: agent.createdAt,
        updatedAt: agent.updatedAt
    };

    if (includeDestiny) {
        response.destinyMemberships = agent.destinyMemberships || [];
        response.bungieUser = agent.bungieUser || {
            membershipId: parseInt(agent.bungieId),
            uniqueName: agent.protocol.agentName,
            displayName: agent.protocol.agentName,
            profilePicture: 0
        };
    }

    return response;
};