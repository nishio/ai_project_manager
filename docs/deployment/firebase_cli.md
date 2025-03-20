Firebase CLIを利用すると、Firestoreの設定やデータ移行をコード管理でき、Web UIでの手作業を回避できます。以下に手順をまとめます。

1. **Firebase CLIのインストールとログイン**  
   - Node.js環境で `npm install -g firebase-tools` を実行し、Firebase CLIをインストールします。  
   - `firebase login` でGoogleアカウントにログインします。

2. **Firestoreプロジェクトの初期化**  
   - プロジェクトディレクトリで `firebase init firestore` を実行し、Firestoreの設定ファイル（例：`firestore.rules`、`firestore.indexes.json`）を生成します。  
   - セットアップ中に使用するプロジェクトを選択します。

3. **設定ファイルの編集**  
   - `firestore.rules` にセキュリティルールを記述し、アクセス制御を設定します。  
   - `firestore.indexes.json` に必要なインデックス（例：タスクや提案のインデックス）を定義します。

4. **自動デプロイ**  
   - 設定が完了したら、`firebase deploy --only firestore` を実行し、Firestoreの設定をデプロイします。  
   - これにより、ローカルで管理しているルールやインデックスが自動で反映されます。

5. **データ移行の自動化**  
   - PythonやNode.jsのスクリプトを作成し、バックログJSONデータのインポート処理を自動化できます。  
   - CLIと連携して、初期データのロードや更新も自動実行可能です。

これにより、手作業ではなく、コードによる管理と自動デプロイで効率的にFirestoreの設定を行うことができます。

## よくあるエラーと対策
- 認証トークンのエラー（401エラー）
  → firebase logout 後に firebase login --reauth を実行し、再認証を行います。