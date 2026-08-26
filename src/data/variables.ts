/**
 * Variables Configuration
 * =======================
 * 
 * CENTRAL PLACE TO DEFINE ALL SHARED VARIABLES
 * 
 * This file defines all variables that can be shared across sections.
 * AI agents should read this file to understand what variables are available.
 * 
 * USAGE:
 * 1. Define variables here with their default values and metadata
 * 2. Use them in any section with: const x = useVar('variableName', defaultValue)
 * 3. Update them with: setVar('variableName', newValue)
 */

import { type VarValue } from '@/stores';

/**
 * Variable definition with metadata
 */
export interface VariableDefinition {
    /** Default value */
    defaultValue: VarValue;
    /** Human-readable label */
    label?: string;
    /** Description for AI agents */
    description?: string;
    /** Variable type hint */
    type?: 'number' | 'text' | 'boolean' | 'select' | 'array' | 'object' | 'spotColor' | 'linkedHighlight';
    /** Unit (e.g., 'Hz', '°', 'm/s') - for numbers */
    unit?: string;
    /** Minimum value (for number sliders) */
    min?: number;
    /** Maximum value (for number sliders) */
    max?: number;
    /** Step increment (for number sliders) */
    step?: number;
    /** Display color for InlineScrubbleNumber / InlineSpotColor (e.g. '#D81B60') */
    color?: string;
    /** Options for 'select' type variables */
    options?: string[];
    /** Placeholder text for text inputs */
    placeholder?: string;
    /**
     * Correct answer for cloze input validation.
     * Accepts a single string, pipe-separated alternates (e.g. "first | 1 | 1st"),
     * or an array of accepted answers (e.g. ["first", "1", "1st"]).
     */
    correctAnswer?: string | string[];
    /** Whether cloze matching is case sensitive */
    caseSensitive?: boolean;
    /** Background color for inline components */
    bgColor?: string;
    /** Schema hint for object types (for AI agents) */
    schema?: string;
}

/**
 * =====================================================
 * 🎯 DEFINE YOUR VARIABLES HERE
 * =====================================================
 * 
 * SUPPORTED TYPES:
 * 
 * 1. NUMBER (slider):
 *    { defaultValue: 5, type: 'number', min: 0, max: 10, step: 1 }
 * 
 * 2. TEXT (free text):
 *    { defaultValue: 'Hello', type: 'text', placeholder: 'Enter text...' }
 * 
 * 3. SELECT (dropdown):
 *    { defaultValue: 'sine', type: 'select', options: ['sine', 'cosine', 'tangent'] }
 * 
 * 4. BOOLEAN (toggle):
 *    { defaultValue: true, type: 'boolean' }
 * 
 * 5. ARRAY (list of numbers):
 *    { defaultValue: [1, 2, 3], type: 'array' }
 * 
 * 6. OBJECT (complex data):
 *    { defaultValue: { x: 5, y: 10 }, type: 'object', schema: '{ x: number, y: number }' }
 */
