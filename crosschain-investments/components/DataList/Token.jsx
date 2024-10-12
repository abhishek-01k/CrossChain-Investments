import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useGetWalletBalances } from '@/app/hooks/wallets'
import { TransferForm } from '@/app/components/Forms'
import { Send } from "lucide-react"
import { useState } from 'react'

export function TokenCard ({ tokenBalance, walletId }) {
  const [opened, setOpened] = useState(false)
  const open = () => setOpened(true)
  const close = () => setOpened(false)

  return (
    <Card className="min-w-[350px] h-[250px] self-stretch">
      <CardContent className="p-6">
        {opened ? (
          <TransferForm
            tokenBalance={tokenBalance}
            walletId={walletId}
            close={close}
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="mb-0">{tokenBalance.amount}</p>
            <p>{tokenBalance.token.symbol}</p>
            <Button
              disabled={tokenBalance.amount <= 0}
              onClick={open}
            >
              <Send className="mr-2 h-4 w-4" />
              Transfer
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function TokenCards ({ walletId }) {
  const { data } = useGetWalletBalances(walletId)

  return (
    <ScrollArea className="w-full">
      <div className="flex space-x-4 p-4">
        {(data?.tokenBalances || []).map((tokenBalance) => (
          <TokenCard key={tokenBalance.token.id} tokenBalance={tokenBalance} walletId={walletId}/>
        ))}
      </div>
    </ScrollArea>
  )
}
