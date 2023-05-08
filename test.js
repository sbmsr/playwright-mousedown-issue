import { chromium } from "playwright";
import { setTimeout } from "timers/promises";
import { test } from "uvu";
import * as assert from "uvu/assert";

let browser;
let context;
let page;

test.before(async () => {
  browser = await chromium.launch({
    use: { timezoneId: "Etc/UTC" },
  });
  context = await browser.newContext({
    recordVideo: { dir: "videos/" },
  });
  context.tracing.start({ screenshots: true, snapshots: true });
});

test.before.each(async () => {
  page = await context.newPage();
  await showMousePosition(page);
});

test.after.each(async () => {
  await page.evaluate(() => window.localStorage.clear());
  await page.close();
  await context.tracing.stop({ path: "trace.zip" });
});

test.after(async () => {
  await browser.close();
  await context.close();
});

test("Make sure the application doesn't leave a lingering task when dragged over a column but dropped elsewhere.", async () => {
  await page.goto("http://localhost:3000");
  await setTimeout(1000);

  const taskToDrag = await page.$('li:has-text("Test application")');
  await taskToDrag.hover();
  await page.mouse.down();
  await setTimeout(1000);
  await page.mouse.move(0, 500);
  await page.mouse.move(0, 500);
  await setTimeout(1000);
  await page.mouse.move(500, 500);
  await page.mouse.move(500, 500);
  await setTimeout(1000);
  await page.mouse.up();

  const tasks = await page.$$eval("li", (tasks) => tasks.map((task) => task.textContent));

  const duplicateTaskCount = tasks.filter((task) => task === "Test application").length;

  assert.is(
    duplicateTaskCount,
    1,
    "A lingering task is left when a task is dragged over a column but dropped elsewhere."
  );
});

async function showMousePosition(page) {
  if (!page) {
    throw new Error("Cannot show mouse position because no browser has been launched");
  }
  // code from https://gist.github.com/aslushnikov/94108a4094532c7752135c42e12a00eb
  await page.addInitScript(() => {
    // Install mouse helper only for top-level frame.
    if (window !== window.parent) return;
    window.addEventListener(
      "DOMContentLoaded",
      () => {
        const box = document.createElement("playwright-mouse-pointer");
        const styleElement = document.createElement("style");
        styleElement.innerHTML = `
        playwright-mouse-pointer {
          pointer-events: none;
          position: absolute;
          top: 0;
          z-index: 10000;
          left: 0;
          width: 20px;
          height: 20px;
          background: rgba(0,0,0,.4);
          border: 1px solid white;
          border-radius: 10px;
          margin: -10px 0 0 -10px;
          padding: 0;
          transition: background .2s, border-radius .2s, border-color .2s;
        }
        playwright-mouse-pointer.button-1 {
          transition: none;
          background: rgba(0,0,0,0.9);
        }
        playwright-mouse-pointer.button-2 {
          transition: none;
          border-color: rgba(0,0,255,0.9);
        }
        playwright-mouse-pointer.button-3 {
          transition: none;
          border-radius: 4px;
        }
        playwright-mouse-pointer.button-4 {
          transition: none;
          border-color: rgba(255,0,0,0.9);
        }
        playwright-mouse-pointer.button-5 {
          transition: none;
          border-color: rgba(0,255,0,0.9);
        }
      `;
        document.head.appendChild(styleElement);
        document.body.appendChild(box);
        document.addEventListener(
          "mousemove",
          (event) => {
            box.style.left = event.pageX + "px";
            box.style.top = event.pageY + "px";
          },
          true
        );
        document.addEventListener(
          "mousedown",
          (event) => {
            box.classList.add("button-" + event.which);
          },
          true
        );
        document.addEventListener(
          "mouseup",
          (event) => {
            box.classList.remove("button-" + event.which);
          },
          true
        );
      },
      false
    );
  });
}

test.run();