export const variableDefinitions: Record<string, VariableDefinition> = {
    // ══════════════════════════════════════════════════════════════
    // SECTION 2 — Why two arcs find the exact middle
    // ══════════════════════════════════════════════════════════════
    bisectorPointX: {
        defaultValue: 246,
        type: 'number',
        label: 'Point P — x',
        description: 'Horizontal position of the draggable equidistant point P',
        min: 30,
        max: 630,
        step: 1,
        color: '#62D0AD',
    },
    bisectorPointY: {
        defaultValue: 138,
        type: 'number',
        label: 'Point P — y',
        description: 'Vertical position of the draggable equidistant point P',
        min: 30,
        max: 370,
        step: 1,
        color: '#62D0AD',
    },
    bisectorMarks: {
        defaultValue: 0,
        type: 'number',
        label: 'Equidistant marks found',
        description: 'How many equidistant spots the student has discovered',
        min: 0,
        max: 40,
        step: 1,
        color: '#62D0AD',
    },
    bisectorHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Bisector figure highlight',
        description: 'Which circle is highlighted in the equal-distance figure',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.22)',
    },
    answerBisectorLocus: {
        defaultValue: '',
        type: 'select',
        label: 'Tilted line through the midpoint',
        description: 'Student answer comparing a tilted line through M with the perpendicular bisector',
        placeholder: '???',
        correctAnswer: 'a bisector but not perpendicular',
        options: [
            'the same line drawn differently',
            'a bisector but not perpendicular',
            'perpendicular but not a bisector',
            'neither of the two',
        ],
        color: '#8E90F5',
    },
    // ══════════════════════════════════════════════════════════════
    // SECTION 3 — Perpendiculars
    // ══════════════════════════════════════════════════════════════
    perpPointX: {
        defaultValue: 300,
        type: 'number',
        label: 'Point P — x',
        description: 'Horizontal position of the draggable point P in the perpendicular figure',
        min: 150,
        max: 510,
        step: 1,
        color: '#62D0AD',
    },
    perpPointY: {
        defaultValue: 152,
        type: 'number',
        label: 'Point P — y',
        description: 'Vertical position of the draggable point P in the perpendicular figure',
        min: 60,
        max: 340,
        step: 1,
        color: '#62D0AD',
    },
    perpRadius: {
        defaultValue: 130,
        type: 'number',
        label: 'Compass width',
        description: 'Compass width used to cut the line at X and Y',
        min: 78,
        max: 195,
        step: 13,
        color: '#AC8BF9',
    },
    perpHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Perpendicular figure highlight',
        description: 'Which element of the perpendicular figure is highlighted',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.22)',
    },
    answerPerpArcs: {
        defaultValue: '',
        type: 'select',
        label: 'Rubbed-out arcs',
        description: 'Student answer about erasing construction arcs',
        placeholder: '???',
        correctAnswer: 'incomplete, because the arcs are the working',
        options: [
            'correct, because the line is in the right place',
            'incomplete, because the arcs are the working',
            'correct, because arcs are only rough guides',
        ],
        color: '#8E90F5',
    },
    answerPerpShortest: {
        defaultValue: '',
        type: 'select',
        label: 'Shortest distance to a line',
        description: 'Student answer about the shortest segment from a point to a line',
        placeholder: '???',
        correctAnswer: 'the perpendicular, 5 cm long',
        options: [
            'the perpendicular, 5 cm long',
            'a slanted segment, shorter than 5 cm',
            'they are all exactly 5 cm',
        ],
        color: '#8E90F5',
    },

    // ══════════════════════════════════════════════════════════════
    // SECTION 4 — Angle bisector, copied angle, parallel line
    // ══════════════════════════════════════════════════════════════
    bisectAngle: {
        defaultValue: 68,
        type: 'number',
        label: 'Angle at V',
        description: 'The angle being bisected, in degrees',
        unit: '°',
        min: 20,
        max: 140,
        step: 1,
        color: '#62D0AD',
    },
    bisectRadius: {
        defaultValue: 130,
        type: 'number',
        label: 'First arc width',
        description: 'Compass width of the first arc drawn from the vertex V',
        min: 78,
        max: 169,
        step: 13,
        color: '#AC8BF9',
    },
    bisectHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Angle bisector figure highlight',
        description: 'Which element of the angle bisector figure is highlighted',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.22)',
    },
    parallelAngle: {
        defaultValue: 34,
        type: 'number',
        label: 'Angle at P',
        description: 'Angle between the transversal and the rotatable line through P',
        unit: '°',
        min: 8,
        max: 70,
        step: 1,
        color: '#8E90F5',
    },
    answerAngleQuarter: {
        defaultValue: '',
        type: 'select',
        label: 'Quarter of 138 degrees',
        description: 'Student answer for bisecting 138 degrees twice',
        placeholder: '???',
        correctAnswer: '34.5',
        options: ['34.5', '69', '27.6', '46'],
        color: '#8E90F5',
    },
    answerAngleCongruence: {
        defaultValue: '',
        type: 'select',
        label: 'Congruence reason',
        description: 'Student answer for why the bisector triangles are congruent',
        placeholder: '???',
        correctAnswer: 'SSS, because all three sides match',
        options: [
            'SSS, because all three sides match',
            'SAS, because the angle at V is shared',
            'ASA, because two angles are equal',
        ],
        color: '#8E90F5',
    },

    // ══════════════════════════════════════════════════════════════
    // SECTION 5 — Standard angles from one compass width
    // ══════════════════════════════════════════════════════════════
    dialAngle: {
        defaultValue: 68,
        type: 'number',
        label: 'Angle on the dial',
        description: 'Angle of the swinging arm on the constructible-angle dial',
        unit: '°',
        min: 0,
        max: 180,
        step: 1,
        color: '#62D0AD',
    },
    dialRadius: {
        defaultValue: 130,
        type: 'number',
        label: 'Compass width',
        description: 'Radius of the dial circle, to show the angles do not depend on it',
        min: 104,
        max: 156,
        step: 13,
        color: '#AC8BF9',
    },
    dialHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Angle dial highlight',
        description: 'Which element of the angle dial is highlighted',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.22)',
    },
    answerDialWidth: {
        defaultValue: '',
        type: 'select',
        label: 'Nudged compass width',
        description: 'Student answer about changing the compass width mid-construction',
        placeholder: '???',
        correctAnswer: 'not 60 degrees, because the triangle is no longer equilateral',
        options: [
            'still 60 degrees, since the width does not matter',
            'not 60 degrees, because the triangle is no longer equilateral',
            'exactly 30 degrees instead',
        ],
        color: '#8E90F5',
    },
    answerDialImpossible: {
        defaultValue: '',
        type: 'select',
        label: 'Angle that cannot be built',
        description: 'Student answer for which listed angle is not constructible here',
        placeholder: '???',
        correctAnswer: '20°',
        options: ['15°', '20°', '45°', '135°'],
        color: '#8E90F5',
    },

    // ══════════════════════════════════════════════════════════════
    // SECTION 6 — Tangents to a circle
    // ══════════════════════════════════════════════════════════════
    tangentPointX: {
        defaultValue: 508,
        type: 'number',
        label: 'External point P — x',
        description: 'Horizontal position of the draggable point P outside the circle',
        min: 40,
        max: 620,
        step: 1,
        color: '#62D0AD',
    },
    tangentPointY: {
        defaultValue: 316,
        type: 'number',
        label: 'External point P — y',
        description: 'Vertical position of the draggable point P outside the circle',
        min: 56,
        max: 374,
        step: 1,
        color: '#62D0AD',
    },
    tangentRadius: {
        defaultValue: 91,
        type: 'number',
        label: 'Circle radius',
        description: 'Radius of the circle the tangents are drawn to',
        min: 65,
        max: 130,
        step: 13,
        color: '#AC8BF9',
    },
    tangentHighlight: {
        defaultValue: '',
        type: 'linkedHighlight',
        label: 'Tangent figure highlight',
        description: 'Which element of the tangent figure is highlighted',
        color: '#AC8BF9',
        bgColor: 'rgba(172, 139, 249, 0.22)',
    },
    answerTangentAngle: {
        defaultValue: '',
        type: 'select',
        label: 'Tangent and radius angle',
        description: 'Student answer for the angle between a tangent and the radius at the touch point',
        placeholder: '???',
        correctAnswer: '90°',
        options: ['45°', '60°', '90°', 'it depends on the radius'],
        color: '#8E90F5',
    },
    answerTangentLength: {
        defaultValue: '',
        type: 'select',
        label: 'Tangent length',
        description: 'Student answer for the tangent length from a point 13 cm from the centre',
        placeholder: '???',
        correctAnswer: '12',
        options: ['8', '12', '13', '18'],
        color: '#8E90F5',
    },

    // ══════════════════════════════════════════════════════════════
    // SECTION 7 — Constructing triangles
    // ══════════════════════════════════════════════════════════════
    triangleCase: {
        defaultValue: 'three sides',
        type: 'select',
        label: 'Triangle case',
        description: 'Which set of given facts the triangle is built from',
        options: ['three sides', 'two sides and the angle between', 'one side and two angles'],
        color: '#8E90F5',
        bgColor: 'rgba(142, 144, 245, 0.18)',
    },
    triangleSideAC: {
        defaultValue: 182,
        type: 'number',
        label: 'Side AC',
        description: 'Required length of side AC',
        min: 104,
        max: 234,
        step: 13,
        color: '#AC8BF9',
    },
    triangleSideBC: {
        defaultValue: 156,
        type: 'number',
        label: 'Side BC',
        description: 'Required length of side BC',
        min: 104,
        max: 234,
        step: 13,
        color: '#AC8BF9',
    },
    triangleAngleA: {
        defaultValue: 50,
        type: 'number',
        label: 'Angle at A',
        description: 'Required interior angle at vertex A',
        unit: '°',
        min: 25,
        max: 105,
        step: 5,
        color: '#AC8BF9',
    },
    triangleAngleB: {
        defaultValue: 40,
        type: 'number',
        label: 'Angle at B',
        description: 'Required interior angle at vertex B',
        unit: '°',
        min: 25,
        max: 105,
        step: 5,
        color: '#AC8BF9',
    },
    triangleVertexX: {
        defaultValue: 306,
        type: 'number',
        label: 'Vertex C — x',
        description: 'Horizontal position of the draggable third vertex',
        min: 50,
        max: 610,
        step: 1,
        color: '#62D0AD',
    },
    triangleVertexY: {
        defaultValue: 174,
        type: 'number',
        label: 'Vertex C — y',
        description: 'Vertical position of the draggable third vertex',
        min: 56,
        max: 300,
        step: 1,
        color: '#62D0AD',
    },
    answerTriangleImpossible: {
        defaultValue: '',
        type: 'select',
        label: 'Impossible triangle',
        description: 'Student answer about sides 3, 4 and 9 centimetres',
        placeholder: '???',
        correctAnswer: 'never meet, so no such triangle exists',
        options: [
            'cross at two points as usual',
            'never meet, so no such triangle exists',
            'touch at exactly one point',
        ],
        color: '#8E90F5',
    },
    answerTriangleThirdAngle: {
        defaultValue: '',
        type: 'select',
        label: 'Third angle',
        description: 'Student answer for the remaining angle in the ASA case',
        placeholder: '???',
        correctAnswer: '45°',
        options: ['35°', '45°', '55°', '135°'],
        color: '#8E90F5',
    },

    answerBisectorRadius: {
        defaultValue: '',
        type: 'select',
        label: 'Smallest usable compass width',
        description: 'Student answer for the smallest whole-number compass width on an 8 cm segment',
        placeholder: '???',
        correctAnswer: '5',
        options: ['3', '4', '5', '8'],
        color: '#8E90F5',
    },
};

