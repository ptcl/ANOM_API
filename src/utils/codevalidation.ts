import { IFinalCode, ValidationResult } from "../types/challenge";

export const validateTargetCode = (code: string): ValidationResult => {
    if (!code || typeof code !== 'string') {
        return {
            isValid: false,
            message: "Le code ne peut pas être vide."
        };
    }

    const codePattern = /^[A-Z]{3}-[A-Z]{3}-[A-Z]{3}$/;

    if (!codePattern.test(code)) {
        return {
            isValid: false,
            message: "Le targetCode doit être au format AAA-BBB-CCC (lettres majuscules uniquement avec tirets)."
        };
    }

    return {
        isValid: true
    };
};

export const splitTargetCodeToFinalCode = (targetCode: string): IFinalCode => {
    const validation = validateTargetCode(targetCode);
    if (!validation.isValid) {
        throw new Error(`Code invalide: ${validation.message}`);
    }

    const segments = targetCode.split('-');
    const [aaa, bbb, ccc] = segments;

    return {
        AAA: {
            A1: aaa[0], // Premier caractère de AAA
            A2: aaa[1], // Deuxième caractère de AAA
            A3: aaa[2]  // Troisième caractère de AAA
        },
        BBB: {
            B1: bbb[0], // Premier caractère de BBB
            B2: bbb[1], // Deuxième caractère de BBB
            B3: bbb[2]  // Troisième caractère de BBB
        },
        CCC: {
            C1: ccc[0], // Premier caractère de CCC
            C2: ccc[1], // Deuxième caractère de CCC
            C3: ccc[2]  // Troisième caractère de CCC
        }
    };
};

export const buildTargetCodeFromFinalCode = (finalCode: IFinalCode): string => {
    const aaa = finalCode.AAA.A1 + finalCode.AAA.A2 + finalCode.AAA.A3;
    const bbb = finalCode.BBB.B1 + finalCode.BBB.B2 + finalCode.BBB.B3;
    const ccc = finalCode.CCC.C1 + finalCode.CCC.C2 + finalCode.CCC.C3;

    return `${aaa}-${bbb}-${ccc}`;
};

export const validateCodeFormat = (format: string): ValidationResult => {
    if (!format || typeof format !== 'string') {
        return {
            isValid: false,
            message: "Le format ne peut pas être vide."
        };
    }

    const formatPattern = /^[A-Z]{3}-[A-Z]{3}-[A-Z]{3}$/;

    if (!formatPattern.test(format)) {
        return {
            isValid: false,
            message: "Le codeFormat doit être au format XXX-XXX-XXX."
        };
    }

    return {
        isValid: true
    };
};

export const validateAccessCode = (accessCode: string): ValidationResult => {
    if (!accessCode || typeof accessCode !== 'string') {
        return {
            isValid: false,
            message: "Le code d'accès ne peut pas être vide."
        };
    }
    const accessCodePattern = /^[A-Za-z0-9_-]{3,20}$/;

    if (!accessCodePattern.test(accessCode)) {
        return {
            isValid: false,
            message: "Le code d'accès doit contenir entre 3 et 20 caractères (lettres, chiffres, tirets et underscores autorisés)."
        };
    }

    return {
        isValid: true
    };
};

export const generateRandomCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const getRandomChars = (length: number): string => {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    return `${getRandomChars(3)}-${getRandomChars(3)}-${getRandomChars(3)}`;
};

export const codeMatchesFormat = (code: string, format: string): boolean => {
    if (!code || !format) return false;
    return code.length === format.length &&
        code.split('-').length === format.split('-').length;
};