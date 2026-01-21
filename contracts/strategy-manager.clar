(define-constant ERR-UNAUTHORIZED u100)
(define-constant ERR-NOT-FOUND u101)
(define-constant ERR-INSUFFICIENT u102)

(define-data-var vault-core principal tx-sender)

(define-map strategies
  { strategy: principal }
  { active: bool, risk-tier: uint, weight: uint, managed: uint }
)

(define-read-only (is-governor)
  (contract-call? .governance is-governor tx-sender)
)

(define-read-only (is-vault-core)
  (is-eq tx-sender (var-get vault-core))
)

(define-read-only (get-strategy (strategy principal))
  (map-get? strategies { strategy: strategy })
)

(define-public (set-vault-core (new-vault-core principal))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (var-set vault-core new-vault-core)
    (ok true)
  )
)

(define-public (add-strategy (strategy principal) (risk-tier uint) (weight uint))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (map-set strategies { strategy: strategy }
      { active: true, risk-tier: risk-tier, weight: weight, managed: u0 }
    )
    (ok true)
  )
)

(define-public (set-strategy-active (strategy principal) (active bool))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (asserts! (is-some (map-get? strategies { strategy: strategy })) (err ERR-NOT-FOUND))
    (map-set strategies { strategy: strategy }
      (merge (unwrap-panic (map-get? strategies { strategy: strategy })) { active: active })
    )
    (ok true)
  )
)

(define-public (update-weight (strategy principal) (weight uint))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (asserts! (is-some (map-get? strategies { strategy: strategy })) (err ERR-NOT-FOUND))
    (map-set strategies { strategy: strategy }
      (merge (unwrap-panic (map-get? strategies { strategy: strategy })) { weight: weight })
    )
    (ok true)
  )
)

(define-public (record-deposit (strategy principal) (amount uint))
  (let ((entry (map-get? strategies { strategy: strategy })))
    (begin
      (asserts! (is-vault-core) (err ERR-UNAUTHORIZED))
      (asserts! (is-some entry) (err ERR-NOT-FOUND))
      (map-set strategies { strategy: strategy }
        (merge (unwrap-panic entry) { managed: (+ (get managed (unwrap-panic entry)) amount) })
      )
      (ok true)
    )
  )
)

(define-public (record-withdraw (strategy principal) (amount uint))
  (let ((entry (map-get? strategies { strategy: strategy })))
    (begin
      (asserts! (is-vault-core) (err ERR-UNAUTHORIZED))
      (asserts! (is-some entry) (err ERR-NOT-FOUND))
      (asserts! (>= (get managed (unwrap-panic entry)) amount) (err ERR-INSUFFICIENT))
      (map-set strategies { strategy: strategy }
        (merge (unwrap-panic entry) { managed: (- (get managed (unwrap-panic entry)) amount) })
      )
      (ok true)
    )
  )
)
