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
    ACCENT_TWO,
    ARC,
    Dot,
    Handle,
    HandleShadow,
    INK,
    INK_STRUCTURE,
    add,
    angleOf,
    arcPath,
    circleIntersections,
    cm,
    dist,
    norm,
    scale,
    sub,
    useSvgPointer,
} from "./kit";

// ── Figure A — the angle bisector and the two congruent triangles ────────────

const WIDTH = 660;
const HEIGHT = 400;
const VERTEX: Vec2 = { x: 132, y: 318 };
const ARM_LENGTH = 470;

function AngleBisectorDrawing() {
    const setVar = useSetVar();
    const { svgRef, toSvg } = useSvgPointer(WIDTH, HEIGHT);
    const theta = useVar<number>("bisectAngle", 68);
    const radius = useVar<number>("bisectRadius", 130);
    const highlight = useVar<string>("bisectHighlight", "");

    const thetaRadians = (theta * Math.PI) / 180;
    const fixedDirection: Vec2 = { x: 1, y: 0 };
    const movingDirection: Vec2 = { x: Math.cos(thetaRadians), y: -Math.sin(thetaRadians) };

    const P = add(VERTEX, scale(fixedDirection, radius));
    const Q = add(VERTEX, scale(movingDirection, radius));
    const crossings = circleIntersections(P, radius, Q, radius);
    const R = crossings
        ? dist(crossings[0], VERTEX) > dist(crossings[1], VERTEX)
            ? crossings[0]
            : crossings[1]
        : VERTEX;
    const bisectorDirection = norm(sub(R, VERTEX));
    const armEnd = add(VERTEX, scale(movingDirection, ARM_LENGTH * 0.62));
    const handleAt = add(VERTEX, scale(movingDirection, 214));

    const dim = (id: string) => (highlight && highlight !== id ? 0.28 : 1);
    const weight = (id: string, resting: number) => (highlight === id ? resting * 1.7 : resting);
    const hoverProps = (id: string) => ({
        onPointerEnter: () => setVar("bisectHighlight", id),
        onPointerLeave: () => setVar("bisectHighlight", ""),
    });

    const handleDrag = (point: Vec2) => {
        const degrees = (-angleOf(sub(point, VERTEX)) * 180) / Math.PI;
        setVar("bisectAngle", Math.max(20, Math.min(140, Math.round(degrees))));
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="An angle at V with the two congruent triangles that its bisector construction creates"
        >
            <defs>
                <HandleShadow id="bisect-handle-shadow" />
            </defs>

            <g fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                <text x={28} y={36} fill={INK} fontWeight="600">
                    {`angle PVQ = ${theta}°`}
                </text>
                <text x={WIDTH - 28} y={36} fill={ACCENT} fontWeight="600" textAnchor="end">
                    {`each half = ${(theta / 2).toFixed(1)}°`}
                </text>
            </g>

            {/* The two triangles the construction builds — congruent by SSS. */}
            <polygon
                points={`${VERTEX.x},${VERTEX.y} ${P.x},${P.y} ${R.x},${R.y}`}
                fill={ACCENT}
                opacity={highlight === "triangles" ? 0.3 : 0.12}
                style={{ transition: "opacity 150ms ease-out" }}
            />
            <polygon
                points={`${VERTEX.x},${VERTEX.y} ${Q.x},${Q.y} ${R.x},${R.y}`}
                fill={ACCENT_TWO}
                opacity={highlight === "triangles" ? 0.3 : 0.12}
                style={{ transition: "opacity 150ms ease-out" }}
            />

            {/* The given angle. */}
            <g opacity={highlight ? 0.4 : 1} style={{ transition: "opacity 150ms ease-out" }}>
                <line
                    x1={VERTEX.x}
                    y1={VERTEX.y}
                    x2={VERTEX.x + ARM_LENGTH}
                    y2={VERTEX.y}
                    stroke={INK_STRUCTURE}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <line
                    x1={VERTEX.x}
                    y1={VERTEX.y}
                    x2={armEnd.x}
                    y2={armEnd.y}
                    stroke={INK_STRUCTURE}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
                <Dot at={VERTEX} label="V" labelOffset={{ x: -16, y: 8 }} />
            </g>

            {/* Equal radii VP and VQ — the first pair of matching sides. */}
            <g
                opacity={dim("equalRadii")}
                style={{ transition: "opacity 150ms ease-out" }}
                {...hoverProps("equalRadii")}
            >
                {highlight === "equalRadii" && (
                    <path
                        d={arcPath(VERTEX, radius, -thetaRadians, 0)}
                        fill="none"
                        stroke={ARC}
                        strokeWidth="10"
                        opacity={0.28}
                    />
                )}
                <path
                    d={arcPath(VERTEX, radius, -thetaRadians, 0)}
                    fill="none"
                    stroke={ARC}
                    strokeWidth={weight("equalRadii", 1.8)}
                    strokeLinecap="round"
                    style={{ transition: "stroke-width 150ms ease-out" }}
                />
                <Dot at={P} label="P" labelOffset={{ x: 4, y: 24 }} />
                <Dot at={Q} label="Q" labelOffset={{ x: -16, y: -6 }} />
            </g>

            {/* Equal arcs PR and QR — the second pair of matching sides. */}
            <g
                opacity={dim("equalArcs")}
                style={{ transition: "opacity 150ms ease-out" }}
                {...hoverProps("equalArcs")}
            >
                {highlight === "equalArcs" && (
                    <g stroke={ARC} strokeWidth="10" opacity={0.28} fill="none">
                        <path d={arcPath(P, radius, angleOf(sub(R, P)) - 0.34, angleOf(sub(R, P)) + 0.34)} />
                        <path d={arcPath(Q, radius, angleOf(sub(R, Q)) - 0.34, angleOf(sub(R, Q)) + 0.34)} />
                    </g>
                )}
                <path
                    d={arcPath(P, radius, angleOf(sub(R, P)) - 0.34, angleOf(sub(R, P)) + 0.34)}
                    fill="none"
                    stroke={ARC}
                    strokeWidth={weight("equalArcs", 1.8)}
                    strokeLinecap="round"
                />
                <path
                    d={arcPath(Q, radius, angleOf(sub(R, Q)) - 0.34, angleOf(sub(R, Q)) + 0.34)}
                    fill="none"
                    stroke={ARC}
                    strokeWidth={weight("equalArcs", 1.8)}
                    strokeLinecap="round"
                />
                <Dot at={R} label="R" color={ARC} labelOffset={{ x: 18, y: -6 }} />
            </g>

            {/* The bisector — accent, heaviest stroke. */}
            <g opacity={dim("bisector")} style={{ transition: "opacity 150ms ease-out" }} {...hoverProps("bisector")}>
                {highlight === "bisector" && (
                    <line
                        x1={VERTEX.x}
                        y1={VERTEX.y}
                        x2={add(VERTEX, scale(bisectorDirection, 430)).x}
                        y2={add(VERTEX, scale(bisectorDirection, 430)).y}
                        stroke={ACCENT}
                        strokeWidth="11"
                        opacity={0.28}
                        strokeLinecap="round"
                    />
                )}
                <line
                    x1={VERTEX.x}
                    y1={VERTEX.y}
                    x2={add(VERTEX, scale(bisectorDirection, 430)).x}
                    y2={add(VERTEX, scale(bisectorDirection, 430)).y}
                    stroke={ACCENT}
                    strokeWidth={weight("bisector", 3.2)}
                    strokeLinecap="round"
                    style={{ transition: "stroke-width 150ms ease-out" }}
                />
            </g>

            {/* Matching side lengths, direct-labelled. */}
            <g fontSize="12" fill={INK} style={{ fontVariantNumeric: "tabular-nums" }}>
                <text x={28} y={HEIGHT - 34} fill={ARC} fontWeight="600">
                    {`VP = VQ = ${cm(radius)}`}
                </text>
                <text x={WIDTH - 28} y={HEIGHT - 34} fill={ARC} fontWeight="600" textAnchor="end">
                    {`PR = QR = ${cm(radius)}`}
                </text>
                <text x={WIDTH / 2} y={HEIGHT - 34} fontWeight="600" textAnchor="middle">
                    VR is in both triangles
                </text>
            </g>

            <Handle
                at={handleAt}
                onDrag={handleDrag}
                toSvg={toSvg}
                shadowId="bisect-handle-shadow"
            />

            <text x={WIDTH / 2} y={HEIGHT - 12} fill={INK} fontSize="13" textAnchor="middle">
                Three matching sides, so the two triangles are congruent
            </text>
        </svg>
    );
}

function AngleBisectorFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="angle-bisector-congruence"
            onReset={() => {
                setVar("bisectAngle", 68);
                setVar("bisectRadius", 130);
            }}
            caption="Swing the upper arm to any angle you like, and widen the first arc. The two shaded triangles always match."
        >
            <AngleBisectorDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="bisectRadius"
                    label="First arc width"
                    {...numberPropsFromDefinition(getVariableInfo("bisectRadius"))}
                    formatValue={(value) => cm(value)}
                />
            </div>
            <InteractionHintSequence
                hintKey="angle-bisector-congruence-drag"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Swing the upper arm around V",
                        position: { x: "26%", y: "34%" },
                        dragPath: { type: "arc", startAngle: -40, endAngle: -80, radius: 38 },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Figure B — copy the angle, get a parallel ────────────────────────────────

const PARALLEL_WIDTH = 660;
const PARALLEL_HEIGHT = 380;
const ANCHOR: Vec2 = { x: 150, y: 312 };
const LINE_ANGLE = 16; // degrees above horizontal for the given line m
const TRANSVERSAL_ANGLE = 72; // degrees above horizontal for the transversal
const GIVEN_ANGLE = TRANSVERSAL_ANGLE - LINE_ANGLE; // 56 degrees

const lineDirection: Vec2 = {
    x: Math.cos((-LINE_ANGLE * Math.PI) / 180),
    y: Math.sin((-LINE_ANGLE * Math.PI) / 180),
};
const transversalDirection: Vec2 = {
    x: Math.cos((-TRANSVERSAL_ANGLE * Math.PI) / 180),
    y: Math.sin((-TRANSVERSAL_ANGLE * Math.PI) / 180),
};
const POINT_P = add(ANCHOR, scale(transversalDirection, 212));

