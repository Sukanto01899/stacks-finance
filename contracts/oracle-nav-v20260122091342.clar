(define-constant ERR-UNAUTHORIZED u100)

(define-map navs
  { vault: principal }
  { nav: uint, updated-at: uint }
)

;; Add NAV update event
(define-event NavUpdated
  (vault principal)
  (old-nav uint)
  (new-nav uint)
  (old-updated-at uint)
  (new-updated-at uint)
  (updated-by principal)
)

(define-public (set-nav (vault principal) (nav uint))
  (let
    (
      (old-entry (map-get? navs { vault: vault }))
      (old-nav (default-to u0 (get nav old-entry)))
      (old-updated-at (default-to u0 (get updated-at old-entry)))
      (block-height (block-height))
    )
    (begin
      (asserts! (is-governor) (err ERR-UNAUTHORIZED))
      (map-set navs { vault: vault } { nav: nav, updated-at: block-height })
      (emit-event NavUpdated
        vault
        old-nav
        nav
        old-updated-at
        block-height
        tx-sender
      )
      (ok true)
    )
  )
)
