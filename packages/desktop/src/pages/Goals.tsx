import { useState } from "react";
import { Plus, Trash2, X, Target, CalendarClock } from "lucide-react";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { useTargetStore, type FinancialTarget, type PlannedEvent } from "../stores/targetStore";
import { useCurrencyStore } from "../stores/currencyStore";
import { useSettingsStore } from "../stores/settingsStore";
import { useExchangeRateStore } from "../stores/exchangeRateStore";

const EMPTY_TARGET: { name: string; type: "floor" | "milestone"; amount: string; currencyCode: string; targetMonth: string } =
  { name: "", type: "floor", amount: "", currencyCode: "", targetMonth: "" };
const EMPTY_EVENT = { name: "", amount: "", currencyCode: "", month: "" };

export function Goals() {
  const { targets, events, addTarget, updateTarget, removeTarget, addEvent, removeEvent } = useTargetStore();
  const { formatWithSymbol, toSmallestUnit, toDisplayAmount } = useCurrencyStore();
  const { reportingCurrency } = useSettingsStore();
  const { convert } = useExchangeRateStore();

  const [showTargetForm, setShowTargetForm] = useState(false);
  const [editingTarget, setEditingTarget] = useState<FinancialTarget | null>(null);
  const [targetForm, setTargetForm] = useState(EMPTY_TARGET);

  const [showEventForm, setShowEventForm] = useState(false);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT);

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteEventId, setDeleteEventId] = useState<string | null>(null);

  const openAddTarget = () => {
    setEditingTarget(null);
    setTargetForm({ ...EMPTY_TARGET, currencyCode: reportingCurrency });
    setShowTargetForm(true);
  };

  const openEditTarget = (t: FinancialTarget) => {
    setEditingTarget(t);
    setTargetForm({
      name: t.name,
      type: t.type,
      amount: String(toDisplayAmount(t.amount, t.currencyCode)),
      currencyCode: t.currencyCode,
      targetMonth: t.targetMonth ?? "",
    });
    setShowTargetForm(true);
  };

  const handleSaveTarget = () => {
    if (!targetForm.name || !targetForm.amount || !targetForm.currencyCode) return;
    const data = {
      name: targetForm.name,
      type: targetForm.type,
      amount: toSmallestUnit(parseFloat(targetForm.amount), targetForm.currencyCode.toUpperCase()),
      currencyCode: targetForm.currencyCode.toUpperCase(),
      targetMonth: targetForm.type === "milestone" ? targetForm.targetMonth || undefined : undefined,
    };
    if (editingTarget) {
      updateTarget(editingTarget.id, data);
    } else {
      addTarget(data);
    }
    setShowTargetForm(false);
    setTargetForm(EMPTY_TARGET);
    setEditingTarget(null);
  };

  const openAddEvent = () => {
    setEventForm({ ...EMPTY_EVENT, currencyCode: reportingCurrency });
    setShowEventForm(true);
  };

  const handleSaveEvent = () => {
    if (!eventForm.name || !eventForm.amount || !eventForm.currencyCode || !eventForm.month) return;
    addEvent({
      name: eventForm.name,
      amount: toSmallestUnit(parseFloat(eventForm.amount), eventForm.currencyCode.toUpperCase()),
      currencyCode: eventForm.currencyCode.toUpperCase(),
      month: eventForm.month,
    });
    setShowEventForm(false);
    setEventForm(EMPTY_EVENT);
  };

  const floorTargets = targets.filter((t) => t.type === "floor");
  const milestoneTargets = targets.filter((t) => t.type === "milestone");
  const sortedEvents = [...events].sort((a, b) => a.month.localeCompare(b.month));

  return (
    <div className="p-8 max-w-[700px] animate-fade-in">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[24px] font-bold text-text-primary tracking-tight">目標規劃</h2>
          <p className="text-text-tertiary text-[12px] mt-1">
            {targets.length} 個目標 · {events.length} 個計畫事件
          </p>
        </div>
      </div>

      {/* ── Floor Targets ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-expense" />
            <h3 className="text-[13px] font-semibold text-text-primary">底線目標</h3>
            <span className="text-[11px] text-text-tertiary">每個月都必須維持的最低資產</span>
          </div>
          <button onClick={openAddTarget}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] bg-bg-elevated text-text-secondary hover:bg-bg-card-hover transition-colors">
            <Plus className="w-3.5 h-3.5" />新增
          </button>
        </div>

        {floorTargets.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <Target className="w-8 h-8 text-text-muted mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-[13px] text-text-tertiary mb-1">尚未設定底線目標</p>
            <p className="text-[11px] text-text-muted">底線目標會在總覽的預測圖表中顯示為水平虛線</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden divide-y divide-border">
            {floorTargets.map((t) => {
              const converted = convert(t.amount, t.currencyCode, reportingCurrency);
              return (
                <div key={t.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-bg-card-hover transition-colors">
                  <div className="w-8 h-8 rounded-lg bg-expense/10 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-expense" strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[14px] font-medium text-text-primary">{t.name}</p>
                    <p className="text-[11px] text-text-tertiary mt-0.5">每月維持不低於此金額</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-[15px] font-semibold text-text-primary amount-large">
                      {formatWithSymbol(t.amount, t.currencyCode)}
                    </p>
                    {t.currencyCode !== reportingCurrency && (
                      <p className="text-[11px] text-text-tertiary">
                        ≈ {formatWithSymbol(converted, reportingCurrency)}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => openEditTarget(t)}
                      className="p-1.5 rounded-lg hover:bg-bg-elevated transition-colors text-text-tertiary hover:text-text-secondary">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </button>
                    <button onClick={() => setDeleteTargetId(t.id)}
                      className="p-1.5 rounded-lg hover:bg-expense/10 transition-colors">
                      <Trash2 className="w-3.5 h-3.5 text-expense" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Milestone Targets ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#f0b429]" />
            <h3 className="text-[13px] font-semibold text-text-primary">里程碑目標</h3>
            <span className="text-[11px] text-text-tertiary">在指定月份前達到的金額</span>
          </div>
          <button onClick={() => { setTargetForm({ ...EMPTY_TARGET, type: "milestone", currencyCode: reportingCurrency }); setEditingTarget(null); setShowTargetForm(true); }}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] bg-bg-elevated text-text-secondary hover:bg-bg-card-hover transition-colors">
            <Plus className="w-3.5 h-3.5" />新增
          </button>
        </div>

        {milestoneTargets.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <CalendarClock className="w-8 h-8 text-text-muted mx-auto mb-2" strokeWidth={1.5} />
            <p className="text-[13px] text-text-tertiary mb-1">尚未設定里程碑目標</p>
            <p className="text-[11px] text-text-muted">里程碑會在預測圖表中以金色點標示</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden divide-y divide-border">
            {milestoneTargets
              .sort((a, b) => (a.targetMonth ?? "").localeCompare(b.targetMonth ?? ""))
              .map((t) => {
                const converted = convert(t.amount, t.currencyCode, reportingCurrency);
                const now = new Date();
                const [y, m] = (t.targetMonth ?? "").split("-").map(Number);
                const monthsLeft = (y - now.getFullYear()) * 12 + (m - (now.getMonth() + 1));
                return (
                  <div key={t.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-bg-card-hover transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-[#f0b429]/10 flex items-center justify-center shrink-0">
                      <CalendarClock className="w-4 h-4 text-[#f0b429]" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-medium text-text-primary">{t.name}</p>
                      <p className="text-[11px] text-text-tertiary mt-0.5">
                        {t.targetMonth} · {monthsLeft > 0 ? `還有 ${monthsLeft} 個月` : monthsLeft === 0 ? "本月" : "已過期"}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[15px] font-semibold text-text-primary amount-large">
                        {formatWithSymbol(t.amount, t.currencyCode)}
                      </p>
                      {t.currencyCode !== reportingCurrency && (
                        <p className="text-[11px] text-text-tertiary">
                          ≈ {formatWithSymbol(converted, reportingCurrency)}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <button onClick={() => openEditTarget(t)}
                        className="p-1.5 rounded-lg hover:bg-bg-elevated transition-colors text-text-tertiary hover:text-text-secondary">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteTargetId(t.id)}
                        className="p-1.5 rounded-lg hover:bg-expense/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-expense" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* ── Planned Events ── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-semibold text-text-primary">計畫事件</h3>
            <span className="text-[11px] text-text-tertiary">未來的一次性收入或支出</span>
          </div>
          <button onClick={openAddEvent}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] bg-bg-elevated text-text-secondary hover:bg-bg-card-hover transition-colors">
            <Plus className="w-3.5 h-3.5" />新增
          </button>
        </div>

        {sortedEvents.length === 0 ? (
          <div className="glass-card p-6 text-center">
            <p className="text-[13px] text-text-tertiary mb-1">尚未設定計畫事件</p>
            <p className="text-[11px] text-text-muted">計畫事件會影響預測曲線（如：ILR 費用、旅行、大型支出）</p>
          </div>
        ) : (
          <div className="glass-card overflow-hidden divide-y divide-border">
            {sortedEvents.map((e) => (
              <div key={e.id} className="flex items-center gap-4 px-5 py-4 group hover:bg-bg-card-hover transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${e.amount >= 0 ? "bg-income/10" : "bg-expense/10"}`}>
                  <span className={`text-[16px] font-bold ${e.amount >= 0 ? "text-income" : "text-expense"}`}>
                    {e.amount >= 0 ? "+" : "−"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-medium text-text-primary">{e.name}</p>
                  <p className="text-[11px] text-text-tertiary mt-0.5">{e.month}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-[15px] font-semibold amount-large ${e.amount >= 0 ? "text-income" : "text-expense"}`}>
                    {e.amount >= 0 ? "+" : ""}{formatWithSymbol(e.amount, e.currencyCode)}
                  </p>
                  {e.currencyCode !== reportingCurrency && (
                    <p className="text-[11px] text-text-tertiary">
                      ≈ {formatWithSymbol(convert(e.amount, e.currencyCode, reportingCurrency), reportingCurrency)}
                    </p>
                  )}
                </div>
                <button onClick={() => setDeleteEventId(e.id)}
                  className="p-1.5 rounded-lg hover:bg-expense/10 transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                  <Trash2 className="w-3.5 h-3.5 text-expense" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Target Form Modal ── */}
      {showTargetForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowTargetForm(false)}>
          <div className="glass-card p-6 w-[400px] space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-text-primary">
                {editingTarget ? "編輯目標" : "新增目標"}
              </h3>
              <button onClick={() => setShowTargetForm(false)}><X className="w-4 h-4 text-text-tertiary" /></button>
            </div>

            <div className="flex gap-2">
              {(["floor", "milestone"] as const).map((v) => (
                <button key={v} onClick={() => setTargetForm({ ...targetForm, type: v })}
                  className={`flex-1 py-2 rounded-lg text-[12px] font-medium transition-colors ${targetForm.type === v ? "bg-accent text-white" : "bg-bg-elevated text-text-secondary hover:bg-bg-card-hover"}`}>
                  {v === "floor" ? "底線（每月）" : "里程碑（指定月）"}
                </button>
              ))}
            </div>

            <input placeholder="名稱（如：簽證底線、ILR 準備金）" value={targetForm.name}
              onChange={(e) => setTargetForm({ ...targetForm, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />

            <div className="flex gap-2">
              <input type="number" placeholder="金額" value={targetForm.amount}
                onChange={(e) => setTargetForm({ ...targetForm, amount: e.target.value })}
                className="flex-1 px-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
              <input placeholder="幣別" value={targetForm.currencyCode}
                onChange={(e) => setTargetForm({ ...targetForm, currencyCode: e.target.value })}
                className="w-24 px-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
            </div>

            {targetForm.type === "milestone" && (
              <div>
                <p className="text-[11px] text-text-tertiary mb-1.5">目標月份</p>
                <input type="month" value={targetForm.targetMonth}
                  onChange={(e) => setTargetForm({ ...targetForm, targetMonth: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] text-text-primary focus:outline-none focus:border-accent/50" />
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <button onClick={() => { setShowTargetForm(false); setEditingTarget(null); }}
                className="flex-1 py-2.5 rounded-xl bg-bg-elevated text-[13px] text-text-secondary hover:bg-bg-card-hover transition-colors">
                取消
              </button>
              <button onClick={handleSaveTarget}
                className="flex-1 py-2.5 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-light transition-colors">
                儲存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Event Form Modal ── */}
      {showEventForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowEventForm(false)}>
          <div className="glass-card p-6 w-[400px] space-y-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-[15px] font-semibold text-text-primary">新增計畫事件</h3>
              <button onClick={() => setShowEventForm(false)}><X className="w-4 h-4 text-text-tertiary" /></button>
            </div>

            <input placeholder="名稱（如：ILR 申請費、日本旅行）" value={eventForm.name}
              onChange={(e) => setEventForm({ ...eventForm, name: e.target.value })}
              className="w-full px-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />

            <div className="flex gap-2">
              <input type="number" placeholder="金額（負數 = 支出）" value={eventForm.amount}
                onChange={(e) => setEventForm({ ...eventForm, amount: e.target.value })}
                className="flex-1 px-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
              <input placeholder="幣別" value={eventForm.currencyCode}
                onChange={(e) => setEventForm({ ...eventForm, currencyCode: e.target.value })}
                className="w-24 px-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent/50" />
            </div>

            <div>
              <p className="text-[11px] text-text-tertiary mb-1.5">發生月份</p>
              <input type="month" value={eventForm.month}
                onChange={(e) => setEventForm({ ...eventForm, month: e.target.value })}
                className="w-full px-3 py-2.5 rounded-xl bg-bg-input border border-border text-[13px] text-text-primary focus:outline-none focus:border-accent/50" />
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={() => setShowEventForm(false)}
                className="flex-1 py-2.5 rounded-xl bg-bg-elevated text-[13px] text-text-secondary hover:bg-bg-card-hover transition-colors">
                取消
              </button>
              <button onClick={handleSaveEvent}
                className="flex-1 py-2.5 rounded-xl bg-accent text-white text-[13px] font-medium hover:bg-accent-light transition-colors">
                儲存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm dialogs */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onConfirm={() => { removeTarget(deleteTargetId!); setDeleteTargetId(null); }}
        onCancel={() => setDeleteTargetId(null)}
        title="刪除目標"
        message="確定要刪除這個目標嗎？"
        confirmLabel="刪除"
        variant="danger"
      />
      <ConfirmDialog
        isOpen={!!deleteEventId}
        onConfirm={() => { removeEvent(deleteEventId!); setDeleteEventId(null); }}
        onCancel={() => setDeleteEventId(null)}
        title="刪除計畫事件"
        message="確定要刪除這個計畫事件嗎？"
        confirmLabel="刪除"
        variant="danger"
      />
    </div>
  );
}
