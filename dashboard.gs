// 予約管理ダッシュボード用 Google Apps Script
// 既存のcode.gsとは独立したファイルです

// スプレッドシートID（実際のIDに置き換えてください）
// このスクリプトを使用する際は、スプレッドシートと紐付ける必要があります
var SHEET_NAME = "予約管理";

/**
 * HTTPリクエストを処理するメイン関数
 * @param {Object} e - リクエストパラメータ
 * @return {TextOutput} JSON形式のレスポンス
 */
function doGet(e) {
  try {
    var action = e.parameter.action || "getSummary";
    
    if (action === "getSummary") {
      return getSummaryData();
    } else if (action === "getDetailedStats") {
      return getDetailedStats();
    } else {
      return createJsonResponse({ status: "error", message: "Invalid action parameter" });
    }
  } catch (error) {
    return createJsonResponse({ 
      status: "error", 
      message: "サーバーエラーが発生しました: " + error.toString() 
    });
  }
}

/**
 * 予約サマリーデータを取得
 * @return {TextOutput} JSON形式のサマリーデータ
 */
function getSummaryData() {
  var sheet = getSheet();
  if (!sheet) {
    return createJsonResponse({ 
      status: "error", 
      message: "予約管理シートが見つかりません" 
    });
  }
  
  var data = sheet.getDataRange().getDisplayValues();
  var headers = data[0]; // ヘッダー行
  var reservations = data.slice(1); // データ行
  
  // 日付・時間・コース別の集計オブジェクト
  var summary = {};
  var dates = ["2026-02-07", "2026-02-14"];
  var times = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  var courses = ["mystery", "ws"];
  
  // 初期化
  dates.forEach(function(date) {
    summary[date] = {};
    times.forEach(function(time) {
      summary[date][time] = {
        mystery: { count: 0, capacity: 6, children: [] },
        ws: { count: 0, capacity: 3, children: [] }
      };
    });
  });
  
  // データを集計
  reservations.forEach(function(row) {
    if (!row[0] || !row[1]) return; // 空行をスキップ
    
    var dateStr = normalizeDateStr(row[0]); // 列A: 日付
    var timeStr = normalizeTimeStr(row[1]); // 列B: 時間
    var childrenInfo = row[2] || ""; // 列C: お子様情報
    var course = row[7] || "mystery"; // 列H: コース
    var attendeeCount = parseInt(row[5]) || 0; // 列F: 参加人数
    
    if (summary[dateStr] && summary[dateStr][timeStr]) {
      summary[dateStr][timeStr][course].count++;
      summary[dateStr][timeStr][course].children.push({
        info: childrenInfo,
        attendees: attendeeCount
      });
    }
  });
  
  // 残り枠を計算
  dates.forEach(function(date) {
    times.forEach(function(time) {
      courses.forEach(function(course) {
        var slot = summary[date][time][course];
        slot.remaining = slot.capacity - slot.count;
        slot.percentage = Math.round((slot.count / slot.capacity) * 100);
      });
    });
  });
  
  return createJsonResponse({
    status: "success",
    data: summary,
    lastUpdated: new Date().toISOString()
  });
}

/**
 * 詳細統計データを取得
 * @return {TextOutput} JSON形式の詳細統計データ
 */
function getDetailedStats() {
  var sheet = getSheet();
  if (!sheet) {
    return createJsonResponse({ 
      status: "error", 
      message: "予約管理シートが見つかりません" 
    });
  }
  
  var data = sheet.getDataRange().getDisplayValues();
  var reservations = data.slice(1);
  
  var stats = {
    totalReservations: 0,
    totalMystery: 0,
    totalWS: 0,
    totalChildren: 0,
    totalAttendees: 0,
    byDate: {}
  };
  
  reservations.forEach(function(row) {
    if (!row[0] || !row[1]) return;
    
    var dateStr = normalizeDateStr(row[0]);
    var course = row[7] || "mystery";
    var childrenInfo = row[2] || "";
    var attendeeCount = parseInt(row[5]) || 0;
    
    stats.totalReservations++;
    stats.totalAttendees += attendeeCount;
    
    if (course === "mystery") {
      stats.totalMystery++;
    } else if (course === "ws") {
      stats.totalWS++;
    }
    
    // 子供の数を計算（"名前1 / 名前2"形式）
    if (childrenInfo) {
      var childCount = childrenInfo.split(" / ").length;
      stats.totalChildren += childCount;
    }
    
    // 日付別集計
    if (!stats.byDate[dateStr]) {
      stats.byDate[dateStr] = {
        reservations: 0,
        mystery: 0,
        ws: 0,
        attendees: 0
      };
    }
    stats.byDate[dateStr].reservations++;
    stats.byDate[dateStr].attendees += attendeeCount;
    if (course === "mystery") {
      stats.byDate[dateStr].mystery++;
    } else if (course === "ws") {
      stats.byDate[dateStr].ws++;
    }
  });
  
  return createJsonResponse({
    status: "success",
    data: stats,
    lastUpdated: new Date().toISOString()
  });
}

