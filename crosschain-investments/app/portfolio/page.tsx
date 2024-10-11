"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import { useActiveAccount } from "thirdweb/react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ContributedBTS from "@/components/portfolio/ContributedBTS"
import UsersBTS from "@/components/portfolio/usersBTS"

const PortfolioPage = () => {
  const activeAccount = useActiveAccount()

  const [btscontributed, setBtsContributed] = React.useState<any[]>([])
  const [createdBTS, setCreatedBTS] = React.useState<any[]>([])

  const getPortfolioDetails = async ({ address }: { address: string }) => {
    if (address) {
      const res = await fetch(
        `https://testnetapi.alvara.xyz/portfolio/contributed-bts?address=${address}&page=1&limit=20`
      )
      const response = await res.json()

      const { users } = response.data
      setBtsContributed(users)
    }
  }

  const getUsersCreatedBTS = async ({ address }: { address: string }) => {
    if (address) {
      const res = await fetch(
        `https://testnetapi.alvara.xyz/portfolio/created-bts?address=${address}&page=1&limit=20`
      )
      const response = await res.json()

      const { users } = response
      setCreatedBTS(users)
    }
  }

  useEffect(() => {
    if (activeAccount?.address) {
      getPortfolioDetails({
        address: activeAccount.address,
      })
      getUsersCreatedBTS({
        address: activeAccount.address,
      })
    }
  }, [activeAccount])

  return (
    <>
      <Tabs defaultValue="contributions" className="my-12">
        <TabsList className="ml-12">
          <TabsTrigger value="contributions">Contributed-BTS</TabsTrigger>
          <TabsTrigger value="myBTS">My-BTS</TabsTrigger>
        </TabsList>
        <TabsContent value="contributions">
          <ContributedBTS btscontributed={btscontributed} />
        </TabsContent>
        <TabsContent value="myBTS">
          <UsersBTS createdBTS={createdBTS} />
        </TabsContent>
      </Tabs>
    </>
  )
}

export default PortfolioPage
