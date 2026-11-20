import React from 'react'
import styled from 'styled-components'
import { RouteServersSettingsView } from './RouteServersSettings'
import {
    listProps, emptyProps, addWithKnownProps, addWithoutKnownProps, manual, knownStates,
    removeWithRoutes, removeWithoutRoutes
} from './routeServers.mock'

const Frame = styled.div`
    width: 1100px;
    height: 640px;
    overflow: auto;
    background: #1c2833;
    color: white;
`

export default {
    component: RouteServersSettingsView,
    title: 'Modules/Settings/RouteServersSettings',
    argTypes: {
        actions: { control: false },
    },
}

const actions = new Proxy({}, { get: (_t, name) => (...args) => console.log('action', name, ...args) })

const Template = args => <Frame><RouteServersSettingsView actions={actions} {...args} /></Frame>

export const ListWithStatuses = Template.bind({})
ListWithStatuses.args = { ...listProps, highlightKey: 'Flanders' }

export const Empty = Template.bind({})
Empty.args = emptyProps

export const AddWithKnownServers = Template.bind({})
AddWithKnownServers.args = addWithKnownProps

export const AddWithKnownServerStates = Template.bind({})
AddWithKnownServerStates.args = { ...addWithKnownProps, known: knownStates }

export const AddWithoutKnownServers = Template.bind({})
AddWithoutKnownServers.args = addWithoutKnownProps

export const ManualTyped = Template.bind({})
ManualTyped.args = { ...addWithKnownProps, manual: manual.typed }

export const ManualLocalHttpNote = Template.bind({})
ManualLocalHttpNote.args = { ...addWithKnownProps, manual: manual.localHttp }

export const ManualChecking = Template.bind({})
ManualChecking.args = { ...addWithKnownProps, manual: manual.checking }

export const ManualSuccess = Template.bind({})
ManualSuccess.args = { ...addWithKnownProps, manual: manual.success }

export const ManualCheckedAfterHttpSwitch = Template.bind({})
ManualCheckedAfterHttpSwitch.args = { ...addWithKnownProps, manual: manual.checked }

export const ManualConfirmEmpty = Template.bind({})
ManualConfirmEmpty.args = { ...addWithKnownProps, manual: manual.confirmEmpty }

export const ManualAddressError = Template.bind({})
ManualAddressError.args = { ...addWithKnownProps, manual: manual.urlError }

export const ManualNameError = Template.bind({})
ManualNameError.args = { ...addWithKnownProps, manual: manual.nameError }

export const RemoveWithRoutes = Template.bind({})
RemoveWithRoutes.args = { ...listProps, removeDialog: removeWithRoutes }

export const RemoveWithoutRoutes = Template.bind({})
RemoveWithoutRoutes.args = { ...listProps, removeDialog: removeWithoutRoutes }
