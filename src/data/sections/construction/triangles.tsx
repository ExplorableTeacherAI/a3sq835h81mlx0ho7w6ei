import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineClozeChoice,
    InlineFeedback,
    InlineScrubbleNumber,
    InlineToggle,
    InlineTooltip,
    InteractionHintSequence,
    Table,
    TriggeredHintOverlay,
} from "@/components/atoms";
import { Figure, FigureSlider, FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { type Vec2 } from "@/lib/motion";
import {
    getVariableInfo,
    choicePropsFromDefinition,
    numberPropsFromDefinition,
    scrubVarsFromDefinitions,
    togglePropsFromDefinition,
} from "../../variables";
import {
    ACCENT,
    ACCENT_TWO,
    ARC,
    Dot,
    Handle,
    HandleShadow,
    INK,
    INK_STRUCTURE,
    WARN,
    add,
    arcPath,
    cm,
    cmLatex,
    dist,
    norm,
    scale,
    sub,
    useSvgPointer,
} from "./kit";

const WIDTH = 660;
const HEIGHT = 400;
const A: Vec2 = { x: 190, y: 322 };
const B: Vec2 = { x: 450, y: 322 };
const START: Vec2 = { x: 306, y: 174 };
const LENGTH_TOLERANCE = 9;
const ANGLE_TOLERANCE = 3;

const interiorAngle = (vertex: Vec2, first: Vec2, second: Vec2): number => {
    const u = norm(sub(first, vertex));
    const v = norm(sub(second, vertex));
    const dot = Math.max(-1, Math.min(1, u.x * v.x + u.y * v.y));
    return (Math.acos(dot) * 180) / Math.PI;
};

function TriangleDrawing() {
    const setVar = useSetVar();
    const { svgRef, toSvg } = useSvgPointer(WIDTH, HEIGHT);
    const mode = useVar<string>("triangleCase", "three sides");
    const sideAC = useVar<number>("triangleSideAC", 182);
    const sideBC = useVar<number>("triangleSideBC", 156);
    const angleA = useVar<number>("triangleAngleA", 50);
    const angleB = useVar<number>("triangleAngleB", 40);
    const cx = useVar<number>("triangleVertexX", START.x);
    const cy = useVar<number>("triangleVertexY", START.y);

    const C: Vec2 = { x: cx, y: cy };
    const currentAC = dist(A, C);
    const currentBC = dist(B, C);
    const currentAngleA = interiorAngle(A, B, C);
    const currentAngleB = interiorAngle(B, A, C);

    const sssDone = Math.abs(currentAC - sideAC) < LENGTH_TOLERANCE && Math.abs(currentBC - sideBC) < LENGTH_TOLERANCE;
    const sasDone = Math.abs(currentAngleA - angleA) < ANGLE_TOLERANCE && Math.abs(currentAC - sideAC) < LENGTH_TOLERANCE;
    const asaDone =
        Math.abs(currentAngleA - angleA) < ANGLE_TOLERANCE && Math.abs(currentAngleB - angleB) < ANGLE_TOLERANCE;
    const done = mode === "three sides" ? sssDone : mode === "two sides and the angle between" ? sasDone : asaDone;

    const rayA = { x: Math.cos((angleA * Math.PI) / 180), y: -Math.sin((angleA * Math.PI) / 180) };
    const rayB = { x: -Math.cos((angleB * Math.PI) / 180), y: -Math.sin((angleB * Math.PI) / 180) };

    const handleDrag = (point: Vec2) => {
        setVar("triangleVertexX", Math.max(50, Math.min(WIDTH - 50, point.x)));
        setVar("triangleVertexY", Math.max(56, Math.min(300, point.y)));
    };

    const outline = done ? ACCENT : WARN;

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A base AB with a draggable third vertex, and the arcs or rays that fix where it must go"
        >
            <defs>
                <HandleShadow id="triangle-handle-shadow" />
            </defs>

            <g fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                {mode === "three sides" && (
                    <>
                        <text x={28} y={34} fill={Math.abs(currentAC - sideAC) < LENGTH_TOLERANCE ? ACCENT : INK} fontWeight="600">
                            {`AC = ${cm(currentAC)} — needs ${cm(sideAC)}`}
                        </text>
                        <text
                            x={WIDTH - 28}
                            y={34}
                            fill={Math.abs(currentBC - sideBC) < LENGTH_TOLERANCE ? ACCENT : INK}
                            fontWeight="600"
                            textAnchor="end"
                        >
                            {`BC = ${cm(currentBC)} — needs ${cm(sideBC)}`}
                        </text>
                    </>
                )}
                {mode === "two sides and the angle between" && (
                    <>
                        <text x={28} y={34} fill={Math.abs(currentAngleA - angleA) < ANGLE_TOLERANCE ? ACCENT : INK} fontWeight="600">
                            {`angle A = ${Math.round(currentAngleA)}° — needs ${angleA}°`}
                        </text>
                        <text
                            x={WIDTH - 28}
                            y={34}
                            fill={Math.abs(currentAC - sideAC) < LENGTH_TOLERANCE ? ACCENT : INK}
                            fontWeight="600"
                            textAnchor="end"
                        >
                            {`AC = ${cm(currentAC)} — needs ${cm(sideAC)}`}
                        </text>
                    </>
                )}
                {mode === "one side and two angles" && (
                    <>
                        <text x={28} y={34} fill={Math.abs(currentAngleA - angleA) < ANGLE_TOLERANCE ? ACCENT : INK} fontWeight="600">
                            {`angle A = ${Math.round(currentAngleA)}° — needs ${angleA}°`}
                        </text>
                        <text
                            x={WIDTH - 28}
                            y={34}
                            fill={Math.abs(currentAngleB - angleB) < ANGLE_TOLERANCE ? ACCENT : INK}
                            fontWeight="600"
                            textAnchor="end"
                        >
                            {`angle B = ${Math.round(currentAngleB)}° — needs ${angleB}°`}
                        </text>
                    </>
                )}
            </g>

            {/* The given data, drawn as the arcs or rays a compass would actually leave. */}
            {mode === "three sides" && (
                <g fill="none" stroke={ARC} strokeWidth="1.8" strokeLinecap="round">
                    <path d={arcPath(A, sideAC, -2.2, -0.4)} />
                    <path d={arcPath(B, sideBC, -2.75, -1.0)} />
                </g>
            )}
            {mode !== "three sides" && (
                <line
                    x1={A.x}
                    y1={A.y}
                    x2={add(A, scale(rayA, 250)).x}
                    y2={add(A, scale(rayA, 250)).y}
                    stroke={ARC}
                    strokeWidth="1.8"
                    strokeDasharray="7 6"
                    strokeLinecap="round"
                />
            )}
            {mode === "two sides and the angle between" && (
                <path d={arcPath(A, sideAC, -2.0, -0.35)} fill="none" stroke={ARC} strokeWidth="1.8" strokeLinecap="round" />
            )}
            {mode === "one side and two angles" && (
                <line
                    x1={B.x}
                    y1={B.y}
                    x2={add(B, scale(rayB, 250)).x}
                    y2={add(B, scale(rayB, 250)).y}
                    stroke={ARC}
                    strokeWidth="1.8"
                    strokeDasharray="7 6"
                    strokeLinecap="round"
                />
            )}

            {/* The triangle taking shape. */}
            <polygon
                points={`${A.x},${A.y} ${B.x},${B.y} ${C.x},${C.y}`}
                fill={done ? ACCENT : ACCENT_TWO}
                opacity={done ? 0.16 : 0.08}
                style={{ transition: "opacity 150ms ease-out" }}
            />
            <line x1={A.x} y1={A.y} x2={C.x} y2={C.y} stroke={outline} strokeWidth="3" strokeLinecap="round" />
            <line x1={B.x} y1={B.y} x2={C.x} y2={C.y} stroke={outline} strokeWidth="3" strokeLinecap="round" />

            {/* The given base AB. */}
            <line x1={A.x} y1={A.y} x2={B.x} y2={B.y} stroke={INK_STRUCTURE} strokeWidth="3" strokeLinecap="round" />
            <text x={(A.x + B.x) / 2} y={A.y + 28} fill={INK} fontSize="13" fontWeight="600" textAnchor="middle">
                {`AB = ${cm(dist(A, B))}`}
            </text>
            <Dot at={A} label="A" labelOffset={{ x: -18, y: 8 }} />
            <Dot at={B} label="B" labelOffset={{ x: 18, y: 8 }} />

            <Handle
                at={C}
                color={outline}
                label="C"
                onDrag={handleDrag}
                toSvg={toSvg}
                shadowId="triangle-handle-shadow"
            />

            <text
                x={WIDTH / 2}
                y={HEIGHT - 12}
                fill={done ? ACCENT : INK}
                fontSize="13"
                fontWeight={done ? "700" : "400"}
                textAnchor="middle"
            >
                {done ? "Both givens satisfied — this is the triangle" : "Drag C until both readouts turn teal"}
            </text>
        </svg>
    );
}

