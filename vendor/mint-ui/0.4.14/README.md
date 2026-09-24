# Mint UI

学術ノートの「暗い背景・ミント色・丸い形・やわらかな動き」を、別のプロジェクトでも使うための小さな UI ライブラリです。**フレームワーク不要 / 公開 npm への登録なし**。現在の版は [package.json](package.json) の `version` が正本です。

| ファイル | 役割 |
| --- | --- |
| `theme.css` | 色、フォント、角丸、影、動きの共通変数 |
| `components.css` | ヘッダー、カード、ボタン、メニュー、タブ、表、開閉パネル |
| `mint-ui.js` | メニューの選択・キーボード操作、タブの背景移動、パネルの開閉 |
| `examples/index.html` | 学術ノートの内容に依存しない部品サンプル |

## 登録済みアプリをまとめて更新する

このリポジトリでは、共通ソースを変更した後にルートで次を実行します。

```powershell
node scripts/mint-ui-pipeline.mjs release
```

一時領域に候補版を作り、共通部品と登録済み全アプリを検証します。成功した場合だけ、新しい版を配布し、各アプリの読み込み先を一括更新します。既存版と内容が異なる場合はパッチ版を自動で上げます。配布済み `vendor` は編集せず、旧版も保持します。

内容やアプリ側だけの変更には `node scripts/mint-ui-pipeline.mjs check` を使います。検証後に対象ファイルを変えたら再実行します。保存だけでは反映されず、commit・pushも自動実行しません。

- 利用先の正本：[mint-ui.consumers.json](../../mint-ui.consumers.json)
- 現在の利用先：学術ノート（study-tool）、M&Aテンプレートツール、思索日記（notes-of-thought）
- 思索日記はAstro/Fuwariの構成を保ち、共通テーマ・本文スタイル・選択メニュー・開閉操作を利用します。検証時にAstroとPagefindをビルドするため、先に `pnpm --dir notes-of-thought install --frozen-lockfile` を実行します。
- ローカルゲート：`node scripts/mint-ui-pipeline.mjs hooks` で有効化。未検証・検証後の変更・利用版不一致をcommit前に止めます。
- GitHub CI：PRとmainへのpushで同じ検証を実行します。CI定義だけではリモートのマージ必須条件は設定されません。

## 別プロジェクトから読み込む

新しい利用先には、まず静的インストーラーで配布物を配置します。

```powershell
node packages/mint-ui/install.mjs "C:/path/to/project/public/vendor"
```

インストーラーが出力する版のパスをHTMLに指定します。以下の `<version>` はその版に置き換えます。

```html
<link rel="stylesheet" href="./vendor/mint-ui/<version>/theme.css">
<link rel="stylesheet" href="./vendor/mint-ui/<version>/components.css">
<body class="mint-app">
  <!-- サンプルと同じ意味構造・属性で部品を配置 -->
  <script type="module">
    import { initMintUI } from './vendor/mint-ui/<version>/mint-ui.js';
    initMintUI();
  </script>
</body>
```

このリポジトリのアプリは導入だけで完了にせず、`mint-ui.consumers.json` に `id`・`root`・`public`・`browser`・`tests` を登録し、`scripts/mint-ui-browser.mjs` にそのアプリの検証を追加します。新しいbrowser識別子はパイプラインの許可リストにも追加します。最後に `release` を実行します。

`runtimeDirectories` には、利用アプリのルートからの相対パスでローカル保存データや生成物を指定できます。例：M&Aツールの `data`、思索日記の非公開 `private`・生成先 `dist`・キャッシュ `.astro`。この領域は候補版のコピーと検証ハッシュから除外します。学術ノートの `dist` はソースなので除外せず、教材JSONも検証・リリースの対象です。

[部品サンプル](examples/index.html) と同じHTML構造を使ってください。利用先の `/vendor/mint-ui/<version>/examples/index.html` でも確認できます。ES Modulesのため `file://` ではなくローカルサーバーから開きます。フォントの読み込みは利用アプリ側で行います。

ビルドツールを使うプロジェクトでは、npm のローカルパッケージとしても利用できます。

```powershell
npm install "C:/Users/yushi/Desktop/physical-ai-ma-praxis/packages/mint-ui"
```

```js
import '@yushi/mint-ui/theme.css';
import '@yushi/mint-ui/components.css';
import { initMintUI } from '@yushi/mint-ui';

// HTML を描画したあとに初期化する。
initMintUI();
```

