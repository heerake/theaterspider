import shoac, { getDetails as shoacDetail } from './spider/shoac';
import sgt from './spider/sgt';
import sso, { getDetails as ssoDetail } from './spider/sso';

async function start() {
  await Promise.all([shoac(), sgt(), sso()])
  await Promise.all([shoacDetail(), ssoDetail()]);
}

export default start;