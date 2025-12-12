import { sdk } from "https://esm.sh/@farcaster/miniapp-sdk";
import { mountSpineApp } from "./Spine-ui.js";

window.addEventListener("load", async () => {
  const $root = document.getElementById("app");
  const $status = document.getElementById("status");

  const env = { isMini: false, label: "Web" };

  try {
    env.isMini = await sdk.isInMiniApp();
    env.label = env.isMini ? "Mini App" : "Web";
  } catch (e) {
    env.isMini = false;
    env.label = "Web";
  }

  // Update UI labels depending on environment
  $status.textContent = env.isMini
    ? "Running inside Farcaster / Base Mini App"
    : "Running on the open web (Mini App-ready)";

  // Mount app
  mountSpineApp($root, env);

  // Always call ready()
  try {
    await sdk.actions.ready();
  } catch (e) {
    // no-op on web
  }
});
