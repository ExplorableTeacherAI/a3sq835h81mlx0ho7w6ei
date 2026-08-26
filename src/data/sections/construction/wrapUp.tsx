import { type ReactElement } from "react";
import { StackLayout } from "@/components/layouts";
import { Block } from "@/components/templates";
import { EditableH2, EditableParagraph } from "@/components/atoms";

export const wrapUpBlocks: ReactElement[] = [
    <StackLayout key="layout-wrapup-heading" maxWidth="xl">
        <Block id="wrapup-heading" padding="md">
            <EditableH2 id="h2-wrapup-heading" blockId="wrapup-heading">
                Wrapping Up
            </EditableH2>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-tools" maxWidth="xl">
        <Block id="wrapup-tools" padding="sm">
            <EditableParagraph id="para-wrapup-tools" blockId="wrapup-tools">
                So the rope and the two pegs were never a trick. A pair of compasses can carry
                exactly one thing across a page, a distance, and every construction in this note
                is a way of spending that single ability.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-thread" maxWidth="xl">
        <Block id="wrapup-thread" padding="sm">
            <EditableParagraph id="para-wrapup-thread" blockId="wrapup-thread">
                Two arcs of equal width meet where the distances match, and that one fact gave
                you the perpendicular bisector, the midpoint, both perpendiculars, the bisected
                angle, the copied angle and the parallel. Step a single width around its own
                circle and it closes after six, which handed you 60 degrees and, by halving,
                every other mark on the dial. Even the tangents turned out to be a perpendicular
                to a radius in disguise.
            </EditableParagraph>
        </Block>
    </StackLayout>,

    <StackLayout key="layout-wrapup-next" maxWidth="xl">
        <Block id="wrapup-next" padding="sm">
            <EditableParagraph id="para-wrapup-next" blockId="wrapup-next">
                That is why a construction is marked with its arcs still showing, because the
                arcs are the argument rather than the mess. Next comes loci, where instead of
                hunting for the one point equally far from A and B you keep every one of them.
                The reasoning is the same, and this time it draws whole regions.
            </EditableParagraph>
        </Block>
    </StackLayout>,
];
