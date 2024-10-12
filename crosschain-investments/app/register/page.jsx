'use client'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from '@mantine/form'
import { zodResolver } from 'mantine-form-zod-resolver'
import { z } from 'zod'

import { AnonOnly, FacebookButton } from '@/app/components/Auth'
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

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
    initialValues: {
      email: '',
      password: '',
      passwordConfirmation: ''
    },
    validate: zodResolver(schema)
  })
  const router = useRouter()
  const supabase = createClientComponentClient()
  const { toast } = useToast()

  const handleRegister = async ({ email, password }) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password
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
        <form onSubmit={form.onSubmit(handleRegister)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              {...form.getInputProps('email')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              {...form.getInputProps('password')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="passwordConfirmation">Confirm Password</Label>
            <Input
              id="passwordConfirmation"
              type="password"
              required
              {...form.getInputProps('passwordConfirmation')}
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit">
              Register
            </Button>
          </div>
        </form>
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
