import { Monitor, File, Box, Clipboard, ClipboardPenLine, BookmarkCheck, User2Icon } from "lucide-react"
export const SidebarConfig = [
    {label: "POS", link:'/', icon: Monitor},
    {label: "RECORDS", link:'/records', icon: File},
    {label: "INVENTORY", link:'/inventory', icon: Box},
    {label: "QUEUE", link:'/queue', icon: Clipboard},
    {label: "RECIPE", link:'/recipe',  icon: ClipboardPenLine},
    {label: "INVOICE", link:'/invoice', icon: BookmarkCheck},
    {label: "CASHIERS", link:'/cashier', icon: User2Icon},
]