/** Perpendicular distance from a point to line m. */
const gapToLine = (point: Vec2): number => {
    const v = sub(point, ANCHOR);
    return Math.abs(v.x * lineDirection.y - v.y * lineDirection.x);
};
const footOnLine = (point: Vec2): Vec2 => {
    const v = sub(point, ANCHOR);
    const along = v.x * lineDirection.x + v.y * lineDirection.y;
    return add(ANCHOR, scale(lineDirection, along));
};

function ParallelDrawing() {
    const setVar = useSetVar();
    const { svgRef, toSvg } = useSvgPointer(PARALLEL_WIDTH, PARALLEL_HEIGHT);
    const beta = useVar<number>("parallelAngle", 34);

    const newDirectionAngle = ((TRANSVERSAL_ANGLE - beta) * Math.PI) / 180;
    const newDirection: Vec2 = { x: Math.cos(-newDirectionAngle), y: Math.sin(-newDirectionAngle) };
    const leftEnd = add(POINT_P, scale(newDirection, -170));
    const rightEnd = add(POINT_P, scale(newDirection, 230));
    const matched = Math.abs(beta - GIVEN_ANGLE) < 1.5;

    const sampleLeft = add(POINT_P, scale(newDirection, -120));
    const sampleRight = add(POINT_P, scale(newDirection, 190));
    const gapLeft = gapToLine(sampleLeft);
    const gapRight = gapToLine(sampleRight);

    const handleAt = add(POINT_P, scale(newDirection, 150));
    const handleDrag = (point: Vec2) => {
        const pointerAngle = (-angleOf(sub(point, POINT_P)) * 180) / Math.PI;
        setVar("parallelAngle", Math.max(8, Math.min(TRANSVERSAL_ANGLE - 2, Math.round(TRANSVERSAL_ANGLE - pointerAngle))));
    };

    return (
        <svg
            ref={svgRef}
            viewBox={`0 0 ${PARALLEL_WIDTH} ${PARALLEL_HEIGHT}`}
            className="block w-full"
            role="img"
            aria-label="A line, a transversal, and a rotatable line through P that becomes parallel when the angles match"
        >
            <defs>
                <HandleShadow id="parallel-handle-shadow" />
            </defs>

            <g fontSize="13" style={{ fontVariantNumeric: "tabular-nums" }}>
                <text x={28} y={36} fill={INK_STRUCTURE} fontWeight="600">
                    {`angle at A = ${GIVEN_ANGLE}°`}
                </text>
                <text
                    x={PARALLEL_WIDTH - 28}
                    y={36}
                    fill={matched ? ACCENT : ACCENT_TWO}
                    fontWeight="600"
                    textAnchor="end"
                >
                    {`angle at P = ${beta}°`}
                </text>
            </g>

            {/* Given line m and the transversal. */}
            <line
                x1={add(ANCHOR, scale(lineDirection, -96)).x}
                y1={add(ANCHOR, scale(lineDirection, -96)).y}
                x2={add(ANCHOR, scale(lineDirection, 470)).x}
                y2={add(ANCHOR, scale(lineDirection, 470)).y}
                stroke={INK_STRUCTURE}
                strokeWidth="2.5"
                strokeLinecap="round"
            />
            <line
                x1={add(ANCHOR, scale(transversalDirection, -34)).x}
                y1={add(ANCHOR, scale(transversalDirection, -34)).y}
                x2={add(ANCHOR, scale(transversalDirection, 292)).x}
                y2={add(ANCHOR, scale(transversalDirection, 292)).y}
                stroke={INK_STRUCTURE}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path
                d={arcPath(ANCHOR, 54, -(TRANSVERSAL_ANGLE * Math.PI) / 180, -(LINE_ANGLE * Math.PI) / 180)}
                fill="none"
                stroke={ARC}
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <Dot at={ANCHOR} label="A" labelOffset={{ x: -6, y: 26 }} />
            <text
                x={add(ANCHOR, scale(lineDirection, 452)).x}
                y={add(ANCHOR, scale(lineDirection, 452)).y + 24}
                fill={INK}
                fontSize="13"
                fontWeight="600"
                textAnchor="end"
            >
                line m
            </text>

            {/* Gap measurements — equal only when the lines are parallel. */}
            <g strokeDasharray="5 5" strokeWidth="1.5" stroke={matched ? ACCENT : ACCENT_TWO}>
                <line x1={sampleLeft.x} y1={sampleLeft.y} x2={footOnLine(sampleLeft).x} y2={footOnLine(sampleLeft).y} />
                <line
                    x1={sampleRight.x}
                    y1={sampleRight.y}
                    x2={footOnLine(sampleRight).x}
                    y2={footOnLine(sampleRight).y}
                />
            </g>
            <g fontSize="12" fontWeight="600" style={{ fontVariantNumeric: "tabular-nums" }}>
                <text
                    x={(sampleLeft.x + footOnLine(sampleLeft).x) / 2 - 12}
                    y={(sampleLeft.y + footOnLine(sampleLeft).y) / 2}
                    fill={matched ? ACCENT : ACCENT_TWO}
                    textAnchor="end"
                >
                    {cm(gapLeft)}
                </text>
                <text
                    x={(sampleRight.x + footOnLine(sampleRight).x) / 2 + 12}
                    y={(sampleRight.y + footOnLine(sampleRight).y) / 2}
                    fill={matched ? ACCENT : ACCENT_TWO}
                >
                    {cm(gapRight)}
                </text>
            </g>

            {/* The rotatable line through P. */}
            <path
                d={arcPath(
                    POINT_P,
                    46,
                    -(TRANSVERSAL_ANGLE * Math.PI) / 180,
                    -((TRANSVERSAL_ANGLE - beta) * Math.PI) / 180,
                )}
                fill="none"
                stroke={matched ? ACCENT : ACCENT_TWO}
                strokeWidth="1.8"
                strokeLinecap="round"
            />
            <line
                x1={leftEnd.x}
                y1={leftEnd.y}
                x2={rightEnd.x}
                y2={rightEnd.y}
                stroke={matched ? ACCENT : ACCENT_TWO}
                strokeWidth="3.2"
                strokeLinecap="round"
            />
            <Dot at={POINT_P} label="P" color={matched ? ACCENT : ACCENT_TWO} labelOffset={{ x: -18, y: 2 }} />

            <Handle
                at={handleAt}
                color={matched ? ACCENT : ACCENT_TWO}
                onDrag={handleDrag}
                toSvg={toSvg}
                shadowId="parallel-handle-shadow"
            />

            <text
                x={PARALLEL_WIDTH / 2}
                y={PARALLEL_HEIGHT - 12}
                fill={matched ? ACCENT : INK}
                fontSize="13"
                fontWeight={matched ? "700" : "400"}
                textAnchor="middle"
            >
                {matched ? "Angles match — the lines are parallel" : "Rotate until the two angles read the same"}
            </text>
        </svg>
    );
}

