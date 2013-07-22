var et = {
  init: function () {
    this.listenRemote();
    this.listenLocal();
  },

  listenRemote : function () {
    self.port.on('play-sound', function (url) {
      var audio;
      if (!document.getElementById('audio')) {
        audio = document.createElement('audio');
        audio.id = 'audio';
        document.body.appendChild(audio);
      }
      else {
        audio = document.getElementById('audio');
      }
      audio.src = url;
      audio.play();
    });

    self.port.on('update-countdown', function (time) {
      var cd = document.getElementById('countdown');
      while (cd.firstChild) {
        cd.removeChild(cd.firstChild);
      }
      cd.appendChild(document.createTextNode(time));

      if (time.length < 1) {
        var ca = document.getElementById('cancel');
        while (ca.firstChild) {
          ca.removeChild(ca.firstChild);
        }
        ca.appendChild(document.createTextNode('Cancel'));
        document.getElementById('submit').disabled = false;
        document.getElementById('cancel').disabled = true;
      }
    });
  },

  listenLocal : function () {
    document.getElementById('timer-hour').addEventListener('input', this.inputRangeListener, false);
    document.getElementById('timer-minute').addEventListener('input', this.inputRangeListener, false);
    document.getElementById('timer-second').addEventListener('input', this.inputRangeListener, false);
    document.getElementById('egg-timer-form').addEventListener('submit', this.timerFormListener, false);
    document.getElementById('cancel').addEventListener('click', this.cancelTimerListener, false);
  },

  inputRangeListener : function (event) {
    var va = document.getElementById(event.target.id + '-value');
    while (va.firstChild) {
      va.removeChild(va.firstChild);
    }
    va.appendChild(document.createTextNode(event.target.value));

    if (event.target.value > 1) {
      document.getElementById(event.target.id + '-label-plural').classList.remove('hidden');
    }
    else {
      document.getElementById(event.target.id + '-label-plural').classList.add('hidden');
    }
  },

  cancelTimerListener : function (event) {
    event.preventDefault();

    self.port.emit('cancel');

    var ca = document.getElementById('cancel');
    while (ca.firstChild) {
      ca.removeChild(ca.firstChild);
    }
    ca.appendChild(document.createTextNode('Cancel'));
    document.getElementById('submit').disabled = false;
    document.getElementById('cancel').disabled = true;
  },

  timerFormListener : function (event) {
    var
      t = 0,
      h = document.getElementById('timer-hour').value,
      m = document.getElementById('timer-minute').value,
      s = document.getElementById('timer-second').value,
      nEls = document.getElementsByName('timer-notification'),
      n
    ;

    t += Number(h) * 3600;
    t += Number(m) * 60;
    t += Number(s);

    if (!isNaN(t) && t !== 0) {
      for (var i = 0; i < nEls.length; i++) {
        if (nEls[i].checked)
          n = nEls[i].value;
      }

      self.port.emit('form-timer', {
        'time' : t,
        'timeHumanized' : { h: h, m: m, s: s },
        'notification' : (n === undefined ? 1 : n)
      });

      var ca = document.getElementById('cancel');
      while (ca.firstChild) {
        ca.removeChild(ca.firstChild);
      }
      ca.appendChild(document.createTextNode('Stop'));
      document.getElementById('cancel').disabled = false;
      document.getElementById('submit').disabled = true;
    }

    event.preventDefault();
  }
};

et.init();
