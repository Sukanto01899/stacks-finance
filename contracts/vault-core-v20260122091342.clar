(define-constant ERR-UNAUTHORIZED u100)
(define-constant ERR-INSUFFICIENT u101)
(define-constant ERR-INVALID-ASSET u102)
(define-constant ERR-TRANSFER-FAILED u103)
(define-constant ERR-PAUSED u104)
(define-constant ERR-ALREADY-INITIALIZED u105)
(define-constant ERR-NOT-INITIALIZED u106)

(define-data-var registry principal tx-sender)
(define-data-var fee-manager principal tx-sender)
(define-data-var initialized bool false)
(define-data-var asset-kind uint u0)
(define-data-var asset-token (optional principal) none)

(define-trait sip010-trait (
  (transfer
    (uint principal principal (optional (buff 34)))
    (response bool uint)
  )
  (get-name
    ()
    (response (string-ascii 32) uint)
  )
  (get-symbol
    ()
    (response (string-ascii 32) uint)
  )
  (get-decimals
    ()
    (response uint uint)
  )
  (get-balance
    (principal)
    (response uint uint)
  )
  (get-total-supply
    ()
    (response uint uint)
  )
))

(define-trait strategy-trait (
  (deposit
    (uint)
    (response bool uint)
  )
  (withdraw
    (uint)
    (response bool uint)
  )
  (withdraw-sip010
    (<sip010-trait> uint)
    (response bool uint)
  )
  (harvest
    ()
    (response uint uint)
  )
))

;; Vault initialization and configuration events
(define-event VaultInitialized
  (kind uint)
  (token (optional principal))
  (name (string-ascii 32))
  (symbol (string-ascii 32))
  (decimals uint)
  (initialized-by principal)
)

(define-event RegistryUpdated
  (old-registry principal)
  (new-registry principal)
  (updated-by principal)
)

(define-event FeeManagerUpdated
  (old-fee-manager principal)
  (new-fee-manager principal)
  (updated-by principal)
)

;; Token transfer event (SIP-010 compliance)
(define-event Transfer
  (sender principal)
  (recipient principal)
  (amount uint)
  (memo (optional (buff 34)))
)

;; Deposit events
(define-event Deposited
  (depositor principal)
  (amount uint)
  (shares-minted uint)
  (new-total-assets uint)
  (new-total-shares uint)
)

(define-event Sip010Deposited
  (depositor principal)
  (token principal)
  (amount uint)
  (shares-minted uint)
  (new-total-assets uint)
  (new-total-shares uint)
)

;; Withdrawal events
(define-event Withdrawn
  (withdrawer principal)
  (recipient principal)
  (shares-burned uint)
  (assets-received uint)
  (new-total-assets uint)
  (new-total-shares uint)
)

(define-event Sip010Withdrawn
  (withdrawer principal)
  (recipient principal)
  (token principal)
  (shares-burned uint)
  (assets-received uint)
  (new-total-assets uint)
  (new-total-shares uint)
)

;; Strategy allocation events
(define-event Allocated
  (strategy principal)
  (amount uint)
  (new-total-assets uint)
  (allocated-by principal)
)

(define-event Deallocated
  (strategy principal)
  (amount uint)
  (new-total-assets uint)
  (deallocated-by principal)
)

(define-event Harvested
  (strategy principal)
  (profit uint)
  (new-total-assets uint)
  (harvested-by principal)
)


(define-data-var token-name (string-ascii 32) "Vault Receipt")
(define-data-var token-symbol (string-ascii 32) "vTOKEN")
(define-data-var token-decimals uint u6)

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
  (ok (get shares (default-to { shares: u0 } (map-get? balances { user: user }))))
)

(define-read-only (get-totals)
  {
    total-shares: (var-get total-shares),
    total-assets: (var-get total-assets),
  }
)

(define-read-only (get-name)
  (ok (var-get token-name))
)

(define-read-only (get-symbol)
  (ok (var-get token-symbol))
)

