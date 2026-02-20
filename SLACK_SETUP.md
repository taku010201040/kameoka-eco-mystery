# Slack通知セットアップガイド

毎日夜10時に予約サマリーをSlackに自動送信する機能のセットアップ手順です。

---

## 📋 前提条件

- Slackワークスペースの管理者権限
- Google Apps Scriptプロジェクト（`dashboard.gs`がデプロイ済み）

---

## 🚀 セットアップ手順

### 1. Slack Incoming Webhookの作成

1. **Slackワークスペースにアクセス**
   - ブラウザで https://api.slack.com/apps にアクセス

2. **新しいアプリを作成**
   - **Create New App** をクリック
   - **From scratch** を選択
   - App Name: `予約管理通知Bot`
   - Workspace: 通知を送りたいワークスペースを選択
   - **Create App** をクリック

3. **Incoming Webhooksを有効化**
   - 左メニューから **Incoming Webhooks** を選択
   - **Activate Incoming Webhooks** をオン（ON）にする

4. **Webhookを追加**
   - ページ下部の **Add New Webhook to Workspace** をクリック
   - 通知を送りたいチャンネルを選択（例: `#予約管理`）
   - **許可する** をクリック

5. **Webhook URLをコピー**
   - 表示された **Webhook URL** をコピー
   - 例: `https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX`

### 2. Google Apps ScriptにWebhook URLを設定

1. **Apps Scriptエディタを開く**
   - スプレッドシートで **拡張機能 > Apps Script**

2. **dashboard.gsを開く**

3. **Webhook URLを貼り付け**
   - 約241行目の以下の部分を探す：
   ```javascript
   var SLACK_WEBHOOK_URL = 'YOUR_SLACK_WEBHOOK_URL_HERE';
   ```
   
   - コピーしたWebhook URLに置き換える：
   ```javascript
   var SLACK_WEBHOOK_URL = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX';
   ```

4. **保存** (Ctrl+S または Cmd+S)

### 3. テスト送信

1. **関数を選択**
   - エディタ上部の関数選択から **testSlackNotification** を選択

2. **実行**
   - **実行** ボタン（▶）をクリック
   - 初回は権限の承認が求められる場合があります

3. **Slackで確認**
   - 指定したチャンネルに予約サマリーが届いているか確認

### 4. 自動送信トリガーの設定

1. **関数を選択**
   - 関数選択から **setupSlackNotificationTrigger** を選択

2. **実行**
   - **実行** ボタンをクリック
   - これで毎日夜10時（22:00）に自動送信されるようになります

3. **トリガーの確認**
   - 左メニューの **トリガー**（時計アイコン）をクリック
   - `sendDailySummaryToSlack` が毎日22時に実行されるトリガーが表示されることを確認

---

## 📊 送信される内容

Slackに以下の情報が送信されます：

### 各日付ごと（2月7日、2月14日）

- **総予約数**: 合計予約組数
- **総参加者数**: 全参加者の合計
- **謎解き予約**: 予約組数と残り枠数
- **WS予約**: 予約組数と残り枠数
- **時間帯別予約**: 予約がある時間帯のみ表示
  - 満席の場合は🔴満席マークが表示されます

---

## ⚙️ カスタマイズ

### 送信時刻の変更

`setupSlackNotificationTrigger` 関数内の以下の部分を変更：

```javascript
// 夜10時 → 朝9時に変更する場合
ScriptApp.newTrigger('sendDailySummaryToSlack')
  .timeBased()
  .atHour(9)  // ← ここを変更（0-23の範囲）
  .everyDays(1)
  .create();
```

変更後、再度 `setupSlackNotificationTrigger` を実行してください。

### メッセージ内容の変更

`buildSlackMessage` 関数（約337行目）を編集することで、メッセージの内容をカスタマイズできます。

---

## ⚠️ トラブルシューティング

### メッセージが届かない

**原因1**: Webhook URLが正しく設定されていない
- `dashboard.gs` のWebhook URLが正しいか確認
- URLの前後にスペースがないか確認

**原因2**: トリガーが正しく設定されていない
- Apps Scriptの **トリガー** メニューで確認
- `sendDailySummaryToSlack` が設定されているか確認

**原因3**: 実行エラーが発生している
- **実行数** メニューでエラーログを確認
- エラーメッセージを確認して対処

### テスト送信は成功するが自動送信されない

- トリガーが正しく設定されているか確認
- `setupSlackNotificationTrigger` を再実行

### 送信されるが内容がおかしい

- スプレッドシートのシート名が「予約管理」であることを確認
- データの形式が正しいか確認
- `testSlackNotification` でログを確認

---

## 🔐 セキュリティ

- Webhook URLは秘密情報です。他人に共有しないでください
- Webhook URLが漏洩した場合は、Slackアプリの設定から再生成してください

---

## 🎯 今後の拡張案

- 満席アラート（満席になったら即座に通知）
- 週次レポート（週末に1週間の集計を送信）
- リマインダー（イベント前日に最終確認を送信）

---

以上でセットアップは完了です！
