import { useState, type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineClozeChoice,
    ImageDisplay,
    InlineFeedback,
    InlineFormula,
    InlineLinkedHighlight,
    InlineTrigger,
    InteractionHintSequence,
    Table,
    TriggeredHintOverlay,
} from "@/components/atoms";
import { Figure, FormulaBlock } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { type Vec2 } from "@/lib/motion";
import {
    getVariableInfo,
    choicePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
} from "../../variables";
import {
    ACCENT,
    ACCENT_TWO,
    ARC,
    Dot,
    Handle,
    HandleShadow,
    INK,
    INK_QUIET,
    INK_STRUCTURE,
    RightAngleMark,
    cm,
    cmLatex,
    dist,
    useSvgPointer,
} from "./kit";

// ── View model ───────────────────────────────────────────────────────────────

const WIDTH = 660;
const HEIGHT = 520; // AB sits mid-frame so the circles have room above AND below it
const A: Vec2 = { x: 180, y: 292 };
const B: Vec2 = { x: 470, y: 292 };
const START: Vec2 = { x: 246, y: 168 };
const MATCH_TOLERANCE = 4; // px
const REVEAL_AFTER = 5; // matched marks before the line appears

const MIDPOINT: Vec2 = { x: (A.x + B.x) / 2, y: A.y };

interface DrawingProps {
    trail: Vec2[];
    onMatch: (point: Vec2) => void;
}

function EqualDistanceDrawing({ trail, onMatch }: DrawingProps) {
    const setVar = useSetVar();
    const { svgRef, toSvg } = useSvgPointer(WIDTH, HEIGHT);
    const px = useVar<number>("bisectorPointX", START.x);
    const py = useVar<number>("bisectorPointY", START.y);
    const highlight = useVar<string>("bisectorHighlight", "");
    const P: Vec2 = { x: px, y: py };

    const distanceToA = dist(P, A);
    const distanceToB = dist(P, B);
    const matched = Math.abs(distanceToA - distanceToB) < MATCH_TOLERANCE;
    const revealed = trail.length >= REVEAL_AFTER;

    const dim = (id: string) => (highlight && highlight !== id ? 0.32 : 1);
    const arcWeight = (id: string) => (highlight === id ? 3.4 : 1.8);

    const handleDrag = (point: Vec2) => {
        const clampedX = Math.max(30, Math.min(WIDTH - 30, point.x));
        const clampedY = Math.max(30, Math.min(HEIGHT - 30, point.y));
        setVar("bisectorPointX", clampedX);
        setVar("bisectorPointY", clampedY);
        const next = { x: clampedX, y: clampedY };
        if (Math.abs(dist(next, A) - dist(next, B)) < MATCH_TOLERANCE) onMatch(next);
    };

    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("bisectorHighlight", id),
        onPointerLeave: () => setVar("bisectorHighlight", ""),
    });

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="Segment AB with a draggable point and two compass circles centred on A and B"
        >
            <defs>
                <HandleShadow id="bisector-handle-shadow" />
            </defs>

            {/* Readouts — one formatter, tabular numerals, anchored inside the frame. */}
            <g fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                <text x={28} y={40} fill={matched ? ACCENT : ARC} fontWeight="600" opacity={dim("arcA")}>
                    {`distance to A = ${cm(distanceToA)}`}
                </text>
                <text
                    x={WIDTH - 64}
                    y={40}
                    fill={matched ? ACCENT : ACCENT_TWO}
                    fontWeight="600"
                    textAnchor="end"
                    opacity={dim("arcB")}
                >
                    {`distance to B = ${cm(distanceToB)}`}
                </text>
                <text x={WIDTH / 2} y={40} fill={matched ? ACCENT : INK_STRUCTURE} fontWeight="700" textAnchor="middle">
                    {matched ? "equal" : distanceToA > distanceToB ? "longer than" : "shorter than"}
                </text>
            </g>

            {/* Revealed perpendicular bisector — the locus the trail traces out. */}
            {revealed && (
                <g>
                    <line
                        x1={MIDPOINT.x}
                        y1={54}
                        x2={MIDPOINT.x}
                        y2={HEIGHT - 34}
                        stroke={ACCENT}
                        strokeWidth="3"
                        strokeLinecap="round"
                        opacity={0.9}
                    />
                    <RightAngleMark at={MIDPOINT} d1={{ x: 1, y: 0 }} d2={{ x: 0, y: -1 }} color={ACCENT} />
                    <Dot at={MIDPOINT} label="M" color={ACCENT} labelOffset={{ x: 0, y: 22 }} />
                </g>
            )}

            {/* The marks left behind: every spot already found to be equidistant. */}
            {trail.map((point, index) => (
                <circle key={index} cx={point.x} cy={point.y} r={3.5} fill={ACCENT} opacity={0.55} />
            ))}

            {/* Compass circle centred on A. */}
            <g opacity={dim("arcA")} style={{ transition: "opacity 150ms ease-out" }} {...hoverProps("arcA")}>
                {highlight === "arcA" && (
                    <circle cx={A.x} cy={A.y} r={distanceToA} fill="none" stroke={ARC} strokeWidth="9" opacity={0.28} />
                )}
                <circle
                    cx={A.x}
                    cy={A.y}
                    r={distanceToA}
                    fill="none"
                    stroke={ARC}
                    strokeWidth={arcWeight("arcA")}
                    style={{ transition: "stroke-width 150ms ease-out" }}
                />
            </g>

            {/* Compass circle centred on B. */}
            <g opacity={dim("arcB")} style={{ transition: "opacity 150ms ease-out" }} {...hoverProps("arcB")}>
                {highlight === "arcB" && (
                    <circle
                        cx={B.x}
                        cy={B.y}
                        r={distanceToB}
                        fill="none"
                        stroke={ACCENT_TWO}
                        strokeWidth="9"
                        opacity={0.28}
                    />
                )}
                <circle
                    cx={B.x}
                    cy={B.y}
                    r={distanceToB}
                    fill="none"
                    stroke={ACCENT_TWO}
                    strokeWidth={arcWeight("arcB")}
                    style={{ transition: "stroke-width 150ms ease-out" }}
                />
            </g>

            {/* The given segment and its endpoints. */}
            <g opacity={highlight ? 0.4 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                <line
                    x1={A.x}
                    y1={A.y}
                    x2={B.x}
                    y2={B.y}
                    stroke={INK_STRUCTURE}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <Dot at={A} label="A" />
                <Dot at={B} label="B" />
                <line
                    x1={A.x}
                    y1={A.y}
                    x2={px}
                    y2={py}
                    stroke={INK_QUIET}
                    strokeWidth="1.5"
                    strokeDasharray="5 5"
                />
                <line
                    x1={B.x}
                    y1={B.y}
                    x2={px}
                    y2={py}
                    stroke={INK_QUIET}
                    strokeWidth="1.5"
                    strokeDasharray="5 5"
                />
            </g>

            <Handle at={P} label="P" onDrag={handleDrag} toSvg={toSvg} shadowId="bisector-handle-shadow" />

            <text x={WIDTH / 2} y={HEIGHT - 12} fill={INK} fontSize="13" textAnchor="middle">
                {revealed
                    ? "Every mark you left sits on one straight line"
                    : `marks found: ${trail.length} of ${REVEAL_AFTER}`}
            </text>
        </svg>
    );
}

