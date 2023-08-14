import * as Minecraft from '@minecraft/server'
import { chatrank } from './chat/chat.js'
import { timer } from './chat/chatlimit.js'
import config from './data/config.js'
let tick = 0, worldLoad = false;
let fall = [] //for noFall use
let hitList = [] //for killauraA use

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

function killDroppedItem(x, y, z, dimension = "overworld"){
  const items = Minecraft.world.getDimension(dimension).getEntities({
    location: {x: x, y: y, z: z},
    maxDistance: 2,
    minDistance: 0,
    type: "minecraft:item"
  })
  for(const item of items){
    item.kill()
  }
}

function flag(player, type, detect){
  world.sendMessage(`§bCat§dAC §c>> §e${player.name} §7檢測 §7[${type}] §7(${detect})`)
}
function notify(type, text){
  world.sendMessage(`§bCat§dAC §c>> §e執行 §7檢測 §7[${type}] $7(${detect})`)
}
function show(text, value){
  world.sendMessage(`§c>> §7${text}: §9${value}`)
}
const acname = "§bCat§dAC §c>> §7"

//entityCheckA
world.afterEvents.entitySpawn.subscribe(data => {
  if (config.modules.cbe.enabled) {
    const entity = data.entity
    if (entity.typeId == "minecraft:npc") {
      if (entity.hasTag('cbe:allowednpc') && config.modules.cbe.allowsummonnpc) {
        return;
      } else {
        const entityId = entity.typeId
        notify("misc", "entityCheck/A")
        show("實體", entityId)
        entity.kill()
      }
    }
  }
})
world.afterEvents.chatSend.subscribe(data => {
  if(!config.modules.antispamD.enabled) return
  const player = data.sender
  if(player.hasTag('op') || !player.isFalling || !player.isGliding || !player.isOnGround) return
  if(player.getVelocity().x > 0 || player.getVelocity().z > 0 ){
    flag(player, "misc", "spammer/D")
    player.kill()
    punish(player, config.modules.antispamD.punishment)
  }
}
world.beforeEvents.chatSend.subscribe((data) => {
  // console.warn(data.sender.scoreboard) presents a bug if no score in any obj
  // console.warn(world.scoreboard.getObjective('chatsSent').getScore(data.sender.scoreboard))
  chatrank(data)
})
world.afterEvents.entityHitEntity.subscribe(data => {
  //killaura
  const player = data.damagingEntity
  const target = data.hitEntity
  if (config.modules.killauraB.enabled && player.hasTag('op')) {
    const x1 = player.location.x
    const x2 = target.location.x
    const y1 = player.location.z
    const y2 = target.location.z
    const roatation = Math.atan2((y2 - y1), (x2 - x1)).getRotation().y
    if (roatation > 90 || roatation < -90){
      flag(player, "combat", "killaura/B")
      player.kill()
      punish(player, config.modules.killauraB.punishment)
    }
  }
  if (config.modules.ac.enabled && !player.hasTag("op")) {
    data.damagingEntity.runCommand(`scoreboard players add @s[type=player] cps 1`)
    let cps = getScores(player, "cps") ?? 0
    if (cps > config.modules.ac.illegalcps) {
      const showcps = config.modules.ac.illegalcps
      flag(player, "combat", "autoClicker/A")
      show("cps", cps)
      player.kill()
      punish(player, config.modules.ac.punishmentB)
    } else {
      if (cps > config.modules.ac.maxcps && system.currentTick % 2 == 0) {
        const showcps = config.modules.ac.maxcps
        flag(player, "combat", "autoClicker/A")
        show("cps", cps)
        player.kill()
      }
    }
  }
  if (config.modules.killauraA.enabled && !player.hasTag('op')) {
    if(player.typeId !== "minecraft:player") return
    if(!hitList[player.name].includes(target.id)) hitList[player.name].push(target.id)
    if(hitList.length > config.modules.maxtargetintick){
      flag(player, "combat", "killaura/A")
    }
  }
  if (config.modules.killauraB.enabled && !player.hasTag('op')) {
    if(player.typeId !== "minecraft:player") return
    const x1 = player.location.x
    const x2 = target.location.x
    const y1 = player.location.z
    const y2 = target.location.z
    const lRoatation = Math.atan2((y2 - y1), (x2 - x1)) * 180 / Math.PI
    const yRotation = player.getRotation().y < 0 ? 360 - player.getRotation().y : player.getRotation().y
    const sRoatation = config.modules.killauraB.maxattackangle / 2
    const minRotation2 = yRotation - sRoatation
    const maxRotation2 = yRotation + sRoatation
    const minRotation = minRotation2 < 0 ? 360 + minRotation : minRotation2
    const maxRotation = maxRotation2 > 360 ? maxRotation - 360 : maxRotation2
    let inAngle = false
    let allowedRotation = []
    let minRotation3 = Math.round(minRotation)
    while(minRotation3 != Math.round(maxRotation)){
      if(minRotation3 > 360) minRotation3 = 0
      allowedRotation.push(minRotation3)
      minRotation3++
    }
    if (allowedRotation.includes(Math.round(lRoatation))) inAngle = true
    if (!inAngle){
      flag(player, "combat", "killaura/B")
      player.kill()
      punish(player, config.modules.killauraB.punishment)
    }
  }
  if(config.modules.reachA.enabled && !player.hasTag('op')){
    if(player.typeId !== "minecraft:player") return
    if(player.getGamemode(player) == 1) return
    const distance = Minecraft.Vector.distance(player.location(x, y, z), target.location(x, y, z))
    if(distance > config.modules.reachA.maxDistance){
      flag(player, "combat", "reach/A")
      show("距離", distance)
      punish(player, config.modules.reachA.punishment)
    }
  }
})
//placeCheck
world.afterEvents.blockPlace.subscribe(data => {
  const player = data.player
  if (config.modules.placeCheck.enabled && !player.hasTag("op")) {
    const blockId = data.block.typeId
    if (config.modules.placeCheck.blocklist.includes(blockId)) {
      flag(player, "block", "placeCheck/A")
      show("方塊", blockId)
      data.block.setType(Minecraft.MinecraftBlockTypes.air)
      punish(player, config.modules.placeCheck.punishment)
    }
  }
  if (config.modules.reachC.enabled && !player.hasTag('op')){
    if(getGamemode(player) == 1) return
    const block = data.block
    const distance = Minecraft.Vector.distance(player.location(x, y, z), block.location(x, y, z))
    if(distance > config.modules.reachC.maxDistance){
      flag(player, "misc", "reach/C")
      show("距離", distance)
      punish(player, config.modules.reachC.punishment)
    }
  }
})
world.afterEvents.blockBreak.subscribe(data => {
  const player = data.player
  if (config.modules.nuker.enabled && !player.hasTag("op") && !player.hasTag('banBreak')) {
    let blocktick = getScores(player, "blockBreak") ?? 0

    player.runCommand(`scoreboard players add @s blockBreak 1`)

    if (blocktick >= config.modules.nuker.maxdestroy) {
      player.runCommand(`scoreboard players set @s blockBreak 0`)
      killDroppedItem(block.x, block.y, block.z)
      data.block.setPermutation(data.brokenBlockPermutation.clone())
      player.addTag('noBreak')
      flag(player, "block", "nuker/A")
      punish(player, config.modules.nuker.punishment)
    }
  }
  if (config.modules.insteaBreak.enabled && !player.hasTag("op")) {
    if (player.hasTag('op') || getGamemode(player) == 1) return
    const blockId = data.brokenBlockPermutation.typeId
    const block = data.brokenBlockPermutation
    if (config.modules.insteaBreak.blocklist.includes(blockId)) {
      //insteaBreakA
      killDroppedItem(block.x, block.y, block.z)
      data.block.setPermutation(data.brokenBlockPermutation.clone())
      flag(player, "block", "InsteaBreak/A")
      show("方塊", blockId)
      punish(player, config.modules.insteaBreak.punishment)
    }
  }
  if (config.modules.reachB.enabled && !player.hasTag('op')){
    if(getGamemode(player) == 1) return
    const block = data.brokenBlockPermutation
    const distance = Minecraft.Vector.distance(player.location(x, y, z), block.location(x, y, z))
    if(distance > config.modules.reachB.maxDistance){
      flag(player, "misc", "reach/B")
      show("距離", distance)
      punish(player, config.modules.reachB.punishment)
    }
  }
  if(player.hasTag('banBreak')){
    const block = data.brokenBlockPermutation
    killDroppedItem(block.x, block.y, block.z)
    data.block.setPermutation(data.brokenBlockPermutation.clone())
  }
})
world.afterEvents.playerSpawn.subscribe(data => {
  const player = data.player
  //HardBan
  if (config.modules.namespoof.enabled && data.initialSpawn && !player.hasTag("op")) {
    player.sendMessage(`${acname}此伺服器受到保護 !info 了解更多 | by jasonlaubb`)
    //namespoofA
    const strings = config.modules.namespoof.strings

    let name = player.name

    for (const string of strings) {
      name = name.replaceAll(string, "")
    }

    if (name.length > 0) {
      flag(player, "misc", "nameSpoof/A")
      player.runCommand(`kick "${player.name}" "${acname}你被檢測出使用Namespoof"`)
    }
    //namespoofB
    if (player.name.length > config.modules.namespoof.maxnamelegnth || player.name.length < config.modules.namespoof.minnamelegnth) {
      flag(player, "misc", "nameSpoof/A")
      player.runCommand(`kick "${player.name}" "${acname}你被檢測出使用Namespoof"`)
    }
  }
  if (config.modules.wellcomer.enabled && !player.hasTag('notnew')) {
    player.runCommand(`tag @s add notnew`)
    world.sendMessage(`${acname}§g歡迎 ${player.name}§g首次加入這個伺服器!`)
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
            flag(player, "item", "itemCheck/A")
            show("物品", itemId)
            container.setItem(i)
            punish(player, config.modules.itemCheckA.punishmentA)
          }
          if (config.modules.itemCheckA.enabledB && config.modules.itemCheckA.itemlistB.includes(itemId)) {
            flag(player, "item", "itemCheck/A")
            show("物品", itemId)
            container.setItem(i)
            punish(player, config.modules.itemCheckA.punishmentA)
          }

          //itemCheckC
          if (itemAmount > config.modules.itemCheckC.limit && config.modules.itemCheckC.enabled) {
            flag(player, "item", "itemCheck/C")
            show("數量", itemAmount)
            show("物品", itemAmount)
            container.setItem(i)
            punish(player, config.modules.itemCheckC.punishment)
          }
          if (itemAmount > config.modules.itemCheckC.limitB && config.modules.itemCheckC.enabled && config.modules.itemCheckC.itemlist.includes(itemId)) {
            flag(player, "item", "itemCheck/C")
            show("數量", itemAmount)
            show("物品", itemAmount)
            container.setItem(i)
            punish(player, config.modules.itemCheckC.punishment)
          }
          if (itemAmount > 1 && config.modules.itemCheckC.enabled && !item.isStackable) {
            flag(player, "item", "itemCheck/C")
            show("數量", itemAmount)
            show("物品", itemAmount)
            container.setItem(i)
            punish(player, config.modules.itemCheckC.punishment)
          }

          //itemCheckD
          if (itemLore.length > 0 && !itemLore.includes(config.modules.itemCheckD.isNormalLore) && config.modules.itemCheckD.enabled) {
            flag(player, "item", "itemCheck/D")
            show("數量", itemAmount)
            show("Lore", itemLore)
            container.setItem(i)
            punish(player, config.modules.itemCheckD.punishment)
          }

          //itemCheckE
          if (config.modules.itemCheckE.enabled && itemId.endsWith("_spawn_egg")) {
            flag(player, "item", "itemCheck/E")
            show("物品", itemId)
            container.setItem(i)
            punish(player, config.modules.itemCheckE.punishment)
          }
          if (config.modules.itemCheckH.enabled && item.nameTag?.length > config.modules.itemCheckH.maxnamelength) {
            flag(player, "item", "itemCheck/H")
            show("長度", item.nameTag.length)
            item.nameTag = undefined
            container.setItem(i, item)
            punish(player, config.modules.itemCheckH.punishment)
          }
          if (config.modules.itemCheckG.enabled && item.keepOnDeath) {
            flag(player, "item", "itemCheck/G")
            show("物品", itemId)
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
            flag(player, "item", "itemCheck/B")
            enchantments.forEach(enchantment => show(enchantment.id, enchantment.level))
            container.setItem(i)
            punish(player, config.modules.itemCheckB.punishment)
          }
          if (type == "B") {
            flag(player, "item", "itemCheck/B")
            enchantments.forEach(enchantment => show(enchantment.id, enchantment.level))
            container.setItem(i)
            punish(player, config.modules.itemCheckB.punishment)
          }
          if (type == "C") {
            flag(player, "item", "itemCheck/F")
            enchantments.forEach(enchantment => show(enchantment.id, enchantment.level))
            container.setItem(i)
            punish(player, config.modules.itemCheckF.punishment)
          }
          if (type == "D") {
            flag(player, "item", "itemCheck/I")
            show("物品", itemId)
            container.setItem(i)
            punish(player, config.modules.itemCheckI.punishment)
          }
        }
      }
      const dg = config.modules.gamemode.default
      const dg2 = config.modules.gamemode.check
      if (config.modules.gamemode.gmc.enabled && getGamemode(player) === 1 && getGamemode(player) != dg2) {
        flag(player, "misc", "gamemode/A")
        show("模式", "1")
        player.runCommand(`gamemode ${dg}`)
        punish(player, config.modules.gamemode.gmc.punishment)
      }
      if (config.modules.gamemode.gms.enabled && getGamemode(player) === 0 && getGamemode(player) != dg2) {
        flag(player, "misc", "gamemode/B")
        show("模式", "0")
        punish(player, config.modules.gamemode.gms.punishment)
      }
      if (config.modules.gamemode.gma.enabled && getGamemode(player) === 2 && getGamemode(player) != dg2) {
        flag(player, "misc", "gamemode/C")
        show("模式", "2")
        punish(player, config.modules.gamemode.gma.punishment)
      }

      if (player.hasTag('isHardBanned') && !player.hasTag(`op`)) return player.runCommand(`kick "${player.name}" "${acname}你已被管理員封禁!"`)
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
          world.sendMessage(`${acname}${player.name} 已被警告第${warntime}次`)
        })
      }

      //Anti Fly
      if (!player.isOnGround && config.modules.fly.enabled) {
        player.runCommand(`tag @s remove trident`)
        player.runCommand(`tag @s[hasitem={item=trident,location=slot.weapon.mainhand}] add trident`)
        if (!player.isFlying && player.fallDistance < -10 && !player.hasTag("trident")) {
          flag(player, "movement", "fly")
          player.kill()
          punish(player, config.modules.fly.punishment)
        }
      }

      //Anti speed
      if (config.modules.speed.enabled) {
        if (player.isOnGround && !player.isFlying && !player.isSwimming && !player.isGliding && !player.getEffect("speed") && !player.hasTag(`riding`)) {
          const speed = Math.sqrt(player.getVelocity().x ** 2 + player.getVelocity().z ** 2)
          if (player.isSprinting && speed > config.modules.speed.maxSprintingSpeed) {
            flag(player, "movement", "speed/A")
            player.kill()
            punish(player, config.modules.speed.punishment)
          } else {
            if (speed > config.modules.speed.maxWalkingSpeed) {
              flag(player, "movement", "speed/B")
              player.kill()
              punish(player, config.modules.speed.punishment)
            }
          }
        }
      }

      //fast ladder
      if (config.modules.fastladder.enabled && !player.hasTag('op')){
        if (player.isClimbing && player.getVelocity().y > config.modules.fastladder.maxClimbingSpeed){
          flag(player, "movement", "fastladder/A")
          player.kill()
          punish(player, config.modules.fastladder.punishment)
        }
      }

      if (config.modules.jeues.enabled && !player.hasTag('op')){
        if (getGamemode(player) == 1 || !player.isOnGround || player.isInWater) return
        const gb = Minecraft.world.getDimension(dimension)
        const pl = player.location
        if(gb.getBlock({x: pl.x, y: pl.y - 1, z: pl.z}).typeId !== "minecraft:water") return player.runCommand(`scoreboard players set @s onWater 0`)
        let groundBlock = [
          gb.getBlock({x: pl.x + 1, y: pl.y - 1, z: pl.z}),
          gb.getBlock({x: pl.x - 1, y: pl.y - 1, z: pl.z}),
          gb.getBlock({x: pl.x, y: pl.y - 1, z: pl.z + 1}),
          gb.getBlock({x: pl.x, y: pl.y - 1, z: pl.z - 1}),
          gb.getBlock({x: pl.x - 1, y: pl.y - 1, z: pl.z - 1}),
          gb.getBlock({x: pl.x + 1, y: pl.y - 1, z: pl.z + 1}),
          gb.getBlock({x: pl.x + 1, y: pl.y - 1, z: pl.z - 1}),
          gb.getBlock({x: pl.x - 1, y: pl.y - 1, z: pl.z + 1}),
        ]
        for(let i = 0; i < groundBlock.length; i++){
          if(groundBlock[i].typeId !== "minecraft:water") return player.runCommand(`scoreboard players set @s onWater 0`)
        }
        player.runCommand(`scoreboard players add @s onWater 1`)
        let onWaterTimer = getScores(player, "onWater") ?? 0
        if(onWaterTimer > config.modules.jeues.maxtickallowed){
          flag(player, "movement", "jeues/A")
          player.kill()
          punish(player, config.modules.jeues.punishment)
          player.runCommand(`scoreboard players set @s onWater 0`)
        }
      }

      if(config.modules.killauraA.enabled && player.hasTag('op')){
        hitList[player.name] = []
        //clear hitList length
      }

      if (config.modules.invalidSprint.enabled && player.isSprinting && player.getEffect('blindness')) {
        flag(player, "movement", "invalidSprint/A")
        player.kill()
        player.removeEffect(`blindness`)
        player.isSprinting = false
        punish(player, config.modules.invalidSprint.punishment)
      }
      if (config.modules.invalidSprint.enabled && player.isSneaking && player.isSrinpting) {
        flag(player, "movement", "invalidSprint/B")
        player.kill()
        player.isSprinting = false
        punish(player, config.modules.invalidSprint.punishment)
      }
      if (config.modules.invalidSprint.enabled && player.isGilding && player.isSprinting) {
        flag(player, "movement", "invalidSprint/C")
        player.kill()
        player.isSprinting = false
        punish(player, config.modules.invalidSprint.punishment)
      }

      //crasher
      if(
        player.location.x >= 3000000 ||
        player.location.y >= 3000000 ||
        player.location.z >= 3000000 ||
        player.location.x <= -3000000 ||
        player.location.y <= -3000000 ||
        player.location.z <= -3000000
        ){ //why I need to add =? idk why I need to do that, it is a good question bruh but I know that it might useless but it have a chance useful maybe, who know that?
        player.teleport({
          x: 0,
          y: 0,
          z: 0
        })
        if(!player.hasTag('op') && config.modules.crasher.enabled){
          player.kill()
          flag(player, "misc", "crasher/A")
          punish(player, config.modules.crasher.punishment)
        }
      }

      //timer V2 lol
      if (system.currentTick % 20 == 0) {
        player.runCommand(`scoreboard players set @s[scores={cps=!0}] cps 0`)
      }
      player.runCommand(`scoreboard players set @s[scores={blockBreak=!0}] blockBreak 0`)
    }

    //forceOP A
    if (config.modules.forceopA.enabled && !config.modules.forceopA.oplist.includes(player.name) && player.hasTag(`op`)) {
      flag(player, "misc", "forceOP/A")
      player.runCommand(`tag @s remove op`)
      punish(player, config.modules.forceOP.punishment)
    }
    if (config.modules.forceopB.enabled && !config.modules.forceopA.oplist.includes(player.name) && player.isOP){
      flag(player, "misc", "forceOP/B")                    //oplist are using forceopA
      player.setOp = false
      punish(player, config.modules.forceOP.punishment)
    }
    if (config.modules.noFall.enabled){
      fall[player.name] ??= 0
      if(player.fallDistance > 0){
        if(fall[player.name] < 0 && player.getVelocity().y == 0 && !player.isFlying){
          flag(player, "movement", "NoFall")
          player.kill()
        }
        fall[player.name] = player.getVelocity().y
      }
    }
  }

  worldLoad ? null : world.getDimension('overworld').runCommandAsync(`testfor @a`).then(e => {
    if (!worldLoad) {
      world.sendMessage(`${acname}插件載入成功!`)
      worldLoad = true
      try {
        world.scoreboard.addObjective('chatsSent', 'chatsSent')
        world.scoreboard.addObjective('cps', 'cps')
        world.scoreboard.addObjective('blockBreak', 'blockBreak')
        world.scoreboard.addObjective('ctwarn', 'ctwarn')
        world.scoreboard.addObjective('onWater', 'onWater')
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
  world.sendMessage(`${acname}A watchdogTerminate has been cancelled`)
})