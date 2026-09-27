import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ResultView } from './ResultView'

describe('ResultView', () => {

    test('renders nothing when there is no error (the success case auto-closes upstream)', () => {
        const { container } = render(<ResultView error={undefined} onPickAnotherFile={vi.fn()} onClose={vi.fn()} />)
        expect(container.textContent).toBe('')
    })

    test('shows the reason and a "Pick another file" action on failure', () => {
        render(<ResultView error="This file couldn't be read" onPickAnotherFile={vi.fn()} onClose={vi.fn()} />)

        expect(screen.getByText("This file couldn't be read")).toBeTruthy()
        expect(screen.getByText('Pick another file')).toBeTruthy()
        expect(screen.getByText('Close')).toBeTruthy()
    })

    test('"Pick another file" invokes onPickAnotherFile (returns to Landing)', () => {
        const onPickAnotherFile = vi.fn()
        render(<ResultView error="No video file found for this route" onPickAnotherFile={onPickAnotherFile} onClose={vi.fn()} />)

        fireEvent.click(screen.getByText('Pick another file'))

        expect(onPickAnotherFile).toHaveBeenCalled()
    })

    test('"Close" invokes onClose', () => {
        const onClose = vi.fn()
        render(<ResultView error="No video file found for this route" onPickAnotherFile={vi.fn()} onClose={onClose} />)

        fireEvent.click(screen.getByText('Close'))

        expect(onClose).toHaveBeenCalled()
    })
})
