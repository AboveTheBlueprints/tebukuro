// 手袋（第二个，第 16 天）。照 ../手袋.py 一行一行搬，test/对.py 逐串对。
var SB_NIGHTS = [
  ['手套', '帽子店', '门口挂着一顶黑礼帽的招牌'],
  ['药', '药店', '门口挂着一个白瓷药罐'],
  ['鱼', '鱼店', '门口挂着一条木头鱼'],
  ['妈妈的手套', '帽子店', '门口挂着一顶黑礼帽的招牌']
];
var SB_LOOKS = {'帽子店': '钱', '药店': '手', '鱼店': '手'};
var SB_SAY = ['伸人的手', '先给钱', '人很可怕', '什么也不说'];
var SB_ASK = ['问他那人看了哪儿', '问他钱怎么给的', '不问了'];

function sbNew() {
  return {night: 0, phase: '说', handFree: false, scared: false, everChased: false, trust: 0, saidScary: false,
    out: [], rows: [], tonight: {}, momSick: false};
}

function sbP(s, t) { s.out.push(t === undefined ? '' : t); }

function sbMenu(s) {
  if (s.phase === '说') {
    var shop = SB_NIGHTS[s.night][1];
    var m = SB_SAY.slice(0, 3).concat(['到了' + shop + '伸人的手']);
    if (s.night === 3) m.push('帽子店的叔叔上回没追你');
    return m.concat(['什么也不说']);
  }
  if (s.phase === '问') return SB_ASK.slice();
  return [];
}

function sbStartNight(s) {
  var n = s.night, what = SB_NIGHTS[n][0], shop = SB_NIGHTS[n][1], sign = SB_NIGHTS[n][2];
  sbP(s, '—— 第 ' + (n + 1) + ' 个晚上 ——');
  if (n === 0) {
    sbP(s, '下了一夜的雪。早上你的孩子头一回见雪，跑回洞里喊"眼睛里扎了东西"，其实是雪光晃的。玩了一天，两只小手冻得通红。');
    sbP(s, '你想给他买一副毛线手套。可你看见镇上的灯，腿就迈不动了：有一回你跟朋友去过镇上，朋友去偷人家的鸭子，你们被追得差点没命。');
    sbP(s, '你把他的一只手握了一会儿，变成了人的孩子的手，往那只手里放了两个白铜钱。');
    sbP(s, '今晚他一个人去' + shop + '（' + sign + '）买' + what + '。他出门前，你跟他说一句。');
  } else if (n === 1) {
    sbP(s, '你从昨夜起一直咳嗽，咳得睡不着。');
    sbP(s, '今晚他去' + shop + '（' + sign + '）给你买' + what + '。你又把他的一只手变成人的手，放了两个钱。出门前，你跟他说一句。');
  } else if (n === 2) {
    if (s.momSick) sbP(s, '你咳得更厉害了。');
    sbP(s, '洞里没吃的了。');
    sbP(s, '今晚他去' + shop + '（' + sign + '）买' + what + '。你把他的一只手变成人的手，放了两个钱。出门前，你跟他说一句。');
  } else {
    sbP(s, '他看着你的前爪说："妈妈的手也冷吧。"');
    if (s.scared) sbP(s, '他说想去' + shop + '给你买手套，可说着说着往洞里缩了缩。');
    else sbP(s, '他说他要去' + shop + '给你买手套，自己就把手伸过来让你变。');
    sbP(s, '你把他的一只手变成人的手，放了两个钱。出门前，你跟他说一句。');
  }
}

function sbReply(s, say, shop) {
  if (say === '什么也不说') { sbP(s, '你什么也没说。他蹦蹦跳跳地走了。'); return null; }
  if (say === '到了' + shop + '伸人的手') {
    sbP(s, '你说：到了' + shop + '，伸人的手。');
    sbP(s, '他点点头："嗯，到了' + shop + '，伸人的手。"走了。');
    return true;
  }
  if (say === '帽子店的叔叔上回没追你') {
    sbP(s, '你说：帽子店的叔叔，上回没追你。');
    sbP(s, (s.rows.length && s.rows[0]['手'] === '狐狸的手') ? '他想了想："嗯……他还\'哦哟\'了一声呢。"走了。' : '他想了想："嗯。"走了。');
    return true;
  }
  sbP(s, '你说：' + say + '。');
  if (say === '伸人的手') {
    if (s.handFree && s.trust === 0) { sbP(s, '他歪着头："可是帽子店的叔叔看见我的手，也没怎么样呀。"走了。'); return false; }
    sbP(s, '他点点头："嗯！"走了。');
    return true;
  }
  if (say === '先给钱') { sbP(s, '他点点头："嗯，先给钱。"走了。'); return true; }
  if (say === '人很可怕') {
    s.saidScary = true;
    if (!s.scared && s.trust === 0 && s.night > 0 && s.handFree) { sbP(s, '他笑了："才不可怕呢，帽子店的叔叔可好了。"走了。'); return false; }
    if (s.scared) sbP(s, '他小声说："嗯……"往你肚子底下钻了钻，才走。');
    else sbP(s, '他眨眨眼睛："嗯。"走了。');
    return true;
  }
}

