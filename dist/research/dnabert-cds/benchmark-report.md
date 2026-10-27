# Completed CDS benchmark: results and verification

Recorded 27 October 2026. Repository: Zelun-He/gene_classifier_project.

## Main finding

Under the prespecified short fine-tuning protocol, CDS fine-tuning did not establish an improvement over sequence-composition baselines or frozen DNABERT. Mean outer-fold balanced accuracy was 55.68% on stratified gene splits and 53.31% on similarity-grouped splits. These findings describe this experiment; they do not establish that DNABERT cannot improve with a different independently evaluated training design.

## Experiment

- 809 CDS genes: 441 oncogenes (OG), 368 tumor suppressor genes (TSG).
- Two split settings, each with five outer folds and three inner folds. Identical gene/fold assignments across the six models.
- 40 fresh neural fits: 30 inner fits and 10 outer refits; one learning-rate candidate.
- Pristine pretrained DNA_bert_6 initialization; fresh linear classification head for each fit. Legacy checkpoint-916 was excluded by the recorded initialization policy.
- AdamW, learning rate 2e-5, weight decay 0.01, gradient clipping 1.0, gene batch size 4, window microbatch size 2, seed 42.
- Inner fits ran two epochs. Select the earliest epoch maximizing inner-validation balanced accuracy at threshold 0.5; choose the decision threshold from selected-epoch inner out-of-fold predictions. Outer refit duration is the ceiling of the median selected inner epoch.
- Classical predictions were reused from the audited reference archive; frozen embeddings and fine-tuning used the recorded Mac MPS backend.

## Results

Mean outer-fold balanced accuracy (%), with conditional 95% bootstrap intervals.

| Model | Stratified genes | Similarity grouped |
|---|---:|---:|
| Class prior | 50.00 [50.00, 50.00] | 50.00 [50.00, 50.00] |
| Length/GC logistic regression | 55.75 [52.60, 58.98] | 55.18 [51.51, 58.62] |
| 3-mer logistic regression | 57.79 [54.41, 61.08] | 56.50 [53.01, 59.94] |
| 6-mer logistic regression | 59.95 [56.54, 63.17] | 54.47 [50.87, 57.68] |
| Frozen DNABERT + linear probe | 56.44 [52.99, 59.63] | 56.16 [52.43, 59.57] |
| Fine-tuned DNABERT (CDS) | 55.68 [52.34, 59.05] | 53.31 [49.98, 56.74] |

## Paired comparisons

Fine-tuned DNABERT minus comparator, in percentage points of mean outer-fold balanced accuracy. Negative values favor the comparator.

| Comparator | Stratified difference [95% interval] | Grouped difference [95% interval] |
|---|---:|---:|
| Frozen DNABERT + linear probe | -0.75 [-4.522, +3.315] | -2.85 [-6.848, +1.658] |
| 3-mer logistic regression | -2.11 [-5.831, +1.763] | -3.19 [-7.016, +0.529] |
| 6-mer logistic regression | -4.27 [-8.412, +0.002] | -1.16 [-5.634, +3.488] |
| Length/GC logistic regression | -0.07 [-3.620, +3.599] | -1.87 [-5.489, +1.868] |

Every listed paired balanced-accuracy interval includes zero. No superiority or equivalence is established. The best observed classical models were 6-mer features on stratified splits and 3-mer features on grouped splits; choosing the best observed comparator is descriptive.

## Verification performed on the submitted archive

- All 14 run-manifest artifact hashes match the submitted files.
- Exactly 40 unique fit records; all record strict model loading and a changed encoder hash after training.
- All saved partitions cover the same 809 genes, with no gene overlap between training, validation, and test sets. Similarity-grouped partitions also have no recorded homology-group overlap.
- Each fit’s saved training and validation IDs match its partition; class counts and class-balanced weights match training labels.
- Selection gene IDs match outer-training genes; saved final epoch counts match the median inner-epoch rule.
- All six models have exactly one prediction per gene per setting: 9,708 prediction rows in total, including 1,618 fine-tuned predictions. Labels, groups, and outer-fold assignments agree across models.
- All probabilities are finite and in [0, 1]; saved predictions match their saved thresholds. Mean fold balanced accuracy was independently recomputed for every model and setting.
- The runner’s audit reports passed; its on-device validation record is retained.

