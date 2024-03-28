import {
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

export function withRouter(Component) {
  function ComponentWithRouterProp(props) {
    let location = useLocation();
    let navigate = useNavigate();
    let params = useParams();
    return (
      <Component
        {...props}
        router={{ location, navigate, params }}
      />
    );
  }

  return ComponentWithRouterProp;
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
export const Debounce = function(func, wait, immediate) {
  var timeout;
  return function() {
    // const context = this;
    const args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) {func.apply(this, args);}
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {func.apply(this, args);}
  };
};



/**
 * Convert a date to a relative time string, such as
 * "a minute ago", "in 2 hours", "yesterday", "3 months ago", etc.
 * using Intl.RelativeTimeFormat
 * https://www.builder.io/blog/relative-time
 */
export function getRelativeTimeString(date, lang = navigator.language) {
  // Allow dates or times to be passed
  const timeMs = typeof date === 'number' ? date : date.getTime();

  // Get the amount of seconds between the given date and now
  const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);

  // Array reprsenting one minute, hour, day, week, month, etc in seconds
  const cutoffs = [
    60,
    3600,
    86400,
    86400 * 7,
    86400 * 30,
    86400 * 365,
    Infinity
  ];

  // Array equivalent to the above but in the string representation of the units
  const units = ['second', 'minute', 'hour', 'day', 'week', 'month', 'year'];

  // Grab the ideal cutoff unit
  const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));

  // Get the divisor to divide from the seconds. E.g. if our unit is "day" our divisor
  // is one day in seconds, so we can divide our seconds by this to get the # of days
  const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;

  // Intl.RelativeTimeFormat do its magic
  const rtf = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });
  return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}

/*
// For later TypeScript conversion
type chatResponseFunctionType = (scope: unknown, username: string, message: string) => boolean;

interface ChatCommand {
  commands: string[];
  displayName: string;
  description: string;
  mod: boolean;
  response: chatResponseFunctionType;
}

interface ModalCommandListProps {
  chatCommands: ChatCommand[];
}
*/
export const resolveDuplicateCommands = (chatCommands/*: ChatCommand[]*/)/*: ChatCommand[]*/ => {
  return Object.values(chatCommands).reduce((accumulator/*: ChatCommand[]*/, item/*: ChatCommand*/) => {
    if (!accumulator.includes(item)) {
      accumulator.push(item);
    }
    return accumulator;
  }, []);
};