/**
 * Get all variable names (for AI agents to discover)
 */
export const getVariableNames = (): string[] => {
    return Object.keys(variableDefinitions);
};

/**
 * Get a variable's default value
 */
export const getDefaultValue = (name: string): VarValue => {
    return variableDefinitions[name]?.defaultValue ?? 0;
};

/**
 * Get a variable's metadata
 */
export const getVariableInfo = (name: string): VariableDefinition | undefined => {
    return variableDefinitions[name];
};

/**
 * Get all default values as a record (for initialization)
 */
export const getDefaultValues = (): Record<string, VarValue> => {
    const defaults: Record<string, VarValue> = {};
    for (const [name, def] of Object.entries(variableDefinitions)) {
        defaults[name] = def.defaultValue;
    }
    return defaults;
};

/**
 * Get number props for InlineScrubbleNumber from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
export function numberPropsFromDefinition(def: VariableDefinition | undefined): {
    defaultValue?: number;
    min?: number;
    max?: number;
    step?: number;
    color?: string;
} {
    if (!def || def.type !== 'number') return {};
    return {
        defaultValue: def.defaultValue as number,
        min: def.min,
        max: def.max,
        step: def.step,
        ...(def.color ? { color: def.color } : {}),
    };
}

/**
 * Get cloze input props for InlineClozeInput from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx, or getExampleVariableInfo(name) in exampleBlocks.tsx.
 */
