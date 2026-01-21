(define-constant ERR-UNAUTHORIZED u100)

(define-map navs
  { vault: principal }
  { nav: uint, updated-at: uint }
)

(define-read-only (is-governor)
  (contract-call? .governance is-governor tx-sender)
)

(define-read-only (get-nav (vault principal))
  (map-get? navs { vault: vault })
)

(define-public (set-nav (vault principal) (nav uint))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (map-set navs { vault: vault } { nav: nav, updated-at: u0 })
    (ok true)
  )
)