function TriangleFigure() {
    const setVar = useSetVar();
    const mode = useVar<string>("triangleCase", "three sides");

    return (
        <Figure
            id="triangle-builder"
            onReset={() => {
                setVar("triangleVertexX", START.x);
                setVar("triangleVertexY", START.y);
            }}
            caption="Drag C until every given fact is met at once. The arcs and rays show where a compass would have put it."
        >
            <TriangleDrawing />
            <div className="space-y-3 px-6 pb-5">
                {mode !== "three sides" && (
                    <FigureSlider
                        varName="triangleAngleA"
                        label="Angle at A"
                        {...numberPropsFromDefinition(getVariableInfo("triangleAngleA"))}
                        formatValue={(value) => `${value}°`}
                    />
                )}
                {mode !== "one side and two angles" && (
                    <FigureSlider
                        varName="triangleSideAC"
                        label="Side AC"
                        {...numberPropsFromDefinition(getVariableInfo("triangleSideAC"))}
                        formatValue={(value) => cm(value)}
                    />
                )}
                {mode === "three sides" && (
                    <FigureSlider
                        varName="triangleSideBC"
                        label="Side BC"
                        {...numberPropsFromDefinition(getVariableInfo("triangleSideBC"))}
                        formatValue={(value) => cm(value)}
                    />
                )}
                {mode === "one side and two angles" && (
                    <FigureSlider
                        varName="triangleAngleB"
                        label="Angle at B"
                        {...numberPropsFromDefinition(getVariableInfo("triangleAngleB"))}
                        formatValue={(value) => `${value}°`}
                    />
                )}
            </div>
            <InteractionHintSequence
                hintKey="triangle-builder-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag C onto the crossing point",
                        position: { x: "46%", y: "44%" },
                        dragPath: { type: "line", startOffset: { x: -22, y: -14 }, endOffset: { x: 22, y: 14 } },
                    },
                ]}
            />
            <TriggeredHintOverlay hintKey="triangle-third-angle-hint" />
        </Figure>
    );
}

