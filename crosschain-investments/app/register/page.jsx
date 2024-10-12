'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import { AnonOnly, FacebookButton } from '@/app/components/Auth'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

const schema = z
  .object({
    email: z.string().email({ message: 'Invalid email' }),
    password: z.string().min(8, {
      message: 'Password must be at least 8 characters'
    }),
    passwordConfirmation: z.string()
  })
  .refine(
    ({ passwordConfirmation, password }) => passwordConfirmation === password,
    {
      message: "Passwords don't match",
      path: ['passwordConfirmation']
    }
  )

export default function Register () {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      passwordConfirmation: ''
    }
  })
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleRegister = async (data) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password
      })
      if (error) {
        throw new Error(error.message)
      }
      router.refresh()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error registering",
        description: error.message,
      })
    }
  }

  return (
    <AnonOnly>
      <div className="max-w-sm mx-auto mt-[25vh]">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleRegister)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passwordConfirmation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Register</Button>
          </form>
        </Form>
        <FacebookButton />
        <p className="text-center mt-4">
          Already have an account?{' '}
          <Link
            className="text-blue-600 underline"
            href={'/login'}
          >
            Login here
          </Link>
        </p>
      </div>
    </AnonOnly>
  )
}
