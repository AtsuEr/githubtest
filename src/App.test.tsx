import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('CareNote', () => {
  it('filters the patient roster by name', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Search patients'), 'Aisha')

    expect(screen.getByRole('button', { name: /Aisha Khan/ })).toBeVisible()
    expect(screen.queryByRole('button', { name: /James Wilson/ })).not.toBeInTheDocument()
  })

  it('shows the selected patient chart context', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: /James Wilson/ }))

    const recordPanel = document.querySelector('.record-panel')
    expect(recordPanel).not.toBeNull()
    expect(within(recordPanel as HTMLElement).getByRole('heading', { name: 'James Wilson' })).toBeVisible()
    expect(within(recordPanel as HTMLElement).getByText('Latex, Sulfa')).toBeVisible()
    expect(within(recordPanel as HTMLElement).getByText('Congestive heart failure')).toBeVisible()
  })

  it('creates and signs a new clinical note', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(screen.getByRole('button', { name: 'New note' }))
    await user.type(screen.getByPlaceholderText('Briefly describe this encounter'), 'Afternoon review')
    await user.type(
      screen.getByLabelText('Clinical note body'),
      'Patient remains stable and is tolerating oral intake.',
    )
    await user.click(screen.getByRole('button', { name: 'Sign note' }))

    expect(screen.getByText('Note signed and saved')).toBeVisible()
    expect(screen.getByRole('heading', { name: 'Afternoon review' })).toBeVisible()
  })
})
