import { Header } from '@/components/landing/Header'
import { Hero } from '@/components/landing/Hero'
import { Metrics } from '@/components/landing/Metrics'
import { Fluency } from '@/components/landing/Fluency'
import { Reasons } from '@/components/landing/Reasons'
import Footer  from '@/components/footer'
import  Navbar  from '@/components/navbar'

export default function Home() {
  return (
    <>
      <Navbar />
      <Header />
      <Hero />
      <Metrics>
      <Fluency />
      </Metrics>
      <Reasons />
      <Footer />
    </>
  )
}