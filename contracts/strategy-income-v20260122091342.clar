(define-constant ERR-UNAUTHORIZED u100)
(define-constant ERR-INSUFFICIENT u101)
(define-constant ERR-ALREADY-INITIALIZED u102)
(define-constant ERR-NOT-INITIALIZED u103)

(define-trait sip010-trait
  (
    (transfer (uint principal principal (optional (buff 34))) (response bool uint))
    (get-name () (response (string-ascii 32) uint))
    (get-symbol () (response (string-ascii 32) uint))
    (get-decimals () (response uint uint))
    (get-balance (principal) (response uint uint))
    (get-total-supply () (response uint uint))
  )
)

(define-data-var manager principal tx-sender)
(define-data-var initialized bool false)
(define-data-var managed uint u0)

;; Add these events
(define-event ManagerUpdated
  (old-manager principal)
  (new-manager principal)
  (updated-by principal)
)

(define-event Initialized
  (manager principal)
  (initialized-by principal)
)

(define-event Deposited
  (depositor principal)
  (amount uint)
  (new-managed-amount uint)
)

(define-event Withdrawn
  (withdrawer principal)
  (recipient principal)
  (amount uint)
  (new-managed-amount uint)
)

(define-event TokenWithdrawn
  (withdrawer principal)
  (recipient principal)
  (token principal)
  (amount uint)
  (new-managed-amount uint)
)

(define-event Harvested
  (harvester principal)
  (harvested-amount uint)
  (new-managed-amount uint)
)

(define-public (set-manager (new-manager principal))
  (let
    (
      (old-manager (var-get manager))
    )
    (begin
      (asserts! (is-manager) (err ERR-UNAUTHORIZED))
      (asserts! (not (var-get initialized)) (err ERR-ALREADY-INITIALIZED))
      (var-set manager new-manager)
      (var-set initialized true)
      (emit-event Initialized
        new-manager
        tx-sender
      )
      (emit-event ManagerUpdated
        old-manager
        new-manager
        tx-sender
      )
      (ok true)
    )
  )
)

(define-public (deposit (amount uint))
  (let
    (
      (old-managed (var-get managed))
      (new-managed (+ old-managed amount))
    )
    (begin
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (is-manager) (err ERR-UNAUTHORIZED))
      (var-set managed new-managed)
      (emit-event Deposited
        tx-sender
        amount
        new-managed
      )
      (ok true)
    )
  )
)

(define-public (withdraw (amount uint))
  (let 
    (
      (recipient tx-sender)
      (old-managed (var-get managed))
      (new-managed (- old-managed amount))
    )
    (begin
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (is-manager) (err ERR-UNAUTHORIZED))
      (asserts! (>= old-managed amount) (err ERR-INSUFFICIENT))
      (try! (as-contract (stx-transfer? amount tx-sender recipient)))
      (var-set managed new-managed)
      (emit-event Withdrawn
        tx-sender
        recipient
        amount
        new-managed
      )
      (ok true)
    )
  )
)

(define-public (withdraw-sip010 (token <sip010-trait>) (amount uint))
  (let 
    (
      (recipient tx-sender)
      (old-managed (var-get managed))
      (new-managed (- old-managed amount))
    )
    (begin
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (is-manager) (err ERR-UNAUTHORIZED))
      (asserts! (>= old-managed amount) (err ERR-INSUFFICIENT))
      (try! (as-contract (contract-call? token transfer amount tx-sender recipient none)))
      (var-set managed new-managed)
      (emit-event TokenWithdrawn
        tx-sender
        recipient
        (contract-of token)
        amount
        new-managed
      )
      (ok true)
    )
  )
)

(define-public (harvest)
  (begin
    (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
    (asserts! (is-manager) (err ERR-UNAUTHORIZED))
    ;; Note: Your harvest function returns (ok u0) but doesn't actually harvest
    ;; If it does harvest in the future, you'll need to emit Harvested event
    (ok u0)
  )
)
