import React from 'react'
import styled from 'styled-components'
import { RouteSharingSettingsView } from './RouteSharingSettingsView'
import * as fx from './fixtures.mock'

const Frame = styled.div`
    width: 1100px;
    height: 640px;
    overflow: auto;
    padding: 1vw;
    box-sizing: border-box;
    background: #1c2833;
    color: white;
`

export default {
    component: RouteSharingSettingsView,
    title: 'Modules/Settings/RouteSharingSettings',
    argTypes: { actions: { control: false } },
}

const actions = new Proxy({}, { get: (_t, name) => (...args) => console.log('action', name, ...args) })

const Template = args => <Frame><RouteSharingSettingsView actions={actions} {...args} /></Frame>

export const NeverConnected = Template.bind({})
NeverConnected.args = { ...fx.neverConnected }

export const On = Template.bind({})
On.args = { ...fx.on }

export const Off = Template.bind({})
Off.args = { ...fx.off }

export const StartFailed = Template.bind({})
StartFailed.args = { ...fx.startError }

export const ConnectStarting = Template.bind({})
ConnectStarting.args = { ...fx.neverConnected, connectWindow: fx.windowStarting }

export const ConnectError = Template.bind({})
ConnectError.args = { ...fx.neverConnected, connectWindow: fx.windowError }

export const ConnectWaiting = Template.bind({})
ConnectWaiting.args = { ...fx.neverConnected, connectWindow: fx.windowWaiting, suffix: 'K3F9' }

export const ConnectCode = Template.bind({})
ConnectCode.args = { ...fx.neverConnected, connectWindow: fx.windowCode }

export const ConnectConnected = Template.bind({})
ConnectConnected.args = { ...fx.on, connectWindow: fx.windowConnected }

export const ConnectConnectedGenericName = Template.bind({})
ConnectConnectedGenericName.args = { ...fx.on, connectWindow: { phase: 'connected', device: 'Android device' } }
