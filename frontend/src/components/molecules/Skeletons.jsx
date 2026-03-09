// ─────────────────────────────────────────────────────────────────────────────
// Shared pulse animation utility
// Add this to your global CSS or tailwind config:
//   @keyframes shimmer { 0%{background-position:-400px 0} 100%{background-position:400px 0} }
//   .skeleton { background: linear-gradient(90deg, #e8e8e8 25%, #f5f5f5 50%, #e8e8e8 75%);
//               background-size: 400px 100%; animation: shimmer 1.4s ease infinite; }
// Or simply use Tailwind's `animate-pulse` + `bg-main-dark/20` as shown below.
// ─────────────────────────────────────────────────────────────────────────────

import ModalBody from "./ModalBody";
import { X } from "lucide-react";

const Bone = ({ className = '' }) => (
  <div className={`animate-pulse bg-main-dark/20 rounded-md ${className}`} />
);

// ─────────────────────────────────────────────────────────────────────────────
// BusinessDetails Skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const BusinessDetailsSkeleton = () => (
  <div className="grid grid-cols-2 w-full h-full gap-4 mb-4">
      {/* LEFT COLUMN */}
      <div className="flex flex-col gap-4">
          {/* Business Details + TIN combined */}
          <div className="p-6 rounded-sm bg-main-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                  <Bone className="h-5 w-40" />
              </div>
              <Bone className="h-3 w-24 mb-2" />
              <Bone className="h-8 w-full rounded-md mb-4" />
              <Bone className="h-3 w-20 mb-2" />
              <Bone className="h-8 w-full rounded-md mb-4" />
              <Bone className="h-3 w-10 mb-2" />
              <Bone className="h-8 w-full rounded-md" />
          </div>

          {/* Secret PIN */}
          <div className="p-6 rounded-sm bg-main-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                  <Bone className="h-5 w-24" />
              </div>
              <Bone className="h-3 w-16 mb-2" />
              <div className="flex gap-2 items-center">
                  <Bone className="h-8 flex-1 rounded-md" />
                  <Bone className="h-6 w-6 rounded-full" />
              </div>
          </div>
      </div>

      {/* RIGHT COLUMN */}
      <div className="flex flex-col gap-4">
          {/* Contact and Message */}
          <div className="p-6 rounded-sm bg-main-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                  <Bone className="h-5 w-48" />
              </div>
              <Bone className="h-3 w-32 mb-2" />
              <Bone className="h-8 w-full rounded-md mb-4" />
              <Bone className="h-3 w-20 mb-2" />
              <Bone className="h-20 w-full rounded-md" />
          </div>

          {/* Personal Information */}
          <div className="p-6 rounded-sm bg-main-white shadow-sm">
              <div className="flex items-center justify-between mb-4">
                  <Bone className="h-5 w-44" />
              </div>
              <div className="flex gap-4 mb-4">
                  <div className="flex-1">
                      <Bone className="h-3 w-20 mb-2" />
                      <Bone className="h-8 w-full rounded-md" />
                  </div>
                  <div className="flex-1">
                      <Bone className="h-3 w-20 mb-2" />
                      <Bone className="h-8 w-full rounded-md" />
                  </div>
              </div>
              <Bone className="h-3 w-28 mb-2" />
              <Bone className="h-8 w-full rounded-md" />
          </div>
      </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Cashier Skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const CashierSkeleton = () => (
  <div className="flex-1 flex p-2 gap-4 w-full h-full flex-col">
    <div className="border-accent-mute border rounded-lg p-4">
      {/* Header */}
      <div className="flex flex-row justify-between items-center mb-4">
        <Bone className="h-6 w-24" />
        <Bone className="h-8 w-32 rounded-md" />
      </div>

      {/* Table header */}
      <div className="p-2 bg-accent-mute/30 rounded-lg flex flex-row items-center gap-4 mb-2">
        {['flex-1','flex-1','flex-1','flex-1'].map((cls, i) => (
          <Bone key={i} className={`h-4 ${cls}`} />
        ))}
      </div>

      {/* Table rows */}
      <div className="flex flex-col min-h-120">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="p-2 flex flex-row gap-4 border-b border-border">
            <Bone className="h-5 flex-1" />
            <Bone className="h-5 flex-1" />
            <Bone className="h-5 flex-1" />
            <Bone className="h-5 w-6 mx-auto rounded-full" />
          </div>
        ))}
        {/* Pagination */}
        <div className="mt-auto mx-auto flex gap-2 pt-4">
          <Bone className="h-8 w-20 rounded-md" />
          <Bone className="h-8 w-20 rounded-md" />
        </div>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Inventory Skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const InventorySkeleton = () => (
  <div className="flex-1 flex p-2 gap-4 w-full h-full flex-col">
    {/* Dashboard cards */}
    <div className="h-fit w-full flex gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex-1 p-4 rounded-xl border border-border bg-main-white">
          <Bone className="h-3 w-20 mb-3" />
          <Bone className="h-8 w-12 mb-2" />
          <Bone className="h-3 w-16" />
        </div>
      ))}
    </div>

    {/* Header */}
    <div className="flex flex-row justify-between items-center">
      <Bone className="h-6 w-44" />
      <div className="flex gap-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Bone key={i} className="h-8 w-28 rounded-md" />
        ))}
      </div>
    </div>

    {/* Table */}
    <div className="mt-2 flex flex-col min-h-120">
      <div className="p-2 py-3 bg-accent-mute/30 rounded-t-lg flex flex-row gap-4">
        <Bone className="h-4 w-6" />
        <Bone className="h-4 flex-1" />
        <Bone className="h-4 flex-1" />
        <Bone className="h-4 flex-1" />
        <Bone className="h-4 w-6" />
      </div>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="p-2.5 flex flex-row gap-4 items-center border-b-2 border-b-main-dark bg-main-white">
          <Bone className="h-4 w-6" />
          <Bone className="h-4 flex-1" />
          <Bone className="h-4 flex-1" />
          <div className="flex-1 flex gap-2 items-center">
            <Bone className="h-6 w-20 rounded-full" />
          </div>
          <Bone className="h-4 w-4" />
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Recipe Skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const RecipeSkeleton = () => (
  <div className="h-full flex flex-col p-6">
    <Bone className="h-7 w-28 mb-8" />
    <div className="border-accent-mute border rounded-lg p-6 flex-1 flex flex-col bg-accent-mute/5">
      <div className="ml-auto mb-6">
        <Bone className="h-9 w-32 rounded-md" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex flex-col p-4 bg-main-white rounded-lg shadow-sm border border-border/50 min-h-52">
            <Bone className="h-5 w-3/4 mb-3 mt-2" />
            <Bone className="h-3 w-20 mb-3" />
            <div className="flex flex-col gap-2">
              <Bone className="h-3 w-full" />
              <Bone className="h-3 w-5/6" />
              <Bone className="h-3 w-4/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Records Skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const RecordsSkeleton = () => (
  <div className="p-6 flex flex-col gap-4">
    <Bone className="h-7 w-28" />
    <div className="border border-border rounded-xl p-4 flex flex-col gap-3">
      {Array.from({ length: 10 }).map((_, i) => (
        <Bone key={i} className="h-10 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// QueueAccepted Skeleton  (also used by QueueReady — same layout)
// ─────────────────────────────────────────────────────────────────────────────
export const QueueAcceptedSkeleton = () => (
  <div className="flex flex-col min-h-140">
    {/* Filter bar */}
    <div className="p-2 flex items-center gap-4 py-4 border-b border-main-dark">
      <Bone className="h-9 w-60 rounded-md" />
    </div>

    {/* Cards grid */}
    <div className="grid grid-cols-5 gap-4 mt-8">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-border bg-main-white p-4 flex flex-col gap-3 min-h-52">
          <div className="flex justify-between">
            <Bone className="h-4 w-20" />
            <Bone className="h-4 w-16" />
          </div>
          <Bone className="h-3 w-32 mt-1" />
          <Bone className="h-3 w-24" />
          <div className="mt-auto">
            <Bone className="h-8 w-full rounded-md" />
          </div>
        </div>
      ))}
    </div>

    {/* Pagination */}
    <div className="flex justify-center gap-2 mt-6">
      <Bone className="h-8 w-20 rounded-md" />
      <Bone className="h-8 w-20 rounded-md" />
    </div>
  </div>
);

// Re-export alias — QueueReady has identical layout
export const QueueReadySkeleton = QueueAcceptedSkeleton;

// ─────────────────────────────────────────────────────────────────────────────
// QueueCompleted / QueueRejected Skeleton  (same table layout)
// ─────────────────────────────────────────────────────────────────────────────
export const QueueCompletedSkeleton = () => (
  <div className="w-full p-4 border-border border-2 rounded-xl">
    <div className="pb-4">
      <Bone className="h-6 w-52" />
    </div>
    {/* Table header */}
    <div className="flex flex-row items-center bg-accent-mute/30 rounded-t-xl px-2 py-2 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Bone key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Table rows */}
    <div className="flex flex-col gap-2 py-2 min-h-100">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="flex w-full gap-4 py-2 border-b-2 border-b-main-dark items-center">
          {Array.from({ length: 6 }).map((_, j) => (
            <Bone key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
      {/* Pagination */}
      <div className="mt-auto flex justify-center gap-2 pt-2">
        <Bone className="h-8 w-20 rounded-md" />
        <Bone className="h-8 w-20 rounded-md" />
      </div>
    </div>
  </div>
);

export const QueueRejectedSkeleton = QueueCompletedSkeleton;

// ─────────────────────────────────────────────────────────────────────────────
// QueueOrderAvailability Skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const QueueOrderAvailabilitySkeleton = () => (
  <div className="flex flex-col gap-6">
    {/* Top cards */}
    <div className="flex gap-4">
      {/* Operating Hours card */}
      <div className="flex-1 p-5 bg-main-white rounded-xl border border-border">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Bone className="h-8 w-8 rounded-lg" />
            <Bone className="h-5 w-36" />
          </div>
          <Bone className="h-4 w-10" />
        </div>
        <Bone className="h-12 w-full rounded-lg mb-3" />
        <Bone className="h-3 w-20 mb-2" />
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: 7 }).map((_, i) => (
            <Bone key={i} className="h-6 w-10 rounded-full" />
          ))}
        </div>
      </div>

      {/* Summary card */}
      <div className="flex-1 p-5 bg-main-white rounded-xl border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Bone className="h-8 w-8 rounded-lg" />
          <Bone className="h-5 w-44" />
        </div>
        <div className="grid grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center justify-center p-3 bg-main-dark/30 rounded-lg gap-2">
              <Bone className="h-8 w-10" />
              <Bone className="h-3 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Blocked Dates table */}
    <div className="p-5 bg-main-white rounded-xl border border-border">
      <div className="flex justify-between items-center pb-4 border-b border-b-border mb-3">
        <Bone className="h-5 w-32" />
        <div className="flex gap-2">
          <Bone className="h-8 w-48 rounded-lg" />
          <Bone className="h-8 w-28 rounded-lg" />
        </div>
      </div>
      {/* Column headers */}
      <div className="flex items-center px-3 py-2 gap-4">
        <Bone className="h-4 w-4 rounded" />
        <Bone className="h-3 flex-1" />
        <Bone className="h-3 w-24" />
        <Bone className="h-3 w-16" />
      </div>
      {/* Rows */}
      <div className="flex flex-col gap-1 min-h-40">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center px-3 py-3 gap-4 border-b border-b-main-dark">
            <Bone className="h-4 w-4 rounded" />
            <div className="flex-1 flex flex-col gap-1">
              <Bone className="h-4 w-40" />
              <Bone className="h-3 w-24" />
            </div>
            <Bone className="h-6 w-20 rounded-full" />
            <Bone className="h-6 w-6 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// QueueOverview Skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const QueueOverviewSkeleton = () => (
  <div className="flex flex-col gap-4">
    {/* Top 3 cards */}
    <div className="flex flex-row gap-4 w-full">
      {/* Pending */}
      <div className="flex-1 p-4 bg-main-white rounded-xl border border-border">
        <div className="flex justify-between items-center pb-2 border-b border-b-border mb-3">
          <div className="flex gap-2 items-center">
            <Bone className="h-5 w-20" />
            <Bone className="h-5 w-6" />
          </div>
          <Bone className="h-4 w-16" />
        </div>
        <div className="flex flex-col gap-3 p-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex gap-2 items-center">
              <Bone className="h-4 flex-1" />
              <Bone className="h-6 w-20 rounded-full" />
              <Bone className="h-4 w-16" />
              <div className="flex gap-1">
                <Bone className="h-5 w-5 rounded-full" />
                <Bone className="h-5 w-5 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Due Soon */}
      <div className="flex-1 p-4 bg-main-white rounded-xl border border-border">
        <div className="flex justify-between items-center pb-2 border-b border-b-border mb-3">
          <Bone className="h-5 w-24" />
          <Bone className="h-4 w-16" />
        </div>
        <div className="flex flex-col gap-3 px-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex justify-between items-center">
              <Bone className="h-4 w-28" />
              <Bone className="h-4 w-20" />
            </div>
          ))}
        </div>
      </div>

      {/* Inventory Status */}
      <div className="flex-1 p-4 bg-main-white rounded-xl border border-border">
        <div className="flex justify-between items-center pb-2 border-b border-b-border mb-3">
          <Bone className="h-5 w-36" />
          <Bone className="h-4 w-16" />
        </div>
        <div className="grid grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col justify-center items-center p-4 gap-2">
              <Bone className="h-4 w-20" />
              <Bone className="h-8 w-10" />
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* Accepted Orders table */}
    <div className="flex-1 p-4 bg-main-white rounded-xl border border-border min-h-80">
      <Bone className="h-5 w-36 mb-4" />
      <div className="py-2 border-b border-b-border flex flex-row gap-4 mb-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bone key={i} className="h-4 flex-1" />
        ))}
      </div>
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex justify-between items-center py-2 border-b border-b-main-dark gap-4">
          {Array.from({ length: 6 }).map((_, j) => (
            <Bone key={j} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// QueuePending Skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const QueuePendingSkeleton = () => (
  <div className="flex flex-col min-h-140">
    {/* Filter bar */}
    <div className="p-2 flex items-center gap-4 py-4 border-b border-main-dark">
      <Bone className="h-9 w-60 rounded-md" />
    </div>

    {/* Cards grid */}
    <div className="grid grid-cols-5 gap-4 mt-8">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border p-6 bg-main-white flex flex-col gap-3 min-h-60">
          <div className="flex justify-between items-center">
            <Bone className="h-4 w-20" />
            <Bone className="h-4 w-4 rounded-full" />
          </div>
          <Bone className="h-3 w-32" />

          {/* Cake details block */}
          <div className="flex flex-col gap-1.5 mt-3">
            <Bone className="h-5 w-28" />
            <Bone className="h-3 w-36" />
            <Bone className="h-3 w-32" />
            <Bone className="h-3 w-28" />
            <Bone className="h-3 w-36" />
          </div>
        </div>
      ))}
    </div>

    {/* Pagination */}
    <div className="flex justify-center gap-2 mt-6">
      <Bone className="h-8 w-20 rounded-md" />
      <Bone className="h-8 w-20 rounded-md" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Transactions Skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const TransactionsSkeleton = () => (
  <div className="w-[90%] mx-auto flex flex-col gap-8">
    {/* Page title */}
    <Bone className="h-7 w-52" />

    {/* Today's Revenue banner */}
    <div className="px-4 py-2.5 rounded-md border border-border">
      <Bone className="h-5 w-64" />
    </div>

    {/* Main table card */}
    <div className="w-full p-4 border-border border-2 rounded-xl">
      {/* Date heading + DatePicker */}
      <div className="flex items-center mb-4">
        <Bone className="h-6 w-60" />
        <div className="flex-1" />
        <Bone className="h-9 w-60 rounded-md" />
      </div>

      {/* Table header bar */}
      <div className="flex flex-row items-center bg-accent-mute/30 rounded-t-2xl px-2 py-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Bone key={i} className="h-4 flex-1" />
        ))}
      </div>

      {/* Date group label */}
      <div className="mt-4 mb-2">
        <Bone className="h-5 w-40 rounded-md" />
      </div>

      {/* Transaction rows */}
      <div className="flex flex-col gap-2 py-2 min-h-[40vh]">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="flex w-full p-1 gap-4 items-center">
            <Bone className="h-4 flex-1" />
            <Bone className="h-4 flex-1" />
            <Bone className="h-4 flex-1" />
            <Bone className="h-6 w-16 rounded-full flex-1" />
            <Bone className="h-4 flex-1" />
            <Bone className="h-4 w-4 rounded-full" />
          </div>
        ))}
      </div>
    </div>

    {/* Pagination */}
    <div className="flex justify-center gap-2">
      <Bone className="h-8 w-20 rounded-md" />
      <Bone className="h-8 w-20 rounded-md" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Cakes Skeleton