(define-read-only (get-decimals)
  (ok (var-get token-decimals))
)

(define-read-only (get-total-supply)
  (ok (var-get total-shares))
)

(define-read-only (get-asset)
  {
    kind: (var-get asset-kind),
    token: (var-get asset-token),
  }
)

(define-read-only (is-paused)
  (contract-call? .governance is-paused)
)

(define-public (initialize
    (kind uint)
    (token (optional principal))
    (name (string-ascii 32))
    (symbol (string-ascii 32))
    (decimals uint)
  )
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (asserts! (not (var-get initialized)) (err ERR-ALREADY-INITIALIZED))
    (asserts! (or (is-eq kind u0) (is-eq kind u1)) (err ERR-INVALID-ASSET))
    (if (is-eq kind u1)
      (asserts! (is-some token) (err ERR-INVALID-ASSET))
      true
    )
    (var-set asset-kind kind)
    (var-set asset-token token)
    (var-set token-name name)
    (var-set token-symbol symbol)
    (var-set token-decimals decimals)
    (var-set initialized true)
     (emit-event VaultInitialized kind token name symbol decimals tx-sender)
    (ok true)
  )
)

(define-public (set-registry (new-registry principal))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (var-set registry new-registry)
     (emit-event RegistryUpdated old-registry new-registry tx-sender)
    (ok true)
  )
)

(define-public (set-fee-manager (new-fee-manager principal))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (var-set fee-manager new-fee-manager)
     (emit-event FeeManagerUpdated old-fee-manager new-fee-manager tx-sender) 
    (ok true)
  )
)

(define-private (mint-shares
    (recipient principal)
    (amount uint)
  )
  (let ((entry (default-to { shares: u0 } (map-get? balances { user: recipient }))))
    (begin
      (var-set total-shares (+ (var-get total-shares) amount))
      (map-set balances { user: recipient } { shares: (+ (get shares entry) amount) })
      (emit-event Transfer tx-sender recipient amount none) 
      (ok true)
    )
  )
)

(define-private (burn-shares
    (owner principal)
    (amount uint)
  )
  (let ((entry (default-to { shares: u0 } (map-get? balances { user: owner }))))
    (begin
      (asserts! (>= (get shares entry) amount) (err ERR-INSUFFICIENT))
      (var-set total-shares (- (var-get total-shares) amount))
      (map-set balances { user: owner } { shares: (- (get shares entry) amount) })
        (emit-event Transfer owner tx-sender amount none)
      (ok true)
    )
  )
)

(define-public (transfer
    (amount uint)
    (sender principal)
    (recipient principal)
    (memo (optional (buff 34)))
  )
  (let ((entry (default-to { shares: u0 } (map-get? balances { user: sender }))))
    (begin
      (asserts! (is-eq tx-sender sender) (err ERR-UNAUTHORIZED))
      (asserts! (>= (get shares entry) amount) (err ERR-INSUFFICIENT))
      (map-set balances { user: sender } { shares: (- (get shares entry) amount) })
      (map-set balances { user: recipient } { shares: (+
        (get shares
          (default-to { shares: u0 } (map-get? balances { user: recipient }))
        )
        amount
      ) }
      )
       (emit-event Transfer sender recipient amount memo)
      (ok true)
    )
  )
)

(define-public (deposit (amount uint))
  (let
    (
      (old-total-assets (var-get total-assets))
      (old-total-shares (var-get total-shares))
      (new-total-assets (+ old-total-assets amount))
      (new-total-shares (+ old-total-shares amount))
    )
    (begin
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (not (is-paused)) (err ERR-PAUSED))
      (asserts! (is-eq (var-get asset-kind) u0) (err ERR-INVALID-ASSET))
      (asserts! (> amount u0) (err ERR-INVALID-ASSET))
      (try! (stx-transfer? amount tx-sender (as-contract tx-sender)))
      (var-set total-assets new-total-assets)
      (mint-shares tx-sender amount)
      (emit-event Deposited tx-sender amount amount new-total-assets new-total-shares)
      (ok amount)
    )
  )
)