function ParallelFigure() {
    const setVar = useSetVar();
    return (
        <Figure
            id="parallel-by-copied-angle"
            onReset={() => setVar("parallelAngle", 34)}
            caption="Rotate the line through P until its angle with the transversal matches the angle at A."
        >
            <ParallelDrawing />
            <div className="px-6 pb-5">
                <FigureSlider
                    varName="parallelAngle"
                    label="Angle at P"
                    {...numberPropsFromDefinition(getVariableInfo("parallelAngle"))}
                    formatValue={(value) => `${value}°`}
                />
            </div>
            <InteractionHintSequence
                hintKey="parallel-by-copied-angle-drag"
                steps={[
                    {
                        gesture: "drag-circular",
                        label: "Rotate the line around P",
                        position: { x: "63%", y: "27%" },
                        dragPath: { type: "arc", startAngle: -20, endAngle: -50, radius: 34 },
                    },
                ]}
            />
        </Figure>
    );
}

// ── Blocks ───────────────────────────────────────────────────────────────────

export const angleBisectorBlocks: ReactElement[] = [
    <StackLayout key="layout-angle-heading" maxWidth="xl">
        <Block id="angle-heading" padding="md">
            <EditableH2 id="h2-angle-heading" blockId="angle-heading">
                Splitting an Angle, Copying an Angle
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-setup" maxWidth="xl">
        <Block id="angle-setup" padding="sm">
            <EditableParagraph id="para-angle-setup" blockId="angle-setup">
                Halving an angle sounds harder than halving a line, and it is not. Swing the
                upper arm to any angle you like and look at the two shaded triangles:{" "}
                <InlineLinkedHighlight
                    varName="bisectHighlight"
                    highlightId="equalRadii"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("bisectHighlight"))}
                >
                    VP and VQ
                </InlineLinkedHighlight>{" "}
                come from one arc, and{" "}
                <InlineLinkedHighlight
                    varName="bisectHighlight"
                    highlightId="equalArcs"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("bisectHighlight"))}
                >
                    PR and QR
                </InlineLinkedHighlight>{" "}
                come from the next pair.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-bisector-figure" maxWidth="xl">
        <Block id="angle-bisector-figure" padding="sm" hasVisualization>
            <AngleBisectorFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-reflect" maxWidth="xl">
        <Block id="angle-reflect" padding="sm">
            <EditableParagraph id="para-angle-reflect" blockId="angle-reflect">
                VR belongs to both triangles, so all three sides match and the triangles are
                congruent by SSS. Matching triangles have matching angles, which forces{" "}
                <InlineLinkedHighlight
                    varName="bisectHighlight"
                    highlightId="bisector"
                    {...linkedHighlightPropsFromDefinition(getVariableInfo("bisectHighlight"))}
                >
                    the ray VR
                </InlineLinkedHighlight>{" "}
                to split the angle into two equal halves. Nothing was measured anywhere.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-bisector-construction" maxWidth="xl">
        <Block id="angle-bisector-construction" padding="md">
            <EditableH3 id="h3-angle-bisector-construction" blockId="angle-bisector-construction">
                Construction 5 — Angle bisector
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-bisector-table" maxWidth="xl">
        <Block id="angle-bisector-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct the bisector of a given angle PVQ"] },
                    { cells: ["Given", "An angle with vertex V"] },
                    { cells: ["Step 1", "With centre V, draw an arc cutting both arms, at P and at Q"] },
                    { cells: ["Step 2", "With centre P, draw an arc inside the angle"] },
                    { cells: ["Step 3", "With the same width and centre Q, draw an arc cutting it at R"] },
                    { cells: ["Step 4", "Join V to R and extend the ray"] },
                    {
                        cells: ["Result", "VR bisects the angle, so angle PVR = angle QVR"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "The width used in Step 2 and Step 3 must be identical, and it may be different from the width used in Step 1. Any width works as long as the two arcs actually cross",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Construction 5 — two congruent triangles, folded along VR."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-copy-construction" maxWidth="xl">
        <Block id="angle-copy-construction" padding="md">
            <EditableH3 id="h3-angle-copy-construction" blockId="angle-copy-construction">
                Construction 7 — Copying a given angle
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-copy-table" maxWidth="xl">
        <Block id="angle-copy-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To copy a given angle ABC onto a new ray starting at a point D"] },
                    { cells: ["Given", "An angle ABC and a ray from D"] },
                    { cells: ["Step 1", "With centre B, draw an arc cutting the arms at P and Q"] },
                    { cells: ["Step 2", "Without changing the width, with centre D draw an arc cutting the new ray at P dash"] },
                    { cells: ["Step 3", "Open the compasses to the exact distance PQ"] },
                    { cells: ["Step 4", "With centre P dash, draw an arc cutting the second arc at Q dash"] },
                    { cells: ["Step 5", "Join D to Q dash"] },
                    {
                        cells: ["Result", "Angle P dash D Q dash equals angle ABC"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "Triangles BPQ and D P dash Q dash have three matching sides, so they are congruent and the angles at B and D must be equal. This is the only way to move an angle without a protractor",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Construction 7 — carrying an angle across the page by carrying three lengths."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-parallel-setup" maxWidth="xl">
        <Block id="angle-parallel-setup" padding="sm">
            <EditableParagraph id="para-angle-parallel-setup" blockId="angle-parallel-setup">
                Copying an angle is the whole secret to drawing a parallel. Rotate the line
                through P below, and keep an eye on the two dashed gaps down to line m as the
                angle at P changes.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-parallel-figure" maxWidth="xl">
        <Block id="angle-parallel-figure" padding="sm" hasVisualization>
            <ParallelFigure />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-parallel-reflect" maxWidth="xl">
        <Block id="angle-parallel-reflect" padding="sm">
            <EditableParagraph id="para-angle-parallel-reflect" blockId="angle-parallel-reflect">
                The two gaps only agree at one setting, and it is the setting where both angles
                read 56 degrees. Equal corresponding angles mean parallel lines, so copying the
                angle at A up to P is all the work there is.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-parallel-construction" maxWidth="xl">
        <Block id="angle-parallel-construction" padding="md">
            <EditableH3 id="h3-angle-parallel-construction" blockId="angle-parallel-construction">
                Construction 6 — Parallel line through a given point
            </EditableH3>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-parallel-table" maxWidth="xl">
        <Block id="angle-parallel-table" padding="sm">
            <Table
                columns={[{ header: "", width: 120, align: "left" }, { header: "" }]}
                showHeader={false}
                rows={[
                    { cells: ["Objective", "To construct the line through a point P that is parallel to a given line m"] },
                    { cells: ["Given", "A line m and a point P not on m"] },
                    { cells: ["Step 1", "Draw any straight line through P that cuts m, meeting it at A"] },
                    { cells: ["Step 2", "Copy the angle at A onto the same transversal at P, using Construction 7"] },
                    { cells: ["Step 3", "Draw the new arm fully across the page"] },
                    {
                        cells: ["Result", "The new line passes through P and is parallel to m"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                    {
                        cells: [
                            "Notes",
                            "The copied angle must open the same way as the original, otherwise the new line slopes towards m instead of running beside it. A second route is to drop a perpendicular from P to m and then raise a perpendicular to that at P",
                        ],
                    },
                ]}
                color="#62D0AD"
                caption="Construction 6 — a copied angle, and the two lines can never meet."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-question-half" maxWidth="xl">
        <Block id="angle-question-half" padding="md">
            <EditableParagraph id="para-angle-question-half" blockId="angle-question-half">
                An angle of 138 degrees is bisected, and then one of the halves is bisected
                again. The smallest angle you now have measures{" "}
                <InlineFeedback
                    varName="answerAngleQuarter"
                    correctValue="34.5"
                    position="terminal"
                    successMessage="— exactly. Half of 138 is 69, and half of 69 is 34.5 degrees"
                    failureMessage="— close."
                    hint="Bisect once to get 69 degrees, then bisect that"
                >
                    <InlineClozeChoice
                        varName="answerAngleQuarter"
                        correctAnswer="34.5"
                        options={["34.5", "69", "27.6", "46"]}
                        {...choicePropsFromDefinition(getVariableInfo("answerAngleQuarter"))}
                    />
                </InlineFeedback>
                {" "}degrees.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-angle-question-proof" maxWidth="xl">
        <Block id="angle-question-proof" padding="md">
            <EditableParagraph id="para-angle-question-proof" blockId="angle-question-proof">
                In the bisector figure, the reason the two triangles must be congruent is{" "}
                <InlineFeedback
                    varName="answerAngleCongruence"
                    correctValue="SSS, because all three sides match"
                    position="terminal"
                    successMessage="— right. Two arc widths give two pairs of equal sides, and VR is shared, so SSS applies"
                    failureMessage="— not that one."
                    hint="Count what the construction actually guarantees: lengths, or angles?"
                    visualizationHint={{
                        blockId: "angle-bisector-figure",
                        hintKey: "angle-congruence-hint",
                        steps: [
                            {
                                gesture: "drag-circular",
                                label: "Swing the arm wide open and check the side readouts still match",
                                position: { x: "26%", y: "34%" },
                                completionVar: "bisectAngle",
                                completionValue: 120,
                                completionTolerance: 18,
                            },
                        ],
                        label: "Discover it yourself",
                        resetVars: { bisectAngle: 68, bisectRadius: 130 },
                    }}
                >
                    <InlineClozeChoice
                        varName="answerAngleCongruence"
                        correctAnswer="SSS, because all three sides match"
                        options={[
                            "SSS, because all three sides match",
                            "SAS, because the angle at V is shared",
                            "ASA, because two angles are equal",
                        ]}
                        {...choicePropsFromDefinition(getVariableInfo("answerAngleCongruence"))}
                    />
                </InlineFeedback>
                .
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
