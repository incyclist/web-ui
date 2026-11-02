import React from 'react';
import { FreeRideOptionButton } from './FreeRideOption';

export default {
    component: FreeRideOptionButton,
    title: 'Molecules/Buttons/FreeRide',
    decorators: [
        (Story) => (
            <div style={{ '--u': '14.8px', background: '#555', padding: 40, display: 'flex' }}>
                <Story />
            </div>
        )
    ]
};

const base = { id: 'a', color: 'royalblue', direction: -60, maneuver: 'slight-left', maneuverText: 'Slight left', roadLabel: 'Via del Mar', selected: false, degraded: false };

export const Default = { args: { pathInfo: base, hotkey: '1', count: 2 } };
export const Auto = { args: { pathInfo: { ...base, selected: true, selectedBy: 'auto' }, hotkey: '1', count: 2 } };
export const Next = { args: { pathInfo: { ...base, selected: true, selectedBy: 'user' }, hotkey: '1', count: 2 } };
export const LongName = { args: { pathInfo: { ...base, roadLabel: 'Boulevard du Souverain - Vorstlaan' }, hotkey: '2', count: 3 } };
export const Unnamed = { args: { pathInfo: { ...base, roadLabel: 'Unnamed road' }, hotkey: '2', count: 3 } };
export const Roundabout = { args: { pathInfo: { ...base, maneuver: 'roundabout', maneuverText: 'Roundabout', roadLabel: 'Roundabout, west' }, hotkey: '1', count: 6, compact: true } };
export const Degraded = { args: { pathInfo: { ...base, direction: undefined, maneuver: 'unknown', maneuverText: 'Heading north', degraded: true, roadLabel: 'South Ocean Boulevard' }, hotkey: '2', count: 2 } };
export const SingleWayOn = { args: { pathInfo: { ...base, direction: 0, maneuver: 'straight', maneuverText: 'Straight', selected: true, selectedBy: 'auto' }, single: true } };
