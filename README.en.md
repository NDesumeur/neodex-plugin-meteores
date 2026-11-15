# Météores (Meteors)

A vertical scrolling space shooter: your ship fires on its own, and it is up to you to fly it anywhere on screen to destroy meteors, enemy drones and a flagship every 5 waves, without getting hit.

*Version française : [README.md](README.md)*

## Controls

- **Arrows**, **ZQSD** (WASD on QWERTY) or **mouse**: move the ship anywhere on screen.
- The ship **fires on its own**.
- **Space** or **right-click**: **bomb**, which clears the screen (at least one per wave).
- **P** or **Escape**: pause.
- **Gamepad**: left stick or d-pad to move, **A** to play, **B** or **X**: bomb, **Start**: pause.
- **Full screen**: the button of the same name; Escape to leave it. Otherwise the game takes all the height the window leaves.

## Rules

- Only the **cockpit** (the white dot in the middle of the ship) can be hit: you can graze shots.
- **Meteors** split into two smaller ones when broken.
- **Drones** come in waves, zigzag and shoot.
- Every 5 waves, an alert announces a **flagship**; it drops a shower of bonuses when destroyed.
- You start with 3 lives. Getting hit costs a life, a weapon level and your multiplier; a few moments of invincibility follow.

## Bonuses

- **P**: stronger weapon (5 levels; at the maximum, 500 points instead).
- **Bomb**: one more bomb (5 at most).
- **S**: shield for 15 seconds.
- **L**: one more life (6 at most).
- **Magnet**: pulls in every bonus for 10 seconds.
- Shards to collect for points.

## Points

Each destroyed enemy is worth points, multiplied by your **multiplier**: it rises by 0.5 every 10 enemies destroyed without being hit, up to ×8, and drops back if you go 4 seconds without destroying anything. Each cleared wave is worth 200 points times the wave number.

## Sounds and music

Everything is played live, with no files: old-school video game music (bass, drums and a melody drawn each game), faster and darker against the flagship; sounds for shots, explosions, the bomb, bonuses, the alert and game over. The **Music** and **Sounds** buttons turn either off, and your choice is kept. The music goes quiet while paused.

## Text

The game's text is in big pixel letters: the score at the top, and a title screen, pause and game over that read from afar.

## Statistics

At the end of a game: your score, the wave reached and your record (or "new record"). Beside the game: your best score, best wave and number of games.

## Data and sync

Your record and best wave are stored by NeoDex, backed up and synced between your PCs when sync is on.

## Install

In NeoDex: **NeoStore → Discover → Météores → Install**.

Building a plugin: see the [NeoDex SDK](https://github.com/NDesumeur/neodex-sdk).
