
export const ActivityStatus = {
  ACTIVE: 1,
  IDLE: 2,
  DISCONNECTED: 3
};

const MAX_IDLE_TIME_MINUTES = 10;

export default class ChatActivity {
  constructor(channel) {
    this.channel = channel;
    this.lastMessageTimes = {};
    this.getStatusPromise = this.getStatusPromise.bind(this);
  }

  updateLastMessageTime = (user) => {
    this.lastMessageTimes = {
      ...this.lastMessageTimes,
      [user]: Date.now()
    };
  };

  minsSinceLastChatMessage = (user) => {
    return Math.floor((Date.now() - this.lastMessageTimes[user]) / 60000);
  };

  // returns a PROMISE, don't just assign the value again like a dweeb. :/
  //
  // not just active chatters - anyone with an active connnection to twitch chat.
  // (thank the lord almighty for free open proxy sites. CORB is annoying.)
  // note that results are fairly heavily cached, and the API may break
  // eventually (is undocumented), but this is what twitch themselves
  // uses to display the list of people connected to chat - best we got.
  getChatters = () => {
    return fetch(`https://thingproxy.freeboard.io/fetch/https://tmi.twitch.tv/group/user/${this.channel}/chatters`)
      .then(r => r.json())
      .then(res => {
        if (!res || !res.chatters) {return null;}
        return [
          ...res.chatters.moderators,
          ...res.chatters.viewers,
          ...res.chatters.staff,
          ...res.chatters.admins,
          ...res.chatters.global_mods
        ];
      }).catch(() => {
        // don't normally like swallowing errors like this,
        // but it's a noncritical feature built off an
        // undocumented api, sooo....
        return null;
      });
  };

  async getStatusPromise(user) {
    // broadcaster always counts as active
    if (user === this.channel) {
      return ActivityStatus.ACTIVE;
    }

    // sent a chat message in the last X mins?
    if (this.lastMessageTimes[user] && this.minsSinceLastChatMessage(user) < MAX_IDLE_TIME_MINUTES) {
      return ActivityStatus.ACTIVE;
    }

    return this.getChatters().then((chatters) =>
      !chatters || !chatters.includes(user)
        ? ActivityStatus.DISCONNECTED
        : ActivityStatus.IDLE
    );
  }
}
