import * as XLSX from "xlsx";
import Papa from "papaparse";
import { GuestCategory } from "@/types";

export interface ParsedGuestRow {
  full_name: string;
  email: string;
  phone: string;
  city: string;
  organisation: string;
  category: GuestCategory;
  tags: string[];
  notes?: string;
  raw: any;
}

const VALID_CATEGORIES: GuestCategory[] = [
  "VIP",
  "VVIP",
  "Creator",
  "Media",
  "Brand Partner",
  "Industry",
  "General",
];

function normalizeCategory(val: any): GuestCategory {
  if (!val) return "General";
  const str = String(val).trim().toLowerCase();
  if (str.includes("vvip")) return "VVIP";
  if (str.includes("vip")) return "VIP";
  if (str.includes("creator") || str.includes("influencer")) return "Creator";
  if (str.includes("media") || str.includes("press")) return "Media";
  if (str.includes("brand") || str.includes("partner")) return "Brand Partner";
  if (str.includes("industry")) return "Industry";
  return "General";
}

export function normalizeSpreadsheetRow(row: Record<string, any>): ParsedGuestRow {
  // Find case-insensitive keys
  const getVal = (candidates: string[]): string => {
    for (const key of Object.keys(row)) {
      const lower = key.trim().toLowerCase().replace(/[\s_-]+/g, "");
      for (const cand of candidates) {
        if (lower === cand.toLowerCase().replace(/[\s_-]+/g, "")) {
          return String(row[key] ?? "").trim();
        }
      }
    }
    return "";
  };

  const full_name = getVal(["full_name", "fullname", "name", "guestname", "attendee", "contactname"]) || "Guest";
  const email = getVal(["email", "emailaddress", "mail", "contactemail"]);
  const phone = getVal(["phone", "phonenumber", "mobile", "mobilenumber", "contact", "whatsapp"]);
  const city = getVal(["city", "location", "town"]) || "Bengaluru";
  const organisation = getVal(["organisation", "organization", "company", "agency", "brand", "org"]);
  const categoryStr = getVal(["category", "tier", "role", "guestcategory", "group"]);
  const tagsStr = getVal(["tags", "labels", "tag"]);

  const tags = tagsStr
    ? tagsStr.split(/[;,|]+/).map((t) => t.trim()).filter(Boolean)
    : [];

  return {
    full_name,
    email,
    phone,
    city,
    organisation,
    category: normalizeCategory(categoryStr),
    tags,
    notes: "Imported via bulk spreadsheet",
    raw: row,
  };
}

/**
 * Parses either an Excel (.xlsx, .xls) or CSV file in the browser
 */
export async function parseSpreadsheetFile(file: File): Promise<ParsedGuestRow[]> {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith(".csv")) {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const rows = (results.data as Record<string, any>[]).map(normalizeSpreadsheetRow);
          resolve(rows.filter((r) => r.full_name || r.email || r.phone));
        },
        error: (err) => reject(err),
      });
    });
  }

  // Handle Excel (.xlsx, .xls)
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows: Record<string, any>[] = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

  const rows = rawRows.map(normalizeSpreadsheetRow);
  return rows.filter((r) => r.full_name || r.email || r.phone);
}

/**
 * Generates and triggers download of a standardized Excel template
 */
export function downloadExcelTemplate(filename = "ROOM_Guest_Import_Template.xlsx") {
  const templateData = [
    {
      "Full Name": "Kabir Sen",
      "Email": "kabir@senstudios.in",
      "Phone": "+91 98200 11223",
      "City": "Mumbai",
      "Organisation": "Sen Studios",
      "Category": "Creator",
      "Tags": "Cinema, Tech, Tier-1",
    },
    {
      "Full Name": "Pooja Hegde",
      "Email": "pooja@hegdecreative.com",
      "Phone": "+91 99300 44556",
      "City": "Bengaluru",
      "Organisation": "Hegde Creative",
      "Category": "VIP",
      "Tags": "Fashion, Keynote",
    },
    {
      "Full Name": "Arjun Singhania",
      "Email": "arjun@singhaniacapital.in",
      "Phone": "+91 97100 77889",
      "City": "New Delhi",
      "Organisation": "Singhania Capital",
      "Category": "Brand Partner",
      "Tags": "Investor, Luxury",
    },
    {
      "Full Name": "Meera Nambiar",
      "Email": "meera@thecollective.co",
      "Phone": "+91 98450 33445",
      "City": "Bengaluru",
      "Organisation": "The Collective Media",
      "Category": "Media",
      "Tags": "Press, Editorial",
    },
    {
      "Full Name": "Devika Roy",
      "Email": "devika.roy@pulseagency.in",
      "Phone": "+91 98711 22334",
      "City": "Mumbai",
      "Organisation": "Pulse Agency",
      "Category": "General",
      "Tags": "Agency, Partner",
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  // Set column widths for comfortable Excel viewing
  worksheet["!cols"] = [
    { wch: 22 }, // Full Name
    { wch: 30 }, // Email
    { wch: 20 }, // Phone
    { wch: 16 }, // City
    { wch: 24 }, // Organisation
    { wch: 16 }, // Category
    { wch: 28 }, // Tags
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Guestlist Template");
  XLSX.writeFile(workbook, filename);
}

/**
 * Generates and triggers download of a standardized CSV template
 */
export function downloadCsvTemplate(filename = "ROOM_Guest_Import_Template.csv") {
  const templateData = [
    {
      "Full Name": "Kabir Sen",
      "Email": "kabir@senstudios.in",
      "Phone": "+91 98200 11223",
      "City": "Mumbai",
      "Organisation": "Sen Studios",
      "Category": "Creator",
      "Tags": "Cinema, Tech, Tier-1",
    },
    {
      "Full Name": "Pooja Hegde",
      "Email": "pooja@hegdecreative.com",
      "Phone": "+91 99300 44556",
      "City": "Bengaluru",
      "Organisation": "Hegde Creative",
      "Category": "VIP",
      "Tags": "Fashion, Keynote",
    },
  ];

  const csv = Papa.unparse(templateData);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
