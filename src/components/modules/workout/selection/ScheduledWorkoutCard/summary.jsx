import React from 'react';
import {
    Heading, SubtleText, TodayText, WorkoutCardShell,
    renderListGraph, renderTileGraph
} from '../base/atoms';

export const ScheduledWorkoutSummary = (props) => {
    const {
        title = props?.workout?.title,
        workout,
        ftp = 200,
        duration,
        date,
        isToday,
        category,
        layout = 'tiles',
        width,
        height,
        onOK
    } = props;

    const list = layout === 'list';
    const today = !!isToday;
    const titleStr = typeof title === 'string' ? title : '';
    const showDuration = typeof duration === 'string' && duration !== '';

    const parsedDate = date instanceof Date ? date : (date ? new Date(date) : null);
    const validDate = Boolean(parsedDate && !Number.isNaN(parsedDate.getTime()));
    const showDate = today || validDate;
    const dateStr = validDate ? parsedDate.toLocaleDateString() : '';

    return (
        <WorkoutCardShell
            list={list}
            today={today}
            ariaLabel={`Scheduled workout ${titleStr || 'Untitled'}`}
            width={width}
            height={height}
            title={titleStr}
            disabled={!workout}
            onOK={onOK}
            preview={renderTileGraph(workout, ftp)}
            identity={
                <>
                    <Heading $list={list} title={titleStr}>{titleStr}</Heading>
                    {list && category ? <SubtleText $list>{category}</SubtleText> : null}
                </>
            }
            stats={
                <>
                    {showDuration ? <div><strong>{duration}</strong><small>Duration</small></div> : <div />}
                    {showDate ? (
                        <div>
                            <strong>{today ? <TodayText>Today</TodayText> : dateStr}</strong>
                            <small>Date</small>
                        </div>
                    ) : <div />}
                </>
            }
            profile={renderListGraph(workout, ftp, titleStr)}
        />
    );
};
