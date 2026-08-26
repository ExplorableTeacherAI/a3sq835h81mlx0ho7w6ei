import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import {
    EditableH2,
    EditableH3,
    EditableParagraph,
    InlineClozeChoice,
    InlineFeedback,
    InlineLinkedHighlight,
    InteractionHintSequence,
    Table,
} from "@/components/atoms";
import { Figure, FigureSlider } from "@/components/molecules";
import { useVar, useSetVar } from "@/stores";
import { type Vec2 } from "@/lib/motion";
import {
    getVariableInfo,
    choicePropsFromDefinition,
    linkedHighlightPropsFromDefinition,
    numberPropsFromDefinition,
} from "../../variables";
import {
    ACCENT,
    ARC,
    Dot,
    Handle,
    HandleShadow,
    INK,
    INK_QUIET,
    INK_STRUCTURE,
    RightAngleMark,
    WARN,
    angleOf,
    arcPath,
    circleIntersections,
    cm,
    sub,
    useSvgPointer,
} from "./kit";

const WIDTH = 660;
const HEIGHT = 400;
const LINE_Y = 272;
const LINE_X1 = 56;
const LINE_X2 = 604;
const START: Vec2 = { x: 300, y: 152 };

function PerpendicularDrawing() {
    const setVar = useSetVar();
    const { svgRef, toSvg } = useSvgPointer(WIDTH, HEIGHT);
    const px = useVar<number>("perpPointX", START.x);
    const py = useVar<number>("perpPointY", START.y);
    const radius = useVar<number>("perpRadius", 130);
    const highlight = useVar<string>("perpHighlight", "");
    const P: Vec2 = { x: px, y: py };

    const gapToLine = Math.abs(py - LINE_Y);
    const onTheLine = gapToLine < 7;
    const reaches = radius > gapToLine + 6;
    const half = reaches ? Math.sqrt(radius * radius - gapToLine * gapToLine) : 0;
    const X: Vec2 = { x: px - half, y: LINE_Y };
    const Y: Vec2 = { x: px + half, y: LINE_Y };
    const secondRadius = radius * 1.18;
    const crossings = reaches ? circleIntersections(X, secondRadius, Y, secondRadius) : null;
    const foot: Vec2 = { x: px, y: LINE_Y };

    const dim = (id: string) => (highlight && highlight !== id ? 0.3 : 1);
    const weight = (id: string, resting: number) => (highlight === id ? resting * 1.7 : resting);
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("perpHighlight", id),
        onPointerLeave: () => setVar("perpHighlight", ""),
    });

    const handleDrag = (point: Vec2) => {
        setVar("perpPointX", Math.max(150, Math.min(WIDTH - 150, point.x)));
        setVar("perpPointY", Math.max(60, Math.min(HEIGHT - 60, point.y)));
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A straight line with a draggable point P and the arcs that build a perpendicular through P"
        >
            <defs>
                <HandleShadow id="perp-handle-shadow" />
            </defs>

            <g fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                <text x={28} y={38} fill={ARC} fontWeight="600" opacity={dim("chord")}>
                    {reaches ? `PX = ${cm(radius)}` : "open the compasses wider"}
                </text>
                <text x={WIDTH - 28} y={38} fill={ARC} fontWeight="600" textAnchor="end" opacity={dim("chord")}>
                    {reaches ? `PY = ${cm(radius)}` : ""}
                </text>
                <text x={WIDTH / 2} y={38} fill={INK} fontWeight="700" textAnchor="middle">
                    {onTheLine ? "P is on the line" : "P is off the line"}
                </text>
            </g>

            <g opacity={highlight ? 0.4 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                <line
                    x1={LINE_X1}
                    y1={LINE_Y}
                    x2={LINE_X2}
                    y2={LINE_Y}
                    stroke={INK_STRUCTURE}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <text x={LINE_X2 - 4} y={LINE_Y + 26} fill={INK} fontSize="13" fontWeight="600" textAnchor="end">
                    line L
                </text>
            </g>

            {reaches && (
                <g opacity={dim("chord")} style={{ transition: "opacity 150ms ease-out" }} {...hoverProps("chord")}>
                    {highlight === "chord" && (
                        <circle cx={px} cy={py} r={radius} fill="none" stroke={ARC} strokeWidth="9" opacity={0.28} />
                    )}
                    <circle
                        cx={px}
                        cy={py}
                        r={radius}
                        fill="none"
                        stroke={ARC}
                        strokeWidth={weight("chord", 1.8)}
                        style={{ transition: "stroke-width 150ms ease-out" }}
                    />
                    <line x1={X.x} y1={X.y} x2={px} y2={py} stroke={INK_QUIET} strokeWidth="1.5" strokeDasharray="5 5" />
                    <line x1={Y.x} y1={Y.y} x2={px} y2={py} stroke={INK_QUIET} strokeWidth="1.5" strokeDasharray="5 5" />
                    <Dot at={X} label="X" labelOffset={{ x: -14, y: 24 }} />
                    <Dot at={Y} label="Y" labelOffset={{ x: 14, y: 24 }} />
                </g>
            )}

            {crossings && (
                <g
                    opacity={dim("crossArcs")}
                    style={{ transition: "opacity 150ms ease-out" }}
                    {...hoverProps("crossArcs")}
                >
                    {crossings.map((point, index) => (
                        <g key={index}>
                            <path
                                d={arcPath(X, secondRadius, angleOf(sub(point, X)) - 0.3, angleOf(sub(point, X)) + 0.3)}
                                fill="none"
                                stroke={ARC}
                                strokeWidth={weight("crossArcs", 1.8)}
                                strokeLinecap="round"
                            />
                            <path
                                d={arcPath(Y, secondRadius, angleOf(sub(point, Y)) - 0.3, angleOf(sub(point, Y)) + 0.3)}
                                fill="none"
                                stroke={ARC}
                                strokeWidth={weight("crossArcs", 1.8)}
                                strokeLinecap="round"
                            />
                            <Dot at={point} color={ARC} radius={4} />
                        </g>
                    ))}
                </g>
            )}

            {crossings && (
                <g opacity={dim("perp")} style={{ transition: "opacity 150ms ease-out" }} {...hoverProps("perp")}>
                    {highlight === "perp" && (
                        <line
                            x1={px}
                            y1={54}
                            x2={px}
                            y2={HEIGHT - 40}
                            stroke={ACCENT}
                            strokeWidth="10"
                            opacity={0.28}
                            strokeLinecap="round"
                        />
                    )}
                    <line
                        x1={px}
                        y1={54}
                        x2={px}
                        y2={HEIGHT - 40}
                        stroke={ACCENT}
                        strokeWidth={weight("perp", 3)}
                        strokeLinecap="round"
                        style={{ transition: "stroke-width 150ms ease-out" }}
                    />
                    <RightAngleMark at={foot} d1={{ x: 1, y: 0 }} d2={{ x: 0, y: -1 }} color={ACCENT} />
                    {!onTheLine && <Dot at={foot} label="F" color={ACCENT} labelOffset={{ x: 20, y: 22 }} />}
                </g>
            )}

            <Handle at={P} label="P" onDrag={handleDrag} toSvg={toSvg} shadowId="perp-handle-shadow" />

            <text x={WIDTH / 2} y={HEIGHT - 12} fill={reaches ? INK : WARN} fontSize="13" textAnchor="middle">
                {reaches
                    ? onTheLine
                        ? "Construction 3 — perpendicular at a point on the line"
                        : "Construction 4 — perpendicular from a point to the line"
                    : "The circle misses the line. Widen it below."}
            </text>
        </svg>
    );
}

function PerpendicularFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="perpendicular-builder"
            onReset={() => {
                setVar("perpPointX", START.x);
                setVar("perpPointY", START.y);
                setVar("perpRadius", 130);
            }}
            caption="Drag P anywhere, including right onto the line, and widen the circle until it cuts the line twice."
        >
            <PerpendicularDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="perpRadius"
                    label="Compass width"
                    {...numberPropsFromDefinition(getVariableInfo("perpRadius"))}
                    formatValue={(value) => cm(value)}
                />
            </div>
            <InteractionHintSequence
                hintKey="perpendicular-builder-drag"
                steps={[
                    {
                        gesture: "drag-vertical",
                        label: "Drag P down onto the line and back up again",
                        position: { x: "45%", y: "38%" },
                        dragPath: { type: "line", startOffset: { x: 0, y: -24 }, endOffset: { x: 0, y: 24 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const perpendicularBlocks: ReactElement[] = [
    <StackLayout key="layout-perp-heading" maxWidth="xl">
        <Block id="perp-heading" padding="md">
            <EditableH2 id="h2-perp-heading" blockId="perp-heading">
                Standing a Line Up: Perpendiculars
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-perp-setup" maxWidth="xl">
        <Block id="perp-setup" padding="sm">
            <EditableParagraph id="para-perp-setup" blockId="perp-setup">
                Textbooks give you two separate constructions here, one for a point sitting on
                the line and one for a point floating above it. Drag P between those two
                positions and watch the{" "}
                <InlineLinkedHighlight
                    varName="perpHighlight"
                    highlightId="chord"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("perpHighlight"))}
                >
                    circle around P
                </InlineLinkedHighlight>{" "}
                cut the line at X and Y.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-perp-figure" maxWidth="xl">
        <Block id="perp-figure" padding="sm" hasVisualization>
            <PerpendicularFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-perp-reflect" maxWidth="xl">
        <Block id="perp-reflect" padding="sm">
            <EditableParagraph id="para-perp-reflect" blockId="perp-reflect">
                X and Y are both one compass width from P, so P already sits on the
                perpendicular bisector of XY. That is why{" "}
                <InlineLinkedHighlight
                    varName="perpHighlight"
                    highlightId="perp"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("perpHighlight"))}
                >
                    the line you finally draw
                </InlineLinkedHighlight>{" "}
                is forced through P at exactly 90 degrees. The two textbook constructions are
                one construction wearing two hats.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-perp-on-line-heading" maxWidth="xl">
        <Block id="perp-on-line-heading" padding="md">
            <EditableH3 id="h3-perp-on-line-heading" blockId="perp-on-line-heading">
                Construction 3 — Perpendicular at a point on a line
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-perp-on-line-table" maxWidth="xl">
        <Block id="perp-on-line-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct a perpendicular to line L at a point P that lies on L"] },
                    { cells: ["Given", "A line L and a point P on it"] },
                    { cells: ["Step 1", "With centre P, draw arcs cutting L on both sides, at X and at Y"] },
                    { cells: ["Step 2", "Open the compasses wider than PX"] },
                    { cells: ["Step 3", "With centre X, draw an arc above L"] },
                    { cells: ["Step 4", "With the same width and centre Y, draw an arc cutting it at R"] },
                    { cells: ["Step 5", "Join P to R"] },
                    {
                        cells: ["Result", "PR is perpendicular to L, so angle RPX = 90 degrees"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "Step 2 must widen the compasses, otherwise the arcs from X and Y meet on the line itself and give you nothing. Every arc stays on the page",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Construction 3 — the perpendicular bisector of XY, drawn at P."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-perp-external-heading" maxWidth="xl">
        <Block id="perp-external-heading" padding="md">
            <EditableH3 id="h3-perp-external-heading" blockId="perp-external-heading">
                Construction 4 — Perpendicular from a point to a line
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-perp-external-table" maxWidth="xl">
        <Block id="perp-external-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    {
                        cells: [
                            "Objective",
                            "To construct the perpendicular from a point P to a line L, where P is not on L",
                        ],
                    },
                    { cells: ["Given", "A line L and a point P off the line"] },
                    { cells: ["Step 1", "With centre P, open the compasses wide enough to reach across L"] },
                    { cells: ["Step 2", "Draw an arc cutting L at X and at Y"] },
                    {
                        cells: [
                            "Step 3",
                            "With centre X, then with centre Y at the same width, draw arcs on the far side of L crossing at R",
                        ],
                    },
                    { cells: ["Step 4", "Join P to R, cutting L at F"] },
                    {
                        cells: ["Result", "PF is perpendicular to L, and PF is the shortest distance from P to L"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "F is called the foot of the perpendicular. If the first arc misses L completely, the compasses were simply not open wide enough",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Construction 4 — the same arcs, this time reaching down to the line."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-perp-question-arcs" maxWidth="xl">
        <Block id="perp-question-arcs" padding="md">
            <EditableParagraph id="para-perp-question-arcs" blockId="perp-question-arcs">
                A student finishes Construction 4 neatly, then rubs out every arc so the page
                looks tidy. In an examination that answer would be marked{" "}
                <InlineFeedback
                    varName="answerPerpArcs"
                    correctValue="incomplete, because the arcs are the working"
                    position="terminal"
                    successMessage="— correct. The arcs are what show X and Y really were equal distances from P, and without them the line is just a line someone drew"
                    failureMessage="— not quite."
                    hint="Ask what is left on the page to prove the 90 degrees was constructed rather than guessed"
                >
                    <InlineClozeChoice
                        varName="answerPerpArcs"
                        correctAnswer="incomplete, because the arcs are the working"
                        options={[
                            "correct, because the line is in the right place",
                            "incomplete, because the arcs are the working",
                            "correct, because arcs are only rough guides",
                        ]}
                        {...choicePropsFromDefinition(getVariableInfo("answerPerpArcs"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-perp-question-shortest" maxWidth="xl">
        <Block id="perp-question-shortest" padding="md">
            <EditableParagraph id="para-perp-question-shortest" blockId="perp-question-shortest">
                A point P sits 5 cm above a line L. Of all the segments you could draw from P
                down to L, the shortest is{" "}
                <InlineFeedback
                    varName="answerPerpShortest"
                    correctValue="the perpendicular, 5 cm long"
                    position="terminal"
                    successMessage="— yes. Every other segment is the longest side of a right triangle whose short leg is that 5 cm perpendicular"
                    failureMessage="— have another look."
                    hint="Compare PF with the dashed segments PX and PY in the figure above"
                    visualizationHint={{
                        blockId: "perp-figure",
                        hintKey: "perp-shortest-hint",
                        steps: [
                            {
                                gesture: "drag-vertical",
                                label: "Drag P high above the line, then compare PF with the dashed PX",
                                position: { x: "45%", y: "30%" },
                                completionVar: "perpPointY",
                                completionValue: 90,
                                completionTolerance: 30,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { perpPointX: START.x, perpPointY: START.y, perpRadius: 130 },
                    }}
                >
                    <InlineClozeChoice
                        varName="answerPerpShortest"
                        correctAnswer="the perpendicular, 5 cm long"
                        options={[
                            "the perpendicular, 5 cm long",
                            "a slanted segment, shorter than 5 cm",
                            "they are all exactly 5 cm",
                        ]}
                        {...choicePropsFromDefinition(getVariableInfo("answerPerpShortest"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
