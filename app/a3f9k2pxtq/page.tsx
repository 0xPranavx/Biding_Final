"use client"

import { useEffect, useState, useMemo } from "react"
import { supabase } from "@/lib/supabaseClient"
import { UserTable } from "@/components/UserTable"
import { Search, Users, Loader } from "lucide-react"

type User = {
  id: number
  created_at: string
  user_name: string
  user_type: string
  user_bid_price: number
  user_start_price: number
  user_sold_flg: string
  user_owner_id: number | null
  user_profile_url: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)
      const { data, error } = await supabase.from("users").select("*").order("id", { ascending: true })

      if (error) {
        console.error("Error fetching users:", error)
      } else {
        setUsers(data || [])
      }
      setLoading(false)
    }

    fetchUsers()
  }, [])

  // Client-side search with useMemo for optimization
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users

    const query = searchQuery.toLowerCase().trim()
    return users.filter((user) => user.user_name.toLowerCase().includes(query))
  }, [users, searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader className="w-8 h-8 animate-spin text-black mx-auto" />
          <p className="text-gray-600 font-medium">Loading players...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center">
            <div className="p-4 bg-black rounded-full shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
          </div>
          <div className="space-y-3">
            <h1 className="text-5xl font-bold text-black tracking-tight">Players Management</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Browse and manage all players in the system. Use the search below to find specific players.
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto w-full">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search players by name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg 
                       bg-white shadow-sm focus:ring-2 focus:ring-black focus:border-black 
                       text-base placeholder-gray-500 transition-all duration-200 font-medium text-black"
            />
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-3 text-center font-medium">
              Showing {filteredUsers.length} of {users.length} players
              {searchQuery && ` matching "${searchQuery}"`}
            </p>
          )}
        </div>

        {/* User Table */}
        <div className="w-full">
          <UserTable users={filteredUsers} />

          {filteredUsers.length === 0 && searchQuery && (
            <div className="text-center py-16 bg-white rounded-lg border border-gray-200 mt-6 space-y-4">
              <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-black">No players found</h3>
                <p className="text-gray-600">
                  No players match your search for "<span className="font-semibold">{searchQuery}</span>" Try adjusting
                  your search terms.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Footer */}
        <div className="flex justify-center">
          <div className="inline-flex items-center gap-8 bg-white rounded-lg px-8 py-6 shadow-md border border-gray-200">
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-black">{users.length}</div>
              <div className="text-sm text-gray-600 font-medium">Total Players</div>
            </div>
            <div className="h-10 w-px bg-gray-300"></div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-black">
                {users.filter((u) => u.user_sold_flg === "Y").length}
              </div>
              <div className="text-sm text-gray-600 font-medium">Sold Players</div>
            </div>
            <div className="h-10 w-px bg-gray-300"></div>
            <div className="text-center space-y-2">
              <div className="text-3xl font-bold text-black">
                {users.filter((u) => u.user_sold_flg === "N").length}
              </div>
              <div className="text-sm text-gray-600 font-medium">Available Players</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