function EqualDistanceFigure() {
    const setVar = useSetVar();
    const [trail, setTrail] = useState<Vec2[]>([]);

    const addMark = (point: Vec2) => {
        if (trail.some((mark) => dist(mark, point) < 16)) return;
        const next = [...trail, point];
        setTrail(next);
        setVar("bisectorMarks", next.length);
    };

    return (
        <Figure
            id="equal-distance-locus"
            onReset={() => {
                setTrail([]);
                setVar("bisectorMarks", 0);
                setVar("bisectorPointX", START.x);
                setVar("bisectorPointY", START.y);
            }}
            caption="Drag P and hunt for the places where both distances read the same. Each match leaves a teal mark behind."
        >
            <EqualDistanceDrawing trail={trail} onMatch={addMark} />
            <InteractionHintSequence
                hintKey="equal-distance-locus-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag P until both distances match",
                        position: { x: "37%", y: "35%" },
                        dragPath: { type: "line", startOffset: { x: -22, y: 10 }, endOffset: { x: 26, y: -10 } },
                    },
                ]}
            />
            <TriggeredHintOverlay hintKey="bisector-locus-hint" />
        </Figure>
    );
}

// ── The two distances as a formula, reading the same store as the figure ─────
// PA wears the colour of the circle around A, PB the colour of the circle
// around B; hovering either pops that circle above, and the sign between them
// turns teal the moment P lands on the locus.
function EqualDistanceFormula() {
    const px = useVar<number>("bisectorPointX", START.x);
    const py = useVar<number>("bisectorPointY", START.y);
    const P: Vec2 = { x: px, y: py };
    const distanceToA = dist(P, A);
    const distanceToB = dist(P, B);
    const matched = Math.abs(distanceToA - distanceToB) < MATCH_TOLERANCE;
    const relation = matched ? "=" : distanceToA > distanceToB ? ">" : "<";
    return (
        <FormulaBlock
            latex={`\\highlight{arcA}{PA} = \\textcolor{${ARC}}{${cmLatex(distanceToA)}} \\quad \\clr{verdict}{${relation}} \\quad \\highlight{arcB}{PB} = \\textcolor{${ACCENT_TWO}}{${cmLatex(distanceToB)}}`}
            colorMap={{ verdict: matched ? ACCENT : INK }}
            linkedHighlights={{
                arcA: { varName: "bisectorHighlight", color: ARC },
                arcB: { varName: "bisectorHighlight", color: ACCENT_TWO },
            }}
        />
    );
}

