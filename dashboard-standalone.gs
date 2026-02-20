// ============================================
// GAS完結型 予約管理ダッシュボード
// ============================================
// スプレッドシートURL: https://docs.google.com/spreadsheets/d/1qoP7HiN5tgkV8ONKknkhcK7Q3oCyahzobE2LaR2MYTk/edit
// このファイル1つだけで完結します。Reactは不要です。

var SPREADSHEET_ID = "1qoP7HiN5tgkV8ONKknkhcK7Q3oCyahzobE2LaR2MYTk";
var SHEET_NAME = "予約管理";

/**
 * ウェブアプリのメイン関数
 * ブラウザでアクセスしたときにHTMLページを表示
 */
function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Dashboard');
  
  // データを取得してテンプレートに渡す
  var data = getDashboardData();
  template.data = JSON.stringify(data);
  
  return template.evaluate()
    .setTitle('予約管理ダッシュボード')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * ダッシュボード用のデータを取得
 */
function getDashboardData() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    return { error: "予約管理シートが見つかりません" };
  }
  
  var data = sheet.getDataRange().getDisplayValues();
  var reservations = data.slice(1); // ヘッダーを除く
  
  // 日付・時間・コース別の集計
  var dates = ["2026-02-07", "2026-02-14"];
  var times = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  var summary = {};
  
  // 初期化
  dates.forEach(function(date) {
    summary[date] = {};
    times.forEach(function(time) {
      summary[date][time] = {
        mystery: { count: 0, capacity: 6 },
        ws: { count: 0, capacity: 3 }
      };
    });
  });
  
  // 統計データ
  var stats = {
    totalReservations: 0,
    totalMystery: 0,
    totalWS: 0,
    totalAttendees: 0
  };
  
  // データを集計
  reservations.forEach(function(row) {
    if (!row[0] || !row[1]) return;
    
    var dateStr = normalizeDateStr(row[0]);
    var timeStr = normalizeTimeStr(row[1]);
    var course = row[7] || "mystery";
    var attendeeCount = parseInt(row[5]) || 0;
    
    stats.totalReservations++;
    stats.totalAttendees += attendeeCount;
    
    if (course === "mystery") {
      stats.totalMystery++;
    } else if (course === "ws") {
      stats.totalWS++;
    }
    
    if (summary[dateStr] && summary[dateStr][timeStr]) {
      summary[dateStr][timeStr][course].count++;
    }
  });
  
  // 残り枠と割合を計算
  dates.forEach(function(date) {
    times.forEach(function(time) {
      ['mystery', 'ws'].forEach(function(course) {
        var slot = summary[date][time][course];
        slot.remaining = slot.capacity - slot.count;
        slot.percentage = Math.round((slot.count / slot.capacity) * 100);
      });
    });
  });
  
  return {
    summary: summary,
    stats: stats,
    lastUpdated: new Date().toLocaleString('ja-JP')
  };
}

/**
 * 日付を正規化
 */
function normalizeDateStr(dateVal) {
  if (!dateVal) return "";
  var d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  return Utilities.formatDate(d, "Asia/Tokyo", "yyyy-MM-dd");
}

/**
 * 時間を正規化
 */
function normalizeTimeStr(timeVal) {
  if (!timeVal) return "";
  var s = String(timeVal).trim();
  
  if (s.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
    return s.substring(0, 5);
  }
  
  if (s.match(/^\d{1,2}:\d{2}$/)) {
    var parts = s.split(':');
    var h = ('0' + parts[0]).slice(-2);
    var m = ('0' + parts[1]).slice(-2);
    return h + ":" + m;
  }
  
  return s;
}

/**
 * APIエンドポイント（JSON形式でデータを返す）
 */
function getDataAsJson() {
  var data = getDashboardData();
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
