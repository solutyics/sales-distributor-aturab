import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaFileCsv, FaEdit, FaCheck, FaTimes } from "react-icons/fa";

const sampleDistributors = [
  { id: "D-101", name: "Alpha Supply", region: "North-East" },
  { id: "D-108", name: "Beta Wholesale", region: "Mid-West" },
  { id: "D-114", name: "Sigma Distribs", region: "Pacific" },
  { id: "D-120", name: "Delta Traders", region: "Mid-West" },
];

const sampleSalesmen = [
  { id: "S-01", name: "Maria", region: "North-East" },
  { id: "S-02", name: "David", region: "Mid-West" },
  { id: "S-03", name: "Aisha", region: "Pacific" },
  { id: "S-04", name: "Omar", region: "Mid-West" },
];

const initialAssignments = new Set([
  "S-01|D-101",
  "S-01|D-108",
  "S-02|D-108",
  "S-02|D-114",
  "S-03|D-101",
  "S-03|D-114",
]);

export default function Assignments() {
  // core state
  const [viewMode, setViewMode] = useState("salesman-distributor"); // other modes could be "salesman-customer", "distributor-product"
  const [regionFilter, setRegionFilter] = useState("All");
  const [distFilter, setDistFilter] = useState("All");
  const [salesmanFilter, setSalesmanFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [assignments, setAssignments] = useState(initialAssignments);
  const [selectedCells, setSelectedCells] = useState(new Set()); // set of `S-xx|D-yy`
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);

  // derive lists (normally fetched)
  const distributors = sampleDistributors;
  const salesmen = sampleSalesmen;

  // list of unique regions for filters
  const regions = useMemo(() => {
    const r = new Set();
    distributors.forEach((d) => r.add(d.region));
    salesmen.forEach((s) => r.add(s.region));
    return ["All", ...Array.from(r)];
  }, [distributors, salesmen]);

  // Filtered salesmen/distributors based on filter & search
  const filteredDistributors = distributors.filter((d) => {
    if (distFilter !== "All" && d.id !== distFilter && d.name !== distFilter) return false;
    if (regionFilter !== "All" && d.region !== regionFilter) return false;
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return d.name.toLowerCase().includes(t) || d.id.toLowerCase().includes(t) || d.region.toLowerCase().includes(t);
  });

  const filteredSalesmen = salesmen.filter((s) => {
    if (salesmanFilter !== "All" && s.id !== salesmanFilter && s.name !== salesmanFilter) return false;
    if (regionFilter !== "All" && s.region !== regionFilter) return false;
    if (!searchTerm) return true;
    const t = searchTerm.toLowerCase();
    return s.name.toLowerCase().includes(t) || s.id.toLowerCase().includes(t) || s.region.toLowerCase().includes(t);
  });

  // helper: toggle a single assignment cell
  function toggleAssignment(salesmanId, distributorId) {
    const key = `${salesmanId}|${distributorId}`;
    setAssignments((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // helper: toggle selection highlighting (not assignment)
  function toggleSelectCell(salesmanId, distributorId) {
    const key = `${salesmanId}|${distributorId}`;
    setSelectedCells((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  // Bulk assign/unassign from Edit Selected drawer
  function bulkSetSelected(assign = true) {
    setAssignments((prev) => {
      const next = new Set(prev);
      selectedCells.forEach((k) => {
        if (assign) next.add(k);
        else next.delete(k);
      });
      return next;
    });
    // optionally clear selection after action
    setSelectedCells(new Set());
    setEditDrawerOpen(false);
  }

  // Export CSV of current filtered matrix
  function exportCsv() {
    // header row: empty cell + distributors ids/names
    const header = ["Salesman/Distributor", ...filteredDistributors.map((d) => `${d.id} ${d.name}`)];
    const rows = [header];
    filteredSalesmen.forEach((s) => {
      const row = [ `${s.id} ${s.name}` ];
      filteredDistributors.forEach((d) => {
        row.push(assignments.has(`${s.id}|${d.id}`) ? "1" : "0");
      });
      rows.push(row);
    });
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const timestamp = new Date().toISOString().slice(0,19).replace(/[:T]/g,"-");
    a.download = `assignments-${timestamp}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  // selection helpers for UI header
  function clearSelection() {
    setSelectedCells(new Set());
  }

  // small animation variants
  const fadeUp = {
    hidden: { opacity: 0, y: 10 },
    visible: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: 0.04 * i } })
  };

  return (
    <div className="p-8 bg-gray-950 min-h-screen text-white">
      {/* Header */}
      <motion.div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6" initial="hidden" animate="visible">
        <motion.h1 className="text-3xl font-bold text-indigo-400" variants={fadeUp}>Assignments</motion.h1>

        <motion.div className="flex items-center gap-3" variants={fadeUp}>
          <div className="bg-gray-900/60 border border-gray-800 rounded-md px-3 py-1 flex items-center gap-3">
            <label className="text-sm text-gray-300 mr-2">View:</label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode("salesman-distributor")}
                className={`px-3 py-1 rounded-md text-sm ${viewMode === "salesman-distributor" ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-800"}`}
              >
                Salesman ↔ Distributors
              </button>
              <button
                onClick={() => setViewMode("salesman-customer")}
                className={`px-3 py-1 rounded-md text-sm ${viewMode === "salesman-customer" ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-800"}`}
              >
                Salesman ↔ Customers
              </button>
              <button
                onClick={() => setViewMode("distributor-product")}
                className={`px-3 py-1 rounded-md text-sm ${viewMode === "distributor-product" ? "bg-indigo-600 text-white" : "text-gray-300 hover:bg-gray-800"}`}
              >
                Distributor ↔ Prod
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Filters bar */}
      <motion.div className="bg-gray-900/60 border border-gray-800 backdrop-blur-md p-4 rounded-lg mb-6 flex flex-wrap items-center gap-3" initial="hidden" animate="visible" variants={fadeUp}>
        <select value={regionFilter} onChange={(e)=> setRegionFilter(e.target.value)} className="bg-gray-800 text-gray-200 px-3 py-2 rounded-md border border-gray-700">
          {regions.map(r => <option key={r} value={r}>{r}</option>)}
        </select>

        <select value={distFilter} onChange={(e)=> setDistFilter(e.target.value)} className="bg-gray-800 text-gray-200 px-3 py-2 rounded-md border border-gray-700">
          <option value="All">Distributor: All</option>
          {distributors.map(d => <option key={d.id} value={d.id}>{d.id} {d.name}</option>)}
        </select>

        <select value={salesmanFilter} onChange={(e)=> setSalesmanFilter(e.target.value)} className="bg-gray-800 text-gray-200 px-3 py-2 rounded-md border border-gray-700">
          <option value="All">Salesman: All</option>
          {salesmen.map(s => <option key={s.id} value={s.id}>{s.id} {s.name}</option>)}
        </select>

        <div className="flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 py-2 flex-1 max-w-sm">
          <FaSearch className="text-gray-400 mr-2" />
          <input value={searchTerm} onChange={(e)=> setSearchTerm(e.target.value)} placeholder="Search..." className="bg-transparent outline-none text-gray-200 w-full" />
        </div>
      </motion.div>

      {/* Matrix table */}
      <motion.div className="bg-gray-900/60 border border-gray-800 rounded-xl backdrop-blur-md overflow-auto shadow-lg" initial="hidden" animate="visible" variants={fadeUp}>
        <table className="min-w-[720px] w-full text-sm text-gray-300">
          <thead className="bg-gray-800/70 text-gray-200 border-b border-gray-700 sticky top-0">
            <tr>
              <th className="p-3 text-left w-56"> </th>
              {filteredDistributors.map((d) => (
                <th key={d.id} className="p-3 text-center min-w-[140px]">
                  <div className="flex flex-col items-center">
                    <div className="text-xs text-gray-400">{d.id}</div>
                    <div className="text-sm font-semibold text-indigo-300">{d.name}</div>
                    <div className="text-xs text-gray-400">{d.region}</div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {filteredSalesmen.map((s, rowIndex) => (
              <motion.tr key={s.id} className="border-b border-gray-800 hover:bg-gray-800/40" initial="hidden" animate="visible" variants={fadeUp} custom={rowIndex}>
                <td className="p-3 sticky left-0 bg-gray-900/60 z-10">
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{s.id} {s.name}</div>
                      <div className="text-xs text-gray-400">{s.region}</div>
                    </div>
                  </div>
                </td>

                {filteredDistributors.map((d) => {
                  const key = `${s.id}|${d.id}`;
                  const assigned = assignments.has(key);
                  const selected = selectedCells.has(key);
                  return (
                    <td key={d.id} className="p-2 text-center align-middle">
                      <div
                        onClick={() => toggleAssignment(s.id, d.id)}
                        onDoubleClick={() => toggleSelectCell(s.id, d.id)}
                        title="Click to toggle assignment — double-click to select for bulk"
                        className={`inline-flex items-center justify-center cursor-pointer select-none px-3 py-2 rounded-md transition 
                          ${assigned ? "bg-green-700/30 border border-green-600 text-green-300" : "bg-gray-800/40 border border-gray-700 text-gray-300"}
                          ${selected ? "ring-2 ring-indigo-500/40" : ""}
                        `}
                      >
                        {assigned ? <FaCheck /> : <span className="text-xs">—</span>}
                      </div>
                      {/* small helper under cell */}
                      <div className="text-xs text-gray-400 mt-1">{selected ? "Selected" : ""}</div>
                    </td>
                  );
                })}
              </motion.tr>
            ))}

            {/* empty state */}
            {filteredSalesmen.length === 0 && (
              <tr>
                <td colSpan={1 + filteredDistributors.length} className="p-8 text-center text-gray-400 italic">
                  No salesmen match your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-4 gap-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setEditDrawerOpen(true)}
            disabled={selectedCells.size === 0}
            className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium ${selectedCells.size === 0 ? "bg-gray-700 text-gray-400 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"}`}
          >
            <FaEdit /> Edit Selected ({selectedCells.size})
          </button>

          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-gray-800 hover:bg-gray-700"
          >
            <FaFileCsv /> Export CSV
          </button>

          <button onClick={clearSelection} className="px-3 py-2 rounded-md bg-gray-800 hover:bg-gray-700 text-sm">Clear Selection</button>
        </div>

        <div className="text-sm text-gray-400">
          View: <span className="font-semibold text-indigo-300">{viewMode}</span>
        </div>
      </div>

      {/* Edit Selected Drawer */}
      <AnimatePresence>
        {editDrawerOpen && (
          <motion.div className="fixed inset-0 bg-black/50 flex justify-end z-50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} className="bg-gray-900 w-full sm:w-[520px] h-full p-6 border-l border-gray-800 shadow-2xl overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-indigo-400">Edit Selected Assignments</h3>
                <button onClick={() => setEditDrawerOpen(false)} className="text-gray-400 hover:text-gray-200">✕</button>
              </div>

              <p className="text-sm text-gray-300 mb-4">You have <span className="font-semibold text-indigo-300">{selectedCells.size}</span> selected cells. Choose bulk action:</p>

              <div className="flex gap-3 mb-6">
                <button onClick={() => bulkSetSelected(true)} className="flex-1 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700">Assign</button>
                <button onClick={() => bulkSetSelected(false)} className="flex-1 px-4 py-2 rounded-md bg-red-600 hover:bg-red-700">Unassign</button>
              </div>

              <div className="mb-4">
                <label className="text-sm text-gray-300">Selected items preview:</label>
                <div className="mt-2 bg-gray-800 p-3 rounded-md border border-gray-700 text-xs text-gray-200 max-h-40 overflow-auto">
                  {Array.from(selectedCells).map(k => {
                    const [sid, did] = k.split("|");
                    const s = salesmen.find(x => x.id === sid);
                    const d = distributors.find(x => x.id === did);
                    return <div key={k} className="py-1">{s?.id} {s?.name} → {d?.id} {d?.name}</div>;
                  })}
                </div>
              </div>

              <div className="mt-6 border-t border-gray-800 pt-4">
                <button onClick={() => { setEditDrawerOpen(false); setSelectedCells(new Set()); }} className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
