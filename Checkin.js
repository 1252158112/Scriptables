// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: purple; icon-glyph: plane;
/*
 * Author: evilbutcher Neurogram
 * Github: https://github.com/evilbutcher
 * 本脚本使用了@Gideon_Senku的Env.scriptable，感谢！
 * 自动更新打开后会运行覆盖脚本内已有修改，两种解决方案
 * 一、打开自动更新，配置Config文件，请参考https://github.com/evilbutcher/Scriptables/blob/master/Config.js，下载后导入Scriptable，脚本运行会优先调取Config文件中信息。
 * 二、脚本内配置，关闭自动更新。
 */
const goupdate = false; //默认打开，便于维护
const $ = importModule("Env");
var checkintitle = ""; //填写签到标题
var checkinloginurl = ""; //填写签到登陆链接
var checkinemail = ""; //填写签到邮箱
var checkinpwd = ""; //填写签到密码

const scripts = [
  {
    moduleName: "Checkin",
    url:
      "https://raw.githubusercontent.com/evilbutcher/Scriptables/master/Checkin.js",
  },
];
$.autoLogout = false;

!(async () => {
  init();
  getinfo();
  launch();
  let widget = createWidget($.checkintitle, $.checkinMsg, $.flowMsg);
  Script.setWidget(widget);
  Script.complete();
})()
  .catch((err) => {
    $.msg("Checkin运行出现错误❌\n" + err);
  })
  .finally(update());

function getinfo() {
  try {
    const con = importModule("Config");
    $.checkintitle = con.checkintitle();
    $.checkinloginurl = con.checkinloginurl();
    $.checkinemail = con.checkinemail();
    $.checkinpwd = con.checkinpwd();
    log("将使用配置文件内签到信息");
  } catch (err) {
    $.checkintitle = checkintitle;
    $.checkinloginurl = checkinloginurl;
    $.checkinemail = checkinemail;
    $.checkinpwd = checkinpwd;
    log("将使用脚本内签到信息");
    if (
      $.checkintitle == "" ||
      $.checkinloginurl == "" ||
      $.checkinemail == "" ||
      $.checkinpwd == ""
    ) {
      $.msg("请检查填入的签到信息是否完整");
    }
  }
}

function init() {
  $.nowtime = new Date().getTime();
  log($.nowtime);
  if ($.isFileExists("sbsdata/recordcheckintime.txt") == true) {
    var recordtime = $.read("sbsdata/recordcheckintime.txt");
    log(recordtime);
    if ($.nowtime - recordtime > 86400000) {
      $.cancheckin = true;
      $.write("sbsdata/recordcheckintime.txt", JSON.stringify($.nowtime));
    } else {
      $.cancheckin = false;
    }
  } else {
    $.write("sbsdata/recordcheckintime.txt", JSON.stringify($.nowtime));
    log("初始时间已写入");
    $.cancheckin = true;
  }
}

function launch() {
  let title = $.checkintitle;
  let url = $.checkinloginurl;
  let email = $.checkinemail;
  let password = $.checkinpwd;
  if ($.autoLogout == true) {
    let logoutPath =
      url.indexOf("auth/login") != -1 ? "user/logout" : "user/logout.php";
    var logouturl = {
      url: url.replace(/(auth|user)\/login(.php)*/g, "") + logoutPath,
    };
    log(logouturl);
    $.getStr(logouturl, (response, data) => {
      login(url, email, password, title);
    });
  } else {
    if ($.cancheckin == true) {
      checkin(url, email, password, title);
    } else {
      dataResults(url, "今日已签到", title);
    }
  }
}

function login(url, email, password, title) {
  let loginPath =
    url.indexOf("auth/login") != -1 ? "auth/login" : "user/_login.php";
  let table = {
    url:
      url.replace(/(auth|user)\/login(.php)*/g, "") +
      loginPath +
      `?email=${email}&passwd=${password}&rumber-me=week`,
  };
  log(table);
  $.post(table, (response, data) => {
    if (
      JSON.parse(data).msg.match(
        /邮箱不存在|邮箱或者密码错误|Mail or password is incorrect/
      )
    ) {
      $.msg(title + "邮箱或者密码错误");
    } else {
      if ($.cancheckin == true) {
        checkin(url, email, password, title);
      } else {
        dataResults(url, "今日已签到", title);
      }
    }
  });
}

