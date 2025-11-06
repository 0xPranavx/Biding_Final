"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

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

interface UserTableProps {
  users: User[]
}

export const UserTable: React.FC<UserTableProps> = ({ users }) => {
  const router = useRouter()

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getStatusVariant = (soldFlag: string): "default" | "secondary" | "destructive" | "outline" => {
    return soldFlag === "true" ? "destructive" : "outline"
  }

  const getStatusText = (soldFlag: string): string => {
    return soldFlag === "Y" ? "Sold" : "Available"
  }

  const getPriceDifference = (bidPrice: number, startPrice: number): { amount: number; isPositive: boolean } => {
    const difference = bidPrice - startPrice
    return {
      amount: Math.abs(difference),
      isPositive: difference >= 0,
    }
  }

  const handleRowClick = (id: number) => {
    router.push(`/a3f9k2pxtq/${id}`)
  }

  return (
    <Card className="w-full border-0 bg-white shadow-lg">
      <CardHeader className="space-y-3 pb-6">
        <CardTitle className="text-2xl font-bold text-black">Players Auction</CardTitle>
        <CardDescription className="text-base text-gray-600">
          {users.length} player{users.length !== 1 ? "s" : ""} in the system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-gray-200 overflow-hidden">
          <Table>
            <TableHeader className="bg-gray-50 border-b border-gray-200">
              <TableRow>
                <TableHead className="w-[250px] font-semibold text-black text-sm py-4">Player</TableHead>
                <TableHead className="font-semibold text-black text-sm py-4">Type</TableHead>
                <TableHead className="text-right font-semibold text-black text-sm py-4">Start Price</TableHead>
                <TableHead className="text-right font-semibold text-black text-sm py-4">Current Bid</TableHead>
                <TableHead className="text-right font-semibold text-black text-sm py-4">Difference</TableHead>
                <TableHead className="text-center font-semibold text-black text-sm py-4">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-gray-500">
                    No players found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const priceDiff = getPriceDifference(user.user_bid_price, user.user_start_price)

                  return (
                    <TableRow
                      key={user.id}
                      onClick={() => handleRowClick(user.id)}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      {/* Player Info */}
                      <TableCell className="py-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-gray-300">
                            <AvatarImage
                              src={`https://qfgknkzzqdavctepawkf.supabase.co/storage/v1/object/public/users/${user.id}.png`}
                              alt={user.user_name}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-gray-200 text-black font-semibold">
                              {user.user_name[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col gap-1">
                            <span className="font-semibold text-sm text-black">{user.user_name}</span>
                            <span className="text-xs text-gray-500">ID: {user.id}</span>
                          </div>
                        </div>
                      </TableCell>

                      {/* User Type */}
                      <TableCell className="py-4">
                        <Badge variant="outline" className="capitalize border-gray-300 text-black bg-white">
                          {user.user_type}
                        </Badge>
                      </TableCell>

                      {/* Start Price */}
                      <TableCell className="text-right font-medium text-black py-4">
                        {formatCurrency(user.user_start_price)}
                      </TableCell>

                      {/* Current Bid */}
                      <TableCell className="text-right font-semibold text-black py-4">
                        {formatCurrency(user.user_bid_price)}
                      </TableCell>

                      {/* Price Difference */}
                      <TableCell className="text-right py-4">
                        {priceDiff.amount > 0 && (
                          <Badge
                            variant="outline"
                            className={`text-xs border-2 ${
                              priceDiff.isPositive
                                ? "border-black text-black bg-white"
                                : "border-gray-400 text-gray-600 bg-gray-50"
                            }`}
                          >
                            {priceDiff.isPositive ? "+" : "-"}
                            {formatCurrency(priceDiff.amount)}
                          </Badge>
                        )}
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center py-4">
                        <Badge
                          variant={getStatusVariant(user.user_sold_flg)}
                          className={`min-w-[80px] justify-center font-medium ${
                            user.user_sold_flg === "Y"
                              ? "bg-black text-white border-black"
                              : "border-gray-300 text-black bg-white"
                          }`}
                        >
                          {getStatusText(user.user_sold_flg)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary Stats */}
        {users.length > 0 && (
          <div className="flex flex-wrap gap-8 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="border-gray-300 text-black bg-white">
                Available
              </Badge>
              <span className="text-sm text-gray-600 font-medium">
                {users.filter((u) => u.user_sold_flg === "N").length} players
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-black text-white border-black">Sold</Badge>
              <span className="text-sm text-gray-600 font-medium">
                {users.filter((u) => u.user_sold_flg === "Y").length} players
              </span>
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <span className="text-sm text-gray-600 font-medium">
                Total Value: {formatCurrency(users.reduce((sum, user) => sum + user.user_bid_price, 0))}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
