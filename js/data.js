/* Демонстрационные данные AffordBase. В рабочей версии приходят с бэкенда.
   Районы в кандидатах совпадают со значениями селекта «Район» в разметке. */
window.AB_DATA = {
  // Rent-to-own: метры, которые ещё не ваши, принадлежат инвестору и фонду кооператива.
  // Вы платите аренду только за них и постепенно выкупаете.
  flatMembers: [
    { id: "me", name: "Ваши метры", color: "#F0BE2C", m2: 12 },
    { id: "investor", name: "Социальный инвестор", color: "#5B8DB8", m2: 26 },
    { id: "coop", name: "Фонд кооператива", color: "#1E7564", m2: 16 }
  ],
  flatArea: 54,
  flatRent: 230000,
  coopPricePerM2: 385000,
  marketPricePerM2: 610000,

  plots: [
    { id: "p1", x: 60, y: 40, w: 110, h: 70, title: "Береке", district: "Нура", type: "Модульный дом, 5 этажей", units: 60, area: "0,9 га", price: 385000, market: 610000, members: 41, need: 60, funded: 0.58, ready: "IV кв. 2027" },
    { id: "p2", x: 220, y: 30, w: 90, h: 60, title: "Шаңырақ", district: "Есиль", type: "3D-печать, таунхаусы", units: 24, area: "1,4 га", price: 342000, market: 680000, members: 19, need: 24, funded: 0.71, ready: "II кв. 2027" },
    { id: "p3", x: 360, y: 60, w: 120, h: 80, title: "Жастар", district: "Сарыарка", type: "Реконструкция здания под соцаренду", units: 88, area: "0,6 га", price: 298000, market: 520000, members: 52, need: 88, funded: 0.34, ready: "I кв. 2028" },
    { id: "p4", x: 90, y: 200, w: 130, h: 80, title: "Достық", district: "Алматы", type: "Модульный дом, 9 этажей", units: 126, area: "1,1 га", price: 401000, market: 590000, members: 77, need: 126, funded: 0.46, ready: "III кв. 2028" },
    { id: "p5", x: 300, y: 210, w: 100, h: 70, title: "Самал", district: "Байконур", type: "3D-печать, малоэтажные дома", units: 36, area: "2,0 га", price: 330000, market: 560000, members: 12, need: 36, funded: 0.21, ready: "IV кв. 2028" }
  ],

  pool: [
    { name: "Айгерим", m2: 14, activity: 80 },
    { name: "Семья Садыковых", m2: 12, activity: 64 },
    { name: "Тимур", m2: 9, activity: 92 },
    { name: "Мадина", m2: 7, activity: 30 },
    { name: "Ержан", m2: 4, activity: 70 }
  ],

  suppliers: [
    { name: "PrintHaus KZ", item: "3D-печать стен, за м² стены", price: 18500, market: 26000 },
    { name: "Модуль-Строй", item: "Жилой модуль 18 м² под ключ", price: 4950000, market: 6700000 },
    { name: "ЭкоБлок Караганда", item: "Газоблок, за м³", price: 23500, market: 31000 },
    { name: "Теплый Дом", item: "Минвата, утепление фасада, за м²", price: 3900, market: 5300 },
    { name: "SunQazaq", item: "Солнечная панель 450 Вт", price: 61000, market: 84000 },
    { name: "Окна Степи", item: "Энергосберегающее окно 1,2×1,4 м", price: 64000, market: 89000 }
  ],
  // Объёмы закупки для одного дома пула
  supplyQty: [1400, 12, 220, 1800, 40, 120],

  candidates: [
    { name: "Мадина", age: 27, job: "медсестра", schedule: "shift", district: "Алматы", budget: 105000, habits: ["nosmoke", "quiet", "cook"], color: "#8A5A86" },
    { name: "Жанар", age: 31, job: "бухгалтер на аутсорсе", schedule: "remote", district: "Алматы", budget: 120000, habits: ["nosmoke", "quiet"], color: "#5B8DB8" },
    { name: "Олжас", age: 24, job: "курьер", schedule: "day", district: "Сарыарка", budget: 90000, habits: ["guests", "cook"], color: "#1E7564" },
    { name: "Динара", age: 29, job: "фармацевт", schedule: "shift", district: "Есиль", budget: 115000, habits: ["nosmoke", "quiet", "cook", "pets"], color: "#B4452C" },
    { name: "Акмарал", age: 26, job: "воспитатель", schedule: "day", district: "Алматы", budget: 100000, habits: ["nosmoke", "quiet", "cook"], color: "#C2862B" },
    { name: "Руслан", age: 33, job: "таксист", schedule: "night", district: "Байконур", budget: 95000, habits: ["nosmoke"], color: "#4E625C" },
    { name: "Гульнур", age: 35, job: "швея, самозанятая", schedule: "remote", district: "Нура", budget: 85000, habits: ["quiet", "cook", "pets"], color: "#6B7FA8" },
    { name: "Сауле", age: 23, job: "студентка-фрилансер", schedule: "remote", district: "Алматы", budget: 80000, habits: ["nosmoke", "cook", "guests"], color: "#2F8F7A" }
  ],
  // Ориентиры аренды, ₸/мес
  rent: { one: 210000, two: 290000, three: 340000, four: 410000 },

  regions: [
    { name: "Астана", collect: 97, index: 712, families: 486 },
    { name: "Алматы", collect: 95, index: 688, families: 402 },
    { name: "Шымкент", collect: 93, index: 654, families: 211 },
    { name: "Караганда", collect: 96, index: 701, families: 138 },
    { name: "Актобе", collect: 94, index: 667, families: 97 },
    { name: "Павлодар", collect: 98, index: 724, families: 80 }
  ],

  lands: [
    { where: "Астана, р-н Нура", kind: "свободная земля", area: 3.4, use: "модульное строительство", zerotax: true },
    { where: "Караганда, Майкудук", kind: "заброшенное здание", area: 0.7, use: "реконструкция под общежитие", zerotax: true },
    { where: "Шымкент, Каратау", kind: "недострой", area: 1.1, use: "социальное арендное жильё", zerotax: false }
  ],

  grants: [
    { id: "solar", title: "Солнечные панели на крыше", note: "40 панелей по 450 Вт", cost: 3900000, cover: 0.5, save: 0.22 },
    { id: "insul", title: "Утепление фасада", note: "1 800 м² минваты", cost: 8600000, cover: 0.6, save: 0.18 },
    { id: "windows", title: "Энергосберегающие окна", note: "120 окон", cost: 7700000, cover: 0.4, save: 0.08 },
    { id: "meters", title: "Умные счётчики", note: "по 3 на квартиру, 60 квартир", cost: 2700000, cover: 0.7, save: 0.05 },
    { id: "led", title: "LED-освещение подъездов", note: "5 подъездов", cost: 650000, cover: 0.5, save: 0.03 }
  ],

  // Демо-показатели фонда взаимопомощи
  fundBalance: 48200000,
  fundFamilies: 1214
};

