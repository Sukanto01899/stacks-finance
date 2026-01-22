(define-constant ERR-UNAUTHORIZED u100)
(define-constant ERR-NOT-FOUND u101)

(define-data-var next-vault-id uint u1)

(define-map vaults
  { id: uint }
  { vault: principal, risk-tier: uint, cap: uint, active: bool }
)

(define-read-only (is-governor)
  (contract-call? .governance is-governor tx-sender)
)

(define-read-only (get-vault (id uint))
  (map-get? vaults { id: id })
)

(define-event VaultRegistered
  (id uint)
  (vault principal)
  (risk-tier uint)
  (cap uint)
  (registered-by principal)
)

(define-event VaultActiveUpdated
  (id uint)
  (vault principal)
  (old-active bool)
  (new-active bool)
  (updated-by principal)
)

(define-event VaultCapUpdated
  (id uint)
  (vault principal)
  (old-cap uint)
  (new-cap uint)
  (updated-by principal)
)


(define-public (register-vault (vault principal) (risk-tier uint) (cap uint))
  (let ((id (var-get next-vault-id)))
    (begin
      (asserts! (is-governor) (err ERR-UNAUTHORIZED))
      (map-set vaults { id: id } { vault: vault, risk-tier: risk-tier, cap: cap, active: true })
      (var-set next-vault-id (+ id u1))
        (emit-event VaultRegistered id vault risk-tier cap tx-sender)
      (ok id)
    )
  )
)

(define-public (set-vault-active (id uint) (active bool))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (asserts! (is-some (map-get? vaults { id: id })) (err ERR-NOT-FOUND))
    (map-set vaults { id: id }
      (merge (unwrap-panic (map-get? vaults { id: id })) { active: active })
    )
     (emit-event VaultActiveUpdated id vault-addr old-active active tx-sender)
    (ok true)
  )
)

(define-public (set-vault-cap (id uint) (cap uint))
  (begin
    (asserts! (is-governor) (err ERR-UNAUTHORIZED))
    (asserts! (is-some (map-get? vaults { id: id })) (err ERR-NOT-FOUND))
    (map-set vaults { id: id }
      (merge (unwrap-panic (map-get? vaults { id: id })) { cap: cap })
    )
     (emit-event VaultCapUpdated id vault-addr old-cap cap tx-sender)
    (ok true)
  )
)
