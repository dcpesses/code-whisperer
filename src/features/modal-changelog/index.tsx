import {JSX, useState} from 'react';
import ModalReusable from '@/components/modal';
import Badge from 'react-bootstrap/Badge';
import Button from 'react-bootstrap/Button';
import Collapse from 'react-bootstrap/Collapse';
import ReactMarkdown, {ExtraProps} from 'react-markdown';

import type {ComponentPropsWithoutRef, ElementType} from 'react';

import ChangelogMarkdown from '../../../CHANGELOG.md?raw';
import './modal-changelog.css';

interface ModalChangelogProps {
  handleClose: () => void;
  show: boolean;
}

type PropsHelper<Element extends ElementType> = ComponentPropsWithoutRef<
  Element
> &
  ExtraProps;

export const splitMarkdown = (markdown: string) => {
  const md = markdown.substring(markdown.indexOf('##')+2);
  const markdownArray = md.split('##');
  const currentMarkdown = `##${markdownArray.shift()}`;
  const pastMarkdown = `##${markdownArray.join('##')}`;
  return [currentMarkdown, pastMarkdown];
};

export const mdComponentOptions = {
  ul(props:ExtraProps) {
    const {...rest} = props;
    delete rest.node;
    return <ul className="ms-5" {...rest} />;
  },
  strong(props:PropsHelper<'strong'>) {
    const {children, ...rest} = props;
    delete rest.node;
    if (children === 'NEW!') {
      return <Badge pill bg="warning" className="badge-new">
        {children}
      </Badge>;
    }
    return <strong>
      {children}
    </strong>;
  },
  h2(props:PropsHelper<'h2'>) {
    const {children, ...rest} = props;
    delete rest.node;
    const [version, date] = String(children).split(' - ');
    return <div>
      <strong {...rest}>
        Version {version}
      </strong> <small className="text-secondary-emphasis">
        ({date})
      </small>
    </div>;
  }
};

function ModalChangelog(props: ModalChangelogProps): JSX.Element {
  const {handleClose, show} = props;

  const [showPastUpdates, setShowPastUpdates] = useState<boolean>(false);

  const [currentMarkdown, pastMarkdown] = splitMarkdown(ChangelogMarkdown);

  return (
    <ModalReusable id="modal-changelog" show={show} title="What's New" handleClose={handleClose}>
      <>
        {/* <div className="alert alert-warning d-flex align-items-center" role="alert">
          <i className="bi-exclamation-triangle-fill fs-1"></i>
          <div className="ms-3">
            <b>HEADS UP!</b> If you&apos;re reading this notice for the first time, you may need to log out and log back in to approve additional permissions in order for some new and upcoming features to work correctly.
          </div>
        </div> */}
        <ReactMarkdown components={mdComponentOptions}>
          {currentMarkdown}
        </ReactMarkdown>
        <hr />
        <Collapse in={showPastUpdates}>
          <div id="past-updates-collapse" data-testid="past-updates">
            <div className="pb-3">
              <h5 className="fw-light pb-2">Past Updates</h5>
              <ReactMarkdown components={mdComponentOptions}>
                {pastMarkdown}
              </ReactMarkdown>
            </div>
          </div>
        </Collapse>
        <Button
          variant="link"
          className="text-center mx-auto p-0 text-decoration-none text-white"
          aria-controls="past-updates-collapse"
          aria-expanded={showPastUpdates}
          onClick={() => setShowPastUpdates(!showPastUpdates)}
        >
          Toggle Past Updates
        </Button>
      </>
    </ModalReusable>
  );
}

export default ModalChangelog;
