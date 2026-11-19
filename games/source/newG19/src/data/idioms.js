// 成语纠错题库
// idx: 错别字在正确成语中的位置(0-3)
// wrongChar: 错别字, correctChar: 正确的字
// difficulty: 'easy' 常用成语+明显错别字; 'hard' 生僻成语或近形字
export const idioms = [
  // ============ 简单题：常用成语，错别字读音或字形有明显差异 ============
  { correct: '眉开眼笑', wrong: '眉开演笑', idx: 2, wrongChar: '演', correctChar: '眼', difficulty: 'easy' },
  { correct: '垂头丧气', wrong: '垂头伤气', idx: 2, wrongChar: '伤', correctChar: '丧', difficulty: 'easy' },
  { correct: '大惊失色', wrong: '大京失色', idx: 1, wrongChar: '京', correctChar: '惊', difficulty: 'easy' },
  { correct: '心平气和', wrong: '心平气合', idx: 3, wrongChar: '合', correctChar: '和', difficulty: 'easy' },
  { correct: '忐忑不安', wrong: '坛忑不安', idx: 0, wrongChar: '坛', correctChar: '忐', difficulty: 'easy' },
  { correct: '助人为乐', wrong: '助人为落', idx: 3, wrongChar: '落', correctChar: '乐', difficulty: 'easy' },
  { correct: '坚持不懈', wrong: '坚持不谢', idx: 3, wrongChar: '谢', correctChar: '懈', difficulty: 'easy' },
  { correct: '诚实守信', wrong: '城实守信', idx: 0, wrongChar: '城', correctChar: '诚', difficulty: 'easy' },
  { correct: '勤劳刻苦', wrong: '勤劳客苦', idx: 2, wrongChar: '客', correctChar: '刻', difficulty: 'easy' },
  { correct: '春暖花开', wrong: '春暖花升', idx: 3, wrongChar: '升', correctChar: '开', difficulty: 'easy' },
  { correct: '风和日丽', wrong: '风合日丽', idx: 1, wrongChar: '合', correctChar: '和', difficulty: 'easy' },
  { correct: '山清水秀', wrong: '山清水绣', idx: 3, wrongChar: '绣', correctChar: '秀', difficulty: 'easy' },
  { correct: '万里无云', wrong: '万里无运', idx: 3, wrongChar: '运', correctChar: '云', difficulty: 'easy' },
  { correct: '秋高气爽', wrong: '秋高气双', idx: 3, wrongChar: '双', correctChar: '爽', difficulty: 'easy' },
  { correct: '手舞足蹈', wrong: '手舞足倒', idx: 3, wrongChar: '倒', correctChar: '蹈', difficulty: 'easy' },
  { correct: '左顾右盼', wrong: '左故右盼', idx: 1, wrongChar: '故', correctChar: '顾', difficulty: 'easy' },
  { correct: '小心翼翼', wrong: '小心异翼', idx: 2, wrongChar: '异', correctChar: '翼', difficulty: 'easy' },
  { correct: '全力以赴', wrong: '全力以富', idx: 3, wrongChar: '富', correctChar: '赴', difficulty: 'easy' },
  { correct: '千言万语', wrong: '千颜万语', idx: 1, wrongChar: '颜', correctChar: '言', difficulty: 'easy' },
  { correct: '对答如流', wrong: '对答如留', idx: 3, wrongChar: '留', correctChar: '流', difficulty: 'easy' },
  { correct: '语重心长', wrong: '与重心长', idx: 0, wrongChar: '与', correctChar: '语', difficulty: 'easy' },
  { correct: '轻声细语', wrong: '清声细语', idx: 0, wrongChar: '清', correctChar: '轻', difficulty: 'easy' },
  { correct: '自言自语', wrong: '自颜自语', idx: 1, wrongChar: '颜', correctChar: '言', difficulty: 'easy' },
  { correct: '成千上万', wrong: '城千上万', idx: 0, wrongChar: '城', correctChar: '成', difficulty: 'easy' },
  { correct: '数不胜数', wrong: '数不生数', idx: 2, wrongChar: '生', correctChar: '胜', difficulty: 'easy' },
  { correct: '独一无二', wrong: '独一无而', idx: 3, wrongChar: '而', correctChar: '二', difficulty: 'easy' },
  { correct: '应有尽有', wrong: '应有近有', idx: 2, wrongChar: '近', correctChar: '尽', difficulty: 'easy' },
  { correct: '天长地久', wrong: '天长地酒', idx: 3, wrongChar: '酒', correctChar: '久', difficulty: 'easy' },
  { correct: '争分夺秒', wrong: '争分多秒', idx: 2, wrongChar: '多', correctChar: '夺', difficulty: 'easy' },
  { correct: '日积月累', wrong: '日集月累', idx: 1, wrongChar: '集', correctChar: '积', difficulty: 'easy' },
  { correct: '一心一意', wrong: '一心一议', idx: 3, wrongChar: '议', correctChar: '意', difficulty: 'easy' },
  { correct: '七上八下', wrong: '七上八夏', idx: 3, wrongChar: '夏', correctChar: '下', difficulty: 'easy' },
  { correct: '十全十美', wrong: '时全十美', idx: 0, wrongChar: '时', correctChar: '十', difficulty: 'easy' },
  { correct: '五颜六色', wrong: '五颜绿色', idx: 2, wrongChar: '绿', correctChar: '六', difficulty: 'easy' },
  { correct: '四面八方', wrong: '四面八房', idx: 3, wrongChar: '房', correctChar: '方', difficulty: 'easy' },
  { correct: '喜气洋洋', wrong: '喜气羊羊', idx: 2, wrongChar: '羊', correctChar: '洋', difficulty: 'easy' },
  { correct: '兴高采烈', wrong: '星高采烈', idx: 0, wrongChar: '星', correctChar: '兴', difficulty: 'easy' },
  { correct: '欢天喜地', wrong: '欢天洗地', idx: 2, wrongChar: '洗', correctChar: '喜', difficulty: 'easy' },
  { correct: '异口同声', wrong: '一口同声', idx: 0, wrongChar: '一', correctChar: '异', difficulty: 'easy' },
  { correct: '龙飞凤舞', wrong: '龙飞风舞', idx: 2, wrongChar: '风', correctChar: '凤', difficulty: 'easy' },
  { correct: '画蛇添足', wrong: '话蛇添足', idx: 0, wrongChar: '话', correctChar: '画', difficulty: 'easy' },
  { correct: '亡羊补牢', wrong: '忘羊补牢', idx: 0, wrongChar: '忘', correctChar: '亡', difficulty: 'easy' },
  { correct: '守株待兔', wrong: '守株代兔', idx: 2, wrongChar: '代', correctChar: '待', difficulty: 'easy' },
  { correct: '掩耳盗铃', wrong: '掩耳道铃', idx: 2, wrongChar: '道', correctChar: '盗', difficulty: 'easy' },
  { correct: '刻舟求剑', wrong: '刻州求剑', idx: 1, wrongChar: '州', correctChar: '舟', difficulty: 'easy' },

  // ============ 较难题：近形字或较生僻错别字 ============
  { correct: '一诺千金', wrong: '一喏千金', idx: 1, wrongChar: '喏', correctChar: '诺', difficulty: 'hard' },
  { correct: '兴高采烈', wrong: '兴高彩烈', idx: 2, wrongChar: '彩', correctChar: '采', difficulty: 'hard' },
  { correct: '再接再厉', wrong: '再接再励', idx: 3, wrongChar: '励', correctChar: '厉', difficulty: 'hard' },
  { correct: '川流不息', wrong: '穿流不息', idx: 0, wrongChar: '穿', correctChar: '川', difficulty: 'hard' },
  { correct: '变本加厉', wrong: '变本加利', idx: 3, wrongChar: '利', correctChar: '厉', difficulty: 'hard' },
  { correct: '迫不及待', wrong: '迫不急待', idx: 2, wrongChar: '急', correctChar: '及', difficulty: 'hard' },
  { correct: '走投无路', wrong: '走头无路', idx: 1, wrongChar: '头', correctChar: '投', difficulty: 'hard' },
  { correct: '各抒己见', wrong: '各抒己解', idx: 3, wrongChar: '解', correctChar: '见', difficulty: 'hard' },
  { correct: '委曲求全', wrong: '委屈求全', idx: 1, wrongChar: '屈', correctChar: '曲', difficulty: 'hard' },
  { correct: '蛛丝马迹', wrong: '珠丝马迹', idx: 0, wrongChar: '珠', correctChar: '蛛', difficulty: 'hard' },
  { correct: '融会贯通', wrong: '融汇贯通', idx: 1, wrongChar: '汇', correctChar: '会', difficulty: 'hard' },
  { correct: '世外桃源', wrong: '世外桃园', idx: 3, wrongChar: '园', correctChar: '源', difficulty: 'hard' },
  { correct: '一如既往', wrong: '一如继往', idx: 2, wrongChar: '继', correctChar: '既', difficulty: 'hard' },
  { correct: '病入膏肓', wrong: '病入膏盲', idx: 3, wrongChar: '盲', correctChar: '肓', difficulty: 'hard' },
  { correct: '明察秋毫', wrong: '明查秋毫', idx: 1, wrongChar: '查', correctChar: '察', difficulty: 'hard' },
  { correct: '一筹莫展', wrong: '一愁莫展', idx: 1, wrongChar: '愁', correctChar: '筹', difficulty: 'hard' },
  { correct: '死心塌地', wrong: '死心踏地', idx: 2, wrongChar: '踏', correctChar: '塌', difficulty: 'hard' },
  { correct: '一泻千里', wrong: '一泄千里', idx: 1, wrongChar: '泄', correctChar: '泻', difficulty: 'hard' },
  { correct: '卑躬屈膝', wrong: '卑躬曲膝', idx: 2, wrongChar: '曲', correctChar: '屈', difficulty: 'hard' },
  { correct: '蜂拥而至', wrong: '蜂涌而至', idx: 1, wrongChar: '涌', correctChar: '拥', difficulty: 'hard' },
  { correct: '各行其是', wrong: '各行其事', idx: 3, wrongChar: '事', correctChar: '是', difficulty: 'hard' },
  { correct: '甘拜下风', wrong: '甘败下风', idx: 1, wrongChar: '败', correctChar: '拜', difficulty: 'hard' },
  { correct: '谈笑风生', wrong: '谈笑风声', idx: 3, wrongChar: '声', correctChar: '生', difficulty: 'hard' },
  { correct: '名副其实', wrong: '名符其实', idx: 1, wrongChar: '符', correctChar: '副', difficulty: 'hard' },
  { correct: '一鼓作气', wrong: '一股作气', idx: 1, wrongChar: '股', correctChar: '鼓', difficulty: 'hard' },
  { correct: '别出心裁', wrong: '别出新裁', idx: 2, wrongChar: '新', correctChar: '心', difficulty: 'hard' },
  { correct: '出类拔萃', wrong: '出类拔粹', idx: 3, wrongChar: '粹', correctChar: '萃', difficulty: 'hard' },
  { correct: '巧夺天工', wrong: '巧夺天功', idx: 3, wrongChar: '功', correctChar: '工', difficulty: 'hard' },
  { correct: '相辅相成', wrong: '相辅相承', idx: 3, wrongChar: '承', correctChar: '成', difficulty: 'hard' },
  { correct: '山清水秀', wrong: '山青水秀', idx: 1, wrongChar: '青', correctChar: '清', difficulty: 'hard' },
  { correct: '卧薪尝胆', wrong: '卧薪偿胆', idx: 2, wrongChar: '偿', correctChar: '尝', difficulty: 'hard' },
  { correct: '无精打采', wrong: '无精打彩', idx: 3, wrongChar: '彩', correctChar: '采', difficulty: 'hard' },
  { correct: '沧海一粟', wrong: '苍海一粟', idx: 0, wrongChar: '苍', correctChar: '沧', difficulty: 'hard' },
  { correct: '按部就班', wrong: '按步就班', idx: 1, wrongChar: '步', correctChar: '部', difficulty: 'hard' },
  { correct: '不假思索', wrong: '不加思索', idx: 1, wrongChar: '加', correctChar: '假', difficulty: 'hard' },
  { correct: '毛骨悚然', wrong: '毛骨耸然', idx: 2, wrongChar: '耸', correctChar: '悚', difficulty: 'hard' },
  { correct: '风驰电掣', wrong: '风弛电掣', idx: 1, wrongChar: '弛', correctChar: '驰', difficulty: 'hard' },
  { correct: '销声匿迹', wrong: '消声匿迹', idx: 0, wrongChar: '消', correctChar: '销', difficulty: 'hard' },
  { correct: '弱不禁风', wrong: '弱不经风', idx: 2, wrongChar: '经', correctChar: '禁', difficulty: 'hard' },
  { correct: '不胫而走', wrong: '不径而走', idx: 1, wrongChar: '径', correctChar: '胫', difficulty: 'hard' },
  { correct: '烦躁不安', wrong: '烦燥不安', idx: 1, wrongChar: '燥', correctChar: '躁', difficulty: 'hard' },
  { correct: '恻隐之心', wrong: '侧隐之心', idx: 0, wrongChar: '侧', correctChar: '恻', difficulty: 'hard' },
  { correct: '不落窠臼', wrong: '不落巢臼', idx: 2, wrongChar: '巢', correctChar: '窠', difficulty: 'hard' },
  { correct: '手忙脚乱', wrong: '手茫脚乱', idx: 1, wrongChar: '茫', correctChar: '忙', difficulty: 'hard' },
  { correct: '莫名其妙', wrong: '莫明其妙', idx: 1, wrongChar: '明', correctChar: '名', difficulty: 'hard' },
  { correct: '张灯结彩', wrong: '张灯结采', idx: 3, wrongChar: '采', correctChar: '彩', difficulty: 'hard' },
  { correct: '记忆犹新', wrong: '记忆尤新', idx: 2, wrongChar: '尤', correctChar: '犹', difficulty: 'hard' },
  { correct: '语重心长', wrong: '语重心肠', idx: 3, wrongChar: '肠', correctChar: '长', difficulty: 'hard' },
  { correct: '不厌其烦', wrong: '不厌其繁', idx: 3, wrongChar: '繁', correctChar: '烦', difficulty: 'hard' },
  { correct: '肆无忌惮', wrong: '肆无忌旦', idx: 3, wrongChar: '旦', correctChar: '惮', difficulty: 'hard' }
]

