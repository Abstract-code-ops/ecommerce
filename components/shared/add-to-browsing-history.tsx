'use client'
import useBrowsingHistory from "@/lib/hooks/useBrowsingHistory"
import { useEffect } from "react"

export default function AddToBrowsingHistory({
    id,
    category,
}:{
    id: string, category: string
}) {
    const { addItem } = useBrowsingHistory()
    console.log(addItem)

    useEffect(() => {
        addItem({ id, category })
    },[])

    return null
}