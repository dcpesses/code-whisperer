import {getLoginUrl} from '@/features/login';
import KofiButton from '@/components/kofi-button';
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

            <div className="text-body fs-6 my-4 text-center text-md-start">
              Developed as a way to help streamers thwart Jackbox trolls, this tool gives Twitch streamers the power to decide who can play in games they host by sending invites only to approved users.
            </div>

            <h3>How It Works:</h3>


            <ul className="text-body ps-4 fs-6 my-4">
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
        <div className="browser-screenshot rounded-1 mb-3">
          <div className="row g-1 g-sm-2 browser-bar text-start p-1 fs-6">
            <div className="col-auto">
              <i className="bi bi-arrow-left"></i>
              <i className="bi bi-arrow-clockwise"></i>
            </div>
            <div className="col">
              <div className="browser-address-bar rounded-4 d-flex justify-content-between">
                <div className="url-left">
                  <i className="bi bi-info-circle"></i>
                  <span className="browser-address-url ">
                    http://<span>dcpesses.github.io</span>/code-whisperer
                  </span>
                </div>
                <div className="url-right">
                  <i className="bi bi-star"></i>
                </div>
              </div>
            </div>
            <div className="col-auto">
              <i className="bi bi-three-dots-vertical"></i>
            </div>
          </div>
          <img src={screenshot2} className="screenshot img-fluid shadow border border-secondary rounded-2 mx-auto mb-1" alt="App Screenshot" />
        </div>
      </div>

      <div className="col-md-auto text-center">

        <div className="fs-6 my-3">
          Oh, and did we mention it&apos;s free to use?<a href="#disclaimer"><sup>*</sup></a>
        </div>

        <a href={loginUrl} className="btn btn-sm fs-4 py-2 px-3 rounded-4 my-4 btn-purple bg-gradient focus-ring">
          <span className="d-inline-block">
            Go ahead, log in with <strong>Twitch</strong>
          </span> <span className="d-inline-block">
            and take it for a spin!
          </span>
        </a>

      </div>

      <div className="col-md-8 m-auto text-center">

        <div className="fs-6 my-4">
          View <a href="https://github.com/dcpesses/code-whisperer" className="emphasis" rel="noreferrer" target="_blank">Code Whisperer on GitHub</a> for more information, including documentation, planned features, technical support, and ways to contribute.

        </div>


      </div>

      <div className="col-md-auto text-center">

        <div className="text-body fs-6 my-4">
          <a name="disclaimer"><sup>*</sup></a>Yes seriously, it is free. That said, <span className="d-inline-block">you&apos;re also welcome to <a href="https://ko-fi.com/V7V6VSUT1" className="emphasis" rel="noreferrer" target="_blank">leave a tip!</a></span>

          <div className="py-2">
            <a href="https://ko-fi.com/V7V6VSUT1" className="emphasis" rel="noreferrer" target="_blank">
              <KofiButton />
            </a>
          </div>

        </div>
      </div>

    </div>
  );
}
export default AppPromo;
