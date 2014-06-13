const widgets = require("widget");
const tabs = require("tabs");
const data = require("self").data;

var settings = {
  isActive: false,
  timer : 0,
  timerHumanized : '',
  timerShort : '',
  timerSound : 0,
  widgetContent : '',
  widgetTooltip : 'Egg Timer',
  widgetHeight : 16,
  widgetWidth : 16,
  panelHeight: 300,
  panelWidth: 320
};

var countdown = 0;

var getWidgetContent = function (s, t) {
  var html = '', iconUrl = "img/clock.png";

  if (isNaN(s))
    iconUrl = "img/clock_grey.png";
  else if (s <= 15)
    iconUrl = "img/clock_red.png";

  html += ('<div style="height:' + settings.widgetHeight + 'px;cursor:pointer;overflow:hidden;white-space:nowrap">');
  html += ('<img src="' + data.url(iconUrl) + '" style="display:inline-block;vertical-align:middle" />');

  if (s != settings.widgetContent) {
    html += ('<strong style="display:inline-block;font-size:11px;color:#000;text-shadow:0 0 2px #fff;line-height:' + settings.widgetHeight + 'px;margin-left:3px;">');
    html += (t !== undefined ? t.toString() : s);
    html += '</strong>';
  }

  html += '</div>';

  return html;
};

var secondsToSlices = function (left) {
  var h = 0, m = 0, s = 0;

  if (left > 0) {

      h = Math.floor(left / 3600);
      left -= h * 3600;

      m = Math.floor(left / 60);
      left -= m * 60;

      s = left;
  }

  return { h: h, m: m, s: s };
};

function formatDateElement (s) {
  while (s.toString().length !== 2) {
    s = '0' + s;
  }

  return s;
}

var getShortDate = function (t) {
  var s = '';

  if (t.h >= 0) {
    s += formatDateElement(t.h);
    s += ':';
  }
  if (t.m >= 0) {
    s += formatDateElement(t.m);
    s += ':';
  }
  if (t.s >= 0) {
    s += formatDateElement(t.s);
  }

  return s;
};

var getHumanizedDate = function (t) {
  var s = '';

  if (t.h > 0) {
    s += (t.h + ' hour' + (t.h > 1 ? 's' : ''));
    s += ' ';
  }
  if (t.m > 0) {
    s += (t.m + ' minute' + (t.m > 1 ? 's' : ''));
    s += ' ';
  }
  if (t.s > 0) {
    s += (t.s + ' second' + (t.s > 1 ? 's' : ''));
  }

  return s;
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

var widgetWidthAccordingToTime = function (time) {
  w = settings.widgetWidth;

  if (time.length) {
    w += 7 * time.length;
  }
  else {
    for (var k in time) {
      if (time[k] > 0 || w > 0) {
        w += 75;
      }
    }
  }

  return w;
};

var clearTimer = function (t) {
  require("timers").clearTimeout(settings.currentIntervalID);
  notify({
    type: t,
    text: (t == 'cancel'
      ? 'Your timer (' + settings.timerHumanized + ') has been cancelled.'
      : 'Your timer (' + settings.timerHumanized + ') is finished !'
    ),
    message: (settings.notification == 0 || settings.notification == 2 || t == 'cancel') ? 1 : 0,
    sound: (settings.notification == 1 || settings.notification == 2 ) ? 1 : 0
  });
  settings.currentIntervalID = undefined;
  settings.isActive = false;
  myWidget.width = settings.widgetWidth;
  myWidget.content = getWidgetContent(settings.widgetContent);
  myWidget.tooltip = settings.widgetTooltip;
  myPanel.port.emit('update-countdown', '');
  myPanel.hide();
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
  settings.timerHumanized = getHumanizedDate(form.timeHumanized);
  settings.timerShort = getShortDate(form.timeHumanized);
  myWidget.tooltip = form.time;
  myWidget.width = widgetWidthAccordingToTime(settings.timerShort);
  myWidget.content = getWidgetContent(form.time, settings.timerShort);
  countdown = Number(form.time);
  notify({
    type: 'information',
    text: 'Your timer (' + settings.timerHumanized + ') is beginning !',
    message: 1,
    sound: 0
  });
  settings.currentIntervalID = require("timers").setInterval(function() {
    var i = --countdown;

    if (i === 0) {
      clearTimer('success');
    }
    else {
      var time = getShortDate(secondsToSlices(i));
      myWidget.content = getWidgetContent(i, time);
      myWidget.tooltip = time ? time : i;
      myPanel.port.emit('update-countdown', time);
    }
  }, 1000);
});

myPanel.port.on('cancel', function (message) {
  if (settings.isActive === true)
    clearTimer('cancel');
});

var myWidgetContent = getWidgetContent(settings.widgetContent);
var myWidget = widgets.Widget({
  id: "egg-timer-widget",
  label: "Egg Timer",
  content: myWidgetContent,
  tooltip: settings.widgetTooltip,
  width: settings.widgetWidth,
  panel: myPanel
});

