<script>
export default {}
</script>

<style>
page { background: #f3f7fa; color: #102f41; font-family: "PingFang SC", "Microsoft YaHei", system-ui, sans-serif; font-size: 15px; }
view, button, input, text, image { box-sizing: border-box; }
button { margin: 0; padding: 0; line-height: 1.3; font-family: inherit; }
button::after { border: 0; }
.topbar { padding-top: var(--status-bar-height, 0px); background: #fbfdfe; border-bottom: 1px solid #dce9ef; }
.topbar-inner { min-height: 64px; max-width: 1120px; margin: 0 auto; padding: 10px 28px; display: flex; gap: 14px; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 10px; font-weight: 750; color: #10354a; }
.icon { width: 20px; height: 20px; flex-shrink: 0; display: block; }
.icon-tile { display: flex; align-items: center; justify-content: center; background: #e5f2f9; border-radius: 10px; width: 36px; height: 36px; flex-shrink: 0; }
.primary { display: flex; align-items: center; justify-content: center; margin: 0; line-height: 1.3; min-height: 54px; padding: 10px 16px; border-radius: 12px; background: #006fa6; color: #fff; font-size: 16px; font-weight: 700; }
.primary[disabled] { background: #5289a3; color: #fff; }
.secondary { display: flex; align-items: center; justify-content: center; margin: 0; line-height: 1.3; min-height: 38px; padding: 8px 12px; border-radius: 9px; background: #e7f3f9; color: #075984; font-size: 13px; font-weight: 650; }
.error { color: #a82830; font-size: 14px; line-height: 1.5; }
@media (min-width: 680px) { .topbar-inner { min-height: 72px; padding-right: 36px; padding-left: 36px; } .brand { font-size: 17px; } .secondary { min-height: 44px; } }
@media (max-width: 520px) { .topbar-inner { padding-right: 16px; padding-left: 16px; min-height: 58px; } .brand { font-size: 13px; gap: 7px; } }
</style>
