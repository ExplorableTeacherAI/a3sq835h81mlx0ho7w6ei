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
    INK_STRUCTURE,
    RightAngleMark,
    add,
    circleIntersections,
    cm,
    dist,
    mid,
    norm,
    scale,
    sub,
    useSvgPointer,
} from "./kit";

const WIDTH = 660;
const HEIGHT = 420;
const O: Vec2 = { x: 252, y: 224 };
const START: Vec2 = { x: 508, y: 316 };

function TangentDrawing() {
    const setVar = useSetVar();
    const { svgRef, toSvg } = useSvgPointer(WIDTH, HEIGHT);
    const px = useVar<number>("tangentPointX", START.x);
    const py = useVar<number>("tangentPointY", START.y);
    const R = useVar<number>("tangentRadius", 91);
    const highlight = useVar<string>("tangentHighlight", "");

    const P: Vec2 = { x: px, y: py };
    const centreDistance = dist(O, P);
    const M = mid(O, P);
    const helperRadius = centreDistance / 2;
    const found = circleIntersections(O, R, M, helperRadius);
    const onTheCircle = Math.abs(centreDistance - R) < 5;
    const touchPoints: Vec2[] = found && !onTheCircle ? [found[0], found[1]] : [add(O, scale(norm(sub(P, O)), R))];
    const tangentLength = Math.sqrt(Math.max(0, centreDistance * centreDistance - R * R));

    const dim = (id: string) => (highlight && highlight !== id ? 0.28 : 1);
    const weight = (id: string, resting: number) => (highlight === id ? resting * 1.7 : resting);
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("tangentHighlight", id),
        onPointerLeave: () => setVar("tangentHighlight", ""),
    });

    const handleDrag = (point: Vec2) => {
        const direction = norm(sub(point, O));
        const wanted = Math.max(R, Math.min(268, dist(point, O)));
        const next = add(O, scale(direction, wanted));
        setVar("tangentPointX", Math.max(40, Math.min(WIDTH - 40, next.x)));
        setVar("tangentPointY", Math.max(56, Math.min(HEIGHT - 46, next.y)));
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A circle with a draggable outside point and the two tangents constructed from it"
        >
            <defs>
                <HandleShadow id="tangent-handle-shadow" />
            </defs>

            <g fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                <text x={28} y={34} fill={INK} fontWeight="600">
                    {`OP = ${cm(centreDistance)}`}
                </text>
                <text x={WIDTH - 28} y={34} fill={ACCENT} fontWeight="600" textAnchor="end">
                    {onTheCircle ? "one tangent" : `each tangent = ${cm(tangentLength)}`}
                </text>
            </g>

            {/* Helper circle on OP as diameter — where the right angle comes from. */}
            {!onTheCircle && (
                <g
                    opacity={dim("helper")}
                    style={{ transition: "opacity 150ms ease-out" }}
                    {...hoverProps("helper")}
                >
                    {highlight === "helper" && (
                        <circle cx={M.x} cy={M.y} r={helperRadius} fill="none" stroke={ARC} strokeWidth="10" opacity={0.28} />
                    )}
                    <circle
                        cx={M.x}
                        cy={M.y}
                        r={helperRadius}
                        fill="none"
                        stroke={ARC}
                        strokeWidth={weight("helper", 1.8)}
                        style={{ transition: "stroke-width 150ms ease-out" }}
                    />
                    <Dot at={M} label="M" color={ARC} labelOffset={{ x: 0, y: -14 }} />
                </g>
            )}

            {/* The given circle. */}
            <g opacity={highlight ? 0.4 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                <circle cx={O.x} cy={O.y} r={R} fill="none" stroke={INK_STRUCTURE} strokeWidth="2.5" />
                <Dot at={O} label="O" labelOffset={{ x: -16, y: 6 }} />
                <line x1={O.x} y1={O.y} x2={px} y2={py} stroke={INK_STRUCTURE} strokeWidth="1.8" strokeLinecap="round" />
            </g>

            {/* Radii to the touch points, each meeting its tangent at a right angle. */}
            <g opacity={dim("radius")} style={{ transition: "opacity 150ms ease-out" }} {...hoverProps("radius")}>
                {touchPoints.map((T, index) => (
                    <g key={index}>
                        {highlight === "radius" && (
                            <line
                                x1={O.x}
                                y1={O.y}
                                x2={T.x}
                                y2={T.y}
                                stroke={ACCENT}
                                strokeWidth="10"
                                opacity={0.28}
                                strokeLinecap="round"
                            />
                        )}
                        <line
                            x1={O.x}
                            y1={O.y}
                            x2={T.x}
                            y2={T.y}
                            stroke={ACCENT}
                            strokeWidth={weight("radius", 2.4)}
                            strokeLinecap="round"
                            style={{ transition: "stroke-width 150ms ease-out" }}
                        />
                        <RightAngleMark
                            at={T}
                            d1={norm(sub(O, T))}
                            d2={
                                onTheCircle
                                    ? { x: -norm(sub(T, O)).y, y: norm(sub(T, O)).x }
                                    : norm(sub(P, T))
                            }
                            color={ACCENT}
                            size={12}
                        />
                    </g>
                ))}
            </g>

            {/* The tangents themselves. */}
            <g opacity={dim("tangent")} style={{ transition: "opacity 150ms ease-out" }} {...hoverProps("tangent")}>
                {touchPoints.map((T, index) => {
                    const along = norm(sub(T, P));
                    const far = add(T, scale(along, onTheCircle ? 150 : 96));
                    const back = add(P, scale(along, onTheCircle ? -150 : -34));
                    return (
                        <g key={index}>
                            {highlight === "tangent" && (
                                <line
                                    x1={back.x}
                                    y1={back.y}
                                    x2={far.x}
                                    y2={far.y}
                                    stroke={ACCENT}
                                    strokeWidth="11"
                                    opacity={0.28}
                                    strokeLinecap="round"
                                />
                            )}
                            <line
                                x1={back.x}
                                y1={back.y}
                                x2={far.x}
                                y2={far.y}
                                stroke={ACCENT}
                                strokeWidth={weight("tangent", 3.2)}
                                strokeLinecap="round"
                                style={{ transition: "stroke-width 150ms ease-out" }}
                            />
                            <Dot
                                at={T}
                                label={onTheCircle ? "T" : index === 0 ? "T₁" : "T₂"}
                                color={ACCENT}
                                labelOffset={{ x: index === 0 ? -18 : 18, y: -12 }}
                            />
                        </g>
                    );
                })}
            </g>

            <Handle at={P} label="P" onDrag={handleDrag} toSvg={toSvg} shadowId="tangent-handle-shadow" />

            <text x={WIDTH / 2} y={HEIGHT - 12} fill={INK} fontSize="13" textAnchor="middle">
                {onTheCircle
                    ? "Construction 14 — P sits on the circle, so the two tangents have merged into one"
                    : "Construction 15 — two tangents, each meeting its radius at 90 degrees"}
            </text>
        </svg>
    );
}

function TangentFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="tangent-builder"
            onReset={() => {
                setVar("tangentPointX", START.x);
                setVar("tangentPointY", START.y);
                setVar("tangentRadius", 91);
            }}
            caption="Drag P towards the circle until it lands on the rim, and watch the two tangents close together into one."
        >
            <TangentDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="tangentRadius"
                    label="Circle radius"
                    {...numberPropsFromDefinition(getVariableInfo("tangentRadius"))}
                    formatValue={(value) => cm(value)}
                />
            </div>
            <InteractionHintSequence
                hintKey="tangent-builder-drag"
                steps={[
                    {
                        gesture: "drag",
                        label: "Drag P in towards the circle",
                        position: { x: "74%", y: "72%" },
                        dragPath: { type: "line", startOffset: { x: 22, y: 16 }, endOffset: { x: -22, y: -16 } },
                    },
                ]}
            />
        </Figure>
    );
}

export const tangentBlocks: ReactElement[] = [
    <StackLayout key="layout-tangent-heading" maxWidth="xl">
        <Block id="tangent-heading" padding="md">
            <EditableH2 id="h2-tangent-heading" blockId="tangent-heading">
                Tangents to a Circle
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-tangent-setup" maxWidth="xl">
        <Block id="tangent-setup" padding="sm">
            <EditableParagraph id="para-tangent-setup" blockId="tangent-setup">
                A tangent brushes a circle at one point and never cuts through it. Drag P slowly
                in towards the rim and watch the{" "}
                <InlineLinkedHighlight
                    varName="tangentHighlight"
                    highlightId="helper"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("tangentHighlight"))}
                >
                    circle drawn on OP
                </InlineLinkedHighlight>{" "}
                shrink as the two touch points slide together.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-tangent-figure" maxWidth="xl">
        <Block id="tangent-figure" padding="sm" hasVisualization>
            <TangentFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-tangent-reflect" maxWidth="xl">
        <Block id="tangent-reflect" padding="sm">
            <EditableParagraph id="para-tangent-reflect" blockId="tangent-reflect">
                OP is a diameter of that helper circle, and an angle standing on a diameter is
                always 90 degrees. So{" "}
                <InlineLinkedHighlight
                    varName="tangentHighlight"
                    highlightId="radius"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("tangentHighlight"))}
                >
                    each radius
                </InlineLinkedHighlight>{" "}
                meets its tangent square on, which is exactly what a tangent has to do. Push P
                right onto the rim and the two tangents become the single one.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-tangent-on-circle-heading" maxWidth="xl">
        <Block id="tangent-on-circle-heading" padding="md">
            <EditableH3 id="h3-tangent-on-circle-heading" blockId="tangent-on-circle-heading">
                Construction 14 — Tangent at a point on a circle
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-tangent-on-circle-table" maxWidth="xl">
        <Block id="tangent-on-circle-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct the tangent to a circle at a point T on the circle"] },
                    { cells: ["Given", "A circle with centre O and a point T on it"] },
                    { cells: ["Step 1", "Draw the radius OT and extend it a little past T"] },
                    { cells: ["Step 2", "Construct the perpendicular to OT at T, using Construction 3"] },
                    {
                        cells: ["Result", "That perpendicular is the tangent, touching the circle only at T"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "Every other point of the tangent is further from O than T is, so the line cannot cross the circle. This is Construction 3 doing a new job",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Construction 14 — a tangent is just a perpendicular to a radius."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-tangent-external-heading" maxWidth="xl">
        <Block id="tangent-external-heading" padding="md">
            <EditableH3 id="h3-tangent-external-heading" blockId="tangent-external-heading">
                Construction 15 — Tangents from an external point
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-tangent-external-table" maxWidth="xl">
        <Block id="tangent-external-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct the tangents to a circle from a point P outside it"] },
                    { cells: ["Given", "A circle with centre O and a point P outside the circle"] },
                    { cells: ["Step 1", "Join O to P"] },
                    { cells: ["Step 2", "Construct the perpendicular bisector of OP to find its midpoint M"] },
                    { cells: ["Step 3", "With centre M and radius MO, draw a circle cutting the given circle at T₁ and T₂"] },
                    { cells: ["Step 4", "Join P to T₁ and P to T₂"] },
                    {
                        cells: ["Result", "PT₁ and PT₂ are the two tangents, and they are equal in length"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "Angle OT₁P stands on the diameter OP, so it is 90 degrees and PT₁ really does touch the circle. If P is inside the circle no tangent exists at all",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Construction 15 — Construction 1 finds M, and the angle in a semicircle does the rest."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-tangent-question-angle" maxWidth="xl">
        <Block id="tangent-question-angle" padding="md">
            <EditableParagraph id="para-tangent-question-angle" blockId="tangent-question-angle">
                A circle has radius 6 cm and a tangent touches it at T. The angle between that
                tangent and the radius OT measures{" "}
                <InlineFeedback
                    varName="answerTangentAngle"
                    correctValue="90°"
                    position="terminal"
                    successMessage="— yes, and it is 90 degrees for every tangent of every circle, whatever the radius"
                    failureMessage="— not quite."
                    hint="Look at the small square drawn at each touch point in the figure above"
                >
                    <InlineClozeChoice
                        varName="answerTangentAngle"
                        correctAnswer="90°"
                        options={["45°", "60°", "90°", "it depends on the radius"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerTangentAngle"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-tangent-question-length" maxWidth="xl">
        <Block id="tangent-question-length" padding="md">
            <EditableParagraph id="para-tangent-question-length" blockId="tangent-question-length">
                A circle has radius 5 cm and P sits 13 cm from the centre. Each tangent from P
                touches the circle at a distance of{" "}
                <InlineFeedback
                    varName="answerTangentLength"
                    correctValue="12"
                    position="terminal"
                    successMessage="— right. OTP is a right triangle, so the tangent length is the square root of 169 minus 25, which is 12"
                    failureMessage="— almost."
                    hint="The radius, the tangent and OP form a right triangle with OP as the longest side"
                    visualizationHint={{
                        blockId: "tangent-figure",
                        hintKey: "tangent-length-hint",
                        steps: [
                            {
                                gesture: "drag",
                                label: "Drag P further out and watch the tangent length readout grow",
                                position: { x: "76%", y: "74%" },
                                completionVar: "tangentPointX",
                                completionValue: 580,
                                completionTolerance: 45,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { tangentPointX: START.x, tangentPointY: START.y, tangentRadius: 91 },
                    }}
                >
                    <InlineClozeChoice
                        varName="answerTangentLength"
                        correctAnswer="12"
                        options={["8", "12", "13", "18"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerTangentLength"))}
                    />
                </InlineFeedback>
                {" "}cm from P.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