(define-public (deposit-sip010
    (token <sip010-trait>)
    (amount uint)
  )
  (let
    (
      (token-addr (contract-of token))
      (old-total-assets (var-get total-assets))
      (old-total-shares (var-get total-shares))
      (new-total-assets (+ old-total-assets amount))
      (new-total-shares (+ old-total-shares amount))
    )
    (begin
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (not (is-paused)) (err ERR-PAUSED))
      (asserts! (is-eq (var-get asset-kind) u1) (err ERR-INVALID-ASSET))
      (asserts!
        (is-eq token-addr
          (unwrap! (var-get asset-token) (err ERR-INVALID-ASSET))
        )
        (err ERR-INVALID-ASSET)
      )
      (asserts! (> amount u0) (err ERR-INVALID-ASSET))
      (try! (contract-call? token transfer amount tx-sender (as-contract tx-sender) none))
      (var-set total-assets new-total-assets)
      (mint-shares tx-sender amount)
      (emit-event Sip010Deposited tx-sender token-addr amount amount new-total-assets new-total-shares)
      (ok amount)
    )
  )
)

(define-public (withdraw (shares uint))
  (let
    (
      (recipient tx-sender)
      (old-total-assets (var-get total-assets))
      (old-total-shares (var-get total-shares))
      (new-total-assets (- old-total-assets shares))
      (new-total-shares (- old-total-shares shares))
    )
    (begin
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (not (is-paused)) (err ERR-PAUSED))
      (asserts! (is-eq (var-get asset-kind) u0) (err ERR-INVALID-ASSET))
      (try! (burn-shares recipient shares))
      (try! (stx-transfer? shares (as-contract tx-sender) recipient))
      (var-set total-assets new-total-assets)
      (emit-event Withdrawn tx-sender recipient shares shares new-total-assets new-total-shares)
      (ok shares)
    )
  )
)

(define-public (withdraw-sip010
    (token <sip010-trait>)
    (shares uint)
  )
  (let
    (
      (recipient tx-sender)
      (token-addr (contract-of token))
      (old-total-assets (var-get total-assets))
      (old-total-shares (var-get total-shares))
      (new-total-assets (- old-total-assets shares))
      (new-total-shares (- old-total-shares shares))
    )
    (begin
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (not (is-paused)) (err ERR-PAUSED))
      (asserts! (is-eq (var-get asset-kind) u1) (err ERR-INVALID-ASSET))
      (asserts!
        (is-eq token-addr
          (unwrap! (var-get asset-token) (err ERR-INVALID-ASSET))
        )
        (err ERR-INVALID-ASSET)
      )
      (try! (burn-shares recipient shares))
      (try! (contract-call? token transfer shares (as-contract tx-sender) recipient none))
      (var-set total-assets new-total-assets)
      (emit-event Sip010Withdrawn tx-sender recipient token-addr shares shares new-total-assets new-total-shares)
      (ok shares)
    )
  )
)

(define-public (allocate
    (strategy <strategy-trait>)
    (amount uint)
  )
  (let
    (
      (strategy-addr (contract-of strategy))
      (old-total-assets (var-get total-assets))
      (new-total-assets (- old-total-assets amount))
    )
    (begin
      (asserts! (is-governor) (err ERR-UNAUTHORIZED))
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (not (is-paused)) (err ERR-PAUSED))
      (asserts! (is-eq (var-get asset-kind) u0) (err ERR-INVALID-ASSET))
      (asserts! (<= amount old-total-assets) (err ERR-INSUFFICIENT))
      (try! (as-contract (stx-transfer? amount tx-sender strategy-addr)))
      (try! (contract-call? .strategy-manager record-deposit strategy-addr
        amount
      ))
      (try! (contract-call? strategy deposit amount))
      (var-set total-assets new-total-assets)
      (emit-event Allocated strategy-addr amount new-total-assets tx-sender)
      (ok true)
    )
  )
)

