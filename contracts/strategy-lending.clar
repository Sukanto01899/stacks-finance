(define-constant ERR-UNAUTHORIZED u100)
(define-constant ERR-INSUFFICIENT u101)

(define-data-var manager principal tx-sender)
(define-data-var managed uint u0)

(define-read-only (is-manager)
  (is-eq tx-sender (var-get manager))
)

(define-read-only (get-managed)
  (var-get managed)
)

(define-public (set-manager (new-manager principal))
  (begin
    (asserts! (is-manager) (err ERR-UNAUTHORIZED))
    (var-set manager new-manager)
    (ok true)
  )
)

(define-public (deposit (amount uint))
  (begin
    (asserts! (is-manager) (err ERR-UNAUTHORIZED))
    (var-set managed (+ (var-get managed) amount))
    (ok true)
  )
)

(define-public (withdraw (amount uint))
  (begin
    (asserts! (is-manager) (err ERR-UNAUTHORIZED))
    (asserts! (>= (var-get managed) amount) (err ERR-INSUFFICIENT))
    (var-set managed (- (var-get managed) amount))
    (ok true)
  )
)

(define-public (harvest)
  (begin
    (asserts! (is-manager) (err ERR-UNAUTHORIZED))
    (ok u0)
  )
)
