'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"
import { MultiSelect } from "@/components/ui/multi-select"
import { useCircleContext } from '@/hooks/circle'

const schema = z.object({
  blockchains: z.array(z.string()).min(1, { message: 'Please select blockchains.' })
})

export function WalletForm ({ createUserPin }) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      blockchains: []
    }
  })
  const { execute } = useCircleContext()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleCreateWallet = async (data) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_HOST}/api/wallets`, {
      method: 'POST',
      body: JSON.stringify({
        createUserPin,
        blockchains: data.blockchains
      })
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
      form.reset()
      queryClient.invalidateQueries({ queryKey: ['wallets'] })
    })
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="fixed bottom-10 right-10 rounded-full w-12 h-12 p-0">
          <Plus className="h-6 w-6" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Wallet</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateWallet)} className="space-y-4">
            <FormField
              control={form.control}
              name="blockchains"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Blockchains</FormLabel>
                  <FormControl>
                    <MultiSelect
                      options={[
                        { value: 'ETH-SEPOLIA', label: 'ETH-SEPOLIA' },
                        { value: 'AVAX-FUJI', label: 'AVAX-FUJI' },
                        { value: 'MATIC-AMOY', label: 'MATIC-AMOY' },
                      ]}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