/**
 * Get cloze choice props for InlineClozeChoice from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function choicePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Get toggle props for InlineToggle from a variable definition.
 * Use with getVariableInfo(name) in blocks.tsx.
 */
export function togglePropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    if (!def || def.type !== 'select') return {};
    return {
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

export function clozePropsFromDefinition(def: VariableDefinition | undefined): {
    placeholder?: string;
    color?: string;
    bgColor?: string;
    caseSensitive?: boolean;
} {
    if (!def || def.type !== 'text') return {};
    return {
        ...(def.placeholder ? { placeholder: def.placeholder } : {}),
        ...(def.color ? { color: def.color } : {}),
        ...(def.bgColor ? { bgColor: def.bgColor } : {}),
        ...(def.caseSensitive !== undefined ? { caseSensitive: def.caseSensitive } : {}),
    };
}

/**
 * Get spot-color props for InlineSpotColor from a variable definition.
 * Extracts the `color` field.
 *
 * @example
 * <InlineSpotColor
 *     varName="radius"
 *     {...spotColorPropsFromDefinition(getVariableInfo('radius'))}
 * >
 *     radius
 * </InlineSpotColor>
 */
export function spotColorPropsFromDefinition(def: VariableDefinition | undefined): {
    color: string;
} {
    return {
        color: def?.color ?? '#8B5CF6',
    };
}

/**
 * Get linked-highlight props for InlineLinkedHighlight from a variable definition.
 * Extracts the `color` and `bgColor` fields.
 *
 * @example
 * <InlineLinkedHighlight
 *     varName="activeHighlight"
 *     highlightId="radius"
 *     {...linkedHighlightPropsFromDefinition(getVariableInfo('activeHighlight'))}
 * >
 *     radius
 * </InlineLinkedHighlight>
 */
export function linkedHighlightPropsFromDefinition(def: VariableDefinition | undefined): {
    color?: string;
    bgColor?: string;
} {
    return {
        ...(def?.color ? { color: def.color } : {}),
        ...(def?.bgColor ? { bgColor: def.bgColor } : {}),
    };
}

/**
 * Build the `variables` prop for FormulaBlock from variable definitions.
 *
 * Takes an array of variable names and returns the config map expected by
 * `<FormulaBlock variables={...} />`.
 *
 * @example
 * import { scrubVarsFromDefinitions } from './variables';
 *
 * <FormulaBlock
 *     latex="\scrub{mass} \times \scrub{accel}"
 *     variables={scrubVarsFromDefinitions(['mass', 'accel'])}
 * />
 */
export function scrubVarsFromDefinitions(
    varNames: string[],
): Record<string, { min?: number; max?: number; step?: number; color?: string }> {
    const result: Record<string, { min?: number; max?: number; step?: number; color?: string }> = {};
    for (const name of varNames) {
        const def = variableDefinitions[name];
        if (!def) continue;
        result[name] = {
            ...(def.min !== undefined ? { min: def.min } : {}),
            ...(def.max !== undefined ? { max: def.max } : {}),
            ...(def.step !== undefined ? { step: def.step } : {}),
            ...(def.color ? { color: def.color } : {}),
        };
    }
    return result;
}
