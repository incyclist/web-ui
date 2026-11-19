import React from 'react'
import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'
import { CyclingModeProperyType } from 'incyclist-services'
import { GearSettingsView } from './GearSettingsView'

const logger = { logEvent: () => {} }

const buildMode = (properties) => ({
    getName: () => 'TestMode',
    getDescription: () => 'desc',
    getProperties: () => properties,
})

const renderView = (properties, settings) => render(
    <GearSettingsView
        logger={logger}
        mode='TestMode'
        options={[buildMode(properties)]}
        settings={settings}
    />
)

const boolProp = { key: 'flag', name: 'Flag', type: CyclingModeProperyType.Boolean, default: true }

describe('GearSettingsView', () => {

    test('renders a default-true Boolean checked when no value is saved', () => {
        const { container } = renderView([boolProp], {})
        expect(container.querySelector('input[type="checkbox"]')).toBeChecked()
    })

    test('renders a default-true Boolean unchecked when saved value is false', () => {
        const { container } = renderView([boolProp], { flag: false })
        expect(container.querySelector('input[type="checkbox"]')).not.toBeChecked()
    })

    test('hides a property whose condition depends on another boolean being false', () => {
        const dependent = {
            key: 'level', name: 'Level', type: CyclingModeProperyType.Integer, default: 5,
            condition: (s) => s.flag === true,
        }
        const { container } = renderView([boolProp, dependent], { flag: false })
        expect(container.querySelectorAll('input[type="text"]').length).toBe(0)
    })

    test('shows the dependent property when the boolean is true, with integer stored as string', () => {
        const dependent = {
            key: 'level', name: 'Level', type: CyclingModeProperyType.Integer, default: 5, max: 100,
            condition: (s) => s.flag === true,
        }
        const { container } = renderView([boolProp, dependent], { flag: true, level: '42' })
        expect(container.querySelector('input[type="text"]')).toHaveValue('42')
    })

    test('keeps a saved 0 for an Integer instead of falling back to the default', () => {
        const intProp = { key: 'level', name: 'Level', type: CyclingModeProperyType.Integer, default: 5 }
        const { container } = renderView([intProp], { level: 0 })
        expect(container.querySelector('input[type="text"]')).toHaveValue('0')
    })
})
