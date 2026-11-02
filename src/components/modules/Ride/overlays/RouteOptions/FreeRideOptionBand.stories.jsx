import React from 'react';
import { FreeRideOptionBand } from './FreeRideOptionBand';

export default {
    component: FreeRideOptionBand,
    title: 'modules/ride/overlays/FreeRideOptionBand',
    argTypes: { onOptionSelected: { action: 'onOptionSelected' } },
    decorators: [
        (Story) => (
            // the ride page is a size container; --u is derived from it
            <div style={{ position: 'relative', width: '1280px', height: '720px', background: '#445', containerType: 'size' }}>
                <Story />
            </div>
        )
    ]
};

const opt = (id, props) => ({ id, color: 'royalblue', direction: 0, maneuver: 'straight', maneuverText: 'Straight', roadLabel: 'Unnamed road', selected: false, degraded: false, ...props });
const left = opt('l', { direction: -80, maneuver: 'left', maneuverText: 'Left', roadLabel: 'Via del Mar', color: 'red' });
const straight = opt('s', { selected: true, selectedBy: 'auto', roadLabel: 'South Ocean Boulevard', color: 'purple' });
const right = opt('r', { direction: 80, maneuver: 'right', maneuverText: 'Right', color: 'orange' });

export const TwoOptions = { args: { options: [left, straight], optionsState: 'ready', distance: '70m' } };
export const ThreeOptionsNear = { args: { options: [left, straight, right], optionsState: 'ready', distance: '20m', isNearby: true } };
export const PickedByRider = { args: { options: [{ ...left, selected: true, selectedBy: 'user' }, { ...straight, selected: false, selectedBy: undefined }], optionsState: 'ready', distance: '40m' } };
export const SixOptions = { args: { options: ['a', 'b', 'c', 'd', 'e', 'f'].map((id, i) => opt(id, { maneuver: 'roundabout', maneuverText: 'Roundabout', roadLabel: `Roundabout, exit ${i + 1}`, selected: i === 0, selectedBy: i === 0 ? 'auto' : undefined })), optionsState: 'ready', distance: '70m' } };
export const SingleWayOn = { args: { options: [straight], optionsState: 'ready', distance: '70m' } };
export const AutoHidden = { args: { options: [left, straight], optionsState: 'ready', distance: '70m', hidden: true } };
export const Loading = { args: { options: [], optionsState: 'loading' } };
export const LoadingNearJunction = { args: { options: [], optionsState: 'loading', distance: '20m' } };
export const Failed = { args: { options: [], optionsState: 'failed' } };
