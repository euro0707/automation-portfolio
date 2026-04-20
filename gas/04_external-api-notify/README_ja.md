# 外部API通知連携 — Google Apps Script

スプレッドシートの更新を検知して **Slack・LINE・Webhook** にリアルタイム通知します。

---

## 処理の流れ

1. スプレッドシートの行が追加・更新される
2. GASが検知して通知を一斉送信:
   - Slack — チャンネルにリッチな通知メッセージ
   - LINE通知 — スマホにプッシュ通知（LINE Notify）
   - 汎用Webhook — Zapier・Make・n8n など任意のエンドポイントにJSON送信
3. 該当行が「送信済み」（緑色）に更新される

---

## スクリーンショット

### GAS実行ログ
![GASログ](img/gas_log.png)

### Webhookの受信確認
![Webhook](img/webhook.png)

---

## 対応サービス

| サービス | 方式 | 主な用途 |
|---------|------|---------|
| Slack | Incoming Webhook | チームへのアラート・業務通知 |
| LINE通知 | REST API + Bearerトークン | 個人・グループへのスマホ通知 |
| 汎用Webhook | HTTP POST（JSON） | Zapier・Make・n8n・自社API連携 |

---

## セットアップ手順

### 1. `external_api_notify.js` の CONFIG を設定する

```js
var CONFIG = {
  slack_webhook_url: "https://hooks.slack.com/services/xxx/yyy/zzz",
  line_notify_token: "LINEトークン",
  generic_webhook_url: "https://webhook.site/your-unique-id",
  spreadsheet_id: "スプレッドシートのID",
  sheet_name: "Notifications"
};
```

**各トークンの取得方法:**
- **Slack**: Slack API → アプリ作成 → Incoming Webhooks → ワークスペースに追加
- **LINE通知**: [notify-bot.line.me/my](https://notify-bot.line.me/my/) → トークン発行
- **Webhook**: [webhook.site](https://webhook.site) でテスト用URLを取得

### 2. サンプルシートを作成する

GASエディタで `setupSampleSheet()` を実行 → IDがログに表示されるので `CONFIG.spreadsheet_id` に設定

### 3. トリガーを登録する（初回のみ）

`setupTrigger()` を実行してonEditトリガーを有効化

### 4. 各チャンネルをテストする

```
testWebhook()  → Webhookエンドポイントに送信
testSlack()    → Slackチャンネルに送信
testLine()     → LINEに送信
testAll()      → 全チャンネルに一括送信
```

---

## スプレッドシートの列構成

| 列 | 項目 |
|----|------|
| A | 種別（例: "Alert", "Order"） |
| B | タイトル |
| C | 詳細 |
| D | 金額 |
| E | ステータス（`Pending` → `Sent`） |

---

## ファイル構成

```
04_external-api-notify/
├── external_api_notify.js   # メインスクリプト
├── appsscript.json          # GAS設定ファイル
├── img/
│   └── webhook.png
└── README_ja.md
```

---

## ライセンス

MIT
