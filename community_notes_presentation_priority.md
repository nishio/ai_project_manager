# Community Notesのノート表示と投票優先順位システム

## 概要
Community Notesシステムは、ノートの表示順序と投票の優先順位付けにおいて、複数の要因を考慮した複雑な仕組みを採用しています。本ドキュメントでは、ノートがどのようにユーザーに表示され、どのような優先順位で評価されるかを説明します。

## 1. ノートの表示システム

### 1.1 基本的な表示フロー

Community Notesの目標は、Xユーザーが誤解を招く可能性のある情報に遭遇したときに、有用なコンテキストを提供することです。ノートの表示は以下のプロセスで管理されます：

#### 1.1.1 ノートのステータス遷移
1. **初期状態（Needs More Ratings）**
   - すべての新規ノートはこのステータスで開始
   - 評価者に表示され、評価を収集

2. **Helpfulステータス獲得**
   - 異なる視点を持つ評価者から十分な"helpful"評価を獲得
   - X上で直接表示が開始
   - 新しい評価に応じてステータスは更新可能

3. **Not Helpfulステータス**
   - 十分な数の"not helpful"評価を受けた場合
   - X上での表示は行われない
   - 継続的に低評価のノートを書く評価者は執筆権限を一時的に失う可能性

4. **ステータスのロック**
   - 2週間後にステータスが固定
   - その後の評価による変更は不可

参照: `/documentation/contributing/notes-on-twitter.md`

#### 1.1.2 表示プロセス
- 評価者には、評価が必要なノートを示すプロンプトが表示
- プレビュー表示により、素早い評価収集を促進
- ノートのステータスは新しい評価により動的に更新
- "Helpful"ステータスのノートは、投稿に直接表示

参照: `/documentation/contributing/notes-on-twitter.md`

### 1.2 ノートの表示と評価システム

#### 1.2.1 "Needs Your Help"タブの表示基準
以下の条件を考慮して、最大10件のノートが表示されます：

**投稿に関する基準:**
- 投稿の新しさ（24時間以内）
- 予測される「いいね」と「リポスト」数
- ブロックしているユーザーの投稿は除外
- 投稿者の過去の信頼性スコア

**ノートに関する基準:**
- 著者のWriting Impactが正で、Helpfulノート比率が高い
- 現在のステータスが"Needs More Ratings"
- 現在の信頼度スコアが一定以上
- 評価数が多すぎない（ステータス変更の可能性がある）
- スパム関連用語（"spam", "scam"等）を含むノートは表示確率が低下

#### 1.2.2 評価システムの仕組み
1. **評価者の選定**
   - 異なる視点を持つ評価者を優先的に選択
   - 評価者の信頼度スコアに基づく重み付け
   - 過去の評価パターンを考慮

2. **評価の収集方法**
   - プレビュー表示による迅速な評価収集
   - アラートシステムによる重要ノートの通知
   - 評価者の設定に基づく通知頻度の調整

3. **評価の重み付け**
   - 評価者の信頼度スコアによる重み付け
   - タグベースの評価重み付け
   - 極端な意見の評価者間のコンセンサス重視

4. **表示順序の決定**
   - 信頼度スコアに基づく優先順位付け
   - 投稿の注目度による調整
   - コミュニティの多様性を考慮した表示順序

参照: 
- `/documentation/under-the-hood/timeline-tabs.md`
- `/documentation/under-the-hood/note-ranking-code.md`

### 1.3 ノートリクエストシステム

Community Notesは、X上のユーザーが有用なコンテキストが必要だと感じる投稿に対して、ノートをリクエストできる機能を提供しています。

#### 1.3.1 リクエストの基本要件
- 認証済み電話番号を持つアカウントのみリクエスト可能
- 1日あたり最大5件のリクエスト制限
- リクエスト制限は以下の条件で変動：
  - 有用なノートにつながったリクエストで増加
  - ノートが不要と判断された投稿へのリクエストで減少

