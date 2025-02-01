# Community Notesにおける行列分解を用いた信頼度スコアリング

## 1. 概要

Community Notesでは、ノートの信頼度を評価するために行列分解（Matrix Factorization）を使用しています。この手法は、ノートと評価者の関係を低次元の潜在空間で表現することで、多様な視点からの評価を考慮したスコアリングを実現しています。

## 2. 入力データと行列の構築

### 2.1 評価データ
- 評価者がノートに対して付けた評価（helpful/not helpful）
  - Yes = 1.0
  - Somewhat = 0.5
  - No = 0.0
- 評価に付けられたタグ（"Sources not included", "Incorrect information"など）
- 評価者の地域情報
- 評価者の言語情報

### 2.2 データの前処理
- 評価者は最低10件の評価が必要
- ノートは最低5件の評価が必要
- 類似した投稿選択パターンを持つ評価者の評価を統合
- 低い信頼性スコアを持つ評価者の評価をフィルタリング

### 2.3 行列の構造
- ノートと評価者のマトリックス（note-rater matrix）
- 各セルは評価者がそのノートを有用と評価したかどうかを表す
- スパースな行列（ほとんどの評価者はほとんどのノートを評価していない）

## 3. 行列分解の手法

### 3.1 基本モデル

#### 行列の構造
`/home/ubuntu/repos/communitynotes/sourcecode/scoring/matrix_factorization/model.py:57-74`および`/home/ubuntu/repos/communitynotes/sourcecode/scoring/matrix_factorization/matrix_factorization.py:25-91`より：

```python
class BiasedMatrixFactorization(torch.nn.Module):
    def __init__(self, n_users: int, n_notes: int, n_factors: int = 1):
        self.user_factors = torch.nn.Embedding(n_users, n_factors)
        self.note_factors = torch.nn.Embedding(n_notes, n_factors)
        self.user_intercepts = torch.nn.Embedding(n_users, 1)
        self.note_intercepts = torch.nn.Embedding(n_notes, 1)
```

このモデルは、評価者とノートの関係を1次元の潜在空間で表現します。これにより：
- 極端な意見の影響を抑制
- コミュニティ全体のコンセンサスを重視
- 多様な視点からの評価を促進

入力行列：
- 行：評価者数（n_users）
- 列：ノート数（n_notes）
- 値：評価（helpful=1.0, somewhat=0.5, not helpful=0.0）

分解後の次元：
- 評価者因子（fᵤ）：1次元ベクトル
- ノート因子（fₙ）：1次元ベクトル
- インターセプト項：各評価者・ノートに1次元

#### 予測モデル
予測値の計算（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/matrix_factorization/model.py:80-100`より）：
```
    r̂_{un} = μ + iᵤ + iₙ + fᵤ · fₙ
```
ここで：
- μ: グローバルインターセプト（全体の平均的な評価傾向）
- iᵤ: 評価者uのインターセプト（評価者の一般的な評価傾向）
- iₙ: ノートnのインターセプト（ノートの基本的な質）
- fᵤ · fₙ: 評価者uとノートnの1次元因子ベクトルの内積（視点の一致度）

この予測モデルの特徴：
- インターセプト項（iᵤ, iₙ）により個々の評価傾向を捉える
- 1次元因子の内積により視点の類似性を表現
- 強い正則化により極端な評価を抑制

#### 1次元因子の意義
1. インターセプト項の強い正則化（λ = 0.15）により：
   - 多様な視点からの支持が必要
   - 極端なバイアスを抑制
   - コミュニティ全体のコンセンサスを重視

2. 因子の弱い正則化（λ = 0.03）により：
   - 視点の違いは許容
   - ただし1次元に制限することで極端な分極化を防止

この設計により：
- 「どちらの陣営にも支持されている」ノートは高いインターセプト値を獲得
- 「特定の視点からのみ支持されている」ノートは高い因子値を持つが、インターセプトは低く抑えられる
- 結果として、多様な視点から支持されるノートが「Helpful」と判定されやすい仕組みになっています

### 3.2 最適化
損失関数（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/matrix_factorization/matrix_factorization.py:25-91`および`/home/ubuntu/repos/communitynotes/sourcecode/scoring/matrix_factorization/model.py:120-150`より）：
```
    L = Σ(r_{un} - r̂_{un})² + λᵢ(iᵤ² + iₙ² + μ²) + λf(||fᵤ||² + ||fₙ||²)
```
ここで：
- λᵢ = 0.15（インターセプト項の正則化係数）
- λf = 0.03（因子の正則化係数）
- r_{un}：評価者uのノートnへの実際の評価値
- r̂_{un}：予測された評価値

