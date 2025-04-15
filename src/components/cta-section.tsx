import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="py-20 bg-gradient-to-r from-purple-900 to-cyan-900">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-4xl font-bold mb-4 text-white">Ready to Join the Battle?</h2>
        <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
          Create your account now and get 5 free character tokens to start building your collection!
        </p>
        <Link href="/signup">
          <Button size="lg" className="bg-white text-purple-900 hover:bg-gray-200 px-8 py-6 text-lg font-bold">
            Create Free Account
          </Button>
        </Link>
      </div>
    </section>
  )
}