#### 1.3.2 表示条件
- 投稿の新しさ: 24時間以内
- リクエスト表示の閾値: MAX(5, 投稿の閲覧数/25000)
- リクエストの有効期間: 24時間
- Top Writer statusを持つ評価者が優先的に確認可能

#### 1.3.3 ソース情報の追加
- リクエスト時に関連ソースを追加可能
- 現在はX上の投稿をソースとして追加可能
- スパム防止のためのソースフィルタリング
- 評価者がミュートした投稿は表示から除外

#### 1.3.4 評価者の参加
- Top Writer statusを持つ評価者がリクエストを確認
- Community Notesタブでリクエスト投稿のフィードを閲覧可能
- パイロットフェーズでは評価者の50%がリクエスト機能を利用可能

参照: `/documentation/under-the-hood/note-requests.md`

## 2. 評価者の資格と制限

### 2.1 基本要件
- 最低10件の評価実績が必要
- helpfulnessスコア ≥ 0.66
- 作成ノートの平均スコア ≥ 0.05が必要
- CRH vs CRNH比率の要件を満たす必要あり

### 2.2 評価の優先順位付け
- アラート通知システムによる重要ノートの通知
- プレビュー表示による素早い評価の促進
- ランダムな評価者選択（ノート作成者と既評価者を除く）
- 通知頻度は評価者の設定に依存

## 3. 表示と評価の技術的実装

### 3.1 行列分解による信頼度スコアリング

Community Notesは、行列分解を用いて評価者とノートの関係性を低次元空間で表現し、信頼度スコアを計算します。

#### 3.1.1 入力データと行列の構築

Community Notesの行列分解システムは、以下のプロセスで評価データを行列化し処理します：

1. **評価データの収集と構造化**
   - **基本行列の構築**
     - 行: 評価者ID（数十万〜数百万の評価者）
     - 列: ノートID（数百万のノート）
     - 値: helpful(1) / not helpful(-1)の二値
   
   - **評価タグの統合**
     - タグごとの重み付け係数: a_{un}
     - タグの種類：
       - "Sources not included"
       - "Incorrect"
       - "Opinion"
       - その他のメタデータ

2. **行列の前処理と最適化**
   - **評価値の正規化**
     - グローバル平均(μ)の計算
     - 評価者ごとの平均値調整
     - ノートごとの平均値調整
   
   - **スパース行列の処理**
     - 99%以上が欠損値（未評価）
     - 効率的なメモリ使用のための圧縮保存
     - バッチ処理による大規模データの取り扱い

3. **データの品質管理**
   - スパム評価のフィルタリング
   - 異常値の検出と除外
   - 評価者の信頼度に基づく重み付け

#### 3.1.2 評価者の信頼度スコアリング

1. **信頼度スコアの計算要素**
   - 作成したノートの評価（Writing Impact）
   - 他の評価者との評価一致度
   - 評価の一貫性
   - ハラスメント関連の評価履歴

2. **信頼度スコアの更新メカニズム**
   - 1時間ごとの定期的な再計算
   - 新規評価の即時反映
   - 異常検知による一時的なスコア調整
   - 長期的な評価傾向の考慮

3. **低信頼度評価者の扱い**
   - 信頼度スコアが閾値以下の場合は評価を除外
   - 段階的な重み付け（信頼度に比例）
   - 改善機会の提供（評価品質向上のためのフィードバック）
   - 一定期間後の再評価機会

### 4. ノートの表示順序と優先度の決定

#### 4.1 表示順序の決定要因

1. **ノートの状態による優先順位**
   - "Needs More Ratings"状態のノートを優先
   - 評価数が少ないノートを優先
   - 最近作成されたノートを優先

2. **評価者の多様性確保**
   - 異なる視点を持つ評価者への提示を優先
   - 評価者の言語・地域特性を考慮
   - 評価者の専門分野を考慮

3. **コンテンツの重要度**
   - 投稿の注目度（いいね、リポスト数）
   - トピックの緊急性や重要性
   - コミュニティからの要請度

#### 4.2 評価者タイプ別の表示戦略

1. **新規評価者向け**
   - 比較的合意の取れやすいノートから開始
   - 段階的な難易度の上昇
   - 即時フィードバックの提供

