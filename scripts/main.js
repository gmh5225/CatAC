import * as Minecraft from '@minecraft/server'
import { chatrank } from './chat/chat.js'
import { timer } from './chat/chatlimit.js'
import config from './data/config.js'
let tick = 0, worldLoad = false;

const world = Minecraft.world
const system = Minecraft.system

const getScores = (player, scoreboard) => {
  const score1 = Minecraft.world.scoreboard.getObjective(scoreboard).getScores().find(score => score.participant.displayName == (player.typeId == "minecraft:player" ? player.name : typeof player == "string" ? player : player.id))?.score

  if (!isNaN(Number(score1))) {
    return score1
  } else {
    return undefined
  }
}

const punish = (player, punishment) => {
  if (punishment == "kick") player.runCommand(`kick "${player.name}" "§l§f[§dCat§bAC§f]§c 你被踢出遊戲"`)
  if (punishment == "ban") player.runCommand(`tag @s add ban`)
  if (punishment == "hardban") player.runCommand(`tag @s add isHardBanned`)
}
const getGamemode = (player) => {
  const gamemodes = {
    survival: 0,
    creative: 1,
    adventure: 2,
    spectator: 3
  }

  for (const gamemode in Minecraft.GameMode) {
    if ([...Minecraft.world.getPlayers({
      name: player.name,
      gameMode: Minecraft.GameMode[gamemode]
    })].length > 0) return gamemodes[Minecraft.GameMode[gamemode]]
  }
}

