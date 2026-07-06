# 畑ノート セットアップ手順（Firebase 自動同期版）

## 1. Firebaseプロジェクトを作る（無料）
1. https://console.firebase.google.com を開き、Googleアカウントでログイン
2. 「プロジェクトを作成」→ 好きなプロジェクト名（例：hatanote）→ 作成
3. 左メニュー「構築」→「Firestore Database」→「データベースの作成」
   - ロケーション：`asia-northeast1`（東京）を推奨
   - モード：「本番環境モード」を選択（ルールは後で設定します）
4. 左メニュー「構築」→「Authentication」→「始める」
   - 「Sign-in method」タブ →「Google」を選び、有効にする
   - プロジェクトのサポートメールを設定して保存
   - 同じ画面の「設定」タブ →「承認済みドメイン」に、GitHub PagesのドメインURL（例：`your-username.github.io`）を追加（これがないとログインが失敗します）

## 2. Webアプリを登録して設定値を取得
1. プロジェクト概要の歯車アイコン →「プロジェクトの設定」
2. 「マイアプリ」→ `</>`（ウェブ）アイコンをクリック
3. アプリのニックネームを入力（例：hatanote-web）→ アプリを登録
4. 表示される `firebaseConfig = { apiKey: ..., authDomain: ..., ... }` の値をコピー

## 3. index.html に設定値を貼り付け
`index.html` 内の以下の部分を、コピーした値に書き換えてください。

```js
const FIREBASE_CONFIG = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

※ この値はテキストで送っていただければ、代わりに埋め込んだファイルをお渡しすることもできます。

## 4. Firestoreのセキュリティルールを設定
Firestore Database →「ルール」タブで、以下に置き換えて「公開」してください。

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /farms/{farmCode}/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**セキュリティについての注意**：このルールは「ログイン済み（Googleアカウントでログイン）であれば、農場コードを知っている人は誰でも読み書きできる」設定です。農場コードは他人に推測されにくい文字列にし、公開の場に書き込まないようにしてください。より厳密な権限管理（特定のメールアドレスだけ許可する等）にしたい場合はご相談ください。

## 5. GitHub Pagesにアップロード
これまでと同じ手順で、以下のファイルをリポジトリにアップロードしてください。
- index.html（FIREBASE_CONFIGを書き換えたもの）
- manifest.json
- service-worker.js
- icon-192.png / icon-512.png / icon-512-maskable.png / icon-180.png

## 6. 使い始める
1. 公開されたURLをスマホで開く
2. 最初の画面で「Googleでログイン」→ 自分のGoogleアカウントでログイン
3. 「農場コード」（家族・従業員全員で同じもの）を入力して「保存して始める」
4. ホーム画面に追加すればアプリのように使えます
5. 他の家族・従業員の端末でも同じURLを開き、それぞれ自分のGoogleアカウントでログインしたうえで、同じ農場コードを入力すれば、記録が自動的にひとつにまとまります（作業記録には各自のGoogleアカウント名が自動で表示されます）

## 動作の仕組み（オフライン対応）
- 電波がない場所でも、入力した記録はまず端末に保存されます（保存待ちの記録には「⏳ 送信待ち」と表示されます）
- 電波が戻ると自動的にFirebaseへ送信され、他の端末にも自動で反映されます
- 初回起動時のみ、農場コードの認証のためインターネット接続が必要です

## 記録方法（GPS開始・終了ボタン）
- 「本日」の日付を選んでいる時は、圃場・作物・作業内容を選んでから「📍 GPSで作業開始」を押すと、開始時刻と位置情報が自動記録されます
- 作業が終わったら同じボタン（「⏹ 作業終了」）をもう一度押すと、終了時刻・位置情報が記録され、自動保存されます（経過時間はボタン下に表示されます）
- アプリを閉じても作業中の状態は保持され、再度開くと続きから経過時間が表示されます
- 過去の日付を選ぶと、開始・終了時刻を手動入力する画面に切り替わります（記録し忘れた日の後追い入力用）
- 記録した時刻が間違っていた場合は、各記録の「時刻を修正」から後から直せます