function sbGo(s, say) {
  var n = s.night, what = SB_NIGHTS[n][0], shop = SB_NIGHTS[n][1];
  var tn = {'说': say, '回': '', '手': '', '看': SB_LOOKS[shop], '带回': '没带回东西'};
  s.tonight = tn;
  if (n === 3 && s.scared && say !== '到了' + shop + '伸人的手' && say !== '帽子店的叔叔上回没追你') {
    sbP(s, '你说完，他走到洞口，又回来了。"我不敢去……"他往你肚子底下一钻，不出来了。');
    tn['回'] = '不敢去'; tn['手'] = '没去';
    s.rows.push(tn);
    s.phase = '问';
    tn['没去'] = true;
    sbP(s, '');
    sbP(s, '这一夜你们挨着睡了。');
    return;
  }
  var ok = sbReply(s, say, shop);
  tn['回'] = ok === null || ok === undefined ? '一声没吭就走了' : (ok ? '答应了' : '回了一句嘴');
  var wantHuman = (ok === true && (say === '伸人的手' || say === '到了' + shop + '伸人的手')) || (ok === true && say === '人很可怕');
  var hand, dazzle;
  if (n === 0) { hand = '狐狸'; dazzle = true; }
  else {
    dazzle = false;
    if (wantHuman) hand = '人';
    else if (s.handFree) hand = '狐狸';
    else hand = '人';
  }
  var paidFirst = ok === true && say === '先给钱';
  tn['手'] = hand === '狐狸' ? '狐狸的手' : '人的手';
  sbP(s, '');
  sbP(s, '你在林子边上等。雪地上很亮，很冷。');
  sbP(s, '他回来了。');
  var ev = {};
  if (shop === '帽子店') {
    ev.sold = true;
    ev.look = hand === '狐狸' ? '他看见我的手，"哦哟"了一声' : '他看了一眼我的手';
    ev.money = paidFirst ? '我先把钱给他了，他把两个钱放在指头尖上碰了一下，叮叮响，他就笑了' : '他说"先给钱"，我把钱给他，他把两个钱放在指头尖上碰了一下，叮叮响，他就笑了';
  } else if (shop === '药店') {
    if (hand === '狐狸') {
      ev.sold = false;
      ev.look = '他往门缝外头看我的手，看了一下，啪地就把门关上了';
      ev.money = '钱没给出去，还在我手里';
    } else {
      ev.sold = true;
      ev.look = '他往门缝外头看我的手，看了好一会儿，才把药递出来';
      ev.money = paidFirst ? '我先把钱给他了，他没看，就收下了' : '他把药递出来，我把钱给他，他没看，就收下了';
    }
  } else {
    if (hand === '狐狸') {
      ev.sold = false; ev.chased = true;
      ev.look = '他一看我的手，就喊"狐狸！"，抓起扫帚就追出来了';
      ev.money = '我跑的时候，钱掉在雪里了';
    } else {
      ev.sold = true;
      ev.look = '他看了一眼我的手，又看了看我身后的路';
      ev.money = paidFirst ? '我先把钱给他了，他咧嘴一笑，多给了我一条小的' : '他说"先拿钱来"，我把钱给他，他数了数，给了我一条鱼';
    }
  }
  tn.ev = ev;
  if (dazzle) sbP(s, '"门开了一道缝，光一下照出来，好晃眼，我就把手伸进去了。伸的是这只。"他举起自己毛茸茸的那只前爪。');
  if (ev.chased) {
    sbP(s, '他浑身是雪，喘得说不出话，空着手。过了好一会儿他才说："鱼店的叔叔追我。"');
    sbP(s, '"人好可怕……"');
    s.scared = true;
    s.everChased = true;
    if (s.saidScary) { sbP(s, '"妈妈说得对。"'); s.trust += 1; }
    tn['带回'] = '没带回东西，钱也丢了';
  } else if (ev.sold) {
    if (n === 3) { sbP(s, '他两只前爪捧着一副大一点的毛线手套，往你的前爪上套。'); tn['带回'] = '妈妈的手套'; }
    else { sbP(s, '他把' + what + '举给你看。'); tn['带回'] = what; }
    if (hand === '狐狸') { sbP(s, '"人一点也不可怕！他看见我的手，也没怎么样。"'); s.handFree = true; s.scared = false; }
    else if (wantHuman) { sbP(s, '"我照妈妈说的做了，就买到了！"'); s.trust += 1; }
    else sbP(s, '"买到啦。"');
  } else {
    sbP(s, '他空着手回来，钱还攥着。"' + shop + '的叔叔真小气，门一下就关上了。"');
    tn['带回'] = '没带回东西';
    if (n === 1) s.momSick = true;
  }
  if (n === 3 && !ev.chased) sbP(s, '他又说："回来的时候，有一扇窗户里有人在唱歌，是人的妈妈在哄孩子睡觉。人的孩子问：这么冷的晚上，林子里的小狐狸会不会冷得哭？我就跑回来了。"');
  sbP(s, '他困得直揉眼睛。你只来得及问他一句。');
  s.rows.push(tn);
  s.phase = '问';
}

