'use strict';

module.exports = class MusicZone {
  constructor(musicServer, id) {
    this._id = id;
    this._musicServer = musicServer;

    this._artist = '';
    this._cover = '';
    this._duration = 0;
    this._mode = 'stop';
    this._queueIndex = 0;
    this._time = 0;
    this._title = '';
    this._volume = 50;

    this._playStart = 0;
  }

  audioState() {
    return {
      playerid: this._id,
      album: this.getAlbum(),
      artist: this.getArtist(),
      audiotype: 2,
      coverurl: this.getCover(),
      duration: this.getDuration(),
      mode: this.getMode(),
      power: 'on',
      station: '',
      time: this.getTime(),
      title: this.getTitle(),
      volume: this.getVolume(),
    };
  }

  getAlbum() {
    return this._album;
  }

  setAlbum(album) {
    this._album = ('' + album).trim();
  }

  getArtist() {
    return this._artist;
  }

  setArtist(artist) {
    this._artist = ('' + artist).trim();
  }

  getCover() {
    return this._cover;
  }

  setCover(cover) {
    this._cover = ('' + cover).trim();
  }

  getDuration() {
    return this._duration;
  }

  setDuration(duration) {
    this._duration = +duration;
  }

  getMode() {
    return this._mode;
  }

  setMode(mode) {
    if (/^(?:play|pause|stop)$/.test(mode) && this._mode !== mode) {
      this._time = this.getTime();

      if (mode === 'play') {
        this._playStart = Date.now();
      } else {
        this._playStart = 0;
      }

      this._mode = mode;
      this._send(mode);
    }
  }

  getPosition() {
    return this.getTime();
  }

  setPosition(time) {
    this.setTime(time);

    // Position differs from time in the sense that time will not emit an event
    // to the Miniserver, thus avoiding an infinite loop.
    this._send('time', this.getTime());
  }

  getQueueIndex() {
    return this._queueIndex;
  }

  setQueueIndex(queueIndex) {
    this.setPosition(0);

    this._queueIndex = Math.max(0, queueIndex);
    this._send('queueIndex', this._queueIndex);
  }

  getTitle() {
    return this._title;
  }

  setTitle(title) {
    this._title = ('' + title).trim();
  }

  getTime() {
    const delta = this._mode === 'play' ? Date.now() - this._playStart : 0;

    return Math.min(this._time + delta / 1000, this._duration);
  }

  setTime(time) {
    this._playStart = this._mode === 'play' ? Date.now() : 0;
    this._time = +time;
  }

  getVolume() {
    return this._volume;
  }

  setVolume(volume) {
    this._volume = Math.min(Math.max(+volume, 0), 100);
    this._send('volume', this._volume);
  }

  _send(command, ...args) {
    this._musicServer.pushPlayerState(this._id, command, args);
    this._musicServer.pushAudioEvent(this._id);
  }
};