React などではマウント後に初期化し、アンマウント時に対応するコントローラーを破棄します。ライブラリ自身はフレームワークを追加しません。

## 部品と操作

| 部品 | CSS / 初期化用属性 |
| --- | --- |
| ページの基本 | `.mint-app` |
| ヘッダー | `.mint-header` / `.mint-header-inner` / `.mint-brand` |
| カード | `.mint-card` / `.mint-card-heading` |
| ボタン | `.mint-button` / `data-variant="primary"` または `"soft"` |
| 選択メニュー | `.mint-select[data-mint-select]` |
| タブ | `.mint-tabs[data-mint-tabs]` |
| 開閉パネル | `details.mint-disclosure[data-mint-disclosure]` |
| 表 | `.mint-table-wrap` 内の `table.mint-table` |
| 方向バッジ | `.mint-direction[data-direction="up\|down\|flat"]` |
| 入力欄 | `.mint-field` 内の `input.mint-input` / `textarea.mint-input` |
| 本文・見出し | `.mint-emphasis` / `.mint-heading`（別々のテーマ変数） |
| 補足・状態表示 | `.mint-callout` / `.mint-badge`（`data-tone` で用途を指定） |
| 記事・教材の本文 | `.mint-prose`（段落、見出し、リスト、引用、脚注） |
| 数式の表示領域 | `.mint-math`（KaTeX対応。描画ライブラリは利用アプリが導入） |

### ダーク・ライト・端末設定

既定はダークで、選択できるのはダーク・ライトです。端末設定には自動追従せず、以前保存された `auto` もダークへ戻します。`initTheme()` が保存・別タブとの同期を担当し、`html` の `data-mint-theme` と `data-mint-mode` を更新します。`createThemeSelect()` は許可されたモードだけを表示します。端末への追従が必要なアプリのみ `allowedModes: ['dark','light','auto']` を明示します。ダーク固定には `allowedModes: ['dark']` を指定し、選択UIを置きません。固定時は保存済みのライト設定や別タブからの設定変更も適用しません。

```js
import { initTheme, createThemeSelect } from '@yushi/mint-ui';
const theme = initTheme({ storageKey: 'my-app-theme', defaultMode: 'dark' });
const picker = createThemeSelect({
  theme, label: '表示テーマ',
  labels: { dark: 'ダーク', light: 'ライト', auto: '端末設定' }
});
header.append(picker.element);
// 動的な画面を取り除くとき：picker.controller.destroy()
// アプリ全体の終了時：theme.destroy()
```

保存先は同一オリジンのlocalStorageです。別ドメイン・別ポートのアプリ間で設定そのものは共有しません。`syncDarkClass: true` を指定すると、Tailwind等が使う `html.dark` も同期します。`mint:theme` イベントの `detail` は `{mode, theme}`。初回描画前のテーマ適用は各アプリのHTML側で行えます。

`.mint-prose` は明示した本文領域だけに適用し、記事幅やサイト固有の配置は変更しません。段落間隔と行間は `--mint-prose-paragraph-gap`・`--mint-prose-leading` で調整します。数式はKaTeXのCSSとライブラリを別途導入し、`.mint-math` に描画します。Mint UI自体にKaTeXへの依存はありません。

メニュー用途の `details.mint-disclosure` には `data-mint-dismissable` を追加できます。外側クリック・Esc・リンク選択で閉じ、Escでは見出しへフォーカスを戻します。通常の説明パネルには付けません。

### フォームとメニュー

明るいアクセント色で塗る面の文字には `--mint-on-accent` を使います。通常本文の `--mint-text` とは用途を分けます。日常操作のボタンには `data-variant="neutral"` を指定すると、ネイビー系の背景と明るい文字になります。色の組は `--mint-control-surface`・`--mint-control-hover`・`--mint-control-active`・`--mint-control-text` で共通管理し、ライトテーマにも追従します。

メニューはブラウザの最前面レイヤーに表示し、カードやスクロール領域で切れないようにします。Popover APIがない環境ではbodyへ一時的に移動します。画面端で位置・開く方向・最大高さを調整し、長いリストはスクロールできます。閉じる・破棄する際に状態とDOM位置を戻します。

動的な選択欄はHTMLを組み立てず、共通ヘルパーで作れます。ラベルはテキストとして設定します。

