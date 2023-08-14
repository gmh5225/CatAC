import { world } from '@minecraft/server'
import config from '../data/config'
let seconds = 0
let cpstick = 0

export function timer() {
    seconds++
    if (config.modules.antispamA.enabled && seconds >= config.modules.antispamA.sendlimit) {
        world.getDimension("overworld").runCommandAsync(`scoreboard players reset * chatsSent`)
        world.getDimension("overworld").runCommandAsync(`scoreboard players set "dummy" chatsSent 1`)
        seconds = 0
        return seconds
    }
    return seconds
}