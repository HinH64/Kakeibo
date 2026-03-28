import { useEffect, useRef, useState } from "react";
import {
  Globe,
  Palette,
  DollarSign,
  Calendar,
  Download,
  Upload,
  Shield,
  Info,
  ChevronRight,
  Check,
  Loader2,
} from "lucide-react";
import { api } from "../lib/api";
import { useCurrencyStore } from "../stores/currencyStore";
import { useSettingsStore } from "../stores/settingsStore";


const LANGUAGE_OPTIONS = [
  { value: "zh-TW", label: "繁體中文" },
  { value: "ja", label: "日本語" },
  { value: "en", label: "English" },
];

const WEEK_OPTIONS = [
  { value: "1", label: "星期一" },
  { value: "0", label: "星期日" },
];

const THEME_OPTIONS = [
  { value: "dark", label: "深色", available: true },
  { value: "light", label: "淺色", available: false },
  { value: "system", label: "跟隨系統", available: false },
];

export function Settings() {
  const { currencies, fetchAll: fetchCurrencies } = useCurrencyStore();
  const { reportingCurrency, locale, theme, firstDayOfWeek, setSetting } = useSettingsStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [openPicker, setOpenPicker] = useState<string | null>(null);
  const [exportStatus, setExportStatus] = useState<"idle" | "busy" | "done">("idle");
  const [importStatus, setImportStatus] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [backupStatus, setBackupStatus] = useState<"idle" | "busy" | "done">("idle");

  useEffect(() => { fetchCurrencies(); }, []);

  const saveSetting = async (key: string, value: string) => {
    await setSetting(key, value);
    setOpenPicker(null);
  };

  const togglePicker = (key: string) =>
    setOpenPicker((prev) => (prev === key ? null : key));

  // ── Export ──────────────────────────────────────────────────────────────────
  const handleExport = async () => {
    setExportStatus("busy");
    try {
      const txns = (await api.transactions.listWithDetails()) as any[];
      const typeLabel: Record<string, string> = { income: "收入", expense: "支出", transfer: "轉帳" };
      const headers = ["日期", "類型", "金額", "幣別", "帳戶", "類別", "備註"];
      const rows = txns.map((t) => [
        t.date,
        typeLabel[t.type] ?? t.type,
        t.amount,
        t.accountCurrency,
        t.accountName,
        t.categoryName ?? "",
        t.note ?? "",
      ]);
      const csv = [headers, ...rows]
        .map((row) => row.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
        .join("\n");
      triggerDownload("\uFEFF" + csv, `kakeibo-${today()}.csv`, "text/csv;charset=utf-8;");
      setExportStatus("done");
      setTimeout(() => setExportStatus("idle"), 2500);
    } catch {
      setExportStatus("idle");
    }
  };

  // ── Import ──────────────────────────────────────────────────────────────────
  const handleImportFile = async (file: File) => {
    setImportStatus("busy");
    try {
      const text = await file.text();
      const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) { setImportStatus("error"); setTimeout(() => setImportStatus("idle"), 3000); return; }

      // Expect header: 日期,類型,金額,幣別,帳戶,類別,備註
      const rows = lines.slice(1).map(parseCsvRow);
      const accounts = (await api.accounts.list()) as any[];
      const categories = (await api.categories.list()) as any[];

      let created = 0;
      for (const row of rows) {
        const [date, typeZh, amountStr, , accountName, categoryNameZh, note] = row;
        const typeMap: Record<string, string> = { 收入: "income", 支出: "expense", 轉帳: "transfer" };
        const type = typeMap[typeZh ?? ""] ?? "expense";
        const account = accounts.find((a: any) => a.name === accountName);
        const category = categories.find((c: any) => c.nameZh === categoryNameZh || c.name === categoryNameZh);
        if (!account || !date || isNaN(Number(amountStr))) continue;
        await api.transactions.create({
          type,
          amount: Number(amountStr),
          date,
          accountId: account.id,
          categoryId: category?.id ?? null,
          note: note || null,
          toAccountId: null,
          toAmount: null,
          exchangeRate: null,
        });
        created++;
      }

      setImportStatus(created > 0 ? "done" : "error");
      setTimeout(() => setImportStatus("idle"), 3000);
    } catch {
      setImportStatus("error");
      setTimeout(() => setImportStatus("idle"), 3000);
    }
  };

  // ── Backup ──────────────────────────────────────────────────────────────────
  const handleBackup = async () => {
    setBackupStatus("busy");
    try {
      const [txns, accounts, categories] = await Promise.all([
        api.transactions.listWithDetails(),
        api.accounts.list(),
        api.categories.list(),
      ]);
      const json = JSON.stringify({ exportedAt: new Date().toISOString(), accounts, categories, transactions: txns }, null, 2);
      triggerDownload(json, `kakeibo-backup-${today()}.json`, "application/json");
      setBackupStatus("done");
      setTimeout(() => setBackupStatus("idle"), 2500);
    } catch {
      setBackupStatus("idle");
    }
  };

  // ── Derived display values ──────────────────────────────────────────────────
  const currencyLabel = reportingCurrency;
  const langLabel = LANGUAGE_OPTIONS.find((o) => o.value === locale)?.label ?? locale;
  const themeLabel = THEME_OPTIONS.find((o) => o.value === theme)?.label ?? theme;
  const weekLabel = WEEK_OPTIONS.find((o) => o.value === String(firstDayOfWeek))?.label ?? "";

  return (
    <div className="p-8 max-w-[560px] animate-fade-in">
      <div className="mb-8">
        <h2 className="text-[24px] font-bold text-text-primary tracking-tight">設定</h2>
      </div>

      {/* ── General ── */}
      <Group label="一般">
        {/* Reporting currency */}
        <PickerRow
          icon={DollarSign}
          label="報告幣別"
          sub="淨資產以此幣別顯示"
          value={currencyLabel}
          open={openPicker === "currency"}
          onToggle={() => togglePicker("currency")}
        >
          <div className="grid grid-cols-3 gap-1 p-3 border-t border-border">
            {currencies.map((c) => (
              <button
                key={c.code}
                onClick={() => saveSetting("reporting_currency", c.code)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] transition-colors ${
                  reportingCurrency === c.code
                    ? "bg-accent/15 text-accent-light"
                    : "hover:bg-bg-card-hover text-text-secondary"
                }`}
              >
                {reportingCurrency === c.code && <Check className="w-3 h-3 flex-shrink-0" />}
                <span className="font-medium">{c.code}</span>
                <span className="text-text-muted text-[11px]">{c.symbol}</span>
              </button>
            ))}
          </div>
        </PickerRow>

        {/* Language */}
        <PickerRow
          icon={Globe}
          label="語言"
          sub="介面顯示語言"
          value={langLabel}
          open={openPicker === "locale"}
          onToggle={() => togglePicker("locale")}
        >
          <div className="p-2 border-t border-border">
            {LANGUAGE_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => saveSetting("locale", o.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
                  locale === o.value
                    ? "bg-accent/15 text-accent-light"
                    : "hover:bg-bg-card-hover text-text-secondary"
                }`}
              >
                {o.label}
                {locale === o.value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </PickerRow>

        {/* Theme */}
        <PickerRow
          icon={Palette}
          label="主題"
          sub="外觀模式"
          value={themeLabel}
          open={openPicker === "theme"}
          onToggle={() => togglePicker("theme")}
        >
          <div className="p-2 border-t border-border">
            {THEME_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => o.available && saveSetting("theme", o.value)}
                disabled={!o.available}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
                  theme === o.value
                    ? "bg-accent/15 text-accent-light"
                    : !o.available
                    ? "text-text-muted cursor-not-allowed"
                    : "hover:bg-bg-card-hover text-text-secondary"
                }`}
              >
                <span>
                  {o.label}
                  {!o.available && <span className="ml-2 text-[11px] text-text-muted">（即將推出）</span>}
                </span>
                {theme === o.value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </PickerRow>

        {/* Week start */}
        <PickerRow
          icon={Calendar}
          label="每週起始日"
          value={weekLabel}
          open={openPicker === "week"}
          onToggle={() => togglePicker("week")}
        >
          <div className="p-2 border-t border-border">
            {WEEK_OPTIONS.map((o) => (
              <button
                key={o.value}
                onClick={() => saveSetting("first_day_of_week", o.value)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-[13px] transition-colors ${
                  String(firstDayOfWeek) === o.value
                    ? "bg-accent/15 text-accent-light"
                    : "hover:bg-bg-card-hover text-text-secondary"
                }`}
              >
                {o.label}
                {String(firstDayOfWeek) === o.value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </PickerRow>
      </Group>

      {/* ── Data ── */}
      <Group label="資料">
        <ActionRow
          icon={Download}
          label="匯出"
          sub="下載 CSV 格式交易記錄"
          status={exportStatus === "busy" ? "loading" : exportStatus === "done" ? "完成" : undefined}
          onClick={handleExport}
        />
        <ActionRow
          icon={Upload}
          label="匯入"
          sub="從 CSV 匯入交易"
          status={
            importStatus === "busy" ? "loading"
              : importStatus === "done" ? "完成"
              : importStatus === "error" ? "格式錯誤"
              : undefined
          }
          onClick={() => fileInputRef.current?.click()}
        />
        <ActionRow
          icon={Shield}
          label="備份"
          sub="匯出完整備份（JSON）"
          status={backupStatus === "busy" ? "loading" : backupStatus === "done" ? "完成" : undefined}
          onClick={handleBackup}
        />
      </Group>

      {/* ── About ── */}
      <Group label="關於">
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center">
              <Info className="w-4 h-4 text-text-secondary" strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-[13px] text-text-primary">Kakeibo</p>
              <p className="text-[11px] text-text-tertiary mt-0.5">v0.1.0 · 多幣別記帳</p>
            </div>
          </div>
        </div>
      </Group>

      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImportFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2 px-1">{label}</p>
      <div className="glass-card overflow-hidden divide-y divide-border">{children}</div>
    </section>
  );
}

function PickerRow({
  icon: Icon,
  label,
  sub,
  value,
  open,
  onToggle,
  children,
}: {
  icon: typeof Globe;
  label: string;
  sub?: string;
  value: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-bg-card-hover transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center">
            <Icon className="w-4 h-4 text-text-secondary" strokeWidth={1.8} />
          </div>
          <div className="text-left">
            <p className="text-[13px] text-text-primary">{label}</p>
            {sub && <p className="text-[11px] text-text-tertiary mt-0.5">{sub}</p>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-text-tertiary">{value}</span>
          <ChevronRight
            className={`w-3.5 h-3.5 text-text-muted transition-transform ${open ? "rotate-90" : ""}`}
          />
        </div>
      </button>
      {open && <div className="bg-bg-elevated">{children}</div>}
    </div>
  );
}

function ActionRow({
  icon: Icon,
  label,
  sub,
  status,
  onClick,
}: {
  icon: typeof Download;
  label: string;
  sub?: string;
  status?: "loading" | string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={status === "loading"}
      className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-bg-card-hover transition-colors disabled:opacity-60"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-bg-elevated flex items-center justify-center">
          <Icon className="w-4 h-4 text-text-secondary" strokeWidth={1.8} />
        </div>
        <div className="text-left">
          <p className="text-[13px] text-text-primary">{label}</p>
          {sub && <p className="text-[11px] text-text-tertiary mt-0.5">{sub}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        {status === "loading" ? (
          <Loader2 className="w-3.5 h-3.5 text-text-muted animate-spin" />
        ) : status ? (
          <span className="text-[12px] text-accent-light">{status}</span>
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
        )}
      </div>
    </button>
  );
}

// ── Utilities ─────────────────────────────────────────────────────────────────

function today() {
  return new Date().toISOString().slice(0, 10);
}

function triggerDownload(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function parseCsvRow(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
