'use client'

import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Settings, Users, Wallet } from "lucide-react"

import { AuthOnly } from '../../components/Auth/AuthOnly'
import { useListWallets } from '@/hooks/wallets'
import { useCircleContext } from '@/hooks/circle'
import { ContactList, TokenCards } from '@/components/DataList'
import { ContactForm } from '@/components/Forms'
import { useListContacts } from '@/hooks/contacts'
import { WalletForm } from '@/components/Forms/Wallet'
import { useAuthContext } from '@/hooks/auth'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

export default function Page() {
  const { data, isLoading } = useListWallets()
  const { execute } = useCircleContext()
  const [activeTab, setActiveTab] = useState("wallets")

  const supabase = createClientComponentClient()
  const { user } = useAuthContext()
  const { toast } = useToast()

  const { data: contacts, isLoading: isLoadingContacts } = useListContacts(supabase, user?.id)

  const handleRestorePin = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/users/pin/restore`, {
      method: 'POST'
    })
    const { userToken, encryptionKey, challengeId } = await res.json()
    execute({ userToken, encryptionKey, challengeId }, (error, result) => {
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message ?? 'An error occurred',
        })
        return
      }
      toast({
        title: `Challenge: ${result?.type}`,
        description: `Status: ${result?.status}`,
      })
    })
  }

  const handleUpdatePin = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/users/pin/update`, {
      method: 'POST'
    })
    const { userToken, encryptionKey, challengeId } = await res.json()
    execute({ userToken, encryptionKey, challengeId }, (error, result) => {
      if (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: error?.message ?? 'An error occurred',
        })
        return
      }
      toast({
        title: `Challenge: ${result?.type}`,
        description: `Status: ${result?.status}`,
      })
    })
  }

  return (
    <AuthOnly>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
        <TabsContent value="contacts" className="h-[calc(100%-50px)] relative">
          {isLoadingContacts ? (
            <div className="flex items-center justify-center h-full">Loading...</div>
          ) : (
            <>
              <ContactList contacts={contacts} />
              <ContactForm />
            </>
          )}
        </TabsContent>
        <TabsContent value="wallets" className="h-[calc(100%-50px)] relative">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">Loading...</div>
          ) : (
            <>
              <Accordion type="single" collapsible className="w-full">
                {(data?.wallets || []).map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="flex items-center">
                      <Wallet className="mr-2 h-4 w-4" />
                      {item.address}
                      <Badge variant="secondary" className="ml-2">{item.blockchain}</Badge>
                    </AccordionTrigger>
                    <AccordionContent>
                      <TokenCards walletId={item.id} />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
              <WalletForm createUserPin={!data?.wallets?.length} />
            </>
          )}
        </TabsContent>
        <TabsContent value="settings" className="h-[calc(100%-50px)]">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">Loading...</div>
          ) : data?.wallets?.length ? (
            <ul className="divide-y divide-gray-200">
              <li className="py-2 px-4 cursor-pointer hover:bg-gray-50" onClick={handleUpdatePin}>
                Update PIN
              </li>
              <li className="py-2 px-4 cursor-pointer hover:bg-gray-50" onClick={handleRestorePin}>
                Forgot PIN
              </li>
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <h4 className="text-lg font-semibold">Create wallet to get started!</h4>
            </div>
          )}
        </TabsContent>

        <TabsList className="fixed bottom-0 left-0 right-0">
          <TabsTrigger value="contacts" className="flex-1">
            <Users className="mr-2 h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="wallets" className="flex-1">
            <Wallet className="mr-2 h-4 w-4" />
            Wallets
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </AuthOnly>
  )
}
