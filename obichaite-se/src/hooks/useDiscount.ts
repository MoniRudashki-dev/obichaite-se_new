import { checkForDiscount } from '@/action/checkout'
import { useAppDispatch, useAppSelector } from './redux-hooks'
import { setUserHaveDiscount } from '@/store/features/checkout'
import { useCallback } from 'react'

export const useDiscount = () => {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.root.user)

  const handleCheckDiscount = useCallback(
    async (email: string) => {
      if (!user) return
      const didUserHaveDiscount = await checkForDiscount(email)

      if (!!didUserHaveDiscount.data) {
        dispatch(setUserHaveDiscount(true))
      } else {
        dispatch(setUserHaveDiscount(false))
      }
    },
    [user, dispatch],
  )

  return { handleCheckDiscount }
}
