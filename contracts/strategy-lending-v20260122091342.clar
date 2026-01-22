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

(define-event ManagerSet
  (old-manager principal)
  (new-manager principal)
  (set-by principal)
)

(define-event Deposited
  (depositor principal)
  (amount uint)
  (new-total uint)
)

(define-event Withdrawn
  (withdrawer principal)
  (recipient principal)
  (amount uint)
  (new-total uint)
)

(define-event Sip010Withdrawn
  (token-contract principal)
  (withdrawer principal)
  (recipient principal)
  (amount uint)
  (new-total uint)
)


(define-data-var manager principal tx-sender)
(define-data-var initialized bool false)
(define-data-var managed uint u0)

(define-read-only (is-manager)
  (or
    (is-eq tx-sender (var-get manager))
    (is-eq contract-caller (var-get manager))
  )
)

(define-read-only (get-managed)
  (var-get managed)
)

(define-public (set-manager (new-manager principal))
  (begin
    (asserts! (is-manager) (err ERR-UNAUTHORIZED))
    (asserts! (not (var-get initialized)) (err ERR-ALREADY-INITIALIZED))
    (var-set manager new-manager)
    (var-set initialized true)
     (emit-event ManagerSet old-manager new-manager tx-sender)
    (ok true)
  )
)

(define-public (deposit (amount uint))
  (begin
    (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
    (asserts! (is-manager) (err ERR-UNAUTHORIZED))
    (var-set managed (+ (var-get managed) amount))
     (emit-event Deposited tx-sender amount new-total)
    (ok true)
  )
)

(define-public (withdraw (amount uint))
  (let ((recipient tx-sender))
    (new-total (- (var-get managed) amount)))
    (begin
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (is-manager) (err ERR-UNAUTHORIZED))
      (asserts! (>= (var-get managed) amount) (err ERR-INSUFFICIENT))
      (try! (as-contract (stx-transfer? amount tx-sender recipient)))
      (var-set managed (- (var-get managed) amount))
       (emit-event Withdrawn tx-sender recipient amount new-total) 
      (ok true)
    )
  )
)

(define-public (withdraw-sip010 (token <sip010-trait>) (amount uint))
  (let ((recipient tx-sender))
(new-total (- (var-get managed) amount))
        (token-contract (contract-of token)))
    
    (begin
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (is-manager) (err ERR-UNAUTHORIZED))
      (asserts! (>= (var-get managed) amount) (err ERR-INSUFFICIENT))
      (try! (as-contract (contract-call? token transfer amount tx-sender recipient none)))
      (var-set managed (- (var-get managed) amount))
       (emit-event Sip010Withdrawn token-contract tx-sender recipient amount new-total) 
      (ok true)
    )
  )
)

(define-public (harvest)
  (begin
    (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
    (asserts! (is-manager) (err ERR-UNAUTHORIZED))
    (ok u0)
  )
)
