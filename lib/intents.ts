import { areaFromText, focusFromArea, normalize } from "./body";
import { addDays, mentionedWeekdays, nextMonday, timeLabel, todayISO, WEEKDAYS_FULL, weekdayMon0 } from "./dates";
import { mealFromParsed, parseMealText, FOODS } from "./foods";
import { uid } from "./id";
import { FOCUS_LABEL } from "./labels";
import { sumMacros, targetsFor } from "./nutrition";
import { suggestRecipes } from "./recipes";
import type { CoachAction, DayTime, Focus, Profile, Snapshot } from "./types";

export interface IntentResult {
  reply: string;
  link?: { href: string; label: string };
  actions?: CoachAction[];
  proposal?: { title: string; summary: string; actions: CoachAction[] };
  undoable?: boolean;
}

export function interpret(raw: string, state: Snapshot, now = new Date()): IntentResult {
  const text = normalize(raw);
  const today = todayISO(now);
  const workout = state.workouts.find((item) => item.date === today && item.status === "planned");

  const weight = text.match(/(?:вес|вешу)\s*(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s*кг/);
  if (weight && /вес|кг|вешу/.test(text)) {
    const value = Number((weight[1] || weight[2]).replace(",", "."));
    return {
      reply: `Записала ${value.toString().replace(".", ",")} кг. Точка появится на графике.`,
      link: { href: "/progress", label: "Открыть прогресс" },
      actions: [{ type: "log_weight", value, date: today }],
      undoable: true,
    };
  }

  if (/прогресс|статистик|как у меня дела|за последний месяц|за месяц|за неделю/.test(text)) {
    return { reply: progressReply(state, now), link: { href: "/progress", label: "Подробная статистика" } };
  }

  if (/врач|запрет|нельзя|противопоказан/.test(text)) {
    const area = areaFromText(text) || (/бег/.test(text) ? "run" : undefined);
    const label = area === "run" ? "бег" : area === "back" ? "нагрузку на спину" : area === "knee" ? "нагрузку на колени" : "это ограничение";
    const restriction = {
      id: uid("lim"),
      text: raw.trim(),
      kind: "doctor" as const,
      area,
      createdAt: now.toISOString(),
    };
    return {
      reply: `Я не отменяю рекомендацию врача и не ставлю диагноз. Могу убрать ${label} из следующих тренировок и оставить более спокойные варианты. Если ограничение изменится, это лучше подтвердить специалисту.`,
      link: { href: "/planner", label: "Открыть план" },
      proposal: {
        title: "Учесть ограничение",
        summary: `Будущие тренировки перестроятся без: ${label}.`,
        actions: [{ type: "add_restriction", restriction }],
      },
    };
  }

  if (/креп|болят мышцы|мышцы болят|после вчерашн/.test(text) && !/спин|колен|плеч|поясниц|сустав/.test(text)) {
    return {
      reply: "Обычная мышечная усталость часто проходит за день-два: подойдут ходьба, сон и спокойная еда. Если боль резкая, отёчная или мешает обычному шагу, это уже повод обратиться к специалисту, а не продолжать ту же нагрузку.",
      link: { href: "/workouts", label: "Посмотреть восстановление" },
    };
  }

  if (/бол(ит|ела|ело|ят)|дискомфорт|тянет|потянул|потянула/.test(text)) {
    const area = areaFromText(text);
    const place = area === "back" ? "спины" : area === "knee" ? "колена" : area === "shoulder" ? "плеча" : "этого места";
    return {
      reply: `Записала это к сегодняшнему дню. Я не ставлю диагноз. Могу сделать следующие тренировки мягче для ${place}. Если боль резкая, нарастает или появилась после запрета врача, лучше показать это специалисту.`,
      link: { href: "/workouts", label: "К тренировкам" },
      actions: [{ type: "journal", note: { id: uid("j"), date: today, text: raw.trim(), area } }],
      proposal: {
        title: "Смягчить следующие тренировки",
        summary: area === "back" ? "Уберу приседы и наклоны с нагрузкой на спину." : "Учту ограничение и соберу более спокойные сессии.",
        actions: [
          {
            type: "add_restriction",
            restriction: { id: uid("lim"), text: raw.trim(), kind: "pain", area, createdAt: now.toISOString() },
          },
        ],
      },
    };
  }

  if (/тяжело|последн(ий|ем) подход|не вывожу|слишком тяжел/.test(text)) {
    return {
      reply: "Похоже, запас на сегодня закончился. Могу снизить объём следующих тренировок: меньше подходов и спокойнее вес.",
      proposal: {
        title: "Снизить нагрузку",
        summary: "Следующие сессии станут чуть короче и легче.",
        actions: [
          { type: "journal", note: { id: uid("j"), date: today, text: raw.trim() } },
          { type: "easier" },
        ],
      },
    };
  }

  if (/пропустил|пропустила|пропустила тренировку|пропустил тренировку/.test(text)) {
    if (!state.workouts.some((item) => item.date === today && item.status === "planned")) {
      return { reply: "На сегодня тренировки в плане нет. Ближайшая сессия остаётся на своём месте.", link: { href: "/planner", label: "Открыть календарь" } };
    }
    return {
      reply: "Отмечу сегодняшнюю тренировку как пропущенную. Питание и следующая сессия не сгорают.",
      proposal: {
        title: "Пропустить сегодня",
        summary: workout ? `${workout.name} · ${workout.time}` : "Сегодняшняя сессия",
        actions: [{ type: "skip_workout", date: today }],
      },
    };
  }

  if (/не смогу|не получится|не буду тренир/.test(text)) {
    const days = mentionedWeekdays(text);
    const date = days.length ? upcomingDate(today, days[0]) : today;
    const name = ["понедельника", "вторника", "среды", "четверга", "пятницы", "субботы", "воскресенья"][weekdayMon0(date)];
    return {
      reply: `Могу перенести тренировку с ${name} на ближайший свободный день.`,
      link: { href: "/planner", label: "Открыть план" },
      proposal: {
        title: "Перенести тренировку",
        summary: `Сессия ${name} сдвинется на день без другой тренировки.`,
        actions: [{ type: "move_workout", date }],
      },
    };
  }

  if (/только\s+\d+\s*минут|\d+\s*минут/.test(text) && /только|могу|есть |сегодня|успею/.test(text)) {
    const minutes = Number(text.match(/(\d+)\s*минут/)?.[1] || 30);
    return {
      reply: `Могу собрать сегодняшнюю тренировку на ${minutes} минут: меньше упражнений, та же идея.`,
      proposal: {
        title: `Сократить до ${minutes} минут`,
        summary: workout ? `Сейчас в плане «${workout.name}», ${workout.durationMin} минут.` : "Обновлю сегодняшнюю сессию.",
        actions: [{ type: "set_duration", date: today, minutes }],
      },
    };
  }

  if (/не хочу/.test(text) && /ног|спин|верх|пресс|кардио|бег/.test(text)) {
    const area = areaFromText(text) || "legs";
    const instead = area === "legs" ? "верх тела" : "более спокойный фокус";
    return {
      reply: `Оставлю сегодня ${instead}. Это не отмена недели, только сегодняшний день.`,
      proposal: {
        title: "Поменять сегодняшний фокус",
        summary: `Вместо текущей сессии будет ${instead}.`,
        actions: [{ type: "avoid_focus", date: today, area }],
      },
    };
  }

  if (/три раза|3 раза|только три/.test(text) && /утр|недел/.test(text)) {
    const from = /следующ/.test(text) ? nextMonday(today) : today;
    return {
      reply: `Могу поставить три утренние тренировки: понедельник, среда и пятница, в 07:30. Неделя начнётся ${/следующ/.test(text) ? "со следующего понедельника" : "с ближайших дней"}.`,
      proposal: {
        title: "Три утра в неделю",
        summary: "Пн, Ср, Пт · 07:30. Будущие сессии перестроятся.",
        actions: [{ type: "set_schedule", daysPerWeek: 3, availableDays: [0, 2, 4], preferredTime: "morning", note: raw.trim(), from }],
      },
    };
  }

  if (/пары|до 18|поздн|работаю|график|расписан/.test(text) && mentionedWeekdays(text).length) {
    const mentioned = mentionedWeekdays(text);
    const late = /пятниц/.test(text) && /поздн|работа/.test(text);
    let days = state.profile.availableDays.filter((day) => !(late && day === 4));
    for (const day of mentioned) {
      if (late && day === 4) continue;
      if (!days.includes(day)) days.push(day);
    }
    if (late) days = days.filter((day) => day !== 4);
    if (!days.length) days = [0, 2, 5];
    days.sort((a, b) => a - b);
    const time: DayTime = /утр/.test(text) ? "morning" : "evening";
    return {
      reply: `Учту график: ${late ? "пятницу оставляю свободной, " : ""}тренировки ставлю ${timeLabel(time)}. Дни: ${days.map((day) => WEEKDAYS_FULL[day]).join(", ")}.`,
      proposal: {
        title: "Подстроить расписание",
        summary: `${days.map((day) => WEEKDAYS_FULL[day]).join(", ")} · ${timeLabel(time)}.`,
        actions: [{ type: "set_schedule", daysPerWeek: days.length, availableDays: days, preferredTime: time, note: raw.trim(), from: today }],
      },
    };
  }

  if (/меню на неделю|составь меню|план питания на неделю/.test(text)) {
    return {
      reply: "Соберу неделю: завтрак, обед, ужин и перекус с учётом цели, аллергий и того, что вы не едите. Список покупок сложится сам.",
      link: { href: "/chef/week", label: "Открыть меню" },
      actions: [{ type: "generate_menu" }],
      undoable: true,
    };
  }

  if (/что приготовить|на ужин|на обед|что поесть|шеф|из того что/.test(text)) {
    const found = pantryFromText(text);
    const profile = found.length ? { ...state.profile, pantry: [...new Set([...state.profile.pantry, ...found])] } : state.profile;
    const ideas = suggestRecipes(profile, /завтрак/.test(text) ? "breakfast" : /перекус/.test(text) ? "snack" : "dinner", 3);
    const lines = ideas.map((recipe) => `${recipe.title} · ${recipe.kcal} ккал · ${recipe.protein} г белка · ${recipe.minutes} мин`).join("\n");
    return {
      reply: ideas.length
        ? `Вот что подходит под остаток дня и продукты дома:\n${lines}\nОценка порций приблизительная.`
        : "Пока не вижу подходящего блюда. Добавьте, что есть дома, или откройте шефа.",
      link: { href: "/chef", label: "Открыть шефа" },
      actions: found.length ? [{ type: "set_pantry", items: found }] : undefined,
    };
  }

  if (/тренировк/.test(text) && /ног|верх|спин|все тело|всё тело|кардио|восстанов/.test(text)) {
    const area = areaFromText(text);
    const focus: Focus = /верх/.test(text) ? "upper" : /кардио|бег/.test(text) ? "conditioning" : /восстанов/.test(text) ? "recovery" : /все тело|всё тело/.test(text) ? "full" : focusFromArea(area || "legs");
    if (workout && workout.focus === focus) {
      return {
        reply: `Сегодня как раз «${workout.name}», ${workout.durationMin} мин в ${workout.time}.`,
        link: { href: `/workouts/${workout.id}`, label: "Открыть тренировку" },
      };
    }
    return {
      reply: `Могу поставить на сегодня: ${FOCUS_LABEL[focus]}.`,
      proposal: {
        title: "Поменять фокус дня",
        summary: FOCUS_LABEL[focus],
        actions: [{ type: "request_focus", date: today, focus }],
      },
    };
  }

  if (/(съел|съела|поел|поела|ел |ела |завтракал|завтракала|обедал|обедала|ужинал|ужинала)/.test(text) || parseMealText(text)) {
    const parsed = parseMealText(raw);
    if (parsed && /(съел|съела|поел|поела|ел |ела |завтрак|обед|ужин|перекус|\d)/.test(text)) {
      const meal = mealFromParsed(parsed, "text", today, timeOf(now));
      const totals = sumMacros(parsed.items);
      return {
        reply: `Добавила «${parsed.title}»: около ${totals.kcal} ккал и ${totals.protein} г белка. Это оценка, порцию можно поправить в дневнике.`,
        link: { href: "/nutrition", label: "Открыть питание" },
        actions: [{ type: "log_meal", meal }],
        undoable: true,
      };
    }
  }

  if (workout && /сегодняшн(яя|юю) тренировк|что сегодня|покажи тренировк/.test(text)) {
    return {
      reply: `Сегодня «${workout.name}», ${workout.durationMin} мин в ${workout.time}.`,
      link: { href: `/workouts/${workout.id}`, label: "Открыть тренировку" },
    };
  }

  return {
    reply: "Могу поменять тренировку, записать еду или вес, перенести день и предложить ужин. Напишите, что именно сделать.",
    link: { href: "/coach", label: "Остаться в диалоге" },
  };
}

function progressReply(state: Snapshot, now: Date) {
  const today = todayISO(now);
  const from = addDays(today, -30);
  const done = state.workouts.filter((item) => item.status === "done" && item.date >= from);
  const minutes = done.reduce((sum, item) => sum + item.durationMin, 0);
  const weights = state.measurements.filter((item) => item.kind === "weight").sort((a, b) => a.date.localeCompare(b.date));
  const delta = weights.length > 1 ? Math.round((weights[weights.length - 1].value - weights[0].value) * 10) / 10 : 0;
  const meals = state.meals.filter((item) => item.date >= from);
  const kcal = meals.reduce((sum, meal) => sum + meal.items.reduce((inner, item) => inner + item.kcal, 0), 0);
  const days = new Set(meals.map((meal) => meal.date)).size || 1;
  const targets = targetsFor(state.profile);
  return `За 30 дней: ${done.length} тренировок и ${Math.round(minutes / 60)} ч. Средняя оценка калорий в дни с записями — ${Math.round(kcal / days)} из ${targets.kcal}. Вес: ${delta > 0 ? "+" : ""}${delta.toString().replace(".", ",")} кг по сохранённым точкам.`;
}

function upcomingDate(today: string, weekday: number) {
  const current = weekdayMon0(today);
  const delta = (weekday - current + 7) % 7;
  return addDays(today, delta);
}

function timeOf(now: Date) {
  return `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
}

function pantryFromText(text: string) {
  const found = new Set<string>();
  for (const food of FOODS) {
    if (food.keys.some((key) => text.includes(key))) found.add(food.name === "Яйцо" ? "яйца" : food.name.toLowerCase());
  }
  if (/овощ/.test(text)) found.add("овощи");
  return [...found];
}

export function scheduleSummary(profile: Profile) {
  return profile.availableDays
    .slice()
    .sort((a, b) => a - b)
    .map((day) => WEEKDAYS_FULL[day])
    .join(", ");
}
