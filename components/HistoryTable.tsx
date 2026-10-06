'use client';

import React, { useState } from 'react';
import {
  History,
  Download,
  Copy,
  Check,
  Search,
  Tag,
  Printer,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { DrawnRecord } from '@/lib/types';
import { exportToCSV, copyResultsToClipboard } from '@/lib/export';

interface HistoryTableProps {
  records: DrawnRecord[];
  eventTitle: string;
  onUpdatePrizeNote: (recordId: string, note: string) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({
  records,
  eventTitle,
  onUpdatePrizeNote,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState('');
  const [sortAscending, setSortAscending] = useState(false); // Default latest first

  const filteredRecords = records
    .filter((r) => {
      const matchNumber = r.formattedNumber.includes(searchQuery);
      const matchNote = (r.prizeNote || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchOrder = String(r.order).includes(searchQuery);
      return matchNumber || matchNote || matchOrder;
    })
    .sort((a, b) => (sortAscending ? a.order - b.order : b.order - a.order));

  const handleCopy = async () => {
    const success = await copyResultsToClipboard(records, eventTitle);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(records, eventTitle);
  };

  const handlePrint = () => {
    window.print();
  };

  const startEdit = (record: DrawnRecord) => {
    setEditingId(record.id);
    setTempNote(record.prizeNote || '');
  };

  const saveEdit = (recordId: string) => {
    onUpdatePrizeNote(recordId, tempNote.trim());
    setEditingId(null);
  };

  return (
    <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 sm:p-6 backdrop-blur-md">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
              RIWAYAT HASIL UNDIAN
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-800 text-amber-400 border border-slate-700">
                {records.length} Terundi
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Daftar seluruh nomor pemenang berurutan berdasarkan waktu pengundian
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search filter */}
          <div className="relative min-w-[160px] sm:min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nomor / hadiah..."
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-950/70 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={records.length === 0}
            title="Salin rekap hasil ke clipboard"
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-800 bg-slate-950/70 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Tersalin' : 'Salin'}</span>
          </button>

          {/* Print button */}
          <button
            type="button"
            onClick={handlePrint}
            disabled={records.length === 0}
            title="Cetak hasil pengundian"
            className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-800 bg-slate-950/70 text-slate-300 hover:text-white hover:border-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-1.5 hidden sm:flex"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Cetak</span>
          </button>

          {/* Export to Excel / CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT HASIL (EXCEL/CSV)</span>
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="mt-4 overflow-x-auto">
        {records.length === 0 ? (
          <div className="text-center py-12 px-4 border border-dashed border-slate-800 rounded-xl">
            <div className="w-12 h-12 mx-auto rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500 mb-3">
              <History className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-300">Belum Ada Nomor Yang Diundi</p>
            <p className="text-xs text-slate-500 mt-1">
              Tekan tombol MULAI pada dashboard utama untuk memulai pengundian.
            </p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            Tidak ada nomor yang sesuai dengan pencarian &quot;{searchQuery}&quot;
          </div>
        ) : (
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/30">
                <th className="py-3 px-4 w-20">
                  <button
                    type="button"
                    onClick={() => setSortAscending(!sortAscending)}
                    className="flex items-center gap-1 hover:text-white transition-colors"
                    title="Urutkan nomor putaran"
                  >
                    <span>No.</span>
                    {sortAscending ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </th>
                <th className="py-3 px-4 font-mono">Nomor Undian</th>
                <th className="py-3 px-4">Waktu</th>
                <th className="py-3 px-4">Nama Peserta / Keterangan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {filteredRecords.map((record) => (
                <tr
                  key={record.id}
                  className="hover:bg-slate-800/40 transition-colors group"
                >
                  {/* Putaran */}
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-400 tabular-nums">
                    #{record.order}
                  </td>

                  {/* Nomor Undian (VERY CLEAR & PROMINENT) */}
                  <td className="py-3.5 px-4">
                    <span className="font-mono font-bold text-xl sm:text-2xl text-amber-300 tracking-wider tabular-nums px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 inline-block shadow-sm">
                      {record.formattedNumber}
                    </span>
                  </td>

                  {/* Waktu */}
                  <td className="py-3.5 px-4 font-mono text-xs sm:text-sm text-slate-300 tabular-nums">
                    {record.timestamp}
                  </td>

                  {/* Prize / Notes */}
                  <td className="py-3.5 px-4">
                    {editingId === record.id ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={tempNote}
                          onChange={(e) => setTempNote(e.target.value)}
                          placeholder="masukan data peserta atau nama"
                          className="px-2.5 py-1 text-xs bg-slate-950 border border-amber-500/50 rounded text-white focus:outline-none w-48"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEdit(record.id);
                            if (e.key === 'Escape') setEditingId(null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => saveEdit(record.id)}
                          className="px-2 py-1 text-xs font-semibold rounded bg-amber-500 text-slate-950 hover:bg-amber-400"
                        >
                          Simpan
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="px-2 py-1 text-xs rounded text-slate-400 hover:text-white"
                        >
                          Batal
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-300 font-medium">
                          {record.prizeNote || (
                            <span className="text-slate-500 italic">Peserta #{record.order}</span>
                          )}
                        </span>
                        <button
                          type="button"
                          onClick={() => startEdit(record)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-amber-300 transition-opacity"
                          title="Beri nama peserta"
                        >
                          <Tag className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
