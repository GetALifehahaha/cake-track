import { ComputerIcon, File, Box, Clipboard, ClipboardPenLine, BookmarkCheck, } from "lucide-react"
export const SidebarConfig = [
    {label: "POS", link:'/', icon: ComputerIcon},
    {label: "RECORDS", link:'/records', icon: File},
    {label: "INVENTORY", link:'/inventory', icon: Box},
    {label: "QUEUE", link:'/queue', icon: Clipboard},
    {label: "RECIPE", link:'/recipe',  icon: ClipboardPenLine},
    {label: "INVOICE", link:'/invoice', icon: BookmarkCheck},
]