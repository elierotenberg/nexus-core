import Nexus from './Nexus';
import logger from './logger';
import Cache from './Cache';

export {
  Nexus,
  logger,
  Cache,
};
export default (...args) => new Nexus(...args);
