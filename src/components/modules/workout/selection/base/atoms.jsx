import React from "react";
import styled, { css } from "styled-components";
import { ArrowRightIcon, TrashIcon } from "@primer/octicons-react";
import { EventLogger } from "gd-eventlog";
import { AppThemeProvider } from "../../../../../theme";
import { Button, Loader } from "../../../../atoms";
import { WorkoutGraph } from "../../../../molecules";

export const TILE_WIDTH = 280;
export const TILE_HEIGHT = 320;

const formatSize = (value) => {
    if (typeof value === "number") return `${value}px`;
    if (typeof value === "string") return value;
    return undefined;
};

const listGridStyles = css`
    display: grid;
    grid-template-columns: minmax(0, 1.6fr) 220px minmax(150px, 1fr) 142px;
    align-items: center;
    gap: 12px;
    height: 84px;
    min-height: 84px;
    padding: 8px 12px;
    @media (max-width: 1100px) {
        height: 112px;
        min-height: 112px;
        grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
        grid-template-rows: 1fr 1fr;
        gap: 0 12px;
        > :first-child { grid-column: 1; grid-row: 1; }
        > :nth-child(2) { grid-column: 1; grid-row: 2; }
        > :nth-child(3) { grid-column: 2; grid-row: 1; }
        > :nth-child(4) { grid-column: 2; grid-row: 2; justify-self: end; }
    }
    @media (max-width: 650px) {
        height: auto;
        min-height: 184px;
        grid-template-columns: 1fr;
        grid-template-rows: auto auto auto auto;
        gap: 6px;
        > :first-child { grid-column: 1; grid-row: 1; }
        > :nth-child(2) { grid-column: 1; grid-row: 2; }
        > :nth-child(3) { grid-column: 1; grid-row: 3; }
        > :nth-child(4) { grid-column: 1; grid-row: 4; justify-self: stretch; }
    }
`;

export const Surface = styled.article`
    position: relative;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    width: ${p => p.$list ? "100%" : (p.$width || "100%")};
    height: ${p => p.$list ? "84px" : (p.$height || "100%")};
    overflow: hidden;
    border-radius: 12px;
    background: ${p => p.theme?.card?.background};
    border: 1px solid ${p => p.$today ? p.theme?.card?.highlightBorder : p.theme?.card?.border};
    ${p => p.$today && css`
        border-left: 4px solid ${p.theme?.card?.highlightAccent};
        box-shadow: 0 4px 18px ${p.theme?.card?.highlightGlow};
    `}
    color: ${p => p.theme?.card?.text};
    text-align: left;
    font-family: inherit;
    cursor: pointer;
    isolation: isolate;
    &:hover, &:focus-within { border-color: ${p => p.theme?.card?.hoverBorder}; }
    &:focus-visible { outline: 3px solid ${p => p.theme?.card?.focusOutline}; outline-offset: -3px; }
    button { font-family: inherit; cursor: pointer; }
    button:focus-visible { outline: 3px solid ${p => p.theme?.card?.focusOutline}; outline-offset: 2px; }
    button:disabled { cursor: default; opacity: .5; }
    ${p => p.$list && listGridStyles}
`;

const SkeletonSurface = styled.div`
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: ${p => p.$list ? "84px" : "100%"};
    overflow: hidden;
    border-radius: 12px;
    border: 1px solid ${p => p.theme?.card?.border};
    background: ${p => p.theme?.card?.background};
    &::before {
        content: "";
        position: absolute;
        ${p => p.$list ? css`
            top: 18px;
            left: 14px;
            width: min(36%, 240px);
            height: 15px;
            border-radius: 4px;
            background: ${p.theme?.card?.skeletonBackground};
            box-shadow: 0 24px 0 -3px ${p.theme?.card?.skeletonBackground};
        ` : css`
            inset: 0 0 auto 0;
            height: 132px;
            background: ${p.theme?.card?.previewBackground};
        `}
    }
    ${p => p.$list && css`
        @media (max-width: 1100px) { height: 112px; }
        @media (max-width: 650px) { height: 184px; }
    `}
`;

export const WorkoutCardSkeleton = ({ list = false }) => (
    <AppThemeProvider>
        <SkeletonSurface $list={list} data-testid="workout-card-skeleton" aria-hidden="true" />
    </AppThemeProvider>
);

export const Preview = styled.div`
    position: relative;
    width: 100%;
    height: 132px;
    flex-shrink: 0;
    overflow: hidden;
    background: ${p => p.theme?.card?.previewBackground};
    box-sizing: border-box;
    padding: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const Body = styled.div`
    display: flex;
    flex: 1;
    flex-direction: column;
    padding: 11px 12px;
    gap: 8px;
    min-height: 0;
`;

export const Identity = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 4px;
    min-width: 0;
`;

export const Heading = styled.h3`
    font-size: 17px;
    line-height: 1.2;
    font-weight: 650;
    margin: 0;
    min-height: 39px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    overflow-wrap: anywhere;
    ${p => p.$list && css`
        display: block;
        min-height: 0;
        white-space: nowrap;
        text-overflow: ellipsis;
    `}
`;

export const SubtleText = styled.div`
    font-size: 12px;
    color: ${p => p.theme?.card?.subtleText};
    line-height: 1.35;
    ${p => p.$list && css`
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    `}
`;

export const Stats = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    min-width: 0;
    strong { display: block; font-size: 20px; font-weight: 650; letter-spacing: -.5px; white-space: nowrap; }
    small { display: block; margin-top: 3px; font-size: 11px; color: ${p => p.theme?.card?.subtleText}; }
    ${p => p.$list && css`
        gap: 8px;
        strong { font-size: 17px; }
        small { margin-top: 1px; font-size: 10px; }
    `}
