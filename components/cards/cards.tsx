import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import type { Workout } from "@/lib/types";

export function WorkoutCard({ workout, href }: { workout: Workout; href?: string }) {
  return (
    <Card className="flex min-h-0 flex-1 flex-col justify-between">
      <div>
        <p className="text-sm text-muted">{workout.time} · {workout.difficulty}</p>
        <h3 className="mt-2 text-xl font-semibold tracking-tight">{workout.name}</h3>
        <p className="mt-2 text-sm text-muted">
          {workout.durationMin} мин · {workout.goal}
        </p>
        {workout.adjustment ? <p className="mt-3 text-sm leading-6">{workout.adjustment}</p> : null}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <p className="text-sm text-muted">{statusLabel(workout.status)}</p>
        {href ? (
          <Link href={href}>
            <Button size="sm" variant={workout.status === "planned" ? "primary" : "ghost"}>
              {workout.status === "planned" ? "Открыть" : "Итог"}
            </Button>
          </Link>
        ) : null}
      </div>
    </Card>
  );
}

function statusLabel(status: Workout["status"]) {
  if (status === "done") return "Выполнена";
  if (status === "skipped") return "Пропущена";
  return "В плане";
}

export function AiCard({ text, href = "/coach" }: { text: string; href?: string }) {
  return (
    <Card className="bg-sand">
      <p className="text-sm text-muted">AI-тренер</p>
      <p className="mt-3 text-lg font-medium leading-7">{text}</p>
      <Link href={href} className="mt-5 inline-flex">
        <Button variant="secondary">Написать</Button>
      </Link>
    </Card>
  );
}

export function ScheduleCard({ title, meta, status }: { title: string; meta: string; status: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{status}</p>
      <h3 className="mt-2 text-xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm text-muted">{meta}</p>
    </Card>
  );
}

export function MeasurementCard({ label, value, delta }: { label: string; value: string; delta?: string }) {
  return (
    <Card>
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {delta ? <p className="mt-2 text-sm text-muted">{delta}</p> : null}
    </Card>
  );
}