function checkin(url, email, password, title) {
  let checkinPath =
    url.indexOf("auth/login") != -1 ? "user/checkin" : "user/_checkin.php";
  var checkinreqest = {
    url: url.replace(/(auth|user)\/login(.php)*/g, "") + checkinPath,
  };
  log(checkinreqest);
  $.post(checkinreqest, (response, data) => {
    if (data.match(/\"msg\"\:/)) {
      dataResults(url, JSON.parse(data).msg, title);
    } else {
      login(url, email, password, title);
    }
  });
}

function dataResults(url, checkinMsg, title) {
  let userPath = url.indexOf("auth/login") != -1 ? "user" : "user/index.php";
  var datarequest = {
    url: url.replace(/(auth|user)\/login(.php)*/g, "") + userPath,
  };
  log(datarequest);
  $.getStr(datarequest, (response, data) => {
    let resultData = "";
    let result = [];
    if (data.match(/theme\/malio/)) {
      let flowInfo = data.match(/trafficDountChat\s*\(([^\)]+)/);
      if (flowInfo) {
        let flowData = flowInfo[1].match(/\d[^\']+/g);
        let usedData = flowData[0];
        let todatUsed = flowData[1];
        let restData = flowData[2];
        result.push(`今日：${todatUsed}\n已用：${usedData}\n剩余：${restData}`);
      }
      let userInfo = data.match(/ChatraIntegration\s*=\s*({[^}]+)/);
      if (userInfo) {
        let user_name = userInfo[1].match(/name.+'(.+)'/)[1];
        let user_class = userInfo[1].match(/Class.+'(.+)'/)[1];
        let class_expire = userInfo[1].match(/Class_Expire.+'(.+)'/)[1];
        let money = userInfo[1].match(/Money.+'(.+)'/)[1];
        result.push(
          `用户名：${user_name}\n用户等级：lv${user_class}\n余额：${money}\n到期时间：${class_expire}`
        );
      }
      if (result.length != 0) {
        resultData = result.join("\n\n");
      }
    } else {
      let todayUsed = data.match(/>*\s*今日(已用|使用)*[^B]+/);
      if (todayUsed) {
        todayUsed = flowFormat(todayUsed[0]);
        result.push(`今日：${todayUsed}`);
      }
      let usedData = data.match(
        /(Used Transfer|>过去已用|>已用|>总已用|\"已用)[^B]+/
      );
      if (usedData) {
        usedData = flowFormat(usedData[0]);
        result.push(`已用：${usedData}`);
      }
      let restData = data.match(
        /(Remaining Transfer|>剩余流量|>流量剩余|>可用|\"剩余)[^B]+/
      );
      if (restData) {
        restData = flowFormat(restData[0]);
        result.push(`剩余：${restData}`);
      }
      if (result.length != 0) {
        resultData = result.join("\n");
      }
    }
    let flowMsg = resultData == "" ? "流量信息获取失败" : resultData;
    $.checkinMsg = checkinMsg;
    $.flowMsg = flowMsg;
    log(title + "\n" + checkinMsg + "\n" + flowMsg);
  });
}

function flowFormat(data) {
  data = data.replace(/\d+(\.\d+)*%/, "");
  let flow = data.match(/\d+(\.\d+)*\w*/);
  return flow[0] + "B";
}

function createWidget(checkintitle, checkinMsg, flowMsg) {
  const w = new ListWidget();
  const bgColor = new LinearGradient();
  bgColor.colors = [new Color("#a18cd1"), new Color("#fbc2eb")];
  bgColor.locations = [0.0, 1.0];
  w.backgroundGradient = bgColor;
  w.centerAlignContent();

  const emoji = w.addText(`🛩`);
  emoji.textSize = 30;

  const top1Line = w.addText(checkintitle);
  top1Line.textSize = 12;
  top1Line.textColor = Color.black();

  const top2Line = w.addText(checkinMsg);
  top2Line.textSize = 12;
  top2Line.textColor = Color.black();

  const top3Line = w.addText(flowMsg);
  top3Line.textSize = 12;
  top3Line.textColor = Color.black();

  w.presentMedium();
  return w;
}

//更新代码
function update() {
  if (goupdate == true) {
    log("🔔更新脚本开始!");
    scripts.forEach(async (script) => {
      await $.getFile(script);
    });
    log("🔔更新脚本结束!");
  }
}
