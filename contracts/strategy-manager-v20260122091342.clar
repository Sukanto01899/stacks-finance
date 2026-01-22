(define-constant ERR-UNAUTHORIZED u100)
(define-constant ERR-NOT-FOUND u101)
(define-constant ERR-INSUFFICIENT u102)
(define-constant ERR-ALREADY-INITIALIZED u103)
(define-constant ERR-NOT-INITIALIZED u104)

(define-data-var vault-core principal tx-sender)
(define-data-var initialized bool false)

(define-event Initialized
  (vault-core principal)
  (initialized-by principal)
)

(define-event StrategyAdded
  (strategy principal)
  (risk-tier uint)
  (weight uint)
  (added-by principal)
)

(define-event StrategyActiveUpdated
  (strategy principal)
  (old-active bool)
  (new-active bool)
  (updated-by principal)
)

(define-event StrategyWeightUpdated
  (strategy principal)
  (old-weight uint)
  (new-weight uint)
  (updated-by principal)
)

(define-event DepositRecorded
  (strategy principal)
  (amount uint)
  (new-managed uint)
  (recorded-by principal)
)

(define-event WithdrawRecorded
  (strategy principal)
  (amount uint)
  (new-managed uint)
  (recorded-by principal)
)

(define-map strategies
  { strategy: principal }
  { active: bool, risk-tier: uint, weight: uint, managed: uint }
)

(define-read-only (is-governor)
  (contract-call? .governance is-governor tx-sender)
)

(define-read-only (is-vault-core)
  (or
    (is-eq tx-sender (var-get vault-core))
    (is-eq contract-caller (var-get vault-core))
  )
)

(define-read-only (get-strategy (strategy principal))
  (map-get? strategies { strategy: strategy })
)

(define-public (initialize (new-vault-core principal))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (asserts! (not (var-get initialized)) (err ERR-ALREADY-INITIALIZED))
    (var-set vault-core new-vault-core)
    (var-set initialized true)
    (emit-event Initialized new-vault-core tx-sender)
    (ok true)
  )
)

(define-public (add-strategy (strategy principal) (risk-tier uint) (weight uint))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (map-set strategies { strategy: strategy }
      { active: true, risk-tier: risk-tier, weight: weight, managed: u0 }
    )
    (emit-event StrategyAdded strategy risk-tier weight tx-sender)
    (ok true)
  )
)

(define-public (set-strategy-active (strategy principal) (active bool))
  (let
    (
      (entry (unwrap-panic (map-get? strategies { strategy: strategy })))
      (old-active (get active entry))
    )
    (begin
      (asserts! (is-governor) (err ERR-UNAUTHORIZED))
      (asserts! (is-some (map-get? strategies { strategy: strategy })) (err ERR-NOT-FOUND))
      (map-set strategies { strategy: strategy }
        (merge entry { active: active })
      )
      (emit-event StrategyActiveUpdated strategy old-active active tx-sender)
      (ok true)
    )
  )
)

(define-public (update-weight (strategy principal) (weight uint))
  (let
    (
      (entry (unwrap-panic (map-get? strategies { strategy: strategy })))
      (old-weight (get weight entry))
    )
    (begin
      (asserts! (is-governor) (err ERR-UNAUTHORIZED))
      (asserts! (is-some (map-get? strategies { strategy: strategy })) (err ERR-NOT-FOUND))
      (map-set strategies { strategy: strategy }
        (merge entry { weight: weight })
      )
      (emit-event StrategyWeightUpdated strategy old-weight weight tx-sender)
      (ok true)
    )
  )
)

(define-public (record-deposit (strategy principal) (amount uint))
  (let
    (
      (entry (unwrap-panic (map-get? strategies { strategy: strategy })))
      (old-managed (get managed entry))
      (new-managed (+ old-managed amount))
    )
    (begin
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (is-vault-core) (err ERR-UNAUTHORIZED))
      (asserts! (is-some (map-get? strategies { strategy: strategy })) (err ERR-NOT-FOUND))
      (map-set strategies { strategy: strategy }
        (merge entry { managed: new-managed })
      )
      (emit-event DepositRecorded strategy amount new-managed tx-sender)
      (ok true)
    )
  )
)

(define-public (record-withdraw (strategy principal) (amount uint))
  (let
    (
      (entry (unwrap-panic (map-get? strategies { strategy: strategy })))
      (old-managed (get managed entry))
      (new-managed (- old-managed amount))
    )
    (begin
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (is-vault-core) (err ERR-UNAUTHORIZED))
      (asserts! (is-some (map-get? strategies { strategy: strategy })) (err ERR-NOT-FOUND))
      (asserts! (>= old-managed amount) (err ERR-INSUFFICIENT))
      (map-set strategies { strategy: strategy }
        (merge entry { managed: new-managed })
      )
      (emit-event WithdrawRecorded strategy amount new-managed tx-sender)
      (ok true)
    )
  )
)
