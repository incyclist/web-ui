import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Card } from './Card'

const Summary = () => <div data-testid='summary' />
const Details = () => <div data-testid='details' />

describe('Card', () => {

    test('outside the fold it renders a skeleton instead of summary/details', () => {
        render(<Card id='1' visible={true} outsideFold={true} width={200} height={112} Summary={Summary} Details={Details} />)

        expect(screen.getByTestId('card-skeleton')).toBeInTheDocument()
        expect(screen.queryByTestId('summary')).toBeNull()
    })

    test('switches between skeleton and content in both directions', () => {
        const props = { id: '1', visible: true, width: 200, height: 112, Summary, Details }
        const { rerender } = render(<Card {...props} outsideFold={false} />)
        expect(screen.getByTestId('summary')).toBeInTheDocument()

        rerender(<Card {...props} outsideFold={true} />)
        expect(screen.queryByTestId('summary')).toBeNull()
        expect(screen.getByTestId('card-skeleton')).toBeInTheDocument()

        rerender(<Card {...props} outsideFold={false} />)
        expect(screen.getByTestId('summary')).toBeInTheDocument()
    })

    test('without fold information (carousel) it renders as before', () => {
        render(<Card id='1' visible={true} width={200} height={112} Summary={Summary} Details={Details} />)

        expect(screen.getByTestId('summary')).toBeInTheDocument()
        expect(screen.queryByTestId('card-skeleton')).toBeNull()
    })

    test('clicking the skeleton still selects the route', () => {
        const onClick = vi.fn()
        render(<Card id='1' visible={true} outsideFold={true} onClick={onClick} Summary={Summary} Details={Details} />)

        screen.getByTestId('card-skeleton').click()
        expect(onClick).toHaveBeenCalled()
    })

    test('renders single card without flip when Details is not provided', () => {
        render(<Card id='1' visible={true} width={200} height={112} Summary={Summary} />)

        expect(screen.getByTestId('summary')).toBeInTheDocument()
        expect(screen.queryByTestId('details')).toBeNull()
        expect(screen.queryByTestId('card-skeleton')).toBeNull()
    })

    test('keeps a sized placeholder when a card is not visible', () => {
        const { container } = render(<Card id='1' visible={false} width={280} height={520} Summary={Summary} />)

        expect(screen.getByTestId('card-skeleton')).toBeInTheDocument()
        expect(screen.queryByTestId('summary')).toBeNull()
        expect(container.firstChild).toHaveStyle({ width: '280px', height: '520px' })
    })
})
