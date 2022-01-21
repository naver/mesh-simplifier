/*
 * Copyright (c) 2020 NAVER Corp.
 * egjs projects are licensed under the MIT license
 */

class Timer {
  private _diff: number = 0;
  private _startTime: number | [number, number] | null = null;

  /**
   * Time diff in miliseconds
   */
  public get diff() { return this._diff; }

  public start(): void {
    if (typeof process !== "undefined" && process.hrtime) {
      // Use high resolution timer in Node
      this._startTime = process.hrtime();
    } else {
      this._startTime = Date.now();
    }
  }

  public end(): void {
    // Not started
    if (this._startTime == null) return;

    if (typeof process !== "undefined" && process.hrtime) {
      // Use high resolution timer in Node
      const diff = process.hrtime(this._startTime as [number, number]);
      const diffInMiliSeconds = 1000 * (diff[0] + diff[1] * 1e-9); // diff[1] is in nanoseconds

      this._diff = diffInMiliSeconds;
    } else {
      this._diff = Date.now() - (this._startTime as number);
    }

    this._startTime = null;
  }
}

export default Timer;
