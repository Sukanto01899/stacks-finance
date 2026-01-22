(define-constant ERR-UNAUTHORIZED u100)

(define-data-var governor principal tx-sender)
(define-data-var paused bool false)

;; Add these events
(define-event GovernorUpdated
  (old-governor principal)
  (new-governor principal)
  (updated-by principal)
)

(define-event PauseStateUpdated
  (old-paused bool)
  (new-paused bool)
  (updated-by principal)
)

(define-public (set-governor (new-governor principal))
  (let
    (
      (old-governor (var-get governor))
    )
    (begin
      (asserts! (is-eq tx-sender old-governor) (err ERR-UNAUTHORIZED))
      (var-set governor new-governor)
      (emit-event GovernorUpdated
        old-governor
        new-governor
        tx-sender
      )
      (ok true)
    )
  )
)

(define-public (set-paused (flag bool))
  (let
    (
      (old-paused (var-get paused))
    )
    (begin
      (asserts! (is-eq tx-sender (var-get governor)) (err ERR-UNAUTHORIZED))
      (var-set paused flag)
      (emit-event PauseStateUpdated
        old-paused
        flag
        tx-sender
      )
      (ok true)
    )
  )
)
