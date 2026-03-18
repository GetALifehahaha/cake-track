import { Monitor, File, Box, Clipboard, ClipboardPenLine, BookmarkCheck, User2Icon, Coffee, ChartBar, CakeSlice, BadgePercentIcon } from "lucide-react"

export const SidebarConfig = [
    {
        label: "POS",
        link: '/',
        icon: Monitor,
        allowedRoles: ['admin', 'cashier'] // Cashier allowed
    },
    {
        label: "PRODUCTS",
        link: '/products',
        icon: Coffee,
        allowedRoles: ['admin']
    },
    {
        label: "DISCOUNTS",
        link: '/discounts',
        icon: BadgePercentIcon,
        allowedRoles: ['admin']
    },
    {
        label: "TRANSACTIONS",
        link: '/transactions',
        icon: File,
        allowedRoles: ['admin', 'cashier'] // Cashier allowed
    },
    {
        label: "REPORTS",
        link: '/reports',
        icon: ChartBar,
        allowedRoles: ['admin']
    },
    {
        label: "INVENTORY",
        link: '/inventory',
        icon: Box,
        allowedRoles: ['admin']
    },
    {
        label: "CAKE ORDERS",
        link: '/queue',
        icon: Clipboard,
        allowedRoles: ['admin']
    },
    {
        label: "CAKES",
        link: '/cakes',
        icon: CakeSlice,
        allowedRoles: ['admin']
    },
    {
        label: "RECIPE",
        link: '/recipe',
        icon: ClipboardPenLine,
        allowedRoles: ['admin']
    },
    {
        label: "BUSINESS DETAILS",
        link: '/details',
        icon: BookmarkCheck,
        allowedRoles: ['admin']
    },
    {
        label: "CASHIERS",
        link: '/cashier',
        icon: User2Icon,
        allowedRoles: ['admin']
    },
]