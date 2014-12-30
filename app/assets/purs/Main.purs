module Main where

import Control.Monad.JQuery
import Debug.Trace

main = do
    trace "Hello, PureScript!"
    ready $ trace "Later"
    trace "Now"