// ─────────────────────────────────────────────────────────────────────────────
export const CakesSkeleton = () => (
  <div className="flex flex-col gap-8">
    {/* Action bar */}
    <div className="flex justify-between items-center">
      <Bone className="h-9 w-28 rounded-md" />
      <Bone className="h-9 w-28 rounded-md" />
    </div>

    {/* Product card grid — matches grid-cols-7 */}
    <div className="grid grid-cols-7 p-2 gap-4 w-full">
      {Array.from({ length: 14 }).map((_, i) => (
        <div key={i} className="flex flex-col rounded-xl border border-border bg-main-white overflow-hidden">
          {/* Image area */}
          <Bone className="h-28 w-full rounded-none" />
          {/* Card body */}
          <div className="p-3 flex flex-col gap-2">
            <Bone className="h-4 w-3/4" />
            <Bone className="h-3 w-1/2" />
            <Bone className="h-3 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Reports Skeleton  (generic — adapt once Reports.jsx is implemented)
// ─────────────────────────────────────────────────────────────────────────────
export const ReportsSkeleton = () => (
  <div className="flex flex-col p-6 gap-6">
    <Bone className="h-7 w-28" />

    {/* KPI row */}
    <div className="flex gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex-1 p-5 bg-main-white rounded-xl border border-border flex flex-col gap-2">
          <Bone className="h-3 w-24" />
          <Bone className="h-8 w-20" />
          <Bone className="h-3 w-16" />
        </div>
      ))}
    </div>

    {/* Chart placeholder */}
    <div className="p-6 bg-main-white rounded-xl border border-border">
      <Bone className="h-5 w-40 mb-6" />
      <Bone className="h-56 w-full rounded-lg" />
    </div>

    {/* Secondary charts row */}
    <div className="flex gap-4">
      <div className="flex-1 p-6 bg-main-white rounded-xl border border-border">
        <Bone className="h-5 w-32 mb-4" />
        <Bone className="h-40 w-full rounded-lg" />
      </div>
      <div className="flex-1 p-6 bg-main-white rounded-xl border border-border">
        <Bone className="h-5 w-32 mb-4" />
        <Bone className="h-40 w-full rounded-lg" />
      </div>
    </div>
  </div>
);


// ─────────────────────────────────────────────────────────────────────────────
// Category, Discount, and Unit Skeleton  (generic — adapt once Reports.jsx is implemented)
// ─────────────────────────────────────────────────────────────────────────────

export const CRUDModalSkeleton = ({title, subtitle, onClose}) => 
<ModalBody className='w-[40vw]' title={title} subtitle={subtitle} onClose={onClose}>
    <div className='flex flex-col gap-2 w-full'>

        {/* Add New Section */}
        <div className="flex flex-col gap-2">
            <Bone className="h-4 w-32" />
            <div className="flex gap-2">
                <Bone className="flex-2 h-9 rounded-md" />
                <Bone className="flex-1 h-9 rounded-md" />
                <Bone className="h-9 w-16 rounded-md" />
            </div>
        </div>

        {/* List Section */}
        <Bone className="h-4 w-36 mt-2" />
        <div className='flex flex-col gap-2'>
            {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-xl border border-border bg-main-white">
                    <div className="flex-1 flex gap-2">
                        <Bone className="h-4 w-28" />
                        <Bone className="h-4 w-12" />
                    </div>
                    <Bone className="h-8 w-16 rounded-md" />
                    <Bone className="h-8 w-16 rounded-md" />
                </div>
            ))}
        </div>

    </div>
