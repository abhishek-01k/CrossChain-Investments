import { circleClient, createUserToken } from '@/app/lib/circle'
import { NextResponse } from 'next/server'

export async function POST () {
  const { userId, userToken, encryptionKey } = await createUserToken()

  const { data: { challengeId } } = await circleClient.updateUserPin({
    userId,
    userToken
  })

  return NextResponse.json({
    userToken,
    encryptionKey,
    challengeId
  })
}
