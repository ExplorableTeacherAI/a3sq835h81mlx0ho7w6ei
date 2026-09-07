import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH1, EditableH2, EditableParagraph, InlineTooltip, Table } from "@/components/atoms";

export const introBlocks: ReactElement[] = [
    <StackLayout key="layout-intro-title" maxWidth="xl">
        <Block id="intro-title" padding="md">
            <EditableH1 id="h1-intro-title" blockId="intro-title">
                Geometric Construction
            </EditableH1>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-hook" maxWidth="xl">
        <Block id="intro-hook" padding="sm">
            <EditableParagraph id="para-intro-hook" blockId="intro-hook">
                Long before anyone printed millimetres onto a ruler, builders laid out
                perfectly square corners using nothing but a rope and two pegs. They were
                not measuring. They were letting equal distances do the work, and the
                corner came out exact every time.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-promise" maxWidth="xl">
        <Block id="intro-promise" padding="sm">
            <EditableParagraph id="para-intro-promise" blockId="intro-promise">
                That rope is your pair of compasses. Over the next few pages you will meet
                fifteen constructions, and you will see that every single one runs on the
                same idea you already know: every point on a circle sits the same distance
                from its centre. Keep two more facts close by, because you will need them
                as proof: triangles with matching sides are{" "}
                <InlineTooltip
                    id="tooltip-intro-congruent"
                    tooltip="Congruent triangles are identical in every side and every angle, so anything true of one is true of the other."
                >
                    congruent
                </InlineTooltip>
                , and an{" "}
                <InlineTooltip
                    id="tooltip-intro-isosceles"
                    tooltip="An isosceles triangle has two equal sides, and the two angles opposite those sides are equal too."
                >
                    isosceles
                </InlineTooltip>{" "}
                triangle has equal base angles.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-drawing-heading" maxWidth="xl">
        <Block id="intro-drawing-heading" padding="md">
            <EditableH2 id="h2-intro-drawing-heading" blockId="intro-drawing-heading">
                Drawing or construction?
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-drawing-table" maxWidth="xl">
        <Block id="intro-drawing-table" padding="sm">
            <Table
                columns={[
                    { header: "", width: 150, align: "left" },
                    { header: "Ordinary drawing" },
                    { header: "Geometric construction" },
                ]}
                rows={[
                    { cells: ["Tools", "Ruler, protractor, anything to hand", "Straightedge and compasses only"] },
                    { cells: ["Method", "Measure a number, then copy it", "Transfer distances with arcs"] },
                    { cells: ["Accuracy", "As good as your eyes and the scale", "Exact by geometry, whatever the size"] },
                    { cells: ["Evidence", "Nothing left to check", "The arcs stay on the page as proof"] },
                    {
                        cells: ["Marked correct?", "Not accepted as a construction", "Accepted, arcs included"],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                ]}
                color="#62D0AD"
                caption="Measuring a length with a ruler is a drawing, not a construction."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-tools-heading" maxWidth="xl">
        <Block id="intro-tools-heading" padding="md">
            <EditableH2 id="h2-intro-tools-heading" blockId="intro-tools-heading">
                Your instruments
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-tools-table" maxWidth="xl">
        <Block id="intro-tools-table" padding="sm">
            <Table
                columns={[
                    { header: "Instrument", width: 170, align: "left" },
                    { header: "What it is for" },
                    { header: "Using it well" },
                ]}
                rows={[
                    {
                        cells: [
                            "Straightedge",
                            "Joining two points with a straight line",
                            "Use the edge only. Ignore the numbers even if it is a ruler",
                        ],
                    },
                    {
                        cells: [
                            "Pair of compasses",
                            "Drawing circles and carrying one distance to another place",
                            "Tighten the hinge, press the point in firmly, turn the paper rather than your wrist",
                        ],
                    },
                    {
                        cells: [
                            "Pencil",
                            "Drawing thin, honest lines",
                            "Sharpen to a fine point and keep it hard, around 2H, so lines stay thin",
                        ],
                    },
                    {
                        cells: [
                            "Protractor",
                            "Checking an angle after the construction",
                            "For checking only. An angle you constructed must not be set with a protractor",
                        ],
                    },
                ]}
                color="#8E90F5"
                caption="A construction is finished with two tools. The protractor only marks it."
            />
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-terms-heading" maxWidth="xl">
        <Block id="intro-terms-heading" padding="md">
            <EditableH2 id="h2-intro-terms-heading" blockId="intro-terms-heading">
                The words you need
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-intro-terms-table" maxWidth="xl">
        <Block id="intro-terms-table" padding="sm">
            <Table
                columns={[
                    { header: "Term", width: 210, align: "left" },
                    { header: "Meaning" },
                ]}
                rows={[
                    { cells: ["Line", "Straight, endless in both directions"] },
                    { cells: ["Line segment", "The straight piece between two endpoints, such as AB"] },
                    { cells: ["Ray", "Starts at one point and runs on forever in one direction"] },
                    { cells: ["Midpoint", "The point of a segment with equal distance to each endpoint"] },
                    { cells: ["Perpendicular lines", "Two lines meeting at 90 degrees"] },
                    { cells: ["Parallel lines", "Two lines in a plane that stay the same distance apart and never meet"] },
                    { cells: ["Bisect", "To cut exactly into two equal parts"] },
                    { cells: ["Angle bisector", "The ray from a vertex that cuts the angle into two equal angles"] },
                    {
                        cells: [
                            "Perpendicular bisector",
                            "The line that cuts a segment in half and crosses it at 90 degrees",
                        ],
                        highlight: true,
                        highlightColor: "#62D0AD",
                    },
                ]}
                color="#62D0AD"
                caption="The last row is where the next section begins."
            />
        </Block>
    </StackLayout>,
];
