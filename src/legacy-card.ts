import type { Booking, BookingStatus } from './models/booking'

// Готовая версия на обычных DOM-элементах. В А5 её заменяет booking-card.
export function legacyCard(booking: Booking, change: (id: string, status: BookingStatus) => void): HTMLElement {
  const card = document.createElement('article')
  card.className = 'legacy-card'
  const name = document.createElement('h3')
  const text = document.createElement('p')
  const button = document.createElement('button')
  button.type = 'button'
  button.addEventListener('click', () => {
    change(card.dataset.id ?? '', card.dataset.status === 'new' ? 'confirmed' : 'new')
  })
  card.append(name, text, button)
  updateLegacy(card, booking)
  return card
}
export function updateLegacy(card: HTMLElement, booking: Booking) {
  card.dataset.id = booking.id
  card.dataset.status = booking.status
  card.querySelector('h3')!.textContent = booking.name
  card.querySelector('p')!.textContent = `Участников: ${booking.seats} · Источник: ${booking.source} · ${booking.status === 'confirmed' ? 'Подтверждена' : 'Новая заявка'}`
  card.querySelector('button')!.textContent = booking.status === 'confirmed' ? 'Вернуть в очередь' : 'Подтвердить'
}
