"use client"

import React, { useState } from "react"
import {
  Chain,
  Circle,
  CircleEnvironments,
  PaymentIntentCreationRequest,
} from "@circle-fin/circle-sdk"
import { useActiveAccount } from "thirdweb/react"
import { signTypedData } from "thirdweb/utils"

import { useToast } from "@/hooks/use-toast"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Button } from "../ui/button"
import { Input } from "../ui/input"

type PaymentDetailsType = {
  blockchain: Chain
  currency: "USD" | "ETH" | "BTC"
  settlementCurrency: "USD" | "ETH" | "BTC"
}

const CrossChainDeposit = ({ investAmount }: { investAmount: string }) => {
  const [selectedChain, setSelectedChain] = useState("")

  const { toast } = useToast()

  const handleChainSelect = (value: string) => {
    setSelectedChain(value)
    // You can add additional logic here if needed
  }

  const [paymentDetails, setPaymentDetails] = useState<PaymentDetailsType>({
    blockchain: Chain.Poly,
    currency: "USD",
    settlementCurrency: "USD",
  })
  const [depositAddress, setDepositAddress] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("")
  const [paymentIntent, setPaymentIntent] = useState<any>(null)

  const handlePaymentDetailsChange = (field, value) => {
    setPaymentDetails((prev) => ({ ...prev, [field]: value }))
  }

  const circle = new Circle(
    process.env.NEXT_PUBLIC_CIRCLE_SANDBOX_API_KEY!,
    CircleEnvironments.sandbox
  )

  async function createCryptoPaymentIntent(paymentDetails: PaymentDetailsType) {
    try {
      const reqBody: PaymentIntentCreationRequest = {
        amount: {
          amount: investAmount,
          currency: paymentDetails.currency,
        },
        settlementCurrency: paymentDetails.settlementCurrency,
        paymentMethods: [
          {
            type: "blockchain",
            chain: paymentDetails.blockchain,
          },
        ],
        idempotencyKey: crypto.randomUUID(),
      }

      const resp = await circle.cryptoPaymentIntents.createPaymentIntent(
        reqBody
      )
      console.log(resp.data)
      return resp.data.data
    } catch (error) {
      console.log("Error", error)
      alert("Error in creating crypto payment intent")
    }
  }

  // Create promise that gets resolved in time milliseconds
  function delay(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time))
  }

  async function getPaymentIntent(paymentInentId: string) {
    const resp = await circle.cryptoPaymentIntents.getPaymentIntent(
      paymentInentId
    )

    return resp.data
  }

  async function pollPaymentIntent() {
    if (!paymentDetails) return
    try {
      toast({
        title: "Creating Payment Intent",
        description: "Please wait while we create your payment intent",
      })
      const paymentIntent = await createCryptoPaymentIntent(paymentDetails)
      console.log("Payment Intent", paymentIntent)

      if (!paymentIntent) return
      setPaymentIntent(paymentIntent.id)
      const paymentInentId = paymentIntent.id
      const pollInterval = 500 // Interval (in ms) by which to poll

      let resp = undefined
      while (true) {
        resp = await getPaymentIntent(paymentInentId as string)
        let depositAddress = resp.data?.paymentMethods[0].address

        if (depositAddress) {
          setDepositAddress(depositAddress)
          break
        }
        await delay(pollInterval)
      }
      console.log(resp)
    } catch (error) {
      console.log("Error", error)
      alert("Error in fetching address")
    }
  }

  const activeAccount = useActiveAccount()

  const signPaymentTransaction = async () => {
    if (!paymentDetails || !activeAccount || !paymentIntent) return
    try {
      const url = `https://api-sandbox.circle.com/v1/payments/presign?paymentIntentId=${paymentIntent}&endUserAddress=${activeAccount.address}`

      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CIRCLE_SANDBOX_API_KEY}`,
        },
      })

      const data = await res.json()
      console.log("data", data)
      const typedData = data.data.typedData
      console.log("typedData", typedData)

      const generatedTypedData = {
        domain: {
          chainId: 80002, // Amoy Chain ID
          name: typedData.domain.name,
          verifyingContract: typedData.domain.verifyingContract,
          version: typedData.domain.version,
        },
        message: typedData.message,
        primaryType: typedData.primaryType,
        types: typedData.types,
      }

      console.log("generatedTypedData", generatedTypedData)
      const signature = await activeAccount.signTypedData(generatedTypedData)

      console.log("Signature:", signature)

      if (signature) {
        handleCircleCryptopayment({ generatedTypedData, signature })
      }
    } catch (error) {
      console.log("Error in signing payment transaction", error)
    }
  }

  const handleCircleCryptopayment = async ({
    generatedTypedData,
    signature,
  }: {
    generatedTypedData: any
    signature: any
  }) => {
    try {
      const PaymentBody = {
        idempotencyKey: crypto.randomUUID(),
        paymentIntentId: paymentIntent,
        protocolMetadata: {
          type: generatedTypedData.primaryType,
          metaTxNonce: generatedTypedData.message.nonce,
          signatureValidAfter: generatedTypedData.message.validAfter,
          signatureValidBefore: generatedTypedData.message.validBefore,
          rawSignature: signature,
        },
      }

      const res = await fetch(
        "https://api-sandbox.circle.com/v1/payments/crypto",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_CIRCLE_SANDBOX_API_KEY}`,
          },
          body: JSON.stringify(PaymentBody),
        }
      )
      const data = await res.json()
      console.log("data", data)

      alert("Payment Successful")
    } catch (error) {
      console.log("Error", error)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center justify-self-center pt-4">
      <div className="my-6 rounded-lg border p-4">
        <h2 className="mb-4 text-xl font-bold">Crypto Payment</h2>
        <div className="mb-4">
          <label
            htmlFor="blockchain"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Select Blockchain
          </label>
          <Select
            onValueChange={(value) =>
              handlePaymentDetailsChange("blockchain", value)
            }
            value={paymentDetails.blockchain}
          >
            <SelectTrigger id="blockchain" className="w-full">
              <SelectValue placeholder="Select Blockchain" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ETH">Ethereum</SelectItem>
              <SelectItem value="POLY">Polygon</SelectItem>
              <SelectItem value="ALGO">Algorand</SelectItem>
              <SelectItem value="BASE">Base</SelectItem>
              <SelectItem value="SOL">Solana</SelectItem>
              <SelectItem value="ARB">Arbitrum</SelectItem>
              <SelectItem value="AVAX">Avalanche C-Chain</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mb-4">
          <label
            htmlFor="amount"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Amount
          </label>
          <Input
            id="amount"
            type="number"
            readOnly
            placeholder="Enter amount"
            value={investAmount}
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="currency"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Select Currency
          </label>
          <Select
            onValueChange={(value) =>
              handlePaymentDetailsChange("currency", value)
            }
            value={paymentDetails.currency}
          >
            <SelectTrigger id="currency" className="w-full">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD</SelectItem>
              <SelectItem value="BTC">BTC</SelectItem>
              <SelectItem value="ETH">ETH</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={pollPaymentIntent} className="w-full">
          Initiate Payment
        </Button>

        {paymentStatus && (
          <div className="mt-2">
            <p>Payment Status: {paymentStatus}</p>
          </div>
        )}
      </div>

      {depositAddress && (
        <div className="mt-4">
          <p>
            You need to send {investAmount} {paymentDetails.currency} to the
            following address: {depositAddress}
          </p>
          <Button onClick={signPaymentTransaction}>
            Sign Payment Transaction
          </Button>
        </div>
      )}
    </div>
  )
}

export default CrossChainDeposit
