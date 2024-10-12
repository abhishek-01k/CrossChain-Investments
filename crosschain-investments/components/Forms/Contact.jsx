'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useToast } from "@/hooks/use-toast"

const schema = z.object({
  name: z.string().min(1, { message: 'Please enter a valid name.' }),
  address: z.string().min(1, { message: 'Please enter a valid address.' })
})

export function ContactForm () {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      address: ''
    }
  })
  const supabase = createClientComponentClient()
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const handleCreateContact = async (data) => {
    try {
      const { error } = await supabase
        .from('contacts')
        .insert(data)
      if (error) {
        toast({
          variant: "destructive",
          title: "Error saving contact",
          description: error.message,
        })
      } else {
        queryClient.invalidateQueries({ queryKey: ['contacts'] })
        form.reset()
        toast({
          title: "Contact saved successfully",
        })
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error saving contact",
        description: error.message,
      })
      console.error(error)
    }
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
          <DialogTitle>Save Contact</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleCreateContact)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="0x6d76cf5690fa72827e4984097d137295de17d960" {...field} />
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