</ModalBody>


// ─────────────────────────────────────────────────────────────────────────────
// Archives (Product + Cake) Skeleton  (generic — adapt once Reports.jsx is implemented)
// ─────────────

export const ArchivesSkeleton = ({title, subtitle, onClose}) => 
<ModalBody title={title} subtitle={subtitle} onClose={() => onClose(false)}>
    <div className='grid grid-cols-6 gap-4 max-h-120 overflow-y-auto p-2'>
        {[...Array(12)].map((_, i) => (
            <div key={i} className='flex flex-col gap-4 px-2 py-2 rounded-4xl shadow-md shadow-black/15 min-h-60 bg-main-white'>
                <Bone className='aspect-square h-40 rounded-3xl' />
                <div className='text-center mt-auto'>
                    <Bone className='h-3 w-20 mx-auto' />
                </div>
            </div>
        ))}
    </div>

    <span className='ml-auto flex gap-2'>
        <Bone className='h-9 w-16 rounded-md' />
        <Bone className='h-9 w-20 rounded-md' />
    </span>
</ModalBody>


export const EditInventorySkeleton = ({onClose}) => 
  <ModalBody title='Edit Inventory Item' subtitle='Modify the product by editing in the detail below or delete the current product.' onClose={onClose}>
    <div className='flex flex-row gap-8'>
        <div className='flex-1 flex flex-col gap-2'>
            <div className='flex flex-col gap-2'>
                <Bone className='h-3 w-20' />
                <Bone className='h-9 w-full rounded-sm' />
            </div>
            <div className='flex flex-col gap-2'>
                <Bone className='h-3 w-10' />
                <Bone className='h-9 w-full rounded-sm' />
            </div>
        </div>
    </div>

    <div className='flex gap-4 mt-4 ml-auto'>
        <Bone className='h-9 w-20 rounded-md' />
        <Bone className='h-9 w-16 rounded-md' />
    </div>
  </ModalBody>


