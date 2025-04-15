"use client"

// This is not a complete file, just the function to fix in your existing component

// Replace your existing sendInvitation function with this one:
import { useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const supabase = createClientComponentClient()

const sendInvitation = async (
  userId: string,
  lobbyId: string,
  showNotification: (message: string, type: "success" | "error" | "info") => void,
  fetchInvitations: () => void,
) => {
  const [isLoading, setIsLoading] = useState(false)

  setIsLoading(true)
  try {
    // Get the current user's ID
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const currentUserId = user?.id

    if (!currentUserId) {
      showNotification("You must be logged in to send invitations.", "error")
      setIsLoading(false)
      return
    }

    console.log("Sending invitation:", {
      senderId: currentUserId,
      recipientId: userId,
      lobbyId,
    })

    const response = await fetch("/api/lobby/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        senderId: currentUserId, // Include the sender's ID
        recipientId: userId,
        lobbyId,
      }),
    })

    const data = await response.json()
    console.log("Invitation response:", data)

    if (data.success) {
      showNotification("Your invitation has been sent successfully.", "success")
      // Refresh invitations
      fetchInvitations()
    } else {
      showNotification(data.error || "Failed to send invitation. Please try again.", "error")
      console.error("Invitation error details:", data.details)
    }
  } catch (error) {
    console.error("Error sending invitation:", error)
    showNotification("Failed to send invitation. Please try again.", "error")
  } finally {
    setIsLoading(false)
  }
}
