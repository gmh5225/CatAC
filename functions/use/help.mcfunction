tellraw @s {"rawtext":[{"text":"§l§f[§dCat§bAC§f] §r§r§g聊天指令功能表"}]}
tellraw @s {"rawtext":[{"text":"§g!info - 顯示反外掛資訊"}]}
tellraw @s {"rawtext":[{"text":"§g!help - 顯示CatAC功能表"}]}
tellraw @s {"rawtext":[{"text":"§g!list - 在線玩家及管理員"}]}
tellraw @s {"rawtext":[{"text":"§g!wcheck - 顯示自己的紀錄"}]}
tellraw @s[tag=!op] {"rawtext":[{"text":"§l§f[§dCat§bAC§f]§r§7 如果需要顯示管理員功能表, 請使用/tag @s add op"}]}
tellraw @s[tag=op] {"rawtext":[{"text":"§l§f[§dCat§bAC§f] §r§r§g功能表\n!ban @player true/false(是否是HardBan) - 封禁該名玩家"}]}
tellraw @s[tag=op] {"rawtext":[{"text":"§g!unban @player - 解封該名玩家"}]}
tellraw @s[tag=op] {"rawtext":[{"text":"§g!ecw @player - 清除該名玩家終界箱內物品"}]}
tellraw @s[tag=op] {"rawtext":[{"text":"§g!mute @player - 靜音該名玩家"}]}
tellraw @s[tag=op] {"rawtext":[{"text":"§g!unmute @player - 解除該名玩家靜音"}]}
tellraw @s[tag=op] {"rawtext":[{"text":"§g!freeze @player - 凍結該名玩家"}]}
tellraw @s[tag=op] {"rawtext":[{"text":"§g!unfreeze @player - 解除凍結該名玩家"}]}
tellraw @s[tag=op] {"rawtext":[{"text":"§g!warn @player - 警告並記錄該名玩家"}]}
tellraw @s[tag=op] {"rawtext":[{"text":"§g!cleartext - 清除聊天欄訊息"}]}
tellraw @s[tag=op] {"rawtext":[{"text":"§g!kit unfair/legit/fair - 喚出KIT裝備盒"}]}
tellraw @s[tag=op] {"rawtext":[{"text":"§g前往 script/data/config.js 調整設置"}]}