export const AddInventoryItemSkeleton = ({onClose}) => 
  <ModalBody title='Add New Item' onClose={onClose}>
    <div className='flex flex-col gap-4'>
        <div className='flex flex-col gap-2'>
            <Bone className='h-3 w-12' />
            <Bone className='h-9 w-full rounded-sm' />
        </div>

        <div className='flex items-center gap-4'>
            <div className='flex-1 flex flex-col gap-2'>
                <Bone className='h-3 w-16' />
                <Bone className='h-9 w-full rounded-sm' />
            </div>
            <div className='flex-1 flex flex-col gap-2'>
                <Bone className='h-3 w-10' />
                <Bone className='h-9 w-full rounded-sm' />
            </div>
        </div>

        <div className='flex flex-col gap-2'>
            <Bone className='h-3 w-24' />
            <Bone className='h-9 w-full rounded-sm' />
        </div>

        <div className='flex flex-col gap-2'>
            <Bone className='h-3 w-24' />
            <Bone className='h-9 w-full rounded-sm' />
        </div>

        <div className='flex gap-4 mt-4 ml-auto'>
            <Bone className='h-9 w-20 rounded-md' />
            <Bone className='h-9 w-24 rounded-md' />
        </div>
    </div>
  </ModalBody>


export const InventoryInOutSkeleton = ({onClose}) => 
  <ModalBody title='Inventory Management' onClose={onClose} className='w-[90vw] h-[90vh]'>
    <div className='flex flex-1 overflow-hidden max-h-[90vh] bg-accent-mute/25'>
        {/* Left Panel */}
        <div className='basis-1/4 flex flex-col'>
            <div className='px-6 py-4 h-16 flex items-center gap-2'>
                <div className='h-full w-1 rounded-full bg-accent-text' />
                <Bone className='h-4 w-36' />
            </div>
            <div className='flex-1 overflow-y-auto px-6 py-4'>
                <Bone className='h-9 w-full rounded-md mb-6' />
                <div className='flex flex-col gap-2'>
                    {[...Array(8)].map((_, i) => (
                        <Bone key={i} className='h-10 w-full rounded-md' />
                    ))}
                </div>
            </div>
        </div>

        {/* Right Panel */}
        <div className='flex-1 flex flex-col bg-white'>
            <div className='px-6 py-4'>
                <Bone className='h-4 w-40' />
            </div>
            <div className='flex-1 overflow-y-auto px-6 py-4'>
                <div className='grid gap-4'>
                    {[...Array(4)].map((_, i) => (
                        <Bone key={i} className='h-16 w-full rounded-md' />
                    ))}
                </div>
            </div>
        </div>
    </div>

    {/* Footer */}
    <div className='flex justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50'>
        <Bone className='h-9 w-20 rounded-md' />
        <Bone className='h-9 w-28 rounded-md' />
    </div>
  </ModalBody>


