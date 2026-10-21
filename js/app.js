(() => {
  "use strict";
  const D = window.AB_DATA;
  const EN = document.documentElement.lang === "en";
  const L = (ru, en) => (EN ? en : ru);
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const LOCALE = L("ru-RU", "en-US");
  const nf = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
  const dec = (s) => (EN ? String(s) : String(s).replace(".", ","));
  const tg = (n) => nf.format(Math.round(n)) + " ₸";
  const mln = (n) => (n >= 1e9 ? dec((n / 1e9).toFixed(2)) + L(" млрд ₸", "B ₸") : dec((n / 1e6).toFixed(1)) + L(" млн ₸", "M ₸"));
  const pct = (x, d = 0) => dec((x * 100).toFixed(d)) + "%";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // pl(5, "метр|метра|метров", "metre|metres"); дробные числа в русском — всегда вторая форма («2,5 года»)
  // Внутри L() считаются обе ветки, поэтому формы другого языка могут быть не переданы
  const pl = (n, ru = "", en = "") => {
    if (EN) { const [one, many = one] = en.split("|"); return n === 1 ? one : many; }
    const [one, few = one, many = few] = ru.split("|");
    if (!Number.isInteger(n)) return few;
    const m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  };
  const download = (name, text) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    a.download = name;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  const today = () => new Date().toLocaleDateString(LOCALE, { day: "numeric", month: "long", year: "numeric" });
  const smooth = () => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  /* ---------- Mobile nav ---------- */
  const navBtn = $(".nav-toggle"), nav = $("#nav");
  navBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    navBtn.setAttribute("aria-expanded", open);
  });
  $$("#nav a").forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); navBtn.setAttribute("aria-expanded", "false"); }));

  /* ---------- Hero: the flat, metre by metre ---------- */
  const flat = { members: D.flatMembers.map((m) => ({ ...m })), lastBought: -1 };
  const flatGrid = $("#flat-grid");
  for (let i = 0; i < D.flatArea; i++) flatGrid.appendChild(Object.assign(document.createElement("div"), { className: "cell" }));
  const payInput = $("#flat-pay");

  function renderFlat() {
    const cells = flatGrid.children;
    let i = 0;
    flat.members.forEach((m) => { for (let k = 0; k < m.m2; k++, i++) { cells[i].style.background = m.color; } });
    for (; i < cells.length; i++) cells[i].style.background = "";
    if (flat.lastBought >= 0) {
      const c = cells[flat.lastBought];
      c.classList.remove("new"); void c.offsetWidth; c.classList.add("new");
    }
    $("#flat-legend").innerHTML = flat.members.map((m) => `<li><span class="swatch" style="background:${m.color}"></span>${esc(m.name)}<b>${m.m2} ${L("м²", "m²")}</b></li>`).join("");

    const me = flat.members[0];
    const share = me.m2 / D.flatArea;
    const rent = D.flatRent * (1 - share);
    const pay = +payInput.value;
    $("#flat-pay-out").textContent = tg(pay);
    const monthsPerM2 = D.coopPricePerM2 / pay;
    const left = D.flatArea - me.m2;
    const monthsAll = Math.ceil(left * monthsPerM2);
    const years = +(monthsAll / 12).toFixed(1);
    const when = years < 1
      ? `${monthsAll} ${L("мес.", pl(monthsAll, "", "month|months"))}`
      : `${dec(years)} ${pl(years, "год|года|лет", "year|years")}`;
    $("#flat-calc").innerHTML = left > 0
      ? L(
        `Аренда сейчас ${tg(rent)} в месяц — только за ${left} ${pl(left, "метр|метра|метров")}, которые ещё не ваши. При взносе ${tg(pay)} один метр выкупается за ${dec(monthsPerM2.toFixed(1))} мес., вся квартира станет вашей примерно через ${when}.`,
        `You now pay ${tg(rent)} a month in rent, only for the ${left} ${pl(left, "", "metre|metres")} that aren't yours yet. At ${tg(pay)} a month, one metre takes ${monthsPerM2.toFixed(1)} months to buy, and the whole flat is yours in about ${when}.`)
      : L("Квартира полностью ваша. Аренда больше не начисляется.", "The flat is fully yours. No more rent.");
    $("#flat-buy").disabled = left <= 0;
    $("#flat-buy").textContent = left > 0 ? L(`Выкупить 1 м² за ${tg(D.coopPricePerM2)}`, `Buy 1 m² for ${tg(D.coopPricePerM2)}`) : L("Квартира выкуплена", "Flat fully owned");
  }
  $("#flat-buy").addEventListener("click", () => {
    const me = flat.members[0];
    const seller = flat.members.slice(1).find((m) => m.m2 > 0);
    if (!seller) return;
    seller.m2--; me.m2++;
    flat.lastBought = me.m2 - 1;
    renderFlat();
  });
  payInput.addEventListener("input", () => { flat.lastBought = -1; renderFlat(); });
  renderFlat();

  /* ---------- 1. Co-building: map ---------- */
  const svgNS = "http://www.w3.org/2000/svg";
  const map = $("#plot-map");
  map.innerHTML = `
    <path d="M0 165 C 90 140, 160 190, 260 168 S 420 130, 520 160" fill="none" stroke="#9EC1D6" stroke-width="22" stroke-linecap="round"/>
    <path d="M0 120 H520 M0 300 H520 M200 0 V340 M340 0 V340" stroke="#C3CABF" stroke-width="7"/>
    <text x="440" y="185" font-size="12" fill="#5d7e93" font-style="italic">${L("р. Есиль", "Yesil River")}</text>`;
  D.plots.forEach((p) => {
    const g = document.createElementNS(svgNS, "g");
    g.setAttribute("class", "plot");
    g.setAttribute("tabindex", "0");
    g.setAttribute("role", "button");
    g.setAttribute("aria-label", L(`Участок «${p.title}», район ${p.district}`, `Plot “${p.title}”, ${p.district} district`));
    g.dataset.id = p.id;
    g.innerHTML = `<rect x="${p.x}" y="${p.y}" width="${p.w}" height="${p.h}" rx="3"/>
      <text x="${p.x + 10}" y="${p.y + 22}">${esc(p.title)}</text>
      <text x="${p.x + 10}" y="${p.y + 40}" style="font-weight:400;font-size:11px">${p.units} ${L("кв.", "flats")}</text>`;
    map.appendChild(g);
  });
  function selectPlot(id) {
    const p = D.plots.find((x) => x.id === id);
    $$(".plot", map).forEach((g) => g.classList.toggle("active", g.dataset.id === id));
    const flatCost = 45 * p.price, flatMarket = 45 * p.market;
    const t = esc(p.title);
    $("#plot-info").innerHTML = `
      <div class="plot-info">
        <h3>${L(`«${t}», район ${esc(p.district)}`, `“${t}”, ${esc(p.district)} district`)}</h3>
        <dl>
          <dt>${L("Проект", "Project")}</dt><dd>${esc(p.type)}</dd>
          <dt>${L("Квартир", "Flats")}</dt><dd>${p.units}</dd>
          <dt>${L("Участок", "Land")}</dt><dd>${esc(p.area)}</dd>
          <dt>${L("Заселение", "Move-in")}</dt><dd>${esc(p.ready)}</dd>
        </dl>
        <div class="compare">
          <div class="good"><strong>${tg(p.price)}</strong><span>${L("за м² в кооперативе", "per m² in the co-op")}</span></div>
          <div><strong>${tg(p.market)}</strong><span>${L("за м² на рынке", "per m² on the market")}</span></div>
        </div>
        <p>${L(`Квартира 45 м² обойдётся в <b>${mln(flatCost)}</b> вместо ${mln(flatMarket)} — экономия ${mln(flatMarket - flatCost)}.`,
               `A 45 m² flat costs <b>${mln(flatCost)}</b> instead of ${mln(flatMarket)}, saving ${mln(flatMarket - flatCost)}.`)}</p>
        <p class="small muted">${L(`В пуле ${p.members} из ${p.need} участников. Собрано ${pct(p.funded)} бюджета стройки.`,
                                   `${p.members} of ${p.need} members have joined. ${pct(p.funded)} of the construction budget is raised.`)}</p>
        <div class="progress" aria-hidden="true"><span style="width:${p.funded * 100}%"></span></div>
        <button class="btn btn-primary" id="join-pool">${L(`Вступить в пул «${t}»`, `Join the “${t}” pool`)}</button>
        <p class="small" id="join-msg" aria-live="polite"></p>
      </div>`;
    $("#join-pool").addEventListener("click", (e) => {
      p.members = Math.min(p.need, p.members + 1);
      e.target.disabled = true;
      e.target.textContent = L("Заявка отправлена", "Application sent");
      $("#join-msg").textContent = L(`Вы ${p.members}-й участник пула. Координатор пула свяжется с вами, первый взнос — от 1 м².`,
                                     `You are member #${p.members}. The pool coordinator will contact you; the first contribution starts at 1 m².`);
    });
  }
  map.addEventListener("click", (e) => { const g = e.target.closest(".plot"); if (g) selectPlot(g.dataset.id); });
  map.addEventListener("keydown", (e) => { const g = e.target.closest(".plot"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); selectPlot(g.dataset.id); } });
  selectPlot("p1");

  /* ---------- 1. Pool shares & queue ---------- */
  const RISK_RESERVE = 24000000;
  function renderPool() {
    const me = { name: L("Вы", "You"), m2: clamp(+$("#me-m2").value || 0, 0, 80), activity: clamp(+$("#me-act").value || 0, 0, 100), me: true };
    const all = [...D.pool, me];
    const total = all.reduce((s, x) => s + x.m2, 0) || 1;
    const maxM2 = Math.max(...all.map((x) => x.m2)) || 1;
    all.forEach((x) => { x.share = x.m2 / total; x.score = 0.7 * (x.m2 / maxM2) + 0.3 * (x.activity / 100); });
    const ranked = [...all].sort((a, b) => b.score - a.score);
    ranked.forEach((x, i) => (x.queue = i + 1));
    $("#pool-table tbody").innerHTML = all.map((x) => `
      <tr class="${x.me ? "me" : ""}">
        <td>${esc(x.name)}</td>
        <td class="num">${x.m2}</td>
        <td class="num">${pct(x.share, 1)}</td>
        <td class="num">${tg(RISK_RESERVE * x.share)}</td>
        <td class="num">${x.activity}</td>
        <td><span class="tag ${x.queue <= 2 ? "" : x.queue <= 4 ? "mid" : "warn"}">${L(`${x.queue}-е место`, `#${x.queue}`)}</span></td>
      </tr>`).join("");
  }
  ["#me-m2", "#me-act"].forEach((s) => $(s).addEventListener("input", renderPool));
  renderPool();

  /* ---------- 1. Suppliers ---------- */
  $("#supply-table tbody").innerHTML = D.suppliers.map((s, i) => `
    <tr>
      <td><input type="checkbox" class="sup" data-i="${i}" ${i < 3 ? "checked" : ""} aria-label="${L("Добавить в закупку", "Add to the order")}: ${esc(s.item)}"></td>
      <td>${esc(s.name)}</td><td>${esc(s.item)}</td>
      <td class="num">${tg(s.price)}</td><td class="num">${tg(s.market)}</td>
      <td><span class="tag">−${Math.round((1 - s.price / s.market) * 100)}%</span></td>
    </tr>`).join("");
  function renderSupply() {
    let pool = 0, market = 0;
    $$(".sup").forEach((c) => { if (c.checked) { const i = +c.dataset.i; pool += D.suppliers[i].price * D.supplyQty[i]; market += D.suppliers[i].market * D.supplyQty[i]; } });
    $("#supply-total").innerHTML = pool
      ? L(`Закупка на один дом: <b>${mln(pool)}</b> вместо ${mln(market)}. Пул экономит <b>${mln(market - pool)}</b> (${pct(1 - pool / market)}).`,
          `Order for one building: <b>${mln(pool)}</b> instead of ${mln(market)}. The pool saves <b>${mln(market - pool)}</b> (${pct(1 - pool / market)}).`)
      : L("Отметьте хотя бы одну позицию, чтобы посчитать экономию.", "Tick at least one item to see the savings.");
  }
  $("#supply-table").addEventListener("change", renderSupply);
  renderSupply();

  /* ---------- 2. Co-living matcher ---------- */
  const SCHED = {
    day: { day: 1, shift: 0.7, night: 0.8, remote: 0.6 },
    shift: { day: 0.7, shift: 1, night: 0.7, remote: 0.6 },
    night: { day: 0.8, shift: 0.7, night: 0.9, remote: 0.4 },
    remote: { day: 0.6, shift: 0.6, night: 0.4, remote: 0.8 }
  };
  const HABIT_NAMES = L(
    { nosmoke: "не курит", quiet: "тишина после 22:00", cook: "готовит дома", pets: "питомец", guests: "часто гости" },
    { nosmoke: "non-smoker", quiet: "quiet after 10 pm", cook: "cooks at home", pets: "has a pet", guests: "frequent guests" });
  function habitScore(a, b) {
    let s = 1;
    if (a.includes("nosmoke") !== b.includes("nosmoke")) s -= 0.45;
    if ((a.includes("quiet") && b.includes("guests")) || (b.includes("quiet") && a.includes("guests"))) s -= 0.3;
    if (a.includes("pets") !== b.includes("pets")) s -= 0.15;
    const shared = a.filter((h) => b.includes(h)).length;
    s += shared * 0.04;
    return clamp(s, 0, 1);
  }
  function matchScore(me, c) {
    const sched = SCHED[me.schedule][c.schedule];
    const hab = habitScore(me.habits, c.habits);
    const bud = 1 - Math.abs(me.budget - c.budget) / Math.max(me.budget, c.budget, 1);
    const dist = me.district === c.district ? 1 : 0.45;
    return Math.min(0.98, 0.28 * sched + 0.37 * hab + 0.2 * bud + 0.15 * dist);
  }
  let lastMatch = null;
  $("#match-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    const me = {
      name: (f.get("name") || "").trim() || L("Вы", "You"), job: f.get("job"), income: +f.get("income"), budget: +f.get("budget"),
      schedule: f.get("schedule"), district: f.get("district"), habits: f.getAll("habits")
    };
    const ranked = D.candidates.map((c) => ({ ...c, score: matchScore(me, c) })).sort((a, b) => b.score - a.score);
    const top = ranked.slice(0, 3);
    const perPerson = D.rent.four / 4;
    const saving = 1 - perPerson / D.rent.one;
    const overBudget = top.filter((c) => c.budget < perPerson).map((c) => c.name);
    const burden = me.income ? perPerson / me.income : 0;
    lastMatch = { me, top, perPerson };
    $("#match-result").innerHTML = `
      <h3>${L("Совпадения для вас", "Your matches")}</h3>
      ${top.map((c) => `
        <div class="match">
          <div class="avatar" style="background:${c.color}">${esc(c.name[0])}</div>
          <b>${esc(c.name)}, ${c.age}, ${esc(c.job)}</b>
          <span class="pct">${Math.round(c.score * 100)}%</span>
          <p>${esc(c.district)} · ${L("бюджет до", "budget up to")} ${tg(c.budget)} · ${c.habits.map((h) => HABIT_NAMES[h]).join(", ")}</p>
        </div>`).join("")}
      <div class="saving">
        <strong>${tg(perPerson)} ${L("в месяц", "a month")}</strong>
        ${L(`Ваша доля в четырёхкомнатной квартире за ${tg(D.rent.four)}. Однушка в одиночку — около ${tg(D.rent.one)}. Экономия ${pct(saving)}.`,
            `Your share of a four-room flat at ${tg(D.rent.four)}. A one-room flat alone costs about ${tg(D.rent.one)}. You save ${pct(saving)}.`)}
      </div>
      ${me.budget < perPerson ? `<p class="small"><span class="tag warn">${L("Внимание", "Note")}</span> ${L(`ваш предел ${tg(me.budget)} ниже доли. Попробуйте пятикомнатный дом или район подешевле.`, `your limit of ${tg(me.budget)} is below the share. Try a five-room house or a cheaper district.`)}</p>` : ""}
      ${overBudget.length ? `<p class="small muted">${L(`Бюджет ${esc(overBudget.join(", "))} чуть ниже доли — разницу можно покрыть из фонда взаимопомощи на первые месяцы.`, `${esc(overBudget.join(", "))} ${overBudget.length === 1 ? "has" : "have"} a budget slightly below the share; the mutual-aid fund can cover the gap for the first months.`)}</p>` : ""}
      <p class="small muted">${L(`Жильё займёт ${pct(burden)} вашего дохода${burden > 0.4 ? " — это много, посмотрите раздел «Фонд»" : ""}.`, `Housing will take ${pct(burden)} of your income${burden > 0.4 ? ", which is high: see the Fund section" : ""}.`)}</p>
      <button class="btn btn-primary" id="make-lease">${L("Сформировать договор совместной аренды", "Generate a co-living lease")}</button>`;
    $("#make-lease").addEventListener("click", makeLease);
  });
  function makeLease() {
    const { me, top, perPerson } = lastMatch;
    const names = [me.name, ...top.map((c) => c.name)];
    const text = L(
`ДОГОВОР СОВМЕСТНОЙ АРЕНДЫ ЖИЛОГО ПОМЕЩЕНИЯ
г. Астана, ${today()}

Собственник: ____________________ (далее — Арендодатель)
Соарендаторы: ${names.join(", ")} (далее — Соарендаторы)
Объект: четырёхкомнатная квартира, адрес ____________________

1. ПЛАТА
1.1. Арендная плата — ${tg(D.rent.four)} в месяц. Доля каждого Соарендатора — ${tg(perPerson)}.
1.2. Плата фиксируется на 12 месяцев. Повышение возможно не чаще одного раза в год, не более чем на 7%, с письменным уведомлением за 60 дней.
1.3. Оплата — безналичным переводом через AffordBase с электронным чеком.

2. ОТВЕТСТВЕННОСТЬ СОАРЕНДАТОРОВ
2.1. Каждый Соарендатор отвечает только за свою долю платы и ущерб, причинённый им лично.
2.2. Если Соарендатор выбывает, остальные вправе в течение 45 дней найти замену через платформу. До этого срока Арендодатель не вправе требовать с них долю выбывшего.

3. ЗАЩИТА ОТ ВЫСЕЛЕНИЯ
3.1. Арендодатель может расторгнуть договор только по основаниям, предусмотренным законом, с письменным уведомлением не менее чем за 90 дней.
3.2. При временной неплатёжеспособности Соарендатора платёж до 3 месяцев вносит фонд взаимопомощи AffordBase напрямую Арендодателю. В этот период договор не расторгается.
3.3. Арендодатель входит в квартиру только по согласованию с Соарендаторами, кроме аварийных ситуаций.

4. ЗАЛОГ
4.1. Залог — ${tg(D.rent.four)}, хранится на условном счёте платформы.
4.2. Залог возвращается в течение 10 дней после выезда. Удержание возможно только за ущерб, зафиксированный в цифровом акте состояния жилья с фото и временными метками.

5. СПОРЫ
5.1. Споры сначала решаются через цифровой арбитраж AffordBase, затем — в суде по месту нахождения квартиры.

Подписи:
Арендодатель ______________
${names.map((n) => n + " ______________").join("\n")}

Шаблон сформирован AffordBase. Перед подписанием проверьте его с юристом.`,
`CO-LIVING RESIDENTIAL LEASE AGREEMENT
Astana, ${today()}

Owner: ____________________ (the "Landlord")
Co-tenants: ${names.join(", ")} (the "Co-tenants")
Property: four-room flat at ____________________

1. RENT
1.1. Rent is ${tg(D.rent.four)} per month. Each Co-tenant's share is ${tg(perPerson)}.
1.2. Rent is fixed for 12 months. It may rise no more than once a year, by no more than 7%, with 60 days' written notice.
1.3. Payment is made by bank transfer through AffordBase with an electronic receipt.

2. CO-TENANT LIABILITY
2.1. Each Co-tenant is liable only for their own share of the rent and for damage they personally cause.
2.2. If a Co-tenant leaves, the others have 45 days to find a replacement through the platform. Until then the Landlord may not demand the departing Co-tenant's share from them.

3. PROTECTION FROM EVICTION
3.1. The Landlord may terminate the agreement only on grounds provided by law, with at least 90 days' written notice.
3.2. If a Co-tenant is temporarily unable to pay, the AffordBase mutual-aid fund pays the Landlord directly for up to 3 months. The agreement cannot be terminated during this period.
3.3. The Landlord enters the flat only by agreement with the Co-tenants, except in emergencies.

4. DEPOSIT
4.1. The deposit is ${tg(D.rent.four)}, held in the platform's escrow account.
4.2. The deposit is returned within 10 days of move-out. Deductions are allowed only for damage recorded in the digital condition report with photos and timestamps.

5. DISPUTES
5.1. Disputes go first to AffordBase digital arbitration, then to the court where the flat is located.

Signatures:
Landlord ______________
${names.map((n) => n + " ______________").join("\n")}

Template generated by AffordBase. Have it reviewed by a lawyer before signing.`);
    $("#lease-text").textContent = text;
    $("#lease-wrap").hidden = false;
    $("#lease-wrap").scrollIntoView({ behavior: smooth(), block: "start" });
  }
  $("#lease-download").addEventListener("click", () => download(L("dogovor-sovmestnoy-arendy.txt", "co-living-lease.txt"), $("#lease-text").textContent));

  /* ---------- 3. Reliability index ---------- */
  const gauge = $("#gauge-fill");
  const gLen = gauge.getTotalLength();
  gauge.style.strokeDasharray = gLen;
  const SCORE_TIPS = L({
    util: "Подключите автоплатёж за коммуналку — каждый месяц без просрочки прибавляет баллы.",
    transfers: "Привяжите кошелёк или карту, через которую получаете доход: история переводов копится автоматически.",
    stability: "Добавьте второго агрегатора или постоянного заказчика — доход станет ровнее.",
    burden: "Совместная аренда снизит долю дохода на жильё — загляните в «Соарендаторы».",
    community: "Помогите на субботнике пула или станьте наставником новичков — это тоже учитывается.",
    sources: "Отметьте все источники дохода: такси, доставку, фриланс."
  }, {
    util: "Set up autopay for utilities: every month without a late payment adds points.",
    transfers: "Link the wallet or card where your income arrives, and your transfer history builds up automatically.",
    stability: "Add a second platform or a regular client to smooth out your income.",
    burden: "Co-living lowers the share of income spent on housing. See “Co-tenants”.",
    community: "Help at a pool clean-up day or mentor newcomers. That counts too.",
    sources: "Tick every income source you have: taxi, delivery, freelance."
  });
  function renderScore() {
    const f = $("#score-form");
    const v = (n) => +$(`[name=${n}]`, f).value;
    const util = v("util"), transfers = v("transfers"), vol = v("volatility"), comm = v("community"), burden = v("burden");
    const srcs = $$("[name=src]:checked", f).length;
    $("[data-out=util]").textContent = util + "%";
    $("[data-out=transfers]").textContent = transfers;
    $("[data-out=volatility]").textContent = vol + "%";
    $("[data-out=community]").textContent = comm;
    $("[data-out=burden]").textContent = burden + "%";
    const parts = [
      { k: "util", name: L("Коммунальные платежи", "Utility payments"), got: Math.pow(util / 100, 1.5) * 200, max: 200 },
      { k: "transfers", name: L("Регулярные переводы", "Regular transfers"), got: (Math.min(transfers, 24) / 24) * 120, max: 120 },
      { k: "stability", name: L("Стабильность дохода", "Income stability"), got: (1 - vol / 80) * 140, max: 140 },
      { k: "burden", name: L("Нагрузка жильём", "Housing cost burden"), got: clamp((70 - burden) / 40, 0, 1) * 100, max: 100 },
      { k: "community", name: L("Участие в сообществе", "Community participation"), got: (Math.min(comm, 12) / 12) * 80, max: 80 },
      { k: "sources", name: L("Разные источники дохода", "Multiple income sources"), got: [0, 30, 50, 60, 60][srcs], max: 60 }
    ];
    const score = Math.round(200 + parts.reduce((s, p) => s + p.got, 0));
    $("#score-num").textContent = score;
    const t = (score - 200) / 700;
    gauge.style.strokeDashoffset = gLen * (1 - t);
    let band, color;
    if (score < 450) { band = L("Низкий. Пока нужен поручитель или двойной залог.", "Low. A guarantor or double deposit is still needed."); color = "var(--brick)"; }
    else if (score < 600) { band = L("Средний. Доступна совместная аренда через платформу.", "Fair. Co-living through the platform is available."); color = "var(--signal)"; }
    else if (score < 750) { band = L("Хороший. Собственники принимают без поручителя.", "Good. Landlords accept you without a guarantor."); color = "var(--teal)"; }
    else { band = L("Отличный. Открыт выкуп жилья и вступление в стройпул.", "Excellent. Rent-to-own and building pools are open to you."); color = "var(--teal)"; }
    gauge.style.stroke = color;
    $("#score-band").textContent = band;
    $("#score-factors").innerHTML = parts.map((p) => `<li>${p.name}<span class="bar"><span style="width:${(p.got / p.max) * 100}%"></span></span><b>${Math.round(p.got)}</b></li>`).join("");
    const tips = parts.map((p) => ({ ...p, gap: p.max - p.got })).sort((a, b) => b.gap - a.gap).slice(0, 3).filter((p) => p.gap > 8).map((p) => SCORE_TIPS[p.k]);
    $("#score-tips").innerHTML = tips.length ? tips.map((t) => `<li>${t}</li>`).join("") : `<li>${L("Всё отлично. Поддерживайте платёжную дисциплину.", "All good. Keep paying on time.")}</li>`;
  }
  $("#score-form").addEventListener("input", renderScore);
  renderScore();

  /* ---------- 4. Resilience vault ---------- */
  const MONTHS = L(["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"],
                   ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]);
  const MONTH_FORMS = ["месяц|месяца|месяцев", "month|months"];
  $("#fund-balance").textContent = mln(D.fundBalance);
  $("#fund-families").textContent = nf.format(D.fundFamilies);
  function simulate() {
    const f = $("#vault-form");
    const g = (n) => +$(`[name=${n}]`, f).value || 0;
    const rent = g("rent"), income = g("income"), spend = g("spend"), saved = g("saved");
    const shock = $("[name=shock]", f).value;
    const inc = Array(13).fill(income);
    if (shock === "job") { inc[2] = inc[3] = inc[4] = 0; inc[5] = income * 0.7; }
    if (shock === "ill") { inc[2] = income * 0.4; }
    if (shock === "delay") { inc[2] = inc[3] = 0; inc[4] = income * 3; }
    const plain = [saved], helped = [saved];
    let loanMonths = 0, loanSum = 0, firstGap = -1, worst = 0;
    for (let m = 1; m <= 12; m++) {
      const fee = inc[m] * 0.015; // 1,5% в фонд
      const flow = inc[m] - rent - spend - fee;
      plain.push(plain[m - 1] + flow);
      let h = helped[m - 1] + flow;
      if (h < 0 && loanMonths < 3) { h += rent; loanMonths++; loanSum += rent; }
      helped.push(h);
      if (plain[m] < 0 && firstGap < 0) firstGap = m;
      worst = Math.min(worst, plain[m]);
    }
    return { rent, plain, helped, loanMonths, loanSum, firstGap, worst, shock, income };
  }
  function renderVault() {
    const s = simulate();
    const svg = $("#vault-chart");
    const W = 520, H = 240, P = { l: 56, r: 12, t: 16, b: 34 };
    const all = [...s.plain, ...s.helped, 0];
    let lo = Math.min(...all), hi = Math.max(...all);
    if (hi - lo < 1) hi = lo + 1;
    const pad = (hi - lo) * 0.08; lo -= pad; hi += pad;
    const x = (i) => P.l + (i / 12) * (W - P.l - P.r);
    const y = (v) => P.t + (1 - (v - lo) / (hi - lo)) * (H - P.t - P.b);
    const line = (arr) => arr.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ");
    const now = new Date().getMonth();
    let grid = "";
    for (let k = 0; k <= 4; k++) {
      const v = lo + ((hi - lo) * k) / 4;
      grid += `<line x1="${P.l}" x2="${W - P.r}" y1="${y(v)}" y2="${y(v)}" stroke="#DADFD7"/><text x="${P.l - 8}" y="${y(v) + 4}" text-anchor="end">${Math.round(v / 1000)}${L("к", "k")}</text>`;
    }
    let labels = "";
    for (let i = 0; i <= 12; i += 2) labels += `<text x="${x(i)}" y="${H - 10}" text-anchor="middle">${MONTHS[(now + i) % 12]}</text>`;
    const negArea = s.plain.some((v) => v < 0)
      ? `<path d="${line(s.plain)} L${x(12)} ${y(0)} L${x(0)} ${y(0)} Z" fill="var(--brick)" opacity=".08"/>` : "";
    svg.innerHTML = `${grid}${labels}
      <rect x="${P.l}" y="${y(0)}" width="${W - P.l - P.r}" height="${Math.max(0, H - P.b - y(0))}" fill="var(--brick-2)" opacity=".5"/>
      <line x1="${P.l}" x2="${W - P.r}" y1="${y(0)}" y2="${y(0)}" stroke="var(--ink)" stroke-width="1.5"/>
      ${negArea}
      <path d="${line(s.plain)}" fill="none" stroke="var(--brick)" stroke-width="2.5" stroke-dasharray="6 5"/>
      <path d="${line(s.helped)}" fill="none" stroke="var(--teal)" stroke-width="3"/>`;
    const gap = $("#vault-gap");
    if (s.firstGap > 0) {
      const rest = Math.min(0, ...s.helped);
      const months = `${s.loanMonths} ${pl(s.loanMonths, ...MONTH_FORMS)}`;
      gap.className = "gap-note bad";
      gap.textContent = L(
        `Кассовый разрыв в ${MONTHS[(now + s.firstGap) % 12]}: не хватит до ${tg(-s.worst)}. Фонд может покрыть аренду за ${months} — ${tg(s.loanSum)}.` +
          (rest < 0 ? ` Фонд платит только аренду: оставшиеся ${tg(-rest)} на остальные расходы придётся сократить.` : " С помощью фонда вы проходите этот период без долгов."),
        `Cash gap in ${MONTHS[(now + s.firstGap) % 12]}: you'll be short by up to ${tg(-s.worst)}. The fund can cover ${months} of rent, ${tg(s.loanSum)}.` +
          (rest < 0 ? ` The fund pays rent only: the remaining ${tg(-rest)} has to come from cutting other spending.` : " With the fund you get through this period without debt."));
    } else {
      gap.className = "gap-note";
      gap.textContent = L(`Разрыва не видно: к концу года накопится ${tg(s.plain[12])}. Каждый месяц 1,5% ваших транзакций пополняют общий фонд.`,
                          `No gap ahead: you'll have saved ${tg(s.plain[12])} by year end. Each month 1.5% of your transactions top up the shared fund.`);
    }
    $("#vault-loan").hidden = true;
    $("#vault-sos").disabled = false;
    $("#vault-sos").textContent = L("Запросить помощь фонда", "Request help from the fund");
    return s;
  }
  $("#vault-form").addEventListener("input", renderVault);
  $("#vault-sos").addEventListener("click", () => {
    const s = simulate();
    const box = $("#vault-loan");
    box.hidden = false;
    if (!s.loanMonths) {
      box.innerHTML = L(`<b>Сейчас помощь не требуется.</b><p class="small" style="margin:6px 0 0">Если доход пропадёт, нажмите кнопку снова — заявка рассматривается автоматически, без справок из банка.</p>`,
                        `<b>No help needed right now.</b><p class="small" style="margin:6px 0 0">If your income drops, press the button again. Requests are reviewed automatically, with no bank statements.</p>`);
      return;
    }
    const monthly = s.loanSum / 12;
    const months = `${s.loanMonths} ${pl(s.loanMonths, ...MONTH_FORMS)}`;
    box.innerHTML = L(`
      <b>Заявка одобрена: беспроцентный микрозаём ${tg(s.loanSum)}</b>
      <ol class="small">
        <li>Фонд платит арендодателю напрямую ${tg(s.rent)} в месяц, ${months} подряд.</li>
        <li>Арендодатель получает уведомление: договор в этот период не расторгается.</li>
        <li>Возврат — через 2 месяца после восстановления дохода, по ${tg(monthly)} в месяц в течение года, 0%.</li>
      </ol>`, `
      <b>Approved: interest-free micro-loan of ${tg(s.loanSum)}</b>
      <ol class="small">
        <li>The fund pays your landlord ${tg(s.rent)} a month directly, for ${months} in a row.</li>
        <li>The landlord is notified that the lease cannot be terminated during this period.</li>
        <li>Repayment starts 2 months after your income recovers: ${tg(monthly)} a month for a year, at 0%.</li>
      </ol>`);
    $("#vault-sos").disabled = true;
    $("#vault-sos").textContent = L("Заявка отправлена", "Request sent");
    $("#fund-balance").textContent = mln(D.fundBalance - s.loanSum);
  });
  renderVault();

  /* ---------- 5. Legal shield ---------- */
  const SAMPLE = L(`ДОГОВОР НАЙМА ЖИЛОГО ПОМЕЩЕНИЯ
г. Астана

1. Наймодатель передаёт Нанимателю однокомнатную квартиру по адресу: ул. Кенесары, д. 40, кв. 17.
2. Плата за наём составляет 180 000 тенге в месяц и вносится до 5 числа.
3. Наймодатель вправе в одностороннем порядке повысить плату, уведомив Нанимателя за 3 дня.
4. Наниматель вносит залог 150 000 тенге. Залог не возвращается при досрочном выезде по любой причине.
5. За каждый день просрочки оплаты начисляется штраф 5% от месячной платы.
6. Наймодатель вправе входить в квартиру в любое время без предупреждения для проверки состояния.
7. Все виды ремонта, включая замену сантехники и проводки, производятся за счёт Нанимателя.
8. В случае нарушения любого пункта Наниматель обязан освободить помещение в течение 24 часов.
9. Оплата производится наличными без расписки.
10. Регистрация Нанимателя по адресу квартиры не допускается.
11. Наниматель обязан поддерживать чистоту и порядок.`,
`RESIDENTIAL LEASE AGREEMENT
Astana

1. The Landlord lets to the Tenant a one-room flat at 40 Kenesary Street, flat 17.
2. Rent is 180,000 tenge per month, payable by the 5th of each month.
3. The Landlord may unilaterally increase the rent by notifying the Tenant 3 days in advance.
4. The Tenant pays a deposit of 150,000 tenge. The deposit is not refundable on early move-out for any reason.
5. A penalty of 5% of the monthly rent is charged for each day of late payment.
6. The Landlord may enter the flat at any time without notice to inspect its condition.
7. All repairs, including replacement of plumbing and wiring, are at the Tenant's expense.
8. If any clause is breached, the Tenant must vacate the premises within 24 hours.
9. Rent is paid in cash without a receipt.
10. Registration of the Tenant at the flat's address is not permitted.
11. The Tenant must keep the flat clean and tidy.`);
  const RULE_META = [
    { k: "deposit", sev: "high", money: (dep) => dep },
    { k: "raise", sev: "high", money: (dep, rent) => rent * 0.2 * 6 },
    { k: "evict", sev: "high", money: (dep, rent) => rent * 1.5 },
    { k: "fine", sev: "high", money: (dep, rent) => rent * 0.05 * 10 },
    { k: "entry", sev: "mid", money: () => 0 },
    { k: "repair", sev: "mid", money: () => 250000 },
    { k: "cash", sev: "high", money: (dep, rent) => rent * 2 },
    { k: "reg", sev: "mid", money: () => 0 }
  ];
  const RULE_TEXT = L({
    deposit: { re: /залог[^.\n]*не возвраща\w*[^.\n]*/i, title: "Залог не возвращается",
      tip: "Залог — это гарантия от ущерба, а не плата за выезд. Требуйте вернуть его в течение 10 дней после выезда, удерживать можно только подтверждённый ущерб." },
    raise: { re: /[^.\n]*в одностороннем порядке[^.\n]*(повыс|измен)\w*[^.\n]*|[^.\n]*(повыс|измен)\w*[^.\n]*в одностороннем порядке[^.\n]*/i, title: "Повышение платы в одностороннем порядке",
      tip: "По общему правилу ГК РК договор меняют по соглашению сторон. Впишите: плата фиксирована на срок договора или растёт не чаще раза в год, с уведомлением за 60 дней." },
    evict: { re: /[^.\n]*(освободить помещение|выселить|выселен\w*)[^.\n]*(24 час|сут|без предупреждения|в течение \d+ (дн|час))\w*[^.\n]*/i, title: "Выселение за сутки",
      tip: "Выселить без суда нельзя. Срок предупреждения о расторжении — не меньше месяца, лучше 90 дней. Без этого вы рискуете остаться на улице с вещами." },
    fine: { re: /[^.\n]*штраф[^.\n]*\d[^.\n]*/i, title: "Завышенный штраф",
      tip: "5% в день — это 1825% годовых. Суд может снизить явно несоразмерную неустойку. Предложите 0,1% в день от суммы долга, а не от всей платы." },
    entry: { re: /[^.\n]*(входить|посещать)[^.\n]*(в любое время|без (предупреждения|согласия))[^.\n]*/i, title: "Доступ в квартиру без согласия",
      tip: "Пока вы снимаете квартиру, это ваше жилище. Визиты — по согласованию, кроме аварий. Пропишите это в договоре." },
    repair: { re: /[^.\n]*(все виды ремонта|любой ремонт|капитальн\w* ремонт)[^.\n]*за сч[её]т (нанимателя|арендатора)[^.\n]*/i, title: "Весь ремонт за ваш счёт",
      tip: "Капитальный ремонт и замена инженерных сетей — обязанность собственника. На вас — только текущий мелкий ремонт." },
    cash: { re: /[^.\n]*наличн\w*[^.\n]*без (расписки|чека|квитанции)[^.\n]*/i, title: "Оплата без подтверждения",
      tip: "Без расписки вы не докажете, что платили. Платите переводом с назначением платежа или берите расписку каждый месяц." },
    reg: { re: /[^.\n]*(регистрац|прописк)\w*[^.\n]*не (допуска|разреша|предоставля)\w*[^.\n]*/i, title: "Запрет временной регистрации",
      tip: "Без регистрации сложнее получить госуслуги, пособия и записать детей в школу. Обсудите временную регистрацию до подписания." }
  }, {
    deposit: { re: /[^.\n]*deposit[^.\n]*(not|non)[- ]?(be )?(refund|return)\w*[^.\n]*/i, title: "Deposit is not returned",
      tip: "A deposit secures against damage; it is not a fee for moving out. Ask for it back within 10 days of move-out, with deductions only for proven damage." },
    raise: { re: /[^.\n]*unilateral\w*[^.\n]*(increase|raise|change)\w*[^.\n]*|[^.\n]*(increase|raise|change)\w*[^.\n]*unilateral\w*[^.\n]*/i, title: "Unilateral rent increase",
      tip: "Under Kazakhstan's Civil Code, contract terms generally change only by mutual agreement. Write in that rent is fixed for the term, or rises at most once a year with 60 days' notice." },
    evict: { re: /[^.\n]*(vacate|evict\w*|leave the (premises|flat))[^.\n]*(\d+ hours?|within \d+ days?|without notice|immediately)[^.\n]*/i, title: "Eviction within a day",
      tip: "You cannot be evicted without a court. Notice of termination should be at least a month, ideally 90 days. Without it you risk ending up on the street with your belongings." },
    fine: { re: /[^.\n]*(penalty|fine|late fee)[^.\n]*\d[^.\n]*/i, title: "Excessive penalty",
      tip: "5% a day is 1,825% a year. A court can reduce a clearly disproportionate penalty. Propose 0.1% a day of the overdue amount, not of the whole rent." },
    entry: { re: /[^.\n]*(enter|visit|access)[^.\n]*(at any time|without (notice|consent|permission))[^.\n]*/i, title: "Entry without consent",
      tip: "While you rent the flat, it is your home. Visits should be agreed in advance, except emergencies. Put that in the contract." },
    repair: { re: /[^.\n]*(all (types of )?repairs|any repairs|major repairs|capital repairs)[^.\n]*(tenant|renter)'?s? (expense|cost)[^.\n]*/i, title: "All repairs at your cost",
      tip: "Major repairs and replacing building systems are the owner's duty. You are responsible only for minor day-to-day repairs." },
    cash: { re: /[^.\n]*cash[^.\n]*without (a )?(receipt|record|invoice)[^.\n]*/i, title: "Payment without proof",
      tip: "Without a receipt you can't prove you paid. Pay by bank transfer with a payment reference, or get a signed receipt every month." },
    reg: { re: /[^.\n]*registration[^.\n]*(not (permitted|allowed)|prohibited|forbidden)[^.\n]*/i, title: "No temporary registration",
      tip: "Without registration it is harder to access public services and benefits or enrol children in school. Discuss temporary registration before signing." }
  });
  const RULES = RULE_META.map((m) => ({ ...m, ...RULE_TEXT[m.k] }));
  const RENT_RE = L(/(\d[\d\s]{3,})\s*(тенге|₸|тг)\s*в месяц/i, /(\d[\d,\s]{3,})\s*(tenge|KZT|₸)\s*(per|a|\/)\s*month/i);
  const ct = $("#contract-text");
  ct.value = SAMPLE;
  function checkContract() {
    const text = ct.value;
    const dep = +$("#deposit").value || 0;
    const rentMatch = text.match(RENT_RE);
    const rent = rentMatch ? +rentMatch[1].replace(/[\s,]/g, "") : 150000;
    const hits = [];
    RULES.forEach((r) => {
      const re = new RegExp(r.re.source, "gi");
      let m;
      while ((m = re.exec(text))) {
        const s = m.index + (m[0].length - m[0].trimStart().length), e = m.index + m[0].trimEnd().length;
        if (e > s && !hits.some((h) => s < h.e && e > h.s)) hits.push({ s, e, r });
        if (!m[0].length) re.lastIndex++;
      }
    });
    hits.sort((a, b) => a.s - b.s);
    let html = "", pos = 0;
    hits.forEach((h, i) => {
      html += esc(text.slice(pos, h.s)) + `<mark class="risk" title="${esc(h.r.title)}">${esc(text.slice(h.s, h.e))}<sup>${i + 1}</sup></mark>`;
      pos = h.e;
    });
    html += esc(text.slice(pos));
    const high = hits.filter((h) => h.r.sev === "high").length;
    const money = hits.reduce((s, h) => s + h.r.money(dep, rent), 0);
    $("#legal-result").innerHTML = `
      <h3>${L("Разбор", "Review")}</h3>
      <div class="risk-sum">
        <div class="${hits.length ? "" : "ok"}"><strong>${hits.length}</strong><span>${L(`${pl(hits.length, "опасный пункт|опасных пункта|опасных пунктов")}, из них ${high} серьёзных`, `risky ${pl(hits.length, "", "clause|clauses")}, ${high} of them serious`)}</span></div>
        <div class="${money ? "" : "ok"}"><strong>${tg(money)}</strong><span>${L("можете потерять за год при худшем сценарии", "you could lose in a year in the worst case")}</span></div>
      </div>
      <div class="contract-view">${html}</div>
      ${hits.length ? `<ol class="findings">${hits.map((h) => `
        <li class="${h.r.sev === "mid" ? "mid" : ""}">
          <h4>${h.r.title}</h4><p>${h.r.tip}</p>
        </li>`).join("")}</ol>` : `<p>${L("Явно опасных пунктов не нашли. Всё равно проверьте сроки, залог и порядок расторжения.", "No clearly risky clauses found. Still check the term, the deposit and how the lease can be ended.")}</p>`}
      <p class="small muted">${L("Это автоматическая подсказка, а не юридическая консультация. В спорной ситуации обратитесь к юристу или в центр бесплатной юридической помощи.", "This is an automated hint, not legal advice. In a dispute, talk to a lawyer or a free legal aid centre.")}</p>`;
  }
  $("#contract-check").addEventListener("click", checkContract);

  // Загрузка: .txt — читаем как текст, фото — распознаём (Tesseract.js)
  let tesseractLoading = null;
  const loadTesseract = () => tesseractLoading || (tesseractLoading = new Promise((res, rej) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js";
    s.onload = () => res(window.Tesseract); s.onerror = () => { tesseractLoading = null; rej(); };
    document.head.appendChild(s);
  }));
  $("#contract-file").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const st = $("#ocr-status");
    if (file.type.startsWith("image/")) {
      try {
        st.textContent = L("Загружаем распознавание текста…", "Loading text recognition…");
        const T = await loadTesseract();
        const { data } = await T.recognize(file, L("rus", "eng"), {
          logger: (m) => { if (m.status === "recognizing text") st.textContent = L(`Распознаём фото: ${Math.round(m.progress * 100)}%`, `Reading photo: ${Math.round(m.progress * 100)}%`); }
        });
        ct.value = data.text.trim();
        st.textContent = L("Текст распознан. Проверьте его и нажмите «Проверить договор».", "Text recognised. Check it, then press “Check the lease”.");
      } catch {
        st.textContent = L("Не удалось распознать фото. Сделайте снимок при хорошем свете или вставьте текст вручную.", "Couldn't read the photo. Retake it in good light or paste the text in.");
      }
    } else {
      ct.value = await file.text();
      st.textContent = L(`Загружен файл «${file.name}».`, `Loaded “${file.name}”.`);
      checkContract();
    }
    e.target.value = "";
  });

  /* ---------- 5. Digital arbitration: condition act ---------- */
  const act = [];
  const drop = $("#act-drop");
  ["dragenter", "dragover"].forEach((t) => drop.addEventListener(t, () => drop.classList.add("over")));
  ["dragleave", "drop"].forEach((t) => drop.addEventListener(t, () => drop.classList.remove("over")));
  const fmtDT = (d) => d.toLocaleString(LOCALE, { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
  function exifDate(buf) {
    // Ищем дату съёмки EXIF вида "2026:10:14 18:22:05" в начале файла
    const head = new TextDecoder("latin1").decode(new Uint8Array(buf, 0, Math.min(buf.byteLength, 131072)));
    const m = head.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
    return m ? new Date(+m[1], +m[2] - 1, +m[3], +m[4], +m[5], +m[6]) : null;
  }
  $("#act-files").addEventListener("change", async (e) => {
    for (const file of e.target.files) {
      const buf = await file.arrayBuffer();
      const hashBuf = await crypto.subtle.digest("SHA-256", buf);
      const hash = [...new Uint8Array(hashBuf)].map((b) => b.toString(16).padStart(2, "0")).join("");
      const exif = file.type === "image/jpeg" ? exifDate(buf) : null;
      act.push({
        name: file.name, size: file.size, type: file.type,
        shot: exif || new Date(file.lastModified), shotSrc: exif ? "EXIF" : L("дата файла", "file date"),
        fixed: new Date(), hash, stage: $("#act-stage").value,
        url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null
      });
    }
    e.target.value = "";
    renderAct();
  });
  function renderAct() {
    $("#act-table").hidden = !act.length;
    $("#act-download").hidden = !act.length;
    $("#act-table tbody").innerHTML = act.map((a) => `
      <tr>
        <td>${a.url ? `<img class="thumb" src="${a.url}" alt="">` : ""}${esc(a.name)}<br><span class="small muted">${esc(a.stage)}</span></td>
        <td>${fmtDT(a.shot)}<br><span class="small muted">${a.shotSrc}</span></td>
        <td>${fmtDT(a.fixed)}</td>
        <td class="hash">${a.hash}</td>
      </tr>`).join("");
  }
  $("#act-download").addEventListener("click", () => {
    const body = act.map((a, i) => L(
`${i + 1}. ${a.name} (${Math.round(a.size / 1024)} КБ, ${a.type || "файл"})
   Этап: ${a.stage}
   Снято: ${fmtDT(a.shot)} (${a.shotSrc})
   Зафиксировано на платформе: ${fmtDT(a.fixed)}
   SHA-256: ${a.hash}`,
`${i + 1}. ${a.name} (${Math.round(a.size / 1024)} KB, ${a.type || "file"})
   Stage: ${a.stage}
   Taken: ${fmtDT(a.shot)} (${a.shotSrc})
   Recorded on the platform: ${fmtDT(a.fixed)}
   SHA-256: ${a.hash}`)).join("\n\n");
    download(L("akt-sostoyaniya-zhilya.txt", "property-condition-report.txt"), L(
`АКТ СОСТОЯНИЯ ЖИЛОГО ПОМЕЩЕНИЯ
Сформирован AffordBase ${fmtDT(new Date())}

${body}

Чтобы проверить подлинность файла, посчитайте его SHA-256 и сравните с отпечатком выше.
Совпадение означает, что файл не изменялся после фиксации.

Наниматель ______________     Наймодатель ______________`,
`PROPERTY CONDITION REPORT
Generated by AffordBase ${fmtDT(new Date())}

${body}

To verify a file, compute its SHA-256 and compare it with the fingerprint above.
A match means the file has not changed since it was recorded.

Tenant ______________     Landlord ______________`));
  });

  /* ---------- 6. Partners ---------- */
  const tabs = [$("#tab-inv"), $("#tab-city")];
  const panes = [$("#pane-inv"), $("#pane-city")];
  function selectTab(i) {
    tabs.forEach((t, k) => { t.setAttribute("aria-selected", k === i); t.tabIndex = k === i ? 0 : -1; panes[k].hidden = k !== i; });
    tabs[i].focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(i));
    t.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowLeft") selectTab(1 - i); });
  });
  const maxFam = Math.max(...D.regions.map((r) => r.families));
  $("#region-table tbody").innerHTML = D.regions.map((r) => `
    <tr>
      <td>${esc(r.name)}</td>
      <td><div class="minibar"><span class="bar"><span style="width:${(r.collect - 85) / 15 * 100}%"></span></span>${r.collect}%</div></td>
      <td class="num">${r.index}</td>
      <td><div class="minibar"><span class="bar"><span style="width:${(r.families / maxFam) * 100}%"></span></span>${r.families}</div></td>
    </tr>`).join("");
  $("#invest-pool").innerHTML = D.plots.map((p) => `<option value="${p.id}">${L(`«${esc(p.title)}», ${esc(p.district)} — собрано ${pct(p.funded)}`, `“${esc(p.title)}”, ${esc(p.district)}, ${pct(p.funded)} raised`)}</option>`).join("");
  function renderInvest() {
    const f = $("#invest-form");
    const amount = +$("[name=amount]", f).value || 0;
    const years = +$("[name=years]", f).value;
    const rate = +$("[name=rate]", f).value / 100;
    const p = D.plots.find((x) => x.id === $("#invest-pool").value);
    $("[data-out=years]", f).textContent = years;
    $("[data-out=rate]", f).textContent = pct(rate, 1);
    const total = amount * Math.pow(1 + rate, years);
    const families = Math.floor(amount / (45 * p.price));
    $("#invest-out").innerHTML = `
      <div><strong>${mln(total - amount)}</strong><span>${L(`доход за ${years} ${pl(years, "год|года|лет")}`, `return over ${years} ${pl(years, "", "year|years")}`)}</span></div>
      <div><strong>${mln(total)}</strong><span>${L("вернётся к концу срока", "paid back by the end of the term")}</span></div>
      <div><strong>${families}</strong><span>${L(pl(families, "семья получит|семьи получат|семей получат"), pl(families, "", "family gets|families get"))} ${L("квартиру 45 м²", "a 45 m² flat")}</span></div>
      <div><strong>${pct(Math.min(1, p.funded + amount / (p.units * 45 * p.price)))}</strong><span>${L(`собрано на «${esc(p.title)}» с вашим вкладом`, `of “${esc(p.title)}” funded with your investment`)}</span></div>`;
  }
  $("#invest-form").addEventListener("input", renderInvest);
  renderInvest();

  function renderLands() {
    $("#land-table tbody").innerHTML = D.lands.map((l) => `
      <tr><td>${esc(l.where)}</td><td>${esc(l.kind)}</td><td class="num">${dec(l.area)} ${L("га", "ha")}</td><td>${esc(l.use)}</td>
      <td>${l.zerotax ? '<span class="tag">0%</span>' : `<span class="tag mid">${L("обычный", "standard")}</span>`}</td></tr>`).join("");
  }
  $("#land-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const f = new FormData(e.target);
    D.lands.unshift({ where: f.get("where").trim(), kind: f.get("kind"), area: +f.get("area"), use: f.get("use"), zerotax: !!f.get("zerotax") });
    renderLands();
    $("#land-msg").textContent = L("Объект размещён. Кооперативы увидят его на карте участков.", "Listed. Co-ops will now see it on the plot map.");
    e.target.reset();
  });
  renderLands();

  /* ---------- 7. Green utility ---------- */
  const NORM = { el: 70, water: 4.5, gas: 22 }; // на человека в месяц, ориентир
  function renderGreen() {
    const f = $("#green-form");
    const g = (n) => +$(`[name=${n}]`, f).value || 0;
    const people = Math.max(1, g("people"));
    const use = [
      { k: "el", name: L("Электричество", "Electricity"), unit: L("кВт·ч", "kWh"), v: g("el"), t: g("tel") },
      { k: "water", name: L("Вода", "Water"), unit: L("м³", "m³"), v: g("water"), t: g("twater") },
      { k: "gas", name: L("Газ", "Gas"), unit: L("м³", "m³"), v: g("gas"), t: g("tgas") }
    ];
    let bill = 0, over = 0;
    use.forEach((u) => { u.norm = +(NORM[u.k] * people).toFixed(1); u.cost = u.v * u.t; bill += u.cost; u.over = Math.max(0, u.v - u.norm); over += u.over * u.t; });
    const save = over + bill * 0.08;
    $("#green-bill").innerHTML = `
      <div><strong>${tg(bill)}</strong><span>${L("счёт за месяц", "monthly bill")}</span></div>
      <div><strong>${tg(save)}</strong><span>${L("можно сэкономить в месяц", "possible savings a month")}</span></div>
      <div><strong>${tg(save * 12)}</strong><span>${L("за год", "a year")}</span></div>`;
    $("#green-usage").innerHTML = use.map((u) => {
      const scale = Math.max(u.v, u.norm) * 1.2 || 1;
      return `<div class="usage-row">
        <div class="lbl"><span>${u.name}</span><span>${L(`${dec(u.v)} из ${dec(u.norm)} ${u.unit} нормы`, `${u.v} of ${u.norm} ${u.unit} norm`)}</span></div>
        <div class="usage-track"><span class="${u.v > u.norm ? "over" : ""}" style="width:${(u.v / scale) * 100}%"></span><i style="left:${(u.norm / scale) * 100}%" title="${L("норма", "norm")}"></i></div>
      </div>`;
    }).join("");
    const tips = [];
    const [el, w, gs] = use;
    if (el.v > el.norm) tips.push(L(`Электричество на ${Math.round((el.v / el.norm - 1) * 100)}% выше нормы. Проверьте старый холодильник и бойлер: они часто съедают треть счёта. Ночной тариф для стирки сэкономит ещё 10–15%.`,
                                    `Electricity is ${Math.round((el.v / el.norm - 1) * 100)}% above the norm. Check an old fridge or water heater: they often eat a third of the bill. Running laundry on the night tariff saves another 10–15%.`));
    if (w.v > w.norm) tips.push(L(`Вода выше нормы на ${dec((w.v - w.norm).toFixed(1))} м³. Аэраторы на краны стоят около 1 500 ₸ и снижают расход примерно на треть.`,
                                  `Water is ${(w.v - w.norm).toFixed(1)} m³ above the norm. Tap aerators cost about 1,500 ₸ and cut use by roughly a third.`));
    if (gs.v > gs.norm) tips.push(L("Газа уходит больше нормы. Утепление окон и регулировка котла дают до 20% экономии зимой.", "Gas use is above the norm. Sealing windows and tuning the boiler save up to 20% in winter."));
    tips.push(L("Переведите освещение на LED — минус 80% на свет.", "Switch to LED lighting: 80% less spent on light."));
    if (el.v <= el.norm && w.v <= w.norm && gs.v <= gs.norm) tips.unshift(L("Вы укладываетесь в норму по всем ресурсам. Отличный результат.", "You're within the norm on every resource. Well done."));
    $("#green-tips").innerHTML = tips.map((t) => `<li>${t}</li>`).join("");
  }
  $("#green-form").addEventListener("input", renderGreen);
  renderGreen();

  $("#grant-opts").innerHTML = D.grants.map((g, i) => `
    <label class="grant-opt"><input type="checkbox" value="${g.id}" ${i < 2 ? "checked" : ""}>
      <div><b>${esc(g.title)}</b><span>${esc(g.note)} · ${mln(g.cost)}, ${L("грант до", "grant up to")} ${pct(g.cover)}</span></div>
    </label>`).join("");
  function grantCalc() {
    const sel = $$("#grant-opts input:checked").map((c) => D.grants.find((g) => g.id === c.value));
    const cost = sel.reduce((s, g) => s + g.cost, 0);
    const grant = sel.reduce((s, g) => s + g.cost * g.cover, 0);
    const save = Math.min(0.4, sel.reduce((s, g) => s + g.save, 0));
    return { sel, cost, grant, save };
  }
  function renderGrant() {
    const c = grantCalc();
    $("#grant-out").innerHTML = `
      <div><strong>${mln(c.cost)}</strong><span>${L("стоимость работ", "cost of works")}</span></div>
      <div><strong>${mln(c.grant)}</strong><span>${L("покроет грант", "covered by the grant")}</span></div>
      <div><strong>${mln(c.cost - c.grant)}</strong><span>${L("доля кооператива", "co-op's share")}</span></div>
      <div><strong>−${pct(c.save)}</strong><span>${L("расходы на эксплуатацию", "running costs")}</span></div>`;
    $("#grant-make").disabled = !c.sel.length;
  }
  $("#grant-opts").addEventListener("change", renderGrant);
  $("#grant-make").addEventListener("click", () => {
    const c = grantCalc();
    const items = c.sel.map((g, i) => L(
      `${i + 1}. ${g.title} (${g.note}) — ${tg(g.cost)}, запрашиваемое софинансирование ${pct(g.cover)} = ${tg(g.cost * g.cover)}`,
      `${i + 1}. ${g.title} (${g.note}): ${tg(g.cost)}, co-financing requested ${pct(g.cover)} = ${tg(g.cost * g.cover)}`)).join("\n");
    $("#grant-doc").textContent = L(
`ЗАЯВКА НА ГРАНТ ПО ПРОГРАММЕ ЭНЕРГОСБЕРЕЖЕНИЯ
Дата: ${today()}

Заявитель: жилищный кооператив «Береке», пул № 12, AffordBase
Объект: модульный жилой дом, 60 квартир, г. Астана, р-н Нура

Запрашиваемые мероприятия:
${items}

Общая стоимость работ: ${tg(c.cost)}
Запрашиваемая сумма гранта: ${tg(c.grant)}
Собственные средства кооператива: ${tg(c.cost - c.grant)}

Ожидаемый эффект: снижение расходов на эксплуатацию дома на ${pct(c.save)}.
Обоснование: показания потребления жильцов собраны через AffordBase за 12 месяцев и прилагаются.

Председатель кооператива ______________`,
`ENERGY EFFICIENCY GRANT APPLICATION
Date: ${today()}

Applicant: “Bereke” housing co-operative, pool No. 12, AffordBase
Property: modular residential building, 60 flats, Nura district, Astana

Measures requested:
${items}

Total cost of works: ${tg(c.cost)}
Grant amount requested: ${tg(c.grant)}
Co-op's own contribution: ${tg(c.cost - c.grant)}

Expected effect: building running costs reduced by ${pct(c.save)}.
Evidence: residents' consumption readings collected through AffordBase over 12 months are attached.

Co-op chair ______________`);
    $("#grant-doc-wrap").hidden = false;
    $("#grant-make").textContent = L("Заявка сформирована", "Application ready");
    setTimeout(() => ($("#grant-make").textContent = L("Сформировать заявку", "Generate application")), 2500);
  });
  $("#grant-download").addEventListener("click", () => download(L("zayavka-na-zelenyy-grant.txt", "green-grant-application.txt"), $("#grant-doc").textContent));
  renderGrant();
})();