(define-public (deallocate
    (strategy <strategy-trait>)
    (amount uint)
  )
  (let
    (
      (strategy-addr (contract-of strategy))
      (old-total-assets (var-get total-assets))
      (new-total-assets (+ old-total-assets amount))
    )
    (begin
      (asserts! (is-governor) (err ERR-UNAUTHORIZED))
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (not (is-paused)) (err ERR-PAUSED))
      (asserts! (is-eq (var-get asset-kind) u0) (err ERR-INVALID-ASSET))
      (try! (contract-call? strategy withdraw amount))
      (try! (contract-call? .strategy-manager record-withdraw strategy-addr
        amount
      ))
      (var-set total-assets new-total-assets)
      (emit-event Deallocated strategy-addr amount new-total-assets tx-sender)
      (ok true)
    )
  )
)

(define-public (allocate-sip010
    (token <sip010-trait>)
    (strategy <strategy-trait>)
    (amount uint)
  )
  (let
    (
      (token-addr (contract-of token))
      (strategy-addr (contract-of strategy))
      (old-total-assets (var-get total-assets))
      (new-total-assets (- old-total-assets amount))
    )
    (begin
      (asserts! (is-governor) (err ERR-UNAUTHORIZED))
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (not (is-paused)) (err ERR-PAUSED))
      (asserts! (is-eq (var-get asset-kind) u1) (err ERR-INVALID-ASSET))
      (asserts!
        (is-eq token-addr
          (unwrap! (var-get asset-token) (err ERR-INVALID-ASSET))
        )
        (err ERR-INVALID-ASSET)
      )
      (asserts! (<= amount old-total-assets) (err ERR-INSUFFICIENT))
      (try! (as-contract (contract-call? token transfer amount tx-sender strategy-addr none)))
      (try! (contract-call? .strategy-manager record-deposit strategy-addr
        amount
      ))
      (try! (contract-call? strategy deposit amount))
      (var-set total-assets new-total-assets)
      (emit-event Allocated strategy-addr amount new-total-assets tx-sender)
      (ok true)
    )
  )
)

(define-public (deallocate-sip010
    (token <sip010-trait>)
    (strategy <strategy-trait>)
    (amount uint)
  )
  (let
    (
      (token-addr (contract-of token))
      (strategy-addr (contract-of strategy))
      (old-total-assets (var-get total-assets))
      (new-total-assets (+ old-total-assets amount))
    )
    (begin
      (asserts! (is-governor) (err ERR-UNAUTHORIZED))
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (not (is-paused)) (err ERR-PAUSED))
      (asserts! (is-eq (var-get asset-kind) u1) (err ERR-INVALID-ASSET))
      (asserts!
        (is-eq token-addr
          (unwrap! (var-get asset-token) (err ERR-INVALID-ASSET))
        )
        (err ERR-INVALID-ASSET)
      )
      (try! (contract-call? strategy withdraw-sip010 token amount))
      (try! (contract-call? .strategy-manager record-withdraw strategy-addr
        amount
      ))
      (var-set total-assets new-total-assets)
      (emit-event Deallocated strategy-addr amount new-total-assets tx-sender)
      (ok true)
    )
  )
)

(define-public (harvest (strategy <strategy-trait>))
  (let
    (
      (strategy-addr (contract-of strategy))
      (old-total-assets (var-get total-assets))
    )
    (begin
      (asserts! (is-governor) (err ERR-UNAUTHORIZED))
      (asserts! (var-get initialized) (err ERR-NOT-INITIALIZED))
      (asserts! (not (is-paused)) (err ERR-PAUSED))
      (let ((profit (try! (contract-call? strategy harvest))))
        (var-set total-assets (+ old-total-assets profit))
        (emit-event Harvested strategy-addr profit (+ old-total-assets profit) tx-sender)
        (ok profit)
      )
    )
  )
)
