import { fromJS } from 'immutable';

import { SIGN_UP_REQUEST, LOG_IN_REQUEST } from './constants';

// The initial state of the App
export const initialState = fromJS({
  loading: false,
  error: false,
  user: null,
});

function ServiceReducer(state = initialState, action) {
  switch (action.type) {
    case SIGN_UP_REQUEST.REQUEST:
      return state.set('loading', true).set('error', false);
    case SIGN_UP_REQUEST.SUCCESS:
      console.log(action);
      return state
        .set('loading', false)
        .set('error', false)
        .set('user', action.user);
    case SIGN_UP_REQUEST.FAILURE:
      return state.set('loading', false).set('error', action.error);
    case LOG_IN_REQUEST.REQUEST:
      return state.set('loading', true).set('error', false);
    case LOG_IN_REQUEST.SUCCESS:
      return state
        .set('loading', false)
        .set('error', false)
        .set('user', action.response.user);
    case LOG_IN_REQUEST.FAILURE:
      return state.set('loading', false).set('error', action.error);
    default:
      return state;
  }
}

export default ServiceReducer;
