import {
  initiateUserControlledWalletsClient
} from '@circle-fin/user-controlled-wallets'

import { createSupabaseServerClient } from './supabase'

export const circleClient = initiateUserControlledWalletsClient({
  apiKey: process.env.NEXT_PUBLIC_CIRCLE_API_KEY
})

/**
 * auto create user if not exists
 */
export const createUserToken = async () => {
  const supabaseServerClient = createSupabaseServerClient()
  const { data: { user } } = await supabaseServerClient.auth.getUser()

  if (!user) {
    throw new Error('Unauthenticated')
  }

  let data

  try {
    ({ data } = await circleClient.createUserToken({
      userId: user.id
    }))
  } catch (error) {
    // Cannot find the userId in the system
    if (error.response?.data?.code === 155102) {
      await circleClient.createUser({ userId: user.id });
      ({ data } = await circleClient.createUserToken({
        userId: user.id
      }))
    } else {
      throw new Error(error.message)
    }
  }
  return { userId: user.id, ...data }
}