// ── The givens, spoken in the prose ──────────────────────────────────────────
// Each case names its own facts, and every number is the slider's variable in
// the violet the figure draws that arc or ray in.
function TriangleGivensText() {
    const mode = useVar<string>("triangleCase", "three sides");
    const scrub = (name: string, format: (value: number) => string, id: string) => (
        <InlineScrubbleNumber id={id} varName={name} {...numberPropsFromDefinition(getVariableInfo(name))} formatValue={format} />
    );
    const degrees = (value: number) => `${value}°`;
    if (mode === "two sides and the angle between") {
        return (
            <>
                with angle A = {scrub("triangleAngleA", degrees, "scrub-triangle-sas-angle-a")} and AC ={" "}
                {scrub("triangleSideAC", cm, "scrub-triangle-sas-side-ac")}
            </>
        );
    }
    if (mode === "one side and two angles") {
        return (
            <>
                with angle A = {scrub("triangleAngleA", degrees, "scrub-triangle-asa-angle-a")} and angle B ={" "}
                {scrub("triangleAngleB", degrees, "scrub-triangle-asa-angle-b")}
            </>
        );
    }
    return (
        <>
            with AC = {scrub("triangleSideAC", cm, "scrub-triangle-sss-side-ac")} and BC ={" "}
            {scrub("triangleSideBC", cm, "scrub-triangle-sss-side-bc")}
        </>
    );
}

