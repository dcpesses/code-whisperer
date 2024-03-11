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
