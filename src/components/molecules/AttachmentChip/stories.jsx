import React from 'react'
import { AttachmentChip } from './index'

export default {
    component: AttachmentChip,
    title: 'Molecules/AttachmentChip',
    argTypes: { onClear: { action: 'clear' } },
    decorators: [(Story) => <div style={{ width: '40vw', padding: '2vh', background: '#222', color: 'white' }}><Story /></div>],
}

const Template = args => <AttachmentChip {...args} />

export const Route = Template.bind({})
Route.args = { label: 'Route', name: "Alpe d'Huez (Video)" }

export const Workout = Template.bind({})
Workout.args = { label: 'Workout', name: 'Sweet Spot 60' }

export const LongName = Template.bind({})
LongName.args = { label: 'Route', name: 'A very long route name that must be truncated with an ellipsis because it does not fit into the dialog width at all' }

export const ReadOnly = Template.bind({})
ReadOnly.args = { label: 'Workout', name: 'Sweet Spot 60', onClear: undefined }
