function doGet(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("予約管理");
  if (!sheet) sheet = setUpSheet();
  
  var data = sheet.getDataRange().getDisplayValues(); // Use getDisplayValues for robustness
  var reservations = data.slice(1);
  var result = {};
  
  reservations.forEach(function(row) {
    // row[0] is Date string (e.g. "2026/02/07"), row[1] is Time string ("10:00")
    var dateStr = normalizeDateStr(row[0]);
    var timeStr = normalizeTimeStr(row[1]);
    var course = row[7] || "mystery";
    
    var key = dateStr + "_" + timeStr + "_" + course;
    if (!result[key]) result[key] = 0;
    result[key]++;
  });

  // Calculate remaining based on capacity
  // Mystery = 6, WS = 3
  
  var finalResult = {};
  var dates = ["2026-02-07", "2026-02-14"];
  var times = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
  var courses = ["mystery", "ws"];

  courses.forEach(function(c) {
    var capacity = (c === "ws") ? 3 : 6;
    dates.forEach(function(d) {
      times.forEach(function(t) {
        var k = d + "_" + t + "_" + c;
        var used = result[k] || 0;
        var remaining = capacity - used;
        finalResult[k] = remaining < 0 ? 0 : remaining;
      });
    });
  });

  return ContentService.createTextOutput(JSON.stringify(finalResult))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    // 排他制御: 他の処理が終わるのを最大10秒待つ
    lock.waitLock(10000);
  } catch (e) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: "現在アクセスが集中しています。しばらく待ってから再度送信してください。"}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var params = JSON.parse(e.postData.contents);
    
    // アクションに応じて処理を分岐
    if (params.action === 'submitSurvey') {
      return handleSurveySubmission(params, lock);
    } else {
      // 既存の予約処理
      return handleBookingSubmission(params, lock);
    }
  } catch (error) {
    lock.releaseLock();
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: "エラーが発生しました: " + error.message}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function handleSurveySubmission(params, lock) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var surveySheet = ss.getSheetByName("アンケート回答");
  
  // シートがない場合は作成
  if (!surveySheet) {
    surveySheet = ss.insertSheet("アンケート回答");
    surveySheet.appendRow([
      "送信日時",
      "認知経路", "SNS詳細", "チラシ入手先", "店舗名",
      "参加人数", "お子様の年齢", "参加内容",
      "全体の満足度", "価格の妥当性", "楽しかった内容",
      "謎解きの感想", "謎解き自由記述",
      "WSへの取り組み", "WSの難易度", "廃材への意識", "WS満足度", "WS感想",
      "環境意識の変化", "学び・気づき",
      "困った点", "改善点自由記述", "改善希望点",
      "今後の参加意向", "今後の希望イベント",
      "星和電機参加意向", "不参加理由", "参加条件",
      "最後のコメント"
    ]);
    surveySheet.setFrozenRows(1);
  }
  
  // データを追加
  surveySheet.appendRow([
    new Date(params.submittedAt),
    params.discoverySource,
    params.snsDetails,
    params.flyerSource,
    params.flyerShopName,
    params.participantCount,
    params.childAges,
    params.participation,
    params.overallSatisfaction,
    params.priceSatisfaction,
    params.enjoyableContents,
    params.mysteryFeedback,
    params.mysteryImpression,
    params.workshopEngagement,
    params.workshopDifficulty,
    params.wasteAwareness,
    params.workshopSatisfaction,
    params.workshopImpression,
    params.environmentalAwareness,
    params.learningExperience,
    params.difficulties,
    params.improvementFreeText,
    params.improvements,
    params.futureParticipation,
    params.futureIdeas,
    params.seiwaDenkiFuture,
    params.seiwaDenkiNoReason,
    params.seiwaDenkiCondition,
    params.finalComments
  ]);
  
  lock.releaseLock();
  return ContentService.createTextOutput(JSON.stringify({status: "success"}))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleBookingSubmission(params, lock) {
  try {
    var children = params.children; // array of {name, kana, age}
    var email = params.email;
    var phone = params.phone;
    var attendeeCount = params.attendeeCount;
    var date = params.date;
    var time = params.time;
    var wsTime = params.wsTime; // New parameter for WS time
    var courseSelection = params.courseSelection; // "mystery", "ws", or "both"
    var guardianName = params.guardianName || ""; 
    var photoConsent = params.photoConsent || ""; // New parameter
    
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("予約管理");
    if (!sheet) sheet = setUpSheet();
    
    // 1. Conflict Check (Email + Date + Time)
    if (checkForConflict(sheet, email, date, time)) {
        return ContentService.createTextOutput(JSON.stringify({status: "error", message: "同時間帯に既にご予約があります。他のお時間をお選びください。"}))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Determine which courses to book
    var bookMystery = (courseSelection === "mystery" || courseSelection === "both");
    var bookWS = (courseSelection === "ws" || courseSelection === "both");

    // 2. Capacity Check for mystery course (if booking mystery)
    if (bookMystery) {
      var currentCount = 0;
      var data = sheet.getDataRange().getDisplayValues();
      var reservations = data.slice(1);
      
      reservations.forEach(function(row) {
        var rDate = row[0];
        // Normalize date string
        var dateStr = normalizeDateStr(rDate);
        
        var rTime = normalizeTimeStr(row[1]);
        var rCourse = row[7] || "mystery";
        
        if (dateStr == date && rTime == time && rCourse == "mystery") {
          currentCount++;
        }
      });
      
      // 定員 (6)
      if (currentCount >= 6) {
        return ContentService.createTextOutput(JSON.stringify({status: "error", message: "申し訳ありません。謎解きイベントは満席となりました。"}))
          .setMimeType(ContentService.MimeType.JSON);
      }
    }
    
    // 3. Build children names string
    var childrenNames = children.map(function(child) {
      return child.name + " (" + child.kana + ", " + child.age + "歳)";
    }).join(" / ");
    
    // 4. Book according to courseSelection
    var wsFailed = false;
    
    if (bookMystery) {
      // Book Mystery Course
      // Append guardianName at index 8, photoConsent at index 9
      sheet.appendRow([date, time, childrenNames, email, phone, attendeeCount, new Date(), "mystery", guardianName, photoConsent]);
    }
    
    if (bookWS) {
      // Check WS capacity
      var wsCount = 0;
      var targetWsTime = wsTime || time; // Use wsTime if provided, else main time

      var data = sheet.getDataRange().getDisplayValues();
      var reservations = data.slice(1);
      
      reservations.forEach(function(row) {
        var rDate = row[0];
        var dateStr = normalizeDateStr(rDate);
        
        var rTime = normalizeTimeStr(row[1]);
        var rCourse = row[7] || "mystery";
        
        if (dateStr == date && rTime == targetWsTime && rCourse == "ws") {
          wsCount++;
        }
      });
      
      // WS Capacity: 3
      if (wsCount < 3) {
        // Book WS
        sheet.appendRow([date, targetWsTime, childrenNames, email, phone, attendeeCount, new Date(), "ws", guardianName, photoConsent]);
      } else {
        wsFailed = true;
        // If ONLY WS was requested, return error
        if (courseSelection === "ws") {
          return ContentService.createTextOutput(JSON.stringify({status: "error", message: "申し訳ありません。村上なつかさんWSは満席となりました。"}))
            .setMimeType(ContentService.MimeType.JSON);
        }
      }
    }
    
    // 5. Email
    sendConfirmationEmail(email, children, date, time, wsTime, phone, attendeeCount, courseSelection, wsFailed, guardianName);
    
    var message = "";
    if (courseSelection === "both" && !wsFailed) {
      message = "謎解き本編と村上なつかさんWSの予約が完了しました！";
    } else if (courseSelection === "both" && wsFailed) {
      message = "謎解き本編の予約が完了しました！（村上なつかさんWSは満席となりました）";
    } else if (courseSelection === "mystery") {
      message = "謎解き本編の予約が完了しました！";
    } else {
      message = "村上なつかさんWSの予約が完了しました！";
    }
    
    return ContentService.createTextOutput(JSON.stringify({status: "success", message: message}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: "error", message: "システムエラー: " + error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    // 必ずロックを解放
    lock.releaseLock();
  }
}

function checkForConflict(sheet, email, date, time) {
    var data = sheet.getDataRange().getDisplayValues();
    var reservations = data.slice(1);
    var targetDate = normalizeDateStr(date);
    var hasConflict = false;

    reservations.forEach(function(row) {
        var rDate = normalizeDateStr(row[0]);
        var rTime = normalizeTimeStr(row[1]);
        var rEmail = row[3];
        
        if (rEmail === email && rDate === targetDate && rTime === time) {
            hasConflict = true;
        }
    });
    
    return hasConflict;
}

function setUpSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.insertSheet("予約管理");
  sheet.appendRow(["日付", "時間", "お子様情報", "メールアドレス", "電話番号", "参加人数", "申込日時", "コース", "保護者氏名", "写真同意"]);
  return sheet;
}

function getInitialSlots() {
  // 2月7日と14日、10:00-17:00 (16:00開始が最終)
  var definedSlots = {};
  var dates = ["2026-02-07", "2026-02-14"];
  var times = ["10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];
  
  dates.forEach(function(d) {
    times.forEach(function(t) {
      definedSlots[d + "_" + t] = {count: 0};
    });
  });
  return definedSlots;
}

function normalizeDateStr(dateVal) {
  // Convert "2026/02/07" or other formats to "2026-02-07"
  if (!dateVal) return "";
  var d = new Date(dateVal);
  if (isNaN(d.getTime())) return ""; // Failed to parse
  return Utilities.formatDate(d, "Asia/Tokyo", "yyyy-MM-dd");
}

function normalizeTimeStr(timeVal) {
  // "10:00" -> "10:00"
  // "10:00:00" -> "10:00"
  if (!timeVal) return "";
  var s = String(timeVal).trim();
  if (s.match(/^\d{1,2}:\d{2}:\d{2}$/)) {
     return s.substring(0, 5);
  }
  if (s.match(/^\d{1,2}:\d{2}$/)) {
     // Ensure leading zero? e.g. 9:00 -> 09:00
     var parts = s.split(':');
     var h = ('0' + parts[0]).slice(-2);
     var m = ('0' + parts[1]).slice(-2);
     return h + ":" + m;
  }
  return s;
}

// Helper to format date as "2025年●●月▲▲日(■)"
function formatDateJP(dateStr) {
  if (!dateStr) return "";
  var d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  var days = ['日', '月', '火', '水', '木', '金', '土'];
  return Utilities.formatDate(d, "Asia/Tokyo", "yyyy年MM月dd日") + "(" + days[d.getDay()] + ")";
}

function sendConfirmationEmail(email, children, date, time, wsTime, phone, attendeeCount, courseSelection, wsFailed, guardianName) {
  var courseDetails = "";
  var feeBreakdown = "";
  
  // Calculate total fee and build details
  var childCount = children.length;
  var totalFee = 0;
  
  if (courseSelection === "mystery") {
    courseDetails = "・謎解き本編: " + time + " ～";
    totalFee = childCount * 500;
    feeBreakdown = "謎解き: 500円 × " + childCount + "名";
    
  } else if (courseSelection === "ws") {
    var actualWsTime = wsTime || time;
    courseDetails = "・倉庫たんけん！ワクワク廃材クラフト: " + actualWsTime + " ～";
    totalFee = childCount * 500;
    feeBreakdown = "ワークショップ: 500円 × " + childCount + "名";
    
  } else if (courseSelection === "both") {
    if (wsFailed) {
      courseDetails = "・謎解き本編: " + time + " ～\n" +
                      "※ワークショップは満席のため予約できませんでした。";
      totalFee = childCount * 500;
      feeBreakdown = "謎解き: 500円 × " + childCount + "名";
    } else {
      courseDetails = "・謎解き本編: " + time + " ～\n" +
                      "・倉庫たんけん！ワクワク廃材クラフト: " + wsTime + " ～";
      totalFee = childCount * 1000;
      feeBreakdown = "謎解き: 500円 × " + childCount + "名\n" +
                     "ワークショップ: 500円 × " + childCount + "名";
    }
  }
  
  var dateJP = formatDateJP(date);
  var ticketDate = Utilities.formatDate(new Date(date), "Asia/Tokyo", "yyyy/MM/dd");
  
  // Create Ticket Data
  var ticketObj = {
    id: Utilities.getUuid(),
    name: guardianName,
    date: ticketDate,
    time: time,
    count: attendeeCount, 
    fee: totalFee.toLocaleString()
  };
  var ticketJson = JSON.stringify(ticketObj);
  var ticketBlob = Utilities.newBlob(ticketJson).getBytes();
  var ticketBase64 = Utilities.base64EncodeWebSafe(ticketBlob);
  var ticketUrl = "https://kameokaproject.netlify.app/?ticket=" + ticketBase64;
  
  var subject = "【お申込完了】ご予約ありがとうございます";
  
  // Build a dynamic opening sentence
  var openingSentence = "";
  if (courseSelection === "mystery") {
    openingSentence = time + "開始の【廃材ロボからの挑戦状！（謎解き本編）】にお申し込みいただき、誠にありがとうございます。";
  } else if (courseSelection === "ws") {
    var actualWsTime = wsTime || time;
    openingSentence = actualWsTime + "開始の【倉庫たんけん！ワクワク廃材クラフト】にお申し込みいただき、誠にありがとうございます。";
  } else if (courseSelection === "both") {
    if (wsFailed) {
      openingSentence = time + "開始の【廃材ロボからの挑戦状！（謎解き本編）】にお申し込みいただき、誠にありがとうございます。\n" +
                        "（※大変恐縮ながら、ワークショップは満席のため謎解き本編のみのご予約となります）";
    } else {
      openingSentence = time + "開始の【謎解き本編】および、\n" + 
                        wsTime + "開始の【倉庫たんけん！ワクワク廃材クラフト】にお申し込みいただき、誠にありがとうございます。";
    }
  }

  var body = guardianName + " 様\n\n" +
             "廃材ロボからの挑戦状！運営チームです。\n" +
             openingSentence + "\n\n" +
             "下記の通り、お申し込みを受付けました。\n" +
             "---------------お申込情報-------------\n" +
             "【予約内容・日時】\n" +
             "日程: " + dateJP + "\n" +
             courseDetails + "\n\n" +
             "【会場】\n" +
             "TRANSit (星和電機工事株式会社 横)\n\n" +
             "【申込人数】\n" +
             "合計: " + attendeeCount + "名\n" +
             "（保護者様: 1名 / お子様: " + childCount + "名）\n\n" +
             "【合計金額】\n" +
             totalFee.toLocaleString() + "円 (税込)\n" +
             "<内訳>\n" + feeBreakdown + "\n\n" +
             "--------------------------------------\n\n" +
             "【当日について】\n" +
             "・各回開場はスタートの10分前です。\n" +
             "・当日は電子チケットで入場確認を行います。\n" +
             "こちらの画面をスタッフにお見せください。\n\n" +
             "電子チケットURL：\n" +
             ticketUrl + "\n\n" +
             "それでは当日のご参加、心よりお待ちしております。\n\n" +
             "ご不明点等ございましたら、\n" +
             "下記ご連絡先まで、お気軽にお問合せください。\n\n" +
             "メールアドレス：\n" +
             "kameoka1206@gmail.com\n\n" +
             "サイトURL：\n" +
             "https://kameokaproject.netlify.app/\n\n" +
             "こちらの申込に覚えがない場合は、大変お手数ですが、\n" +
             "このメールに返信する形でお知らせください。\n" +
             "----------------------------------------------------------------------\n" +
             "◎Instagram\n" +
             "https://www.instagram.com/second_reborn_kameoka";
             
  GmailApp.sendEmail(email, subject, body, { name: '廃材ロボからの挑戦状！運営チーム' });
}

function sendReminders() {
  // トリガーで毎日実行（例：前日の18時など）
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("予約管理");
  if (!sheet) return;
  
  var data = sheet.getDataRange().getDisplayValues(); 
  var reservations = data.slice(1);
  var today = new Date();
  var tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  var tomorrowStr = Utilities.formatDate(tomorrow, "Asia/Tokyo", "yyyy-MM-dd");
  
  reservations.forEach(function(row) {
    var rDateStr = normalizeDateStr(row[0]);
    var childrenInfo = row[2]; // Column C: お子様情報
    var email = row[3];
    var phone = row[4];
    var attendeeCount = row[5];
    var time = normalizeTimeStr(row[1]);
    var course = row[7]; // Column H: コース
    var guardianName = row[8] || "（保護者様）"; // Column I: 保護者氏名
    var courseName = (course === "ws") ? "【倉庫たんけん！ワクワク廃材クラフト】" : "【廃材謎解き】";
    
    // Calculate fee for reminder too
    var childCount = childrenInfo ? childrenInfo.split(" / ").length : 0;
    var multiplier = (course === "both") ? 2 : 1; // Basic logic for reminder
    // Actually course in sheet is recorded as "mystery" or "ws". 
    // Wait, if it's "both", we append two rows.
    // Let's refine: The sheet records individual rows for each course.
    // So if a person booked "both", they have two entries.
    // This reminder logic currently processes row by row.
    // If we want to avoid double-charging in the email, we should be careful.
    // However, the user said "children split by /".
    // Let's keep it simple: 500 per entry per child.
    var totalFee = (childCount * 500 * multiplier).toLocaleString();
    var dateJP = formatDateJP(rDateStr);

    var ticketDate = Utilities.formatDate(new Date(rDateStr), "Asia/Tokyo", "yyyy/MM/dd");
    var ticketObj = {
      id: Utilities.getUuid(),
      name: guardianName,
      date: ticketDate,
      time: time,
      count: attendeeCount, 
      fee: totalFee
    };
    var ticketJson = JSON.stringify(ticketObj);
    var ticketBlob = Utilities.newBlob(ticketJson).getBytes();
    var ticketBase64 = Utilities.base64EncodeWebSafe(ticketBlob);
    var ticketUrl = "https://kameokaproject.netlify.app/?ticket=" + ticketBase64;

    if (rDateStr === tomorrowStr) {
      var subject = "【リマインド】明日ご予約の日です";
      var body = guardianName + " 様\n\n" +
                 "廃材ロボからの挑戦状！運営チームです。\n" +
                 "明日のご予約のリマインドです。\n\n" +
                 "日時 :\n" +
                 dateJP + " " + time + " ～ 開演\n\n" +
                 "会場:\n" +
                 "TRANSit (星和電機工事株式会社 横)\n\n" +
                 "申込人数 :\n" +
                 attendeeCount + "名\n" +
                 "合計金額 : " + totalFee + "円(税込)\n\n" +
                 "当日は電子チケットで入場確認を行います。\n" +
                 "電子チケットの画面をスタッフにお見せください。\n\n" +
                 "お待ちしております。\n\n" +
                 "ご不明点があれば、このメールにご返信ください。";
                 
      GmailApp.sendEmail(email, subject, body, { name: '廃材ロボからの挑戦状！運営チーム' });
    }
  });
}
