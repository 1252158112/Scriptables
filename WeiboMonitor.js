// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: yellow; icon-glyph: fire;
/*
 * Author: evilbutcher
 * Github: https://github.com/evilbutcher
 * 本脚本使用了@Gideon_Senku的Env.scriptable，感谢！
 */
const goupdate = true;
const $ = importModule("Env");
const title = `🔥 微博热搜`;
const preview = "medium";
const spacing = 5;

try {
  var { wbnum, wbrancolor } = importModule("Config");
  num = wbnum();
  rancolor = wbrancolor();
  console.log("将使用配置文件内微博配置");
} catch (e) {
  console.log("将使用脚本内微博配置");
}

const res = await getinfo();

let widget = await createWidget(res);
Script.setWidget(widget);
Script.complete();

async function createWidget(res) {
  if (res.data.cards[0].title == "实时热点，每分钟更新一次") {
    var group = res.data.cards[0]["card_group"];
    items = [];
    for (var i = 0; i < num; i++) {
      var item = group[i].desc;
      items.push(item);
    }
    console.log(items);

    const opts = {
      title,
      texts: {
        text1: `📌 ${items[0]}`,
        text2: `• ${items[1]}`,
        text3: `• ${items[2]}`,
        text4: `• ${items[3]}`,
        text5: `• ${items[4]}`,
        text6: `• ${items[5]}`,
        battery: "true",
      },
      preview,
      spacing,
    };

    let widget = await $.createWidget(opts);
    return widget;
  }
}

async function getinfo() {
  const url = {
    url:
      "https://m.weibo.cn/api/container/getIndex?containerid=106003%26filter_type%3Drealtimehot",
  };
  const res = await $.get(url);
  //log(res);
  return res;
}

function addTextToListWidget(text, listWidget) {
  let item = listWidget.addText(text);
  if (rancolor == true) {
    item.textColor = new Color(color16());
  } else {
    item.textColor = Color.white();
  }
  item.font = new Font("SF Mono", 12);
}

function color16() {
  var r = Math.floor(Math.random() * 256);
  if (r + 50 < 255) {
    r = r + 50;
  }
  if (r > 230 && r < 255) {
    r = r - 50;
  }
  var g = Math.floor(Math.random() * 256);
  if (g + 50 < 255) {
    g = g + 50;
  }
  if (g > 230 && g < 255) {
    g = g - 50;
  }
  var b = Math.floor(Math.random() * 256);
  if (b + 50 < 255) {
    b = b + 50;
  }
  if (b > 230 && b < 255) {
    b = b - 50;
  }
  var color = "#" + r.toString(16) + g.toString(16) + b.toString(16);
  return color;
}

//更新代码
function update() {
  log("🔔更新脚本开始!");
  scripts.forEach(async (script) => {
    await $.getFile(script);
  });
  log("🔔更新脚本结束!");
}

const scripts = [
  {
    moduleName: "WeiboMonitor",
    url:
      "https://raw.githubusercontent.com/evilbutcher/Scriptables/master/WeiboMonitor.js",
  },
];
if (goupdate == true) update();
