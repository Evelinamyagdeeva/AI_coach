"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, PageHeader } from "@/components/ui/primitives";
import { formatShort, todayISO } from "@/lib/dates";
import { METRICS } from "@/lib/labels";
import { useApp } from "@/lib/store";
import type { MetricKind } from "@/lib/types";

export default function MeasurementsPage() {
  const measurements = useApp((state) => state.measurements);
  const enabled = useApp((state) => state.metricEnabled);
  const add = useApp((state) => state.addMeasurement);
  const remove = useApp((state) => state.removeMeasurement);
  const toggle = useApp((state) => state.setMetricEnabled);
  const clear = useApp((state) => state.clearMeasurements);
  const [kind, setKind] = useState<MetricKind>("weight");
  const [value, setValue] = useState("");
  const [custom, setCustom] = useState("");
  const metric = METRICS.find((item) => item.kind === kind) || { label: custom || "Свой показатель", unit: "" };

  return (
    <div>
      <PageHeader eyebrow="Измерения" title="Тело" text="Любой показатель можно выключить или стереть вместе с историей." />
      <div className="grid gap-3 md:grid-cols-2">
        {METRICS.map((item) => (
          <div key={item.kind} className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3">
            <div>
              <p className="font-medium">{item.label}</p>
              <p className="text-sm text-muted">{enabled[item.kind] ? "Отслеживается" : "Скрыто"}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => toggle(item.kind, !enabled[item.kind])}>{enabled[item.kind] ? "Выключить" : "Включить"}</Button>
              <Button size="sm" variant="quiet" onClick={() => clear(item.kind)}>Очистить</Button>
            </div>
          </div>
        ))}
      </div>
      <form
        className="mt-8 max-w-md space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          const number = Number(value.replace(",", "."));
          if (!number || !enabled[kind]) return;
          add({
            date: todayISO(),
            kind,
            label: kind === "custom" ? custom || "Свой" : metric.label,
            value: number,
            unit: kind === "weight" ? "кг" : "см",
          });
          setValue("");
        }}
      >
        <label className="block text-sm text-muted">
          Показатель
          <select value={kind} onChange={(event) => setKind(event.target.value as MetricKind)} className="mt-2 h-12 w-full rounded-xl border border-line bg-surface px-3 text-ink">
            {METRICS.map((item) => <option key={item.kind} value={item.kind}>{item.label}</option>)}
            <option value="custom">Свой</option>
          </select>
        </label>
        {kind === "custom" ? <Field label="Название" value={custom} onChange={(event) => setCustom(event.target.value)} /> : null}
        <Field label="Значение" value={value} onChange={(event) => setValue(event.target.value)} placeholder="82,4" />
        <Button type="submit" disabled={!enabled[kind]}>Добавить</Button>
        {!enabled[kind] ? <p className="text-sm text-muted">Сначала включите отслеживание.</p> : null}
      </form>
      <ul className="mt-8 space-y-2">
        {measurements.map((item) => (
          <li key={item.id} className="flex items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-sm">
            <span>{item.label} · {item.value} {item.unit}</span>
            <span className="flex items-center gap-3 text-muted">{formatShort(item.date)}<button type="button" onClick={() => remove(item.id)}>Удалить</button></span>
          </li>
        ))}
      </ul>
    </div>
  );
}
