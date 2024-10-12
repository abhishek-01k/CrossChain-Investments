'use client'

import { createContext, useEffect, useContext } from 'react'
import { W3SSdk } from '@circle-fin/w3s-pw-web-sdk'

const CircleContext = createContext(null)

export function CircleProvider ({ children }) {
  useEffect(() => {
    window.w3sSdk = new W3SSdk()
    window.w3sSdk.setAppSettings({ appId: process.env.NEXT_PUBLIC_CIRCLE_APP_ID })
  }, [])

  const execute = async ({ userToken, encryptionKey, challengeId }, callback) => {
    window.w3sSdk.setAuthentication({ userToken, encryptionKey })
    window.w3sSdk.execute(challengeId, (error, result) => {
      callback(error, result)
    })
  }

  return (
    <CircleContext.Provider
      value={{ execute }}
    >
      {children}
    </CircleContext.Provider>
  )
}

export const useCircleContext = () => useContext(CircleContext)
