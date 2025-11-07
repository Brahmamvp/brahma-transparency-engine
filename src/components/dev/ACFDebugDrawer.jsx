import React, { useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { fetchLogsFromKernel } from "../../kernel/memoryKernel.js";
import { getConsent } from "../../Lib/acf/consent.js";

const ACFDebugDrawer = () => {
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [consent, setConsent] = useState([]);

  useEffect(() => {
    try {
      setLogs(fetchLogsFromKernel().slice(-50).reverse());
      setConsent(getConsent());
    } catch (e) {
      console.warn("[ACF] debug fetch failed", e);
    }
  }, [open]);

  return (
    <div className={`fixed bottom-0 left-0 w-full ${open ? "h-64" : "h-8"} transition-all duration-300 bg-black/60 text-white`}>
      <div
        onClick={() => setOpen(!open)}
        className="flex items-center justify-center cursor-pointer text-xs uppercase tracking-widest h-8 bg-purple-800/70 backdrop-blur-sm"
      >
        {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        <span className="ml-1">ACF Debug</span>
      </div>

      {open && (
        <div className="overflow-y-auto p-3 text-xs font-mono space-y-2">
          <div className="opacity-80">
            <b>Audit Logs:</b>
            {logs.length ? (
              logs.map((l, i) => (
                <div key={i} className="truncate">
                  {l.timestamp} — {l.category}
                </div>
              ))
            ) : (
              <div className="text-gray-300">No logs</div>
            )}
          </div>

          <div className="opacity-80 mt-3">
            <b>Consent Records:</b>
            {consent.length ? (
              consent.map((c, i) => (
                <div key={i}>
                  {c.scope} — {c.action} ({c.createdAt})
                </div>
              ))
            ) : (
              <div className="text-gray-300">No consent records</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ACFDebugDrawer;