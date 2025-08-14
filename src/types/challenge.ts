
export interface ValidationResult {
    isValid: boolean;
    message?: string;
}

export interface ICodeFragment {
    A1: string;
    A2: string;
    A3: string;
}

export interface IBCodeFragment {
    B1: string;
    B2: string;
    B3: string;
}

export interface ICCodeFragment {
    C1: string;
    C2: string;
    C3: string;
}

export interface IFinalCode {
    AAA: ICodeFragment;
    BBB: IBCodeFragment;
    CCC: ICCodeFragment;
}

export interface IChallengeGroup {
    accessCode: string;
    promptLines: string[];
}

export interface IChallenge {
    title: any;
    fragmentId: string[];
    challengeType: string;
    groups: IChallengeGroup[];
    expectedOutput: string;
    hintLines: string[];
    rewardId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface IAgentProgress {
    agentId: string;
    bungieId?: string;
    displayName?: string;
    unlockedFragments: string[];
    currentProgress?: string;
    complete?: boolean;
    lastUpdated?: Date;
}

export interface IEmblemChallenge {
    challengeId: string;
    title: string;
    description?: string | null;
    targetCode: string;
    codeFormat?: string;
    isSharedChallenge?: boolean;
    finalCode?: IFinalCode;
    challenges: IChallenge[];
    isComplete?: boolean;
    isCompleteBy?: string | null;
    isActive?: boolean;
    AgentProgress: IAgentProgress[];
    createdAt?: Date;
    updatedAt?: Date;
}
