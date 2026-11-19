<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-box">
      <div class="modal-header">
        <h2>{{ t('rulesTitle') }}</h2>
        <button class="close-btn" @click="$emit('close')">✕</button>
      </div>
      <div class="modal-body">
        <div class="rule-block">
          <h3>{{ t('rulesIntro') }}</h3>
          <p>{{ t('rulesIntroBody') }}</p>
        </div>
        <div class="rule-block">
          <h3>{{ t('rulesPlay') }}</h3>
          <p>{{ t('rulesPlayBody') }}</p>
        </div>
        <div class="rule-block">
          <h3>{{ t('rulesLimit') }}</h3>
          <p>{{ t('rulesLimitBody') }}</p>
        </div>
        <div class="rule-block">
          <h3>{{ t('rulesScore') }}</h3>
          <p>{{ t('rulesScoreBody') }}</p>
        </div>
        <div class="table-wrap">
          <table class="rules-table">
            <thead>
              <tr>
                <th>Lv</th>
                <th>{{ lang === 'zh' ? '票种' : 'Types' }}</th>
                <th>{{ lang === 'zh' ? '价格' : 'Price' }}</th>
                <th>{{ lang === 'zh' ? '系数' : 'Coef' }}</th>
              </tr>
            </thead>
            <tbody>
              <tr><td data-label="Lv"><span class="lvtag">1</span></td><td :data-label="lang === 'zh' ? '票种' : 'Types'">1</td><td :data-label="lang === 'zh' ? '价格' : 'Price'">5-10</td><td class="coef" :data-label="lang === 'zh' ? '系数' : 'Coef'">× 1</td></tr>
              <tr><td data-label="Lv"><span class="lvtag">2</span></td><td :data-label="lang === 'zh' ? '票种' : 'Types'">1</td><td :data-label="lang === 'zh' ? '价格' : 'Price'">10-20</td><td class="coef" :data-label="lang === 'zh' ? '系数' : 'Coef'">× 1.5</td></tr>
              <tr><td data-label="Lv"><span class="lvtag">3</span></td><td :data-label="lang === 'zh' ? '票种' : 'Types'">2</td><td :data-label="lang === 'zh' ? '价格' : 'Price'">10-20</td><td class="coef" :data-label="lang === 'zh' ? '系数' : 'Coef'">× 2</td></tr>
              <tr><td data-label="Lv"><span class="lvtag">4</span></td><td :data-label="lang === 'zh' ? '票种' : 'Types'">2</td><td :data-label="lang === 'zh' ? '价格' : 'Price'">20-30</td><td class="coef" :data-label="lang === 'zh' ? '系数' : 'Coef'">× 2.5</td></tr>
              <tr><td data-label="Lv"><span class="lvtag">5</span></td><td :data-label="lang === 'zh' ? '票种' : 'Types'">3</td><td :data-label="lang === 'zh' ? '价格' : 'Price'">5-20</td><td class="coef" :data-label="lang === 'zh' ? '系数' : 'Coef'">× 3</td></tr>
              <tr><td data-label="Lv"><span class="lvtag">6</span></td><td :data-label="lang === 'zh' ? '票种' : 'Types'">3</td><td :data-label="lang === 'zh' ? '价格' : 'Price'">5-30</td><td class="coef" :data-label="lang === 'zh' ? '系数' : 'Coef'">× 3.5</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RulesModal',
  props: { t: { type: Function, required: true }, lang: { type: String, required: true } },
};
</script>

