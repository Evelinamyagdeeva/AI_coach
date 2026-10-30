import { applyActions } from "../lib/apply";
import { demoSnapshot } from "../lib/demo";
import { parseMealText } from "../lib/foods";
import { interpret } from "../lib/intents";

const state = demoSnapshot();
const phrases = [
  "Сегодня после приседа болела спина",
  "Сегодня у меня только 30 минут",
  "Я не хочу сегодня тренировать ноги",
  "Врач запретил мне бегать",
  "В среду не смогу тренироваться",
  "По понедельникам и средам у меня пары до 18:00, а в пятницу я работаю до позднего вечера",
  "Съел омлет из трёх яиц и два тоста",
  "Добавь вес 82.4 кг",
  "У меня дома яйца, курица, рис, авокадо и овощи. Что приготовить на ужин?",
  "На следующей неделе хочу тренироваться только три раза утром",
  "Покажи мой прогресс за последний месяц",
  "Я пропустил сегодняшнюю тренировку",
  "Что делать, если болят мышцы после вчерашней тренировки?",
  "Мне тяжело выполнять последний подход",
  "Сегодня тренировка ног",
];

const meal = parseMealText("Съел омлет из трёх яиц и два тоста");
console.log("MEAL", meal?.title, meal?.items.map((item) => `${item.name}:${item.grams}g/${item.kcal}kcal`).join(", "));

for (const phrase of phrases) {
  const result = interpret(phrase, state);
  const applied = result.actions ? applyActions(state, result.actions) : null;
  console.log("\n>", phrase);
  console.log(result.reply.split("\n")[0]);
  console.log("actions", result.actions?.map((item) => item.type).join(",") || "-", "proposal", result.proposal?.actions.map((item) => item.type).join(",") || "-");
  if (applied && phrase.includes("омлет")) {
    console.log("saved", applied.meals[0]?.title, applied.meals[0]?.items.map((item) => item.name).join("+"));
  }
  if (applied && phrase.includes("82")) console.log("weight", applied.profile.weightKg, applied.measurements[0]?.value);
}
