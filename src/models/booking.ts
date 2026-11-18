export type BookingStatus = 'new' | 'confirmed'
export interface Booking {
  id: string
  name: string
  seats: number
  status: BookingStatus
  source: 'web'
}
export interface BookingStatusRequest {
  id: string
  nextStatus: BookingStatus
}
export function initialBookings(): Booking[] {
  return [
    { id: 'b1', name: 'Анна', seats: 1, status: 'confirmed', source: 'web' },
    { id: 'b2', name: 'Иван', seats: 1, status: 'new', source: 'web' },
  ]
}