2. **経験豊富な評価者向け**
   - より複雑な判断が必要なノートの提示
   - 専門分野に関連するノートの優先提示
   - 評価の一貫性が高い分野のノート

3. **専門評価者向け**
   - 特定トピックの重要ノート
   - 緊急性の高いノート
   - コミュニティガイドラインの判断が必要なノート

### 5. システムの運用と最適化

#### 5.1 定期的な再学習と更新

1. **モデルの再学習**
   - 1時間ごとの定期的な再計算
   - 損失値が0.09を超えた場合の再トレーニング
   - バッチ処理による効率的な更新
   - 異常検知による緊急再計算

2. **スコアの安定性確保**
   - 2週間のステータスロック期間
   - 急激なスコア変動の抑制
   - 履歴データの重み付け保持
   - 異常値の自動検出と対応

3. **システムの監視と調整**
   - パフォーマンス指標のモニタリング
   - 評価者行動パターンの分析
   - モデルパラメータの自動調整
   - 異常検知システムの運用

#### 5.2 実装上の重要な設定値

1. **モデルパラメータ**
   - インターセプト正則化係数: λ = 0.15
   - 因子正則化係数: λ = 0.03
   - 評価タグ重み付け指数: 5
   - 最小評価数閾値: MAX(5, post_views/25000)

2. **運用パラメータ**
   - 再学習間隔: 1時間
   - 損失閾値: 0.09
   - ステータスロック期間: 2週間
   - 最小評価者数: 5名

3. **評価者関連の閾値**
   - 新規評価者の初期信頼度: 0.1
   - 信頼度スコアの最小閾値: 0.01
   - 専門評価者認定基準: 0.8以上の信頼度スコア
   - ペナルティ適用基準: ハラスメント評価で-0.5のペナルティ

### 6. 評価者の信頼度管理システム

#### 6.1 評価者スコアの計算と更新

1. **初期スコアと更新サイクル**
   - 新規評価者は0.1の初期スコアで開始
   - 1時間ごとの定期的なスコア更新
   - 評価活動に基づく動的な調整
   - 異常検知による即時スコア調整

2. **スコア更新の要素**
   - 他の評価者との評価一致度（重み: 0.6）
   - 作成したノートの評価（重み: 0.3）
   - コミュニティガイドライン遵守度（重み: 0.1）
   - ハラスメント関連のペナルティ

3. **信頼度の低い評価者の扱い**
   - 信頼度スコアが0.01未満の評価を除外
   - 3回連続で低評価の場合は一時的な評価停止
   - 改善プログラムへの参加機会提供
   - 6ヶ月後の再評価機会

#### 6.2 評価者の成長システム

1. **評価スキルの向上支援**
   - 段階的な難易度上昇
   - 即時フィードバックの提供
   - 評価パターンの分析レポート
   - メンタリングシステム

2. **専門評価者への昇格**
   - 0.8以上の信頼度スコア維持
   - 特定分野での高い評価一致率
   - コミュニティガイドラインの深い理解
   - メンタリング活動への参加

3. **ペナルティと改善機会**
   - ハラスメント評価で-0.5のペナルティ
   - 改善プログラムによるスコア回復
   - 段階的な評価権限の回復
   - コミュニティサポートの提供

### 7. 評価者スコアの技術的詳細

#### 7.1 スコア計算の主要コンポーネント

1. **評価者の信頼度スコア計算要素**
   ```python
   # helpfulness_scores.py より
   helpfulnessScores[c.aboveHelpfulnessThresholdKey] = (
     (helpfulnessScores[c.crhCrnhRatioDifferenceKey] >= minCRHVsCRNHRatio)
     & (helpfulnessScores[c.meanNoteScoreKey] >= minMeanNoteScore)
     & (helpfulnessScores[c.raterAgreeRatioKey] >= minRaterAgreeRatio)
     & (helpfulnessScores[c.raterAgreeRatioWithHarassmentAbusePenaltyKey] >= minRaterAgreeRatio)
   )
   ```

