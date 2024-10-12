import { NextResponse } from 'next/server'
import { circleClient, createUserToken } from '@/app/lib/circle'

export async function POST (request, { params }) {
  const { id: walletId, destination: destinationAddress } = params
  const { amount, tokenId } = await request.json()

  const { userId, userToken, encryptionKey } = await createUserToken()

  const { data: { challengeId } } = await circleClient.createTransaction({
    amounts: [amount],
    destinationAddress,
    tokenId,
    walletId,
    userId,
    fee: {
      type: 'level',
      config: {
        feeLevel: 'MEDIUM'
      }
    },
    userToken
  })

  return NextResponse.json({
    userToken,
    encryptionKey,
    challengeId
  })
}
