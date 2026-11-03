import React from 'react'
import { LinkButton } from './index'

export default {
    component: LinkButton,
    title: 'atoms/LinkButton',
    argTypes: { onClick: { action: 'clicked' } },
    decorators: [(Story) => <div style={{ background: 'black', color: 'white', padding: '2vh', fontSize: '1.8vh' }}><Story /></div>]
}

const Template = args => <LinkButton {...args} />

export const Default = Template.bind({})
Default.args = { label: 'How to get Street View' }

export const External = Template.bind({})
External.args = { label: 'How to create a key', external: true }

export const Disabled = Template.bind({})
Disabled.args = { label: 'How to get Street View', disabled: true }
