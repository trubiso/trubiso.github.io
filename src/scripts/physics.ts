import Matter from "matter-js";

const { Engine, Bodies, Composite, Mouse, MouseConstraint, Runner, Events } =
  Matter;

export function initializePhysics(container: HTMLElement) {
  const engine = Engine.create();
  engine.gravity.y = 1;

  const width = container.clientWidth;
  const height = container.clientHeight;

  const elements = Array.from(
    container.querySelectorAll<HTMLElement>(".interest"),
  );
  for (let i = 0; i < elements.length; ++i) {
    const j = Math.floor(Math.random() * elements.length);
    const tmp = elements[i];
    elements[i] = elements[j];
    elements[j] = tmp;
  }

  const padding = 20;
  const gap = 12;
  const rowGap = 20;

  // Measure cards and calculate their spawn positions.
  const measurements = elements.map((element) => {
    const rect = element.getBoundingClientRect();

    return {
      element,
      width: rect.width,
      height: rect.height,
    };
  });

  // Pack cards into rows based on their actual widths.
  const rows: (typeof measurements)[] = [];
  let currentRow: typeof measurements = [];
  let currentRowWidth = 0;

  for (const card of measurements) {
    const requiredWidth =
      currentRow.length === 0 ? card.width : gap + card.width;

    if (
      currentRowWidth + requiredWidth > width - padding * 2 &&
      currentRow.length > 0
    ) {
      rows.push(currentRow);
      currentRow = [];
      currentRowWidth = 0;
    }

    currentRow.push(card);
    currentRowWidth += currentRow.length === 1 ? card.width : gap + card.width;
  }

  if (currentRow.length > 0) {
    rows.push(currentRow);
  }

  const objects: {
    element: HTMLElement;
    body: Matter.Body;
  }[] = [];

  let y = 30;

  rows.forEach((row) => {
    const rowHeight = Math.max(...row.map((card) => card.height));

    // Center each row.
    const totalWidth =
      row.reduce((sum, card) => sum + card.width, 0) + gap * (row.length - 1);

    let x = Math.max(padding, (width - totalWidth) / 2);

    row.forEach((card) => {
      const rotation = (Math.random() - 0.5) * 2;

      const offsetX = (Math.random() - 0.5) * 8;
      const offsetY = (Math.random() - 0.5) * 10;

      const spawnX = x + card.width / 2 + offsetX;
      const spawnY = y + card.height / 2 + offsetY;

      const body = Bodies.rectangle(spawnX, spawnY, card.width, card.height, {
        angle: rotation,
        restitution: 0.3,
        friction: 0.5,
        frictionAir: 0.02,
        density: 0.002,
      });

      card.element.style.position = "absolute";
      card.element.style.left = `${spawnX - card.width / 2}px`;
      card.element.style.top = `${spawnY - card.height / 2}px`;
      card.element.style.margin = "0";

      Composite.add(engine.world, body);

      objects.push({
        element: card.element,
        body,
      });

      x += card.width + gap;
    });

    y += rowHeight + rowGap;
  });

  // Floor and walls.
  const walls = [
    Bodies.rectangle(width / 2, height + 25, width, 50, {
      isStatic: true,
    }),
    Bodies.rectangle(-25, height / 2, 50, height * 2, {
      isStatic: true,
    }),
    Bodies.rectangle(width + 25, height / 2, 50, height * 2, {
      isStatic: true,
    }),
  ];

  Composite.add(engine.world, walls);

  // Mouse dragging.
  const mouse = Mouse.create(container);

  const mouseConstraint = MouseConstraint.create(engine, {
    mouse,
    constraint: {
      stiffness: 0.2,
      damping: 0.1,
      render: { visible: false },
    },
  });

  Composite.add(engine.world, mouseConstraint);

  // Synchronize DOM elements with physics.
  Events.on(engine, "afterUpdate", () => {
    objects.forEach(({ element, body }) => {
      element.style.left = `${body.position.x - element.offsetWidth / 2}px`;

      element.style.top = `${body.position.y - element.offsetHeight / 2}px`;

      element.style.transform = `rotate(${body.angle}rad)`;
    });
  });

  const runner = Runner.create();
  Runner.run(runner, engine);

  return () => {
    Runner.stop(runner);
    Composite.clear(engine.world, false);
    Engine.clear(engine);
  };
}
