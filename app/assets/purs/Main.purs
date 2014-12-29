module Main where

foreign import data Undefined :: *
foreign import console :: { log :: String -> Undefined }

main = console.log "Hello, PureScript!"
