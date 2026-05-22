import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

import { useEffect, useState } from 'react'

import { useBookingStore }
from '@/store/booking.store'

dayjs.extend(duration)

export function BookingCountdown() {
  const {
    lockExpiresAt,
    clearBooking,
  } = useBookingStore()

  const [seconds, setSeconds] =
    useState(0)

  useEffect(() => {
    if (!lockExpiresAt) return

    const interval = setInterval(() => {
      const remaining =
        dayjs(lockExpiresAt)
          .diff(dayjs(), 'second')

      if (remaining <= 0) {
        clearBooking()

        clearInterval(interval)

        return
      }

      setSeconds(remaining)
    }, 1000)

    return () =>
      clearInterval(interval)
  }, [lockExpiresAt])

  return (
    <div>
      Lock expires in:
      {seconds}s
    </div>
  )
}