// ── The givens as a formula, with the check each case needs ──────────────────
// Three sides: the triangle inequality, live. Two angles: the third angle,
// live. The scrubbable numbers are the same variables the sliders move.
function TriangleGivensFormula() {
    const mode = useVar<string>("triangleCase", "three sides");
    const sideAC = useVar<number>("triangleSideAC", 182);
    const sideBC = useVar<number>("triangleSideBC", 156);
    const angleA = useVar<number>("triangleAngleA", 50);
    const angleB = useVar<number>("triangleAngleB", 40);
    const base = dist(A, B);
    const variables = {
        triangleSideAC: { ...scrubVarsFromDefinitions(["triangleSideAC"]).triangleSideAC, formatValue: (value: number) => cmLatex(value) },
        triangleSideBC: { ...scrubVarsFromDefinitions(["triangleSideBC"]).triangleSideBC, formatValue: (value: number) => cmLatex(value) },
        ...scrubVarsFromDefinitions(["triangleAngleA", "triangleAngleB"]),
    };
    let latex: string;
    if (mode === "two sides and the angle between") {
        latex = `AB = ${cmLatex(base)}, \\quad \\angle A = \\scrub{triangleAngleA}^\\circ, \\quad AC = \\scrub{triangleSideAC}`;
    } else if (mode === "one side and two angles") {
        const third = 180 - angleA - angleB;
        latex = `\\angle C = 180^\\circ - \\scrub{triangleAngleA}^\\circ - \\scrub{triangleAngleB}^\\circ = \\textcolor{${third > 0 ? ACCENT : WARN}}{${third}^\\circ}`;
    } else {
        const reaches = sideAC + sideBC > base;
        const verdict = reaches ? ACCENT : WARN;
        latex = `AC + BC = \\scrub{triangleSideAC} + \\scrub{triangleSideBC} = \\textcolor{${verdict}}{${cmLatex(sideAC + sideBC)}} \\; \\textcolor{${verdict}}{${reaches ? ">" : "<"}} \\; AB = ${cmLatex(base)}`;
    }
    return <FormulaBlock latex={latex} variables={variables} />;
}