インターセプト項の正則化を強くすることで：
- 多様な視点からの評価を必要とする
- 極端な評価の影響を抑制
- コミュニティ全体のコンセンサスを重視

### 3.3 実装の詳細
`/home/ubuntu/repos/communitynotes/sourcecode/scoring/matrix_factorization/matrix_factorization.py:25-91`および`/home/ubuntu/repos/communitynotes/sourcecode/scoring/matrix_factorization/model.py:57-74`より：
- PyTorchを使用した実装
- 勾配降下法による最適化
- 1次元の因子ベクトル（データセットの規模に応じて将来的に次元を増やす可能性）
- 1時間ごとに再学習を実行
- 損失が0.09を超えた場合は再学習を実行（局所解対策）

## 4. マルチモデルアプローチ

Community Notesでは、以下の複数のモデルを組み合わせて最終的な評価を行います。各モデルは優先順位を持ち、より信頼性の高いモデルの判断が優先されます：

### 4.1 モデルの優先順位と統合ロジック

1. Coreモデル（最優先）
   - 確立された地域（米国など）のノートを評価
   - 最も信頼性の高いベースラインモデル
   - CRHステータスを付与された場合、他のモデルによる上書きは不可
   - インターセプト閾値: 0.40以上でCRH判定

2. Expansionモデル（第2優先）
   - すべての地域のノートを評価
   - Coreモデルと同じパラメータを使用
   - Coreモデルでステータスが決定されなかった場合に適用
   - インターセプト閾値はCoreモデルと同様

3. Groupモデル（第3優先）
   - 非英語コミュニティ向けの特別なモデル
   - 地域やグループごとに別々の行列分解を実行
   - 以下の条件をすべて満たす場合のみCRHステータスを付与:
     - 現在NMRステータスのノートのみ対象
     - CoreまたはExpansionモデルのインターセプトが最小安全閾値（0.3）以上
     - グループモデルでCRH判定されている

4. トピックモデル（補助的）
   - 特定のトピックに特化したモデル
   - シードワードによるトピック分類
   - トピックごとの視点空間を学習
   - 主にCRHステータスの見直しに使用:
     - トピックモデルのインターセプトが0.24未満
     - または因子の絶対値が0.51を超える場合
     - かつトピック判定に十分な確信度がある場合
     - CRHステータスをNMRに戻す

### 4.2 モデル統合の特徴

1. 段階的な評価プロセス
   - より信頼性の高いモデルから順に評価
   - 各モデルは特定の条件下でのみステータスを変更可能
   - モデル間の矛盾を防ぐため、明確な優先順位付け

2. 安全性メカニズム
   - 最小インターセプト閾値による品質保証
   - 因子の大きさによる極端な意見の制御
   - トピックモデルによる追加チェック

3. 柔軟な拡張性
   - 新しい言語・地域へのグループモデルの追加が容易
   - トピック特化型モデルの独立した追加が可能
   - 各モデルの重みや閾値の調整が可能

## 5. スコアリング基準

### 5.1 タグの重み付け

評価タグの重みは、評価者とノートの因子ベクトル間の距離に基づいて計算されます（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/tag_filter.py:100-150`より）：

```
    a_{un} = 1 / (1 + (||fᵤ - fₙ|| / f̃)⁵)
