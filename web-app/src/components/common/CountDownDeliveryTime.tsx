import React, {useState, useEffect, useRef} from 'react'

interface Props {
  timeRemaining: number,
  timeOut: (time: number) => void
}

export default function CountdownDeliveryTime(props: Props) {
  const [secondsRemaining, setSecondsRemaining] = useState(props.timeRemaining)

  const secondsToDisplay = secondsRemaining % 60
  const minutesRemaining = (secondsRemaining - secondsToDisplay) / 60
  const minutesToDisplay = minutesRemaining % 60
  const hoursToDisplay = (minutesRemaining - minutesToDisplay) / 60

  useInterval(() => {
      if (secondsRemaining > 0) {
        setSecondsRemaining(secondsRemaining - 1)
      } else {
        props.timeOut(0)
      }
  }, secondsRemaining > 0 ? 1000 : null)

  return (
    <div className="count-down-delivery-time">
      <div style={{padding: 20}}>
        {twoDigits(hoursToDisplay)}:{twoDigits(minutesToDisplay)}:
        {twoDigits(secondsToDisplay)}
      </div>
    </div>
  )
}

function useInterval(callback:any, delay:any) {

  const savedCallback = useRef<any>()

  useEffect(() => {
    savedCallback.current = callback
  }, [callback])

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay])
}

const twoDigits = (num:number) => String(num).padStart(2, '0')
