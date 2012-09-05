const widgets = require("widget");
const tabs = require("tabs");
const data = require("self").data;

var settings = {
  isActive: false,
  timer : 0,
  timerSound : 0,
  widgetContent : '...',
  widgetTooltip : 'Egg Timer',
  widgetWidth : 60,
  panelHeight: 230,
  panelWidth: 215
};

var getWidgetContent = function (s) {
  var html = '', iconUrl = "img/clock.png";

  if (isNaN(s))
    iconUrl = "img/clock_grey.png";
  else if (s <= 5)
    iconUrl = "img/clock_red.png";

  html += '<div style="height:16px;">';
  html += '<img src="';
  html += data.url(iconUrl);
  html += '" style="display:inline-block;" />';

  if (s != settings.widgetContent) {
    html += '<strong style="display:inline-block;font-size:11px;color:#000;text-shadow:0 0 3px #fff;line-height:16px;margin-left:3px;">';
    // html += getHumanizedDate(s);
    html += s;
    html += '</strong>';
  }

  html += '</div>';

  return html;
};

var getHumanizedDate = function (s) {
  var moment = require("moment.min.js");

  return moment.duration(Number(s), "seconds").humanize(true);
};

var notify = function (n) {
  if (n.message)
    require("notifications").notify({
      title: "Egg Timer",
      text: n.text,
      iconURL: data.url("img/clock.png")
    });
  if (n.sound) {
    var type = (n.type == 'cancel' ? 'bell' : 'complete');
    myPanel.port.emit('play-sound', data.url('sounds/' + type + '.oga'));
  }
};

var clearTimer = function (t) {
  require("timers").clearTimeout(settings.currentIntervalID);
  notify({
    type: t,
    text: (t == 'cancel'
      ? 'Your timer (' + getHumanizedDate(settings.timer) + ') has been cancelled.'
      : 'Your timer (' + getHumanizedDate(settings.timer) + ') is finished !'
    ),
    message: (settings.notification == 0 || settings.notification == 2 || t == 'cancel') ? 1 : 0,
    sound: (settings.notification == 1 || settings.notification == 2 ) ? 1 : 0
  });
  settings.currentIntervalID = undefined;
  settings.isActive = false;
  myWidget.width = settings.widgetWidth;
  myWidget.content = getWidgetContent(settings.widgetContent);
  myWidget.tooltip = settings.widgetTooltip;
};

var myPanel = require("panel").Panel({
  width: settings.panelWidth,
  height: settings.panelHeight,
  contentURL: data.url("html/panel.html"),
  contentScriptFile: data.url("js/panel.js"),
  contentScriptWhen: 'ready'
});

myPanel.port.on('form-timer', function (form) {
  myWidget.iconURL = data.url("img/clock.png");
  myPanel.hide();
  settings.isActive = true;
  settings.notification = form.notification;
  settings.timer = form.time;
  myWidget.tooltip = form.time;
  myWidget.content = getWidgetContent(form.time);
  notify({
    type: 'information',
    text: 'Your timer (' + getHumanizedDate(settings.timer) + ') is beginning !',
    message: 1,
    sound: 0
  });
  settings.currentIntervalID = require("timers").setInterval(function() {
    var
      c = myWidget.tooltip,
      t = Number(c),
      i = --t
    ;

    if (i == 0)
      clearTimer('success');
    else {
      myWidget.content = getWidgetContent(i);
      myWidget.tooltip = i;
    }
  }, 1000);
});

var myWidgetContent = getWidgetContent(settings.widgetContent);
var myWidget = widgets.Widget({
  id: "egg-timer-widget",
  label: "Egg Timer",
  content: myWidgetContent,
  tooltip: settings.widgetTooltip,
  width: settings.widgetWidth,
  onClick : function () {
    if (settings.isActive == true)
      clearTimer('cancel');
  },
  panel: myPanel
});

