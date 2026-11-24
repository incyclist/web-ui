import React from 'react';
import {
    Heading, SubtleText, WorkoutCardShell,
    renderListGraph, renderTileGraph
} from '../base/atoms';

export const WorkoutSummary = (props) => {
    const {
        title = props?.workout?.title,
        workout,
        ftp = 200,
        duration,
        canDelete = true,
        category,
        layout = 'tiles',
        width,
        height,
        onOK,
        onDelete
    } = props;

    const list = layout === 'list';
    const titleStr = typeof title === 'string' ? title : '';
    const showDuration = typeof duration === 'string' && duration !== '';

    return (
        <WorkoutCardShell
            list={list}
            ariaLabel={`Workout ${titleStr || 'Untitled'}`}
            width={width}
            height={height}
            title={titleStr}
            disabled={!workout}
            canDelete={canDelete}
            onOK={onOK}
            onDelete={onDelete}
            preview={renderTileGraph(workout, ftp)}
            identity={
                <>
                    <Heading $list={list} title={titleStr}>{titleStr}</Heading>
                    {list && category ? <SubtleText $list>{category}</SubtleText> : null}
                </>
            }
            stats={showDuration ? <div><strong>{duration}</strong><small>Duration</small></div> : null}
            profile={renderListGraph(workout, ftp, titleStr)}
        />
    );
};
