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
  },

  listenLocal : function () {
    document.getElementById('egg-timer-form').addEventListener('submit', this.timerFormListener, false);
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
        'notification' : (n === undefined ? 1 : n)
      });
    }

    event.preventDefault();
  }
};

et.init();