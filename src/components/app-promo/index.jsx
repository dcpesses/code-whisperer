
import {getLoginUrl} from '@/pages/login';
import twitchChat from '@/assets/twitch-chat.png';
import screenshot2 from '@/assets/screenshot2.png';

import './app-promo.css';

function AppPromo() {
  const loginUrl = getLoginUrl();
  return (
    <div className="container-fluid app-promo">

      <div className="row align-items-start justify-content-center mb-4">
        <div className="col-sm-10 max-w-md-340">

          <div className="pb-1">


            <h1 className="fw-bold text-center text-md-start">
              <span className="d-inline-block">Play With Friends,</span> <span className="d-inline-block">Not Your Foes!</span>
            </h1>

            <div className="fs-5 my-4 text-center text-md-start">
              Developed as a way to help streamers thwart Jackbox trolls, this tool gives Twitch streamers the power to decide who can play in games they host by sending invites only to approved users.
            </div>

            <h3>How It Works:</h3>


            <ul className="ps-4 fs-6 my-4">
              <li className="mb-1">
                Followers in chat who type <b>!join</b> get added to the <i>Interested</i> lobby.
              </li>
              <li className="mb-1">
                The streamer then adds any or all of them to the <i>Playing</i> section. You can even randomize who gets added too!
              </li>
              <li className="mb-1">
                Once you enter the room code, press <i>Send to Queue</i> to whisper everyone selected to play.
              </li>
            </ul>




          </div>
        </div>

        <div className="max-w-340 text-center">

          <div className="twitch-chat-screenshot text-right">
            <img src={twitchChat} className="twitch-chat img-fluid shadow border border-secondary rounded-4 mx-auto mb-3" alt="Twitch Chat" />
          </div>

        </div>

      </div>

      <div className="col-md-auto text-center">
        <img src={screenshot2} className="screenshot img-fluid shadow border border-secondary roounded-4 mx-auto mb-3" alt="App Screenshot" />
      </div>

      <div className="col-md-auto text-center">

        <div className="fs-6 my-3">
          (Oh, and did we mention it&apos;s free to use?*)
        </div>

        <a href={loginUrl} className="btn btn-sm fs-4 py-2 px-3 rounded-4 my-4 btn-purple bg-gradient">
          <span className="d-inline-block">
            Go ahead, log in with <strong>Twitch</strong>
          </span> <span className="d-inline-block">
            and take it for a spin!
          </span>
        </a>

      </div>

      <div className="col-md-8 m-auto text-center">

        <div className="fs-5 my-4">
          View <a href="https://github.com/dcpesses/code-whisperer" className="emphasis" rel="noreferrer" target="_blank">Code Whisperer on GitHub</a> for more information, including documentation, planned features, technical support, and ways to contribute.

        </div>


      </div>

      <div className="col-md-auto text-center">

        <div className="fs-6 my-4">
          *Yes seriously, it is free. That said, <span className="d-inline-block">you&apos;re also welcome to <a href="https://ko-fi.com/V7V6VSUT1" className="emphasis" rel="noreferrer" target="_blank">leave a tip!</a></span>

          <div className="py-2">
            <a href="https://ko-fi.com/V7V6VSUT1" className="emphasis" rel="noreferrer" target="_blank"><img src="https://camo.githubusercontent.com/70e2ef5e0263b261f9a2a314bb1d6919d1d43292eed117fe8fc766a68c7d96ea/68747470733a2f2f6b6f2d66692e636f6d2f696d672f676974687562627574746f6e5f736d2e737667" className="img-fluid" /></a>
          </div>

        </div>
      </div>

    </div>
  );
}
export default AppPromo;