```js
import { createSelect } from '@yushi/mint-ui';
const { element, controller } = createSelect({
  label: '状態', value: 'draft',
  options: [{value: 'draft', label: '下書き'}, {value: 'ready', label: '準備できた'}]
});
element.dataset.width = 'full'; // 任意。小さな操作欄には data-size="sm"
container.append(element);
element.addEventListener('mint:change', event => saveStatus(event.detail.value));
// DOMを取り除く・作り直す前に実行する。
controller.destroy();
```

入力は通常のlabelとinput/textareaを使い、フォーカス・無効状態・`aria-invalid="true"` を共通CSSで扱います。フォーム送信や必須項目の検査はアプリ側で行います。カスタム選択欄はネイティブform送信へ自動登録されないため、値はcontrollerまたはイベントから取得してください。

表示モード切替のボタン群は、`role="group"` と `aria-pressed` でもタブのインジケーターを利用できます。画面の表示切替は引き続きアプリ側が担当します。

### 印刷テーマ

標準は紙向けの明るい配色です。カードの背景・文字色も合わせて切り替えます。ダークな資料など画面配色を維持する場合は、`<html data-mint-print-theme="screen">` を指定してください。印刷の背景出力はブラウザの設定にも依存します。ページサイズ・改ページ・印刷する領域はアプリ側で指定します。

見出しには `--mint-text-heading`、強調する本文には `--mint-text-emphasis` を使います。カード見出しのみ変更する場合は `--mint-card-heading-color` を設定できます。

選択メニューは通常の `<select>` を使わず、共通のボタンとリストを使います。開いたリストまで CSS で描画するため、OS やブラウザー標準の選択メニューの青色が混ざりません。フォーカス、矢印キー、Enter、Esc、外側クリックも共通部品で処理します。

```js
import { initSelect } from '@yushi/mint-ui';

const root = document.querySelector('[data-mint-select]');
const select = initSelect(root);

root.addEventListener('mint:change', event => {
  // 言語の切り替えや保存は、利用するアプリ側の仕事。
  console.log(event.detail.value);
});

select.setValue('fr'); // 表示と選択状態を同期。イベントは発火しない。
select.setValue('ja', { emit: true }); // 通知も必要な場合。
```

`initMintUI()` は対象属性が付いた部品をまとめて初期化します。個別には `initSelect`、`initTabs`、`initDisclosure` を使えます。タブのリンクと表示ページの対応付けはアプリ側で行い、選択中のリンクに `aria-current="page"` を付けます。部品はその変更を追って背景を移動します。文字幅を変える独自処理のあとには、タブのコントローラーの `refresh()` も利用できます。

## テーマを統一するルール

- 色・フォント・角丸・影・動きは `--mint-*` 変数を使い、部品ごとに色コードを足さない。
- メニュー、タブ、開閉パネルは共通部品を使い、アプリごとに操作コードを複製しない。
- `.mint-*` の内部スタイルを直接上書きせず、まず共通変数で調整する。画面固有の配置や幅はアプリ側の CSS に置く。
- 翻訳、教材、業務データ、ページ切り替え、業務データの保存はアプリ側に残す。テーマ設定の保存は `initTheme` に任せ、保存キーはアプリ側で指定する。
- 更新時はキーボード操作、モバイル表示、動きを抑える設定も確認する。

```css
/* 別プロジェクトでテーマを変える場合。共通 CSS のあとに読み込む。 */
:root {
  --mint-radius-card: 28px;
  --mint-radius-control: 17px;
  /* 色は --mint-accent / --mint-accent-surface などをまとめて変更。 */
}

/* 画面固有のレイアウトは利用側に置く。 */
.my-dashboard { max-width: 1080px; margin: auto; }
```

部品はアプリ内の UI を統一します。ブラウザー自体のメニューや、まだ共通部品がないネイティブ入力のポップアップまで置き換えるものではありません。

## リポジトリ外で版を固定して使う

静的インストーラーは同じ版・同じ内容なら何もせず、同じ版で内容が違う場合は上書きを拒否します。リポジトリ外の利用先は自動更新対象ではありません。全体の更新ゲートへ参加させる場合は、先に登録方法とブラウザ検証を整備します。

