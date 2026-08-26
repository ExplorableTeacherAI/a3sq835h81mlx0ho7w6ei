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
    WARN,
    add,
    angleOf,
    arcPath,
    cm,
    fromAngle,
    scale,
    sub,
    useSvgPointer,
} from "./kit";

const WIDTH = 660;
const HEIGHT = 430;
const CENTRE: Vec2 = { x: 330, y: 240 };

const RECIPES: Record<number, string> = {
    0: "the baseline you started from",
    15: "bisect 30°",
    30: "bisect 60°",
    45: "bisect 90°",
    60: "one compass width, stepped once",
    75: "bisect between 60° and 90°",
    90: "bisect between 60° and 120°",
    105: "bisect between 90° and 120°",
    120: "two compass steps",
    135: "bisect between 120° and 150°",
    150: "bisect between 120° and 180°",
    165: "bisect between 150° and 180°",
    180: "three compass steps — a straight line",
};

function AngleDialDrawing() {
    const setVar = useSetVar();
    const { svgRef, toSvg } = useSvgPointer(WIDTH, HEIGHT);
    const angle = useVar<number>("dialAngle", 68);
    const radius = useVar<number>("dialRadius", 130);
    const highlight = useVar<string>("dialHighlight", "");

    const snapped = Math.round(angle / 15) * 15;
    const onMark = Math.abs(angle - snapped) < 3 && snapped <= 180;
    const recipe = RECIPES[snapped] ?? "";

    const pointAt = (degrees: number, r = radius): Vec2 =>
        add(CENTRE, fromAngle((-degrees * Math.PI) / 180, r));
    const handleAt = pointAt(angle);

    const dim = (id: string) => (highlight && highlight !== id ? 0.28 : 1);
    const weight = (id: string, resting: number) => (highlight === id ? resting * 1.7 : resting);
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("dialHighlight", id),
        onPointerLeave: () => setVar("dialHighlight", ""),
    });

    const handleDrag = (point: Vec2) => {
        let degrees = (-angleOf(sub(point, CENTRE)) * 180) / Math.PI;
        if (degrees < 0) degrees += 360;
        const clamped = Math.max(0, Math.min(180, degrees));
        const nearest = Math.round(clamped / 15) * 15;
        setVar("dialAngle", Math.abs(clamped - nearest) < 5 ? nearest : Math.round(clamped));
    };

    const hexagonMarks = [0, 60, 120, 180, 240, 300];

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A circle marked by stepping one compass width around it, with a draggable angle arm"
        >
            <defs>
                <HandleShadow id="dial-handle-shadow" />
            </defs>

            <g fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                <text x={28} y={34} fill={onMark ? ACCENT : WARN} fontWeight="700">
                    {onMark ? `${snapped}°` : `${Math.round(angle)}° — between the marks`}
                </text>
                <text x={WIDTH - 28} y={34} fill={INK} textAnchor="end">
                    {onMark ? recipe : "the marks sit 15° apart"}
                </text>
            </g>

            {/* Six equal chords: one compass width stepped around the circle. */}
            <g
                opacity={dim("hexagon")}
                style={{ transition: "opacity 150ms ease-out" }}
                {...hoverProps("hexagon")}
            >
                {highlight === "hexagon" && (
                    <circle cx={CENTRE.x} cy={CENTRE.y} r={radius} fill="none" stroke={ARC} strokeWidth="10" opacity={0.28} />
                )}
                <circle
                    cx={CENTRE.x}
                    cy={CENTRE.y}
                    r={radius}
                    fill="none"
                    stroke={ARC}
                    strokeWidth={weight("hexagon", 1.8)}
                    style={{ transition: "stroke-width 150ms ease-out" }}
                />
                <polygon
                    points={hexagonMarks.map((degrees) => `${pointAt(degrees).x},${pointAt(degrees).y}`).join(" ")}
                    fill="none"
                    stroke={ARC}
                    strokeWidth={weight("hexagon", 1.5)}
                    strokeLinejoin="round"
                    opacity={0.75}
                />
                {hexagonMarks.map((degrees) => (
                    <Dot key={degrees} at={pointAt(degrees)} color={ARC} radius={4} />
                ))}
            </g>

            {/* The 15 degree ticks — every angle these constructions can reach. */}
            <g opacity={dim("ticks")} style={{ transition: "opacity 150ms ease-out" }} {...hoverProps("ticks")}>
                {Array.from({ length: 13 }, (_, index) => index * 15).map((degrees) => {
                    const inner = pointAt(degrees, radius - 9);
                    const outer = pointAt(degrees, radius + 9);
                    const isHexagonMark = degrees % 60 === 0;
                    return (
                        <line
                            key={degrees}
                            x1={inner.x}
                            y1={inner.y}
                            x2={outer.x}
                            y2={outer.y}
                            stroke={isHexagonMark ? ARC : INK_QUIET}
                            strokeWidth={isHexagonMark ? 2.4 : weight("ticks", 1.8)}
                            strokeLinecap="round"
                        />
                    );
                })}
            </g>

            {/* Baseline and the swinging arm. */}
            <g opacity={highlight ? 0.4 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                <line
                    x1={CENTRE.x - radius - 74}
                    y1={CENTRE.y}
                    x2={CENTRE.x + radius + 74}
                    y2={CENTRE.y}
                    stroke={INK_STRUCTURE}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <Dot at={CENTRE} label="O" labelOffset={{ x: -16, y: 20 }} />
            </g>

            <path
                d={arcPath(CENTRE, 46, (-angle * Math.PI) / 180, 0)}
                fill="none"
                stroke={onMark ? ACCENT : WARN}
                strokeWidth="2.4"
                strokeLinecap="round"
            />
            <line
                x1={CENTRE.x}
                y1={CENTRE.y}
                x2={add(CENTRE, scale(sub(handleAt, CENTRE), (radius + 66) / radius)).x}
                y2={add(CENTRE, scale(sub(handleAt, CENTRE), (radius + 66) / radius)).y}
                stroke={onMark ? ACCENT : WARN}
                strokeWidth="3.2"
                strokeLinecap="round"
            />

            <Handle
                at={handleAt}
                color={onMark ? ACCENT : WARN}
                onDrag={handleDrag}
                toSvg={toSvg}
                shadowId="dial-handle-shadow"
            />

            <text x={WIDTH / 2} y={HEIGHT - 12} fill={INK} fontSize="13" textAnchor="middle">
                {`One compass width of ${cm(radius)} steps around the circle exactly six times`}
            </text>
        </svg>
    );
}

function AngleDialFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="angle-dial"
            onReset={() => {
                setVar("dialAngle", 68);
                setVar("dialRadius", 130);
            }}
            caption="Swing the arm around the dial. It settles onto the angles a compass can actually build, and widening the circle changes none of them."
        >
            <AngleDialDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="dialRadius"
                    label="Compass width"
                    {...numberPropsFromDefinition(getVariableInfo("dialRadius"))}
                    formatValue={(value) => cm(value)}
                />
            </div>
            <InteractionHintSequence
                hintKey="angle-dial-drag"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Swing the arm around the dial",
                        position: { x: "62%", y: "36%" },
                        dragPath: { type: "arc", startAngle: -30, endAngle: -110, radius: 40 },
                    },
                ]}
            />
        </Figure>
    );
}

export const standardAnglesBlocks: ReactElement[] = [
    <StackLayout key="layout-dial-heading" maxWidth="xl">
        <Block id="dial-heading" padding="md">
            <EditableH2 id="h2-dial-heading" blockId="dial-heading">
                Angles from a Single Arc
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-setup" maxWidth="xl">
        <Block id="dial-setup" padding="sm">
            <EditableParagraph id="para-dial-setup" blockId="dial-setup">
                Set your compasses to any width and step that width around its own circle. It
                lands back where it started after exactly{" "}
                <InlineLinkedHighlight
                    varName="dialHighlight"
                    highlightId="hexagon"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("dialHighlight"))}
                >
                    six steps
                </InlineLinkedHighlight>
                . Swing the arm below and see which angles the compasses will give you.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-figure" maxWidth="xl">
        <Block id="dial-figure" padding="sm" hasVisualization>
            <AngleDialFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-reflect" maxWidth="xl">
        <Block id="dial-reflect" padding="sm">
            <EditableParagraph id="para-dial-reflect" blockId="dial-reflect">
                Six equal steps around a full turn means each step is 60 degrees, and the chord
                equals the radius because the triangle it makes is equilateral. Halving 60 gives
                30, halving again gives 15, and every other{" "}
                <InlineLinkedHighlight
                    varName="dialHighlight"
                    highlightId="ticks"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("dialHighlight"))}
                >
                    mark on the dial
                </InlineLinkedHighlight>{" "}
                is built by adding or halving those. Widening the circle moved none of them.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-sixty-heading" maxWidth="xl">
        <Block id="dial-sixty-heading" padding="md">
            <EditableH3 id="h3-dial-sixty-heading" blockId="dial-sixty-heading">
                Construction 8 — An angle of 60 degrees
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-sixty-table" maxWidth="xl">
        <Block id="dial-sixty-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct an angle of 60 degrees at a point O on a line"] },
                    { cells: ["Given", "A line with a point O marked on it"] },
                    { cells: ["Step 1", "With centre O, draw an arc cutting the line at A"] },
                    { cells: ["Step 2", "Without changing the width, put the point on A and draw an arc cutting the first at B"] },
                    { cells: ["Step 3", "Join O to B"] },
                    {
                        cells: ["Result", "Angle AOB = 60 degrees"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "OA, OB and AB are all one compass width, so triangle OAB is equilateral and each of its angles is 60 degrees. Change the width between Step 1 and Step 2 and the triangle stops being equilateral, which is the single most common way this construction fails",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Construction 8 — the angle every other angle here is built from."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-thirty-heading" maxWidth="xl">
        <Block id="dial-thirty-heading" padding="md">
            <EditableH3 id="h3-dial-thirty-heading" blockId="dial-thirty-heading">
                Construction 9 — An angle of 30 degrees
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-thirty-table" maxWidth="xl">
        <Block id="dial-thirty-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct an angle of 30 degrees"] },
                    { cells: ["Given", "A line with a point O marked on it"] },
                    { cells: ["Step 1", "Construct an angle of 60 degrees at O, using Construction 8"] },
                    { cells: ["Step 2", "Bisect that angle, using Construction 5"] },
                    {
                        cells: ["Result", "Each half measures 30 degrees"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    { cells: ["Notes", "Bisect once more and you have 15 degrees"] },
                ]}
                color="#62D0AD"
                caption="Construction 9 — 60 degrees, folded in half."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-ninety-heading" maxWidth="xl">
        <Block id="dial-ninety-heading" padding="md">
            <EditableH3 id="h3-dial-ninety-heading" blockId="dial-ninety-heading">
                Construction 10 — An angle of 90 degrees
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-ninety-table" maxWidth="xl">
        <Block id="dial-ninety-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct an angle of 90 degrees at a point O on a line"] },
                    { cells: ["Given", "A line with a point O marked on it"] },
                    { cells: ["Step 1", "With centre O, draw an arc cutting the line at A"] },
                    { cells: ["Step 2", "Keeping that width, step the arc twice more to reach the 60 degree and 120 degree marks"] },
                    { cells: ["Step 3", "Bisect the angle between those two marks, using Construction 5"] },
                    {
                        cells: ["Result", "The bisector stands at 90 degrees to the line"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "Construction 3 gives the same 90 degrees by a shorter route. Use whichever you can remember under pressure",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Construction 10 — halfway between 60 and 120."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-fortyfive-heading" maxWidth="xl">
        <Block id="dial-fortyfive-heading" padding="md">
            <EditableH3 id="h3-dial-fortyfive-heading" blockId="dial-fortyfive-heading">
                Construction 11 — An angle of 45 degrees
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-fortyfive-table" maxWidth="xl">
        <Block id="dial-fortyfive-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct an angle of 45 degrees"] },
                    { cells: ["Given", "A line with a point O marked on it"] },
                    { cells: ["Step 1", "Construct 90 degrees at O, using Construction 10"] },
                    { cells: ["Step 2", "Bisect the right angle, using Construction 5"] },
                    {
                        cells: ["Result", "Each half measures 45 degrees"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    { cells: ["Notes", "Bisect 45 again for 22.5 degrees, which never appears on a school protractor"] },
                ]}
                color="#62D0AD"
                caption="Construction 11 — the right angle, folded in half."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-onetwenty-heading" maxWidth="xl">
        <Block id="dial-onetwenty-heading" padding="md">
            <EditableH3 id="h3-dial-onetwenty-heading" blockId="dial-onetwenty-heading">
                Construction 12 — An angle of 120 degrees
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-onetwenty-table" maxWidth="xl">
        <Block id="dial-onetwenty-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct an angle of 120 degrees at a point O on a line"] },
                    { cells: ["Given", "A line with a point O marked on it"] },
                    { cells: ["Step 1", "With centre O, draw an arc cutting the line at A"] },
                    { cells: ["Step 2", "With the same width and centre A, mark B on the arc"] },
                    { cells: ["Step 3", "With the same width and centre B, mark C on the arc"] },
                    { cells: ["Step 4", "Join O to C"] },
                    {
                        cells: ["Result", "Angle AOC = 120 degrees, because it is two steps of 60"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "The compass width stays untouched for all three arcs. Alternatively, 120 degrees is simply the angle left over beside a 60 degree angle on a straight line",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Construction 12 — two steps of the same width."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-seventyfive-heading" maxWidth="xl">
        <Block id="dial-seventyfive-heading" padding="md">
            <EditableH3 id="h3-dial-seventyfive-heading" blockId="dial-seventyfive-heading">
                Construction 13 — An angle of 75 degrees
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-seventyfive-table" maxWidth="xl">
        <Block id="dial-seventyfive-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct an angle of 75 degrees"] },
                    { cells: ["Given", "A line with a point O marked on it"] },
                    { cells: ["Step 1", "Construct 60 degrees at O"] },
                    { cells: ["Step 2", "Construct 90 degrees at the same point O"] },
                    { cells: ["Step 3", "Bisect the 30 degree gap between those two arms"] },
                    {
                        cells: ["Result", "The bisector sits at 75 degrees, since 60 plus 15 is 75"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "Keep the 60 degree and 90 degree arms lightly drawn so the examiner can follow the route. The same idea gives 105 degrees from the gap between 90 and 120",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Construction 13 — build two angles, then split the gap."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-question-width" maxWidth="xl">
        <Block id="dial-question-width" padding="md">
            <EditableParagraph id="para-dial-question-width" blockId="dial-question-width">
                Halfway through Construction 8 a student nudges the compass hinge, so the second
                arc is drawn a little wider than the first. The angle at O now comes out{" "}
                <InlineFeedback
                    varName="answerDialWidth"
                    correctValue="not 60 degrees, because the triangle is no longer equilateral"
                    position="terminal"
                    successMessage="— exactly. The 60 degrees comes only from all three sides being the same, so a nudged hinge quietly destroys it"
                    failureMessage="— think again."
                    hint="What has to be true about triangle OAB for its angles to be 60 degrees each?"
                >
                    <InlineClozeChoice
                        varName="answerDialWidth"
                        correctAnswer="not 60 degrees, because the triangle is no longer equilateral"
                        options={[
                            "still 60 degrees, since the width does not matter",
                            "not 60 degrees, because the triangle is no longer equilateral",
                            "exactly 30 degrees instead",
                        ]}
                        {...choicePropsFromDefinition(getVariableInfo("answerDialWidth"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-dial-question-build" maxWidth="xl">
        <Block id="dial-question-build" padding="md">
            <EditableParagraph id="para-dial-question-build" blockId="dial-question-build">
                Using only compasses and a straightedge, the angle you could not build from the
                dial above is{" "}
                <InlineFeedback
                    varName="answerDialImpossible"
                    correctValue="20°"
                    position="terminal"
                    successMessage="— correct. Every angle on the dial is a multiple of 15 degrees, and 20 is not one of them"
                    failureMessage="— check the dial again."
                    hint="Swing the arm and see which numbers it is willing to settle on"
                    visualizationHint={{
                        blockId: "dial-figure",
                        hintKey: "dial-impossible-hint",
                        steps: [
                            {
                                gesture: "drag-circular",
                                label: "Swing the arm down towards the baseline and watch which angles it accepts",
                                position: { x: "70%", y: "45%" },
                                completionVar: "dialAngle",
                                completionValue: 15,
                                completionTolerance: 8,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { dialAngle: 68, dialRadius: 130 },
                    }}
                >
                    <InlineClozeChoice
                        varName="answerDialImpossible"
                        correctAnswer="20°"
                        options={["15°", "20°", "45°", "135°"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerDialImpossible"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
