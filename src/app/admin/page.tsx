"use client";

import { useEffect, useState, useCallback } from "react";
import RequestsTable from "@/components/tables/RequestsTable";
import type ItemRequest from "@/components/tables/RequestsTable";

type RequestStatus = "all" | "pending" | "approved" | "rejected";

export default function ItemRequestsPage() {
  const [status, setStatus] = useState<RequestStatus>("all");
  const [data, setData] = useState<typeof ItemRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams();
      if (status !== "all") qs.set("status", status);

      const res = await fetch(`/api/mock/request?${qs.toString()}`, {
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`GET /api/mock/request failed: ${res.status}`);

      const json = await res.json();
      const list = Array.isArray(json) ? json : json?.data;
      if (!Array.isArray(list)) throw new Error("Unexpected response format");

      setData(list as ItemRequest[]);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load requests");
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!alive) return;
      await load();
    })();
    return () => {
      alive = false;
    };
  }, [load]);

  async function handleStatusChange(id: number, newStatus: "pending" | "approved" | "rejected") {
    // optimistic UI
    const prev = data;
    const optimistic = prev.map((r) =>
      r.id === id ? { ...r, status: newStatus, updatedAt: new Date().toISOString() } : r
    );
    setData(optimistic);
    setErr(null);

    try {
      const res = await fetch("/api/mock/request", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (!res.ok) {
        const text = await safeText(res);
        throw new Error(`PATCH failed: ${res.status} ${text}`);
      }
   
    } catch (e: any) {
      setData(prev);
      setErr(e?.message ?? "Failed to update status");
    }
  }

  return (
    <div className="">
      <h2 className="p-6">Item Requests</h2>
      <RequestsTabs status={status} setStatus={setStatus} />

      <div className="px-6">
        <RequestsTable
          data={data}
          loading={loading}
          error={err}
          onStatusChange={handleStatusChange}
        />
      </div>

      <p className="px-6 py-3 text-xs text-gray-500">
       
      </p>
    </div>
  );
}

function RequestsTabs({
  status,
  setStatus,
}: {
  status: RequestStatus;
  setStatus: (s: RequestStatus) => void;
}) {
  const tabs = [
    { value: "all" as const, name: "All" },
    { value: "pending" as const, name: "Pending" },
    { value: "approved" as const, name: "Approved" },
    { value: "completed" as const, name: "Completed" },
    { value: "rejected" as const, name: "Rejected" },
  ];
  return (
    <div className="flex flex-row gap-x-2 px-6">
      {tabs.map(({ value, name }) => (
        <button
          key={value}
          className="py-4 px-6 data-[selected=true]:bg-primary data-[selected=true]:text-white bg-gray-fill text-gray-text rounded-t-md"
          data-selected={status === value}
          onClick={() => setStatus(value)}
        >
          {name}
        </button>
      ))}
    </div>
  );
}

async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
