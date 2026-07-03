const api = 'https://api.open-meteo.com/v1/forecast?latitude=35.6785&longitude=139.6823&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia%2FTokyo';

function getData() {
  fetch(api)
    .then(response => response.json())
    .then(data => makePage(data));
}

function updateClock() {
  setData('time', dateFormat(new Date(), 1));
}

setInterval(updateClock, 1000);
setInterval(getData, 1000 * 60 * 60);
getData();

function makePage(data) {
  setData('day0', dateFormat(data.daily.time[0]));
  setData('day1', dateFormat(data.daily.time[1]));
  setData('weathercode0', getWMO(data.daily.weathercode[0]));
  setData('weathercode1', getWMO(data.daily.weathercode[1]));
  setData('temperature_2m_max0', data.daily.temperature_2m_max[0] + '℃');
  setData('temperature_2m_max1', data.daily.temperature_2m_max[1] + '℃');
  setData('temperature_2m_min0', data.daily.temperature_2m_min[0] + '℃');
  setData('temperature_2m_min1', data.daily.temperature_2m_min[1] + '℃');
  setData('precipitation_sum0', data.daily.precipitation_sum[0] + 'mm');
  setData('precipitation_sum1', data.daily.precipitation_sum[1] + 'mm');

  if (data.daily.precipitation_sum[0] > 0) {
    document.getElementById('body').style.backgroundColor = '#cff';
  } else {
    document.getElementById('body').style.backgroundColor = '#ffc';
  }
}

function setData(id, data) {
  document.getElementById(id).innerHTML = data;
}

function dateFormat(date, mode) {
  let d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = addZero(d.getHours());
  const minute = addZero(d.getMinutes());
  const second = addZero(d.getSeconds());
  if (mode == 1) return `${year}年${month}月${day}日 ${hour}:${minute}:${second}`;
  return month + '月' + day + '日';
}

function addZero(n) { return n < 10 ? '0' + n : n; }

function getWMO(w) {
  if (w == 0) return '☀️';
  if (w == 1) return '🌤';
  if (w == 2) return '⛅️';
  if (w == 3) return '☁️';
  if (w == 45 || w == 48) return '霧';
  if (w >= 51 && w <= 57) return '霧雨';
  if (w >= 61 && w <= 67) return '☔️';
  if (w >= 71 && w <= 77) return '❄️';
  if (w >= 80 && w <= 82) return '☔️';
  if (w >= 95) return '⚡️☔️';
  return w;
}

// 保存する
localStorage.setItem('city', '東京');

// 読み込む
const city = localStorage.getItem('city');
console.log(city); // "東京"

// 削除する
localStorage.removeItem('city');

// すべて削除する
localStorage.clear();

// 地点データの配列をlocalStorageに保存する
const locations = [
  { name: '東京', lat: 35.6785, lng: 139.6823 },
  { name: '大阪', lat: 34.6937, lng: 135.5023 }
];

// 配列→文字列に変換して保存
localStorage.setItem('locations', JSON.stringify(locations));

// 文字列→配列に変換して読み込む
const saved = JSON.parse(localStorage.getItem('locations'));
console.log(saved[0].name); // "東京"

// デフォルトの地点リスト（初回起動時）
const defaultLocations = [
  { name: '東京', lat: 35.6785, lng: 139.6823 }
];

// 現在選んでいる地点のインデックス
let currentIndex = 0;

// localStorage から地点リストを読み込む（なければデフォルトを使う）
function loadLocations() {
  const saved = localStorage.getItem('locations');
  return saved ? JSON.parse(saved) : defaultLocations;
}

// localStorage に地点リストを保存する
function saveLocations(locations) {
  localStorage.setItem('locations', JSON.stringify(locations));
}

// 地点を切り替えて天気を取得
function switchLocation(index) {
  currentIndex = index;
  const locations = loadLocations();
  const loc = locations[index];

  const url = 'https://api.open-meteo.com/v1/forecast'
    + '?latitude=' + loc.lat
    + '&longitude=' + loc.lng
    + '&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum'
    + '&timezone=Asia%2FTokyo';

  document.querySelector('h1').textContent = loc.name + 'の天気';

  fetch(url)
    .then(response => response.json())
    .then(data => makePage(data));
}

// 新しい地点を追加する
function addLocation(name, lat, lng) {
  const locations = loadLocations();
  locations.push({ name: name, lat: lat, lng: lng });
  saveLocations(locations);
  renderLocationList(); // 一覧を再描画
}

// 地点を削除する
function removeLocation(index) {
  const locations = loadLocations();
  locations.splice(index, 1); // index番目を1件削除
  saveLocations(locations);
  renderLocationList();
  if (locations.length > 0) {
    switchLocation(0);
  }
}

// 地点リストをHTMLに描画する
function renderLocationList() {
  const locations = loadLocations();
  const list = document.getElementById('location-list');
  list.innerHTML = '';

  locations.forEach(function(loc, i) {
    const li = document.createElement('li');
    li.innerHTML = '<button onclick="switchLocation(' + i + ')">'
      + loc.name + '</button>'
      + ' <button onclick="removeLocation(' + i + ')">削除</button>';
    list.appendChild(li);
  });
}