(define-constant ERR-UNAUTHORIZED u100)

(define-data-var performance-fee-bps uint u1000)
(define-data-var management-fee-bps uint u50)
(define-data-var treasury principal tx-sender)
(define-data-var strategist principal tx-sender)

;; Add these events
(define-event FeesUpdated
  (old-performance-bps uint)
  (new-performance-bps uint)
  (old-management-bps uint)
  (new-management-bps uint)
  (updated-by principal)
)

(define-event RecipientsUpdated
  (old-treasury principal)
  (new-treasury principal)
  (old-strategist principal)
  (new-strategist principal)
  (updated-by principal)
)

(define-public (set-fees (performance-bps uint) (management-bps uint))
  (let 
    (
      (old-performance (var-get performance-fee-bps))
      (old-management (var-get management-fee-bps))
    )
    (begin
      (asserts! (is-governor) (err ERR-UNAUTHORIZED))
      (var-set performance-fee-bps performance-bps)
      (var-set management-fee-bps management-bps)
      (emit-event FeesUpdated
        old-performance
        performance-bps
        old-management
        management-bps
        tx-sender
      )
      (ok true)
    )
  )
)

(define-public (set-recipients (new-treasury principal) (new-strategist principal))
  (let 
    (
      (old-treasury (var-get treasury))
      (old-strategist (var-get strategist))
    )
    (begin
      (asserts! (is-governor) (err ERR-UNAUTHORIZED))
      (var-set treasury new-treasury)
      (var-set strategist new-strategist)
      (emit-event RecipientsUpdated
        old-treasury
        new-treasury
        old-strategist
        new-strategist
        tx-sender
      )
      (ok true)
    )
  )
)
