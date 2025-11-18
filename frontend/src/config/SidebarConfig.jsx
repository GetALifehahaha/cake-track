import { Monitor, File, Box, Clipboard, ClipboardPenLine, BookmarkCheck, User2Icon, Coffee, ChartBar } from "lucide-react"
export const SidebarConfig = [
    {label: "POS", link:'/', icon: Monitor},
    {label: "PRODUCTS", link:'/products', icon: Coffee},
    {label: "TRANSACTIONS", link:'/transactions', icon: File},
    {label: "REPORTS", link:'/reports', icon: ChartBar},
    {label: "INVENTORY", link:'/inventory', icon: Box},
    {label: "QUEUE", link:'/queue', icon: Clipboard},
    {label: "RECIPE", link:'/recipe',  icon: ClipboardPenLine},
    {label: "INVOICE", link:'/invoice', icon: BookmarkCheck},
    {label: "CASHIERS", link:'/cashier', icon: User2Icon},
]