These are checks of submitted evidence. The full training was not rerun, binary learned checkpoints were not included in the submitted archive, and the biological clustering was not independently regenerated for this documentation. Hash agreement establishes internal consistency, not external authentication.

## Uncertainty and interpretation limits

- 2,000 paired bootstrap resamples, seed 42. Resampling units are genes for stratified splits and 673 homology components for grouped splits.
- Intervals condition on fitted models, selected epochs, thresholds, and the frozen splits. They exclude variation from rerunning training, random seeds, or rebuilding the dataset.
- Pairwise intervals are exploratory and are not adjusted for multiple comparisons.
- The two-epoch, single-learning-rate budget is limited. These results are not evidence that longer or broader tuning would succeed. Any revised protocol should be specified before additional evaluation.
- The grouped fine-tuning balanced-accuracy interval reaches chance performance (49.98%–56.74%); evidence of transfer to unseen homology groups is weak under this protocol.
- MPS was the recorded local numerical backend. CPU/MPS bitwise equivalence is not claimed.

## Provenance

- Source archive SHA-256: `9ad55d1b924812840b229206db1fcf81d41e8fd8cc3f318ee44328e18b8c5332`
- Run identity: `f725005e5126dcf152bbca9bb21c1b7644ef9cbf2014640f60a13ad69a3f1afa`
- Base repository commit: `132253d7557c87db2c755b6f85a7078005029490`
- Pretrained source: `pristine_zhihan1996_DNA_bert_6_a79a8fd96ad172f964a4dbef3f4d7545a5034baa`
- Launcher SHA-256: `54aebca1746a3e4afc697107b51d4fb54bb442d6144a92f11a268dd4595eb284`
- Frozen split SHA-256: `74ff6611274081d3aea28e1888d21fe5541145f99d90d0d4b6ec8f7bd43f7bdf`
- Runtime: Python 3.12.16, PyTorch 2.9.1, Transformers 4.57.1, Apple arm64/MPS; deterministic algorithms enabled in the saved configuration.

## Remaining work

1. Preserve the original completed runs/mac-cds-v1 directory and its checkpoints. The submitted mac-cds-results.zip already preserves the lightweight result evidence.
2. Incorporate this result and its limitations into the project’s research documentation. This report has not been published to GitHub.
3. Before the 120-fit paired experiment, freeze the common gene cohort, confirm CDS/promoter/genomic coverage and group-safe folds, and retain identical tuning budgets across inputs.
4. Run the paired benchmark in a separate output directory, then audit its predictions and report paired input differences with uncertainty. Do not substitute the current 809-gene CDS scores for a matched-cohort CDS arm: a changed cohort or training folds requires new fits.
5. Treat any expanded epoch budget or learning-rate search as a separate experiment, with a declared evaluation plan and appropriate protection against repeated test-driven tuning.

## Suggested manuscript wording

“In a nested five-fold CDS benchmark of 809 genes, fine-tuned DNABERT achieved mean balanced accuracy of 55.68% (conditional 95% bootstrap interval: 52.34–59.05%) under stratified gene splitting and 53.31% (49.98–56.74%) under similarity-grouped splitting. The corresponding best observed sequence-composition baselines achieved 59.95% and 56.50%. Paired balanced-accuracy intervals did not establish an advantage for fine-tuning under the fixed short training protocol. Intervals condition on the fitted models and do not capture retraining variability.”

## Rights and reuse

© 2026 Zelun He. Rights reserved in original human-authored contributions and original selection and arrangement, where protected. Third-party materials retain their respective rights. No exclusive rights are claimed in scientific facts, database contents, or purely AI-generated material.
