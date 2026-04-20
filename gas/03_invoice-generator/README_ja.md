# 請求書自動生成 — Google Apps Script

スプレッドシートの請求データを読み込み、PDFを自動生成・Driveに保存・クライアントにメール送信します。

---

## こんなお悩みありませんか？

| 今まで | 導入後 |
|--------|--------|
| 毎回Wordで請求書を手作り | スプレッドシートに入力するだけ |
| PDFへの変換・保存が手間 | Google DriveにPDFが自動保存 |
| メール添付を忘れることがある | クライアントに自動でメール送信 |
| 送付済みかの管理が煩雑 | シートに「送信済み」が自動記録 |

---

## 処理の流れ

1. スプレッドシートに請求データを入力
2. GASがGoogle Docsテンプレートをコピーして値を差し込み
3. PDFを自動生成
4. PDFをGoogle Driveの指定フォルダに保存
5. クライアントにPDFを添付してメール送信
6. スプレッドシートの該当行を「送信済み」（緑色）に更新

---

## スクリーンショット

### 送信メール（PDF添付）
![メール](img/email.png)

### 生成されたPDF請求書
![請求書PDF](img/invoice_pdf.png)

### スプレッドシート（ステータス更新後）
![シート](img/sheet.png)

---

## セットアップ手順

### 1. `createTemplateAndSheet()` を実行する（初回のみ）

GASエディタでこの関数を実行すると、以下が自動作成されます:
- Google Docsの請求書テンプレート（プレースホルダー入り）
- スプレッドシート（サンプルデータ入り）
- PDFの出力先Driveフォルダ

実行後、ログに3つのIDが表示されるのでスクリプトに貼り付ける。

### 2. IDをスクリプトに設定する

`invoice_generator.js` を開いて設定:

```js
var TEMPLATE_DOC_ID  = "DocsテンプレートのID";
var SPREADSHEET_ID   = "スプレッドシートのID";
var OUTPUT_FOLDER_ID = "DriveフォルダのID";
```

### 3. 請求書を生成する

- **1件テスト**: `testSingleInvoice()` を実行（2行目のデータで生成）
- **一括生成**: `generateAllPendingInvoices()` を実行（「Pending」の行をすべて処理）

---

## スプレッドシートの列構成

| 列 | 項目 |
|----|------|
| A | 請求書番号 |
| B | 発行日 |
| C | 支払期限 |
| D | クライアント名 |
| E | クライアントメールアドレス |
| F〜H | 明細1（品名・数量・単価） |
| I〜K | 明細2（品名・数量・単価） |
| L〜N | 明細3（品名・数量・単価） |
| O | 備考 |
| P | ステータス（`Pending` → `Sent`） |

---

## テンプレートのプレースホルダー

| プレースホルダー | 差し込み内容 |
|----------------|-------------|
| `{{invoice_number}}` | 請求書番号 |
| `{{issue_date}}` | 発行日 |
| `{{due_date}}` | 支払期限 |
| `{{client_name}}` | クライアント名 |
| `{{item1_desc}}` 〜 `{{item3_total}}` | 明細行 |
| `{{subtotal}}` | 小計 |
| `{{tax}}` | 消費税（10%） |
| `{{total}}` | 合計金額 |
| `{{notes}}` | 備考 |

---

## ファイル構成

```
03_invoice-generator/
├── invoice_generator.js   # メインスクリプト
├── appsscript.json        # GAS設定ファイル
├── img/
│   ├── email.png
│   ├── invoice_pdf.png
│   └── sheet.png
└── README_ja.md
```

---

## ライセンス

MIT