// ── Blocks ───────────────────────────────────────────────────────────────────

export const perpendicularBisectorBlocks: ReactElement[] = [
    <StackLayout key="layout-bisector-heading" maxWidth="xl">
        <Block id="bisector-heading" padding="md">
            <EditableH2 id="h2-bisector-heading" blockId="bisector-heading">
                Why Two Arcs Find the Exact Middle
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bisector-setup" maxWidth="xl">
        <Block id="bisector-setup" padding="sm">
            <EditableParagraph id="para-bisector-setup" blockId="bisector-setup">
                Put the compasses down for a moment. Below, the{" "}
                <InlineLinkedHighlight
                    varName="bisectorHighlight"
                    highlightId="arcA"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("bisectorHighlight"))}
                >
                    circle around A
                </InlineLinkedHighlight>{" "}
                and the{" "}
                <InlineLinkedHighlight
                    varName="bisectorHighlight"
                    highlightId="arcB"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("bisectorHighlight"))}
                    color={ACCENT_TWO}
                    bgColor="rgba(142, 144, 245, 0.2)"
                >
                    circle around B
                </InlineLinkedHighlight>{" "}
                both follow the teal point P, so drag P around and hunt for the spots where
                the two distances read exactly the same. One place that always works is{" "}
                <InlineTrigger id="trigger-bisector-midline" varName="bisectorPointX" value={MIDPOINT.x} icon="zap">
                    directly above or below the middle of AB
                </InlineTrigger>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bisector-figure" maxWidth="xl">
        <Block id="bisector-figure" padding="sm" hasVisualization>
            <EqualDistanceFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bisector-distance-formula" maxWidth="xl">
        <Block id="bisector-distance-formula" padding="md">
            <EqualDistanceFormula />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bisector-reflect" maxWidth="xl">
        <Block id="bisector-reflect" padding="sm">
            <EditableParagraph id="para-bisector-reflect" blockId="bisector-reflect">
                Your marks do not scatter. Every point with{" "}
                <InlineFormula
                    id="formula-bisector-locus"
                    latex="\clr{arcA}{PA} = \clr{arcB}{PB}"
                    colorMap={{ arcA: ARC, arcB: ACCENT_TWO }}
                />
                {" "}lands on one straight line, and that line cuts AB in half at a right angle. Open your
                compasses to any width past halfway and the two arcs must cross on that same
                line, which is why the construction never depends on your measuring.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bisector-construction-heading" maxWidth="xl">
        <Block id="bisector-construction-heading" padding="md">
            <EditableH3 id="h3-bisector-construction-heading" blockId="bisector-construction-heading">
                Construction 1 — Perpendicular bisector of a line segment
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bisector-construction-table" maxWidth="xl">
        <Block id="bisector-construction-table" padding="sm">
            <Table
                columns={[
                    { header: "", width: 120, align: "left" },
                    { header: "" },
                ]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct the perpendicular bisector of a given line segment AB"] },
                    { cells: ["Given", "A line segment AB"] },
                    { cells: ["Step 1", "Open the compasses to any width greater than half of AB"] },
                    { cells: ["Step 2", "With centre A, draw one arc above AB and one arc below it"] },
                    { cells: ["Step 3", "Without changing the width, with centre B draw two arcs cutting the first pair"] },
                    { cells: ["Step 4", "Label the two crossing points P and Q"] },
                    { cells: ["Step 5", "Join P to Q with the straightedge"] },
                    {
                        cells: ["Result", "PQ cuts AB into two equal parts and meets AB at 90 degrees"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "The compass width must not change between Step 2 and Step 3. Leave all four arcs on the page, because they are the evidence that the construction was done properly",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Construction 1 — the move every later construction is built from."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bisector-steps-image" maxWidth="xl">
        <Block id="bisector-steps-image" padding="sm">
            <ImageDisplay
                id="image-bisector-steps"
                src={`${import.meta.env.BASE_URL}perpendicular-bisector-steps.svg`}
                alt="Four panels showing the perpendicular bisector of AB being constructed: the given segment, arcs drawn from A, matching arcs from B crossing at P and Q, and the finished line PQ meeting AB at right angles at M"
                objectFit="contain"
                color="#62D0AD"
                caption="The four steps of Construction 1, with the compass point marked at A and then at B."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-midpoint-construction-heading" maxWidth="xl">
        <Block id="midpoint-construction-heading" padding="md">
            <EditableH3 id="h3-midpoint-construction-heading" blockId="midpoint-construction-heading">
                Construction 2 — Midpoint of a line segment
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-midpoint-construction-table" maxWidth="xl">
        <Block id="midpoint-construction-table" padding="sm">
            <Table
                columns={[
                    { header: "", width: 120, align: "left" },
                    { header: "" },
                ]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To find the midpoint M of a given line segment AB"] },
                    { cells: ["Given", "A line segment AB"] },
                    { cells: ["Step 1", "Carry out Construction 1 on AB"] },
                    { cells: ["Step 2", "Mark M where PQ crosses AB"] },
                    {
                        cells: ["Result", "M is the midpoint, so AM = MB"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "The midpoint comes free with the perpendicular bisector. Halving a ruler reading is a drawing, not a construction, and it fails as soon as AB is an awkward length such as 7.3 cm",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Construction 2 — one extra label, no extra work."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bisector-question-locus" maxWidth="xl">
        <Block id="bisector-question-locus" padding="md">
            <EditableParagraph id="para-bisector-question-locus" blockId="bisector-question-locus">
                A line is drawn through the midpoint of AB at an angle of 70 degrees to AB.
                Compared with the perpendicular bisector, this line is{" "}
                <InlineFeedback
                    varName="answerBisectorLocus"
                    correctValue="a bisector but not perpendicular"
                    position="terminal"
                    successMessage="— exactly. It halves AB, but only the 90 degree line keeps every point equally far from A and B"
                    failureMessage="— not quite."
                    hint="A point on a tilted line through M is nearer to one endpoint than the other"
                    visualizationHint={{
                        blockId: "bisector-figure",
                        hintKey: "bisector-locus-hint",
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drag P high above the segment until both distances match",
                                position: { x: "50%", y: "26%" },
                                completionVar: "bisectorMarks",
                                completionValue: 2,
                                completionTolerance: 2,
                            },
                            {
                                gesture: "drag",
                                label: "Now find matches below AB too — see where they all line up",
                                position: { x: "50%", y: "74%" },
                                completionVar: "bisectorMarks",
                                completionValue: 5,
                                completionTolerance: 2,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { bisectorPointX: START.x, bisectorPointY: START.y },
                    }}
                >
                    <InlineClozeChoice
                        varName="answerBisectorLocus"
                        correctAnswer="a bisector but not perpendicular"
                        options={[
                            "the same line drawn differently",
                            "a bisector but not perpendicular",
                            "perpendicular but not a bisector",
                            "neither of the two",
                        ]}
                        {...choicePropsFromDefinition(getVariableInfo("answerBisectorLocus"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-bisector-question-radius" maxWidth="xl">
        <Block id="bisector-question-radius" padding="md">
            <EditableParagraph id="para-bisector-question-radius" blockId="bisector-question-radius">
                For a segment of length 8 cm, the smallest whole number of centimetres you can
                open the compasses to and still get the arcs to cross is{" "}
                <InlineFeedback
                    varName="answerBisectorRadius"
                    correctValue={["5", "5 cm", "5cm"]}
                    position="terminal"
                    successMessage="— right. Half of 8 is 4, and the width has to be more than that, so 5 cm is the smallest whole number that works"
                    failureMessage="— almost."
                    hint="Arcs from A and B only meet when the width beats half the length"
                >
                    <InlineClozeChoice
                        varName="answerBisectorRadius"
                        correctAnswer="5"
                        options={["3", "4", "5", "8"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerBisectorRadius"))}
                    />
                </InlineFeedback>
                {" "}cm.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