2. **主要な閾値パラメータ**
   - minMeanNoteScore: ノートの平均スコアの最小値
   - minCRHVsCRNHRatio: CRH/CRNHの比率の最小値
   - minRaterAgreeRatio: 評価一致率の最小値
   - minimumHarassmentScoreToPenalize: 2.0（ハラスメントペナルティの発動閾値）

3. **ハラスメント関連のペナルティ計算**
   ```python
   # helpfulness_scores.py より
   helpfulRatingsOnBadNotes[c.totalHelpfulHarassmentRatingsPenaltyKey] = (
     tagConsensusHarassmentHelpfulRatingPenalty *
     (helpfulRatingsOnBadNotes[c.harassmentNoteInterceptKey] / minimumHarassmentScoreToPenalize)
   )
   ```

#### 7.2 評価者の信頼度判定プロセス

1. **基本的な判定基準**
   - ノート作成の品質（meanNoteScore ≥ minMeanNoteScore）
   - 評価の一致度（raterAgreeRatio ≥ minRaterAgreeRatio）
   - CRH/CRNH比率（crhCrnhRatioDifference ≥ minCRHVsCRNHRatio）

2. **ペナルティの適用**
   - ハラスメント評価へのペナルティ: 10ポイント × (ハラスメントスコア / 2.0)
   - 評価一致率からペナルティを差し引いた最終スコア計算
   - 最終的な評価一致率が閾値以上であることを要求

3. **フィルタリングプロセス**
    ```python
    # helpfulness_scores.py より
    includedUsers = helpfulnessScores.loc[
      helpfulnessScores[c.aboveHelpfulnessThresholdKey].fillna(False),
      [c.raterParticipantIdKey]
    ]
    ```

### 8. 評価者の参加要件と閾値

#### 8.1 新規評価者の要件

1. **最小評価数要件**
   - 最低10件の評価が必要
   - 評価は作成後48時間以内のノートに対して行う必要がある
   - 評価対象のノートは最終的に"Helpful"または"Not Helpful"のステータスに到達している必要がある

2. **有効な評価の条件**
   - ノート作成後48時間以内の評価のみが有効
   - 2022年5月18日以前のノート：最初の5件の評価のみが有効
   - 2022年5月18日以降のノート：最初のステータス変更前の評価のみが有効

#### 8.2 評価者の信頼度基準

1. **基本的な閾値**
   - 評価者の信頼度スコア ≥ 0.66
   - ノート作成の平均スコア ≥ 0.05
   - CRH/CRNH比率 ≥ 0.0（5件のCRHノートごとに1件のCRNHノートまで許容）

2. **信頼度の低い評価者のカット基準**
   ```
   評価者信頼度スコア = (成功した有効評価数 - (10 × ハラスメント評価数)) / 総有効評価数
   ```
   - 信頼度スコアが0.66未満の評価者は第2ラウンドの評価から除外
   - ハラスメント評価には10倍のペナルティ
   - 削除されたノートの評価も考慮対象（2022年5月19日以降）

3. **評価者スコアの更新メカニズム**
   - 1時間ごとの定期的な再計算
   - 新規評価は即時反映
   - ハラスメント関連の評価は即時ペナルティ適用
   - 2週間のステータスロック期間中は変更不可

### 9. ソースコードと実装の詳細

#### 9.1 評価者の信頼度計算
`/home/ubuntu/repos/communitynotes/documentation/under-the-hood/contributor-scores.md:46-49`より：
```markdown
Rater Helpfulness is not defined until the contributor has made at least one valid rating (defined below). Then the Rater Helpfulness Score is equal to 

$$\frac{s - (10 * h)}{t}$$
```

#### 9.2 有効な評価の定義
`/home/ubuntu/repos/communitynotes/documentation/under-the-hood/contributor-scores.md:54-64`より：
```markdown
A "valid" rating is a rating that's eligible to be used in determining rater helpfulness scores. The idea is that to prevent manipulation, only ratings that were made before the rater could've known what the final note status label is are eligible. To be specific, valid ratings must be:

- Made within the first 48 hours of the note's creation
- A rating on a note that eventually ended up getting a Helpful or Not Helpful status
- If the note being rated was created before May 18, 2022:
  - Only the first 5 ratings on the note are valid
- If the note being rated was created on or after May 18, 2022:
  - To be valid, the rating must be made before the time of when the note received its first status besides Needs More Ratings
```

