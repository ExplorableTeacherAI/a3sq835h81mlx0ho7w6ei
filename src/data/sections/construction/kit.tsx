/**
 * Shared toolkit for the geometric-construction figures.
 *
 * Every construction figure in this lesson draws on white ground with the same
 * ink palette, the same two stroke weights, and the same draggable-handle
 * affordance, so students learn one visual language and reuse it fifteen times.
 */

import React, { useRef, useState } from "react";
import { useSpring, type Vec2 } from "@/lib/motion";

// ── Palette (FIGURE_DESIGN_LANGUAGE: ink + paper + ONE accent) ───────────────

export const INK = "#334155";          // labels
export const INK_STRUCTURE = "#64748B"; // given lines, outlines
export const INK_QUIET = "#CBD5E1";     // ticks, guides
export const PAPER = "#F8FAFC";
export const ACCENT = "#62D0AD";        // the manipulable / constructed thing
export const ACCENT_TWO = "#8E90F5";    // the covariation partner
export const ARC = "#AC8BF9";           // compass arcs (the evidence)
export const WARN = "#F7B23B";

// ── Geometry helpers ─────────────────────────────────────────────────────────

export const dist = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);
export const mid = (a: Vec2, b: Vec2): Vec2 => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const scale = (a: Vec2, k: number): Vec2 => ({ x: a.x * k, y: a.y * k });
export const norm = (a: Vec2): Vec2 => {
    const l = Math.hypot(a.x, a.y) || 1;
    return { x: a.x / l, y: a.y / l };
};
export const angleOf = (a: Vec2): number => Math.atan2(a.y, a.x);
export const fromAngle = (theta: number, r: number): Vec2 => ({
    x: Math.cos(theta) * r,
    y: Math.sin(theta) * r,
});

/** The two intersection points of circles (c1, r1) and (c2, r2), or null. */
export function circleIntersections(c1: Vec2, r1: number, c2: Vec2, r2: number): [Vec2, Vec2] | null {
    const d = dist(c1, c2);
    if (d === 0 || d > r1 + r2 || d < Math.abs(r1 - r2)) return null;
    const a = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const hSquared = r1 * r1 - a * a;
    if (hSquared < 0) return null;
    const h = Math.sqrt(hSquared);
    const base = add(c1, scale(norm(sub(c2, c1)), a));
    const dir = norm(sub(c2, c1));
    const perp = { x: -dir.y, y: dir.x };
    return [add(base, scale(perp, h)), add(base, scale(perp, -h))];
}

/** Arc path from angle a0 to a1 (radians, SVG y-down) around centre c. */
export function arcPath(c: Vec2, r: number, a0: number, a1: number): string {
    const start = add(c, fromAngle(a0, r));
    const end = add(c, fromAngle(a1, r));
    let sweep = a1 - a0;
    while (sweep < 0) sweep += Math.PI * 2;
    const largeArc = sweep > Math.PI ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/** Extend a segment through both ends so it reads as an infinite line. */
export function extendLine(a: Vec2, b: Vec2, by: number): [Vec2, Vec2] {
    const d = norm(sub(b, a));
    return [add(a, scale(d, -by)), add(b, scale(d, by))];
}

// ── Pointer → viewBox coordinates ────────────────────────────────────────────

export function useSvgPointer(width: number, height: number) {
    const svgRef = useRef<SVGSVGElement>(null);
    const toSvg = (event: React.PointerEvent): Vec2 => {
        const svg = svgRef.current;
        if (!svg) return { x: 0, y: 0 };
        const rect = svg.getBoundingClientRect();
        return {
            x: ((event.clientX - rect.left) / rect.width) * width,
            y: ((event.clientY - rect.top) / rect.height) * height,
        };
    };
    return { svgRef, toSvg };
}

// ── Draggable handle ─────────────────────────────────────────────────────────

export interface HandleProps {
    at: Vec2;
    color?: string;
    radius?: number;
    label?: string;
    labelOffset?: Vec2;
    onDrag: (point: Vec2) => void;
    toSvg: (event: React.PointerEvent) => Vec2;
    shadowId: string;
}

/** Accent circle with soft shadow, spring hover-scale and a 26px hit area. */
export const Handle: React.FC<HandleProps> = ({
    at,
    color = ACCENT,
    radius = 11,
    label,
    labelOffset = { x: 0, y: -22 },
    onDrag,
    toSvg,
    shadowId,
}) => {
    const [dragging, setDragging] = useState(false);
    const [hovered, setHovered] = useState(false);
    const scaleValue = useSpring(dragging || hovered ? 1.18 : 1, { stiffness: 400, damping: 26 });

    return (
        <g>
            <g transform={`translate(${at.x} ${at.y}) scale(${scaleValue})`}>
                <circle r={radius} fill={color} filter={`url(#${shadowId})`} />
            </g>
            {label && (
                <text
                    x={at.x + labelOffset.x}
                    y={at.y + labelOffset.y}
                    fill={INK}
                    fontSize="13"
                    fontWeight="600"
                    textAnchor="middle"
                >
                    {label}
                </text>
            )}
            <circle
                cx={at.x}
                cy={at.y}
                r={26}
                fill="transparent"
                style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "none" }}
                onPointerDown={(event) => {
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setDragging(true);
                }}
                onPointerMove={(event) => {
                    if (!dragging) return;
                    onDrag(toSvg(event));
                }}
                onPointerUp={() => setDragging(false)}
                onPointerCancel={() => setDragging(false)}
                onPointerEnter={() => setHovered(true)}
                onPointerLeave={() => setHovered(false)}
            />
        </g>
    );
};

/** Soft shadow filter — draggable elements only. */
export const HandleShadow: React.FC<{ id: string }> = ({ id }) => (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0F172A" floodOpacity="0.25" />
    </filter>
);

// ── Fixed (non-draggable) marked point ───────────────────────────────────────

export const Dot: React.FC<{
    at: Vec2;
    label?: string;
    color?: string;
    radius?: number;
    labelOffset?: Vec2;
    opacity?: number;
}> = ({ at, label, color = INK_STRUCTURE, radius = 4.5, labelOffset = { x: 0, y: -13 }, opacity = 1 }) => (
    <g opacity={opacity}>
        <circle cx={at.x} cy={at.y} r={radius} fill={color} />
        {label && (
            <text
                x={at.x + labelOffset.x}
                y={at.y + labelOffset.y}
                fill={INK}
                fontSize="13"
                fontWeight="600"
                textAnchor="middle"
            >
                {label}
            </text>
        )}
    </g>
);

/** Small square drawn in the corner at `at`, between directions d1 and d2. */
export const RightAngleMark: React.FC<{ at: Vec2; d1: Vec2; d2: Vec2; size?: number; color?: string }> = ({
    at,
    d1,
    d2,
    size = 13,
    color = INK_STRUCTURE,
}) => {
    const u = scale(norm(d1), size);
    const v = scale(norm(d2), size);
    const p1 = add(at, u);
    const p2 = add(add(at, u), v);
    const p3 = add(at, v);
    return (
        <polyline
            points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
            fill="none"
            stroke={color}
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    );
};

/** Pixels per "centimetre" used by every construction figure's readouts. */
export const PX_PER_CM = 26;
export const cm = (px: number): string => `${(px / PX_PER_CM).toFixed(1)} cm`;
/** The same length for KaTeX (braces kept out of \clr and \highlight arguments). */
export const cmLatex = (px: number): string => `${(px / PX_PER_CM).toFixed(1)}\\,\\text{cm}`;
export const deg = (radians: number): string => `${Math.round((radians * 180) / Math.PI)}°`;
