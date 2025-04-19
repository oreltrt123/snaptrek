"use client"

import { useState } from "react"
import { Shield, Sword, Zap, Backpack } from "lucide-react"

interface InventoryDisplayProps {
  inventory: {
    weapons: string[]
    items: string[]
  }
}

export function InventoryDisplay({ inventory }: InventoryDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getWeaponIcon = (weapon: string) => {
    switch (weapon.toLowerCase()) {
      case "sword":
        return <Sword className="h-5 w-5 text-cyan-400" />
      case "axe":
        return <Sword className="h-5 w-5 text-red-400" />
      case "staff":
        return <Zap className="h-5 w-5 text-purple-400" />
      default:
        return <Sword className="h-5 w-5 text-gray-400" />
    }
  }

  const getItemIcon = (item: string) => {
    switch (item.toLowerCase()) {
      case "shield":
        return <Shield className="h-5 w-5 text-blue-400" />
      case "potion":
        return <Zap className="h-5 w-5 text-green-400" />
      default:
        return <Backpack className="h-5 w-5 text-gray-400" />
    }
  }

  if (inventory.weapons.length === 0 && inventory.items.length === 0) {
    return null
  }

  return (
    <div className="bg-gray-900/80 backdrop-blur-sm border border-purple-500/50 rounded-lg p-2 text-white">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold">Inventory</h3>
        <button onClick={() => setIsExpanded(!isExpanded)} className="text-xs text-purple-400 hover:text-purple-300">
          {isExpanded ? "Hide" : "Show"}
        </button>
      </div>

      {isExpanded && (
        <div className="grid gap-2">
          {inventory.weapons.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-400 mb-1">Weapons</h4>
              <div className="flex gap-2">
                {inventory.weapons.map((weapon, index) => (
                  <div
                    key={`weapon-${index}`}
                    className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded border border-gray-700"
                    title={weapon}
                  >
                    {getWeaponIcon(weapon)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {inventory.items.length > 0 && (
            <div>
              <h4 className="text-xs text-gray-400 mb-1">Items</h4>
              <div className="flex gap-2">
                {inventory.items.map((item, index) => (
                  <div
                    key={`item-${index}`}
                    className="flex items-center justify-center w-8 h-8 bg-gray-800 rounded border border-gray-700"
                    title={item}
                  >
                    {getItemIcon(item)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {!isExpanded && (
        <div className="flex gap-1">
          {inventory.weapons.slice(0, 2).map((weapon, index) => (
            <div
              key={`weapon-mini-${index}`}
              className="flex items-center justify-center w-6 h-6 bg-gray-800 rounded border border-gray-700"
              title={weapon}
            >
              {getWeaponIcon(weapon)}
            </div>
          ))}
          {inventory.items.slice(0, 2).map((item, index) => (
            <div
              key={`item-mini-${index}`}
              className="flex items-center justify-center w-6 h-6 bg-gray-800 rounded border border-gray-700"
              title={item}
            >
              {getItemIcon(item)}
            </div>
          ))}
          {inventory.weapons.length + inventory.items.length > 4 && (
            <div className="flex items-center justify-center w-6 h-6 bg-gray-800 rounded border border-gray-700">
              <span className="text-xs">+{inventory.weapons.length + inventory.items.length - 4}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
