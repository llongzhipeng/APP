import { replayInstructions, stopTrainingAudio } from './audio/cues.js'
import { leave, skip } from './session.js'

export function installGameControls() {
  const host = document.createElement('div')
  host.style.cssText = 'position:fixed;top:42%;right:max(5px,env(safe-area-inset-right));z-index:2147483647'
  const root = host.attachShadow({ mode: 'open' })
  root.innerHTML = `
    <style>
      details { font: 600 14px system-ui, sans-serif; text-align: right; }
      summary, button { font: inherit; cursor: pointer; -webkit-tap-highlight-color: transparent; }
      summary { display: inline-grid; place-items: center; width: 44px; height: 44px; border-radius: 12px;
        list-style: none; color: #fff; background: #19335de8; border: 1px solid #ced9ef;
        box-shadow: 0 2px 8px #15284a3d; box-sizing: border-box; font-size: 22px; }
      summary::-webkit-details-marker { display: none; }
      .menu { display: grid; gap: 4px; margin-top: 6px; padding: 5px; border: 1px solid #d9e3f3;
        border-radius: 10px; background: #fff; box-shadow: 0 3px 14px #162b5047; }
      button { min-height: 44px; padding: 6px 15px; border: 0; border-radius: 6px;
        white-space: nowrap; color: #18345f; background: #edf3fc; }
      button:active { background: #dbe8fb; }
    </style>
    <details>
      <summary aria-label="游戏操作" title="游戏操作">⋯</summary>
      <div class="menu">
        <button type="button" data-action="return">返回</button>
        <button type="button" data-action="skip">跳过</button>
        <button type="button" data-action="replay">重听玩法</button>
      </div>
    </details>
  `
  const panel = root.querySelector('details')
  root.querySelector('.menu').addEventListener('click', event => {
    const action = event.target.dataset.action
    if (!action) return
    panel.open = false
    if (action === 'replay') {
      replayInstructions()
    } else {
      stopTrainingAudio()
      if (action === 'skip') skip()
      else leave()
    }
  })
  document.addEventListener('pointerdown', event => {
    if (panel.open && event.target !== host) panel.open = false
  })
  document.body.appendChild(host)
}
