// 成语数据库 —— 按难度分级
// tier: 极常用(super) / 常用(common) / 简单(simple) / 中等(medium) / 较难(hard)
// idiom: 四字成语；meaning: 简要释义（可在结算或提示中展示）

export const IDIOMS = [
  // ============ 极常用 super ============
  { idiom: '一心一意', tier: 'super', meaning: '心思意念专一，毫无杂念' },
  { idiom: '五颜六色', tier: 'super', meaning: '形容色彩繁多而艳丽' },
  { idiom: '四面八方', tier: 'super', meaning: '各个方向和地方' },
  { idiom: '三心二意', tier: 'super', meaning: '形容犹豫不决或用心不专' },
  { idiom: '成千上万', tier: 'super', meaning: '形容数量极多' },
  { idiom: '花红柳绿', tier: 'super', meaning: '形容春天鲜艳的景色' },
  { idiom: '大公无私', tier: 'super', meaning: '一心为公，没有私心' },
  { idiom: '风和日丽', tier: 'super', meaning: '和风习习，阳光明媚' },
  { idiom: '眉开眼笑', tier: 'super', meaning: '形容高兴愉快的样子' },
  { idiom: '手忙脚乱', tier: 'super', meaning: '形容做事慌乱，不知所措' },
  { idiom: '异口同声', tier: 'super', meaning: '大家说的话都一样' },
  { idiom: '一模一样', tier: 'super', meaning: '形容完全相同' },
  { idiom: '自言自语', tier: 'super', meaning: '独自一人说话' },
  { idiom: '千军万马', tier: 'super', meaning: '形容雄壮的队伍或浩大的声势' },
  { idiom: '南辕北辙', tier: 'super', meaning: '行动和目的正好相反' },
  { idiom: '守株待兔', tier: 'super', meaning: '死守经验，不知变通' },
  { idiom: '画蛇添足', tier: 'super', meaning: '做了多余的事反而不好' },
  { idiom: '亡羊补牢', tier: 'super', meaning: '出了问题及时补救' },
  { idiom: '滥竽充数', tier: 'super', meaning: '没有真才实学，蒙混过关' },
  { idiom: '掩耳盗铃', tier: 'super', meaning: '自欺欺人' },

  // ============ 常用 common ============
  { idiom: '安居乐业', tier: 'common', meaning: '安定地生活，愉快地劳动' },
  { idiom: '举世闻名', tier: 'common', meaning: '全世界都知道' },
  { idiom: '博学多才', tier: 'common', meaning: '学问广博，有多方面的才能' },
  { idiom: '不劳而获', tier: 'common', meaning: '自己不劳动而占有别人劳动的成果' },
  { idiom: '锦上添花', tier: 'common', meaning: '在美好的事物上增添美好' },
  { idiom: '雪中送炭', tier: 'common', meaning: '在别人急需时给予帮助' },
  { idiom: '井底之蛙', tier: 'common', meaning: '比喻见识短浅的人' },
  { idiom: '望梅止渴', tier: 'common', meaning: '用空想来安慰自己' },
  { idiom: '刻舟求剑', tier: 'common', meaning: '拘泥固执，不知变通' },
  { idiom: '狐假虎威', tier: 'common', meaning: '倚仗别人的势力来欺压人' },
  { idiom: '杯弓蛇影', tier: 'common', meaning: '因疑神疑鬼而自惊自扰' },
  { idiom: '对牛弹琴', tier: 'common', meaning: '对不懂道理的人讲道理' },
  { idiom: '愚公移山', tier: 'common', meaning: '有毅力就能成功' },
  { idiom: '叶公好龙', tier: 'common', meaning: '表面爱好而实际并不真爱好' },
  { idiom: '朝三暮四', tier: 'common', meaning: '反复无常，变卦不定' },
  { idiom: '塞翁失马', tier: 'common', meaning: '坏事在一定条件下可变成好事' },
  { idiom: '雪上加霜', tier: 'common', meaning: '比喻遭受接连的打击' },
  { idiom: '水到渠成', tier: 'common', meaning: '条件成熟了，事情自然会成功' },
  { idiom: '一举两得', tier: 'common', meaning: '做一件事得到两方面的好处' },
  { idiom: '半途而废', tier: 'common', meaning: '事情没做完就停止' },

  // ============ 简单 simple ============
  { idiom: '安然无恙', tier: 'simple', meaning: '平安无事，没有遭受损害' },
  { idiom: '拔苗助长', tier: 'simple', meaning: '违反事物发展规律，急于求成' },
  { idiom: '百折不挠', tier: 'simple', meaning: '意志坚强，毫不动摇' },
  { idiom: '别具一格', tier: 'simple', meaning: '另有一种独特的风格' },
  { idiom: '不翼而飞', tier: 'simple', meaning: '没有翅膀而飞走，比喻突然消失' },
  { idiom: '沧海一粟', tier: 'simple', meaning: '大海里的一颗谷粒，比喻非常渺小' },
  { idiom: '车水马龙', tier: 'simple', meaning: '车马来往不绝，形容热闹' },
  { idiom: '出类拔萃', tier: 'simple', meaning: '超出同类之上' },
  { idiom: '大同小异', tier: 'simple', meaning: '大体相同，略有差异' },
  { idiom: '风驰电掣', tier: 'simple', meaning: '形容非常迅速' },
  { idiom: '各抒己见', tier: 'simple', meaning: '各人充分发表自己的意见' },
  { idiom: '汗流浃背', tier: 'simple', meaning: '汗水湿透背脊' },
  { idiom: '和睦相处', tier: 'simple', meaning: '彼此融洽地相处' },
  { idiom: '横七竖八', tier: 'simple', meaning: '有的横，有的竖，杂乱无章' },
  { idiom: '狼吞虎咽', tier: 'simple', meaning: '形容吃东西又猛又急' },
  { idiom: '井井有条', tier: 'simple', meaning: '形容条理分明，整齐不乱' },
  { idiom: '目不转睛', tier: 'simple', meaning: '眼珠子一动不动地盯着看' },

  // ============ 中等 medium ============
  { idiom: '按部就班', tier: 'medium', meaning: '按照一定的条理，遵循一定的程序' },
  { idiom: '斑驳陆离', tier: 'medium', meaning: '形容色彩繁杂' },
  { idiom: '筚路蓝缕', tier: 'medium', meaning: '形容创业艰辛' },
  { idiom: '不刊之论', tier: 'medium', meaning: '不能改动或不可磨灭的言论' },
  { idiom: '沧海桑田', tier: 'medium', meaning: '比喻世事变化很大' },
  { idiom: '草长莺飞', tier: 'medium', meaning: '形容江南春天的景色' },
  { idiom: '沉鱼落雁', tier: 'medium', meaning: '形容女子容貌极美' },
  { idiom: '独辟蹊径', tier: 'medium', meaning: '自己开辟一条新道路' },
  { idiom: '含辛茹苦', tier: 'medium', meaning: '受尽艰难困苦' },
  { idiom: '鹤立鸡群', tier: 'medium', meaning: '比喻一个人的才能或仪表超群' },
  { idiom: '巧夺天工', tier: 'medium', meaning: '人工的精巧胜过天然' },
  { idiom: '气宇轩昂', tier: 'medium', meaning: '形容人精神饱满，气度不凡' },
  { idiom: '融会贯通', tier: 'medium', meaning: '把各方面知识融合起来彻底理解' },
  { idiom: '深谋远虑', tier: 'medium', meaning: '计划周密，考虑长远' },
  { idiom: '叹为观止', tier: 'medium', meaning: '赞叹所见事物好到极点' },

  // ============ 较难 hard ============
  { idiom: '暴戾恣睢', tier: 'hard', meaning: '形容凶恶残暴，任意胡为' },
  { idiom: '筚门圭窦', tier: 'hard', meaning: '形容穷苦人家的住处' },
  { idiom: '踔厉风发', tier: 'hard', meaning: '形容精神振奋，斗志昂扬' },
  { idiom: '厝火积薪', tier: 'hard', meaning: '把火放到柴堆下，比喻隐患' },
  { idiom: '殚精竭虑', tier: 'hard', meaning: '用尽精力，费尽心思' },
  { idiom: '洞若观火', tier: 'hard', meaning: '观察事物明白透彻' },
  { idiom: '踽踽独行', tier: 'hard', meaning: '孤零零地独自走着' },
  { idiom: '涸辙之鲋', tier: 'hard', meaning: '比喻处境困难急待援助的人' },
  { idiom: '睚眦必报', tier: 'hard', meaning: '极小的怨恨也一定要报复' },
  { idiom: '踵事增华', tier: 'hard', meaning: '继续以前的事业并更加发展' },
  { idiom: '筚路褴褛', tier: 'hard', meaning: '驾着简陋的车穿着破衣，形容艰苦创业' },
  { idiom: '虚怀若谷', tier: 'hard', meaning: '胸怀像山谷一样深广' },
  { idiom: '踌躇满志', tier: 'hard', meaning: '形容对自己的成就非常得意' },
  { idiom: '瞠目结舌', tier: 'hard', meaning: '瞪眼说不出话来，形容窘困或惊呆' },
  { idiom: '缠绵悱恻', tier: 'hard', meaning: '形容情意深切缠绵' }
]

// 按 tier 分组
export function idiomsByTiers(tiers) {
  return IDIOMS.filter(it => tiers.includes(it.tier))
}

// 常用汉字池（用于生成干扰选项） —— 覆盖大部分成语字
export const CHAR_POOL = Array.from(new Set(IDIOMS.flatMap(it => it.idiom.split('')))).concat(
  '天地人山水火风云雷电月日星光明暗春夏秋冬东西南北中大小多少高低远近前后左右上下内外新旧美丑黑白红黄蓝绿金银铜铁玉石花草木叶根枝果实心口手足眼耳鼻头身家国天下富贵贫穷生死存亡吉凶祸福善恶忠奸勇怯智愚强弱刚柔文武'.split('')
)