/**
 * シートを取得
 * @return {Sheet} スプレッドシートのシートオブジェクト
 */
function getSheet() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    return sheet;
  } catch (e) {
    Logger.log("Error getting sheet: " + e.toString());
    return null;
  }
}

/**
 * 日付文字列を正規化（yyyy-MM-dd形式に変換）
 * @param {string} dateVal - 日付文字列
 * @return {string} 正規化された日付文字列
 */
function normalizeDateStr(dateVal) {
  if (!dateVal) return "";
  var d = new Date(dateVal);
  if (isNaN(d.getTime())) return "";
  return Utilities.formatDate(d, "Asia/Tokyo", "yyyy-MM-dd");
}

/**
 * 時間文字列を正規化（HH:mm形式に変換）
 * @param {string} timeVal - 時間文字列
 * @return {string} 正規化された時間文字列
 */
function normalizeTimeStr(timeVal) {
  if (!timeVal) return "";
  var s = String(timeVal).trim();
  
  // HH:mm:ss形式の場合
  if (s.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
    return s.substring(0, 5);
  }
  
  // HH:mm形式の場合（ゼロパディングを追加）
  if (s.match(/^\d{1,2}:\d{2}$/)) {
    var parts = s.split(':');
    var h = ('0' + parts[0]).slice(-2);
    var m = ('0' + parts[1]).slice(-2);
    return h + ":" + m;
  }
  
  return s;
}

/**
 * JSON形式のレスポンスを作成
 * @param {Object} data - レスポンスデータ
 * @return {TextOutput} JSON形式のテキスト出力
 */
function createJsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * キャッシュをクリアする関数（トリガーで毎日実行可能）
 */
function clearCache() {
  var cache = CacheService.getScriptCache();
  cache.removeAll(['summaryData', 'detailedStats']);
  Logger.log("Cache cleared at: " + new Date());
}

/**
 * デイリートリガーを設定する関数
 * 注意: この関数は手動で一度だけ実行してください
 */
function setupDailyTrigger() {
  // 既存のトリガーを削除
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'clearCache') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // 毎日午前0時にキャッシュクリアを実行
  ScriptApp.newTrigger('clearCache')
    .timeBased()
    .atHour(0)
    .everyDays(1)
    .create();
  
  Logger.log("Daily trigger set up successfully");
}

// ============================================
// Slack通知機能
// ============================================

/**
 * Slack Webhook URL
 * Slackのワークスペースで Incoming Webhooks を設定し、URLをここに貼り付けてください
 * 設定方法: https://api.slack.com/messaging/webhooks
 */
var SLACK_WEBHOOK_URL = 'YOUR_SLACK_WEBHOOK_URL_HERE';

/**
 * 予約サマリーをSlackに送信
 * 毎日夜10時に実行されるトリガーから呼び出されます
 */
