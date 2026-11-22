import React from 'react';
import { Image } from '../../../../atoms';
import {
    CreateLogoBox, Heading, SubtleText, WorkoutCardShell
} from '../base/atoms';

const DEFAULT_TITLE = 'Create Workout';
const CREATE_DESCRIPTION = 'Create or pick a workout on ZwoFactory, download it and import it here.';

export const CreateSummary = ({
    title = DEFAULT_TITLE,
    layout = 'tiles',
    width,
    height,
    onOK
}) => {
    const list = layout === 'list';
    const titleStr = typeof title === 'string' ? title : DEFAULT_TITLE;

    return (
        <WorkoutCardShell
            list={list}
            extraClassName='workout-create-card'
            ariaLabel={titleStr}
            width={width}
            height={height}
            title={titleStr}
            disabled={false}
            onOK={onOK}
            preview={
                <CreateLogoBox>
                    <Image width='100%' src='images/zwofactory.svg' alt='ZwoFactory' />
                </CreateLogoBox>
            }
            identity={
                <>
                    <Heading $list={list} title={titleStr}>{titleStr}</Heading>
                    <SubtleText $list={list}>{CREATE_DESCRIPTION}</SubtleText>
                </>
            }
            stats={list ? <div><strong>ZwoFactory</strong><small>External editor</small></div> : null}
            profile={
                <CreateLogoBox $list>
                    <Image width='100%' src='images/zwofactory.svg' alt='ZwoFactory' />
                </CreateLogoBox>
            }
        />
    );
};