export const RecipeModalSkeleton = ({onClose}) => 
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-8">
      <div className="flex w-full max-w-7xl h-[85vh] bg-main-white rounded-2xl shadow-2xl overflow-hidden relative">

          {/* Sidebar */}
          <div className="w-64 bg-accent-mute flex flex-col p-6 shrink-0">
              <div className="flex items-center gap-3 mb-12 mt-2 ml-2">
                  <Bone className="h-6 w-6 rounded-md" />
                  <Bone className="h-5 w-24" />
              </div>
              <div className="flex flex-col gap-2">
                  <Bone className="h-10 w-full rounded-xl" />
                  <Bone className="h-10 w-full rounded-xl" />
              </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <button onClick={onClose} className="absolute top-6 right-6 text-text-light hover:text-text transition-colors z-10">
                <X size={24} />
            </button>
              <div className="flex-1 overflow-y-auto p-12 flex flex-col">
                  <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col">
                      <Bone className="h-7 w-48 mb-2" />
                      <Bone className="h-3 w-72 mb-10" />

                      <div className="mb-8">
                          <Bone className="h-3 w-24 mb-2" />
                          <Bone className="h-12 w-full rounded-xl" />
                      </div>

                      <div className="flex-1 flex flex-col min-h-[300px]">
                          <Bone className="h-3 w-24 mb-2" />
                          <Bone className="flex-1 w-full rounded-xl min-h-[300px]" />
                      </div>
                  </div>
              </div>

              {/* Footer */}
              <div className="shrink-0 border-t border-border p-6 flex items-center justify-between bg-main-white">
                  <Bone className="h-3 w-28" />
                  <div className="flex items-center gap-3">
                      <Bone className="h-9 w-24 rounded-md" />
                      <Bone className="h-9 w-28 rounded-md" />
                  </div>
              </div>
          </div>
      </div>
  </div>