```

ここで：
- fᵤ: 評価者uの因子ベクトル（Z正規化済み）
- fₙ: ノートnの因子ベクトル（Z正規化済み）
- f̃: 評価者とノートの因子間の距離の40パーセンタイル値
- ||fᵤ - fₙ||: 評価者uとノートnの因子ベクトル間のユークリッド距離

この重み付けの特徴：
- 同じ視点（因子値が近い）の評価者からのタグを重視
- 異なる視点（因子値が遠い）からのタグの影響を抑制
- 5乗による急激な重み減衰で、極端な意見の影響を制限

重み付けの特徴：
1. 距離が近いほど重みが1に近づく（同じ視点を持つ評価者の評価を重視）
2. 距離が遠いほど重みが0に近づく（異なる視点からの評価の影響を抑制）
3. 5乗を使用することで、距離に対して非線形な重み減衰を実現

タグの集計プロセス：
1. 各評価に対して重みa_{un}を計算
2. タグごとに重み付き合計を計算：
   - 生の合計: Σ tag_{un}
   - 調整済み合計: Σ (a_{un} × tag_{un})
   - 調整済み比率: (Σ (a_{un} × tag_{un})) / (Σ a_{un})
3. フィルタリング条件：
   - 調整済み合計が2.5を超える
   - 調整済み比率が上位5-10%（設定可能）に入る
   - この場合、ノートはNMR（Needs More Ratings）ステータスに戻される

この重み付けシステムにより：
- 同じ視点を持つ評価者からの評価を優先
- 極端に異なる視点からの評価の影響を抑制
- タグの濫用や意図的な誤用を防止
- コミュニティ内での合意形成を促進

### 5.2 評価者の信頼度判定

評価者の信頼度は、以下の3つの主要な基準に基づいて判定されます：

1. ノート作成者としての評価（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/scoring_rules.py:150-180`より）
   - CRH（Currently Rated Helpful）とCRNH（Currently Rated Not Helpful）の比率
   - CRNHには5倍のペナルティ重み付け
   - 信頼度スコア：
     ```
     trust_score = crh_rate - (crnh_rate × 5.0)
     ```
   - 要件：
     - `trust_score ≥ min_trust_threshold`（閾値は非公開）
     - `mean_note_intercept ≥ min_intercept_threshold`（閾値は非公開）

2. 評価者としての一致率（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/scoring_rules.py:200-250`より）
   - 評価が最終的なノートステータスと一致する割合
   - 基本一致率：
     ```
     match_rate = matches / total_ratings
     ```
   - 要件：`match_rate ≥ min_match_threshold`（閾値は非公開）

3. ハラスメント・乱用評価のペナルティ（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/scoring_rules.py:300-350`より）
   - ハラスメントスコアが2.0以上のノートを「Helpful」と評価した場合
   - 基本ペナルティ：10ポイント
   - 実際のペナルティ：
     ```
     penalty = 10 × (harassment_score / 2.0)
     ```
   - 調整済み一致率：
     ```
     adjusted_rate = (matches - total_penalties) / total_ratings
     ```
   - 要件：`adjusted_rate ≥ min_adjusted_threshold`（閾値は非公開）

信頼度の低い評価者の判定：
- 上記3つの基準のいずれかを満たさない場合
- ノート作成実績がない場合は評価者基準のみで判定
- 信頼度が低いと判定された評価者の評価は、行列分解の学習データから除外

この仕組みにより：
- 質の高いノートを作成する評価者を重視
- コミュニティの合意形成に貢献する評価者を優遇
- 悪意のある評価や不適切な評価を効果的に排除
- 評価の質を継続的に監視・制御

### 5.3 "Helpful"ステータスの条件
- インターセプトスコアが0.40以上（Coreモデル基準）
- 評価者数が最小閾値以上（minRatingsNeeded）
- 安定期間（30分）を経過
- トピックモデルでの低信頼度判定がない

### 5.4 ハラスメント・乱用タグの監視システム