#### 9.3 評価のフィルタリング基準
`/home/ubuntu/repos/communitynotes/documentation/under-the-hood/contributor-scores.md:77-84`より：
```markdown
Community Notes does this by incorporating a subset of ratings in a second round of note scoring. Contributors' ratings are only included in the second round of note scoring if:

- They have made at least 10 total ratings (on notes that have at least 5 ratings) and have made at least 1 valid rating
- Their rater helpfulness score must be at least 0.66
- If they have written any notes that have received at least 5 ratings:
  - The CRH-vs.-CRNH ratio of notes they've authored must be at least 0.0
  - The mean note score of all notes they've written must be at least 0.05
```

### 10. ノートの表示順序と優先度システム

#### 10.1 「Needs Your Help」タブの表示基準
`/home/ubuntu/repos/communitynotes/documentation/under-the-hood/timeline-tabs.md:41-53`より：
```markdown
**Criteria related to the post on which the note is written:**

- Recency of the post (e.g. is it from within the last 6 hours, 24 hours, etc)
- Projected future Likes and Reposts the post will receive.
- The rater can see the post (for example, excludes posts from authors you've blocked)

**Criteria related to the note:**

- Written by an author with positive Writing Impact and a high ratio of Helpful notes
- Current status (e.g. "Needs More Ratings")
- Current helpfulness score (e.g. not a low helpfulness score, highly rated by initial raters)
- Does not have a large number of ratings
```

#### 10.2 ノートリクエストシステム
`/home/ubuntu/repos/communitynotes/documentation/under-the-hood/note-requests.md:19-25`より：
```markdown
During the note request pilot:
- Requests will show on a post if the number of requests on the post is greater than or equal to MAX(5, number of views on post / 25000)
- Requests will show for 24 hours
- For a post to show up in the Note Requests timeline, the post must be recent (less than 24 hours old)
```

#### 10.3 表示優先度の決定要因

1. **投稿の特性による優先度**
   - 投稿の新しさ（6時間以内、24時間以内など）
   - 予測されるエンゲージメント（いいね、リポスト数）
   - アクセス可能性（ブロックされていないこと）

2. **ノートの品質指標**
   - 作成者の信頼度（Writing Impactとヘルプフルノートの比率）
   - 現在のステータス（"Needs More Ratings"など）
   - 初期評価者からの評価スコア
   - 総評価数（少ない方が優先）

3. **リクエストベースの優先度**
   - リクエスト数の閾値: MAX(5, 閲覧数/25000)
   - 表示期間: 24時間
   - 投稿の新しさ: 24時間以内

4. **スパム対策**
   `/home/ubuntu/repos/communitynotes/documentation/under-the-hood/timeline-tabs.md:49-50`より：
    ```markdown
    - If the note contains terms that contributors have reported as sometimes overwhelming the Needs Your Help tab ("spam", "scam", "gambling", "dropship", "drop ship", "promotion") it will have a lower probability of appearing
    ```

### 11. 評価者の信頼度がノート表示に与える影響

#### 11.1 信頼度スコアの影響メカニズム

1. **評価の重み付け**
   ```python
   # helpfulness_scores.py より
   helpfulnessScores[c.raterAgreeRatioWithHarassmentAbusePenaltyKey] = (
     helpfulnessScores[c.ratingAgreesWithNoteStatusKey]
     - helpfulnessScores[c.totalHelpfulHarassmentRatingsPenaltyKey]
   ) / helpfulnessScores[c.ratingCountKey]
   ```

2. **第2ラウンドの評価フィルタリング**
   - 最低10件の評価実績が必要
   - 信頼度スコア0.66以上が必要
   - ノート作成者の場合：
     - CRH/CRNH比率 ≥ 0.0
     - 平均ノートスコア ≥ 0.05