// 按难度获取题库
export function getIdiomsByLevel(level) {
  // 难度 1-2 只用简单题；3-4 简单+较难都可以；5-6 优先较难题
  if (level <= 2) return idioms.filter(x => x.difficulty === 'easy')
  if (level >= 5) return idioms.filter(x => x.difficulty === 'hard')
  return idioms
}


// 常用汉字池，用于生成干扰选项
export const distractorPool = [
  '喏','诺','若','诉','诚','许','话','说','讲',
  '彩','采','踩','菜','睬','踩','蔡',
  '厉','励','历','立','利','丽',
  '川','穿','传','串','船',
  '及','急','即','级','极','吉',
  '投','头','偷','透','兔',
  '见','解','件','建','间','简',
  '曲','屈','趣','取','去',
  '蛛','珠','株','朱','诸','猪',
  '会','汇','绘','惠','慧','徽',
  '源','园','原','远','元','缘',
  '既','继',  '记','即','急',
  '肓','盲','忙','茫','芒','忘',
  '察','查','插','搭','擦',
  '筹','愁','酬','抽','稠',
  '塌','踏','塔','挞','沓',
  '泻','泄','泊','注','浇',
  '屈','曲','驱','躯','趋',
  '拥','涌','用','拥','踊',
  '是','事','市','世','示',
  '拜','败','摆','拌','伴',
  '生','声','升','身','胜',
  '副','符','付','幅','富',
  '鼓','股','古','估','故',
  '心','新','辛','馨','欣',
  '萃','粹','翠','脆','醉',
  '工','功','公','攻','宫',
  '成','承','诚','城','程',
  '清','青','情','请','轻',
  '尝','偿','常','长','厂',
  '采','彩','踩','菜','睬',
  '沧','苍','仓','舱','桑',
  '部','步','布','簿','捕',
  '假','加','架','嘉','驾',
  '悚','耸','送','搜','宋',
  '驰','弛','池','迟','持',
  '销','消','削','霄','肖',
  '禁','经','惊','京','荆',
  '胫','径','净','境','敬',
  '躁','燥','早','造','照',
  '恻','侧','测','策','册',
  '窠','巢','科','棵','颗',
  '忙','茫','芒','盲','望',
  '名','明','命','鸣','铭',
  '彩','采','菜','踩','裁',
  '犹','尤','油','由','游',
  '长','肠','常','场','厂',
  '烦','繁','番','翻','范',
  '惮','旦','但','担','弹'
]

// 根据错别字获取相似字干扰项
export function getDistractors(wrongChar, correctChar, count) {
  const pool = distractorPool.filter(c => c !== wrongChar && c !== correctChar)
  const result = []
  const used = new Set()
  while (result.length < count && pool.length > 0) {
    const i = Math.floor(Math.random() * pool.length)
    const c = pool[i]
    if (!used.has(c)) {
      used.add(c)
      result.push(c)
    }
    if (used.size >= pool.length) break
  }
  return result
}

export function shuffle(arr) {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
