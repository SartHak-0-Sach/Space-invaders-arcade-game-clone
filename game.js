kaboom({
    global: true,
    fullscreen: true,
    scale: 1,
    debug: true,
    width: 1920,
    background: [0, 0, 0],
});

console.log("game.js is running"); // This should show in the console when game.js is loaded

// Load assets
loadSprite("player", "assets/player.png");
loadSprite("mermi", "assets/mermi.png");
loadSprite("alien_1", "assets/alien_1.png");
loadSound("shoot", "sfx/shoot.mp3");
loadSound("hit", "sfx/hit.mp3");
loadSound("music", "sfx/music.mp3");

const music = play("music", {
    volume: 0.8,
    loop: true,
});

function addText(textValue, position)
{
    add([
        text(textValue),
        pos(position),
    ]);
}

scene("menu", () =>
{
    music.play(); // Start music (fix from using `music.restart`)

    add([
        text("Space Invaders Clone"),
        pos(960, 100),
        origin("center"),
    ]);

    addText("Use arrow keys to move", vec2(25, 800));
    addText("Use space key to shoot", vec2(25, 875));

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

        btn.hovers(() =>
        {
            const t = time() * 10;
            btn.color = rgb(
                wave(0, 255, t),
                wave(0, 255, t + 2),
                wave(0, 255, t + 4),
            );
            btn.scale = vec2(1.2);
        }, () =>
        {
            btn.scale = vec2(1);
            btn.color = rgb();
        });
    }

    addButton("Start Game", vec2(960, 300), () => go("game"));
    addButton("Quit", vec2(960, 400), () => console.log("Exiting game"));

    action(() => cursor("default"));
});

scene("game", () =>
{
    let hareketHizi = 500;
    let mermiHizi = 800;
    let alienSpeed = 100;

    const score = add([
        text("Score: 0"),
        pos(24, 24),
        { value: 0 },
    ]);

    function limits()
    {
        add([rect(1920, 2), pos(0, 0), area(), solid(), color(0, 0, 0), "top_wall"]);
        add([rect(1920, 2), pos(0, 930), area(), solid(), color(0, 0, 0), "bottom_wall"]);
        add([rect(2, 1080), pos(30, 0), area(), solid(), color(0, 0, 0), "side_wall"]);
        add([rect(2, 1080), pos(1888, 0), area(), solid(), color(0, 0, 0), "side_wall"]);
    }

    const player = add([
        sprite("player"),
        pos(950, 850),
        area(),
        solid(),
        health(50),
        "player",
    ]);

    keyDown("left", () => player.move(-hareketHizi, 0));
    keyDown("right", () => player.move(hareketHizi, 0));

    keyPress("space", () =>
    {
        atesEt();
        play("shoot");
    });

    function atesEt()
    {
        add([
            sprite("mermi"),
            scale(2),
            pos(player.pos.x + 17.5, player.pos.y - 70),
            area(),
            solid(),
            move(UP, mermiHizi),
            "mermi",
        ]);
    }

    function spawnAlien()
    {
        add([
            sprite("alien_1"),
            area(),
            pos(rand(0, 1800), rand(100, 300)),
            scale(2),
            solid(),
            move(DOWN, alienSpeed),
            "alien",
        ]);
        wait(rand(0.5, 1.5), spawnAlien);
    }

    spawnAlien();

    const healthText = add([
        text("Health: 50"),
        pos(24, 98),
        { value: 50 },
    ]);

    collides("alien", "mermi", (e, mermi) =>
    {
        destroy(e);
        destroy(mermi);
        addKaboom(mermi.pos);
        play("hit");
        score.value += 1;
        score.text = "Score: " + score.value;
    });

    collides("mermi", "top_wall", (mermi) => destroy(mermi));
    collides("alien", "bottom_wall", () => player.hurt(1));

    limits();

    player.on("death", () =>
    {
        music.stop();
        destroy(player);
        go("menu");
    });
});

go("menu");
