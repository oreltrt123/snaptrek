"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Coins, CreditCard } from "lucide-react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// We'll initialize Stripe later to ensure the key is available
let stripePromise: ReturnType<typeof loadStripe> | null = null

interface CoinPackage {
  id: string
  coins: number
  price: number
  bestValue?: boolean
}

interface CoinPurchaseModalProps {
  onClose: () => void
  onPurchaseComplete: (coins: number) => void
  userId: string
}

export function CoinPurchaseModal({ onClose, onPurchaseComplete, userId }: CoinPurchaseModalProps) {
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null)
  // Using eslint-disable-next-line for variables we need to set but don't directly use
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [paymentIntent, setPaymentIntent] = useState<string | null>(null)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [notification, setNotification] = useState<{
    type: "success" | "error"
    title: string
    message: string
  } | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [stripeKey, setStripeKey] = useState<string>("")

  // Fetch the Stripe key from the server
  useEffect(() => {
    async function getStripeKey() {
      try {
        const response = await fetch("/api/get-stripe-key")
        const data = await response.json()

        if (data.publishableKey) {
          setStripeKey(data.publishableKey)
          // Initialize Stripe only after we have the key
          stripePromise = loadStripe(data.publishableKey)
        } else {
          setNotification({
            type: "error",
            title: "Configuration Error",
            message: "Could not load payment configuration. Please try again later.",
          })
        }
      } catch (error) {
        console.error("Error fetching Stripe key:", error)
        setNotification({
          type: "error",
          title: "Configuration Error",
          message: "Could not load payment configuration. Please try again later.",
        })
      }
    }

    getStripeKey()
  }, [])

  // Coin packages
  const coinPackages: CoinPackage[] = [
    {
      id: "basic",
      coins: 1000,
      price: 3,
    },
    {
      id: "premium",
      coins: 3000,
      price: 30,
      bestValue: true,
    },
    {
      id: "ultimate",
      coins: 4000,
      price: 35,
    },
  ]

  const handleSelectPackage = async (pkg: CoinPackage) => {
    if (!stripePromise) {
      setNotification({
        type: "error",
        title: "Payment Not Available",
        message: "Payment system is not available at the moment. Please try again later.",
      })
      return
    }

    setSelectedPackage(pkg)

    try {
      // Create a payment intent on the server
      const response = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: pkg.price * 100, // Convert to cents
          userId,
          packageId: pkg.id,
          coins: pkg.coins,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create payment intent")
      }

      const data = await response.json()
      setPaymentIntent(data.id)
      setClientSecret(data.clientSecret)
    } catch (error) {
      console.error("Error creating payment intent:", error)
      setNotification({
        type: "error",
        title: "Error",
        message: "Failed to initialize payment. Please try again.",
      })

      // Clear notification after 3 seconds
      setTimeout(() => setNotification(null), 3000)
    }
  }

  const handleBackToPackages = () => {
    setSelectedPackage(null)
    setPaymentIntent(null)
    setClientSecret(null)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-gray-900 border-purple-500">
        {notification && (
          <Alert
            className={
              notification.type === "error" ? "bg-red-900/50 border-red-500" : "bg-green-900/50 border-green-500"
            }
          >
            <AlertTitle>{notification.title}</AlertTitle>
            <AlertDescription>{notification.message}</AlertDescription>
          </Alert>
        )}

        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">Purchase Rebels Coins</DialogTitle>
          <DialogDescription className="text-gray-300">
            Buy Rebels Coins to unlock characters and gear in the store.
          </DialogDescription>
        </DialogHeader>

        {!selectedPackage ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
            {coinPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`bg-gray-800 border-2 hover:bg-gray-700 transition-all cursor-pointer ${
                  pkg.bestValue ? "border-yellow-500" : "border-gray-700"
                }`}
                onClick={() => handleSelectPackage(pkg)}
              >
                {pkg.bestValue && (
                  <div className="bg-yellow-500 text-black text-xs font-bold py-1 px-2 text-center">BEST VALUE</div>
                )}
                <CardContent className="pt-6 pb-2 text-center">
                  <Coins className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-white">{pkg.coins.toLocaleString()}</h3>
                  <p className="text-gray-400">Rebels Coins</p>
                </CardContent>
                <CardFooter className="pt-2 pb-6 flex justify-center">
                  <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700">
                    ${pkg.price.toFixed(2)}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : clientSecret && stripePromise ? (
          <div className="py-4">
            <div className="mb-4 p-4 bg-gray-800 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-300">Package:</span>
                <span className="font-bold text-white">{selectedPackage.coins.toLocaleString()} Rebels Coins</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Price:</span>
                <span className="font-bold text-white">${selectedPackage.price.toFixed(2)}</span>
              </div>
            </div>

            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <CheckoutForm
                onSuccess={() => onPurchaseComplete(selectedPackage.coins)}
                packageId={selectedPackage.id}
                coins={selectedPackage.coins}
                userId={userId}
                setNotification={setNotification}
              />
            </Elements>

            <Button variant="outline" className="mt-4 w-full" onClick={handleBackToPackages}>
              Back to Packages
            </Button>
          </div>
        ) : (
          <div className="py-10 flex justify-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface CheckoutFormProps {
  onSuccess: () => void
  packageId: string
  coins: number
  userId: string
  setNotification: (
    notification: {
      type: "success" | "error"
      title: string
      message: string
    } | null,
  ) => void
}

function CheckoutForm({ onSuccess, packageId, coins, userId, setNotification }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [processing, setProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setProcessing(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/payment-success",
        },
        redirect: "if_required",
      })

      if (error) {
        setErrorMessage(error.message || "An error occurred during payment")
        setProcessing(false)
        return
      }

      if (paymentIntent && paymentIntent.status === "succeeded") {
        // Instead of trying to update the database directly from the client,
        // we'll call a server endpoint to handle the database operations
        try {
          const response = await fetch("/api/update-coins", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              userId,
              coins,
              packageId,
            }),
          })

          const responseData = await response.json()

          if (!response.ok) {
            console.error("API error response:", responseData)
            throw new Error(responseData.error || "Failed to update coins")
          }

          console.log("Coins updated successfully:", responseData)

          // Update local storage with the new balance for persistence
          if (responseData.newBalance) {
            localStorage.setItem("userCoins", responseData.newBalance.toString())
          }

          setNotification({
            type: "success",
            title: "Payment Successful",
            message: `You've successfully purchased ${coins} Rebels Coins!`,
          })

          // Force a page reload to ensure the UI reflects the updated coin balance
          setTimeout(() => {
            window.location.reload()
          }, 2000)

          // Call onSuccess to update the UI immediately
          onSuccess()
        } catch (updateError) {
          console.error("Error updating coins:", updateError)

          // Even if the database update fails, we'll still consider the purchase successful
          // since the payment went through. We'll just show a different message.
          setNotification({
            type: "success",
            title: "Payment Processed",
            message: "Your payment was successful! Your coins will be added to your account shortly.",
          })

          // Still call onSuccess to update the UI
          onSuccess()

          // Force a page reload after a delay
          setTimeout(() => {
            window.location.reload()
          }, 2000)
        }
      }
    } catch (err) {
      console.error("Payment error:", err)
      setErrorMessage("An unexpected error occurred")
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PaymentElement />
      {errorMessage && <div className="text-red-500 mt-2 text-sm">{errorMessage}</div>}
      <Button
        type="submit"
        disabled={!stripe || processing}
        className="mt-4 w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
      >
        {processing ? (
          <div className="flex items-center">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Processing...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${(coins / 1000).toFixed(2)}
          </div>
        )}
      </Button>
    </form>
  )
}
