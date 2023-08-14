import { world, ChatSendBeforeEvent } from "@minecraft/server"
import config from '../data/config.js'

let messages = new Map()

/**
 * 
 * @param {ChatSendBeforeEvent} data 
 * @returns 
 */
function chatrank(data) {
    const tags = data.sender.getTags()
    let score;
    try {
        score = world.scoreboard.getObjective('chatsSent').getScore(data.sender.scoreboardIdentity)
    } catch (e) {
        score = 0;
    }
    let ranks = tags.filter(tag => tag.startsWith('rank:')).map(tag => tag.replace('rank:', ''))

    ranks = ranks.length ? ranks : config.chatrank.defaultrank

    if (data.message.startsWith(config.chatcmd.prefix)) {   //playerCMD
        const player = data.sender
        const cmd = data.message.trim().slice(1).split(/ +/g).map(item => item.replaceAll("_", " "))

        if (config.chatcmd.help.enabled && cmd[0] == "help") {
            data.cancel = true
            return player.runCommandAsync(`function use/help`)
        }
        if (config.chatcmd.info.enabled && cmd[0] == "info") {
            data.cancel = true
            return player.runCommandAsync(`function use/info`)
        }
        if (config.chatcmd.wcheck.enabled && cmd[0] == "wcheck") {
            data.cancel = true
            return player.runCommandAsync(`function use/wcheck`)
        }

        if (!player.hasTag(config.chatcmd.admintag) && config.chatcmd.datacancel) {
            data.cancel = true
            return data.sender.sendMessage(`§l§f[§dCat§bAC§f]§r§7 找不到該命令或權限不足`)
        }

        if (config.chatcmd.ban.enabled && cmd[0] == "ban") {
            data.cancel = true
            const slicer = cmd[1].startsWith("@") ? 1 : 0
            const pretarget = cmd[1].slice(slicer)
            const target = world.getPlayers({ name: pretarget })[0]
            const isHardBan = cmd[2]
            data.cancel = true
            if (target == undefined) return player.runCommandAsync(`function error/unfind`)
            if (player == target) return player.runCommandAsync(`function error/self`)
            if (!target.hasTag('op')) {
                if (isHardBan == "true" && config.chatcmd.ban.allowhardban) {
                    world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 ${player.name} 已永久封禁 ${target.name}`)
                    target.addTag(`isHardBanned`)
                } else {
                    target.runCommandAsync(`tag @s add ban`) //here tag
                    return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 已封禁該名玩家`)
                }
            } else return player.runCommandAsync(`function error/isOp`)
        }


        if (config.chatcmd.warn.enabled && cmd[0] == "warn") {
            const slicer = cmd[1].startsWith("@") ? 1 : 0
            const pretarget = cmd[1].slice(slicer)
            const target = world.getPlayers({ name: pretarget })[0]
            data.cancel = true
            if (target == undefined) return player.runCommandAsync(`function error/unfind`)
            if (player == target) return player.runCommandAsync(`function error/self`)
            if (!target.hasTag('op')) {
                target.runCommandAsync(`tag @s add warning`)
                return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 已成功警告該玩家`)
            } else return player.runCommandAsync(`function error/isOp`)
        }

        if (config.chatcmd.freeze.enabled && cmd[0] == "freeze") {
            const slicer = cmd[1].startsWith("@") ? 1 : 0
            const pretarget = cmd[1].slice(slicer)
            const target = world.getPlayers({ name: pretarget })[0]
            data.cancel = true
            if (target == undefined) return player.runCommandAsync(`function error/unfind`)
            if (player == target) return player.runCommandAsync(`function error/self`)
            if (!target.hasTag('op')) {
                target.runCommandAsync(`tag @s add freezing`)
                return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 已成功凍結該玩家`)
            } else return player.runCommandAsync(`function error/isOp`)
        }

        if (config.chatcmd.ecw.enabled && cmd[0] == "ecw") {
            const slicer = cmd[1].startsWith("@") ? 1 : 0
            const pretarget = cmd[1].slice(slicer)
            const target = world.getPlayers({ name: pretarget })[0]
            data.cancel = true
            if (target == undefined) return player.runCommandAsync(`function error/unfind`)
            if (player == target) return player.runCommandAsync(`function error/self`)
            if (!target.hasTag('op')) {
                target.runCommandAsync(`function use/ecw`)
                return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 已成功清除該玩家終界箱`)
            } else return player.runCommandAsync(`function error/isOp`)
        }

        if (config.chatcmd.ban.enabled && cmd[0] == "unban") {
            const slicer = cmd[1].startsWith("@") ? 1 : 0
            const pretarget = cmd[1].slice(slicer)
            const target = world.getPlayers({ name: pretarget })[0]
            data.cancel = true
            if (target == undefined) return player.runCommandAsync(`function error/unfind`)
            if (player == target) return player.runCommandAsync(`function error/self`)
            if (!target.hasTag('op')) {
                target.runCommandAsync(`tag @s add unbaning`)
                return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 已成功解除封禁該玩家`)
            } else return player.runCommandAsync(`function error/isOp`)
        }

        if (config.chatcmd.mute.enabled && cmd[0] == "mute") {
            const slicer = cmd[1].startsWith("@") ? 1 : 0
            const pretarget = cmd[1].slice(slicer)
            const target = world.getPlayers({ name: pretarget })[0]
            data.cancel = true
            if (target == undefined) return player.runCommandAsync(`function error/unfind`)
            if (player == target) return player.runCommandAsync(`function error/self`)
            if (!target.hasTag('op')) {
                target.runCommandAsync(`tag @s add mute`)
                return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 已成功解除靜音該玩家`)
            } else return player.runCommandAsync(`function error/isOp`)
        }

        if (config.chatcmd.mute.enabled && cmd[0] == "unmute") {
            const slicer = cmd[1].startsWith("@") ? 1 : 0
            const pretarget = cmd[1].slice(slicer)
            const target = world.getPlayers({ name: pretarget })[0]
            data.cancel = true
            if (target == undefined) return player.runCommandAsync(`function error/unfind`)
            if (player == target) return player.runCommandAsync(`function error/self`)
            if (!target.hasTag('op')) {
                target.runCommandAsync(`tag @s add unmuting`)
                return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 已成功解除靜音該玩家`)
            } else return player.runCommandAsync(`function error/isOp`)
        }

        if (config.chatcmd.freeze.enabled && cmd[0] == "unfreeze") {
            const slicer = cmd[1].startsWith("@") ? 1 : 0
            const pretarget = cmd[1].slice(slicer)
            const target = world.getPlayers({ name: pretarget })[0]
            data.cancel = true
            if (target == undefined) return player.runCommandAsync(`function error/unfind`)
            if (player == target) return player.runCommandAsync(`function error/self`)
            if (!target.hasTag('op')) {
                target.runCommandAsync(`tag @s add unfreezing`)
                return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 已成功解除凍結該玩家`)
            } else return player.runCommandAsync(`function error/isOp`)
        }

        if (config.chatcmd.cleartext.enabled && cmd[0] == "cleartext") {
            data.cancel = true
            player.runCommandAsync(`function use/cleartext`)
            return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 成功清除聊天欄的訊息`)
        }

        if (config.chatcmd.npc.enabled && cmd[0] == "npc") {
            data.cancel = true
            player.runCommandAsync(`execute at @s run structure load "catac_npc" ~~~`)
            return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 成功召喚一名NPC`)
        }

        if (config.chatcmd.kit.enabled && cmd[0] == "kit") {
            data.cancel = true
            if (config.chatcmd.kit.fair && cmd[1] == "fair") {
                player.runCommandAsync(`execute at @s run structure load "catac_fair" ~~~`)
                return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 成功召喚fair裝備盒`)
            }
            if (config.chatcmd.kit.unfair && cmd[1] == "unfair") {
                player.runCommandAsync(`execute at @s run structure load "catac_unfair" ~~~`)
                return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 成功召喚unfair裝備盒`)
            }
            if (config.chatcmd.kit.legit && cmd[1] == "legit") {
                player.runCommandAsync(`execute at @s run structure load "catac_legit" ~~~`)
                return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 成功召喚legit裝備盒`)
            }
            return player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 裝備盒名稱無效或該裝備盒被禁用`)
        }

        if (config.chatcmd.datacancel) {
            data.cancel = true
            return data.sender.sendMessage(`§l§f[§dCat§bAC§f]§r§7 找不到該命令`)
        }

        if (config.chatcmd.nocolor && data.message.includes('§') && !data.sender.hasTag('op')) {
            data.cancel = true
            return data.sender.sendMessage(`§l§f[§dCat§bAC§f]§r§7 信息的分節符號已被禁用`)
        }
        if (config.chatcmd.nospace && data.message.startsWith(' ') && !data.sender.hasTag('op')) {
            data.cancel = true
            return data.sender.sendMessage(`§l§f[§dCat§bAC§f]§r§7 訊息不能以空格開頭或空格結尾`)
        }
        if (config.chatcmd.nospace && data.message.endsWith(' ') && !data.sender.hasTag('op')) {
            data.cancel = true
            return data.sender.sendMessage(`§l§f[§dCat§bAC§f]§r§7 訊息不能以空格開頭或空格結尾`)
        }
        if (config.modules.antispamA.enabled && score > config.modules.antispamA.sendlimit) {
            data.cancel = true
            return data.sender.sendMessage(`§l§f[§dCat§bAC§f]§r§7 你訊息發送得太快了!`)
        }
    }

    if (config.modules.antispamC.enabled && data.message.length > config.modules.antispamC.textlimit) {
        data.cancel = true
        return data.sender.sendMessage(`§l§f[§dCat§bAC§f]§r§7 你的訊息字數已超過單個訊息的字數限制`)
    }
    if (!messages.get(data.sender.name)) {
        messages.set(data.sender.name, data.message)
    } else {
        const oldMsg = messages.get(data.sender.name)
        if (config.modules.antispamB.enabled && oldMsg == data.message) {
            data.cancel = true
            return data.sender.sendMessage(`§l§f[§dCat§bAC§f]§r§7 請你不要重複發送相同的訊息!`)
        }
    }
    if (!config.chatrank.enabled) return;
    const text = `${ranks} §r§f${data.sender.nameTag} §a§l>>§r §f${data.message}`
    world.sendMessage({ rawtext: [{ text: text }] })
    messages.set(data.sender.name, data.message)
    data.sender.runCommandAsync(`scoreboard players add @s chatsSent 1`)
    data.cancel = true
}

export { chatrank }