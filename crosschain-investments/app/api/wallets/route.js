import { circleClient, createUserToken } from '@/app/lib/circle'
import { NextResponse } from 'next/server'

export async function POST (req) {
  const { userId, userToken, encryptionKey } = await createUserToken()
  const { createUserPin, blockchains } = await req.json()

  const method = createUserPin ? 'createUserPinWithWallets' : 'createWallet'
  const { data: { challengeId } } = await circleClient[method]({
    userId,
    blockchains,
    userToken
  })

  return NextResponse.json({
    userToken,
    encryptionKey,
    challengeId
  })
}

export async function GET () {
  const { userToken } = await createUserToken()

  const { data } = await circleClient.listWallets({ userToken })

  return NextResponse.json(data)
}
