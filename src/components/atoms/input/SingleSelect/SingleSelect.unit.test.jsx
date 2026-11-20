import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { SingleSelect } from './index'

describe('SingleSelect option labels', () => {
    test('shows the label while the option value stays the value', () => {
        const onValueChange = vi.fn()
        render(<SingleSelect label='Source' selected='All' options={['All','EbelingHoppe']}
            optionLabels={{EbelingHoppe:'Ebeling Hoppe'}} onValueChange={onValueChange} />)

        expect(screen.getByRole('option', {name:'Ebeling Hoppe'})).toHaveValue('EbelingHoppe')
        expect(screen.getByRole('option', {name:'All'})).toHaveValue('All')

        fireEvent.change(screen.getByRole('combobox'), {target:{value:'EbelingHoppe'}})
        expect(onValueChange).toHaveBeenCalledWith('EbelingHoppe')
    })
})