export const triangleBlocks: ReactElement[] = [
    <StackLayout key="layout-triangle-heading" maxWidth="xl">
        <Block id="triangle-heading" padding="md">
            <EditableH2 id="h2-triangle-heading" blockId="triangle-heading">
                Constructing Triangles
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-setup" maxWidth="xl">
        <Block id="triangle-setup" padding="sm">
            <EditableParagraph id="para-triangle-setup" blockId="triangle-setup">
                A triangle question always hands you three facts and asks for the one triangle
                they describe. Working from{" "}
                <InlineToggle
                    id="toggle-triangle-case"
                    varName="triangleCase"
                    options={["three sides", "two sides and the angle between", "one side and two angles"]}
                    {...togglePropsFromDefinition(getVariableInfo("triangleCase"))}
                />{" "}
                <TriangleGivensText />, the base AB is already drawn, so drag C until every given
                fact is satisfied at once.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-figure" maxWidth="xl">
        <Block id="triangle-figure" padding="sm" hasVisualization>
            <TriangleFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-givens-formula" maxWidth="xl">
        <Block id="triangle-givens-formula" padding="md">
            <TriangleGivensFormula />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-reflect" maxWidth="xl">
        <Block id="triangle-reflect" padding="sm">
            <EditableParagraph id="para-triangle-reflect" blockId="triangle-reflect">
                There was only one place C could land, plus its mirror image below AB. That is
                the whole meaning of{" "}
                <InlineTooltip
                    id="tooltip-triangle-cases"
                    tooltip="Side-Side-Side, Side-Angle-Side and Angle-Side-Angle: the three sets of facts that fix a triangle completely, so any two triangles sharing them are congruent."
                >
                    SSS, SAS and ASA
                </InlineTooltip>
                : three facts pin a triangle down so completely that everybody who follows the
                instructions draws the same shape.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-sss-heading" maxWidth="xl">
        <Block id="triangle-sss-heading" padding="md">
            <EditableH3 id="h3-triangle-sss-heading" blockId="triangle-sss-heading">
                A triangle from three sides
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-sss-table" maxWidth="xl">
        <Block id="triangle-sss-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct triangle ABC with AB = 10 cm, AC = 7 cm and BC = 6 cm"] },
                    { cells: ["Given", "The three side lengths"] },
                    { cells: ["Step 1", "Draw AB = 10 cm with the straightedge and mark A and B"] },
                    { cells: ["Step 2", "Open the compasses to 7 cm and draw an arc from centre A"] },
                    { cells: ["Step 3", "Open the compasses to 6 cm and draw an arc from centre B, cutting the first at C"] },
                    { cells: ["Step 4", "Join AC and BC"] },
                    {
                        cells: ["Result", "Triangle ABC has the three required sides"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "If the two shorter sides added together are less than AB the arcs never meet and no triangle exists. Here 7 plus 6 is more than 10, so it is fine",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Three sides — the SSS case."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-sas-heading" maxWidth="xl">
        <Block id="triangle-sas-heading" padding="md">
            <EditableH3 id="h3-triangle-sas-heading" blockId="triangle-sas-heading">
                A triangle from two sides and the included angle
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-sas-table" maxWidth="xl">
        <Block id="triangle-sas-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct triangle ABC with AB = 10 cm, angle A = 60 degrees and AC = 7 cm"] },
                    { cells: ["Given", "Two sides and the angle sitting between them"] },
                    { cells: ["Step 1", "Draw AB = 10 cm"] },
                    { cells: ["Step 2", "Construct the 60 degree angle at A, using Construction 8"] },
                    { cells: ["Step 3", "With centre A, mark C on that arm at 7 cm"] },
                    { cells: ["Step 4", "Join C to B"] },
                    {
                        cells: ["Result", "Triangle ABC has the two sides with the required angle between them"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "The angle must be the one between the two given sides. If the angle is 60, 90, 45, 30, 120 or 75 degrees, construct it rather than measuring it",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Two sides and the angle between them — the SAS case."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-asa-heading" maxWidth="xl">
        <Block id="triangle-asa-heading" padding="md">
            <EditableH3 id="h3-triangle-asa-heading" blockId="triangle-asa-heading">
                A triangle from one side and two angles
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-asa-table" maxWidth="xl">
        <Block id="triangle-asa-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct triangle ABC with AB = 10 cm, angle A = 60 degrees and angle B = 45 degrees"] },
                    { cells: ["Given", "One side and the two angles at its ends"] },
                    { cells: ["Step 1", "Draw AB = 10 cm"] },
                    { cells: ["Step 2", "Construct the 60 degree angle at A and draw its arm"] },
                    { cells: ["Step 3", "Construct the 45 degree angle at B, opening towards A, and draw its arm"] },
                    { cells: ["Step 4", "Mark C where the two arms cross"] },
                    {
                        cells: ["Result", "Triangle ABC has the required side and both required angles"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "The two angles must add to less than 180 degrees or the arms never meet. The third angle is fixed for you, here 75 degrees",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="One side and two angles — the ASA case."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-question-impossible" maxWidth="xl">
        <Block id="triangle-question-impossible" padding="md">
            <EditableParagraph id="para-triangle-question-impossible" blockId="triangle-question-impossible">
                A question asks for a triangle with sides 3 cm, 4 cm and 9 cm. When you draw the
                two arcs from the ends of the 9 cm side, they{" "}
                <InlineFeedback
                    varName="answerTriangleImpossible"
                    correctValue="never meet, so no such triangle exists"
                    position="terminal"
                    successMessage="— exactly. 3 plus 4 is only 7, which cannot reach across 9 cm, so the arcs fall short of each other"
                    failureMessage="— not quite."
                    hint="Add the two shorter sides and compare the total with the longest side"
                >
                    <InlineClozeChoice
                        varName="answerTriangleImpossible"
                        correctAnswer="never meet, so no such triangle exists"
                        options={[
                            "cross at two points as usual",
                            "never meet, so no such triangle exists",
                            "touch at exactly one point",
                        ]}
                        {...choicePropsFromDefinition(getVariableInfo("answerTriangleImpossible"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-triangle-question-third" maxWidth="xl">
        <Block id="triangle-question-third" padding="md">
            <EditableParagraph id="para-triangle-question-third" blockId="triangle-question-third">
                You are given AB = 8 cm, angle A = 75 degrees and angle B = 60 degrees. Before
                drawing anything you already know the angle at C must be{" "}
                <InlineFeedback
                    varName="answerTriangleThirdAngle"
                    correctValue="45°"
                    position="terminal"
                    successMessage="— correct. The three angles total 180 degrees, and 180 minus 75 minus 60 leaves 45"
                    failureMessage="— check the total."
                    hint="The angles of any triangle add up to 180 degrees"
                    visualizationHint={{
                        blockId: "triangle-figure",
                        hintKey: "triangle-third-angle-hint",
                        steps: [
                            {
                                gesture: "drag",
                                label: "Set the case to one side and two angles, then drag C onto the crossing",
                                position: { x: "46%", y: "44%" },
                                completionVar: "triangleVertexY",
                                completionValue: 190,
                                completionTolerance: 45,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: {
                            triangleCase: "one side and two angles",
                            triangleAngleA: 75,
                            triangleAngleB: 60,
                            triangleVertexX: START.x,
                            triangleVertexY: START.y,
                        },
                    }}
                >
                    <InlineClozeChoice
                        varName="answerTriangleThirdAngle"
                        correctAnswer="45°"
                        options={["35°", "45°", "55°", "135°"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerTriangleThirdAngle"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
