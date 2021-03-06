const ret = (e) => e;
const und = () => undefined;

const IS_DEV = process.env.NODE_ENV === "development";
const LOGGING = IS_DEV;
const globalPoolSet = LOGGING ? new Set() : null;

// Stripped from ECSY, and modified
export default class ObjectPool {
  static isObjectPool = true;

  constructor(opt = {}) {
    const {
      renew = ret,
      create = und,
      release = ret,
      dispose = ret,
      initialCapacity,
      name = undefined,
      maxCapacity = Infinity,
    } = opt;
    this.name = name;
    if (LOGGING) globalPoolSet.add(this);
    this._renew = renew.bind(this);
    this._create = create.bind(this);
    this._release = release.bind(this);
    this._dispose = dispose.bind(this);
    this.pool = [];
    this.capacity = 0;
    this.maxCapacity = maxCapacity;
    if (typeof initialCapacity !== "undefined") {
      this.expand(initialCapacity);
    }
  }

  next() {
    // Grow the list by 20% ish if we're out
    if (this.pool.length <= 0) {
      this.expand(Math.round(this.capacity * 0.2) + 1);
    }
    // reached max capacity and no more left...
    if (this.pool.length === 0) return undefined;
    const item = this.pool.pop();
    this._renew(item);
    return item;
  }

  release(item) {
    this._release(item);
    this.pool.push(item);
  }

  expand(N = 0) {
    N = Math.max(0, Math.min(N, this.maxCapacity - this.capacity));
    for (let n = 0; n < N; n++) {
      const clone = this._create();
      this.pool.push(clone);
    }
    this.capacity += N;
  }

  dispose() {
    for (let i = 0; i < this.pool.length; i++) {
      this._dispose(this.pool[i]);
    }
    this.pool.length = 0;
    this.capacity = 0;
  }

  log () {
    const name = this.name ? `${this.name} - ` : '';
    console.log(`${name}Capacity: %d, Free: %d, Used: %d`, this.totalCapacity(), this.totalFree(), this.totalUsed());
  }

  totalCapacity() {
    return this.capacity;
  }

  totalFree() {
    return this.pool.length;
  }

  totalUsed() {
    return this.capacity - this.pool.length;
  }
}

if (LOGGING) {
  window.logPools = (filter) => {
    globalPoolSet.forEach((pool) => {
      if (filter) {
        if (
          !pool.name ||
          !pool.name.toLowerCase().includes(filter.toLowerCase())
        ) {
          return;
        }
      }
      console.log(`Pool ${pool.name || "(Untitled)"}:`);
      console.log(`  Total Capacity:`, pool.totalCapacity());
      console.log(`  Total Free:`, pool.totalFree());
      console.log(`  Total Used:`, pool.totalUsed());
    });
  };
}