world.afterEvents.entitySpawn.subscribe(data => {
  if (config.modules.cbe.enabled) {
    const entity = data.entity
    if (entity.typeId == "minecraft:npc") {
      if (entity.hasTag('cbe:allowednpc') && config.modules.cbe.allowsummonnpc) {
        return;
      } else {
        const entityId = entity.typeId
        world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 entityCheck/A 已清除一個違規CBE實體`)
        world.sendMessage(`§c>>§7實體:§9 ${entityId}`)
        entity.kill()
      }
    }
  }
})
world.beforeEvents.chatSend.subscribe((data) => {
  // console.warn(data.sender.scoreboard) presents a bug if no score in any obj
  // console.warn(world.scoreboard.getObjective('chatsSent').getScore(data.sender.scoreboard))
  chatrank(data)
})
world.afterEvents.entityHitEntity.subscribe(data => {
  const player = data.damagingEntity
  if (config.modules.ac.enabled && !player.hasTag("op")) {
    data.damagingEntity.runCommand(`scoreboard players add @s[type=player] cps 1`)
    let cps = getScores(player, "cps") ?? 0
    if (cps > config.modules.ac.illegalcps) {
      const showcps = config.modules.ac.illegalcps
      world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 autoclicker/A ${player.name} 違規CPS檢測 CPS > ${showcps}`)
      player.kill()
      punish(player, config.modules.ac.punishmentB)
    } else {
      if (cps > config.modules.ac.maxcps && system.currentTick % 2 == 0) {
        const showcps = config.modules.ac.maxcps
        player.kill()
        world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 autoclicker/A ${player.name} 最大CPS檢測 CPS > ${showcps}`)
      }
    }
  }
})
//placeCheck
world.afterEvents.blockPlace.subscribe(data => {
  const player = data.player
  if (config.modules.placeCheck.enabled && !player.hasTag("op")) {
    const blockId = data.block.typeId
    if (config.modules.placeCheck.blocklist.includes(blockId)) {
      world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 placeCheck/A ${player.name} 放置了一個違規的方塊`)
      world.sendMessage(`§c>>§7方塊:§9 ${blockId}`)
      data.block.setType(Minecraft.MinecraftBlockTypes.air)
      punish(player, config.modules.placeCheck.punishment)
    }
  }
})
world.afterEvents.blockBreak.subscribe(data => {
  const player = data.player
  if (config.modules.nuker.enabled && !player.hasTag("op")) {
    let blocktick = getScores(player, "blockBreak") ?? 0

    player.runCommand(`scoreboard players add @s blockBreak 1`)

    if (blocktick >= config.modules.nuker.maxdestroy) {
      player.runCommand(`scoreboard players set @s blockBreak 0`)
      data.block.setPermutation(data.brokenBlockPermutation.clone())
      world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 nuker/A ${player.name} 已被檢測出使用範圍挖掘`)
      punish(player, config.modules.nuker.punishment)
    }
  }
  if (config.modules.insteaBreak.enabled && !player.hasTag("op")) {
    if (player.hasTag('op') || getGamemode(player) == 1) return
    const blockId = data.brokenBlockPermutation.typeId
    if (config.modules.insteaBreak.blocklist.includes(blockId)) {
      //insteaBreakA
      data.block.setPermutation(data.brokenBlockPermutation.clone())
      world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 insteaBreak/A ${player.name} 破壞了不可破壞的方塊`)
      world.sendMessage(`§c>>§7方塊:§9 ${blockId}`)
      punish(player, config.modules.insteaBreak.punishment)
    }
  }
})
world.afterEvents.playerSpawn.subscribe(data => {
  const player = data.player
  //HardBan
  if (config.modules.namespoof.enabled && data.initialSpawn && !player.hasTag("op")) {
    player.sendMessage(`§l§f[§dCat§bAC§f]§r§7 此伺服器受到保護 !info 了解更多 | by jasonlaubb`)
    //namespoofA
    const strings = config.modules.namespoof.strings

    let name = player.name

    for (const string of strings) {
      name = name.replaceAll(string, "")
    }

    if (name.length > 0) {
      world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 namespoof/A ${player.name} 的名字內含有非英數字元`)
      player.runCommand(`kick "${player.name}" "§l§f[§dCat§bAC§f]§c 你被檢測出使用Namespoof"`)
    }
    //namespoofB
    if (player.name.length > config.modules.namespoof.maxnamelegnth || player.name.length < config.modules.namespoof.minnamelegnth) {
      world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 namespoof/B ${player.name} 的名字長度不正確`)
      player.runCommand(`kick "${player.name}" "§l§f[§dCat§bAC§f]§c 你被檢測出使用Namespoof"`)
    }
  }
  if (config.modules.wellcomer.enabled && !player.hasTag('notnew')) {
    player.runCommand(`tag @s add notnew`)
    world.sendMessage(`§l§f[§dCat§bAC§f]§r§g 歡迎 ${player.name} 首次加入這個伺服器!`)
  }
})
system.runInterval(() => {
  if (config.modules.cbe.enabled) world.getDimension("overworld").runCommand(`kill @e[type=command_block_minecart]`)
  for (const player of Minecraft.world.getPlayers()) {
    const container = player.getComponent("inventory").container
    if (!player.hasTag('op')) {
      for (let i = 0; i < container.size; i++) {
        const item = container.getItem(i)

        if (item) {
          const itemEnchant = item.getComponent("enchantments").enchantments
          const itemId = item.typeId
          const itemAmount = item.amount
          const itemLore = item.getLore()

          //itemCheckA
          if (config.modules.itemCheckA.enabledA && config.modules.itemCheckA.itemlistA.includes(itemId)) {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 itemCheck/A ${player.name} 擁有違規物品`)
            world.sendMessage(`§c>>§7物品:§9 ${itemId}`)
            container.setItem(i)
            punish(player, config.modules.itemCheckA.punishmentA)
          }
          if (config.modules.itemCheckA.enabledB && config.modules.itemCheckA.itemlistB.includes(itemId)) {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 itemCheck/A ${player.name} 擁有違規物品`)
            world.sendMessage(`§c>>§7物品:§9 ${itemId}`)
            container.setItem(i)
            punish(player, config.modules.itemCheckA.punishmentA)
          }

          //itemCheckC
          if (itemAmount > config.modules.itemCheckC.limit && config.modules.itemCheckC.enabled) {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 itemCheck/C ${player.name} 物品堆疊數量異常`)
            world.sendMessage(`§c>>§7物品:§9 ${itemId} §7數量:§9 ${itemAmount}`)
            container.setItem(i)
            punish(player, config.modules.itemCheckC.punishment)
          }
          if (itemAmount > config.modules.itemCheckC.limitB && config.modules.itemCheckC.enabled && config.modules.itemCheckC.itemlist.includes(itemId)) {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 itemCheck/C ${player.name} 物品堆疊數量異常`)
            world.sendMessage(`§c>>§7物品:§9 ${itemId} §7數量:§9 ${itemAmount}`)
            container.setItem(i)
            punish(player, config.modules.itemCheckC.punishment)
          }
          if (itemAmount > 1 && config.modules.itemCheckC.enabled && !item.isStackable) {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 itemCheck/C ${player.name} 物品堆疊數量異常`)
            world.sendMessage(`§c>>§7物品:§9 ${itemId} §7數量:§9 ${itemAmount}`)
            container.setItem(i)
            punish(player, config.modules.itemCheckC.punishment)
          }

          //itemCheckD
          if (itemLore.length > 0 && !itemLore.includes(config.modules.itemCheckD.isNormalLore) && config.modules.itemCheckD.enabled) {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 itemCheck/D ${player.name} 物品有違規標籤`)
            world.sendMessage(`§c>>§7物品:§9 ${itemId} §7標籤:§9 ${itemLore}`)
            container.setItem(i)
            punish(player, config.modules.itemCheckD.punishment)
          }

          //itemCheckE
          if (config.modules.itemCheckE.enabled && itemId.endsWith("_spawn_egg")) {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 itemCheck/E ${player.name} 違規取得生成蛋`)
            world.sendMessage(`§c>>§7物品:§9 ${itemId}`)
            container.setItem(i)
            punish(player, config.modules.itemCheckE.punishment)
          }
          if (config.modules.itemCheckH.enabled && item.nameTag?.length > config.modules.itemCheckH.maxnamelength) {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 itemCheck/H ${player.name} 物品名字長度過長`)
            world.sendMessage(`§c>>§7長度:§9 ${item.nameTag.length}`)
            item.nameTag = undefined
            container.setItem(i, item)
            punish(player, config.modules.itemCheckH.punishment)
          }
          if (config.modules.itemCheckG.enabled && item.keepOnDeath) {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 itemCheck/E ${player.name} 擁有違規keepOnDeath物品`)
            world.sendMessage(`§c>>§7物品:§9 ${itemId}`)
            container.setItem(i)
            punish(player, config.modules.itemCheckE.punishment)
          }

          let enchantments = []
          let type

          for (const enchantment of itemEnchant) {
            const entype = enchantment.type.id
            const enlevel = enchantment.level
            //itemCheckB
            if (enchantment.level > enchantment.type.maxLevel && config.modules.itemCheckB.enabled && !config.modules.itemCheckB.allowmode) {
              enchantments.push({
                id: entype,
                level: enlevel
              })

              type = "A"
            }
            if (enchantment.level > config.modules.itemCheckB.allowlevel && config.modules.itemCheckB.enabled && config.modules.itemCheckB.allowmode) {
              enchantments.push({
                id: entype,
                level: enlevel
              })

              type = "B"
            }
            if (enchantment.level <= 0 && config.modules.itemCheckF.enabled) {
              enchantments.push({
                id: entype,
                level: enlevel
              })

              type = "C"
            }
            if (enchantment.level > 0 && config.modules.itemCheckI.enabled) {
              if (
                itemId.endsWith('totem') ||
                itemId.endsWith('_bucket') ||
                itemId.endsWith('boat') ||
                itemId.endsWith('minecart') ||
                itemId.endsWith('bed') ||
                item.isStackable) {
                enchantments.push({
                  id: entype,
                  level: enlevel
                })

                type = "D"
              }
            }
          }

          if (type == "A") {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 itemCheck/B ${player.name} 擁有違規附魔物品`)
            enchantments.forEach(enchantment => world.sendMessage(`§c>>§7附魔:§9 ${enchantment.id} §7等級:§9 ${enchantment.level}`))
            container.setItem(i)
            punish(player, config.modules.itemCheckB.punishment)
          }
          if (type == "B") {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 itemCheck/B ${player.name} 附魔數值過大(allowmode)`)
            enchantments.forEach(enchantment => world.sendMessage(`§c>>§7附魔:§9 ${enchantment.id} §7等級:§9 ${enchantment.level}`))
            container.setItem(i)
            punish(player, config.modules.itemCheckB.punishment)
          }
          if (type == "C") {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 itemCheck/F ${player.name} 擁有違規附魔物品`)
            enchantments.forEach(enchantment => world.sendMessage(`§c>>§7附魔:§9 ${enchantment.id} §7等級:§9 ${enchantment.level}`))
            container.setItem(i)
            punish(player, config.modules.itemCheckF.punishment)
          }
          if (type == "D") {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 itemCheck/I ${player.name} 附魔在違規物品id上`)
            enchantments.forEach(enchantment => world.sendMessage(`§c>>§7附魔:§9 ${enchantment.id} §7等級:§9 ${enchantment.level}`))
            container.setItem(i)
            punish(player, config.modules.itemCheckF.punishment)
          }
        }
      }
      const dg = config.modules.gamemode.default
      const dg2 = config.modules.gamemode.check
      if (config.modules.gamemode.gmc.enabled && getGamemode(player) === 1 && getGamemode(player) != dg2) {
        world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 gamemode/A ${player.name} 違規遊戲模式(創造模式)`)
        player.runCommand(`gamemode ${dg}`)
        punish(player, config.modules.gamemode.gmc.punishment)
      }
      if (config.modules.gamemode.gms.enabled && getGamemode(player) === 0 && getGamemode(player) != dg2) {
        world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 gamemode/B ${player.name} 違規遊戲模式(生存模式)`)
        player.runCommand(`gamemode ${dg}`)
        punish(player, config.modules.gamemode.gms.punishment)
      }
      if (config.modules.gamemode.gma.enabled && getGamemode(player) === 2 && getGamemode(player) != dg2) {
        world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 gamemode/C ${player.name} 違規遊戲模式(冒險模式)`)
        player.runCommand(`gamemode ${dg}`)
        punish(player, config.modules.gamemode.gma.punishment)
      }

      if (player.hasTag('isHardBanned') && !player.hasTag(`op`)) return player.runCommand(`kick "${player.name}" "§l§f[§dCat§bAC§f]§c 你已被管理員封禁!"`)
      if (player.hasTag('ban')) {
        player.runCommand(`gamemode spectator`)
        player.runCommand(`tp @s 0 -67 0`)
        player.runCommand(`ability @s mute true`)
        if (!player.getEffect('blindness')) {
          player.runCommand(`effect @s blindness 100000 255 true`)
        }
        if (player.hasTag('unbaning')) {
          player.runCommand(`tag @s remove ban`)
          player.runCommand(`ability @s mute false`)
          player.runCommand(`tag @s remove unbaning`)
          player.runCommand(`kill @s`)
        }

      }

      if (player.hasTag('mute') && !player.hasTag('op')) {
        player.runCommand(`ability @s mute true`)
        if (player.hasTag('unmuting')) {
          player.runCommand(`ability @s mute false`)
          player.removeTag(`mute`)
          player.removeTag(`unmuting`)
        }
      }

      //freeze
      if (player.hasTag('freezing') && !player.hasTag('op')) {
        player.runCommand(`inputpermission set @s movement disabled`)
        if (player.hasTag('unfreezing')) {
          player.runCommand(`inputpermission set @s movement enabled`)
          player.removeTag(`freezing`)
          player.removeTag(`unfreezing`)
        }
      }

      if (player.hasTag('warning')) {
        player.removeTag('warning')
        player.runCommand(`scoreboard players add @s ctwarn 1`).then(() => {
          let warntime = getScores(player, "ctwarn") ?? 0
          world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 ${player.name} 已被警告第${warntime}次`)
        })
      }

      //Anti Fly
      if (!player.isOnGround && config.modules.fly.enabled) {
        player.runCommand(`tag @s remove trident`)
        player.runCommand(`tag @s[hasitem={item=trident,location=slot.weapon.mainhand}] add trident`)
        if (!player.isFlying && player.fallDistance < -10 && !player.hasTag("trident")) {
          world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 movement/A ${player.name} 墜落狀態異常`)
          player.runCommand(`kill @s`)
          punish(player, config.modules.fly.punishment)
        }
      }

      //Anti speed
      if (config.modules.speed.enabled) {
        if (player.isOnGround && !player.isFlying && !player.isSwimming && !player.isGliding && !player.getEffect("speed") && !player.hasTag(`riding`)) {
          const speed = Math.sqrt(player.getVelocity().x ** 2 + player.getVelocity().z ** 2)
          if (player.isSprinting && speed > config.modules.speed.maxSprintingSpeed) {
            world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 movement/B ${player.name} 跑步速度異常`)
            player.kill()
            punish(player, config.modules.speed.punishment)
          } else {
            if (speed > config.modules.speed.maxWalkingSpeed) {
              world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 movement/B ${player.name} 移動速度異常`)
              player.kill()
              punish(player, config.modules.speed.punishment)
            }
          }
        }
      }

      if (config.modules.invalidSprint.enabled && player.isSprinting && player.getEffect('blindness')) {
        world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 invalidSprint/A ${player.name} 跑步狀態異常(失明效果)`)
        player.kill()
        player.removeEffect(`blindness`)
        player.isSprinting = false
        punish(player, config.modules.invalidSprint.punishment)
      }
      if (config.modules.invalidSprint.enabled && player.isSneaking && player.isSrinpting) {
        world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 invalidSprint/B ${player.name} 跑步狀態異常(蹲下)`)
        player.kill()
        player.isSprinting = false
        punish(player, config.modules.invalidSprint.punishment)
      }
      if (config.modules.invalidSprint.enabled && player.isGilding && player.isSprinting) {
        world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 invalidSprint/C ${player.name} 跑步狀態異常(滑翔)`)
        player.kill()
        player.isSprinting = false
        punish(player, config.modules.invalidSprint.punishment)
      }

      //crasher
      if(
        player.location.x > 3000000 ||
        player.location.y > 3000000 ||
        player.location.z > 3000000 ||
        player.location.x < -3000000 ||
        player.location.y < -3000000 ||
        player.location.z < -3000000
        ){
        player.teleport({
          x: 0,
          y: 0,
          z: 0
        })
        if(!player.hasTag('op') && config.modules.crasher.enabled){
          player.kill()
          world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 crasher/A ${player.name} 已被攔截使用crasher`)
        }
      }

      //timer V2 lol
      if (system.currentTick % 20 == 0) {
        player.runCommand(`scoreboard players set @s[scores={cps=!0}] cps 0`)
      }
      player.runCommand(`scoreboard players set @s[scores={blockBreak=!0}] blockBreak 0`)
    }

    //forceOP A
    if (config.modules.forceOP.enabled && !config.modules.forceOP.oplist.includes(player.name) && player.hasTag(`op`)) {
      world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 forceOP/A ${player.name} 正在嘗試奪取OP權限`)
      player.runCommand(`tag @s remove op`)
      punish(player, config.modules.forceOP.punishment)
    }
  }

  worldLoad ? null : world.getDimension('overworld').runCommandAsync(`testfor @a`).then(e => {
    if (!worldLoad) {
      world.sendMessage(`§l§f[§dCat§bAC§f]§r§7 插件載入成功!`)
      worldLoad = true
      try {
        world.scoreboard.addObjective('chatsSent', 'chatsSent')
        world.scoreboard.addObjective('cps', 'cps')
        world.scoreboard.addObjective('blockBreak', 'blockBreak')
        world.scoreboard.addObjective('ctwarn', 'ctwarn')
      } catch { }
    }
  }, onrejected => {
    return
  })

  if (system.currentTick % 20 == 0) {
    timer()
  }
})

system.beforeEvents.watchdogTerminate.subscribe(ev => {
  ev.cancel = true
})