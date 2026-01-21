(define-constant ERR-UNAUTHORIZED u100)
(define-constant ERR-INSUFFICIENT u101)

(define-data-var registry principal tx-sender)
(define-data-var strategy-manager principal tx-sender)
(define-data-var fee-manager principal tx-sender)

(define-data-var total-shares uint u0)
(define-data-var total-assets uint u0)

(define-map balances
  { user: principal }
  { shares: uint }
)

(define-read-only (is-governor)
  (contract-call? .governance is-governor tx-sender)
)

(define-read-only (get-balance (user principal))
  (default-to { shares: u0 } (map-get? balances { user: user }))
)

(define-read-only (get-totals)
  { total-shares: (var-get total-shares), total-assets: (var-get total-assets) }
)

(define-public (set-registry (new-registry principal))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (var-set registry new-registry)
    (ok true)
  )
)

(define-public (set-strategy-manager (new-strategy-manager principal))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (var-set strategy-manager new-strategy-manager)
    (ok true)
  )
)

(define-public (set-fee-manager (new-fee-manager principal))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (var-set fee-manager new-fee-manager)
    (ok true)
  )
)

(define-public (deposit (amount uint))
  (let ((entry (default-to { shares: u0 } (map-get? balances { user: tx-sender }))))
    (begin
      (var-set total-assets (+ (var-get total-assets) amount))
      (var-set total-shares (+ (var-get total-shares) amount))
      (map-set balances { user: tx-sender } { shares: (+ (get shares entry) amount) })
      (ok amount)
    )
  )
)

(define-public (withdraw (shares uint))
  (let ((entry (default-to { shares: u0 } (map-get? balances { user: tx-sender }))))
    (begin
      (asserts! (>= (get shares entry) shares) (err ERR-INSUFFICIENT))
      (var-set total-assets (- (var-get total-assets) shares))
      (var-set total-shares (- (var-get total-shares) shares))
      (map-set balances { user: tx-sender } { shares: (- (get shares entry) shares) })
      (ok shares)
    )
  )
)