`;

export const TodayText = styled.span`
    color: ${p => p.theme?.card?.highlightAccent};
    font-weight: 700;
`;

export const Profile = styled.div`
    min-width: 0;
    height: 60px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    small { display: block; margin-top: 3px; font-size: 10px; color: ${p => p.theme?.card?.mutedText}; }
`;

export const Chart = styled.div`
    width: 100%;
    height: 44px;
    overflow: hidden;
    pointer-events: none;
`;

export const WorkoutGraphBox = styled.div`
    width: 100%;
    height: 100%;
    pointer-events: none;
`;

export const Actions = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    margin-top: auto;
    padding-top: 2px;
    ${p => p.$list && css`
        width: 142px;
        margin: 0;
        padding: 0;
        justify-content: flex-end;
        @media (max-width: 650px) { width: 100%; }
    `}
`;

export const OpenButton = styled(Button)`
    flex: 1 1 auto;
    min-width: 0;
    white-space: nowrap;
`;

export const DeleteButton = styled.button`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 38px;
    height: 38px;
    border: 1px solid ${p => p.theme?.card?.actionBorder};
    border-radius: 8px;
    background: ${p => p.theme?.button?.secondary?.background};
    color: ${p => p.theme?.button?.secondary?.text};
    &:hover { background: ${p => p.theme?.button?.hover?.background}; }
`;

export const CreateLogoBox = styled.div`
    background: ${p => p.theme?.card?.logoSurface};
    border-radius: 8px;
    padding: ${p => p.$list ? "6px 10px" : "10px 16px"};
    display: flex;
    align-items: center;
    justify-content: center;
    width: ${p => p.$list ? "100%" : "80%"};
    max-width: ${p => p.$list ? "140px" : "200px"};
    height: ${p => p.$list ? "42px" : "64px"};
    box-sizing: border-box;
    img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
    }
`;

export const LoaderContainer = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export const renderTileGraph = (workout, ftp) => (
    workout
        ? <WorkoutGraphBox><WorkoutGraph workout={workout} dashboard ftp={ftp} /></WorkoutGraphBox>
        : <LoaderContainer><Loader size={26} /></LoaderContainer>
);

export const renderListGraph = (workout, ftp, title) => (
    workout ? (
        <>
            <Chart role="img" aria-label={`Power profile for ${title}`}>
                <WorkoutGraphBox><WorkoutGraph workout={workout} dashboard ftp={ftp} /></WorkoutGraphBox>
            </Chart>
            <small>Power profile</small>
        </>
    ) : <small>Power profile unavailable</small>
);

export const WorkoutCardShell = ({
    list = false,
    today = false,
    extraClassName,
    ariaLabel,
    width,
    height,
    title = "",
    buttonText = "View details",
    listButtonText = "Details",
    buttonAriaLabel,
    disabled = false,
    canDelete = false,
    onOK,
    onDelete,
    preview,
    identity,
    stats,
    profile
}) => {
    const logger = new EventLogger("Incyclist");
    const baseClass = list ? "workout-card workout-list-item" : "workout-card";
    const className = extraClassName ? `${baseClass} ${extraClassName}` : baseClass;

    const activate = (e) => {
        if (disabled) return;
        onOK?.(e);
    };

    const handleCardClick = (e) => {
        if (disabled) return;
        logger.logEvent({ message: "tile clicked", tile: title, eventSource: "user" });
        activate(e);
    };

    const handleKeyDown = (e) => {
        if (e.target === e.currentTarget && ["Enter", " "].includes(e.key)) {
            e.preventDefault();
            if (disabled) return;
            logger.logEvent({ message: "key pressed", key: e.key, tile: title, eventSource: "user" });
            activate(e);
        }
    };

    const handleDeleteClick = (e) => {
        logger.logEvent({ message: "button clicked", button: "delete", tile: title, eventSource: "user" });
        e.stopPropagation();
        onDelete?.(e);
    };

    const actionText = list ? listButtonText : buttonText;
    const actionLabel = buttonAriaLabel ?? `View details for ${title || "workout"}`;

    const actions = (
        <>
            <OpenButton responsive shape="rounded" primary no3D type="button" text={actionText}
                disabled={disabled} logContext={{ title }} aria-label={actionLabel}
                onClick={e => { e?.stopPropagation?.(); activate(e); }}>
                <ArrowRightIcon size={16} />
            </OpenButton>
            {canDelete && onDelete ? (
                <DeleteButton type="button" id="delete" aria-label={`Delete ${title || "workout"}`}
                    onClick={handleDeleteClick}>
                    <TrashIcon size={17} />
                </DeleteButton>
            ) : null}
        </>
    );

    if (list) {
        return (
            <AppThemeProvider>
                <Surface $list $today={today} className={className} aria-label={ariaLabel} tabIndex={0}
                    onClick={handleCardClick} onKeyDown={handleKeyDown}>
                    <Identity>{identity}</Identity>
                    <Stats $list>{stats}</Stats>
                    <Profile>{profile}</Profile>
                    <Actions $list>{actions}</Actions>
                </Surface>
            </AppThemeProvider>
        );
    }

    return (
        <AppThemeProvider>
            <Surface $today={today} $width={formatSize(width)} $height={formatSize(height)}
                className={className} aria-label={ariaLabel} tabIndex={0}
                onClick={handleCardClick} onKeyDown={handleKeyDown}>
                <Preview>{preview}</Preview>
                <Body>
                    <Identity>{identity}</Identity>
                    {stats ? <Stats>{stats}</Stats> : null}
                    <Actions>{actions}</Actions>
                </Body>
            </Surface>
        </AppThemeProvider>
    );
};
