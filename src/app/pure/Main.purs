module Main where

import Prelude

import Data.Maybe (Maybe(..), maybe)
import Data.Number.Format (toString)
import Math (floor)


type State =
    {
        startTime :: Number,
        tick :: Maybe Tick
    }

type Tick = 
    {
        lastTime :: Number,
        deltaTime :: Number,
        elapsedTime :: String
    }


getInitialState :: Number -> State
getInitialState now = 
    {
        startTime: now,
        tick: Nothing
    } 


updateState :: Number -> State -> State
updateState now state = state
    {
        tick = Just $ updateTick state.startTime now state.tick
    }

updateTick :: Number -> Number -> Maybe Tick -> Tick
updateTick startTime now mTick =
    maybe 
        {
            lastTime: now,
            deltaTime: 0.0,
            elapsedTime: "0"
        }

        (\tick -> {
            lastTime: now,
            deltaTime: now - tick.lastTime,
            elapsedTime: toString $ floor ((now - startTime) / 1000.0)
        })
        
        mTick
