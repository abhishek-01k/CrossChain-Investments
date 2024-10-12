'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/components/ui/use-toast"
import { useCircleContext } from '@/app/hooks/circle'
import { useQueryClient } from '@tanstack/react-query'

import { AddressInput } from './Input/AddressInput'

const schema = z.object({
  destination: z.string().min(1, { message: 'Please enter a valid destination address.' }),
  amount: z.coerce.number().gt(0)
})

export function TransferForm ({ walletId, tokenBalance, close }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      destination: '',
      amount: ''
    }
  })
  const { execute } = useCircleContext()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleTransfer = async (data) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/wallets/${walletId}/transfer/${data.destination}`, {
        method: 'POST',
        body: JSON.stringify({ amount: data.amount, tokenId: tokenBalance.token.id })
      })
      const { userToken, encryptionKey, challengeId } = await res.json()

      await execute({ userToken, encryptionKey, challengeId }, (error, result) => {
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
        close()
        form.reset()
        queryClient.refetchQueries({ queryKey: ['balances'] })
      })
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error sending",
        description: error.message,
      })
    }
  }

  return (
    <div className="relative max-w-md mx-auto mt-4">
      <button onClick={close} className="absolute -top-2 -right-2">
        <X className="h-6 w-6" />
      </button>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleTransfer)} className="space-y-4">
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destination Address</FormLabel>
                <FormControl>
                  <AddressInput placeholder="0x6d76cf5690fa72827e4984097d137295de17d960" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="0.1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Send</Button>
        </form>
      </Form>
    </div>
  )
}