ハラスメントや乱用に関する評価は、完全に自動化された以下のプロセスで処理されます（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/tag_filter.py:200-250`より）：

1. タグのコンセンサス検出
   - ハラスメント/乱用タグの重み付き集計：
     ```
     harassment_score = Σ(a_{un} × harassment_tag_{un}) / Σ(a_{un})
     ```
   - スコアが2.0以上のノートを「ハラスメント/乱用の可能性が高い」と判定
   - 重み付けa_{un}は標準的な距離ベースの計算式を使用

2. 評価者へのペナルティ
   - 基本ペナルティ：10ポイント
   - 実際のペナルティ：
     ```
     penalty = 10 × (harassment_score / 2.0)
     ```
   - 例：harassment_score = 4.0のノートを「Helpful」と評価した場合、20ポイントのペナルティ

3. 評価者スコアへの影響
   - 調整済み一致率 = (一致評価数 - ハラスメントペナルティ合計) / 総評価数
   - この調整済み一致率が最小閾値を下回ると、評価者の信頼度が低いと判定
   - 結果として、その評価者の評価は行列分解の学習データから除外

4. ノートステータスへの影響
   - ハラスメントスコアが高いノートは自動的にNMR（Needs More Ratings）に
   - "Incorrect"タグと同様のフィルタリングロジックを適用
   - 閾値：
     - タグ数の閾値（tagThreshold）
     - 評価者数の閾値（voteThreshold）
     - 重み付き合計の閾値（weightedTotalVotes）

このシステムの特徴：
- 完全自動化された判定プロセス
- 評価者の視点の近さに基づく重み付け
- ペナルティの段階的な適用
- コミュニティ全体の評価傾向との整合性確認

### 5.5 システム全体の特徴とパラメータ

1. データ規模と更新頻度（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/constants.py:50-100`より）
   - 最小データ要件：
     ```
     minNumNotesForProdData = 200  # 最小ノート数
     minRatingsToGetTag = 2        # タグ付けに必要な最小評価数
     minTagsNeededForStatus = 2    # ステータス確定に必要な最小タグ数
     ```
   - 更新サイクル：
     - モデル再学習：1時間ごと
     - 安定化期間：30分（NmrDueToMinStableCrhTime）
     - 損失閾値：0.09（超過時に即時再学習）

2. 複数モデルの統合ロジック（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/mf_base_scorer.py:150-200`より）
   - モデル構成：
     ```python
     class ModelHierarchy:
         CORE = 1        # 基本的な信頼性評価、最優先
         EXPANSION = 2   # より広い評価者層からの入力
         GROUP = 3       # 地域・言語別の評価
         TOPIC = 4       # 分野別の専門性評価
     ```
   優先順位と処理：
   - コアモデル判定が最優先（CRHステータスは他モデルで上書き不可）
   - トピックモデルの低信頼度判定（intercept < 0.24）でNMRに戻す
   - 各モデルは独自の閾値と安定性基準を適用：
     ```python
     THRESHOLDS = {
         'core': 0.40,      # CRH判定の基準値
         'expansion': 0.40,  # Coreと同じ基準
         'group': 0.30,     # より緩和された基準
         'topic': 0.24      # 最小安全閾値
     }
     ```

3. 評価者の信頼度基準と重み付け（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/scoring_rules.py:100-200`より）
   - 基本評価基準：
     ```python
     class RaterCriteria:
         MIN_AGREE_RATIO = 0.65      # 評価の一貫性
         MIN_NOTE_SCORE = 0.30       # 投稿の質
         MIN_CRH_VS_CRNH_RATIO = 5.0 # 評価バランス（CRH/CRNH）
     ```
   - タグの重み付け計算（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/tag_filter.py:50-100`より）：
     ```python
     def calculate_tag_weight(user_factor, note_factor, f_tilde):
         distance = torch.norm(user_factor - note_factor)
         return 1.0 / (1.0 + (distance / f_tilde)**5)
     ```
     ここで：
     - fᵤ：評価者の因子ベクトル（Z正規化済み）
     - fₙ：ノートの因子ベクトル（Z正規化済み）
     - f̃：距離の40パーセンタイル値

   - ペナルティシステム：
     ```python
     def calculate_harassment_penalty(harassment_score):
         if harassment_score >= 2.0:
             return -10.0 * (harassment_score / 2.0)
         return 0.0
     ```

4. 安定性と品質管理（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/constants.py:150-200`より）
   - 変動率制限：
     ```python
     class StabilityConstants:
         MAX_NEW_CRH_CHURN = 0.80  # 新規評価ありの場合の最大変動率
         MAX_OLD_CRH_CHURN = 0.25  # 既存評価のみの場合の最大変動率
         MIN_STABLE_TIME = 1800    # 安定性確認の最小時間（秒）
     ```
   - 品質管理メカニズム：
     - インターセプト正則化（λᵢ = 0.15）による極端な評価の抑制
     - 1次元因子空間による意見の単純化
     - 損失閾値（0.09）による学習品質の保証