#### 11.2 信頼度による表示制御

1. **新規評価者の制限**
   - 最初の48時間以内の評価のみが有効
   - 最初の5件の評価までが重要
   - ステータス変更前の評価のみカウント

2. **ハラスメント対策**
   - ハラスメント評価には10倍のペナルティ
   - 評価スコア = (成功評価数 - (10 × ハラスメント評価数)) / 総評価数
   - 最低スコア閾値: 0.66

3. **評価者スコアの更新サイクル**
   - 1時間ごとの定期的な再計算
   - ハラスメント関連は即時反映
   - 2週間のステータスロック期間

4. **表示優先度への影響**
   - 高信頼度評価者のノートが優先表示
   - 低信頼度評価者の評価は第2ラウンドから除外
   - スパム/ハラスメント評価は表示確率を低下

#### 3.1.2 行列分解の最適化と正則化

行列分解モデルは、以下の最適化プロセスを通じて学習されます：

1. **目的関数**
   - 二乗誤差の最小化: Σ(r_{un} - r̂_{un})²
   - 正則化項の追加: λ(||iᵤ||² + ||iₙ||² + ||fᵤ||² + ||fₙ||²)
   - インターセプト項の強い正則化（λ = 0.15）
   - 因子項の弱い正則化（λ = 0.03）

2. **最適化プロセス**
   - 確率的勾配降下法による学習
   - バッチサイズの動的調整
   - 学習率のスケジューリング
   - 早期停止による過学習防止

3. **正則化の効果**
   - インターセプトの強い正則化によるバイアス抑制
   - 因子の弱い正則化による表現力の確保
   - 極端な予測値の抑制
   - モデルの汎化性能の向上

#### 3.1.3 複数モデルの統合システム

Community Notesは、以下の4つの異なるモデルを組み合わせて最終的な信頼度スコアを計算します：

1. **Coreモデル（基本モデル）**
   予測評価値: r̂_{un} = μ + iᵤ + iₙ + fᵤ·fₙ
   - μ: グローバル平均（全体の評価傾向）
   - iᵤ: 評価者uのインターセプト（評価者の一般的な評価傾向）
   - iₙ: ノートnのインターセプト（ノートの一般的な評価されやすさ）
   - fᵤ: 評価者uの1次元因子ベクトル（評価者の視点を表現）
   - fₙ: ノートnの1次元因子ベクトル（ノートの特徴を表現）

2. **Expansionモデル（拡張モデル）**
   - より広範な評価者グループのデータを使用
   - データ拡張による予測精度の向上
   - 新規評価者の意見も考慮

3. **Groupモデル（グループモデル）**
   - 言語や地域ごとの評価傾向を考慮
   - グループ特有のバイアスを調整
   - コミュニティ特性を反映

4. **Topicモデル（トピックモデル）**
   - トピックごとの専門性を考慮
   - 特定分野での評価者の信頼性を反映
   - トピック特有の評価パターンを学習

#### 3.1.3 モデル統合プロセス
1. **重み付け**
   - 各モデルの予測信頼性に基づく重み付け
   - データ量に応じた重み調整
   - モデルの特性に基づく優先順位付け

2. **スコア統合**
   - 加重平均による基本スコアの計算
   - 極端な予測値の調整
   - 信頼度に基づくフィルタリング

3. **最終判定**
   - 統合スコアに基づくステータス決定
   - 時間経過による安定性の確保
   - コミュニティフィードバックの反映

2. **1次元因子ベクトルの意味**
   - 評価者とノートを同じ1次元空間上に配置
   - 距離が近いほど評価が一致する傾向
   - 極端な意見の評価者は空間の端に配置される傾向

3. **インターセプトの役割**
   - 高いノートインターセプト → 多くの評価者から支持
   - 低いノートインターセプト → 評価が分かれる傾向
   - インターセプトの正則化により極端なバイアスを抑制

#### 3.1.2 正則化と最適化
- インターセプト項の正則化係数: λ = 0.15
- 因子項の正則化係数: λ = 0.03
- インターセプトの強い正則化により、極端なバイアスを抑制

