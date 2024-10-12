import { circleClient, createUserToken } from '@/app/lib/circle'
import { NextResponse } from 'next/server'

export async function GET (req, { params }) {
  const { id } = params
  const { userToken } = await createUserToken()

  const { data } = await circleClient.getWallet({ id, userToken })

  return NextResponse.json(data)
}