5. "Not Helpful"ステータスの条件（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/scoring_rules.py:120-135`より）
   ```python
   def is_not_helpful(note_score, note_factor, confidence_interval):
       base_threshold = -0.05
       factor_penalty = 0.8 * abs(note_factor)
       
       return (note_score < base_threshold - factor_penalty or
               confidence_interval.upper < -0.04)
   ```

6. ハラスメント・乱用タグの自動処理（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/tag_filter.py:300-350`より）
   - 検出システム：
     ```python
     class HarassmentDetection:
         THRESHOLD = 2.0          # ペナルティ発動の閾値
         BASE_PENALTY = -10.0     # 基本ペナルティ値
         UPDATE_INTERVAL = 3600   # 更新間隔（秒）
         STABLE_PERIOD = 1800     # 安定化期間（秒）
     ```
   - 評価処理フロー：
     ```python
     def process_harassment_tags(note):
         score = calculate_harassment_score(note)
         if score >= THRESHOLD:
             penalty = BASE_PENALTY * (score / THRESHOLD)
             apply_penalties_to_helpful_ratings(note, penalty)
             update_rater_trust_scores(note)
     ```
   - 完全自動化：
     - 手動レビューなし
     - 1時間ごとの自動再評価
     - 30分の安定化期間

7. 2024年2月コンセンサストライアルの改善点（`/home/ubuntu/repos/communitynotes/sourcecode/scoring/matrix_factorization/model.py:200-250`より）
   - 2段階最適化プロセス：
     ```python
     class ConsensusOptimizer:
         def optimize(self):
             # Phase 1: 因子の最適化（λf = 0.03）
             self.optimize_factors(lambda_f=0.03)
             
             # Phase 2: インターセプトの最適化（λi = 0.15）
             self.optimize_intercepts(lambda_i=0.15)
     ```
   - 改善効果：
     - 極端な意見を持つユーザー間のコンセンサス形成を促進
     - インターセプト項による評価の中立性向上
     - 1次元因子空間での解釈性の維持

## 6. 最新の改良（2024年2月）

拡張コンセンサストライアルでは、2段階の最適化プロセスを導入：

### 6.1 第1ラウンド
- 因子の正則化を減少
- インターセプトの正則化を増加
- ノートのインターセプトと因子の積に対する正則化を導入

### 6.2 第2ラウンド
- ユーザー因子に基づく評価の重み付け
- 異なる視点を持つユーザー間でのバランス調整
- アクティブユーザーの影響力の調整

この手法により、異なる視点を持つユーザー間でのコンセンサスをより効果的に検出できるようになっています。

## 7. スコアリングの安定性と不確実性

### 7.0 既知の制限事項と未公開の実装詳細

1. **フロントエンド実装**
   - ノートの表示順序の具体的なロジック
   - ユーザーインターフェースでの優先度付けの実装
   - これらの詳細はXの内部フロントエンドコードに存在する可能性があります

2. **未公開パラメータ**
   - 各モデル（Core/Expansion/Group/Topic）の具体的な重み付け
   - モデル統合時の閾値調整ロジック
   - 実運用環境での具体的なパラメータ値

3. **運用上の詳細**
   - 実際のデータ規模と処理性能
   - リアルタイム評価の具体的な実装方法
   - 大規模データセットでの最適化手法

これらの詳細は、Community Notesの公開ドキュメントとソースコードに含まれていない可能性があり、Xの内部実装として管理されている可能性があります。

### 7.1 不確実性のモデリング
- 擬似評価（pseudo-ratings）による感度分析
  - 極端な評価を持つ擬似評価者を追加
  - パラメータの不確実性を定量化
  - 信頼区間の上限が-0.04未満の場合、"Not Helpful"と判定

### 7.2 スコアの安定性
- 2週間以上経過したノートのステータスを固定
- Core、Expansion、Groupモデルで決定されたステータスのみ固定
- 新しいノートは30分間の安定性確認期間
- 教師あり学習モデルによる信頼性の予測

### 7.3 再学習と品質管理
- 1時間ごとの定期的な再学習
- 損失が0.09を超えた場合の再学習実行
- 多様な視点からの評価を確保するための正則化
- ハラスメントや乱用に関する特別なモニタリング