/* Английская версия: тексты поверх тех же чисел. Индексы совпадают с массивами выше. */
(() => {
  if (document.documentElement.lang !== "en") return;
  const D = window.AB_DATA;
  const EN = {
    flatMembers: [{ name: "Your metres" }, { name: "Social investor" }, { name: "Co-op fund" }],
    plots: [
      { title: "Bereke", district: "Nura", type: "Modular building, 5 floors", area: "0.9 ha", ready: "Q4 2027" },
      { title: "Shanyrak", district: "Yesil", type: "3D-printed townhouses", area: "1.4 ha", ready: "Q2 2027" },
      { title: "Zhastar", district: "Saryarka", type: "Building retrofit for social rent", area: "0.6 ha", ready: "Q1 2028" },
      { title: "Dostyk", district: "Almaty", type: "Modular building, 9 floors", area: "1.1 ha", ready: "Q3 2028" },
      { title: "Samal", district: "Baikonur", type: "3D-printed low-rise homes", area: "2.0 ha", ready: "Q4 2028" }
    ],
    pool: [{ name: "Aigerim" }, { name: "Sadykov family" }, { name: "Timur" }, { name: "Madina" }, { name: "Yerzhan" }],
    suppliers: [
      { name: "PrintHaus KZ", item: "3D-printed walls, per m² of wall" },
      { name: "Modul-Stroy", item: "18 m² turnkey living module" },
      { name: "EcoBlock Karaganda", item: "Aerated concrete block, per m³" },
      { name: "Warm Home", item: "Mineral wool facade insulation, per m²" },
      { name: "SunQazaq", item: "450 W solar panel" },
      { name: "Steppe Windows", item: "Energy-efficient window 1.2×1.4 m" }
    ],
    candidates: [
      { name: "Madina", job: "nurse", district: "Almaty" },
      { name: "Zhanar", job: "freelance accountant", district: "Almaty" },
      { name: "Olzhas", job: "courier", district: "Saryarka" },
      { name: "Dinara", job: "pharmacist", district: "Yesil" },
      { name: "Akmaral", job: "kindergarten teacher", district: "Almaty" },
      { name: "Ruslan", job: "taxi driver", district: "Baikonur" },
      { name: "Gulnur", job: "self-employed seamstress", district: "Nura" },
      { name: "Saule", job: "student and freelancer", district: "Almaty" }
    ],
    regions: [{ name: "Astana" }, { name: "Almaty" }, { name: "Shymkent" }, { name: "Karaganda" }, { name: "Aktobe" }, { name: "Pavlodar" }],
    lands: [
      { where: "Astana, Nura district", kind: "vacant land", use: "modular construction" },
      { where: "Karaganda, Maikuduk", kind: "abandoned building", use: "retrofit into a dormitory" },
      { where: "Shymkent, Karatau", kind: "unfinished building", use: "social rental housing" }
    ],
    grants: [
      { title: "Rooftop solar panels", note: "40 panels × 450 W" },
      { title: "Facade insulation", note: "1,800 m² of mineral wool" },
      { title: "Energy-efficient windows", note: "120 windows" },
      { title: "Smart meters", note: "3 per flat, 60 flats" },
      { title: "LED lighting in stairwells", note: "5 entrances" }
    ]
  };
  Object.keys(EN).forEach((k) => EN[k].forEach((patch, i) => Object.assign(D[k][i], patch)));
})();
