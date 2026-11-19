import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { CoachEdit } from './component'

const okButton = () => screen.getByText('OK').closest('button')

describe('CoachEdit', () => {

    describe('OK button', () => {
        test('disabled in Speed mode when no speed value was entered', () => {
            render(<CoachEdit name='' type='speed' speed={{ value: undefined, unit: 'km/h' }} />)
            expect(okButton().disabled).toBe(true)
        })

        test('enabled in Speed mode when a speed value is present', () => {
            render(<CoachEdit name='' type='speed' speed={{ value: 30, unit: 'km/h' }} />)
            expect(okButton().disabled).toBe(false)
        })

        test('disabled in Power mode when no power was entered', () => {
            render(<CoachEdit name='' type='power' power={undefined} />)
            expect(okButton().disabled).toBe(true)
        })

        test('enabled in Power mode when a power value is present', () => {
            render(<CoachEdit name='' type='power' power={200} />)
            expect(okButton().disabled).toBe(false)
        })
    })

    describe('error', () => {
        test('shows the error message', () => {
            render(<CoachEdit name='' type='power' power={200} error='Could not save the coach' />)
            expect(screen.getByText('Could not save the coach')).toBeTruthy()
        })
    })
})
