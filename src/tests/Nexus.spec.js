const { describe, it } = global;
import t from 'tcomb';

import { Nexus } from '../';

describe('Nexus', async () => {
  it('#constructor', () => {
    const n = new Nexus();
    t.assert(n instanceof Nexus);
  });
});