npmのローカルパス導入はソースの変更を参照することがあります。固定配布にはソースフォルダで `npm pack` を実行し、出力された `.tgz` のパスを利用先で `npm install` へ渡してください。公開npmパッケージとしては提供していません。

## AIにも同じルールを使わせる

導入先の `AGENTS.md` に「UIは Mint UI を使う。色を直書きせず、メニューやタブを独自実装しない」と記載し、同梱の [AGENTS.md](AGENTS.md) を参照してください。学術ノート側にも適用済みです。

選択肢の追加・削除後はコントローラーを `destroy()` して再初期化します。同じ要素を繰り返し初期化しても既存コントローラーを返すため、イベントが重複しません。

## 検証

ルートの `node scripts/mint-ui-pipeline.mjs check` が正式な完了確認です。単体確認のみならソースフォルダで `node --test test/*.test.mjs`。テーマ変数の参照、インストールの整合性・上書き防止・旧版との共存を確認します。UIは部品サンプルと利用アプリで確認してください。

`node test/serve.mjs` で表示されるURLを開き、「Run checks」でブラウザの回帰チェックを実行できます。カード内の表示、Popoverの代替表示、選択通知、破棄後のDOM復元、文字列の安全な表示、モード切替を検証します。同じサーバーの `/examples/index.html` から部品サンプルも確認できます。矢印キー・Enter・Esc・Tab・無効な選択肢のスキップ、狭い画面での位置調整はブラウザでも確認してください。

## ページの上端に表の見出しを固定する

`<div class="mint-table-wrap" data-mint-sticky-table>` の中に `table.mint-table` と `thead` を配置し、`initMintUI()` を呼びます。個別には `initStickyTable(wrapper)` でも初期化できます。

見出しは通常の位置からスクロールし、画面上端に達すると固定され、表の末尾で退出します。表は高さ制限なしの一覧表示になります。横スクロールと列幅、翻訳・画面幅の変化にも追従します。既存の表は属性を付けるまで変わりません。

固定部分は読み上げ対象外の表示用コピーです。ソートボタン等の操作を持たない見出しに使ってください。読み上げ・印刷には元の表を使います。上端に別の固定バーがあるアプリでは `--mint-sticky-top` をその高さに設定できます。コントローラーには `refresh()` と `destroy()` があります。


### Grouped optional table columns (0.3.0)

Put `data-mint-column-toggle` on the container. Inside it, add a native button
with `data-mint-columns-toggle="details"`, `aria-expanded="false"`, and
`aria-controls` pointing to the table ID. Mark every optional header/data cell
`data-mint-column="details" hidden`. Mark full-width group headings
`data-mint-colspan`; their colspan follows visible columns.
Optional button spans `data-mint-collapsed-label` / `data-mint-expanded-label`
switch their visibility. Initialize with `initColumnToggle(container)` or
`initMintUI()`. The controller exposes `setExpanded(group, boolean)` and `destroy()`.

Sticky headings opt in through `data-mint-sticky-table` on the table wrapper
and `initStickyTable(wrapper)` (or `initMintUI()`). The viewport overlay copies
the wrapper's top corner radii, column widths and theme; `--mint-sticky-top`
sets the viewport offset. A semantic original header remains in the table.

補助的なリンクには `data-tone="neutral"` を指定できます。通常は白寄りの本文色、ホバー時は明るい文字色になり、主要なミント色のリンクと区別できます。


`data-shape="soft"` on `.mint-direction` opts into a wider rounded badge. Supply a 24×24 inline SVG with rounded stroke paths and `aria-hidden="true"`; keep the accessible direction label on the badge. Plain character badges remain supported.

Use `data-shape="round"` for a circular 40px direction badge with the same SVG styling.

### Direction designs

The gallery preserves five SVG recipes: rounded arrow (recommended default), rounded triangle, chevron, bold arrow, and circular badge. Copy the semantic `.mint-direction` markup from `examples/index.html`; labels and choosing a design belong to the app. No runtime style picker is required. Keep `role="img"` and a localized `aria-label` on the badge, with its SVG hidden from assistive technology.
### Row-spanning labels and hover

Wrap each set of rows sharing a merged label in its own `<tbody data-mint-row-group>`.
Use `<th scope="row" rowspan="2">` (or the actual group size) for the shared label.
Hovering any row in that group highlights the merged label; unrelated groups stay unchanged.
This opt-in CSS behavior needs no JavaScript initialization. Each merged label must span its entire group.
