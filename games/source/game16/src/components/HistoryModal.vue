<template>
  <div class="overlay" @click.self="$emit('close')">
    <div class="box">
      <h2>{{ lang==='zh'?'历史记录':'History' }}</h2>
      <div v-if="records.length===0" class="empty">{{ lang==='zh'?'暂无记录':'No records yet' }}</div>
      <div v-else class="table-wrap">
        <table>
          <thead>
            <tr>
              <th v-for="h in (lang==='zh'?headZh:headEn)" :key="h">{{ h }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r,i) in records" :key="i">
              <td>{{ r.time }}</td>
              <td>{{ r.level }}</td>
              <td>{{ r.duration }}{{ lang==='zh'?'分':'min' }}</td>
              <td>{{ r.total }}</td>
              <td>{{ r.success }}</td>
              <td>{{ r.fail }}</td>
              <td>{{ r.rate }}%</td>
              <td>{{ r.avgReaction }}s</td>
              <td>{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <button class="close-btn" @click="$emit('close')">{{ lang==='zh'?'关闭':'Close' }}</button>
    </div>
  </div>
</template>

<script>
export default {
  props: ['lang','records'],
  data() {
    return {
      headZh: ['时间','难度','时长','总次数','成功','失败','成功率','平均反应','得分'],
      headEn: ['Time','Level','Dur','Total','OK','Fail','Rate','Avg','Score']
    }
  }
}
</script>

<style scoped>
.overlay { position:fixed; inset:0; background:rgba(0,0,0,0.75); display:flex; align-items:center; justify-content:center; z-index:200; }
.box { background:linear-gradient(160deg,#001a3a,#002a5a); border:0.2vmin solid rgba(100,200,255,0.4); border-radius:2vmin; padding:3vmin 4vmin; max-width:90vmin; width:95%; max-height:80vh; display:flex; flex-direction:column; gap:2vmin; }
h2 { color:#7ee8ff; font-size:clamp(13px,2.8vmin,32px); text-align:center; }
.empty { color:#b0e8ff; text-align:center; font-size:clamp(11px,2vmin,22px); padding:3vmin; }
.table-wrap { overflow:auto; flex:1; }
table { width:100%; border-collapse:collapse; font-size:clamp(9px,1.5vmin,16px); }
th { color:#7ee8ff; padding:0.8vmin; border-bottom:0.15vmin solid rgba(100,200,255,0.3); white-space:nowrap; }
td { color:#b0e8ff; padding:0.7vmin; text-align:center; border-bottom:0.1vmin solid rgba(100,200,255,0.1); }
.close-btn { display:block; margin:0 auto; background:linear-gradient(135deg,#0077cc,#00c6ff); border:none; color:#fff; padding:1.2vmin 4vmin; border-radius:1vmin; font-size:clamp(11px,2vmin,22px); cursor:pointer; }
</style>
