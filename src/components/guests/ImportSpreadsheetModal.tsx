"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { db } from "@/lib/db";
import {
  parseSpreadsheetFile,
  downloadExcelTemplate,
  downloadCsvTemplate,
  ParsedGuestRow,
} from "@/lib/excel";
import {
  FileCsv,
  UploadSimple,
  DownloadSimple,
  WarningCircle,
  CheckCircle,
  Sparkle,
  X,
} from "@phosphor-icons/react";

interface ImportSpreadsheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId?: string;
  onSuccess: (importedCount: number) => void;
}

export function ImportSpreadsheetModal({
  isOpen,
  onClose,
  eventId,
  onSuccess,
}: ImportSpreadsheetModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedGuestRow[]>([]);
  const [duplicates, setDuplicates] = useState<
    { row: ParsedGuestRow; existingId: string; existingName: string }[]
  >([]);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

  const resetState = () => {
    setFile(null);
    setParsedRows([]);
    setDuplicates([]);
    setIsParsing(false);
    setParseError(null);
    setIsImporting(false);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setIsParsing(true);
    setParseError(null);

    try {
      const rows = await parseSpreadsheetFile(selectedFile);
      if (rows.length === 0) {
        setParseError("No valid guest rows detected. Ensure columns include Full Name, Email, or Phone.");
        setParsedRows([]);
        return;
      }

      setParsedRows(rows);

      // Check for duplicate candidates in existing CRM
      const dups: { row: ParsedGuestRow; existingId: string; existingName: string }[] = [];
      rows.forEach((r) => {
        const found = db.findDuplicates(r.email, r.phone, db.organisation.id);
        if (found.length > 0) {
          dups.push({
            row: r,
            existingId: found[0].id,
            existingName: found[0].full_name,
          });
        }
      });
      setDuplicates(dups);
    } catch (err: any) {
      setParseError("Failed to parse file: " + (err.message || "Unknown error"));
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;
    setIsImporting(true);

    try {
      let count = 0;
      parsedRows.forEach((r) => {
        // Check if already in CRM
        const found = db.findDuplicates(r.email, r.phone, db.organisation.id);
        let guestId: string;

        if (found.length > 0) {
          // Update / reuse existing CRM contact
          guestId = found[0].id;
          db.updateGuest(guestId, {
            category: r.category || found[0].category,
            organisation: r.organisation || found[0].organisation,
          });
        } else {
          // Create new CRM record
          const created = db.createGuest({
            organisation_id: db.organisation.id,
            full_name: r.full_name,
            email: r.email,
            phone: r.phone,
            city: r.city || "Bengaluru",
            organisation: r.organisation || "",
            category: r.category,
            tags: r.tags.length > 0 ? r.tags : ["SpreadsheetImport"],
            notes: "Imported via bulk spreadsheet",
            relationship_owner: "Rahul Mehta",
            social_links: {},
            communication_preferences: { email: true, whatsapp: true },
          });
          guestId = created.id;
        }

        // If scoped to an event, link to the event guestlist
        if (eventId) {
          db.addGuestToEvent(eventId, guestId, r.category);
        }

        count++;
      });

      onSuccess(count);
      resetState();
      onClose();
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        resetState();
        onClose();
      }}
      maxWidth="2xl"
      title={eventId ? "Bulk Import Guests to Event & CRM" : "Bulk Import Guests to CRM"}
      description="Upload an Excel workbook (.xlsx, .xls) or CSV file. ROOM parses attendee records and detects duplicates automatically."
    >
      <div className="space-y-5 pt-1">
        {/* Template Download Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-surface-soft rounded-lg border border-hairline">
          <div>
            <span className="text-xs font-semibold text-ink block">Need a pre-formatted template?</span>
            <span className="text-[11px] text-ink/60 block mt-0.5">
              Includes pre-configured headers: Full Name, Email, Phone, City, Organisation, Category, Tags
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => downloadExcelTemplate()}
              className="gap-1.5 text-xs"
            >
              <DownloadSimple className="w-3.5 h-3.5 text-primary" />
              <span>Excel (.xlsx)</span>
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => downloadCsvTemplate()}
              className="gap-1.5 text-xs"
            >
              <DownloadSimple className="w-3.5 h-3.5 text-ink/60" />
              <span>CSV (.csv)</span>
            </Button>
          </div>
        </div>

        {/* Upload Dropzone */}
        {!file ? (
          <div className="border-2 border-dashed border-hairline rounded-lg p-8 text-center space-y-4 hover:border-primary/40 transition-colors bg-surface-soft/20">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary">
              <UploadSimple className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">
                Choose an Excel (.xlsx, .xls) or CSV file
              </p>
              <p className="text-xs text-ink/60 mt-1">
                Drag and drop your spreadsheet here or click the button below to browse.
              </p>
            </div>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileChange}
              className="hidden"
              id="spreadsheet-file-input"
            />
            <label htmlFor="spreadsheet-file-input">
              <Button variant="secondary" size="md" asChild>
                <span>Browse Spreadsheet</span>
              </Button>
            </label>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected File Bar */}
            <div className="flex items-center justify-between p-3 bg-surface-soft rounded-md border border-hairline">
              <div className="flex items-center gap-2.5">
                <FileCsv className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium text-ink font-mono">{file.name}</span>
                <span className="text-xs text-ink/60">
                  ({(file.size / 1024).toFixed(1)} KB • {parsedRows.length} attendees detected)
                </span>
              </div>
              <button
                type="button"
                onClick={resetState}
                className="text-xs text-primary hover:underline font-mono"
              >
                Choose another file
              </button>
            </div>

            {/* Parsing error */}
            {parseError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md text-xs text-destructive">
                {parseError}
              </div>
            )}

            {/* Duplicate Notice */}
            {duplicates.length > 0 && (
              <div className="bg-[#fff8e6] border border-[#b54708]/30 rounded-md p-3.5 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#b54708] font-mono uppercase">
                  <WarningCircle className="w-4 h-4 shrink-0" />
                  <span>{duplicates.length} duplicate contacts matched in CRM</span>
                </div>
                <p className="text-xs text-[#b54708] leading-relaxed">
                  Existing contacts will have their categories linked without creating duplicate identity records.
                </p>
              </div>
            )}

            {/* Preview Table */}
            {parsedRows.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-ink/70">
                  <span className="font-mono uppercase font-semibold">Parsed Attendee Preview</span>
                  <span>Showing {Math.min(parsedRows.length, 8)} of {parsedRows.length} rows</span>
                </div>
                <div className="border border-hairline rounded-md overflow-hidden max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-surface-soft font-mono uppercase text-ink/70 border-b border-hairline sticky top-0">
                      <tr>
                        <th className="p-2.5">Full Name</th>
                        <th className="p-2.5">Email</th>
                        <th className="p-2.5">Phone</th>
                        <th className="p-2.5">City</th>
                        <th className="p-2.5">Organisation</th>
                        <th className="p-2.5">Category</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-hairline">
                      {parsedRows.slice(0, 8).map((r, idx) => (
                        <tr key={idx} className="hover:bg-surface-soft/40 transition-colors">
                          <td className="p-2.5 font-semibold text-ink">{r.full_name}</td>
                          <td className="p-2.5 text-ink/80 font-mono text-[11px]">{r.email || "—"}</td>
                          <td className="p-2.5 text-ink/80 font-mono text-[11px]">{r.phone || "—"}</td>
                          <td className="p-2.5 text-ink/70">{r.city}</td>
                          <td className="p-2.5 text-ink/70">{r.organisation || "—"}</td>
                          <td className="p-2.5">
                            <Badge variant="default" className="text-[10px] py-0.5">
                              {r.category}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-hairline">
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              resetState();
              onClose();
            }}
            disabled={isImporting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={handleConfirmImport}
            disabled={parsedRows.length === 0 || isImporting}
            className="gap-2"
          >
            <Sparkle className="w-4 h-4" />
            <span>
              {isImporting
                ? "Importing..."
                : `Import ${parsedRows.length} Guests ${eventId ? "to Event" : "to CRM"}`}
            </span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