<style scoped>
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  display: flex; align-items: center; justify-content: center; z-index: 200; padding: 2vmin;
}
.modal-box {
  background: linear-gradient(160deg, #fff 60%, #fff6e5);
  border: 0.3vmin solid #ff8c1a;
  border-radius: 2vmin;
  width: min(80vmin, 96vw); max-height: 88vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 2vmin 6vmin rgba(0,0,0,0.4);
}
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 2vmin 3vmin;
  border-bottom: 0.15vmin solid rgba(255,140,26,0.3);
  background: linear-gradient(180deg, #ffb84d, #ff8c1a);
  flex-shrink: 0;
}
.modal-header h2 { color: #fff; font-size: 2.6vmin; font-weight: 800; }
.close-btn {
  background: rgba(255,255,255,0.25); border: none;
  color: #fff; font-size: 2.5vmin;
  cursor: pointer;
  padding: 0.3vmin 1.2vmin;
  border-radius: 999px;
  transition: background 0.2s;
}
.close-btn:hover { background: rgba(255,255,255,0.45); }
.modal-body { overflow-y: auto; padding: 2.5vmin 3vmin; display: flex; flex-direction: column; gap: 2vmin; }
.rule-block {
  background: #fff6e5;
  border-radius: 1.2vmin;
  padding: 1.6vmin 2vmin;
  border-left: 0.5vmin solid #ff8c1a;
}
.rule-block h3 { color: #ff8c1a; font-size: 2vmin; font-weight: 800; margin-bottom: 0.6vmin; }
.rule-block p { color: #555; font-size: 1.8vmin; line-height: 1.6; }
.table-wrap { overflow-x: auto; }
.rules-table { width: 100%; border-collapse: collapse; font-size: 1.8vmin; background: #fff; border-radius: 1vmin; overflow: hidden; }
.rules-table th { background: #ff8c1a; color: #fff; padding: 1.2vmin 1.5vmin; text-align: center; font-weight: 700; }
.rules-table td { padding: 1.2vmin 1.5vmin; text-align: center; color: #444; border-bottom: 0.1vmin solid #eee; }
.lvtag { display: inline-block; width: 3vmin; height: 3vmin; line-height: 3vmin; border-radius: 50%; background: #ffe6c2; color: #ff8c1a; font-weight: 800; font-size: 1.6vmin; }
.coef { color: #ff8c1a; font-weight: 700; }

@media (orientation: portrait) {
  .modal-overlay {
    padding-top: calc(2vmin + env(safe-area-inset-top));
    padding-bottom: calc(2vmin + env(safe-area-inset-bottom));
  }
  .modal-box {
    width: 92vw;
    max-height: 90vh;
    border-radius: 3vmin;
  }
  .modal-header { padding: 2.5vmin 3.5vmin; }
  .modal-header h2 { font-size: max(4.4vmin, 17px); }
  .close-btn {
    font-size: max(4.4vmin, 17px);
    padding: 0.6vmin 2vmin;
  }
  .modal-body { padding: 3vmin; gap: 2.5vmin; }
  .rule-block { padding: 2.4vmin 2.4vmin; border-radius: 2vmin; }
  .rule-block h3 { font-size: max(3.8vmin, 15px); margin-bottom: 1vmin; }
  .rule-block p { font-size: max(3.4vmin, 14px); line-height: 1.6; }

  /* table → cards */
  .rules-table thead { display: none; }
  .rules-table, .rules-table tbody, .rules-table tr, .rules-table td {
    display: block;
    width: 100%;
  }
  .rules-table {
    background: transparent;
    border-radius: 0;
  }
  .rules-table tr {
    background: #fff;
    border-radius: 2vmin;
    padding: 2vmin 2.4vmin;
    margin-bottom: 2vmin;
    box-shadow: 0 0.6vmin 1.6vmin rgba(0,0,0,0.08);
  }
  .rules-table td {
    text-align: left;
    padding: 0.8vmin 0;
    border-bottom: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: max(3.6vmin, 14px);
  }
  .rules-table td::before {
    content: attr(data-label);
    color: #888;
    font-weight: 700;
    font-size: max(3vmin, 12px);
    margin-right: 2vmin;
  }
  .lvtag {
    width: auto; height: auto; line-height: 1;
    padding: 0.8vmin 2vmin;
    border-radius: 999px;
    font-size: max(3.4vmin, 14px);
  }
}
</style>
