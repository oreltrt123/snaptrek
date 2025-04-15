"use client"

import { usePathname } from "next/navigation"

export default function Footer() {
  const pathname = usePathname()
  if (
    pathname === "/login" ||
    pathname === "/s" ||
    pathname.includes("/dashboard") ||
    pathname.includes("/invite") ||
    pathname.includes("/s/") ||
    pathname.includes("/onboarding") ||
    pathname.includes("/record") ||
    (typeof window !== "undefined" && window.location.href.includes("snaptrek.social"))
  )
    return null

  return (
    <footer className="p-5">
      <div
        style={{ boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.25)" }}
        className="mx-auto max-w-[1400px] bg-black border-[1px] border-gray-900 p-8 lg:p-12 rounded-[20px] mb-10 relative overflow-hidden"
      >
        <div className="sm:grid space-y-8 sm:space-y-0 grid-cols-1 lg:grid-cols-12 gap-8 sm:items-start sm:justify-between z-10 relative">
          <div className="space-y-2 sm:space-y-4 col-span-12 lg:col-span-6">
            <div className="w-full">
              <p className="text-gray-400 max-w-md">
                SnapTrek - Share your journey, connect with travelers, and discover amazing destinations worldwide
              </p>
            </div>
            <p className="text-gray-600">© SnapTrek Social, Inc. {new Date().getFullYear()}.</p>
            <div className="flex space-x-3">
              <a className="text-gray-600 text-sm hover:text-gray-300" href="/terms">
                Terms of Service
              </a>
              <a className="text-gray-600 text-sm hover:text-gray-300" href="/privacy">
                Privacy Policy
              </a>
            </div>
          </div>
          <div className="space-y-4 col-span-12 sm:col-span-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white">Product</h3>
            <ul className="space-y-2">
              <li>
                <a href="/docs" className="text-gray-400 hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="/pricing" className="text-gray-400 hover:text-white">
                  Premium Features
                </a>
              </li>
              <li>
                <a href="/download" className="text-gray-400 hover:text-white">
                  Mobile Apps
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4 col-span-12 sm:col-span-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white">Help</h3>
            <ul className="space-y-2">
              <li>
                <a href="/faq" className="text-gray-400 hover:text-white">
                  FAQs
                </a>
              </li>
              <li>
                <a href="mailto:support@snaptrek.social" className="text-gray-400 hover:text-white">
                  Email Support
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/snaptrek"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  Community Support
                </a>
              </li>
            </ul>
          </div>
          <div className="space-y-4 col-span-12 sm:col-span-6 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white">Socials</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://x.com/SnapTrek"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  X (@SnapTrek)
                </a>
              </li>
              <li>
                <a
                  href="https://discord.gg/snaptrek"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  Discord
                </a>
              </li>
              <li>
                <a
                  href="https://www.instagram.com/snaptrek"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href="https://www.tiktok.com/@snaptrek"
                  target="_blank"
                  rel="noreferrer"
                  className="text-gray-400 hover:text-white"
                >
                  TikTok
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
