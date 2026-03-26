import { Globe, Palette, DollarSign, Calendar, Download, Upload, Shield, Info, ChevronRight } from "lucide-react";

export function Settings() {
  return (
    <div className="p-8 max-w-[560px] fade-in">
      <div className="mb-8">
        <h2 className="text-[24px] font-bold text-text-primary tracking-tight">設定</h2>
      </div>

      <Group label="一般">
        <Row icon={DollarSign} label="報告幣別" sub="淨資產以此幣別顯示" value="TWD" />
        <Row icon={Globe} label="語言" sub="介面顯示語言" value="繁體中文" />
        <Row icon={Palette} label="主題" sub="外觀模式" value="深色" />
        <Row icon={Calendar} label="每週起始日" value="星期一" />
      </Group>

      <Group label="資料">
        <Row icon={Download} label="匯出" sub="CSV / JSON" />
        <Row icon={Upload} label="匯入" sub="從 CSV 匯入交易" />
        <Row icon={Shield} label="備份" sub="備份到本機" />
      </Group>

      <Group label="關於">
        <Row icon={Info} label="Kakeibo" sub="v0.1.0 · 多幣別記帳" />
      </Group>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <p className="text-[11px] font-medium text-text-tertiary uppercase tracking-wider mb-2 px-1">{label}</p>
      <div className="rounded-xl bg-bg-card overflow-hidden divide-y divide-border">
        {children}
      </div>
    </section>
  );
}

function Row({ icon: Icon, label, sub, value }: { icon: typeof Globe; label: string; sub?: string; value?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 hover:bg-bg-hover transition-colors cursor-pointer">
      <div className="flex items-center gap-3">
        <Icon className="w-4 h-4 text-text-tertiary" strokeWidth={1.5} />
        <div>
          <p className="text-[13px] text-text-primary">{label}</p>
          {sub && <p className="text-[11px] text-text-quaternary mt-0.5">{sub}</p>}
        </div>
      </div>
      <div className="flex items-center gap-1">
        {value && <span className="text-[13px] text-text-tertiary">{value}</span>}
        <ChevronRight className="w-3.5 h-3.5 text-text-quaternary" />
      </div>
    </div>
  );
}
