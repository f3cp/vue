import { clean, getMessage, getPresence, getStatus, release } from './modules';
import Broadcast from './broadcast';
import Autoload from './autoload';
import config from '../config.json';

/**
 * Wrap a PubNub's attributes
 *
 * @param {string} attributeName
 */
function wrapAttribute(originalInstance, wrappedInstance, attributeName) {
  wrappedInstance[attributeName] = originalInstance[attributeName];
}

/**
 * Wrap a PubNub's methods
 *
 * @param methodName
 */
function wrapMethod(OriginalInstance, wrappedInstance, methodName) {
  wrappedInstance[methodName] = function () {
    return OriginalInstance[methodName].apply(wrappedInstance, arguments);
  };
}

/**
 * Wrap the PubNubVue with PubNub
 *
 * @param originalInstance
 * @param wrappedInstance
 */

export default class {
  constructor(originalInstance) {
    this._originInstance = originalInstance;
    this._broadcast = new Broadcast();
    this._autoload = new Autoload(originalInstance);
    this._listener = {};
    this._data = { messages: {}, presence: {}, status: {} };
    this._keepMessages = {};

    config.attributes_to_delegate.forEach((attribute) => {
      wrapAttribute(originalInstance, this, attribute);
    });

    config.methods_to_delegate.forEach((method) => {
      wrapMethod(originalInstance, this, method);
    });

    this.clean = clean.bind(this);
    this.getMessage = getMessage.bind(this);
    this.getPresence = getPresence.bind(this);
    this.getStatus = getStatus.bind(this);
    this.release = release.bind(this);

    this.addListener(this._listener);
  }

  subscribe(args) {
    this.getOriginalInstance().subscribe(args);
    this._autoload.enableLoad(args);
  }

  unsubscribe(args) {
    this.getOriginalInstance().unsubscribe(args);
    this._autoload.disableLoad(args);
  }

  getOriginalInstance() {
    if (this._originInstance) {
      return this._originInstance;
    } else {
      throw new ReferenceError('Pubnub default instance is not initialized yet');
    }
  }
}