#### 3.1.3 複数モデルの組み合わせ
以下の4つのモデルを組み合わせて最終判断を行います：
1. Coreモデル: 基本的な評価予測
2. Expansionモデル: データ拡張による予測
3. Groupモデル: グループベースの予測
4. Topicモデル: トピックごとの予測

#### 3.1.4 評価タグの重み付け
- タグ重み: a_{un} = 1 / (1 + (||fᵤ - fₙ|| / f̃)⁵)
- 評価者とノートの因子ベクトル間の距離に基づく重み付け
- 5乗の指数により、極端な乖離を効果的に検出

#### 3.1.5 定期的な再学習
- 1時間ごとの再学習
- 損失しきい値（0.09）超過時の再トレーニング
- リアルタイム性と安定性のバランスを考慮

### 3.2 評価者の多様性の確保

Community Notesシステムは、異なる視点を持つ評価者からの評価を効果的に収集・統合するために、以下の仕組みを採用しています：

#### 3.2.1 評価者の選択
- 異なる視点を持つ評価者からの評価を優先的に収集
- ノート作成者と既評価者を除外したランダムな評価者選択
- 通知頻度は評価者の個人設定に依存

#### 3.2.2 評価の重み付け
- 評価者の信頼度スコアに基づく重み付け
- Writing Impactとhelpfulノート比率による評価者の信頼性評価
- 極端な視点の評価者間のコンセンサスを重視

#### 3.2.3 ノートの表示条件
以下の条件を満たすノートが優先的に表示されます：
- 投稿の新しさ（6時間以内、24時間以内など）
- 予測される「いいね」と「リポスト」数が高い
- スパム関連用語を含まないノート
- 現在の信頼度スコアが一定以上

参照: `/documentation/under-the-hood/timeline-tabs.md`

#### 3.2.4 複数モデルの統合
4つの異なるモデルの出力を組み合わせることで、多様な視点を反映します：

1. **Coreモデル**
   - 基本的な評価予測を担当
   - 一般的な信頼度スコアの計算

2. **Expansionモデル**
   - データ拡張による予測
   - より広い範囲の評価者の意見を反映

3. **Groupモデル**
   - グループベースの予測
   - 特定のコミュニティや言語グループの特性を考慮

4. **Topicモデル**
   - トピックごとの予測
   - 特定の話題に対する専門性を反映

これらのモデルの組み合わせにより、単一の視点に偏ることなく、多様な評価者の意見を反映したスコアリングを実現しています。

## 4. ノートのランキングと表示の仕組み

### 4.1 ランキングの基本原則
- コミュニティ主導の評価システム
- X従業員はルール違反を除き、個別のノート表示判断に関与しない
- ガードレールや回路遮断条件が発動した場合でも、コミュニティの判断を優先

### 4.2 表示タイムライン
- "Needs More Ratings"ノートは新しい順に表示
- "Helpful"/"Not Helpful"ノートは信頼度スコアに基づいて表示
- 各タイムラインで異なる表示基準を適用

### 4.3 評価者への通知システム
- 評価が必要なノートのプレビューを表示
- 高い注目を集める投稿への評価要請通知
- 通知頻度は評価者の設定に応じて調整

## 5. 既知の制限事項と未解決の課題

### 5.1 技術的な制限
- フロントエンドの実装詳細は公開されていない可能性あり
- 評価者の経験レベルによる表示の違いの詳細は不明確
- 複数モデル（Core/Expansion/Group/Topic）の統合ロジックの詳細は未公開

### 5.2 運用上の課題
- スパム対策とコンテンツ品質の両立
- 多様な視点の確保と極端な意見の抑制のバランス
- リアルタイム性と安定性のトレードオフ

参照: `/documentation/under-the-hood/ranking-notes.md`

## 参考文献
1. `/documentation/under-the-hood/timeline-tabs.md`
2. `/documentation/under-the-hood/note-requests.md`
3. `/documentation/contributing/notes-on-twitter.md`
4. `/documentation/under-the-hood/contributor-scores.md`
