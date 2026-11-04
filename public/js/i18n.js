const translations = {
  en: {
    title: "GamePulse - Game Server Monitor",
    refresh: "Refresh",
    online: "Online",
    totalPlayers: "Total Players",
    totalServers: "Total Servers",
    uptime: "Uptime",
    servers: "Servers",
    live: "Live",
    searchPlaceholder: "Search servers by name or game...",
    all: "All",
    offline: "Offline",
    status: "Status",
    players: "Players",
    map: "Map",
    uptimePercent: "Uptime",
    ping: "Ping",
    noServers: "No servers configured",
    noServersDesc: "Add servers to config/servers.json and refresh",
    noResults: "No servers found",
    noResultsDesc: "Try adjusting your filters or search",
    madeWith: "Made with",
    forCommunity: "for the game server community"
  },
  ru: {
    title: "GamePulse - Мониторинг игровых серверов",
    refresh: "Обновить",
    online: "Онлайн",
    totalPlayers: "Всего игроков",
    totalServers: "Всего серверов",
    uptime: "Аптайм",
    servers: "Серверы",
    live: "В прямом эфире",
    searchPlaceholder: "Поиск по названию или игре...",
    all: "Все",
    offline: "Оффлайн",
    status: "Статус",
    players: "Игроки",
    map: "Карта",
    uptimePercent: "Аптайм",
    ping: "Пинг",
    noServers: "Серверы не настроены",
    noServersDesc: "Добавьте серверы в config/servers.json и обновите",
    noResults: "Серверы не найдены",
    noResultsDesc: "Попробуйте изменить фильтры или поиск",
    madeWith: "Сделано с",
    forCommunity: "для сообщества игровых серверов"
  }
};

let currentLang = localStorage.getItem('lang') || (navigator.language.startsWith('ru') ? 'ru' : 'en');

function t(key) {
  return translations[currentLang][key] || translations.en[key] || key;
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('lang', lang);
  applyTranslations();
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    el.placeholder = t(key);
  });
  document.title = t('title');
}

export { t, setLanguage, applyTranslations, currentLang };
