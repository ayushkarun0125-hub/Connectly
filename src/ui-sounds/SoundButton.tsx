import { forwardRef } from 'react'
import type { ButtonHTMLAttributes, MouseEvent } from 'react'
import { useUISounds } from './useUISounds'

export const SoundButton = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement>>(
  function SoundButton({ onMouseEnter, onClick, type, ...rest }, ref) {
    const { playHover, playClick } = useUISounds()

       return (
      <button
        ref={ref}
        {...rest}
        type={type ?? 'button'}
        onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
          playHover()
          onMouseEnter?.(e)
        }}
        onClick={(e: MouseEvent<HTMLButtonElement>) => {
          playClick()
          onClick?.(e)
        }}
      />
    )
  },
)
