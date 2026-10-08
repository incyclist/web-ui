import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, queryByText } from '@testing-library/react'
import { SelectedDevice } from './index'

describe('SelectedDevice T16 (switched off, device remembered)', ()=> {

    test('a normal selected device shows its value', ()=> {
        const { getByText } = render(
            <SelectedDevice title="Power" capability="power" deviceName="Tacx Neo" value={212} unit="W" connectState="connected" />
        )

        expect(getByText('212')).toBeTruthy()
        expect(getByText('Tacx Neo')).toBeTruthy()
    })

    test('a switched-off device still shows its name, but no value', ()=> {
        const { getByText, container } = render(
            <SelectedDevice title="Power" capability="power" deviceName="Tacx Neo" value={212} unit="W" disabled={true} footer="Not used" />
        )

        expect(getByText('Tacx Neo')).toBeTruthy()
        expect(queryByText(container, '212')).toBeNull()
    })
})
