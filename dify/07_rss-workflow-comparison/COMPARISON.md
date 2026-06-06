# n8n vs Dify ワークフロー比較 — RSS → Slack 通知

同一要件「RSS フィードを取得して Slack に通知する」を **n8n** と **Dify** の両方で実装し、設計・実装難易度・運用性を比較した記録です。ツール選定の判断材料として作成しました。

ソース:
- n8n: [`n8n/n8n-workflow-rss-slack.json`](n8n/n8n-workflow-rss-slack.json)
- Dify: [`dify/rss-slack-notifier.yml`](dify/rss-slack-notifier.yml)

---

## 結論（先に）

| 観点 | 向いているツール |
|------|------------------|
| 単純な取得→整形→通知（AI 不要） | **n8n** — ネイティブノードで即完成 |
| AI で分類・要約・翻訳を挟む | **Dify** — LLM ノードが第一級市民 |
| 定期実行・イベント駆動の運用 | **n8n** — Schedule / Webhook トリガーが標準 |
| プロンプト中心の生成パイプライン | **Dify** — モデル・プロンプト管理が UI で完結 |
| セルフホストの手離れ | **n8n** — 単一コンテナで安定。Dify は周辺コンテナ（ssrf_proxy / sandbox）の調整が要る |

**一言で:** 「データを運ぶ」配管は n8n、「AI で中身を加工する」は Dify。本件のように両方必要なら、配管 = n8n + AI 部分 = Dify API 呼び出し、というハイブリッドも有効。

---

## アーキテクチャ比較

### n8n（4 ノード）

```
Schedule(定期) → Read RSS Feed(ネイティブ) → Code(JS整形) → Send to Slack(HTTP)
```

- RSS のパースは `rssFeedRead` ネイティブノードが担当。XML を意識せず構造化済みアイテムが流れる。
- 整形は Code(JS) でタイトル + リンクを番号付きリスト化。
- 出力例: `1. *タイトル* <link|Read More>` の番号付きダイジェスト。

### Dify（5 ノード）

```
開始(RSS URL入力) → RSS取得(Code/Python) → Haiku分類(LLM) → Slack通知(HTTP) → 終了
```

- RSS 取得は **Code ノード（Python urllib）** で自前実装。Dify の HTTP ノードは外部 URL の body が取れず、かつ sandbox からの外部通信は `ssrf_proxy` 経由が必須（後述）。
- **Claude Haiku** で記事を最大5件、カテゴリ（AI/ML・Web開発・クラウド・セキュリティ・ビジネス・その他）付きで分類・要約。
- 出力例: `[ビジネス] S&P500が…の解説 | [セキュリティ] Lockdown Mode…` の1行・カテゴリ付き要約。

---

## 機能差

| 項目 | n8n | Dify |
|------|-----|------|
| トリガー | Schedule（定期）/ Webhook | 手動実行（`rss_url` 変数入力）※定期実行は別途スケジューラ要 |
| RSS パース | ネイティブノード1個 | Code ノードで自前実装（HTTP ノードが使えない） |
| AI 処理 | なし（生のタイトル+リンク） | Haiku で分類・要約・カテゴリ付け |
| 出力形式 | 番号付きリスト | 1行・カテゴリ付き要約 |
| 付加価値 | 低（配管のみ） | 高（情報の構造化・要約） |
| ノード数 | 4 | 5 |

---

## 実装難易度・ハマりどころ

### n8n（比較的素直）

- **ノードの二重接続**: キャンバス上は線形に見えても、実際は分岐していてノードがバイパスされることがある。Executions タブの実行状態（緑/グレー/赤）で確認するのが確実。
- **Webhook テスト URL の一回性**: `webhook-test` は1クリック1リクエストのみ。Publish して本番 URL を使う方が安定。

### Dify（落とし穴が多い）

セルフホストの Dify でこのワークフローを完成させるまでに、以下の非自明な問題を順に解決した:

1. **HTTP ノードが body を取れない** → Code(Python) ノードで取得。
2. **sandbox の外部通信は ssrf_proxy 経由必須** → コード内で `ProxyHandler({"http(s)": "http://ssrf_proxy:3128"})` を明示。`squid.conf.template` で対象ドメインを許可。
3. **kebab-case の node id（`rss-fetch`）が変数展開を壊す** → `{{#node.var#}}` はハイフンを含む id にマッチしない。id を `rss_fetch` 等アンダースコアにする。
4. **LLM プロンプトに `edition_type: basic` が必要** → ないと変数がリテラル文字列のまま送られる。
5. **sandbox の WORKER_TIMEOUT（既定15秒）超過で `signal: killed`** → `SANDBOX_WORKER_TIMEOUT=30` に延長 + Code ノードを短 timeout(10s)+リトライ化で安定化。

> Dify は AI パイプラインとしては強力だが、セルフホスト環境では周辺コンテナ（nginx / ssrf_proxy / sandbox）の挙動理解が前提になる。マネージド版なら多くは隠蔽される。

---

## 秘密情報（Slack Webhook URL）の管理

| ツール | 方式 | git 安全性 |
|--------|------|-----------|
| n8n | `$env.SLACK_WEBHOOK_URL`（環境変数参照） | ◎ JSON には変数名のみ |
| Dify | Dify UI 上でのみ設定（エクスポート DSL にはダミーを残す） | ◎ YAML はダミー据え置き |

どちらも実 URL をリポジトリにコミットしない運用にした。

---

## 使い分け指針（まとめ）

- **AI を挟まない定型自動化** → n8n。ネイティブノードが豊富で、配管が速く組める。
- **生成・分類・要約・翻訳が主役** → Dify。プロンプトとモデルの管理が UI で完結し、出力品質を作り込みやすい。
- **両方必要** → n8n で配管し、AI 部分だけ Dify（または Claude API）を呼ぶハイブリッドが現実的。

本件の RSS → Slack は、「ただ流す」なら n8n で十分、「要約して読みやすくする」なら Dify の AI 分類が明確な付加価値になる、という対照的な結果になった。