function sbAnswer(s, a) {
  var tn = s.tonight;
  if (tn['没去']) {
    if (a === '不问了') sbP(s, '你没再问。'); else sbP(s, '他在你肚子底下已经睡着了。');
    return;
  }
  var ev = tn.ev;
  if (a === '问他那人看了哪儿') sbP(s, '你问那人看了他哪儿。他想了想："' + ev.look + '。"');
  else if (a === '问他钱怎么给的') sbP(s, '你问钱是怎么给的。他说："' + ev.money + '。"');
  else sbP(s, '你没再问。');
}

function sbEndNight(s) {
  s.night += 1;
  sbP(s, '');
  if (s.night < 4) { sbStartNight(s); s.phase = '说'; }
  else { s.phase = '完'; sbEnding(s); }
}

function sbEnding(s) {
  sbP(s, '—— 后来 ——');
  if (s.everChased) sbP(s, '你把他搂紧了，什么也没说。');
  else sbP(s, '你听他说完，把他搂紧了，小声说："人真的是好的吗。人真的是好的吗。"');
  sbP(s, '');
  sbP(s, '—— 这四个晚上 ——');
  s.rows.forEach(function (tn, i) {
    var shop = SB_NIGHTS[i][1];
    var line = '第 ' + (i + 1) + ' 晚，' + shop + '：' + (tn['说'] === '什么也不说' ? '你什么也没说' : '你说"' + tn['说'] + '"') + '，他' + tn['回'] + '；';
    if (tn['没去']) line += '他没去。';
    else line += '他伸的是' + tn['手'] + '；' + shop + '的人看的是' + (SB_LOOKS[shop] === '钱' ? '钱' : '手') + '；带回来：' + tn['带回'] + '。';
    sbP(s, line);
  });
  sbP(s, '（完）');
}

function sbAct(s, a) {
  if (sbMenu(s).indexOf(a) < 0) { sbP(s, '（这会儿不能“' + a + '”。）'); return; }
  if (s.phase === '说') { sbGo(s, a); if (s.phase === '问') sbP(s, ''); }
  else if (s.phase === '问') { sbAnswer(s, a); sbEndNight(s); }
}

function sbRun(acts) {
  var s = sbNew();
  sbStartNight(s);
  for (var i = 0; i < acts.length; i++) {
    if (s.phase === '完') { sbP(s, '（一局已经完了。）'); break; }
    sbP(s, '> ' + acts[i]);
    sbAct(s, acts[i]);
  }
  if (s.phase !== '完') { sbP(s, ''); sbP(s, '能做的：' + sbMenu(s).join(' / ')); }
  return {out: s.out, done: s.phase === '完', ask: sbMenu(s), s: s};
}

if (typeof module !== 'undefined') module.exports = {sbRun: sbRun};
