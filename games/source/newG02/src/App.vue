<template>
  <div id="app">
    <!-- Lang toggle (hidden during game) -->
    <button v-if="page !== 'game'" class="lang-btn" @click="toggleLang">
      {{ lang === 'zh' ? 'EN' : '中文' }}
    </button>

    <!-- HOME -->
    <div v-if="page === 'home'" class="screen center">
      <h1 class="title">{{ T.title }}</h1>
      <div class="menu">
        <button class="btn primary" @click="page = 'tutorial'">{{ T.start }}</button>
        <button class="btn" @click="showRules = true">{{ T.rules }}</button>
        <button class="btn" @click="page = 'records'">{{ T.history }}</button>
      </div>
    </div>

    <!-- TUTORIAL -->
    <div v-if="page === 'tutorial'" class="screen center">
      <div class="modal-box tut-box">
        <div class="tut-step">
          <div v-if="tutStep === 0" class="tut-demo">
            <p class="tut-label">① {{ T.tutStep1 }}</p>
            <div class="demo-pool">
              <span v-for="w in tutWords" :key="w" class="demo-card">{{ w }}</span>
            </div>
            <div class="demo-belt empty-belt">_ _ _</div>
          </div>
          <div v-if="tutStep === 1" class="tut-demo">
            <p class="tut-label">② {{ T.tutStep2 }}</p>
            <div class="demo-pool">
              <span class="demo-card dim">{{ tutWords[0] }}</span>
              <span class="demo-card">{{ tutWords[1] }}</span>
              <span class="demo-card">{{ tutWords[2] }}</span>
            </div>
            <div class="demo-belt">
              <span class="demo-card placed">{{ tutWords[0] }}</span>
            </div>
          </div>
          <div v-if="tutStep === 2" class="tut-demo">
            <p class="tut-label">③ {{ T.tutStep3 }}</p>
            <div class="demo-pool">
              <span v-for="w in tutWords" :key="w" class="demo-card dim">{{ w }}</span>
            </div>
            <div class="demo-belt">
              <span v-for="w in tutWords" :key="w" class="demo-card placed">{{ w }}</span>
            </div>
            <button class="btn primary small">{{ T.done }}</button>
          </div>
        </div>
        <div class="tut-dots">
          <span v-for="i in 3" :key="i" :class="['dot', tutStep === i-1 ? 'active' : '']"></span>
        </div>
        <div class="tut-footer">
          <button v-if="tutStep > 0" class="btn small" @click="tutStep--">{{ T.prev }}</button>
          <button class="btn small" @click="finishTutorial">{{ T.skip }}</button>
          <button v-if="tutStep < 2" class="btn primary small" @click="tutStep++">{{ T.next }}</button>
          <button v-else class="btn primary small" @click="finishTutorial">{{ T.gotIt }}</button>
        </div>
      </div>
    </div>

    <!-- DURATION -->
    <div v-if="page === 'duration'" class="screen center">
      <h2 class="subtitle">{{ T.selectDuration }}</h2>
      <div class="duration-opts">
        <button v-for="d in [1,3,5]" :key="d"
                :class="['btn', 'dur', selectedDur === d ? 'primary' : '']"
                @click="selectedDur = d">
          {{ d }} {{ T.min }}
        </button>
      </div>
      <button class="btn primary start-btn" :disabled="!selectedDur" @click="startGame(selectedDur)">
        {{ T.start }}
      </button>
    </div>

    <!-- GAME -->
    <div v-if="page === 'game'" class="screen game-screen">
      <div class="game-header">
        <div class="stats">
          <span>{{ T.level }}: {{ difficulty }}</span>
          <span>{{ T.score }}: {{ score }}</span>
          <span>{{ T.time }}: {{ fmtTime(timeLeft) }}</span>
          <span :class="['q-time', qTimeLeft <= 3 ? 'urgent' : '']">{{ T.qTime }}: {{ qTimeLeft }}s</span>
        </div>
        <div class="header-btns">
          <button v-if="showBatchSkip" class="btn small secondary" @click="onBatchSkip">{{ T.skipGame }}</button>
          <button class="btn small" @click="confirmEndGame">{{ T.back }}</button>
        </div>
      </div>