function sendDailySummaryToSlack() {
  try {
    // Webhook URLが設定されているか確認
    if (SLACK_WEBHOOK_URL === 'YOUR_SLACK_WEBHOOK_URL_HERE') {
      Logger.log("Slack Webhook URLが設定されていません");
      return;
    }
    
    var sheet = getSheet();
    if (!sheet) {
      Logger.log("予約管理シートが見つかりません");
      return;
    }
    
    var data = sheet.getDataRange().getDisplayValues();
    var reservations = data.slice(1);
    
    // 日付別の集計
    var dates = ["2026-02-07", "2026-02-14"];
    var times = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
    var dateStats = {};
    
    // 初期化
    dates.forEach(function(date) {
      dateStats[date] = {
        mystery: 0,
        ws: 0,
        totalAttendees: 0,
        byTime: {}
      };
      times.forEach(function(time) {
        dateStats[date].byTime[time] = {
          mystery: 0,
          ws: 0
        };
      });
    });
    
    // 集計
    reservations.forEach(function(row) {
      if (!row[0] || !row[1]) return;
      
      var dateStr = normalizeDateStr(row[0]);
      var timeStr = normalizeTimeStr(row[1]);
      var course = row[7] || "mystery";
      var attendeeCount = parseInt(row[5]) || 0;
      
      if (dateStats[dateStr]) {
        dateStats[dateStr].totalAttendees += attendeeCount;
        
        if (course === "mystery") {
          dateStats[dateStr].mystery++;
          if (dateStats[dateStr].byTime[timeStr]) {
            dateStats[dateStr].byTime[timeStr].mystery++;
          }
        } else if (course === "ws") {
          dateStats[dateStr].ws++;
          if (dateStats[dateStr].byTime[timeStr]) {
            dateStats[dateStr].byTime[timeStr].ws++;
          }
        }
      }
    });
    
    // Slackメッセージを作成
    var message = buildSlackMessage(dateStats);
    
    // Slackに送信
    var options = {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify(message),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(SLACK_WEBHOOK_URL, options);
    Logger.log("Slack notification sent successfully: " + response.getContentText());
    
  } catch (error) {
    Logger.log("Error sending Slack notification: " + error.toString());
  }
}

/**
 * Slackメッセージを構築
 * @param {Object} dateStats - 日付別統計データ
 * @return {Object} Slackメッセージオブジェクト
 */
function buildSlackMessage(dateStats) {
  var now = new Date();
  var dateStr = Utilities.formatDate(now, "Asia/Tokyo", "yyyy年MM月dd日 HH:mm");
  
  var blocks = [
    {
      "type": "header",
      "text": {
        "type": "plain_text",
        "text": "📊 予約状況サマリー",
        "emoji": true
      }
    },
    {
      "type": "context",
      "elements": [
        {
          "type": "mrkdwn",
          "text": "更新日時: " + dateStr
        }
      ]
    },
    {
      "type": "divider"
    }
  ];
  
  // 各日付の情報を追加
  var dates = ["2026-02-07", "2026-02-14"];
  dates.forEach(function(date) {
    var stats = dateStats[date];
    var dateJP = formatDateJP(date);
    
    // 日付ヘッダー
    blocks.push({
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "*" + dateJP + "*"
      }
    });
    
    // サマリー
    var totalReservations = stats.mystery + stats.ws;
    var mysteryRemaining = (6 * 7) - stats.mystery; // 6組 × 7時間
    var wsRemaining = (3 * 7) - stats.ws;           // 3組 × 7時間
    
    blocks.push({
      "type": "section",
      "fields": [
        {
          "type": "mrkdwn",
          "text": "*総予約数:* " + totalReservations + "組"
        },
        {
          "type": "mrkdwn",
          "text": "*総参加者:* " + stats.totalAttendees + "名"
        },
        {
          "type": "mrkdwn", 
          "text": "*🔍 謎解き:* " + stats.mystery + "組（残り" + mysteryRemaining + "枠）"
        },
        {
          "type": "mrkdwn",
          "text": "*🎨 WS:* " + stats.ws + "組（残り" + wsRemaining + "枠）"
        }
      ]
    });
    
    // 時間帯別（予約がある時間帯のみ）
    var timeDetails = [];
    var times = ["10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
    times.forEach(function(time) {
      var mysteryCount = stats.byTime[time].mystery;
      var wsCount = stats.byTime[time].ws;
      
      if (mysteryCount > 0 || wsCount > 0) {
        var detail = "• `" + time + "` ";
        if (mysteryCount > 0) {
          detail += "謎:" + mysteryCount + "/" + 6;
          if (mysteryCount >= 6) detail += " 🔴満席";
        }
        if (wsCount > 0) {
          if (mysteryCount > 0) detail += " / ";
          detail += "WS:" + wsCount + "/" + 3;
          if (wsCount >= 3) detail += " 🔴満席";
        }
        timeDetails.push(detail);
      }
    });
    
    if (timeDetails.length > 0) {
      blocks.push({
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "*時間帯別予約:*\n" + timeDetails.join("\n")
        }
      });
    }
    
    blocks.push({
      "type": "divider"
    });
  });
  
  // フッター
  blocks.push({
    "type": "context",
    "elements": [
      {
        "type": "mrkdwn",
        "text": "🤖 自動送信 | 廃材ロボからの挑戦状！予約管理システム"
      }
    ]
  });
  
  return {
    "text": "📊 予約状況サマリー - " + dateStr,
    "blocks": blocks
  };
}

/**
 * 日付を日本語形式にフォーマット
 * @param {string} dateStr - yyyy-MM-dd形式の日付文字列
 * @return {string} フォーマットされた日付文字列
 */
function formatDateJP(dateStr) {
  if (!dateStr) return "";
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  var days = ['日', '月', '火', '水', '木', '金', '土'];
  return Utilities.formatDate(d, "Asia/Tokyo", "MM月dd日") + "(" + days[d.getDay()] + ")";
}

/**
 * Slack通知のトリガーを設定
 * 毎日夜10時に実行されるトリガーを作成します
 * 注意: この関数は手動で一度だけ実行してください
 */
function setupSlackNotificationTrigger() {
  // 既存のトリガーを削除
  var triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === 'sendDailySummaryToSlack') {
      ScriptApp.deleteTrigger(trigger);
    }
  });
  
  // 毎日夜10時（22時）にSlack通知を実行
  ScriptApp.newTrigger('sendDailySummaryToSlack')
    .timeBased()
    .atHour(22)
    .everyDays(1)
    .create();
  
  Logger.log("Slack notification trigger set up successfully (daily at 22:00)");
}

/**
 * 手動でSlack通知をテスト送信
 * トリガー設定前に正しく動作するかテストするための関数
 */
function testSlackNotification() {
  Logger.log("Testing Slack notification...");
  sendDailySummaryToSlack();
  Logger.log("Test completed. Check your Slack channel.");
}

