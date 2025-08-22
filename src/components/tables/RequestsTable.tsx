import React from "react";
import Dropdown from "../atoms/dropdown";
import { RequestStatus } from "@/lib/types/request";
import { MockItemRequest } from "@/lib/types/mock/request";

interface RequestsTableProps {
  data: MockItemRequest[];
  loading?: boolean;
  error?: string | null;
  onStatusChange: (id: number, status: RequestStatus) => void;
}

const STATUS_OPTIONS = (Object.values(RequestStatus) as RequestStatus[]).map((v) => ({
  label: v.charAt(0) + v.slice(1).toLowerCase(), // PENDING -> Pending
  value: v,
}));

function fmtDate(d?: string | Date) {
  if (!d) return "";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "";
  return dt.toLocaleString();
}

export default function RequestsTable({
  data,
  loading,
  error,
  onStatusChange,
}: RequestsTableProps) {
  if (error) {
    return (
      <div className="rounded-md border border-red-300 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (loading) {
    return <div className="p-4 text-sm text-gray-500">Loading…</div>;
  }

  if (!data?.length) {
    return <div className="p-4 text-sm text-gray-500">No requests found.</div>;
  }

  return (
    <div className="w-full">
      <div className="hidden md:block overflow-x-auto rounded-md border">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-3 text-left">Item</th>
              <th className="px-4 py-3 text-left">Requester</th>
              <th className="px-4 py-3 text-left">Created / Last Edited</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {data.map((r) => {
              const when = r.lastEditedDate ?? r.requestCreatedDate;
              return (
                <tr key={r.id} className="border-t">
                  <td className="px-4 py-3">{r.itemRequested}</td>
                  <td className="px-4 py-3">{r.requestorName}</td>
                  <td className="px-4 py-3">{fmtDate(when)}</td>
                  <td className="px-4 py-3 max-w-[240px]">
                    <Dropdown
                      value={r.status}
                      options={STATUS_OPTIONS}
                      onChange={(v) => onStatusChange(r.id, v as RequestStatus)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="md:hidden space-y-3">
        {data.map((r) => {
          const when = r.lastEditedDate ?? r.requestCreatedDate;
          return (
            <div key={r.id} className="rounded-md border bg-white p-3">
              <div className="font-medium">{r.itemRequested}</div>
              <div className="text-xs text-gray-500">{r.requestorName}</div>
              <div className="mt-1 text-xs text-gray-500">{fmtDate(when)}</div>
              <div className="mt-2">
                <Dropdown
                  value={r.status}
                  options={STATUS_OPTIONS}
                  onChange={(v) => onStatusChange(r.id, v as RequestStatus)}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
