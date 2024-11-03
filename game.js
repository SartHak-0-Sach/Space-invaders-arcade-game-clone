// Initialize Kaboom
kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    width: 1920,
    background: [0, 0, 0],
});

// Load Assets
loadSprite("player", "assets/player.png");
loadSprite("mermi", "assets/mermi.png");
loadSprite("alien_1", "assets/alien_1.png");
loadSound("shoot", "sfx/shoot.mp3");
loadSound("hit", "sfx/hit.mp3");
loadSound("music", "sfx/music.mp3");

// Play Background Music
const music = play("music", { volume: 0.8, loop: true });

// Utility function for adding text
function addText(textValue, position)
{
    add([text(textValue), pos(position)]);
}

// Menu Scene
scene("menu", () =>
{
    music.restart();

    // Title
    add([text("Space Invaders Clone"), pos(960, 100), origin("center")]);

    // Instructions
    addText("Use arrow keys for move", vec2(25, 800));
    addText("Use space key for shoot", vec2(25, 875));

    // Function to add buttons
    function addButton(txt, p, f)
    {
        const btn = add([
            text(txt, 8),
            pos(p),
            area({ cursor: "pointer" }),
            scale(1),
            origin("center"),
        ]);
        btn.clicks(f);

        // Button Hover Effect
        btn.hovers(() =>
        {
            const t = time() * 10;
            btn.color = rgb(wave(0, 255, t), wave(0, 255, t + 2), wave(0, 255, t + 4));
            btn.scale = vec2(1.2);
        }, () =>
        {
            btn.scale = vec2(1);
            btn.color = rgb();
        });
    }

    // Menu Buttons
    addButton("Start Game", vec2(960, 300), () => go("game"));
    addButton("Quit", vec2(960, 400), () => debug.log("Exiting game (placeholder)"));

    // Toggle Fullscreen
    keyPress("f", () => fullscreen(!fullscreen()));
});

// Game Scene
scene("game", () =>
{
    let playerSpeed = 500;
    let bulletSpeed = 800;
    let alienSpeed = 100;

    // Score Display
    const score = add([text("Score: 0"), pos(24, 24), { value: 0 }]);

    // Health Display
    const healthText = add([text("Health: 50"), pos(24, 98), { value: 50 }]);

    // Define Boundaries
    function limits()
    {
        add([rect(1920, 2), pos(0, 0), area(), solid(), color(0, 0, 0), "top_wall"]);
        add([rect(1920, 2), pos(0, 930), area(), solid(), color(0, 0, 0), "bottom_wall"]);
        add([rect(2, 1080), pos(30, 0), area(), solid(), color(0, 0, 0), "side_wall"]);
        add([rect(2, 1080), pos(1888, 0), area(), solid(), color(0, 0, 0), "side_wall"]);
    }

    // Player
    const player = add([sprite("player"), pos(950, 850), area(), solid(), health(50), "player"]);

    // Controls
    keyDown("left", () => player.move(-playerSpeed, 0));
    keyDown("right", () => player.move(playerSpeed, 0));
    keyPress("space", () =>
    {
        shoot();
        play("shoot");
    });

    // Fullscreen Toggle
    keyPress("f", () => fullscreen(!fullscreen()));

    // Shooting Function
    function shoot()
    {
        add([
            sprite("mermi"),
            scale(2),
            pos(player.pos.x + 17.5, player.pos.y - 70),
            area(),
            solid(),
            move(UP, bulletSpeed),
            "mermi"
        ]);
    }

    // Alien Spawn Function
    function spawnAlien()
    {
        add([
            sprite("alien_1"),
            area(),
            pos(rand(0, 1800), rand(100, 300)),
            scale(2),
            solid(),
            move(DOWN, alienSpeed),
            "alien"
        ]);

        wait(rand(0.5, 1.5), spawnAlien);
    }

    // Start Alien Spawn
    spawnAlien();

    // Collision Handling
    collides("alien", "mermi", (alien, bullet) =>
    {
        destroy(alien);
        destroy(bullet);
        addKaboom(bullet.pos);
        play("hit");
        score.value += 1;
        score.text = `Score: ${score.value}`;
    });

    collides("mermi", "top_wall", (bullet) => destroy(bullet));

    collides("alien", "bottom_wall", (alien) =>
    {
        destroy(alien);
        shake();
        player.hurt(1);
        healthText.value -= 1;
        healthText.text = `Health: ${healthText.value}`;
    });

    collides("player", "alien", (player, alien) =>
    {
        destroy(alien);
        shake();
        player.hurt(1);
        healthText.value -= 1;
        healthText.text = `Health: ${healthText.value}`;
    });

    // Add Boundaries
    limits();

    // Game Over
    player.on("death", () =>
    {
        music.stop();
        destroy(player);
        go("menu");
    });
});

// Start the Game
go("menu");