<div class="word-pool">
        <span v-for="(w, i) in pool" :key="qStartTime + '-p' + i"
              :class="['word-card', w.used ? 'used' : '']"
              @click="pickFromPool(i)">{{ w.t }}</span>
      </div>

      <div class="belt-wrap">
        <div class="sentence-belt">
          <span v-if="belt.length === 0" class="belt-hint">{{ T.beltHint }}</span>
          <span v-for="(w, i) in belt" :key="qStartTime + '-b' + i"
                class="word-card placed"
                @click="removeFromBelt(i)">{{ w.t }}</span>
        </div>
      </div>
    </div>

    <!-- RECORDS -->
    <div v-if="page === 'records'" class="screen records-screen">
      <div class="rec-header">
        <h2>{{ T.history }}</h2>
        <button class="btn small" @click="page = 'home'">{{ T.back }}</button>
      </div>
      <div class="rec-table-wrap">
        <table v-if="records.length" class="rec-table">
          <thead>
            <tr>
              <th>{{ T.rTime }}</th><th>{{ T.rGame }}</th><th>{{ T.rLevel }}</th>
              <th>{{ T.rDur }}</th><th>{{ T.rTotal }}</th><th>{{ T.rOk }}</th>
              <th>{{ T.rFail }}</th><th>{{ T.rRate }}</th><th>{{ T.rAvg }}</th><th>{{ T.rScore }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(r, i) in records" :key="i">
              <td :data-label="T.rTime">{{ r.time }}</td>
              <td :data-label="T.rGame">{{ r.game }}</td>
              <td :data-label="T.rLevel">{{ r.level }}</td>
              <td :data-label="T.rDur">{{ r.dur }}{{ T.min }}</td>
              <td :data-label="T.rTotal">{{ r.total }}</td>
              <td :data-label="T.rOk">{{ r.ok }}</td>
              <td :data-label="T.rFail">{{ r.fail }}</td>
              <td :data-label="T.rRate">{{ r.rate }}%</td>
              <td :data-label="T.rAvg">{{ r.avg }}s</td>
              <td :data-label="T.rScore">{{ r.score }}</td>
            </tr>
          </tbody>
        </table>
        <p v-else class="no-rec">{{ T.noRecord }}</p>
      </div>
    </div>

    <!-- FEEDBACK MODAL -->
    <div v-if="showFeedback" class="overlay feedback-overlay">
      <div :class="['feedback-box', feedbackCorrect ? 'ok' : 'ng']">
        <div class="feedback-icon">{{ feedbackCorrect ? '✓' : '✕' }}</div>
        <div class="feedback-text">{{ feedbackCorrect ? T.correctTip : T.wrongTip }}</div>
      </div>
    </div>

    <!-- RULES MODAL -->
    <div v-if="showRules" class="overlay" @click.self="showRules = false">
      <div class="modal-box">
        <h3>{{ T.rules }}</h3>
        <p class="rule-text">{{ T.ruleContent }}</p>
        <table class="rule-table">
          <thead><tr><th>{{ T.level }}</th><th>{{ T.wordCount }}</th><th>{{ T.rDur }}(s)</th><th>{{ T.coeff }}</th></tr></thead>
          <tbody>
            <tr v-for="(d, i) in diffConf" :key="i">
              <td>{{ i+1 }}</td><td>{{ d.n }}</td><td>{{ d.t }}</td><td>{{ d.c }}</td>
            </tr>
          </tbody>
        </table>
        <button class="btn primary" @click="showRules = false">{{ T.close }}</button>
      </div>
    </div>

    <!-- RESULT MODAL -->
    <div v-if="showResult" class="overlay">
      <div class="modal-box">
        <h3>{{ T.gameOver }}</h3>
        <div class="result-stats">
          <p>{{ T.score }}: <strong>{{ score }}</strong></p>
          <p>{{ T.rTotal }}: {{ sessionTotal }}</p>
          <p>{{ T.rOk }}: {{ sessionOk }}</p>
          <p>{{ T.rRate }}: {{ sessionTotal ? Math.round(sessionOk/sessionTotal*100) : 0 }}%</p>
          <p>{{ T.rAvg }}: {{ avgResponse }}s</p>
        </div>
        <button class="btn primary" @click="goHome">{{ T.back }}</button>
      </div>
    </div>
  </div>
</template>

<script>
import { resolveVoice } from './assets'
import { resolveArchiveId, submitPbGameEndRecord, toPbGameSeconds } from '@/views/game/utils/pbGameAppHelper'
import { applyBatchTutorialEntry, afterBatchTutorial, getBatchStartDifficultyForGame } from '@/utils/pbGameBatchEntry'
import { leavePbGameWindow, shouldShowPbBatchSkip, skipPbBatchGame } from '@/utils/pbGameBatchLegacy'

const DIFF = [
  { n: 3, t: 10, c: 1 },
  { n: 4, t: 10, c: 1.5 },
  { n: 4, t: 8,  c: 2 },
  { n: 5, t: 8,  c: 2.5 },
  { n: 5, t: 6,  c: 3 },
  { n: 6, t: 6,  c: 3.5 },
]

const QUESTIONS = {
  zh: [
    // 难度1：3词 主谓宾
    [
      ['猫','追','球'],['狗','啃','骨头'],['鸟','飞','走'],
      ['我','吃','饭'],['他','喝','水'],['她','读','书'],
      ['鱼','游','泳'],['马','拉','车'],['风','吹','树'],
      ['雨','打','窗'],['农民','种','菜'],['工人','修','路'],
      ['学生','写','字'],['画家','画','画'],['厨师','做','菜'],
      ['孩子','放','风筝'],['司机','开','车'],['医生','救','人'],
      ['老师','讲','课'],['妈妈','买','菜'],['爸爸','抽','烟'],
      ['爷爷','看','报'],['奶奶','喂','鸡'],['姐姐','弹','琴'],
      ['弟弟','搭','积木'],['妹妹','抱','娃娃'],
    ],
    // 难度2：4词 主谓宾（含"在/正在"等）
    [
      ['妈妈','在','织','毛衣'],['爸爸','在','看','报纸'],['哥哥','在','写','作业'],
      ['姐姐','在','唱','歌'],['弟弟','在','踢','足球'],['妹妹','在','跳','绳'],
      ['奶奶','在','缝','衣服'],['爷爷','在','下','象棋'],['老师','在','批','作业'],
      ['学生','在','背','单词'],['工人','在','修','机器'],['农民','在','收','稻谷'],
      ['司机','在','擦','汽车'],['医生','在','量','血压'],['护士','在','换','药'],
      ['厨师','在','炒','青菜'],['画家','在','调','颜料'],['作家','在','写','小说'],
      ['歌手','在','录','歌曲'],['演员','在','背','台词'],
      ['小鸟','在','搭','鸟窝'],['蜜蜂','在','采','花蜜'],['蝴蝶','在','采','花粉'],
      ['猴子','在','摘','桃子'],['小猫','在','抓','老鼠'],['小狗','在','看','大门'],
    ],
    // 难度3：4词 主谓宾+时间/地点
    [
      ['爸爸','在','厨房','做饭'],['妹妹','在','房间','读书'],['奶奶','在','院子','浇花'],
      ['妈妈','在','客厅','看电视'],['爷爷','在','阳台','养鱼'],['哥哥','在','书房','学习'],
      ['姐姐','在','卧室','化妆'],['弟弟','在','操场','跑步'],['同学','在','教室','复习'],
      ['老师','在','讲台','讲课'],['工人','在','工厂','上班'],['司机','在','车里','休息'],
      ['农民','在','田里','插秧'],['医生','在','医院','手术'],['小狗','在','门口','守门'],
      ['小猫','在','沙发','睡觉'],['孩子','在','公园','玩耍'],['游客','在','海边','拍照'],
      ['学生','早上','读','课文'],['爸爸','晚上','看','新闻'],['妈妈','早晨','做','早餐'],
      ['奶奶','中午','煮','稀饭'],['爷爷','傍晚','散','步'],['我','周末','弹','钢琴'],
      ['他','昨天','送','礼物'],['她','今天','打','电话'],
    ],
    // 难度4：5词 主谓宾+时间+地点
    [
      ['我','昨天','在','公园','跑步'],['她','今天','在','学校','学习'],['他','早上','在','操场','锻炼'],
      ['爸爸','昨晚','在','客厅','看球'],['妈妈','今早','在','厨房','煮粥'],['奶奶','昨天','在','菜园','种菜'],
      ['爷爷','今天','在','书房','写字'],['姐姐','昨天','在','图书馆','借书'],['哥哥','早上','在','食堂','吃饭'],
      ['弟弟','中午','在','教室','午睡'],['妹妹','傍晚','在','小区','骑车'],['同学','昨天','在','球场','打球'],
      ['老师','今天','在','会议室','开会'],['医生','昨晚','在','急诊室','抢救'],['工人','清晨','在','工地','搬砖'],
      ['农民','秋天','在','田里','收稻'],['司机','今天','在','车站','等客'],['厨师','早上','在','市场','买菜'],
      ['画家','昨天','在','山顶','写生'],['游客','周末','在','长城','拍照'],
      ['孩子','昨天','在','幼儿园','午睡'],['演员','今晚','在','剧院','表演'],['歌手','昨晚','在','广场','演唱'],
      ['运动员','今天','在','体育馆','训练'],['士兵','清晨','在','营地','列队'],
    ],
    // 难度5：5词 主谓宾+形容词/副词
    [
      ['姐姐','穿','漂亮的','衣服','玩耍'],['弟弟','踢','破旧的','皮球','玩耍'],['妈妈','做','美味的','饭菜','招待'],
      ['爸爸','开','崭新的','汽车','出门'],['爷爷','讲','有趣的','故事','给孙子'],['奶奶','包','鲜香的','饺子','过节'],
      ['老师','讲','精彩的','课程','给学生'],['画家','画','美丽的','风景','送人'],['厨师','炒','辣的','菜肴','招客'],
      ['农民','收','金黄的','稻谷','入仓'],['工人','修','复杂的','机器','完毕'],['医生','救','危重的','病人','脱险'],
      ['司机','开','平稳的','汽车','行驶'],['小鸟','唱','动听的','歌曲','迎晨'],['蝴蝶','扇','轻盈的','翅膀','飞舞'],
      ['孩子','拿','明亮的','手电','照路'],['学生','认真地','读','课文','出声'],['同学','热情地','帮','老师','搬书'],
      ['运动员','努力地','跑','长跑','冲刺'],['士兵','勇敢地','守','边疆','站岗'],
      ['妹妹','高兴地','唱','儿歌','跳舞'],['哥哥','安静地','读','小说','入迷'],['姐姐','优雅地','跳','舞蹈','谢幕'],
      ['爷爷','慢慢地','喝','浓茶','品味'],['奶奶','轻轻地','摇','摇椅','哼曲'],
    ],
    // 难度6：6词 主谓宾+形容词/副词+时间/地点
    [
      ['课堂上','老师','认真地','给','学生','讲课'],['操场上','同学','快乐地','和','朋友','游戏'],
      ['公园里','孩子','开心地','跟','家长','散步'],['教室里','学生','安静地','听','老师','读书'],
      ['厨房里','妈妈','熟练地','为','家人','做饭'],['书房里','爸爸','专心地','对','电脑','工作'],
      ['院子里','奶奶','慢慢地','把','衣服','晾晒'],['阳台上','爷爷','悠闲地','给','花草','浇水'],
      ['会议室','经理','严肃地','向','员工','讲话'],['医院里','医生','仔细地','为','病人','检查'],
      ['工地上','工人','辛苦地','把','钢筋','搬运'],['田地里','农民','弯腰','把','稻谷','收割'],
      ['广场上','歌手','动情地','为','观众','演唱'],['剧院里','演员','投入地','把','角色','表演'],
      ['体育馆','运动员','拼命地','为','冠军','拼搏'],['沙滩上','游客','悠闲地','在','海边','散步'],
      ['山顶上','画家','专注地','对','风景','写生'],['商场里','顾客','兴奋地','向','店员','咨询'],
      ['餐厅里','客人','满意地','对','美食','品尝'],['雪地里','孩子','兴奋地','和','伙伴','打闹'],
    ],
  ],
  en: [
    // Level 1: 3 words SVO
    [
      ['cat','chases','ball'],['dog','chews','bone'],['bird','flies','away'],
      ['I','eat','rice'],['he','drinks','water'],['she','reads','book'],
      ['fish','swims','fast'],['horse','pulls','cart'],['wind','shakes','tree'],
      ['rain','hits','window'],['farmer','plants','crops'],['worker','repairs','road'],
      ['student','writes','words'],['painter','draws','picture'],['chef','cooks','meal'],
      ['child','flies','kite'],['driver','drives','car'],['doctor','saves','life'],
      ['teacher','teaches','class'],['mom','buys','food'],['dad','smokes','pipe'],
      ['grandpa','reads','news'],['grandma','feeds','chicken'],['sister','plays','piano'],
      ['brother','builds','blocks'],['baby','hugs','doll'],
    ],
    // Level 2: 4 words SVO
    [
      ['mom','is','knitting','sweater'],['dad','is','reading','newspaper'],['brother','is','doing','homework'],
      ['sister','is','singing','song'],['boy','is','kicking','football'],['girl','is','jumping','rope'],
      ['grandma','is','sewing','clothes'],['grandpa','is','playing','chess'],['teacher','is','marking','papers'],
      ['student','is','reciting','words'],['worker','is','fixing','machine'],['farmer','is','harvesting','wheat'],
      ['driver','is','washing','car'],['doctor','is','checking','pulse'],['nurse','is','changing','bandage'],
      ['chef','is','frying','vegetables'],['painter','is','mixing','colors'],['writer','is','writing','novel'],
      ['singer','is','recording','album'],['actor','is','learning','lines'],
      ['bird','is','building','nest'],['bee','is','gathering','honey'],['butterfly','is','collecting','pollen'],
      ['monkey','is','picking','peaches'],['kitten','is','catching','mouse'],['puppy','is','guarding','gate'],
    ],
    // Level 3: 4 words SVO + time/place
    [
      ['dad','cooks','in','kitchen'],['sister','reads','in','bedroom'],['grandma','waters','in','yard'],
      ['mom','watches','in','living-room'],['grandpa','feeds','on','balcony'],['brother','studies','in','study'],
      ['boy','runs','on','field'],['girl','dances','in','hall'],['student','reviews','in','classroom'],
      ['teacher','speaks','on','stage'],['worker','labors','in','factory'],['driver','rests','in','car'],
      ['farmer','plants','in','field'],['doctor','operates','in','hospital'],['dog','sleeps','at','door'],
      ['cat','naps','on','sofa'],['kids','play','in','park'],['tourists','shoot','on','beach'],
      ['student','reads','every','morning'],['dad','watches','every','night'],['mom','cooks','every','dawn'],
      ['grandma','boils','every','noon'],['grandpa','walks','every','evening'],['I','practice','every','weekend'],
      ['he','sent','gift','yesterday'],['she','called','friend','today'],
    ],
    // Level 4: 5 words SVO + time + place
    [
      ['I','jogged','in','park','yesterday'],['she','studies','at','school','today'],['he','trains','on','field','morning'],
      ['dad','watched','in','hall','tonight'],['mom','cooked','in','kitchen','morning'],['grandma','planted','in','garden','yesterday'],
      ['grandpa','wrote','in','study','today'],['sister','borrowed','at','library','yesterday'],['brother','ate','at','canteen','morning'],
      ['boy','napped','in','classroom','noon'],['girl','biked','in','park','evening'],['classmate','played','at','court','yesterday'],
      ['teacher','met','in','office','today'],['doctor','worked','in','clinic','tonight'],['worker','carried','at','site','dawn'],
      ['farmer','reaped','in','field','autumn'],['driver','waited','at','station','today'],['chef','shopped','at','market','morning'],
      ['painter','sketched','on','mountain','yesterday'],['tourist','shot','on','wall','weekend'],
      ['child','slept','at','kindergarten','yesterday'],['actor','performed','at','theater','tonight'],['singer','sang','at','square','last-night'],
      ['athlete','trained','at','gym','today'],['soldier','marched','in','camp','dawn'],
    ],
    // Level 5: 5 words SVO + adj/adv
    [
      ['sister','wears','beautiful','dress','playing'],['brother','kicks','old','ball','playing'],['mom','cooks','delicious','food','eating'],
      ['dad','drives','new','car','leaving'],['grandpa','tells','funny','story','laughing'],['grandma','wraps','tasty','dumplings','celebrating'],
      ['teacher','gives','excellent','lecture','teaching'],['painter','paints','pretty','scenery','selling'],['chef','fries','spicy','dish','serving'],
      ['farmer','reaps','golden','wheat','storing'],['worker','fixes','complex','machine','testing'],['doctor','cures','critical','patient','recovering'],
      ['driver','drives','steady','bus','running'],['bird','sings','sweet','song','morning'],['butterfly','flaps','light','wings','flying'],
      ['child','holds','bright','torch','walking'],['student','reads','careful','text','aloud'],['classmate','helps','kind','teacher','moving'],
      ['athlete','runs','hard','marathon','sprinting'],['soldier','guards','brave','border','standing'],
      ['girl','sings','happy','song','dancing'],['boy','reads','quiet','novel','absorbed'],['sister','dances','graceful','ballet','bowing'],
      ['grandpa','sips','slow','tea','tasting'],['grandma','rocks','gentle','chair','humming'],
    ],
    // Level 6: 6 words with adj/adv + time/place
    [
      ['in','class','teacher','carefully','teaches','students'],['on','field','kids','happily','play','friends'],
      ['in','park','children','joyfully','walk','parents'],['in','room','students','quietly','listen','teacher'],
      ['in','kitchen','mom','skillfully','cooks','meals'],['in','study','dad','intently','uses','computer'],
      ['in','yard','grandma','slowly','hangs','clothes'],['on','balcony','grandpa','leisurely','waters','flowers'],
      ['in','meeting','boss','seriously','talks','staff'],['in','clinic','doctor','carefully','checks','patients'],
      ['on','site','workers','tirelessly','carry','steel'],['in','field','farmers','bend','harvest','crops'],
      ['on','square','singer','emotionally','serenades','audience'],['in','theater','actor','deeply','performs','role'],
      ['in','gym','athlete','fiercely','fights','victory'],['on','beach','tourists','calmly','stroll','shore'],
      ['on','peak','painter','intently','sketches','landscape'],['in','mall','customers','excitedly','consult','clerks'],
      ['in','restaurant','guests','happily','savor','food'],['in','snow','children','wildly','play','friends'],
    ],
  ],
}

const I18N = {
  zh: {
    title:'连词成句', start:'开始游戏', rules:'游戏规则', history:'历史记录',
    tutStep1:'词语卡片打乱显示', tutStep2:'按顺序点击词语放入句子带', tutStep3:'全部选完后自动判定',
    prev:'上一步', next:'下一步', skip:'跳过', skipGame:'跳过', gotIt:'知道了',
    selectDuration:'选择训练时长', min:'分钟',
    level:'难度', score:'得分', time:'剩余时间', back:'返回', beltHint:'点击词语放入这里',
    qTime:'答题时间',
    done:'完成', gameOver:'游戏结束',
    correctTip:'回答正确', wrongTip:'回答错误',
    rTime:'训练时间', rGame:'训练项目', rLevel:'难度', rDur:'时长', rTotal:'总次数',
    rOk:'成功', rFail:'失败', rRate:'成功率', rAvg:'平均反应时长', rScore:'得分',
    noRecord:'暂无记录', close:'关闭', wordCount:'词数', coeff:'难度系数',
    ruleContent:'请按顺序依次点击词条放入下方的"句子带"，全部放入后系统会在1秒后自动判定。点击句子带中的词可将其取回。',
  },
  en: {
    title:'Word to Sentence', start:'Start Game', rules:'Rules', history:'History',
    tutStep1:'Shuffled word cards appear', tutStep2:'Tap words one by one to fill the belt', tutStep3:'Auto-check 1s after all words placed',
    prev:'Prev', next:'Next', skip:'Skip', skipGame:'Skip', gotIt:'Got it',
    selectDuration:'Select Duration', min:'min',
    level:'Level', score:'Score', time:'Time Left', back:'Back', beltHint:'Tap words to fill here',
    qTime:'Answer Time',
    done:'Done', gameOver:'Game Over',
    correctTip:'Correct!', wrongTip:'Wrong',
    rTime:'Time', rGame:'Game', rLevel:'Level', rDur:'Duration', rTotal:'Total',
    rOk:'Correct', rFail:'Wrong', rRate:'Accuracy', rAvg:'Avg Response', rScore:'Score',
    noRecord:'No records yet', close:'Close', wordCount:'Words', coeff:'Coefficient',
    ruleContent:'Tap the words in correct order to fill the sentence belt. Once all words are placed, the answer is auto-checked after 1 second. Tap a word in the belt to return it.',
  },
}

export default {
  name: 'App',
  data() {
    return {
      page: 'home',
      lang: 'zh',
      tutStep: 0,
      showRules: false,
      showResult: false,

      difficulty: 1,
      score: 0,
      timeLeft: 0,
      selectedDur: null,

      pool: [],
      belt: [],
      answer: [],
      qStartTime: 0,
      qTimeLeft: 10,
      qTimeMax: 10,

      showFeedback: false,
      feedbackCorrect: false,
      feedbackTimer: null,

      sessionTotal: 0,
      sessionOk: 0,
      responseTimes: [],
      windowTotal: 0,
      windowOk: 0,

      qIdxByLevel: [0,0,0,0,0,0],
      gameTimer: null,
      records: [],
      dragData: null,
      autoSubmitTimer: null,
      currentAudio: null,
      archiveId: null, // 患者档案 ID
      showBatchSkip: false, // 批次模式显示跳过
    }
  },
  computed: {
    T() { return I18N[this.lang] },
    diffConf() { return DIFF },
    tutWords() { return this.lang === 'zh' ? ['猫','追','球'] : ['cat','chases','ball'] },
    avgResponse() {
      if (!this.responseTimes.length) return 0
      return (this.responseTimes.reduce((a,b)=>a+b,0)/this.responseTimes.length).toFixed(1)
    },
  },
  created() {
    this.archiveId = resolveArchiveId(this.$route) // 解析档案 ID
    this.showBatchSkip = shouldShowPbBatchSkip() // 是否显示批次跳过
  },
  mounted() {
    const saved = localStorage.getItem('g02_records')
    if (saved) this.records = JSON.parse(saved)
    applyBatchTutorialEntry('lccj', {
      setDuration: (dur) => { this.selectedDur = dur },
      setStartDifficulty: (lv) => { this.difficulty = lv },
      openTutorial: () => { this.page = 'tutorial'; this.tutStep = 0 },
    })
  },
  methods: {
    toggleLang() { this.lang = this.lang === 'zh' ? 'en' : 'zh' },
    fmtTime(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}` },

    startGame(dur, startDiff) {
      this.selectedDur = dur
      this.difficulty = startDiff != null ? startDiff : getBatchStartDifficultyForGame('lccj')
      this.score = 0
      this.timeLeft = dur * 60
      this.sessionTotal = 0
      this.sessionOk = 0
      this.responseTimes = []
      this.windowTotal = 0
      this.windowOk = 0
      this.qIdxByLevel = [0,0,0,0,0,0]
      this.page = 'game'
      this.loadQuestion()
      this.gameTimer = setInterval(() => this.tick(), 1000)
    },

    playRulesAudio() {
      if (this.currentAudio) {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
      }
      const path = this.lang === 'zh' ? resolveVoice('/voice/chinese/rules.mp3') : resolveVoice('/voice/english/rules.mp3')
      this.currentAudio = new Audio(path)
      this.currentAudio.play().catch(() => {})
    },

    loadQuestion() {
      const lvl = this.difficulty - 1
      const pool = QUESTIONS[this.lang][lvl]
      const idx = Math.floor(Math.random() * pool.length)
      this.answer = pool[idx]
      const shuffled = [...this.answer].sort(() => Math.random() - 0.5)
      this.pool = shuffled.map(t => ({ t, used: false }))
      this.belt = []
      this.qStartTime = Date.now()
      this.qTimeMax = DIFF[lvl].t
      this.qTimeLeft = this.qTimeMax
      if (this.autoSubmitTimer) { clearTimeout(this.autoSubmitTimer); this.autoSubmitTimer = null }
      this.playRulesAudio()
    },

    tick() {
      this.timeLeft--

      const elapsed = this.selectedDur * 60 - this.timeLeft
      if (elapsed > 0 && elapsed % 60 === 0) {
        this.adjustDifficulty()
        this.windowTotal = 0
        this.windowOk = 0
      }

      if (this.timeLeft <= 0) { this.endGame(); return }

      if (!this.showFeedback && !this.autoSubmitTimer) {
        this.qTimeLeft--
        if (this.qTimeLeft <= 0) this.timeoutFail()
      }
    },

    timeoutFail() {
      if (this.autoSubmitTimer) return
      this.sessionTotal++
      this.windowTotal++
      this.responseTimes.push(this.qTimeMax)
      this.feedbackCorrect = false
      this.showFeedback = true
      if (this.feedbackTimer) clearTimeout(this.feedbackTimer)
      this.feedbackTimer = setTimeout(() => {
        this.showFeedback = false
        this.feedbackTimer = null
        this.loadQuestion()
      }, 1000)
    },

    adjustDifficulty() {
      if (!this.windowTotal) return
      const rate = this.windowOk / this.windowTotal
      if (rate >= 0.9 && this.difficulty < 6) this.difficulty++
      else if (rate < 0.7 && this.difficulty > 1) this.difficulty--
    },

    pickFromPool(i) {
      if (this.pool[i].used) return
      if (this.showFeedback || this.autoSubmitTimer) return
      this.pool[i].used = true
      this.belt.push({ t: this.pool[i].t, poolIdx: i })
      if (this.belt.length === this.pool.length) {
        if (this.autoSubmitTimer) clearTimeout(this.autoSubmitTimer)
        this.autoSubmitTimer = setTimeout(() => {
          this.autoSubmitTimer = null
          this.submit()
        }, 1000)
      }
    },

    removeFromBelt(i) {
      if (this.showFeedback) return
      if (this.autoSubmitTimer) { clearTimeout(this.autoSubmitTimer); this.autoSubmitTimer = null }
      const item = this.belt[i]
      this.pool[item.poolIdx].used = false
      this.belt.splice(i, 1)
    },

    submit() {
      const correct = this.belt.map(w => w.t).join('|') === this.answer.join('|')
      const rt = ((Date.now() - this.qStartTime) / 1000).toFixed(1)
      this.responseTimes.push(parseFloat(rt))
      this.sessionTotal++
      this.windowTotal++
      if (correct) {
        this.sessionOk++
        this.windowOk++
        this.score += Math.round(5 * DIFF[this.difficulty - 1].c)
      }
      this.feedbackCorrect = correct
      this.showFeedback = true
      if (this.feedbackTimer) clearTimeout(this.feedbackTimer)
      this.feedbackTimer = setTimeout(() => {
        this.showFeedback = false
        this.feedbackTimer = null
        this.loadQuestion()
      }, 1000)
    },

    finishTutorial() {
      if (afterBatchTutorial('lccj', (dur, startDiff) => this.startGame(dur, startDiff))) return
      this.page = 'duration'
    },

    /**
     * <summary>
     * 中途确认返回：只清定时器并离开，不上传训练数据
     * </summary>
     */
    confirmEndGame() {
      if (confirm(this.lang === 'zh' ? '确定要结束游戏吗？' : 'End game?')) {
        clearInterval(this.gameTimer) // 主倒计时
        this.gameTimer = null
        if (this.feedbackTimer) { clearTimeout(this.feedbackTimer); this.feedbackTimer = null } // 反馈延时
        if (this.autoSubmitTimer) { clearTimeout(this.autoSubmitTimer); this.autoSubmitTimer = null } // 自动提交
        this.showFeedback = false
        if (this.currentAudio) {
          this.currentAudio.pause()
          this.currentAudio.currentTime = 0
          this.currentAudio = null
        }
        leavePbGameWindow({ confirm: false })
      }
    },

    endGame() {
      clearInterval(this.gameTimer)
      this.gameTimer = null
      if (this.feedbackTimer) { clearTimeout(this.feedbackTimer); this.feedbackTimer = null }
      if (this.autoSubmitTimer) { clearTimeout(this.autoSubmitTimer); this.autoSubmitTimer = null }
      this.showFeedback = false
      if (this.currentAudio) {
        this.currentAudio.pause()
        this.currentAudio.currentTime = 0
        this.currentAudio = null
      }
      this.saveRecord()
      submitPbGameEndRecord(this.archiveId, 'lccj', {
        score: this.score || 0,
        avgTime: toPbGameSeconds(this.responseTimes.length ? Math.round(this.responseTimes.reduce(function (a, b) { return a + b }, 0) / this.responseTimes.length * 1000) : 0),
        successCount: this.sessionOk,
        failCount: this.sessionTotal - this.sessionOk,
        trainDuration: this.selectedDur,
        difficultyLevel: this.difficulty,
      }).catch(() => {})
      this.showResult = true
      this.page = 'game'
    },

    saveRecord() {
      const rec = {
        time: new Date().toLocaleString(),
        game: this.lang === 'zh' ? '连词成句' : 'Word to Sentence',
        level: this.difficulty,
        dur: this.selectedDur,
        total: this.sessionTotal,
        ok: this.sessionOk,
        fail: this.sessionTotal - this.sessionOk,
        rate: this.sessionTotal ? Math.round(this.sessionOk / this.sessionTotal * 100) : 0,
        avg: this.avgResponse,
        score: this.score,
      }
      this.records.unshift(rec)
      localStorage.setItem('g02_records', JSON.stringify(this.records))
    },

    goHome() {
      this.showResult = false
      this.page = 'home'
    },

    onBatchSkip() {
      skipPbBatchGame() // 跳过当前批次游戏
    },
  },
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; font-family: sans-serif; }
body { background: #0f2744; color: #e8f4fd; }

#app { display: flex; flex-direction: column; background: #f0f4ff; }

.lang-btn {
  position: fixed; top: 1.5vmin; right: 1.5vmin; z-index: 100;
  padding: 0.8vmin 1.8vmin; border-radius: 2vmin;
  border: 2px solid #5b8dee; background: #fff; color: #5b8dee;
  font-size: 1.8vmin; cursor: pointer;
}

.screen { width: 100%; height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; }

.center { justify-content: center; }

.title { font-size: 5vmin; color: #2c3e50; margin-bottom: 4vmin; font-weight: bold; }
.subtitle { font-size: 3.5vmin; color: #2c3e50; margin-bottom: 3vmin; }

.menu { display: flex; flex-direction: column; gap: 2vmin; width: 40vmin; }
.btn { padding: 1.5vmin 3vmin; border-radius: 1.5vmin; border: 2px solid #5b8dee; background: #fff; color: #5b8dee; font-size: 2.2vmin; cursor: pointer; transition: .15s; }
.btn.primary { background: #5b8dee; color: #fff; }
.btn.secondary { background: #e5e7eb; color: #4b5563; border-color: #9ca3af; }
.header-btns { display: flex; gap: 1.5vmin; align-items: center; }
.btn:hover { opacity: .85; }
.btn.small { font-size: 1.8vmin; padding: 1vmin 2vmin; }
.btn:disabled { opacity: .4; cursor: not-allowed; }

/* Tutorial */
.tut-box { min-width: 55vmin; }
.tut-demo { display: flex; flex-direction: column; align-items: center; gap: 2vmin; padding: 2vmin 0; }
.tut-label { font-size: 2.2vmin; color: #555; }
.demo-pool { display: flex; gap: 1.5vmin; flex-wrap: wrap; justify-content: center; }
.demo-card { padding: 1.2vmin 2.2vmin; background: #fff; border: 2px solid #5b8dee; border-radius: 1vmin; font-size: 2.2vmin; cursor: default; }
.demo-card.dim { opacity: .3; }
.demo-card.placed { background: #5b8dee; color: #fff; }
.demo-belt { min-width: 30vmin; min-height: 5vmin; border: 2px dashed #5b8dee; border-radius: 1vmin; display: flex; align-items: center; justify-content: center; gap: 1vmin; padding: 1vmin; }
.demo-belt.empty-belt { color: #aaa; font-size: 2vmin; }
.tut-dots { display: flex; gap: 1.5vmin; margin: 1.5vmin 0; }
.dot { width: 1.5vmin; height: 1.5vmin; border-radius: 50%; background: #ddd; }
.dot.active { background: #5b8dee; }
.tut-footer { display: flex; gap: 2vmin; justify-content: center; margin-top: 1vmin; }

/* Duration */
.duration-opts { display: flex; gap: 3vmin; }
.btn.dur { width: 15vmin; height: 15vmin; font-size: 3vmin; border-radius: 2vmin; }

/* Game */
.game-screen { justify-content: center; padding: 3vmin 4vmin; gap: 3vmin; position: relative; }
.game-header { position: absolute; top: 2vmin; left: 3vmin; right: 3vmin; display: flex; justify-content: space-between; align-items: center; }
.stats { display: flex; gap: 3vmin; font-size: 2.2vmin; font-weight: bold; color: #2c3e50; }
.q-timer-wrap { width: 100%; height: 1.2vmin; background: #e0e0e0; border-radius: 1vmin; overflow: hidden; margin-top: 2vmin; }
.q-timer-bar { height: 100%; transition: width .9s linear, background .3s; }
.word-pool { display: flex; flex-wrap: wrap; gap: 2.2vmin; justify-content: center; padding: 3.5vmin; background: #fff; border-radius: 2vmin; width: 100%; min-height: 20vmin; align-content: center; box-shadow: 0 2px 10px rgba(91,141,238,.08); }
.word-card { padding: 2.4vmin 4vmin; background: #fff; color: #1a2a4a; border: 3px solid #3a6fd8; border-radius: 1.4vmin; font-size: max(4vmin, 22px); font-weight: 700; cursor: pointer; transition: .15s; user-select: none; box-shadow: 0 2px 6px rgba(58,111,216,.15); }
.word-card:active { transform: scale(.96); }
.word-card:hover:not(.used) { background: #eef2ff; transform: translateY(-2px); }
.word-card.used { opacity: 1; background: #e6e9ef; color: #b0b6c2; border-color: #c6ccd6; box-shadow: none; cursor: default; text-decoration: line-through; }
.word-card.placed { background: #3a6fd8; color: #fff; border-color: #3a6fd8; }
.belt-wrap { width: 100%; }
.sentence-belt { min-height: 12vmin; border: 2.5px dashed #5b8dee; border-radius: 2vmin; display: flex; flex-wrap: wrap; gap: 2.2vmin; align-items: center; padding: 2.5vmin 3vmin; background: #f8faff; }
.belt-hint { color: #aaa; font-size: max(2.6vmin, 16px); width: 100%; text-align: center; }
.submit-btn { width: 40vmin; align-self: center; font-size: 2.5vmin; padding: 1.8vmin; }

/* Start button */
.start-btn { margin-top: 5vmin; width: 30vmin; font-size: 2.5vmin; padding: 1.8vmin; }
.btn.dur:not(.primary) { color: #5b8dee; }

/* Records */
.records-screen { justify-content: flex-start; padding: 3vmin; }
.rec-header { width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 2vmin; }
.rec-header h2 { font-size: 3vmin; }
.rec-table-wrap { width: 100%; overflow: auto; flex: 1; }
.rec-table { width: 100%; border-collapse: collapse; font-size: 1.8vmin; }
.rec-table th, .rec-table td { border: 1px solid #ddd; padding: 1vmin 1.5vmin; text-align: center; white-space: nowrap; }
.rec-table th { background: #5b8dee; color: #fff; }
.no-rec { font-size: 2.2vmin; color: #999; margin-top: 5vmin; }

/* Modal */
.overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: flex; align-items: center; justify-content: center; z-index: 200; }
.feedback-overlay { background: rgba(0,0,0,.3); z-index: 300; pointer-events: none; }
.feedback-box { background: #fff; border-radius: 3vmin; padding: 4vmin 6vmin; display: flex; flex-direction: column; align-items: center; gap: 1.5vmin; box-shadow: 0 4px 24px rgba(0,0,0,.2); animation: fbPop .18s ease-out; min-width: 30vmin; }
.feedback-box.ok { border: .5vmin solid #2ecc71; }
.feedback-box.ng { border: .5vmin solid #e74c3c; }
.feedback-icon { font-size: 8vmin; font-weight: bold; line-height: 1; }
.feedback-box.ok .feedback-icon { color: #2ecc71; }
.feedback-box.ng .feedback-icon { color: #e74c3c; }
.feedback-text { font-size: 3vmin; color: #2c3e50; font-weight: 600; }
@keyframes fbPop { from { transform: scale(.7); opacity: 0; } to { transform: scale(1); opacity: 1; } }
.q-time.urgent { color: #e74c3c; font-weight: bold; animation: qBlink .6s infinite; }
@keyframes qBlink { 50% { opacity: .4; } }
.modal-box { background: #fff; border-radius: 2.5vmin; padding: 3vmin 4vmin; max-width: 80vmin; width: 90%; display: flex; flex-direction: column; gap: 2vmin; max-height: 90vh; overflow-y: auto; }
.modal-box h3 { font-size: 2.8vmin; color: #2c3e50; }
.rule-text { font-size: 2vmin; color: #555; line-height: 1.6; }
.rule-table { width: 100%; border-collapse: collapse; font-size: 1.8vmin; }
.rule-table th, .rule-table td { border: 1px solid #ddd; padding: .8vmin 1.2vmin; text-align: center; }
.rule-table th { background: #eef2ff; }
.result-stats { display: flex; flex-direction: column; gap: 1.2vmin; font-size: 2.2vmin; }
.result-stats strong { color: #5b8dee; font-size: 3vmin; }

/* ============= Portrait (phone / WeChat web-view) ============= */
@media (orientation: portrait) {
  .lang-btn {
    top: calc(1.5vmin + env(safe-area-inset-top));
    padding: 1.2vmin 2.6vmin; border-radius: 3vmin;
    font-size: max(3.2vmin, 14px);
  }

  .title { font-size: max(7vmin, 22px); margin-bottom: 6vmin; }
  .subtitle { font-size: max(5vmin, 18px); margin-bottom: 5vmin; }

  .menu { width: 80vw; gap: 3vmin; }
  .btn {
    padding: 2.4vmin 4vmin; border-radius: 3vmin;
    font-size: max(4vmin, 16px);
  }
  .btn.small { font-size: max(3.4vmin, 14px); padding: 1.8vmin 3vmin; border-radius: 2.6vmin; }
  .header-btns { gap: 2vmin; }

  /* Tutorial */
  .tut-box { min-width: 0; width: 90vw; }
  .tut-label { font-size: max(3.8vmin, 15px); }
  .demo-card { padding: 2vmin 3.2vmin; font-size: max(4vmin, 16px); border-radius: 1.6vmin; }
  .demo-belt { min-width: 60vw; min-height: 8vmin; }
  .demo-belt.empty-belt { font-size: max(3.6vmin, 14px); }
  .tut-footer { flex-wrap: wrap; gap: 2.5vmin; }

  /* Duration */
  .duration-opts { flex-direction: column; gap: 3vmin; width: 80vw; }
  .btn.dur { width: 100%; height: 18vmin; font-size: max(5vmin, 20px); border-radius: 3vmin; }
  .start-btn { width: 80vw; font-size: max(4.4vmin, 18px); padding: 2.6vmin; margin-top: 6vmin; }

  /* Game */
  .game-screen {
    padding: calc(3vmin + env(safe-area-inset-top)) 4vmin calc(3vmin + env(safe-area-inset-bottom));
    gap: 4vmin;
  }
  .game-header {
    top: calc(2vmin + env(safe-area-inset-top));
    left: 3vmin; right: 3vmin;
    flex-direction: column;
    align-items: flex-start;
    gap: 2vmin;
  }
  .stats {
    flex-wrap: wrap;
    gap: 2vmin 3vmin;
    font-size: max(3.4vmin, 14px);
    width: 100%;
  }
  .header-btns { align-self: flex-end; }
  .word-pool {
    gap: 2.4vmin; padding: 4vmin;
    min-height: 22vmin;
    margin-top: 22vmin; /* clear the taller stacked header */
  }
  .word-card {
    padding: 3vmin 5vmin;
    font-size: max(5.5vmin, 24px);
    border-radius: 1.8vmin;
  }
  .sentence-belt { min-height: 16vmin; gap: 2.4vmin; padding: 3vmin; }
  .belt-hint { font-size: max(3.8vmin, 15px); }

  /* Records — turn table into stacked cards */
  .records-screen {
    padding: calc(3vmin + env(safe-area-inset-top)) 4vmin calc(3vmin + env(safe-area-inset-bottom));
  }
  .rec-header h2 { font-size: max(5vmin, 20px); }
  .rec-table thead { display: none; }
  .rec-table, .rec-table tbody, .rec-table tr, .rec-table td { display: block; width: 100%; }
  .rec-table tr {
    margin-bottom: 3vmin;
    background: #fff;
    border-radius: 2vmin;
    padding: 2vmin 3vmin;
    box-shadow: 0 2px 8px rgba(91,141,238,.08);
  }
  .rec-table td {
    border: none;
    text-align: left;
    padding: 1vmin 0;
    font-size: max(3.6vmin, 14px);
    white-space: normal;
    display: flex; justify-content: space-between; gap: 2vmin;
  }
  .rec-table td::before {
    content: attr(data-label);
    font-weight: bold;
    color: #5b8dee;
  }
  .no-rec { font-size: max(4vmin, 16px); }

  /* Modals */
  .modal-box {
    max-width: none; width: 92vw;
    padding: 4vmin 4vmin;
    border-radius: 3vmin;
    max-height: 88vh;
  }
  .modal-box h3 { font-size: max(5vmin, 20px); }
  .rule-text { font-size: max(3.8vmin, 15px); }
  .rule-table { font-size: max(3.4vmin, 13px); }
  .rule-table th, .rule-table td { padding: 1.4vmin 1.6vmin; }
  .result-stats { font-size: max(4vmin, 16px); gap: 1.8vmin; }
  .result-stats strong { font-size: max(5vmin, 20px); }

  .feedback-box {
    padding: 6vmin 8vmin; border-radius: 4vmin;
    min-width: 55vw;
  }
  .feedback-icon { font-size: max(14vmin, 56px); }
  .feedback-text { font-size: max(5vmin, 20px); }
}
</style>
