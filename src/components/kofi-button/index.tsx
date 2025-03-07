import {JSX} from 'react';
import Button from 'react-bootstrap/Button';
import KofiSymbolSvg from '@/assets/kofi_symbol.svg';

import './kofi-button.css';

interface KofiButtonProps {
  opensInNewWindow?: boolean;
}

function KofiButton({opensInNewWindow = true}: KofiButtonProps): JSX.Element {
  return (
    <Button size="sm" className="kofi-button">
      <img
        src={KofiSymbolSvg}
        alt="Ko-fi logo"
        className="img-fluid"
        style={{height: '1em'}}
      />
      <span className="px-2 align-middle">Support me on Ko-fi </span>
      {
        (opensInNewWindow) && (<>
          <i className="bi bi-box-arrow-up-right small" aria-hidden="true" />
          <span className="visually-hidden"> (link opens a new window)</span>
        </>)
      }
    </Button>
  );
}

export default KofiButton;
